from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db
from app.models.planner import Planner
from app.schemas.planner import (
    PlannerItem,
    PlannerListData,
    PlannerListResponse,
)


router = APIRouter(prefix="/api/v1/mobile/planner", tags=["mobile-planner"])


@router.get("", response_model=PlannerListResponse)
async def get_planners(db: AsyncSession = Depends(get_db)):
    """
    移动端公开接口 - 获取所有启用的策划师
    ORDER BY sort_order ASC, id ASC
    """
    try:
        stmt = (
            select(Planner)
            .where(Planner.status == 1)
            .order_by(Planner.sort_order.asc(), Planner.id.asc())
        )
        result = await db.execute(stmt)
        rows = result.scalars().all()

        planners = [
            PlannerItem(
                id=r.id,
                name=r.name,
                specialty=r.specialty,
                description=r.description,
                single_price=float(r.single_price or 0),
                full_price=float(r.full_price or 0),
                avatar_url=r.avatar_url,
                sort_order=r.sort_order,
            )
            for r in rows
        ]

        return PlannerListResponse(
            error=False,
            message="success",
            data=PlannerListData(planners=planners, total=len(planners)),
        )
    except Exception as e:
        return PlannerListResponse(
            error=True,
            message=str(e),
            data=None,
        )
