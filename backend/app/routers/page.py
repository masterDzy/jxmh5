from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db, get_db_mobile
from app.schemas.page import (
    PageListResponse,
    PageOneResponse,
    PageResponse,
    PageCreate,
    PageUpdate,
    PageVersionListResponse,
    PageVersionOneResponse,
    PageVersionResponse,
    PageVersionCreate,
    PageContentResponse,
    PageListData,
    PageVersionListData,
)
from app.schemas import PaginatedData
from app.services.page_service import PageService
import uuid
from typing import Optional

router = APIRouter(prefix="/api/v1/pages", tags=["pages"])


@router.get("", response_model=PageListResponse)
async def get_pages(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Page size"),
    status: Optional[str] = Query(None, description="Filter by status"),
    db: AsyncSession = Depends(get_db),
):
    service = PageService(db)
    pages, total = await service.get_pages(
        page=page, page_size=page_size, status=status
    )

    total_pages = (total + page_size - 1) // page_size

    return PageListResponse(
        error=False,
        message="success",
        data=PageListData(
            items=[PageResponse.model_validate(p) for p in pages],
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
        ),
    )


@router.post("", response_model=PageOneResponse)
async def create_page(
    request: PageCreate,
    db: AsyncSession = Depends(get_db),
):
    service = PageService(db)
    page = await service.create_page(
        title=request.title,
        slug=request.slug,
        route=request.route,
        layout=request.layout,
        created_by=None,
        meta_title=request.meta_title,
        meta_description=request.meta_description,
    )
    return PageOneResponse(
        error=False,
        message="success",
        data=PageResponse.model_validate(page),
    )


@router.get("/{page_id}", response_model=PageOneResponse)
async def get_page(
    page_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    service = PageService(db)
    page = await service.get_page(page_id)
    if not page:
        return PageOneResponse(
            error=True,
            message="Page not found",
            data=None,
        )
    return PageOneResponse(
        error=False,
        message="success",
        data=PageResponse.model_validate(page),
    )


@router.put("/{page_id}", response_model=PageOneResponse)
async def update_page(
    page_id: uuid.UUID,
    request: PageUpdate,
    db: AsyncSession = Depends(get_db),
):
    service = PageService(db)
    page = await service.update_page(
        page_id=page_id,
        title=request.title,
        slug=request.slug,
        route=request.route,
        layout=request.layout,
        status=request.status,
    )
    if not page:
        return PageOneResponse(
            error=True,
            message="Page not found",
            data=None,
        )
    return PageOneResponse(
        error=False,
        message="success",
        data=PageResponse.model_validate(page),
    )


@router.delete("/{page_id}", response_model=PageOneResponse)
async def delete_page(
    page_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    service = PageService(db)
    success = await service.delete_page(page_id)
    if not success:
        return PageOneResponse(
            error=True,
            message="Page not found",
            data=None,
        )
    return PageOneResponse(
        error=False,
        message="success",
        data=None,
    )


@router.get("/{page_id}/versions", response_model=PageVersionListResponse)
async def get_versions(
    page_id: uuid.UUID,
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Page size"),
    db: AsyncSession = Depends(get_db),
):
    service = PageService(db)
    versions, total = await service.get_versions(
        page_id=page_id, page=page, page_size=page_size
    )

    total_pages = (total + page_size - 1) // page_size

    return PageVersionListResponse(
        error=False,
        message="success",
        data=PageVersionListData(
            items=[PageVersionResponse.model_validate(v) for v in versions],
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
        ),
    )


@router.post("/{page_id}/versions", response_model=PageVersionOneResponse)
async def create_version(
    page_id: uuid.UUID,
    request: PageVersionCreate,
    db: AsyncSession = Depends(get_db),
):
    service = PageService(db)
    page = await service.get_page(page_id)
    if not page:
        return PageVersionOneResponse(
            error=True,
            message="Page not found",
            data=None,
        )
    version = await service.create_version(page_id=page_id, content=request.content)
    return PageVersionOneResponse(
        error=False,
        message="success",
        data=PageVersionResponse.model_validate(version),
    )


@router.get("/{page_id}/versions/{version_id}", response_model=PageVersionOneResponse)
async def get_version(
    page_id: uuid.UUID,
    version_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    service = PageService(db)
    version = await service.get_version(page_id=page_id, version_id=version_id)
    if not version:
        return PageVersionOneResponse(
            error=True,
            message="Version not found",
            data=None,
        )
    return PageVersionOneResponse(
        error=False,
        message="success",
        data=PageVersionResponse.model_validate(version),
    )


@router.post("/{page_id}/publish", response_model=PageOneResponse)
async def publish_page(
    page_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    service = PageService(db)
    page = await service.publish_page(page_id)
    if not page:
        return PageOneResponse(
            error=True,
            message="Page not found",
            data=None,
        )
    return PageOneResponse(
        error=False,
        message="success",
        data=PageResponse.model_validate(page),
    )


@router.get("/content/{route_path:path}", response_model=PageContentResponse)
async def get_page_content(
    route_path: str,
    db: AsyncSession = Depends(get_db_mobile),
):
    """从mobile库读取已发布页面"""
    from app.services.page_service import get_mobile_published_page

    route = "/" + route_path
    result = await get_mobile_published_page(db, route)

    if not result:
        return PageContentResponse(
            error=True,
            message="Page not found",
            data=None,
        )

    page, content = result
    return PageContentResponse(
        error=False,
        message="success",
        data={
            "page": page,
            "content": content,
        },
    )
