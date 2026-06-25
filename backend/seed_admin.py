"""
种子脚本 — 创建管理员账号和系统配置

用法：
    cd backend
    python seed_admin.py

幂等：已存在的管理员和配置会自动跳过。
"""
import asyncio
from sqlalchemy import select
from database import async_session_maker
from app.models.user import User
from app.models.system_config import SystemConfig
from app.utils.security import get_password_hash


DEFAULT_CONFIGS = [
    {
        "key": "notification.booking_template",
        "value": "新预约通知：{name} 预约了 {service}，时间：{time}",
        "description": "预约通知模板",
    },
    {
        "key": "notification.contact_phone",
        "value": "400-000-0000",
        "description": "客服联系电话",
    },
    {
        "key": "system.admin_name",
        "value": "管理员",
        "description": "管理员名称",
    },
]


async def seed():
    async with async_session_maker() as db:
        # ── 创建管理员用户 ──
        result = await db.execute(
            select(User).where(User.phone == "13800000000")
        )
        existing_admin = result.scalar_one_or_none()

        if existing_admin:
            print("ℹ 管理员用户已存在，跳过创建")
        else:
            admin = User(
                phone="13800000000",
                password_hash=get_password_hash("admin123456"),
                nickname="管理员",
            )
            db.add(admin)
            await db.commit()
            await db.refresh(admin)
            print(f"✓ 管理员用户已创建 (id={admin.id})")

        # ── 创建系统配置 ──
        created_count = 0
        for cfg in DEFAULT_CONFIGS:
            result = await db.execute(
                select(SystemConfig).where(SystemConfig.key == cfg["key"])
            )
            existing = result.scalar_one_or_none()
            if existing:
                print(f"ℹ 配置 {cfg['key']} 已存在，跳过")
                continue
            db.add(SystemConfig(**cfg))
            created_count += 1

        if created_count > 0:
            await db.commit()
            print(f"✓ {created_count} 条系统配置已创建")
        else:
            print("ℹ 所有系统配置已存在，跳过创建")

    print("\n✓ 种子数据已就绪")


if __name__ == "__main__":
    asyncio.run(seed())
