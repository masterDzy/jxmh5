import uuid
from datetime import datetime
from sqlalchemy import Uuid,  String, Text, Integer, Boolean, ARRAY, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin


class StyleShowcaseCategory(Base, TimestampMixin):
    """
    风采分类表
    """
    __tablename__ = "jx_apk_showcase_categories"

    id: Mapped[str] = mapped_column(String(100), primary_key=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    slug: Mapped[str] = mapped_column(String(200), unique=True, nullable=False)
    icon: Mapped[str | None] = mapped_column(String(100), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[int] = mapped_column(Integer, default=1)
    created_by: Mapped[uuid.UUID | None] = mapped_column(Uuid, nullable=True)

    # 关系
    showcases: Mapped[list["StyleShowcase"]] = relationship(
        "StyleShowcase",
        back_populates="category",
        cascade="all, delete-orphan"
    )


class StyleShowcase(Base, TimestampMixin):
    """
    风采展示表
    包含图文和视频类型展示
    """
    __tablename__ = "jx_apk_style_showcases"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    showcase_uuid: Mapped[uuid.UUID] = mapped_column('uuid', Uuid, unique=True, default=uuid.uuid4)

    # 基础信息
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    content: Mapped[str] = mapped_column(Text, nullable=True)  # 富文本内容

    # 分类
    category_id: Mapped[str | None] = mapped_column(
        String(100),
        ForeignKey("jx_apk_showcase_categories.id", ondelete="SET NULL"),
        nullable=True
    )

    # 类型：image图文, video视频, audio音频
    showcase_type: Mapped[str] = mapped_column(String(20), default="image")

    # 封面和媒体
    cover_image: Mapped[str | None] = mapped_column(String(500), nullable=True)
    video_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    video_duration: Mapped[int | None] = mapped_column(Integer, nullable=True)
    audio_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # 图文内容：多个图片及说明
    # 格式: [{"image": "url", "caption": "说明"}, ...]
    gallery: Mapped[list | None] = mapped_column(ARRAY(Text), nullable=True)

    # 统计
    view_count: Mapped[int] = mapped_column(Integer, default=0)
    like_count: Mapped[int] = mapped_column(Integer, default=0)
    share_count: Mapped[int] = mapped_column(Integer, default=0)
    comment_count: Mapped[int] = mapped_column(Integer, default=0)

    # 作者信息
    author_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    author_avatar: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # 来源
    source: Mapped[str | None] = mapped_column(String(200), nullable=True)  # 如：客户案例/团队风采/活动回顾
    source_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # 状态
    status: Mapped[int] = mapped_column(Integer, default=1)  # 0:下架 1:上架
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)

    # 发布时间
    published_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_by: Mapped[uuid.UUID | None] = mapped_column(Uuid, nullable=True)

    # 关系
    category: Mapped["StyleShowcaseCategory | None"] = relationship(
        "StyleShowcaseCategory",
        back_populates="showcases"
    )