"""
预约单模型
"""
from sqlalchemy import Uuid, String, Text, Integer, ForeignKey, Date
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin
import uuid


class Appointment(Base, TimestampMixin):
    """
    预约单（用户 → 某项服务 → 某天某时段）
    """
    __tablename__ = "jx_apk_appointments"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid, primary_key=True, default=uuid.uuid4
    )

    # 关联服务（逻辑外键 — service 可能在 admin 库，不加 FK 约束）
    service_id: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    service_name: Mapped[str] = mapped_column(String(200), nullable=False)
    service_category: Mapped[str | None] = mapped_column(String(100), nullable=True)

    # 预约人
    user_id: Mapped[str | None] = mapped_column(String(100), nullable=True, index=True)
    name: Mapped[str] = mapped_column(String(50), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True, index=True)

    # 时间（日期 + 时段）
    appointment_date: Mapped[str] = mapped_column(String(10), nullable=False, index=True)  # YYYY-MM-DD
    appointment_time: Mapped[str] = mapped_column(String(5), nullable=False)              # HH:MM

    # 状态：pending(待确认) / confirmed(已确认) / done(已完成) / cancelled(已取消)
    status: Mapped[str] = mapped_column(String(20), default="pending", nullable=False, index=True)

    # 备注
    note: Mapped[str | None] = mapped_column(Text, nullable=True)

    # 2026-06-14: booking 流程升级 — 策划师 + 交付双维
    # planner_id 可空，保留"跳过选人"业务扩展性
    # delivery_space 合法值: 'online' | 'onsite' | 'home'   (枚举见 app.constants.delivery.DeliverySpace)
    # delivery_form 合法值:  'document' | 'conversation'     (枚举见 app.constants.delivery.DeliveryForm)
    planner_id: Mapped[int | None] = mapped_column(Integer, nullable=True, index=True)
    delivery_space: Mapped[str | None] = mapped_column(String(20), nullable=True)
    delivery_form: Mapped[str | None] = mapped_column(String(20), nullable=True)
