import uuid
from sqlalchemy import Uuid,  String, Text, Integer, Boolean, Numeric, ARRAY
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base, TimestampMixin


class MobileService(Base, TimestampMixin):
    """
    移动端服务模型：与 Admin Service 模型结构完全一致。
    """
    __tablename__ = "jx_apk_m_services"

    id: Mapped[str] = mapped_column(String(100), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(200), unique=True, nullable=False)
    service_code: Mapped[str | None] = mapped_column(String(50), unique=True, nullable=True, index=True)
    parent_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    icon: Mapped[str | None] = mapped_column(String(100), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[int] = mapped_column(Integer, default=1)
    created_by: Mapped[uuid.UUID | None] = mapped_column(Uuid, nullable=True)
    price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False, default=0)
    original_price: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    has_member_price: Mapped[bool] = mapped_column(Boolean, default=False)
    member_price: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    cover_image: Mapped[str | None] = mapped_column(String(500), nullable=True)
    images: Mapped[list | None] = mapped_column(ARRAY(Text), nullable=True)
    origin: Mapped[str | None] = mapped_column(Text, nullable=True)
    content_items: Mapped[list | None] = mapped_column(ARRAY(Text), nullable=True)
    additional_rule: Mapped[str | None] = mapped_column(String(255), nullable=True)
    pricing_type: Mapped[str] = mapped_column(String(20), default="fixed")
    price_range_min: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    price_range_max: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    area_unit: Mapped[str | None] = mapped_column(String(50), nullable=True)
    consultation_mode: Mapped[str | None] = mapped_column(String(50), nullable=True)
    duration: Mapped[str | None] = mapped_column(String(50), nullable=True)
    is_hot: Mapped[bool] = mapped_column(Boolean, default=False)
    is_recommend: Mapped[bool] = mapped_column(Boolean, default=False)
    view_count: Mapped[int] = mapped_column(Integer, default=0)