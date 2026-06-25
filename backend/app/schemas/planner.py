from typing import Optional
from pydantic import BaseModel


class PlannerItem(BaseModel):
    """策划师项（移动端公开 DTO）"""
    id: int
    name: str
    specialty: str
    description: str
    single_price: float
    full_price: float
    avatar_url: Optional[str] = None
    sort_order: int


class PlannerListData(BaseModel):
    """列表数据容器"""
    planners: list[PlannerItem]
    total: int


class PlannerListResponse(BaseModel):
    """GET /api/v1/mobile/planner 标准返回结构"""
    error: bool = False
    message: str = "success"
    data: Optional[PlannerListData] = None
