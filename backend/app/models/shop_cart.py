"""
商城购物车模型
"""
from sqlalchemy import Uuid,  String, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin
import uuid


class ShopCartItem(Base, TimestampMixin):
    """
    商城购物车项
    """
    __tablename__ = "jx_apk_shop_cart_items"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid, primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    product_id: Mapped[str] = mapped_column(
        String(100),
        ForeignKey("jx_apk_shop_products.id", ondelete="CASCADE"),
        nullable=False
    )
    quantity: Mapped[int] = mapped_column(Integer, default=1, nullable=False)

    # 关系
    product: Mapped["ShopProduct"] = relationship(
        "ShopProduct", back_populates="cart_items", lazy="selectin"
    )