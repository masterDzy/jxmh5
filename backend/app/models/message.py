"""
消息模型 — 系统通知 + 聊天消息
"""
from sqlalchemy import String, Text, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base, TimestampMixin, UUIDMixin


class Message(Base, UUIDMixin, TimestampMixin):
    """
    消息表
    - system 消息：预约确认、状态变更等自动通知
    - chat 消息：用户/管理员聊天（MVP 阶段可延后）
    - conversation_id 用于分组消息线程
    """
    __tablename__ = "jx_apk_messages"

    # 发送方
    sender_type: Mapped[str] = mapped_column(
        String(20), nullable=False, index=True,
        comment="guest / user / admin / system"
    )
    sender_id: Mapped[str | None] = mapped_column(
        String(100), nullable=True, index=True,
        comment="发送方 UUID（system 消息可为空）"
    )

    # 接收方
    receiver_type: Mapped[str] = mapped_column(
        String(20), nullable=False, index=True,
        comment="guest / user"
    )
    receiver_id: Mapped[str] = mapped_column(
        String(100), nullable=False, index=True,
        comment="接收方 UUID"
    )

    # 会话分组（同一对话的消息共享 conversation_id）
    conversation_id: Mapped[str | None] = mapped_column(
        String(100), nullable=True, index=True,
        comment="会话ID，用于分组聊天线程"
    )

    # 消息类型
    msg_type: Mapped[str] = mapped_column(
        String(20), nullable=False, default="system", index=True,
        comment="system / chat"
    )

    # 内容
    title: Mapped[str | None] = mapped_column(
        String(200), nullable=True, comment="消息标题"
    )
    content: Mapped[str] = mapped_column(
        Text, nullable=False, comment="消息正文"
    )

    # 已读状态
    is_read: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False, index=True
    )
