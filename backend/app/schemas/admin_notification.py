"""
管理后台通知 Schema
"""
from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, field_serializer
from app.schemas import ApiResponse


class AdminNotificationResponse(BaseModel):
    """单条通知响应"""
    id: UUID
    event_type: str
    ref_id: Optional[str] = None
    title: str
    content: str
    is_read: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

    @field_serializer("id")
    def _ser_id(self, v: UUID) -> str:
        return str(v)


class AdminNotificationListData(BaseModel):
    """通知列表数据"""
    items: list[AdminNotificationResponse]
    total: int
    page: int
    page_size: int
    unread: int


class AdminNotificationListResponse(ApiResponse[AdminNotificationListData]):
    """通知列表响应"""
    pass


class UnreadCountData(BaseModel):
    """未读数量"""
    count: int


class UnreadCountResponse(ApiResponse[UnreadCountData]):
    """未读数量响应"""
    pass
