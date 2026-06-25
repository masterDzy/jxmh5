"""
消息 API 路由（MVP：无鉴权，通过查询参数标识接收方）
"""
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, update, case, text
from sqlalchemy.orm import aliased

from database import get_db
from app.models.message import Message
from app.schemas.message import (
    MessageCreate,
    MessageResponse,
    MessageListResponse,
    MessageListData,
    UnreadCountResponse,
    UnreadCountData,
    ReadSuccessResponse,
    ReadSuccessData,
    ConversationListResponse,
    ConversationListData,
    ConversationItem,
)

router = APIRouter(prefix="/api/v1/messages", tags=["messages"])


# ── 辅助函数 ──────────────────────────────────────────


def _msg_to_response(msg: Message) -> MessageResponse:
    return MessageResponse.model_validate(msg)


# ── 消息列表（分页） ──────────────────────────────────


@router.get("", response_model=MessageListResponse)
async def list_messages(
    receiver_type: str = Query(..., description="接收方类型: guest / user"),
    receiver_id: str = Query(..., description="接收方 UUID"),
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(20, ge=1, le=100, description="每页数量"),
    db: AsyncSession = Depends(get_db),
):
    """获取消息列表，按时间倒序，返回未读数"""
    offset = (page - 1) * page_size

    # 总数 + 未读数
    count_stmt = select(
        func.count(Message.id).label("total"),
        func.count(case((Message.is_read == False, 1))).label("unread"),
    ).where(
        Message.receiver_type == receiver_type,
        Message.receiver_id == receiver_id,
    )
    count_result = await db.execute(count_stmt)
    counts = count_result.one()
    total = counts.total or 0
    unread = counts.unread or 0

    # 分页查询
    stmt = (
        select(Message)
        .where(
            Message.receiver_type == receiver_type,
            Message.receiver_id == receiver_id,
        )
        .order_by(desc(Message.created_at))
        .offset(offset)
        .limit(page_size)
    )
    result = await db.execute(stmt)
    rows = result.scalars().all()

    return MessageListResponse(
        error=False,
        message="success",
        data=MessageListData(
            items=[_msg_to_response(r) for r in rows],
            total=total,
            unread=unread,
        ),
    )


# ── 未读消息计数 ──────────────────────────────────────


@router.get("/unread-count", response_model=UnreadCountResponse)
async def unread_count(
    receiver_type: str = Query(..., description="接收方类型: guest / user"),
    receiver_id: str = Query(..., description="接收方 UUID"),
    db: AsyncSession = Depends(get_db),
):
    """获取未读消息数量"""
    stmt = select(func.count(Message.id)).where(
        Message.receiver_type == receiver_type,
        Message.receiver_id == receiver_id,
        Message.is_read == False,
    )
    result = await db.execute(stmt)
    count = result.scalar() or 0

    return UnreadCountResponse(
        error=False,
        message="success",
        data=UnreadCountData(count=count),
    )


# ── 标记单条消息已读 ─────────────────────────────────


@router.put("/{msg_id}/read", response_model=ReadSuccessResponse)
async def mark_read(
    msg_id: str,
    db: AsyncSession = Depends(get_db),
):
    """标记单条消息为已读"""
    stmt = (
        update(Message)
        .where(Message.id == msg_id)
        .values(is_read=True)
    )
    result = await db.execute(stmt)
    await db.commit()

    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="消息不存在")

    return ReadSuccessResponse(
        error=False,
        message="success",
        data=ReadSuccessData(success=True),
    )


# ── 全部标记已读 ─────────────────────────────────────


@router.put("/read-all", response_model=ReadSuccessResponse)
async def mark_all_read(
    receiver_type: str = Query(..., description="接收方类型: guest / user"),
    receiver_id: str = Query(..., description="接收方 UUID"),
    db: AsyncSession = Depends(get_db),
):
    """标记该接收方的所有消息为已读"""
    stmt = (
        update(Message)
        .where(
            Message.receiver_type == receiver_type,
            Message.receiver_id == receiver_id,
            Message.is_read == False,
        )
        .values(is_read=True)
    )
    result = await db.execute(stmt)
    await db.commit()

    return ReadSuccessResponse(
        error=False,
        message="success",
        data=ReadSuccessData(success=True, count=result.rowcount),
    )


# ── 创建消息（系统/管理员后台使用） ───────────────────


@router.post("", response_model=MessageListResponse)
async def create_message(
    payload: MessageCreate,
    db: AsyncSession = Depends(get_db),
):
    """创建一条新消息（MVP：无需鉴权，由系统/管理员直接调用）"""
    msg = Message(
        sender_type="system",
        sender_id=None,
        receiver_type=payload.receiver_type,
        receiver_id=payload.receiver_id,
        msg_type=payload.msg_type,
        title=payload.title,
        content=payload.content,
    )
    db.add(msg)
    await db.commit()
    await db.refresh(msg)

    return MessageListResponse(
        error=False,
        message="消息已发送",
        data=MessageListData(
            items=[_msg_to_response(msg)],
            total=1,
            unread=1,
        ),
    )


# ── 会话列表（按 conversation_id 分组） ───────────────


@router.get("/conversations", response_model=ConversationListResponse)
async def list_conversations(
    receiver_type: str = Query(..., description="接收方类型: guest / user"),
    receiver_id: str = Query(..., description="接收方 UUID"),
    db: AsyncSession = Depends(get_db),
):
    """
    获取该接收方的所有会话摘要。
    每个会话返回最后一条消息 + 未读计数。
    按最后消息时间倒序排列。
    """
    # 策略：查询所有消息，在 Python 中分组（避免子查询复杂度过高）
    stmt = (
        select(Message)
        .where(
            Message.receiver_type == receiver_type,
            Message.receiver_id == receiver_id,
        )
        .order_by(desc(Message.created_at))
    )
    result = await db.execute(stmt)
    rows = result.scalars().all()

    # 按 conversation_id 分组
    conv_map: dict[str, list[Message]] = {}
    for msg in rows:
        cid = msg.conversation_id or "__none__"
        if cid not in conv_map:
            conv_map[cid] = []
        conv_map[cid].append(msg)

    items: list[ConversationItem] = []
    for cid, msgs in conv_map.items():
        last_msg = msgs[0]  # 已按时间倒序，第一条即最新
        unread = sum(1 for m in msgs if not m.is_read)
        items.append(ConversationItem(
            conversation_id=None if cid == "__none__" else cid,
            last_message=_msg_to_response(last_msg),
            unread_count=unread,
        ))

    # 按最后消息时间倒序
    items.sort(key=lambda x: x.last_message.created_at, reverse=True)

    return ConversationListResponse(
        error=False,
        message="success",
        data=ConversationListData(items=items, total=len(items)),
    )
