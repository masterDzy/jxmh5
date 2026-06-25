"""
移动端服务 Schema 定义

2026-06-14 简化：原 ServiceListResponse / ServiceCategoryListResponse 等分页响应类型
已随列表/分类路由（mobile_service 列表 + mobile_service/categories + mobile_categories）
一并删除。当前 schema 只保留单条响应（ServiceOneResponse + ServiceResponse），
供 booking 详情接口 GET /api/v1/mobile/services/{id} 使用。
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from app.schemas import ApiResponse


class ServiceCategoryBase(BaseModel):
    """服务分类基础字段"""
    id: str
    name: str
    slug: Optional[str] = None
    icon: Optional[str] = None
    sort_order: int = 0
    status: int = 1


class ServiceCategoryResponse(ServiceCategoryBase):
    """服务分类响应"""
    parent_id: Optional[str] = None
    description: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ServiceBase(BaseModel):
    """服务产品基础字段"""
    id: str
    name: str
    slug: Optional[str] = None
    parent_id: Optional[str] = None
    icon: Optional[str] = None
    description: Optional[str] = None
    price: float = 0
    original_price: Optional[float] = None
    has_member_price: bool = False
    member_price: Optional[float] = None
    cover_image: Optional[str] = None
    images: Optional[list] = None
    origin: Optional[str] = None
    content_items: Optional[list] = None
    additional_rule: Optional[str] = None
    pricing_type: str = "fixed"
    price_range_min: Optional[float] = None
    price_range_max: Optional[float] = None
    area_unit: Optional[str] = None
    consultation_mode: Optional[str] = None
    duration: Optional[str] = None
    is_hot: bool = False
    is_recommend: bool = False
    view_count: int = 0
    sort_order: int = 0
    status: int = 1


class ServiceResponse(ServiceBase):
    """服务产品响应（单条；booking 详情用）"""
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# API 响应类型（仅单条；列表类型已删）
ServiceCategoryOneResponse = ApiResponse[ServiceCategoryResponse]
ServiceOneResponse = ApiResponse[ServiceResponse]
