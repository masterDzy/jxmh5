from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Mobile database (jx_m_apk)
    # NOTE: 必须从环境变量 DATABASE_URL 读取(参照 .env.example)
    #      不可在源码硬编码真实密码
    database_url: str = ""

    # 运行环境: "development" | "production"
    # 生产环境设置 ENV=production:
    #   - auth cookies secure=True (HTTPS-only)
    #   - 关闭 debug 模式
    # 开发默认 "development" (cookies 允许 http 便于 curl 测试)
    env_name: str = "development"

    debug: bool = False

    # JWT settings
    jwt_secret_key: str = ""  # 必须从环境变量 JWT_SECRET_KEY 读取
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    refresh_token_expire_days: int = 7

    # Connection pool settings
    database_pool_size: int = 5
    database_max_overflow: int = 10
    database_pool_recycle: int = 3600

    # MiniMax API settings
    minimax_api_key: str = ""
    minimax_api_host: str = "https://api.minimax.chat"

    class Config:
        env_file = ".env"


settings = Settings()
