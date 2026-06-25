"""
幸运商城 API 路由
"""
from fastapi import APIRouter, Query, Depends, Body
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from app.services.shop_service import ShopService
from app.schemas import PaginatedData
from app.schemas.shop import (
    ShopCategoryResponse,
    ShopProductResponse,
    ShopAddressResponse,
    ShopAddressCreate,
    ShopCartItemResponse,
    ShopOrderResponse,
    ShopOrderCreate,
)

router = APIRouter(prefix="/api/v1/shop", tags=["shop"])


def get_shop_service(db: AsyncSession = Depends(get_db)) -> ShopService:
    return ShopService(db)


def paginate(items: list, total: int, page: int, page_size: int) -> PaginatedData:
    total_pages = (total + page_size - 1) // page_size if total > 0 else 1
    return PaginatedData(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


# ============ 分类 API ============

@router.get("/categories")
async def get_categories(
    service: ShopService = Depends(get_shop_service)
):
    """获取商城分类列表"""
    categories = await service.get_categories(is_active=True)
    category_list = [ShopCategoryResponse.model_validate(c) for c in categories]
    return {"error": False, "message": "success", "data": paginate(category_list, len(category_list), 1, len(category_list))}


@router.get("/categories/{category_id}")
async def get_category(
    category_id: str,
    service: ShopService = Depends(get_shop_service)
):
    """获取单个分类"""
    category = await service.get_category(category_id)
    if not category:
        return {"error": True, "message": "Category not found", "data": None}
    return {"error": False, "message": "success", "data": ShopCategoryResponse.model_validate(category)}


# ============ 商品 API ============

@router.get("/products")
async def get_products(
    category: Optional[str] = Query(None, description="分类ID"),
    is_hot: Optional[bool] = Query(None, description="是否热门"),
    is_recommend: Optional[bool] = Query(None, description="是否推荐"),
    search: Optional[str] = Query(None, description="搜索关键词"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    service: ShopService = Depends(get_shop_service)
):
    """获取商品列表"""
    products, total = await service.get_products(
        page=page,
        page_size=page_size,
        category_id=category,
        is_hot=is_hot,
        is_recommend=is_recommend,
        search=search,
    )
    product_list = []
    for p in products:
        product_list.append(
            ShopProductResponse(
                id=str(p.id),
                name=p.name,
                category_id=p.category_id,
                cover_image=p.cover_image,
                images=p.images,
                price=p.price,
                original_price=p.original_price,
                stock=p.stock,
                sold_count=p.sold_count,
                is_virtual=p.is_virtual,
                is_active=p.is_active,
                is_hot=p.is_hot,
                is_recommend=p.is_recommend,
                description=p.description,
                content=p.content,
                sort_order=p.sort_order,
                category_name=p.category.name if p.category else None,
                created_at=p.created_at,
                updated_at=p.updated_at,
            )
        )
    return {"error": False, "message": "success", "data": paginate(product_list, total, page, page_size)}


@router.get("/products/{product_id}")
async def get_product(
    product_id: str,
    service: ShopService = Depends(get_shop_service)
):
    """获取单个商品详情"""
    product = await service.get_product(product_id)
    if not product:
        return {"error": True, "message": "Product not found", "data": None}
    return {"error": False, "message": "success", "data": ShopProductResponse(
        id=str(product.id),
        name=product.name,
        category_id=product.category_id,
        cover_image=product.cover_image,
        images=product.images,
        price=product.price,
        original_price=product.original_price,
        stock=product.stock,
        sold_count=product.sold_count,
        is_virtual=product.is_virtual,
        is_active=product.is_active,
        is_hot=product.is_hot,
        is_recommend=product.is_recommend,
        description=product.description,
        content=product.content,
        sort_order=product.sort_order,
        category_name=product.category.name if product.category else None,
        created_at=product.created_at,
        updated_at=product.updated_at,
    )}


# ============ 收货地址 API ============

@router.get("/addresses")
async def get_addresses(
    user_id: str = Query(..., description="用户ID"),
    service: ShopService = Depends(get_shop_service)
):
    """获取用户收货地址列表"""
    addresses = await service.get_addresses(user_id=user_id)
    addr_list = [ShopAddressResponse.model_validate(a) for a in addresses]
    return {"error": False, "message": "success", "data": paginate(addr_list, len(addr_list), 1, len(addr_list))}


@router.get("/addresses/{address_id}")
async def get_address(
    address_id: str,
    user_id: str = Query(..., description="用户ID"),
    service: ShopService = Depends(get_shop_service)
):
    """获取单个收货地址"""
    address = await service.get_address(address_id, user_id)
    if not address:
        return {"error": True, "message": "Address not found", "data": None}
    return {"error": False, "message": "success", "data": ShopAddressResponse.model_validate(address)}


@router.post("/addresses")
async def create_address(
    user_id: str = Query(...),
    data: ShopAddressCreate = Body(...),
    service: ShopService = Depends(get_shop_service)
):
    """创建收货地址"""
    address = await service.create_address(
        user_id=user_id,
        receiver_name=data.receiver_name,
        phone=data.phone,
        province=data.province,
        city=data.city,
        district=data.district,
        address=data.address,
        is_default=data.is_default,
    )
    return {"error": False, "message": "success", "data": ShopAddressResponse.model_validate(address)}


@router.put("/addresses/{address_id}")
async def update_address(
    address_id: str,
    user_id: str = Query(...),
    data: ShopAddressCreate = Body(...),
    service: ShopService = Depends(get_shop_service)
):
    """更新收货地址"""
    address = await service.update_address(
        address_id=address_id,
        user_id=user_id,
        receiver_name=data.receiver_name,
        phone=data.phone,
        province=data.province,
        city=data.city,
        district=data.district,
        address=data.address,
        is_default=data.is_default,
    )
    if not address:
        return {"error": True, "message": "Address not found", "data": None}
    return {"error": False, "message": "success", "data": ShopAddressResponse.model_validate(address)}


@router.delete("/addresses/{address_id}")
async def delete_address(
    address_id: str,
    user_id: str = Query(...),
    service: ShopService = Depends(get_shop_service)
):
    """删除收货地址"""
    success = await service.delete_address(address_id, user_id)
    if not success:
        return {"error": True, "message": "Address not found", "data": None}
    return {"error": False, "message": "success", "data": None}


# ============ 购物车 API ============

@router.get("/cart")
async def get_cart(
    user_id: str = Query(..., description="用户ID"),
    service: ShopService = Depends(get_shop_service)
):
    """获取购物车"""
    items = await service.get_cart_items(user_id)
    item_list = []
    cart_total = 0.0
    for item in items:
        # price 字段是 Numeric/Decimal，强转 float 避免 Decimal * int 混算
        product_price = float(item.product.price) if item.product else 0.0
        cart_total += product_price * item.quantity
        item_list.append(ShopCartItemResponse.model_validate(item))
    return {"error": False, "message": "success", "data": {"items": item_list, "total": cart_total}}


@router.post("/cart")
async def add_to_cart(
    user_id: str = Query(...),
    product_id: str = Query(...),
    quantity: int = Query(1, ge=1),
    service: ShopService = Depends(get_shop_service)
):
    """添加商品到购物车"""
    item = await service.add_to_cart(user_id, product_id, quantity)
    if not item:
        return {"error": True, "message": "Product not found", "data": None}
    return {"error": False, "message": "success", "data": ShopCartItemResponse.model_validate(item)}


@router.put("/cart/{cart_item_id}")
async def update_cart_item(
    cart_item_id: str,
    user_id: str = Query(...),
    quantity: int = Query(..., ge=1),
    service: ShopService = Depends(get_shop_service)
):
    """更新购物车商品数量"""
    item = await service.update_cart_item(cart_item_id, user_id, quantity)
    if not item:
        return {"error": True, "message": "Cart item not found", "data": None}
    return {"error": False, "message": "success", "data": ShopCartItemResponse.model_validate(item)}


@router.delete("/cart/{cart_item_id}")
async def remove_from_cart(
    cart_item_id: str,
    user_id: str = Query(...),
    service: ShopService = Depends(get_shop_service)
):
    """从购物车移除商品"""
    success = await service.remove_from_cart(cart_item_id, user_id)
    if not success:
        return {"error": True, "message": "Cart item not found", "data": None}
    return {"error": False, "message": "success", "data": None}


@router.delete("/cart")
async def clear_cart(
    user_id: str = Query(...),
    service: ShopService = Depends(get_shop_service)
):
    """清空购物车"""
    await service.clear_cart(user_id)
    return {"error": False, "message": "success", "data": None}


# ============ 订单 API ============

@router.get("/orders")
async def get_orders(
    user_id: str = Query(..., description="用户ID"),
    status: Optional[str] = Query(None, description="订单状态"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    service: ShopService = Depends(get_shop_service)
):
    """获取用户订单列表"""
    orders, total = await service.get_orders(
        user_id=user_id,
        status=status,
        page=page,
        page_size=page_size,
    )
    order_list = [ShopOrderResponse.model_validate(o) for o in orders]
    return {"error": False, "message": "success", "data": paginate(order_list, total, page, page_size)}


@router.get("/orders/{order_id}")
async def get_order(
    order_id: str,
    user_id: str = Query(..., description="用户ID"),
    service: ShopService = Depends(get_shop_service)
):
    """获取订单详情"""
    order = await service.get_order(order_id, user_id)
    if not order:
        return {"error": True, "message": "Order not found", "data": None}
    return {"error": False, "message": "success", "data": ShopOrderResponse.model_validate(order)}


@router.post("/orders")
async def create_order(
    user_id: str = Query(...),
    data: ShopOrderCreate = Body(...),
    service: ShopService = Depends(get_shop_service)
):
    """创建订单"""
    items = [{"product_id": item.product_id, "quantity": item.quantity} for item in data.items]
    order = await service.create_order(
        user_id=user_id,
        items=items,
        address_id=data.address_id,
        remark=data.remark,
    )
    if not order:
        return {"error": True, "message": "Product not found or invalid", "data": None}
    return {"error": False, "message": "success", "data": ShopOrderResponse.model_validate(order)}


@router.put("/orders/{order_id}/cancel")
async def cancel_order(
    order_id: str,
    user_id: str = Query(...),
    service: ShopService = Depends(get_shop_service)
):
    """取消订单"""
    success = await service.cancel_order(order_id, user_id)
    if not success:
        return {"error": True, "message": "Order not found or cannot be cancelled", "data": None}
    return {"error": False, "message": "success", "data": None}


@router.put("/orders/{order_id}/status")
async def update_order_status(
    order_id: str,
    status: str = Query(..., description="新状态"),
    user_id: Optional[str] = Query(None, description="用户ID（可选）"),
    service: ShopService = Depends(get_shop_service)
):
    """更新订单状态（管理员/支付回调）"""
    order = await service.update_order_status(order_id, status, user_id)
    if not order:
        return {"error": True, "message": "Order not found", "data": None}
    return {"error": False, "message": "success", "data": ShopOrderResponse.model_validate(order)}