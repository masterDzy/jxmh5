"""
统一 API 响应模型

所有 API 响应必须使用 ApiResponse 包装，确保类型安全。
"""
from typing import Any, Generic, TypeVar
from pydantic import BaseModel

T = TypeVar("T")


class ApiResponse(BaseModel, Generic[T]):
    """统一 API 响应格式"""
    error: bool = False
    message: str = "success"
    data: T | None = None


class PaginatedData(BaseModel, Generic[T]):
    """分页数据结构"""
    items: list[T]
    total: int
    page: int
    page_size: int
    total_pages: int


class ErrorData(BaseModel):
    """错误响应数据"""
    code: str | None = None
    detail: str | None = None
