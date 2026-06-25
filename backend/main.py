import os
from fastapi import FastAPI, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
from database import get_db
from app.routers.auth import router as auth_router
from app.routers.fortune import router as fortune_router
from app.routers.garden import router as garden_router
from app.routers.knowledge import router as knowledge_router
from app.routers.mall import router as mall_router
from app.routers.mobile_service import router as mobile_service_router
from app.routers.page import router as page_router
from app.routers.appointment import router as appointment_router
from app.routers.newproduct import router as newproduct_router
from app.routers.planner import router as planner_router
from app.routers.guest import router as guest_router
from app.routers.message import router as message_router
from app.routers.admin_notification import router as admin_notification_router


def _parse_origin_netloc(origin: str) -> str | None:
    """从 origin 提取 host:port 或 ip"""
    try:
        from urllib.parse import urlparse
        parsed = urlparse(origin)
        return parsed.netloc
    except Exception:
        return None


def _is_ip_in_cidr(ip: str, network: str) -> bool:
    """检查 IP 是否在 CIDR 网段内"""
    import ipaddress
    try:
        return ipaddress.ip_address(ip) in ipaddress.ip_network(network, strict=False)
    except Exception:
        return False


def is_origin_allowed(origin: str | None) -> bool:
    """
    检查 origin 是否被允许
    允许的网段：
    - localhost:3005, localhost:3006
    - 127.0.0.1:3005, 127.0.0.1:3006
    - 192.168.31.0/24（局域网）
    - 100.66.1.0/24（异地组网）
    """
    if not origin:
        return False

    # 从环境变量读取额外允许的 origins
    env_origins = os.getenv("CORS_ALLOWED_ORIGINS", "")
    extra_origins = [o.strip() for o in env_origins.split(",") if o.strip()]

    # 直接匹配（包括环境变量中的额外 origins）
    if origin in extra_origins:
        return True

    # 解析 origin
    netloc = _parse_origin_netloc(origin)
    if not netloc:
        return False

    # 分离 host 和 port
    if ":" in netloc:
        host, port = netloc.rsplit(":", 1)
    else:
        host = netloc
        port = None

    # 检查是否是 localhost
    if host in ("localhost", "127.0.0.1"):
        # 管理后台 3005，移动端 3006/3007
        if port in ("3005", "3006", "3007"):
            return True

    # 检查是否是允许的网段
    allowed_networks = [
        "192.168.31.0/24",   # 局域网
        "100.66.1.0/24",     # 异地组网
    ]

    for network in allowed_networks:
        if _is_ip_in_cidr(host, network):
            return True

    return False


class SmartCORSMiddleware(BaseHTTPMiddleware):
    """
    智能 CORS 中间件
    - 允许 localhost 和指定网段的来源
    - 拒绝其他所有来源
    """

    async def dispatch(self, request: Request, call_next):
        origin = request.headers.get("origin")

        # OPTIONS 预检:由本中间件直接响应 200 + CORS 头,无需走下游
        if request.method == "OPTIONS" and origin and is_origin_allowed(origin):
            return Response(
                status_code=200,
                headers={
                    "Access-Control-Allow-Origin": origin,
                    "Access-Control-Allow-Credentials": "true",
                    "Access-Control-Allow-Methods": "*",
                    "Access-Control-Allow-Headers": "*",
                    "Access-Control-Max-Age": "3600",
                },
            )

        response = await call_next(request)

        if origin and is_origin_allowed(origin):
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Access-Control-Allow-Methods"] = "*"
            response.headers["Access-Control-Allow-Headers"] = "*"
            response.headers["Access-Control-Max-Age"] = "3600"

        return response


app = FastAPI(title="Jiuxin H5 Backend", version="1.0.0")

# 智能 CORS 中间件统一处理预检 + 响应头(替代内置 CORSMiddleware)
app.add_middleware(SmartCORSMiddleware)

# Mobile routers
app.include_router(auth_router)
app.include_router(fortune_router)
app.include_router(garden_router)
app.include_router(knowledge_router)
app.include_router(mall_router)
app.include_router(mobile_service_router)
app.include_router(page_router)
app.include_router(appointment_router)
app.include_router(planner_router)
app.include_router(newproduct_router)
app.include_router(guest_router)
app.include_router(message_router)
app.include_router(admin_notification_router)


@app.get("/health")
async def health_check(db: AsyncSession = Depends(get_db)):
    try:
        await db.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": str(e)}


@app.get("/api/v1/health")
async def api_health_check(db: AsyncSession = Depends(get_db)):
    try:
        await db.execute(text("SELECT 1"))
        return {
            "error": False,
            "message": "success",
            "data": {"status": "healthy", "database": "connected"},
        }
    except Exception as e:
        return {"error": True, "message": str(e), "data": None}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8009)
