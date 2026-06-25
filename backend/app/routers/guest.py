import random
from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_db
from app.models.guest import Guest
from app.schemas.guest import GuestCreate, GuestResponse, GuestTokenResponse, GuestTokenData
from app.utils.security import create_access_token, verify_access_token

router = APIRouter(prefix="/api/v1/guest", tags=["guest"])

# 访客随机昵称形容词词库
_GUEST_ADJECTIVES = [
    "清风", "明月", "青云", "碧波", "星辰", "晨曦", "流云",
    "飞花", "凝霜", "听雨",
]


def _random_nickname() -> str:
    """生成随机访客昵称：访客_ + 随机形容词"""
    return "访客_" + random.choice(_GUEST_ADJECTIVES)


@router.post("/create", response_model=GuestTokenResponse)
async def create_guest(
    body: GuestCreate,
    db: AsyncSession = Depends(get_db),
):
    """创建访客账号，返回访客信息和 JWT token"""
    # 如果提供了 device_fingerprint 且已存在，直接返回已有访客 + 新 token
    if body.device_fingerprint:
        result = await db.execute(
            select(Guest).where(Guest.device_fingerprint == body.device_fingerprint)
        )
        existing = result.scalar_one_or_none()
        if existing:
            token = create_access_token(
                data={"sub": str(existing.id), "type": "guest"},
                expires_delta=timedelta(days=365),
            )
            return GuestTokenResponse(
                error=False,
                message="success",
                data=GuestTokenData(
                    guest=GuestResponse.model_validate(existing),
                    token=token,
                ),
            )

    guest = Guest(
        nickname=_random_nickname(),
        device_fingerprint=body.device_fingerprint or "",
        ip=body.ip,
        user_agent=body.user_agent,
        source=body.source,
    )
    db.add(guest)
    await db.commit()
    await db.refresh(guest)

    token = create_access_token(
        data={"sub": str(guest.id), "type": "guest"},
        expires_delta=timedelta(days=365),
    )

    return GuestTokenResponse(
        error=False,
        message="success",
        data=GuestTokenData(
            guest=GuestResponse.model_validate(guest),
            token=token,
        ),
    )


@router.get("/me", response_model=GuestResponse)
async def get_guest_me(
    authorization: str = Header(None),
    db: AsyncSession = Depends(get_db),
):
    """验证访客 JWT token，返回访客信息"""
    if not authorization:
        raise HTTPException(status_code=401, detail="未提供认证令牌")

    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=401, detail="无效的认证格式")

    token = parts[1]
    payload = verify_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="令牌无效或已过期")

    guest_id = payload.get("sub")
    if not guest_id:
        raise HTTPException(status_code=401, detail="令牌解析失败")

    result = await db.execute(select(Guest).where(Guest.id == guest_id))
    guest = result.scalar_one_or_none()
    if guest is None:
        raise HTTPException(status_code=401, detail="访客不存在")

    return GuestResponse.model_validate(guest)
