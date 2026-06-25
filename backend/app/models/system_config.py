"""
系统配置模型（key-value 存储）
"""
from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base


class SystemConfig(Base):
    __tablename__ = "jx_apk_system_configs"

    key: Mapped[str] = mapped_column(
        String(100), primary_key=True, comment="配置键"
    )
    value: Mapped[str] = mapped_column(Text, nullable=False, comment="配置值")
    description: Mapped[str | None] = mapped_column(
        String(200), nullable=True, comment="配置说明"
    )
