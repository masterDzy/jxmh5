"""
综合园地 API 路由
包含：知识文章 + 风采展示
"""
from fastapi import APIRouter, Depends, Query
from typing import Optional
from pydantic import BaseModel

from app.schemas import ApiResponse, PaginatedData
from app.services.knowledge_service import KnowledgeService
from app.services.style_showcase_service import StyleShowcaseService
from database import get_db

router = APIRouter(prefix="/api/v1/garden", tags=["garden"])


# ============ Schema 定义 ============

class KnowledgeCategorySchema(BaseModel):
    id: str
    name: str
    slug: Optional[str] = None
    icon: Optional[str] = None


class StyleShowcaseCategorySchema(BaseModel):
    id: str
    name: str
    slug: Optional[str] = None
    icon: Optional[str] = None


class KnowledgeArticleSchema(BaseModel):
    id: int
    uuid: str
    title: str
    summary: Optional[str] = None
    cover_image: Optional[str] = None
    is_video: bool
    video_url: Optional[str] = None
    category_id: Optional[str] = None
    category_name: Optional[str] = None
    view_count: int
    share_count: int
    favorite_count: int
    published_at: Optional[str] = None
    is_featured: bool = False


class StyleShowcaseSchema(BaseModel):
    id: int
    uuid: str
    title: str
    description: Optional[str] = None
    cover_image: Optional[str] = None
    showcase_type: str  # image/video/audio
    video_url: Optional[str] = None
    video_duration: Optional[int] = None
    category_id: Optional[str] = None
    category_name: Optional[str] = None
    author_name: Optional[str] = None
    author_avatar: Optional[str] = None
    view_count: int
    like_count: int
    share_count: int
    published_at: Optional[str] = None
    is_featured: bool = False


def _article_to_schema(a) -> KnowledgeArticleSchema:
    return KnowledgeArticleSchema(
        id=a.id,
        uuid=str(a.article_uuid),
        title=a.title,
        summary=a.summary,
        cover_image=a.cover_image,
        is_video=a.is_video,
        video_url=a.video_url,
        category_id=a.category_id,
        category_name=a.category.name if a.category else None,
        view_count=a.view_count,
        share_count=a.share_count,
        favorite_count=a.favorite_count,
        published_at=a.published_at.isoformat() if a.published_at else None,
        is_featured=a.is_featured,
    )


def _showcase_to_schema(s) -> StyleShowcaseSchema:
    return StyleShowcaseSchema(
        id=s.id,
        uuid=str(s.showcase_uuid),
        title=s.title,
        description=s.description,
        cover_image=s.cover_image,
        showcase_type=s.showcase_type,
        video_url=s.video_url,
        video_duration=s.video_duration,
        category_id=s.category_id,
        category_name=s.category.name if s.category else None,
        author_name=s.author_name,
        author_avatar=s.author_avatar,
        view_count=s.view_count,
        like_count=s.like_count,
        share_count=s.share_count,
        published_at=s.published_at.isoformat() if s.published_at else None,
        is_featured=s.is_featured,
    )


# ============ 知识文章路由 ============

@router.get("/knowledge/categories", response_model=ApiResponse[PaginatedData[KnowledgeCategorySchema]])
async def get_knowledge_categories(db=Depends(get_db)):
    """获取知识分类列表"""
    categories = await KnowledgeService.get_categories(db)
    items = [
        KnowledgeCategorySchema(
            id=c.id,
            name=c.name,
            slug=c.slug,
            icon=c.icon,
        )
        for c in categories
    ]
    return ApiResponse(
        error=False,
        message="success",
        data=PaginatedData(
            items=items,
            total=len(items),
            page=1,
            page_size=len(items),
            total_pages=1,
        ),
    )


@router.get("/knowledge/articles", response_model=ApiResponse[PaginatedData[KnowledgeArticleSchema]])
async def get_knowledge_articles(
    category: Optional[str] = Query(None, description="分类ID"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db=Depends(get_db),
):
    """获取知识文章列表"""
    articles, total = await KnowledgeService.get_articles(
        db, category_id=category, page=page, page_size=page_size
    )
    items = [_article_to_schema(a) for a in articles]
    total_pages = (total + page_size - 1) // page_size if total > 0 else 1
    return ApiResponse(
        error=False,
        message="success",
        data=PaginatedData(
            items=items,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
        ),
    )


@router.get("/knowledge/articles/{uuid}", response_model=ApiResponse[KnowledgeArticleSchema])
async def get_knowledge_article(uuid: str, db=Depends(get_db)):
    """获取知识文章详情"""
    article = await KnowledgeService.get_article_by_uuid(db, uuid)
    if not article:
        return ApiResponse(error=True, message="Article not found", data=None)
    return ApiResponse(
        error=False,
        message="success",
        data=KnowledgeArticleSchema(
            id=article.id,
            uuid=str(article.article_uuid),
            title=article.title,
            summary=article.summary,
            cover_image=article.cover_image,
            is_video=article.is_video,
            video_url=article.video_url,
            category_id=article.category_id,
            category_name=article.category.name if article.category else None,
            view_count=article.view_count,
            share_count=article.share_count,
            favorite_count=article.favorite_count,
            published_at=article.published_at.isoformat() if article.published_at else None,
            is_featured=article.is_featured,
        ),
    )


@router.get("/knowledge/featured", response_model=ApiResponse[PaginatedData[KnowledgeArticleSchema]])
async def get_featured_knowledge_articles(
    limit: int = Query(6, ge=1, le=20),
    db=Depends(get_db),
):
    """获取精选知识文章"""
    articles = await KnowledgeService.get_featured_articles(db, limit)
    items = [_article_to_schema(a) for a in articles]
    return ApiResponse(
        error=False,
        message="success",
        data=PaginatedData(
            items=items,
            total=len(items),
            page=1,
            page_size=len(items),
            total_pages=1,
        ),
    )


# ============ 风采展示路由 ============

@router.get("/showcase/categories", response_model=ApiResponse[PaginatedData[StyleShowcaseCategorySchema]])
async def get_showcase_categories(db=Depends(get_db)):
    """获取风采分类列表"""
    categories = await StyleShowcaseService.get_categories(db)
    items = [
        StyleShowcaseCategorySchema(
            id=c.id,
            name=c.name,
            slug=c.slug,
            icon=c.icon,
        )
        for c in categories
    ]
    return ApiResponse(
        error=False,
        message="success",
        data=PaginatedData(
            items=items,
            total=len(items),
            page=1,
            page_size=len(items),
            total_pages=1,
        ),
    )


@router.get("/showcase/list", response_model=ApiResponse[PaginatedData[StyleShowcaseSchema]])
async def get_showcases(
    category: Optional[str] = Query(None, description="分类ID"),
    showcase_type: Optional[str] = Query(None, description="类型: image/video/audio"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db=Depends(get_db),
):
    """获取风采展示列表"""
    showcases, total = await StyleShowcaseService.get_showcases(
        db, category_id=category, showcase_type=showcase_type, page=page, page_size=page_size
    )
    items = [_showcase_to_schema(s) for s in showcases]
    total_pages = (total + page_size - 1) // page_size if total > 0 else 1
    return ApiResponse(
        error=False,
        message="success",
        data=PaginatedData(
            items=items,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
        ),
    )


@router.get("/showcase/{uuid}", response_model=ApiResponse[StyleShowcaseSchema])
async def get_showcase(uuid: str, db=Depends(get_db)):
    """获取风采展示详情"""
    showcase = await StyleShowcaseService.get_showcase_by_uuid(db, uuid)
    if not showcase:
        return ApiResponse(error=True, message="Showcase not found", data=None)
    return ApiResponse(
        error=False,
        message="success",
        data=StyleShowcaseSchema(
            id=showcase.id,
            uuid=str(showcase.showcase_uuid),
            title=showcase.title,
            description=showcase.description,
            cover_image=showcase.cover_image,
            showcase_type=showcase.showcase_type,
            video_url=showcase.video_url,
            video_duration=showcase.video_duration,
            category_id=showcase.category_id,
            category_name=showcase.category.name if showcase.category else None,
            author_name=showcase.author_name,
            author_avatar=showcase.author_avatar,
            view_count=showcase.view_count,
            like_count=showcase.like_count,
            share_count=showcase.share_count,
            published_at=showcase.published_at.isoformat() if showcase.published_at else None,
            is_featured=showcase.is_featured,
        ),
    )


@router.get("/showcase/featured", response_model=ApiResponse[PaginatedData[StyleShowcaseSchema]])
async def get_featured_showcases(
    limit: int = Query(6, ge=1, le=20),
    db=Depends(get_db),
):
    """获取精选风采展示"""
    showcases = await StyleShowcaseService.get_featured_showcases(db, limit)
    items = [_showcase_to_schema(s) for s in showcases]
    return ApiResponse(
        error=False,
        message="success",
        data=PaginatedData(
            items=items,
            total=len(items),
            page=1,
            page_size=len(items),
            total_pages=1,
        ),
    )


# ============ 联合查询 ============

@router.get("/home", response_model=ApiResponse[dict])
async def get_garden_home(db=Depends(get_db)):
    """获取综合园地首页数据（知识精选 + 风采精选）"""
    knowledge_articles = await KnowledgeService.get_featured_articles(db, limit=6)
    showcase_list = await StyleShowcaseService.get_featured_showcases(db, limit=6)

    knowledge_items = [_article_to_dict(a) for a in knowledge_articles]
    showcase_items = [_showcase_to_dict(s) for s in showcase_list]

    return ApiResponse(
        error=False,
        message="success",
        data={
            "knowledge": knowledge_items,
            "showcase": showcase_items,
        },
    )


def _article_to_dict(a) -> dict:
    """将知识文章模型转换为首页所需的字典格式"""
    return {
        "id": a.id,
        "uuid": str(a.article_uuid),
        "title": a.title,
        "summary": a.summary,
        "cover_image": a.cover_image,
        "is_video": a.is_video,
        "category_name": a.category.name if a.category else None,
    }


def _showcase_to_dict(s) -> dict:
    """将风采展示模型转换为首页所需的字典格式"""
    return {
        "id": s.id,
        "uuid": str(s.showcase_uuid),
        "title": s.title,
        "cover_image": s.cover_image,
        "showcase_type": s.showcase_type,
        "author_name": s.author_name,
    }