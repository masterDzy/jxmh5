from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.mobile_service import MobileService


class MobileServiceService:
    """移动端服务只读访问（仅保留 booking 详情用的 get_service）"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_service(self, service_id: str) -> MobileService | None:
        result = await self.db.execute(
            select(MobileService).where(
                MobileService.id == service_id,
                MobileService.parent_id != None
            )
        )
        return result.scalar_one_or_none()