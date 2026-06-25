"""
幸运商城 Service
"""
from typing import Optional
from datetime import datetime
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_, delete
from sqlalchemy.orm import selectinload
from app.models.shop_category import ShopCategory
from app.models.shop_product import ShopProduct
from app.models.shop_address import ShopAddress
from app.models.shop_cart import ShopCartItem
from app.models.shop_order import ShopOrder, ShopOrderItem
from app.utils.model_utils import update_if_not_none


class ShopService:
    def __init__(self, db: AsyncSession):
        self.db = db

    # ============ 分类 ============

    async def get_categories(
        self,
        is_active: Optional[bool] = True,
    ) -> list[ShopCategory]:
        conditions = []
        if is_active is not None:
            conditions.append(ShopCategory.is_active == is_active)

        query = select(ShopCategory)
        if conditions:
            query = query.where(*conditions)
        query = query.order_by(ShopCategory.sort_order.desc(), ShopCategory.created_at.desc())

        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_category(self, category_id: str) -> Optional[ShopCategory]:
        result = await self.db.execute(
            select(ShopCategory).where(ShopCategory.id == category_id)
        )
        return result.scalar_one_or_none()

    async def create_category(
        self,
        id: str,
        name: str,
        cover_image: Optional[str] = None,
        description: Optional[str] = None,
        sort_order: int = 0,
    ) -> ShopCategory:
        category = ShopCategory(
            id=id,
            name=name,
            cover_image=cover_image,
            description=description,
            sort_order=sort_order,
        )
        self.db.add(category)
        await self.db.commit()
        await self.db.refresh(category)
        return category

    # ============ 商品 ============

    async def get_products(
        self,
        page: int = 1,
        page_size: int = 20,
        category_id: Optional[str] = None,
        is_active: Optional[bool] = True,
        is_hot: Optional[bool] = None,
        is_recommend: Optional[bool] = None,
        search: Optional[str] = None,
    ) -> tuple[list[ShopProduct], int]:
        conditions = []
        if category_id is not None:
            conditions.append(ShopProduct.category_id == category_id)
        if is_active is not None:
            conditions.append(ShopProduct.is_active == is_active)
        if is_hot is not None:
            conditions.append(ShopProduct.is_hot == is_hot)
        if is_recommend is not None:
            conditions.append(ShopProduct.is_recommend == is_recommend)
        if search:
            conditions.append(
                or_(
                    ShopProduct.name.ilike(f"%{search}%"),
                    ShopProduct.description.ilike(f"%{search}%"),
                )
            )

        count_query = select(func.count(ShopProduct.id))
        if conditions:
            count_query = count_query.where(*conditions)
        count_result = await self.db.execute(count_query)
        total = count_result.scalar() or 0

        offset = (page - 1) * page_size
        result = await self.db.execute(
            select(ShopProduct)
            .options(selectinload(ShopProduct.category))
            .where(*conditions)
            .order_by(ShopProduct.sort_order.desc(), ShopProduct.created_at.desc())
            .offset(offset)
            .limit(page_size)
        )
        return list(result.scalars().all()), total

    async def get_product(self, product_id: str) -> Optional[ShopProduct]:
        result = await self.db.execute(
            select(ShopProduct)
            .options(selectinload(ShopProduct.category))
            .where(ShopProduct.id == product_id)
        )
        return result.scalar_one_or_none()

    async def create_product(
        self,
        id: str,
        name: str,
        category_id: str,
        price: float,
        cover_image: Optional[str] = None,
        images: Optional[list] = None,
        original_price: Optional[float] = None,
        stock: int = 0,
        is_virtual: bool = False,
        description: Optional[str] = None,
        content: Optional[str] = None,
        is_hot: bool = False,
        is_recommend: bool = False,
        sort_order: int = 0,
    ) -> ShopProduct:
        product = ShopProduct(
            id=id,
            name=name,
            category_id=category_id,
            cover_image=cover_image,
            images=images,
            price=price,
            original_price=original_price,
            stock=stock,
            is_virtual=is_virtual,
            description=description,
            content=content,
            is_hot=is_hot,
            is_recommend=is_recommend,
            sort_order=sort_order,
        )
        self.db.add(product)
        await self.db.commit()
        await self.db.refresh(product)
        return product

    async def update_product_stock(self, product_id: str, quantity_change: int) -> bool:
        product = await self.get_product(product_id)
        if not product:
            return False
        product.stock = max(0, product.stock + quantity_change)
        await self.db.commit()
        return True

    # ============ 收货地址 ============

    async def get_addresses(
        self,
        user_id: str,
        is_active: Optional[bool] = True,
    ) -> list[ShopAddress]:
        conditions = [ShopAddress.user_id == user_id]
        if is_active is not None:
            conditions.append(ShopAddress.is_active == is_active)

        result = await self.db.execute(
            select(ShopAddress)
            .where(*conditions)
            .order_by(ShopAddress.is_default.desc(), ShopAddress.created_at.desc())
        )
        return list(result.scalars().all())

    async def get_address(self, address_id: str, user_id: str) -> Optional[ShopAddress]:
        result = await self.db.execute(
            select(ShopAddress).where(
                ShopAddress.id == address_id,
                ShopAddress.user_id == user_id
            )
        )
        return result.scalar_one_or_none()

    async def get_default_address(self, user_id: str) -> Optional[ShopAddress]:
        result = await self.db.execute(
            select(ShopAddress).where(
                ShopAddress.user_id == user_id,
                ShopAddress.is_default == True,
                ShopAddress.is_active == True
            )
        )
        return result.scalar_one_or_none()

    async def create_address(
        self,
        user_id: str,
        receiver_name: str,
        phone: str,
        province: str,
        city: str,
        address: str,
        district: Optional[str] = None,
        is_default: bool = False,
    ) -> ShopAddress:
        # 如果设为默认，先取消其他默认
        if is_default:
            default_result = await self.db.execute(
                select(ShopAddress).where(
                    ShopAddress.user_id == user_id,
                    ShopAddress.is_default == True
                )
            )
            for addr in default_result.scalars().all():
                addr.is_default = False

        address_obj = ShopAddress(
            user_id=user_id,
            receiver_name=receiver_name,
            phone=phone,
            province=province,
            city=city,
            district=district,
            address=address,
            is_default=is_default,
        )
        self.db.add(address_obj)
        await self.db.commit()
        await self.db.refresh(address_obj)
        return address_obj

    async def update_address(
        self,
        address_id: str,
        user_id: str,
        receiver_name: Optional[str] = None,
        phone: Optional[str] = None,
        province: Optional[str] = None,
        city: Optional[str] = None,
        district: Optional[str] = None,
        address: Optional[str] = None,
        is_default: Optional[bool] = None,
    ) -> Optional[ShopAddress]:
        address_obj = await self.get_address(address_id, user_id)
        if not address_obj:
            return None

        if is_default:
            default_result = await self.db.execute(
                select(ShopAddress).where(
                    ShopAddress.user_id == user_id,
                    ShopAddress.is_default == True,
                    ShopAddress.id != address_id
                )
            )
            for addr in default_result.scalars().all():
                addr.is_default = False

        update_if_not_none(
            address_obj,
            receiver_name=receiver_name,
            phone=phone,
            province=province,
            city=city,
            district=district,
            address=address,
            is_default=is_default,
        )

        await self.db.commit()
        await self.db.refresh(address_obj)
        return address_obj

    async def delete_address(self, address_id: str, user_id: str) -> bool:
        address_obj = await self.get_address(address_id, user_id)
        if not address_obj:
            return False
        address_obj.is_active = False
        await self.db.commit()
        return True

    # ============ 购物车 ============

    async def get_cart_items(self, user_id: str) -> list[ShopCartItem]:
        result = await self.db.execute(
            select(ShopCartItem)
            .options(selectinload(ShopCartItem.product).selectinload(ShopProduct.category))
            .where(ShopCartItem.user_id == user_id)
            .order_by(ShopCartItem.created_at.desc())
        )
        return list(result.scalars().all())

    async def add_to_cart(
        self,
        user_id: str,
        product_id: str,
        quantity: int = 1,
    ) -> Optional[ShopCartItem]:
        # 检查商品是否存在
        product = await self.get_product(product_id)
        if not product:
            return None

        # 检查购物车是否已有该商品
        result = await self.db.execute(
            select(ShopCartItem).where(
                ShopCartItem.user_id == user_id,
                ShopCartItem.product_id == product_id
            )
        )
        existing_item = result.scalar_one_or_none()

        if existing_item:
            existing_item.quantity += quantity
            await self.db.commit()
            await self.db.refresh(existing_item)
            # 预加载 product
            result = await self.db.execute(
                select(ShopCartItem)
                .options(selectinload(ShopCartItem.product))
                .where(ShopCartItem.id == existing_item.id)
            )
            return result.scalar_one()

        # 新增
        cart_item = ShopCartItem(
            user_id=user_id,
            product_id=product_id,
            quantity=quantity,
        )
        self.db.add(cart_item)
        await self.db.commit()
        await self.db.refresh(cart_item)
        # 预加载 product
        result = await self.db.execute(
            select(ShopCartItem)
            .options(selectinload(ShopCartItem.product))
            .where(ShopCartItem.id == cart_item.id)
        )
        return result.scalar_one()

    async def update_cart_item(
        self,
        cart_item_id: str,
        user_id: str,
        quantity: int,
    ) -> Optional[ShopCartItem]:
        result = await self.db.execute(
            select(ShopCartItem)
            .options(selectinload(ShopCartItem.product))
            .where(
                ShopCartItem.id == cart_item_id,
                ShopCartItem.user_id == user_id
            )
        )
        cart_item = result.scalar_one_or_none()
        if not cart_item:
            return None

        cart_item.quantity = quantity
        await self.db.commit()
        await self.db.refresh(cart_item)
        return cart_item

    async def remove_from_cart(self, cart_item_id: str, user_id: str) -> bool:
        result = await self.db.execute(
            select(ShopCartItem).where(
                ShopCartItem.id == cart_item_id,
                ShopCartItem.user_id == user_id
            )
        )
        cart_item = result.scalar_one_or_none()
        if not cart_item:
            return False

        await self.db.delete(cart_item)
        await self.db.commit()
        return True

    async def clear_cart(self, user_id: str) -> bool:
        await self.db.execute(
            delete(ShopCartItem).where(ShopCartItem.user_id == user_id)
        )
        await self.db.commit()
        return True

    # ============ 订单 ============

    async def get_orders(
        self,
        user_id: str,
        status: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[list[ShopOrder], int]:
        conditions = [ShopOrder.user_id == user_id]
        if status:
            conditions.append(ShopOrder.status == status)

        count_query = select(func.count(ShopOrder.id))
        if conditions:
            count_query = count_query.where(*conditions)
        count_result = await self.db.execute(count_query)
        total = count_result.scalar() or 0

        offset = (page - 1) * page_size
        result = await self.db.execute(
            select(ShopOrder)
            .options(selectinload(ShopOrder.items).selectinload(ShopOrderItem.product))
            .where(*conditions)
            .order_by(ShopOrder.created_at.desc())
            .offset(offset)
            .limit(page_size)
        )
        return list(result.scalars().all()), total

    async def get_order(self, order_id: str, user_id: str) -> Optional[ShopOrder]:
        result = await self.db.execute(
            select(ShopOrder)
            .options(selectinload(ShopOrder.items).selectinload(ShopOrderItem.product))
            .where(
                ShopOrder.id == order_id,
                ShopOrder.user_id == user_id
            )
        )
        return result.scalar_one_or_none()

    async def create_order(
        self,
        user_id: str,
        items: list[dict],
        address_id: Optional[str] = None,
        remark: Optional[str] = None,
    ) -> Optional[ShopOrder]:
        # 获取收货地址
        address = None
        if address_id:
            address = await self.get_address(address_id, user_id)

        # 计算订单总额
        total_amount = 0.0
        order_items = []
        for item in items:
            product = await self.get_product(item["product_id"])
            if not product:
                return None
            quantity = item.get("quantity", 1)
            subtotal = product.price * quantity
            total_amount += subtotal
            order_items.append({
                "product_id": product.id,
                "product_name": product.name,
                "cover_image": product.cover_image,
                "price": product.price,
                "quantity": quantity,
                "subtotal": subtotal,
            })
            # 扣减库存
            await self.update_product_stock(product.id, -quantity)

        # 生成订单号
        order_no = f"JX{datetime.now().strftime('%Y%m%d%H%M%S')}{uuid.uuid4().hex[:8].upper()}"

        # 创建订单
        order = ShopOrder(
            order_no=order_no,
            user_id=user_id,
            total_amount=total_amount,
            status="pending",
            address_id=uuid.UUID(address_id) if address_id else None,
            shipping_name=address.receiver_name if address else None,
            shipping_phone=address.phone if address else None,
            shipping_province=address.province if address else None,
            shipping_city=address.city if address else None,
            shipping_district=address.district if address else None,
            shipping_address=address.address if address else None,
            remark=remark,
        )
        self.db.add(order)
        await self.db.flush()

        # 创建订单项
        for item_data in order_items:
            order_item = ShopOrderItem(
                order_id=order.id,
                **item_data
            )
            self.db.add(order_item)

        await self.db.commit()
        await self.db.refresh(order)
        return order

    async def update_order_status(
        self,
        order_id: str,
        status: str,
        user_id: Optional[str] = None,
    ) -> Optional[ShopOrder]:
        conditions = [ShopOrder.id == order_id]
        if user_id:
            conditions.append(ShopOrder.user_id == user_id)

        result = await self.db.execute(
            select(ShopOrder).where(*conditions)
        )
        order = result.scalar_one_or_none()
        if not order:
            return None

        order.status = status
        if status == "paid":
            order.paid_at = datetime.now().isoformat()

        await self.db.commit()
        await self.db.refresh(order)
        return order

    async def cancel_order(self, order_id: str, user_id: str) -> bool:
        order = await self.get_order(order_id, user_id)
        if not order or order.status != "pending":
            return False

        # 恢复库存
        for item in order.items:
            await self.update_product_stock(item.product_id, item.quantity)

        order.status = "cancelled"
        await self.db.commit()
        return True