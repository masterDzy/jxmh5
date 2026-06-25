from sqlalchemy import Integer, String, Text, Numeric, SmallInteger
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base, TimestampMixin


class Planner(Base, TimestampMixin):
    """
    策划师模型

    jx_apk_planner — 移动端公开数据
    与 jx_apk_newproduct 一致:Integer id, snake_case 字段
    """
    __tablename__ = "jx_apk_planner"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    specialty: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    single_price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False, default=0)
    full_price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False, default=0)
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    status: Mapped[int] = mapped_column(SmallInteger, default=1, nullable=False)
