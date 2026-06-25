"""
商城商品模型
"""
from sqlalchemy import String, Text, Integer, Boolean, Numeric, ForeignKey
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin


class ShopProduct(Base, TimestampMixin):
    """
    幸运商城商品
    """
    __tablename__ = "jx_apk_shop_products"

    id: Mapped[str] = mapped_column(String(100), primary_key=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    category_id: Mapped[str] = mapped_column(
        String(100), ForeignKey("jx_apk_shop_categories.id"), nullable=False
    )
    cover_image: Mapped[str | None] = mapped_column(String(500), nullable=True)
    images: Mapped[list | None] = mapped_column(ARRAY(Text), nullable=True)
    price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False, default=0)
    original_price: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    stock: Mapped[int] = mapped_column(Integer, default=0)
    sold_count: Mapped[int] = mapped_column(Integer, default=0)
    is_virtual: Mapped[bool] = mapped_column(Boolean, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_hot: Mapped[bool] = mapped_column(Boolean, default=False)
    is_recommend: Mapped[bool] = mapped_column(Boolean, default=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    content: Mapped[str | None] = mapped_column(Text, nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)

    # 关系
    category: Mapped["ShopCategory"] = relationship(
        "ShopCategory", back_populates="products", lazy="selectin"
    )
    cart_items: Mapped[list["ShopCartItem"]] = relationship(
        "ShopCartItem", back_populates="product", lazy="selectin"
    )
    order_items: Mapped[list["ShopOrderItem"]] = relationship(
        "ShopOrderItem", back_populates="product", lazy="selectin"
    )