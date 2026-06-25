"""
建表脚本 — 仅创建 jx_apk_messages 表

用法：
    cd backend
    python create_tables_message.py

幂等：已存在的表会自动跳过，不会删数据。
"""
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from config import settings
from app.models.base import Base
from app.models.message import Message  # noqa: F401


async def main():
    engine = create_async_engine(settings.database_url, echo=True)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await engine.dispose()
    print("\n✓ jx_apk_messages 表已建好（如已存在则跳过）")


if __name__ == "__main__":
    asyncio.run(main())
