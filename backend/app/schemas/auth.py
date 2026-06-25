from typing import Optional

from pydantic import BaseModel
from app.schemas import ApiResponse
from app.schemas.user import UserResponse


class RegisterRequest(BaseModel):
    phone: str
    password: str
    guest_token: Optional[str] = None


class LoginRequest(BaseModel):
    phone: str
    password: str
    guest_token: Optional[str] = None


class RefreshRequest(BaseModel):
    refresh_token: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    expires_in: int
    token_type: str = "bearer"


class AuthData(BaseModel):
    access_token: str
    refresh_token: str
    expires_in: int
    token_type: str = "bearer"
    user: UserResponse


class AuthResponse(ApiResponse[AuthData]):
    """认证响应：包含 token 和用户信息"""
    pass
