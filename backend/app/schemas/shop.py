"""
幸运商城 Schema 定义
"""
from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, field_serializer
from app.schemas import ApiResponse, PaginatedData


# ============ 商城分类 ============

class ShopCategoryBase(BaseModel):
    id: str
    name: str
    cover_image: Optional[str] = None
    description: Optional[str] = None
    sort_order: int = 0
    is_active: bool = True


class ShopCategoryResponse(ShopCategoryBase):
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


ShopCategoryListData = PaginatedData[ShopCategoryResponse]
ShopCategoryListResponse = ApiResponse[ShopCategoryListData]
ShopCategoryOneResponse = ApiResponse[ShopCategoryResponse]


# ============ 商城商品 ============

class ShopProductBase(BaseModel):
    name: str
    category_id: str
    cover_image: Optional[str] = None
    images: Optional[list[str]] = None
    price: float = 0
    original_price: Optional[float] = None
    stock: int = 0
    sold_count: int = 0
    is_virtual: bool = False
    is_active: bool = True
    is_hot: bool = False
    is_recommend: bool = False
    description: Optional[str] = None
    content: Optional[str] = None
    sort_order: int = 0


class ShopProductCreate(ShopProductBase):
    id: str


class ShopProductUpdate(BaseModel):
    name: Optional[str] = None
    category_id: Optional[str] = None
    cover_image: Optional[str] = None
    images: Optional[list[str]] = None
    price: Optional[float] = None
    original_price: Optional[float] = None
    stock: Optional[int] = None
    sold_count: Optional[int] = None
    is_virtual: Optional[bool] = None
    is_active: Optional[bool] = None
    is_hot: Optional[bool] = None
    is_recommend: Optional[bool] = None
    description: Optional[str] = None
    content: Optional[str] = None
    sort_order: Optional[int] = None


class ShopProductResponse(ShopProductBase):
    id: str
    category_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


ShopProductListData = PaginatedData[ShopProductResponse]
ShopProductListResponse = ApiResponse[ShopProductListData]
ShopProductOneResponse = ApiResponse[ShopProductResponse]


# ============ 收货地址 ============

class ShopAddressBase(BaseModel):
    receiver_name: str
    phone: str
    province: str
    city: str
    district: Optional[str] = None
    address: str
    is_default: bool = False


class ShopAddressCreate(ShopAddressBase):
    pass


class ShopAddressUpdate(BaseModel):
    receiver_name: Optional[str] = None
    phone: Optional[str] = None
    province: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None
    address: Optional[str] = None
    is_default: Optional[bool] = None


class ShopAddressResponse(ShopAddressBase):
    id: str
    user_id: str
    is_active: bool = True
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


ShopAddressListData = PaginatedData[ShopAddressResponse]
ShopAddressListResponse = ApiResponse[ShopAddressListData]
ShopAddressOneResponse = ApiResponse[ShopAddressResponse]


# ============ 购物车 ============

class ShopCartItemResponse(BaseModel):
    id: UUID
    user_id: str
    product_id: str
    quantity: int
    product: Optional[ShopProductResponse] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

    @field_serializer("id")
    def _ser_id(self, v: UUID) -> str:
        """DB UUID → 响应字符串"""
        return str(v)


class ShopCartItemCreate(BaseModel):
    product_id: str
    quantity: int = 1


class ShopCartItemUpdate(BaseModel):
    quantity: int


class ShopCartResponse(BaseModel):
    items: list[ShopCartItemResponse]
    total: int


ShopCartData = ApiResponse[ShopCartResponse]


# ============ 订单 ============

class ShopOrderItemResponse(BaseModel):
    id: str
    product_id: str
    product_name: str
    cover_image: Optional[str] = None
    price: float
    quantity: int
    subtotal: float

    class Config:
        from_attributes = True


class ShopOrderResponse(BaseModel):
    id: str
    order_no: str
    user_id: str
    status: str
    total_amount: float
    discount_amount: float = 0
    items: list[ShopOrderItemResponse]
    shipping_name: Optional[str] = None
    shipping_phone: Optional[str] = None
    shipping_province: Optional[str] = None
    shipping_city: Optional[str] = None
    shipping_district: Optional[str] = None
    shipping_address: Optional[str] = None
    remark: Optional[str] = None
    paid_at: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ShopOrderCreate(BaseModel):
    items: list[ShopCartItemCreate]
    address_id: Optional[str] = None
    remark: Optional[str] = None


ShopOrderListData = PaginatedData[ShopOrderResponse]
ShopOrderListResponse = ApiResponse[ShopOrderListData]
ShopOrderOneResponse = ApiResponse[ShopOrderResponse]
ShopOrderCreateResponse = ApiResponse[dict]


# ============ 订单状态枚举 ============

class OrderStatus(str):
    PENDING = "pending"      # 待支付
    PAID = "paid"            # 已支付
    SHIPPED = "shipped"      # 已发货
    COMPLETED = "completed"  # 已完成
    CANCELLED = "cancelled"  # 已取消