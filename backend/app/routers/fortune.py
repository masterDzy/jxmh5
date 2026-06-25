"""
运势模块 API
"""
from typing import Optional

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from database import get_db
from app.schemas import ApiResponse

router = APIRouter(prefix="/api/v1/fortune", tags=["运势"])


# ============ Pydantic Models ============

class FortuneReading(BaseModel):
    """运势数据"""
    zodiac_id: int
    period_type: str
    period_start: str
    period_end: str
    overall_score: Optional[int] = None
    overall_content: Optional[str] = None
    health_score: Optional[int] = None
    health_content: Optional[str] = None
    career_score: Optional[int] = None
    career_content: Optional[str] = None
    wealth_score: Optional[int] = None
    wealth_content: Optional[str] = None
    love_score: Optional[int] = None
    love_content: Optional[str] = None
    lucky_direction: Optional[str] = None
    lucky_color: Optional[str] = None
    lucky_number: Optional[str] = None
    lucky_item: Optional[str] = None
    lucky_words: Optional[str] = None
    taboo: Optional[str] = None


# ============ API Endpoints ============

@router.get("", response_model=ApiResponse[Optional[FortuneReading]])
async def get_fortune(
    zodiac_id: int = Query(..., ge=0, le=11, description="属相索引 0-11"),
    period_type: str = Query(..., description="时间类型: day/week/month"),
    period_start: str = Query(..., description="时间段起始日期 YYYY-MM-DD"),
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[Optional[FortuneReading]]:
    """
    获取指定属相和时间段的运势数据

    - zodiac_id: 0=鼠, 1=牛, 2=虎, 3=兔, 4=龙, 5=蛇, 6=马, 7=羊, 8=猴, 9=鸡, 10=狗, 11=猪
    - period_type: day(日运势) / week(周运势) / month(月运势)
    - period_start: 时间段起始日期
    """
    query = text("""
        SELECT
            zodiac_id,
            period_type,
            period_start::text,
            period_end::text,
            overall_score,
            overall_content,
            health_score,
            health_content,
            career_score,
            career_content,
            wealth_score,
            wealth_content,
            love_score,
            love_content,
            lucky_direction,
            lucky_color,
            lucky_number,
            lucky_item,
            lucky_words,
            taboo
        FROM jx_apk_fortune_readings
        WHERE zodiac_id = :zodiac_id
          AND period_type = :period_type
          AND period_start::text = :period_start
        LIMIT 1
    """)

    result = await db.execute(
        query,
        {
            "zodiac_id": zodiac_id,
            "period_type": period_type,
            "period_start": period_start,
        },
    )
    row = result.fetchone()

    if row is None:
        return ApiResponse(data=None, message="未找到运势数据")

    data = FortuneReading(**row._mapping)
    return ApiResponse(data=data, message="success")
