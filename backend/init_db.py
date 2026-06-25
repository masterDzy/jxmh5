"""
数据库初始化脚本 — 一次性建表

用法：
    cd backend
    python init_db.py

只会建不存在的表（不会删数据），幂等。
新增 model 后再次跑即可补建新表。
"""
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from config import settings
from app.models.base import Base

# 关键：import 所有 model，让 Base.metadata 知道它们
from app.models import (  # noqa: F401
    User,
    Page,
    PageVersion,
    KnowledgeCategory,
    KnowledgeArticle,
    StyleShowcaseCategory,
    StyleShowcase,
    ShopCategory,
    ShopProduct,
    ShopAddress,
    ShopCartItem,
    ShopOrder,
    ShopOrderItem,
    Appointment,
    Planner,
)


async def main():
    engine = create_async_engine(settings.database_url, echo=True)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await engine.dispose()
    print("\n✓ 所有表已建好（已存在的会自动跳过）")


if __name__ == "__main__":
    asyncio.run(main())
