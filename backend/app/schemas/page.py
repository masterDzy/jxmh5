import uuid
from datetime import datetime
from pydantic import BaseModel, Field
from app.schemas import ApiResponse, PaginatedData


class PageBase(BaseModel):
    title: str
    slug: str
    route: str
    layout: str = "grid"
    status: str = "draft"
    meta_title: str | None = Field(default=None, validation_alias="metaTitle", serialization_alias="meta_title")
    meta_description: str | None = Field(default=None, validation_alias="metaDescription", serialization_alias="meta_description")


class PageCreate(PageBase):
    pass


class PageUpdate(BaseModel):
    title: str | None = None
    slug: str | None = None
    route: str | None = None
    layout: str | None = None
    status: str | None = None
    meta_title: str | None = Field(default=None, validation_alias="metaTitle")
    meta_description: str | None = Field(default=None, validation_alias="metaDescription")


class PageResponse(PageBase):
    id: uuid.UUID
    created_by: uuid.UUID | None = None
    created_at: datetime
    updated_at: datetime
    # Use validation_alias for ORM deserialization, serialization_alias for API response
    meta_title: str | None = Field(default=None, validation_alias="metaTitle", serialization_alias="meta_title")
    meta_description: str | None = Field(default=None, validation_alias="metaDescription", serialization_alias="meta_description")

    class Config:
        from_attributes = True
        populate_by_name = True


# 分页列表响应
PageListData = PaginatedData[PageResponse]
PageListResponse = ApiResponse[PageListData]

# 单个对象响应
PageOneResponse = ApiResponse[PageResponse]


class PageVersionBase(BaseModel):
    page_id: uuid.UUID
    version: int
    content: dict


class PageVersionCreate(BaseModel):
    content: dict


class PageVersionResponse(PageVersionBase):
    id: uuid.UUID

    class Config:
        from_attributes = True


PageVersionListData = PaginatedData[PageVersionResponse]
PageVersionListResponse = ApiResponse[PageVersionListData]
PageVersionOneResponse = ApiResponse[PageVersionResponse]


class PageContentData(BaseModel):
    page: PageResponse
    content: dict


PageContentResponse = ApiResponse[PageContentData]
