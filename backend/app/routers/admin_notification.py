"""
管理后台通知 API 路由
MVP 版本：无需认证
"""
import uuid
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func, desc, update
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from app.models.admin_notification import AdminNotification
from app.schemas.admin_notification import (
    AdminNotificationResponse,
    AdminNotificationListResponse,
    AdminNotificationListData,
    UnreadCountResponse,
    UnreadCountData,
)

router = APIRouter(prefix="/api/v1/admin/notifications", tags=["admin-notifications"])


@router.get("", response_model=AdminNotificationListResponse)
async def list_notifications(
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(20, ge=1, le=100, description="每页数量"),
    db: AsyncSession = Depends(get_db),
):
    """分页获取通知列表，含未读数量"""
    # 未读总数
    unread_stmt = select(func.count(AdminNotification.id)).where(
        AdminNotification.is_read == False  # noqa: E712
    )
    unread_result = await db.execute(unread_stmt)
    unread = unread_result.scalar() or 0

    # 总数 + 分页
    total_stmt = select(func.count(AdminNotification.id))
    total_result = await db.execute(total_stmt)
    total = total_result.scalar() or 0

    offset = (page - 1) * page_size
    items_stmt = (
        select(AdminNotification)
        .order_by(desc(AdminNotification.created_at))
        .offset(offset)
        .limit(page_size)
    )
    items_result = await db.execute(items_stmt)
    rows = items_result.scalars().all()

    items = [AdminNotificationResponse.model_validate(r) for r in rows]

    return AdminNotificationListResponse(
        error=False,
        message="success",
        data=AdminNotificationListData(
            items=items,
            total=total,
            page=page,
            page_size=page_size,
            unread=unread,
        ),
    )


@router.get("/unread-count", response_model=UnreadCountResponse)
async def unread_count(
    db: AsyncSession = Depends(get_db),
):
    """获取未读通知数量"""
    stmt = select(func.count(AdminNotification.id)).where(
        AdminNotification.is_read == False  # noqa: E712
    )
    result = await db.execute(stmt)
    count = result.scalar() or 0

    return UnreadCountResponse(
        error=False,
        message="success",
        data=UnreadCountData(count=count),
    )


@router.put("/{notification_id}/read", response_model=dict)
async def mark_read(
    notification_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """标记单条通知为已读"""
    result = await db.execute(
        select(AdminNotification).where(AdminNotification.id == notification_id)
    )
    notif = result.scalar_one_or_none()
    if not notif:
        return {"error": True, "message": "通知不存在", "data": None}

    notif.is_read = True
    await db.commit()

    return {
        "error": False,
        "message": "已标记为已读",
        "data": AdminNotificationResponse.model_validate(notif).model_dump(mode="json"),
    }


@router.put("/read-all", response_model=dict)
async def mark_all_read(
    db: AsyncSession = Depends(get_db),
):
    """全部标记为已读"""
    stmt = (
        update(AdminNotification)
        .where(AdminNotification.is_read == False)  # noqa: E712
        .values(is_read=True)
    )
    await db.execute(stmt)
    await db.commit()

    return {"error": False, "message": "全部已标记为已读", "data": None}
