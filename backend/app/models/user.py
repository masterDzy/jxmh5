from datetime import datetime
from sqlalchemy import Boolean, ForeignKey, String, Integer, DateTime, Uuid
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base, TimestampMixin, UUIDMixin


class User(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "jx_apk_users"

    phone: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    nickname: Mapped[str | None] = mapped_column(String(50), nullable=True)
    avatar: Mapped[str | None] = mapped_column(String(200), nullable=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    guest_id: Mapped[str | None] = mapped_column(Uuid, ForeignKey("jx_apk_guests.id"), nullable=True)
    is_vip: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    vip_type: Mapped[str] = mapped_column(String(20), nullable=True)
    vip_expire_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
