"""
商城分类模型
"""
from sqlalchemy import String, Text, Integer, Boolean, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin


class ShopCategory(Base, TimestampMixin):
    """
    幸运商城分类
    """
    __tablename__ = "jx_apk_shop_categories"

    id: Mapped[str] = mapped_column(String(100), primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    cover_image: Mapped[str | None] = mapped_column(String(500), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # 关系
    products: Mapped[list["ShopProduct"]] = relationship(
        "ShopProduct", back_populates="category", lazy="selectin"
    )