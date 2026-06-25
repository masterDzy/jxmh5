import uuid
from datetime import datetime
from sqlalchemy import String, Text, Integer, Boolean, ForeignKey, DateTime, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin


class KnowledgeCategory(Base, TimestampMixin):
    """
    知识分类表
    """
    __tablename__ = "jx_apk_knowledge_categories"

    id: Mapped[str] = mapped_column(String(100), primary_key=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    slug: Mapped[str] = mapped_column(String(200), unique=True, nullable=False)
    icon: Mapped[str | None] = mapped_column(String(100), nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[int] = mapped_column(Integer, default=1)
    created_by: Mapped[uuid.UUID | None] = mapped_column(Uuid, nullable=True)

    # 关系
    articles: Mapped[list["KnowledgeArticle"]] = relationship(
        "KnowledgeArticle",
        back_populates="category",
        cascade="all, delete-orphan"
    )


class KnowledgeArticle(Base, TimestampMixin):
    """
    知识文章表
    包含图文和视频类型文章
    """
    __tablename__ = "jx_apk_knowledge_articles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    article_uuid: Mapped[uuid.UUID] = mapped_column('uuid', Uuid, unique=True, default=uuid.uuid4)

    # 基础信息
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    summary: Mapped[str] = mapped_column(Text, nullable=True)
    content: Mapped[str] = mapped_column(Text, nullable=True)  # 富文本内容

    # 分类
    category_id: Mapped[str | None] = mapped_column(
        String(100),
        ForeignKey("jx_apk_knowledge_categories.id", ondelete="SET NULL"),
        nullable=True
    )

    # 封面和媒体
    cover_image: Mapped[str | None] = mapped_column(String(500), nullable=True)
    is_video: Mapped[bool] = mapped_column(Boolean, default=False)
    video_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    video_duration: Mapped[int | None] = mapped_column(Integer, nullable=True)  # 视频时长(秒)

    # 统计
    view_count: Mapped[int] = mapped_column(Integer, default=0)
    share_count: Mapped[int] = mapped_column(Integer, default=0)
    favorite_count: Mapped[int] = mapped_column(Integer, default=0)

    # 状态
    status: Mapped[int] = mapped_column(Integer, default=1)  # 0:下架 1:上架
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False)  # 是否精选
    sort_order: Mapped[int] = mapped_column(Integer, default=0)

    # 发布信息
    published_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_by: Mapped[uuid.UUID | None] = mapped_column(Uuid, nullable=True)

    # 关系
    category: Mapped["KnowledgeCategory | None"] = relationship(
        "KnowledgeCategory",
        back_populates="articles"
    )