import uuid
from sqlalchemy import Uuid, Integer, JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base, TimestampMixin


class PageVersion(Base, TimestampMixin):
    """
    页面版本表 - 存储页面的历史版本
    """
    __tablename__ = "page_versions"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid, primary_key=True, default=uuid.uuid4
    )
    page_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("pages.id"), nullable=False
    )
    version: Mapped[int] = mapped_column(Integer, nullable=False)
    content: Mapped[dict] = mapped_column(JSON, nullable=False)
