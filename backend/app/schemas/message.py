"""
消息 Schema
"""
from datetime import datetime
from typing import Literal, Optional
from uuid import UUID
from pydantic import BaseModel
from app.schemas import ApiResponse


class MessageCreate(BaseModel):
    """创建消息请求体"""
    receiver_type: Literal["guest", "user"] = "guest"
    receiver_id: str
    msg_type: Literal["system", "chat"] = "system"
    title: str | None = None
    content: str


class MessageResponse(BaseModel):
    """消息响应"""
    id: UUID
    sender_type: str
    sender_id: str | None
    receiver_type: str
    receiver_id: str
    conversation_id: str | None
    msg_type: str
    title: str | None
    content: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


class MessageListData(BaseModel):
    """消息列表数据"""
    items: list[MessageResponse]
    total: int
    unread: int


class MessageListResponse(ApiResponse[MessageListData]):
    """消息列表响应"""
    pass


class UnreadCountData(BaseModel):
    """未读消息数"""
    count: int


class UnreadCountResponse(ApiResponse[UnreadCountData]):
    """未读消息数响应"""
    pass


class ReadSuccessData(BaseModel):
    """已读操作结果"""
    success: bool
    count: int | None = None


class ReadSuccessResponse(ApiResponse[ReadSuccessData]):
    """已读操作响应"""
    pass


class ConversationItem(BaseModel):
    """会话摘要"""
    conversation_id: str | None
    last_message: MessageResponse
    unread_count: int


class ConversationListData(BaseModel):
    """会话列表数据"""
    items: list[ConversationItem]
    total: int


class ConversationListResponse(ApiResponse[ConversationListData]):
    """会话列表响应"""
    pass
