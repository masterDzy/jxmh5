import uuid
from datetime import datetime
from pydantic import BaseModel
from app.schemas import ApiResponse


class GuestCreate(BaseModel):
    device_fingerprint: str | None = None
    ip: str | None = None
    user_agent: str | None = None
    source: str | None = None


class GuestResponse(BaseModel):
    id: uuid.UUID
    nickname: str
    device_fingerprint: str
    ip: str | None
    user_agent: str | None
    source: str | None
    created_at: datetime

    class Config:
        from_attributes = True


class GuestTokenData(BaseModel):
    guest: GuestResponse
    token: str

class GuestTokenResponse(ApiResponse[GuestTokenData]):
    pass
