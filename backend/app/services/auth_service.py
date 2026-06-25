import logging

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User
from app.models.guest import Guest
from app.schemas.user import UserCreate
from app.utils.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    verify_refresh_token,
    decode_token,
)
from config import settings

logger = logging.getLogger(__name__)


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def _resolve_guest(self, guest_token: str | None) -> tuple[str, str] | None:
        """Resolve guest_id and nickname from guest_token. Returns (guest_id, nickname) or None."""
        if not guest_token:
            return None
        try:
            payload = decode_token(guest_token)
            if not payload:
                return None
            guest_id = payload.get("sub")
            if not guest_id:
                return None
            result = await self.db.execute(select(Guest).where(Guest.id == guest_id))
            guest = result.scalar_one_or_none()
            if not guest:
                return None
            return (str(guest.id), guest.nickname)
        except Exception:
            logger.warning("Failed to resolve guest token", exc_info=True)
            return None

    async def register_user(self, user_data: UserCreate, guest_token: str | None = None) -> User | None:
        result = await self.db.execute(
            select(User).where(User.phone == user_data.phone)
        )
        existing_user = result.scalar_one_or_none()
        if existing_user:
            return None

        user = User(
            phone=user_data.phone,
            password_hash=get_password_hash(user_data.password),
        )

        # Bind guest on registration (best-effort)
        if guest_token:
            resolved = await self._resolve_guest(guest_token)
            if resolved:
                guest_id, guest_nickname = resolved
                user.guest_id = guest_id
                user.nickname = guest_nickname

        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def bind_guest(self, user: User, guest_token: str | None) -> None:
        """Bind guest to an existing user. Best-effort: never fails."""
        if not guest_token:
            return
        # Don't overwrite existing guest binding
        if user.guest_id:
            return
        try:
            resolved = await self._resolve_guest(guest_token)
            if resolved:
                guest_id, _ = resolved
                user.guest_id = guest_id
                await self.db.commit()
                await self.db.refresh(user)
        except Exception:
            logger.warning("Failed to bind guest to user %s", user.id, exc_info=True)

    async def authenticate_user(self, phone: str, password: str) -> User | None:
        result = await self.db.execute(select(User).where(User.phone == phone))
        user = result.scalar_one_or_none()
        if not user:
            return None
        if not verify_password(password, user.password_hash):
            return None
        return user

    def create_tokens(self, user_id: str) -> dict:
        access_token = create_access_token(data={"sub": str(user_id)})
        refresh_token = create_refresh_token(data={"sub": str(user_id)})
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "expires_in": settings.access_token_expire_minutes * 60,
        }

    async def refresh_token(self, refresh_token: str) -> dict | None:
        payload = verify_refresh_token(refresh_token)
        if not payload:
            return None

        user_id = payload.get("sub")
        if not user_id:
            return None

        result = await self.db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user:
            return None

        return self.create_tokens(user_id)
