"""
管理后台通知模型
用于在预约、新用户注册、系统事件时自动创建通知
"""
from sqlalchemy import String, Text, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base, UUIDMixin, TimestampMixin


class AdminNotification(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "jx_apk_admin_notifications"

    event_type: Mapped[str] = mapped_column(
        String(50), nullable=False, index=True, comment="事件类型: booking/new_user/system"
    )
    ref_id: Mapped[str | None] = mapped_column(
        String(100), nullable=True, comment="关联ID（预约UUID/用户UUID等）"
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
