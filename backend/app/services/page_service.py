import logging
import uuid
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy import select, func, and_, text
from app.models.page import Page
from app.models.page_version import PageVersion

logger = logging.getLogger(__name__)


# Mobile database connection (for syncing)
_mobile_engine = None
_mobile_session_maker = None


def get_mobile_engine():
    global _mobile_engine, _mobile_session_maker
    if _mobile_engine is None:
        from config import settings
        _mobile_engine = create_async_engine(
            settings.mobile_database_url,
            echo=False,
        )
        _mobile_session_maker = async_sessionmaker(
            _mobile_engine,
            class_=AsyncSession,
            expire_on_commit=False,
        )
    return _mobile_engine, _mobile_session_maker


class PageService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def sync_to_mobile(self, page: Page, latest_version: PageVersion) -> bool:
        """同步已发布页面到mobile库的published_pages表"""
        try:
            _, session_maker = get_mobile_engine()
            async with session_maker() as mobile_db:
                stmt = text("""
                    INSERT INTO published_pages (route, title, content, admin_page_id, version, published_at)
                    VALUES (:route, :title, :content, :admin_page_id, :version, NOW())
                    ON CONFLICT (route) DO UPDATE SET
                        title = EXCLUDED.title,
                        content = EXCLUDED.content,
                        admin_page_id = EXCLUDED.admin_page_id,
                        version = EXCLUDED.version,
                        published_at = NOW()
                """)
                await mobile_db.execute(stmt, {
                    'route': page.route,
                    'title': page.title,
                    'content': latest_version.content,
                    'admin_page_id': page.id,
                    'version': latest_version.version,
                })
                await mobile_db.commit()
                return True
        except Exception as e:
            logger.warning(f"Failed to sync to mobile: {e}")
            return False

    async def create_page(
        self,
        title: str,
        slug: str,
        route: str,
        layout: str = "grid",
        created_by: Optional[uuid.UUID] = None,
        meta_title: Optional[str] = None,
        meta_description: Optional[str] = None,
    ) -> Page:
        page = Page(
            title=title,
            slug=slug,
            route=route,
            layout=layout,
            created_by=created_by,
            meta_title=meta_title,
            meta_description=meta_description,
        )
        self.db.add(page)
        await self.db.commit()
        await self.db.refresh(page)
        return page

    async def get_page(self, page_id: uuid.UUID) -> Page | None:
        result = await self.db.execute(select(Page).where(Page.id == page_id))
        return result.scalar_one_or_none()

    async def get_page_by_slug(self, slug: str) -> Page | None:
        result = await self.db.execute(select(Page).where(Page.slug == slug))
        return result.scalar_one_or_none()

    async def get_page_by_route(self, route: str) -> Page | None:
        result = await self.db.execute(select(Page).where(Page.route == route))
        return result.scalar_one_or_none()

    async def get_pages(
        self,
        page: int = 1,
        page_size: int = 20,
        status: Optional[str] = None,
        created_by: Optional[uuid.UUID] = None,
    ) -> tuple[list[Page], int]:
        conditions = []
        if status:
            conditions.append(Page.status == status)
        if created_by is not None:
            conditions.append(Page.created_by == created_by)

        count_query = select(func.count(Page.id))
        if conditions:
            count_query = count_query.where(*conditions)
        count_result = await self.db.execute(count_query)
        total = count_result.scalar() or 0

        offset = (page - 1) * page_size
        select_query = select(Page)
        if conditions:
            select_query = select_query.where(*conditions)
        result = await self.db.execute(
            select_query
            .order_by(Page.created_at.desc())
            .offset(offset)
            .limit(page_size)
        )
        pages = result.scalars().all()

        return list(pages), total

    async def update_page(
        self,
        page_id: uuid.UUID,
        title: Optional[str] = None,
        slug: Optional[str] = None,
        route: Optional[str] = None,
        layout: Optional[str] = None,
        status: Optional[str] = None,
    ) -> Page | None:
        page = await self.get_page(page_id)
        if not page:
            return None

        if title is not None:
            page.title = title
        if slug is not None:
            page.slug = slug
        if route is not None:
            page.route = route
        if layout is not None:
            page.layout = layout
        if status is not None:
            page.status = status

        await self.db.commit()
        await self.db.refresh(page)
        return page

    async def delete_page(self, page_id: uuid.UUID) -> bool:
        page = await self.get_page(page_id)
        if not page:
            return False

        await self.db.delete(page)
        await self.db.commit()
        return True

    async def create_version(
        self,
        page_id: uuid.UUID,
        content: dict,
    ) -> PageVersion:
        result = await self.db.execute(
            select(func.max(PageVersion.version)).where(PageVersion.page_id == page_id)
        )
        latest_version = result.scalar() or 0
        new_version = latest_version + 1

        page_version = PageVersion(
            page_id=page_id,
            version=new_version,
            content=content,
        )
        self.db.add(page_version)
        await self.db.commit()
        await self.db.refresh(page_version)
        return page_version

    async def get_versions(
        self,
        page_id: uuid.UUID,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[list[PageVersion], int]:
        count_result = await self.db.execute(
            select(func.count(PageVersion.id)).where(PageVersion.page_id == page_id)
        )
        total = count_result.scalar() or 0

        offset = (page - 1) * page_size
        result = await self.db.execute(
            select(PageVersion)
            .where(PageVersion.page_id == page_id)
            .order_by(PageVersion.version.desc())
            .offset(offset)
            .limit(page_size)
        )
        versions = result.scalars().all()

        return list(versions), total

    async def get_version(
        self, page_id: uuid.UUID, version_id: uuid.UUID
    ) -> PageVersion | None:
        result = await self.db.execute(
            select(PageVersion).where(
                and_(
                    PageVersion.page_id == page_id,
                    PageVersion.id == version_id,
                )
            )
        )
        return result.scalar_one_or_none()

    async def get_latest_version(self, page_id: uuid.UUID) -> PageVersion | None:
        result = await self.db.execute(
            select(PageVersion)
            .where(PageVersion.page_id == page_id)
            .order_by(PageVersion.version.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()

    async def publish_page(self, page_id: uuid.UUID) -> Page | None:
        page = await self.get_page(page_id)
        if not page:
            return None

        latest_version = await self.get_latest_version(page_id)
        if not latest_version:
            latest_version = await self.create_version(
                page_id=page_id,
                content={
                    "modules": [],
                    "styles": {
                        "global": {
                            "backgroundColor": "#ffffff",
                            "textColor": "#000000",
                            "fontFamily": "Inter",
                        },
                        "modules": {},
                    },
                },
            )

        page.status = "published"
        await self.db.commit()
        await self.db.refresh(page)

        # 同步到 mobile 库
        await self.sync_to_mobile(page, latest_version)

        return page


async def get_mobile_published_page(db: AsyncSession, route: str):
    """从mobile库的published_pages表读取已发布页面"""
    from sqlalchemy import text

    stmt = text("""
        SELECT route, title, content, admin_page_id, version, published_at, id
        FROM published_pages
        WHERE route = :route
    """)
    result = await db.execute(stmt, {'route': route})
    row = result.fetchone()

    if not row:
        return None

    # 构建匹配 PageResponse 的 page 数据
    page = {
        'id': str(row[6]),  # published_pages.id
        'slug': row[0].lstrip('/'),  # /123 -> 123
        'route': row[0],
        'title': row[1],
        'layout': 'free',
        'status': 'published',
        'meta_title': None,
        'meta_description': None,
        'created_by': str(row[3]),  # admin_page_id
        'created_at': row[5].isoformat() if row[5] else None,
        'updated_at': row[5].isoformat() if row[5] else None,
    }
    content = row[2]  # JSONB content

    return page, content
