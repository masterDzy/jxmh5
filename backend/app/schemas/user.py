import uuid
from datetime import datetime
from pydantic import BaseModel


class UserBase(BaseModel):
    phone: str


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    phone: str | None = None
    password: str | None = None
    nickname: str | None = None
    avatar: str | None = None
    is_vip: bool | None = None
    vip_type: str | None = None
    vip_expire_at: datetime | None = None


class UserResponse(UserBase):
    id: uuid.UUID
    nickname: str | None = None
    avatar: str | None = None
    guest_id: uuid.UUID | None = None
    is_vip: bool
    vip_type: str | None
    vip_expire_at: datetime | None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
