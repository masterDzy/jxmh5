from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db_mobile_services as get_db
from app.schemas.service import (
    ServiceOneResponse,
    ServiceResponse,
)
from app.services.mobile_service_service import MobileServiceService

router = APIRouter(prefix="/api/v1/mobile/services", tags=["mobile-services"])


@router.get("/{service_id}", response_model=ServiceOneResponse)
async def get_service(
    service_id: str,
    db: AsyncSession = Depends(get_db),
):
    """移动端公开接口 - 获取单个服务详情（booking 详情用）"""
    service = MobileServiceService(db)
    svc = await service.get_service(service_id)
    if not svc:
        raise HTTPException(status_code=404, detail="Service not found")
    return ServiceOneResponse(
        error=False,
        message="success",
        data=ServiceResponse.model_validate(svc),
    )
