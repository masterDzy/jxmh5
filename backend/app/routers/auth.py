import json
import logging
import random
import time
import uuid
from fastapi import APIRouter, Depends, Request, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db
from config import settings

logger = logging.getLogger(__name__)
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    RefreshRequest,
    AuthResponse,
    AuthData,
)
from app.schemas.user import UserResponse
from app.services.auth_service import AuthService
from app.utils.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])

# P0-4: cookies 必须在生产环境 HTTPS-only,避免 token 中间人窃取
# 通过 ENV=production 切换;开发默认 secure=False 便于 curl/http 测试
IS_PRODUCTION = settings.env_name == "production"
COOKIE_SECURE = IS_PRODUCTION
COOKIE_SAMESITE = "none" if IS_PRODUCTION else "lax"  # secure=True 必须 samesite=none


@router.post("/register", response_model=AuthResponse)
async def register(request: RegisterRequest, response: Response, db: AsyncSession = Depends(get_db)):
    service = AuthService(db)
    user = await service.register_user(request, guest_token=request.guest_token)
    if not user:
        return AuthResponse(
            error=True,
            message="Phone already exists",
            data=None,
        )
    tokens = service.create_tokens(user.id)
    # 设置 cookie 供 middleware 使用
    # httponly cookie 用于 API 请求
    response.set_cookie(
        key="auth_access_token",
        value=tokens["access_token"],
        httponly=True,
        secure=COOKIE_SECURE,
        samesite=COOKIE_SAMESITE,
        max_age=tokens["expires_in"],
    )
    response.set_cookie(
        key="auth_refresh_token",
        value=tokens["refresh_token"],
        httponly=True,
        secure=COOKIE_SECURE,
        samesite=COOKIE_SAMESITE,
        max_age=7 * 24 * 3600,  # 7 天
    )
    # 非 httponly cookie 用于前端 JavaScript 读取 (localStorage 同步)
    response.set_cookie(
        key="auth_access_token_js",
        value=tokens["access_token"],
        httponly=False,
        secure=COOKIE_SECURE,
        samesite=COOKIE_SAMESITE,
        max_age=tokens["expires_in"],
    )
    response.set_cookie(
        key="auth_refresh_token_js",
        value=tokens["refresh_token"],
        httponly=False,
        secure=COOKIE_SECURE,
        samesite=COOKIE_SAMESITE,
        max_age=7 * 24 * 3600,
    )
    # 用户信息 cookie（无痕模式下 localStorage 不可用，需要从 cookie 读取）
    user_data = json.dumps({"id": user.id, "phone": user.phone})
    response.set_cookie(
        key="auth_user_data",
        value=user_data,
        httponly=False,
        secure=COOKIE_SECURE,
        samesite=COOKIE_SAMESITE,
        max_age=7 * 24 * 3600,
    )
    return AuthResponse(
        error=False,
        message="success",
        data=AuthData(
            access_token=tokens["access_token"],
            refresh_token=tokens["refresh_token"],
            expires_in=tokens["expires_in"],
            user=UserResponse.model_validate(user),
        ),
    )


@router.post("/login", response_model=AuthResponse)
async def login(
    request: LoginRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    service = AuthService(db)
    user = await service.authenticate_user(request.phone, request.password)
    if not user:
        return AuthResponse(
            error=True,
            message="Invalid phone or password",
            data=None,
        )
    # Bind guest on login (best-effort)
    await service.bind_guest(user, request.guest_token)
    tokens = service.create_tokens(str(user.id))

    # 设置 cookie 供 middleware 使用
    # httponly cookie 用于 API 请求
    response.set_cookie(
        key="auth_access_token",
        value=tokens["access_token"],
        httponly=True,
        secure=COOKIE_SECURE,
        samesite=COOKIE_SAMESITE,
        max_age=tokens["expires_in"],
    )
    response.set_cookie(
        key="auth_refresh_token",
        value=tokens["refresh_token"],
        httponly=True,
        secure=COOKIE_SECURE,
        samesite=COOKIE_SAMESITE,
        max_age=7 * 24 * 3600,  # 7 天
    )
    # 非 httponly cookie 用于前端 JavaScript 读取 (localStorage 同步)
    response.set_cookie(
        key="auth_access_token_js",
        value=tokens["access_token"],
        httponly=False,
        secure=COOKIE_SECURE,
        samesite=COOKIE_SAMESITE,
        max_age=tokens["expires_in"],
    )
    response.set_cookie(
        key="auth_refresh_token_js",
        value=tokens["refresh_token"],
        httponly=False,
        secure=COOKIE_SECURE,
        samesite=COOKIE_SAMESITE,
        max_age=7 * 24 * 3600,
    )
    # 用户信息 cookie（无痕模式下 localStorage 不可用，需要从 cookie 读取）
    user_data = json.dumps({"id": str(user.id), "phone": user.phone})
    response.set_cookie(
        key="auth_user_data",
        value=user_data,
        httponly=False,
        secure=COOKIE_SECURE,
        samesite=COOKIE_SAMESITE,
        max_age=7 * 24 * 3600,
    )

    return AuthResponse(
        error=False,
        message="success",
        data=AuthData(
            access_token=tokens["access_token"],
            refresh_token=tokens["refresh_token"],
            expires_in=tokens["expires_in"],
            user=UserResponse.model_validate(user),
        ),
    )


@router.post("/refresh", response_model=AuthResponse)
async def refresh(request: RefreshRequest, response: Response, db: AsyncSession = Depends(get_db)):
    service = AuthService(db)
    tokens = await service.refresh_token(request.refresh_token)
    if not tokens:
        return AuthResponse(
            error=True,
            message="Invalid or expired refresh token",
            data=None,
        )
    # 更新 cookie
    response.set_cookie(
        key="auth_access_token",
        value=tokens["access_token"],
        httponly=True,
        secure=COOKIE_SECURE,
        samesite=COOKIE_SAMESITE,
        max_age=tokens["expires_in"],
    )
    return AuthResponse(
        error=False,
        message="success",
        data=AuthData(
            access_token=tokens["access_token"],
            refresh_token=tokens["refresh_token"],
            expires_in=tokens["expires_in"],
            user=None,  # refresh 不返回用户信息
        ),
    )


@router.get("/me", response_model=AuthResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return AuthResponse(
        error=False,
        message="success",
        data=AuthData(
            access_token="",  # /me 不需要 token
            refresh_token="",
            expires_in=0,
            user=UserResponse.model_validate(current_user),
        ),
    )


# ============ 移动端专用接口 ============

import random
from pydantic import BaseModel


class SendCodeRequest(BaseModel):
    phone: str


class PhoneLoginRequest(BaseModel):
    phone: str
    code: str
    guest_token: str | None = None


# 模拟验证码存储（生产环境应使用 Redis）
_verification_codes: dict[str, str] = {}

# Rate-limit 记录 — 2026-06-21 MVP 版，用内存 dict（生产环境应换 Redis）
_rate_limit_phone: dict[str, float] = {}  # phone -> 上次发送时间戳
_rate_limit_ip: dict[str, list[float]] = {}  # ip -> 最近请求时间戳列表
_RATE_LIMIT_PHONE_SECONDS = 60  # 同手机 60 秒一次
_RATE_LIMIT_IP_MAX = 5  # 同 IP 1 分钟内最多 5 次
_RATE_LIMIT_IP_WINDOW = 60  # IP 限流窗口 60 秒


def _check_rate_limit(phone: str, client_ip: str) -> tuple[bool, str]:
    """检查验证码发送频率限制
    Returns: (是否允许, 拒绝原因)
    """
    now = time.time()

    # 1. 同手机限制
    last_sent = _rate_limit_phone.get(phone)
    if last_sent and (now - last_sent) < _RATE_LIMIT_PHONE_SECONDS:
        remain = int(_RATE_LIMIT_PHONE_SECONDS - (now - last_sent))
        return False, f"请 {remain} 秒后再试"

    # 2. 同 IP 限制
    ip_history = _rate_limit_ip.get(client_ip, [])
    # 清理过期记录
    ip_history = [t for t in ip_history if (now - t) < _RATE_LIMIT_IP_WINDOW]
    if len(ip_history) >= _RATE_LIMIT_IP_MAX:
        return False, "操作过于频繁，请稍后再试"

    return True, ""


@router.post("/send-code")
async def send_code(request: SendCodeRequest, req: Request):
    """发送手机验证码（模拟环境，带频率限制）"""
    # 获取客户端 IP（支持代理）
    client_ip = req.headers.get("x-forwarded-for", req.client.host if req.client else "unknown")
    if "," in client_ip:
        client_ip = client_ip.split(",")[0].strip()

    # 频率检查
    allowed, reason = _check_rate_limit(request.phone, client_ip)
    if not allowed:
        logger.warning("Rate limit blocked phone=%s ip=%s reason=%s", request.phone, client_ip, reason)
        return {
            "error": True,
            "message": reason,
            "data": None,
        }

    # 模拟生成6位验证码
    code = str(random.randint(100000, 999999))
    _verification_codes[request.phone] = code

    # 更新 rate-limit 记录
    now = time.time()
    _rate_limit_phone[request.phone] = now
    _rate_limit_ip.setdefault(client_ip, []).append(now)

    logger.debug("模拟验证码 phone=%s ip=%s code=%s", request.phone, client_ip, code)
    return {
        "error": False,
        "message": f"验证码已发送: {code}",
        "data": {"code": code},
    }


@router.post("/phone-login", response_model=AuthResponse)
async def phone_login(request: PhoneLoginRequest, response: Response, db: AsyncSession = Depends(get_db)):
    """手机验证码登录"""
    # 验证验证码
    stored_code = _verification_codes.get(request.phone)
    if not stored_code or stored_code != request.code:
        return AuthResponse(
            error=True,
            message="验证码错误或已过期",
            data=None,
        )

    # 查找或创建用户
    result = await db.execute(select(User).where(User.phone == request.phone))
    user = result.scalar_one_or_none()

    if not user:
        # 新用户自动注册
        user = User(phone=request.phone, is_vip=False)
        db.add(user)
        await db.commit()
        await db.refresh(user)

    # Bind guest on phone-login (best-effort, for both new and existing users)
    service = AuthService(db)
    await service.bind_guest(user, request.guest_token)

    # 清除验证码
    if request.phone in _verification_codes:
        del _verification_codes[request.phone]

    tokens = service.create_tokens(str(user.id))

    # 设置 cookie
    response.set_cookie(key="auth_access_token", value=tokens["access_token"], httponly=True, secure=COOKIE_SECURE, samesite=COOKIE_SAMESITE, max_age=tokens["expires_in"])
    response.set_cookie(key="auth_refresh_token", value=tokens["refresh_token"], httponly=True, secure=COOKIE_SECURE, samesite=COOKIE_SAMESITE, max_age=7 * 24 * 3600)
    response.set_cookie(key="auth_access_token_js", value=tokens["access_token"], httponly=False, secure=COOKIE_SECURE, samesite=COOKIE_SAMESITE, max_age=tokens["expires_in"])
    response.set_cookie(key="auth_refresh_token_js", value=tokens["refresh_token"], httponly=False, secure=COOKIE_SECURE, samesite=COOKIE_SAMESITE, max_age=7 * 24 * 3600)
    user_data = json.dumps({"id": str(user.id), "phone": user.phone})
    response.set_cookie(key="auth_user_data", value=user_data, httponly=False, secure=COOKIE_SECURE, samesite=COOKIE_SAMESITE, max_age=7 * 24 * 3600)

    return AuthResponse(
        error=False,
        message="success",
        data=AuthData(
            access_token=tokens["access_token"],
            refresh_token=tokens["refresh_token"],
            expires_in=tokens["expires_in"],
            user=UserResponse.model_validate(user),
        ),
    )


@router.post("/logout")
async def logout(response: Response):
    """用户登出"""
    response.delete_cookie(key="auth_access_token")
    response.delete_cookie(key="auth_refresh_token")
    response.delete_cookie(key="auth_access_token_js")
    response.delete_cookie(key="auth_refresh_token_js")
    response.delete_cookie(key="auth_user_data")
    return {
        "error": False,
        "message": "success",
        "data": {"logged_out": True},
    }
