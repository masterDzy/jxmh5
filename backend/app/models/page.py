import uuid
from sqlalchemy import Uuid,  String, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base, TimestampMixin, UUIDMixin


class Page(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "pages"

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    route: Mapped[str] = mapped_column(String(255), nullable=False)
    layout: Mapped[str] = mapped_column(String(50), default="grid")
    status: Mapped[str] = mapped_column(String(20), default="draft")
    meta_title: Mapped[str | None] = mapped_column(String(255), nullable=True)
    meta_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_by: Mapped[uuid.UUID | None] = mapped_column(
        Uuid, nullable=True
    )
