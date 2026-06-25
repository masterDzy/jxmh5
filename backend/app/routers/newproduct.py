from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from database import get_db
from typing import Optional
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/api/v1/mobile/newproduct", tags=["mobile-newproduct"])


class NewProductItem(BaseModel):
    id: int
    name: str
    subtitle: str
    category: str = ""
    初级价格: float
    中级价格: Optional[float] = None
    高级价格: Optional[float] = None
    member_price: float
    货币单位: str = "CNY"


class NewProductCategory(BaseModel):
    name: str
    subtitle: str = ""
    products: list[NewProductItem]


class NewProductData(BaseModel):
    categories: list[NewProductCategory]
    total: int


class NewProductListResponse(BaseModel):
    error: bool = False
    message: str = "success"
    data: NewProductData | None = None


class NewProductItemResponse(BaseModel):
    """单条产品响应（给 booking 页用）"""
    error: bool = False
    message: str = "success"
    data: NewProductItem | None = None


@router.get("/{product_id}", response_model=NewProductItemResponse)
async def get_newproduct(
    product_id: int,
    db: AsyncSession = Depends(get_db),
):
    """移动端公开接口 - 获取单个产品详情（booking 详情用）
    从 jx_apk_newproduct 表按 id 查询。
    """
    try:
        rows = await db.execute(
            text("""
                SELECT id, 产品分类, 产品名称, 产品副标题, 初级价格, 会员价, 分类副标题, 中级价格, 高级价格, 货币单位
                FROM jx_apk_newproduct
                WHERE id = :pid
                LIMIT 1
            """),
            {"pid": product_id},
        )
        row = rows.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Product not found")

        return NewProductItemResponse(
            error=False,
            message="success",
            data=NewProductItem(
                id=row[0],
                name=row[2],
                subtitle=row[3] or "",
                category=row[1] or "",
                初级价格=float(row[4]) if row[4] else 0,
                中级价格=float(row[7]) if row[7] is not None else None,
                高级价格=float(row[8]) if row[8] is not None else None,
                member_price=float(row[5]) if row[5] else 0,
                货币单位=row[9] or "CNY",
            ),
        )
    except HTTPException:
        raise
    except Exception as e:
        return NewProductItemResponse(
            error=True,
            message=str(e),
            data=None,
        )


@router.get("", response_model=NewProductListResponse)
async def list_newproducts(
    category: Optional[str] = Query(None, description="按产品分类筛选"),
    db: AsyncSession = Depends(get_db),
):
    """移动端公开接口 - 获取产品列表（按分类聚合，services 页用）"""
    try:
        if category:
            rows = await db.execute(
                text("""
                    SELECT id, 产品分类, 产品名称, 产品副标题, 初级价格, 会员价, 分类副标题, 中级价格, 高级价格, 货币单位
                    FROM jx_apk_newproduct
                    WHERE 产品分类 = :cat
                    ORDER BY id
                """),
                {"cat": category},
            )
        else:
            rows = await db.execute(
                text("""
                    SELECT id, 产品分类, 产品名称, 产品副标题, 初级价格, 会员价, 分类副标题, 中级价格, 高级价格, 货币单位
                    FROM jx_apk_newproduct
                    ORDER BY 产品分类, id
                """)
            )

        items = rows.fetchall()

        categories_map: dict[str, tuple[str, list[NewProductItem]]] = {}
        for row in items:
            cat_name = row[1]
            cat_subtitle = row[6] or ""
            product = NewProductItem(
                id=row[0],
                name=row[2],
                subtitle=row[3] or "",
                category=row[1] or "",
                初级价格=float(row[4]) if row[4] else 0,
                中级价格=float(row[7]) if row[7] is not None else None,
                高级价格=float(row[8]) if row[8] is not None else None,
                member_price=float(row[5]) if row[5] else 0,
                货币单位=row[9] or "CNY",
            )
            if cat_name not in categories_map:
                categories_map[cat_name] = (cat_subtitle, [])
            categories_map[cat_name][1].append(product)

        categories = [
            NewProductCategory(name=name, subtitle=subtitle, products=products)
            for name, (subtitle, products) in categories_map.items()
        ]

        return NewProductListResponse(
            error=False,
            message="success",
            data=NewProductData(categories=categories, total=len(items)),
        )
    except Exception as e:
        return NewProductListResponse(
            error=True,
            message=str(e),
            data=None,
        )
