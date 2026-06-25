"""
风采展示服务
"""
from typing import Optional
from datetime import datetime
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.style_showcase import StyleShowcaseCategory, StyleShowcase


class StyleShowcaseService:
    """风采展示服务"""

    @staticmethod
    async def get_categories(db: AsyncSession) -> list[StyleShowcaseCategory]:
        """获取所有启用的分类"""
        result = await db.execute(
            select(StyleShowcaseCategory)
            .where(StyleShowcaseCategory.status == 1)
            .order_by(StyleShowcaseCategory.sort_order)
        )
        return result.scalars().all()

    @staticmethod
    async def get_showcases(
        db: AsyncSession,
        category_id: Optional[str] = None,
        showcase_type: Optional[str] = None,
        status: int = 1,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[list[StyleShowcase], int]:
        """获取展示列表"""
        # 构建查询条件
        conditions = [StyleShowcase.status == status]
        if category_id:
            conditions.append(StyleShowcase.category_id == category_id)
        if showcase_type:
            conditions.append(StyleShowcase.showcase_type == showcase_type)

        # 统计总数
        count_result = await db.execute(
            select(func.count(StyleShowcase.id))
            .where(and_(*conditions))
        )
        total = count_result.scalar() or 0

        # 分页查询
        offset = (page - 1) * page_size
        result = await db.execute(
            select(StyleShowcase)
            .options(selectinload(StyleShowcase.category))
            .where(and_(*conditions))
            .order_by(StyleShowcase.sort_order.desc(), StyleShowcase.published_at.desc())
            .offset(offset)
            .limit(page_size)
        )
        showcases = result.scalars().all()

        return showcases, total

    @staticmethod
    async def get_showcase_by_uuid(
        db: AsyncSession,
        uuid: str
    ) -> Optional[StyleShowcase]:
        """根据 UUID 获取展示"""
        result = await db.execute(
            select(StyleShowcase)
            .options(selectinload(StyleShowcase.category))
            .where(
                and_(
                    StyleShowcase.showcase_uuid == uuid,
                    StyleShowcase.status == 1
                )
            )
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def get_featured_showcases(
        db: AsyncSession,
        limit: int = 6
    ) -> list[StyleShowcase]:
        """获取精选展示"""
        result = await db.execute(
            select(StyleShowcase)
            .options(selectinload(StyleShowcase.category))
            .where(
                and_(
                    StyleShowcase.status == 1,
                    StyleShowcase.is_featured == True
                )
            )
            .order_by(StyleShowcase.sort_order.desc())
            .limit(limit)
        )
        return result.scalars().all()

    @staticmethod
    async def increment_view_count(db: AsyncSession, showcase_id: int) -> None:
        """增加展示浏览量"""
        result = await db.execute(
            select(StyleShowcase).where(StyleShowcase.id == showcase_id)
        )
        showcase = result.scalar_one_or_none()
        if showcase:
            showcase.view_count += 1
            await db.commit()