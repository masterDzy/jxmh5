"""
知识园地 API 路由
"""
from fastapi import APIRouter, Query
from typing import Optional
from datetime import datetime, timedelta
import random

from app.schemas import ApiResponse, PaginatedData
from pydantic import BaseModel

router = APIRouter(prefix="/api/v1/knowledge", tags=["knowledge"])


# ============ Schema 定义 ============

class KnowledgeCategory(BaseModel):
    id: str
    name: str


class KnowledgeArticle(BaseModel):
    id: int
    title: str
    cover_image: Optional[str] = None
    category: str
    category_name: str
    summary: str
    content: str
    is_video: bool
    video_url: Optional[str] = None
    share_count: int
    favorite_count: int
    published_at: datetime


# 响应类型
CategoryListData = PaginatedData[KnowledgeCategory]
ArticleListData = PaginatedData[KnowledgeArticle]


# ============ Mock 数据 ============

CATEGORIES = [
    KnowledgeCategory(id="qimen", name="奇门遁甲"),
    KnowledgeCategory(id="xiangmao", name="相貌学"),
    KnowledgeCategory(id="huanjing", name="环境堪舆"),
]

MOCK_ARTICLES = [
    # 奇门遁甲
    KnowledgeArticle(
        id=1,
        title="奇门遁甲入门：排盘基础",
        cover_image="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
        category="qimen",
        category_name="奇门遁甲",
        summary="奇门遁甲是中国古代术数中的重要组成部分，与太乙、六壬并称三式。排盘是奇门遁甲的基础，本篇介绍如何正确排盘。",
        content="<p>奇门遁甲是中国古代术数中的重要组成部分...</p><p>排盘步骤：</p><ol><li>确定问事时间</li><li>计算局数</li><li>排布地盘</li><li>排布人盘</li><li>排布天盘</li></ol>",
        is_video=False,
        video_url=None,
        share_count=120,
        favorite_count=45,
        published_at=datetime.now() - timedelta(days=2),
    ),
    KnowledgeArticle(
        id=2,
        title="奇门遁甲高级：八门应用",
        cover_image="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
        category="qimen",
        category_name="奇门遁甲",
        summary="八门是奇门遁甲中的重要概念，分别为休、生、伤、杜、景、死、惊、开。本篇详解八门的含义与应用。",
        content="<p>八门含义：</p><ul><li>休门：代表休息、贵人</li><li>生门：代表生气、财运</li><li>伤门：代表伤害、变动</li></ul>",
        is_video=True,
        video_url="https://example.com/video/qimen-8men.mp4",
        share_count=89,
        favorite_count=32,
        published_at=datetime.now() - timedelta(days=5),
    ),
    KnowledgeArticle(
        id=3,
        title="奇门遁甲实例：婚姻预测",
        cover_image="https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&h=300&fit=crop",
        category="qimen",
        category_name="奇门遁甲",
        summary="通过具体案例，讲解如何用奇门遁甲预测婚姻感情问题。",
        content="<p>案例分析：</p><p>女问姻缘，庚午年某月...</p>",
        is_video=False,
        video_url=None,
        share_count=156,
        favorite_count=67,
        published_at=datetime.now() - timedelta(days=8),
    ),
    # 相貌学
    KnowledgeArticle(
        id=4,
        title="面相学基础：五官与五脏",
        cover_image="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
        category="xiangmao",
        category_name="相貌学",
        summary="面相学认为五官对应五脏六腑，通过观察五官可以判断健康与运势。本篇介绍五官与五脏的对应关系。",
        content="<p>五官与五脏对应：</p><ul><li>耳朵→肾</li><li>眉毛→肝</li><li>眼睛→心</li><li>鼻子→肺</li><li>嘴巴→脾</li></ul>",
        is_video=False,
        video_url=None,
        share_count=234,
        favorite_count=89,
        published_at=datetime.now() - timedelta(days=1),
    ),
    KnowledgeArticle(
        id=5,
        title="手相教程：三大线纹解析",
        cover_image="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
        category="xiangmao",
        category_name="相貌学",
        summary="生命线、感情线、智慧线是手相三大主线，本视频详细讲解如何解读这三条线。",
        content="<p>手相三大线：</p><ol><li>生命线：从虎口走向手腕</li><li>感情线：小指下方延伸</li><li>智慧线：食指与中指之间</li></ol>",
        is_video=True,
        video_url="https://example.com/video/hand-reading.mp4",
        share_count=178,
        favorite_count=92,
        published_at=datetime.now() - timedelta(days=3),
    ),
    KnowledgeArticle(
        id=6,
        title="面相案例分析：额头与事业",
        cover_image="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
        category="xiangmao",
        category_name="相貌学",
        summary="额头主事业运势，本文通过实际案例分析额头形态与事业发展的关系。",
        content="<p>额头形态分析：</p><ul><li>饱满圆润：事业顺利</li><li>凹陷扁平：需努力奋斗</li><li>额纹过多：操心劳碌</li></ul>",
        is_video=False,
        video_url=None,
        share_count=145,
        favorite_count=56,
        published_at=datetime.now() - timedelta(days=7),
    ),
    # 环境堪舆
    KnowledgeArticle(
        id=7,
        title="风水入门：理气与峦头",
        cover_image="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
        category="huanjing",
        category_name="环境堪舆",
        summary="风水学分为理气与峦头两大体系，本篇介绍两者的基础概念与关系。",
        content="<p>风水两大体系：</p><ul><li>峦头：形峦形势</li><li>理气：方位理气</li></ul>",
        is_video=False,
        video_url=None,
        share_count=198,
        favorite_count=78,
        published_at=datetime.now() - timedelta(days=4),
    ),
    KnowledgeArticle(
        id=8,
        title="家居风水：客厅布局禁忌",
        cover_image="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
        category="huanjing",
        category_name="环境堪舆",
        summary="客厅是家庭核心区域，风水布局至关重要。本视频讲解客厅沙发放置、电视朝向等常见问题。",
        content="<p>客厅风水要点：</p><ol><li>沙发背有实墙靠</li><li>电视墙不宜过高</li><li>茶几不宜过高</li></ol>",
        is_video=True,
        video_url="https://example.com/video/living-room-fengshui.mp4",
        share_count=267,
        favorite_count=123,
        published_at=datetime.now() - timedelta(days=6),
    ),
    KnowledgeArticle(
        id=9,
        title="办公室风水：工位调整技巧",
        cover_image="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
        category="huanjing",
        category_name="环境堪舆",
        summary="上班族每天大部分时间在办公室，工位风水影响运势。本篇介绍如何调整工位提升事业运。",
        content="<p>工位调整：</p><ul><li>座位背后有靠</li><li>桌面保持整洁</li><li>电脑旁放植物</li></ul>",
        is_video=False,
        video_url=None,
        share_count=189,
        favorite_count=87,
        published_at=datetime.now() - timedelta(days=9),
    ),
    KnowledgeArticle(
        id=10,
        title="商铺风水：招财布局详解",
        cover_image="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
        category="huanjing",
        category_name="环境堪舆",
        summary="商铺风水直接关系到生意兴隆，本篇讲解商铺门口、收银台、货架的风水布局。",
        content="<p>商铺风水要点：</p><ol><li>门口宽敞明亮</li><li>收银台在财位</li><li>货架摆放有序</li></ol>",
        is_video=True,
        video_url="https://example.com/video/shop-fengshui.mp4",
        share_count=312,
        favorite_count=156,
        published_at=datetime.now() - timedelta(days=10),
    ),
]


# ============ API 路由 ============

@router.get("/categories", response_model=ApiResponse[CategoryListData])
async def get_categories():
    """获取知识分类列表"""
    return ApiResponse(
        error=False,
        message="success",
        data=CategoryListData(
            items=CATEGORIES,
            total=len(CATEGORIES),
            page=1,
            page_size=len(CATEGORIES),
            total_pages=1,
        ),
    )


@router.get("/articles", response_model=ApiResponse[ArticleListData])
async def get_articles(
    category: str = Query("all", description="分类筛选: all/qimen/xiangmao/huanjing"),
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(20, ge=1, le=100, description="每页数量"),
):
    """获取知识文章列表"""
    # 筛选分类
    if category == "all":
        filtered = MOCK_ARTICLES
    else:
        filtered = [a for a in MOCK_ARTICLES if a.category == category]

    # 分页
    total = len(filtered)
    total_pages = (total + page_size - 1) // page_size if total > 0 else 1
    start = (page - 1) * page_size
    end = start + page_size
    items = filtered[start:end]

    return ApiResponse(
        error=False,
        message="success",
        data=ArticleListData(
            items=items,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
        ),
    )


@router.get("/articles/{article_id}", response_model=ApiResponse[KnowledgeArticle])
async def get_article(article_id: int):
    """获取文章详情"""
    for article in MOCK_ARTICLES:
        if article.id == article_id:
            return ApiResponse(
                error=False,
                message="success",
                data=article,
            )
    return ApiResponse(
        error=True,
        message="Article not found",
        data=None,
    )
