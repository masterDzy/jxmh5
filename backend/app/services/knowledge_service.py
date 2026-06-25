"""
知识文章服务
"""
from typing import Optional
from datetime import datetime
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.knowledge import KnowledgeCategory, KnowledgeArticle


class KnowledgeService:
    """知识文章服务"""

    @staticmethod
    async def get_categories(db: AsyncSession) -> list[KnowledgeCategory]:
        """获取所有启用的分类"""
        result = await db.execute(
            select(KnowledgeCategory)
            .where(KnowledgeCategory.status == 1)
            .order_by(KnowledgeCategory.sort_order)
        )
        return result.scalars().all()

    @staticmethod
    async def get_articles(
        db: AsyncSession,
        category_id: Optional[str] = None,
        status: int = 1,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[list[KnowledgeArticle], int]:
        """获取文章列表"""
        # 构建查询条件
        conditions = [KnowledgeArticle.status == status]
        if category_id:
            conditions.append(KnowledgeArticle.category_id == category_id)

        # 统计总数
        count_result = await db.execute(
            select(func.count(KnowledgeArticle.id))
            .where(and_(*conditions))
        )
        total = count_result.scalar() or 0

        # 分页查询
        offset = (page - 1) * page_size
        result = await db.execute(
            select(KnowledgeArticle)
            .options(selectinload(KnowledgeArticle.category))
            .where(and_(*conditions))
            .order_by(KnowledgeArticle.sort_order.desc(), KnowledgeArticle.published_at.desc())
            .offset(offset)
            .limit(page_size)
        )
        articles = result.scalars().all()

        return articles, total

    @staticmethod
    async def get_article_by_uuid(
        db: AsyncSession,
        uuid: str
    ) -> Optional[KnowledgeArticle]:
        """根据 UUID 获取文章"""
        result = await db.execute(
            select(KnowledgeArticle)
            .options(selectinload(KnowledgeArticle.category))
            .where(
                and_(
                    KnowledgeArticle.article_uuid == uuid,
                    KnowledgeArticle.status == 1
                )
            )
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def get_featured_articles(
        db: AsyncSession,
        limit: int = 6
    ) -> list[KnowledgeArticle]:
        """获取精选文章"""
        result = await db.execute(
            select(KnowledgeArticle)
            .options(selectinload(KnowledgeArticle.category))
            .where(
                and_(
                    KnowledgeArticle.status == 1,
                    KnowledgeArticle.is_featured == True
                )
            )
            .order_by(KnowledgeArticle.sort_order.desc())
            .limit(limit)
        )
        return result.scalars().all()

    @staticmethod
    async def increment_view_count(db: AsyncSession, article_id: int) -> None:
        """增加文章浏览量"""
        result = await db.execute(
            select(KnowledgeArticle).where(KnowledgeArticle.id == article_id)
        )
        article = result.scalar_one_or_none()
        if article:
            article.view_count += 1
            await db.commit()