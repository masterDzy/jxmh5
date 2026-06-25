"""
预约单 Schema
"""
from datetime import datetime
from typing import Optional, Literal
from uuid import UUID
from pydantic import BaseModel, Field, field_validator, field_serializer
from app.schemas import ApiResponse
from app.constants.delivery import (
    DeliverySpace,
    DeliveryForm,
    is_valid_space,
    is_valid_form,
)
import re


# 字面量类型用于 OpenAPI 文档 + Pydantic 校验
DeliverySpaceLiteral = Literal["online", "onsite", "home"]
DeliveryFormLiteral = Literal["document", "conversation"]


class AppointmentCreate(BaseModel):
    """提交预约请求体"""
    service_id: str = Field(..., description="服务ID")
    service_name: str = Field(..., description="服务名称（冗余存储）")
    service_category: Optional[str] = Field(None, description="服务分类（冗余存储）")
    name: str = Field(..., min_length=2, max_length=50, description="预约人姓名")
    phone: Optional[str] = Field(default=None, description="手机号（可选）")
    appointment_date: str = Field(..., description="预约日期 YYYY-MM-DD")
    appointment_time: str = Field(..., description="预约时段 HH:MM")
    note: Optional[str] = Field(None, max_length=500, description="备注")

    # 2026-06-14: booking 流程升级 — 策划师 + 交付双维
    # 初期后端不强制必填（planner_id/delivery_space/delivery_form 都可空），
    # 由前端 isValid 控制必选流程；后端仍校验值合法性
    planner_id: Optional[int] = Field(None, description="策划师 ID（可选；2026-06-14 新增）")
    delivery_space: Optional[DeliverySpaceLiteral] = Field(
        None, description="交付空间: online/onsite/home（可选；2026-06-14 新增）"
    )
    delivery_form: Optional[DeliveryFormLiteral] = Field(
        None, description="交付形式: document/conversation（可选；2026-06-14 新增）"
    )

    guest_token: Optional[str] = Field(None, description="访客token，用于发送消息通知")

    @field_validator("phone")
    @classmethod
    def _v_phone(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v.strip() != "":
            # 只校验格式，不阻塞——无效号码仍保存（前端已做提示），不抛 422
            if re.match(r"^1[3-9]\d{9}$", v.strip()):
                return v.strip()
        return None

    @field_validator("appointment_date")
    @classmethod
    def _v_date(cls, v: str) -> str:
        if not re.match(r"^\d{4}-\d{2}-\d{2}$", v):
            raise ValueError("日期格式需为 YYYY-MM-DD")
        return v

    @field_validator("appointment_time")
    @classmethod
    def _v_time(cls, v: str) -> str:
        if not re.match(r"^\d{2}:\d{2}$", v):
            raise ValueError("时段格式需为 HH:MM")
        return v

    @field_validator("delivery_space")
    @classmethod
    def _v_space(cls, v: Optional[str]) -> Optional[str]:
        if not is_valid_space(v):
            raise ValueError(
                f"delivery_space 必须是 {list(DeliverySpace.__members__.keys())} 之一"
            )
        return v

    @field_validator("delivery_form")
    @classmethod
    def _v_form(cls, v: Optional[str]) -> Optional[str]:
        if not is_valid_form(v):
            raise ValueError(
                f"delivery_form 必须是 {list(DeliveryForm.__members__.keys())} 之一"
            )
        return v


class AppointmentResponse(BaseModel):
    """预约单响应"""
    id: UUID
    service_id: str
    service_name: str
    service_category: Optional[str] = None
    name: str
    phone: Optional[str] = None
    appointment_date: str
    appointment_time: str
    status: str
    note: Optional[str] = None
    created_at: Optional[datetime] = None

    # 2026-06-14: booking 流程升级 — 策划师 + 交付双维
    planner_id: Optional[int] = None
    delivery_space: Optional[str] = None
    delivery_form: Optional[str] = None

    class Config:
        from_attributes = True

    @field_serializer("id")
    def _ser_id(self, v: UUID) -> str:
        """DB UUID → 响应字符串（统一前端格式）"""
        return str(v)


class AppointmentCreateResponse(ApiResponse[AppointmentResponse]):
    pass
