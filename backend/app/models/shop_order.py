"""
商城订单模型
"""
from sqlalchemy import Uuid,  String, Text, Integer, Numeric, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin
import uuid


class ShopOrder(Base, TimestampMixin):
    """
    商城订单
    """
    __tablename__ = "jx_apk_shop_orders"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid, primary_key=True, default=uuid.uuid4
    )
    order_no: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    user_id: Mapped[str] = mapped_column(String(100), nullable=False, index=True)

    # 订单状态: pending(待支付), paid(已支付), shipped(已发货), completed(已完成), cancelled(已取消)
    status: Mapped[str] = mapped_column(String(20), default="pending", nullable=False)

    # 金额
    total_amount: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    discount_amount: Mapped[float] = mapped_column(Numeric(10, 2), default=0)

    # 收货信息
    address_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid,
        ForeignKey("jx_apk_shop_addresses.id", ondelete="SET NULL"),
        nullable=True
    )
    shipping_name: Mapped[str | None] = mapped_column(String(50), nullable=True)
    shipping_phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    shipping_province: Mapped[str | None] = mapped_column(String(50), nullable=True)
    shipping_city: Mapped[str | None] = mapped_column(String(50), nullable=True)
    shipping_district: Mapped[str | None] = mapped_column(String(50), nullable=True)
    shipping_address: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # 备注
    remark: Mapped[str | None] = mapped_column(Text, nullable=True)

    # 支付信息
    paid_at: Mapped[str | None] = mapped_column(String(50), nullable=True)

    # 关系
    address: Mapped["ShopAddress"] = relationship(
        "ShopAddress", back_populates="orders", lazy="selectin"
    )
    items: Mapped[list["ShopOrderItem"]] = relationship(
        "ShopOrderItem", back_populates="order", lazy="selectin", cascade="all, delete-orphan"
    )


class ShopOrderItem(Base, TimestampMixin):
    """
    商城订单项
    """
    __tablename__ = "jx_apk_shop_order_items"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid, primary_key=True, default=uuid.uuid4
    )
    order_id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        ForeignKey("jx_apk_shop_orders.id", ondelete="CASCADE"),
        nullable=False
    )
    product_id: Mapped[str] = mapped_column(
        String(100),
        ForeignKey("jx_apk_shop_products.id", ondelete="RESTRICT"),
        nullable=False
    )
    product_name: Mapped[str] = mapped_column(String(200), nullable=False)
    cover_image: Mapped[str | None] = mapped_column(String(500), nullable=True)
    price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    subtotal: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)

    # 关系
    order: Mapped["ShopOrder"] = relationship(
        "ShopOrder", back_populates="items", lazy="selectin"
    )
    product: Mapped["ShopProduct"] = relationship(
        "ShopProduct", back_populates="order_items", lazy="selectin"
    )