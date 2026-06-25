from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from config import settings


def create_engine_and_session(database_url: str):
    engine = create_async_engine(
        database_url,
        echo=settings.debug,
        pool_size=settings.database_pool_size,
        max_overflow=settings.database_max_overflow,
        pool_recycle=settings.database_pool_recycle,
        pool_pre_ping=True,
    )
    session_maker = async_sessionmaker(
        engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )
    return engine, session_maker


# Mobile database engine (jx_m_apk)
engine, async_session_maker = create_engine_and_session(settings.database_url)


async def get_db():
    async with async_session_maker() as session:
        yield session


# Alias for mobile_service.py
async def get_db_mobile_services():
    async with async_session_maker() as session:
        yield session


# Alias for page.py mobile content endpoint
async def get_db_mobile():
    async with async_session_maker() as session:
        yield session
