"""
预约单 API 路由（移动端公开接口）
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import Optional

from database import get_db
from app.models.appointment import Appointment
from app.models.message import Message
from app.models.admin_notification import AdminNotification
from app.utils.security import verify_access_token
from app.schemas.appointment import (
    AppointmentCreate,
    AppointmentCreateResponse,
    AppointmentResponse,
)

router = APIRouter(prefix="/api/v1/mobile/appointments", tags=["mobile-appointments"])


@router.post("", response_model=AppointmentCreateResponse)
async def create_appointment(
    payload: AppointmentCreate,
    db: AsyncSession = Depends(get_db),
):
    """
    提交一个预约单
    - 不需要登录（游客可提交）
    - 状态初始为 'pending'（待确认）
    - 客服会在 2 小时内联系预约人
    """
    appt = Appointment(
        service_id=payload.service_id,
        service_name=payload.service_name,
        service_category=payload.service_category,
        name=payload.name,
        phone=payload.phone,
        appointment_date=payload.appointment_date,
        appointment_time=payload.appointment_time,
        note=payload.note,
        # 2026-06-14: 策划师 + 交付双维（前端 isValid 控制必填，后端 Optional 接收）
        planner_id=payload.planner_id,
        delivery_space=payload.delivery_space,
        delivery_form=payload.delivery_form,
        status="pending",
    )
    db.add(appt)
    await db.commit()
    await db.refresh(appt)

    # ── 自动创建系统通知消息 ──────────────────────────
    # 1) 给预约人的确认消息
    booker_receiver_id = "unknown"
    if payload.guest_token:
        guest_payload = verify_access_token(payload.guest_token)
        if guest_payload:
            booker_receiver_id = guest_payload.get("sub", "unknown")

    db.add(Message(
        sender_type="system",
        sender_id=None,
        receiver_type="guest",
        receiver_id=booker_receiver_id,
        msg_type="system",
        title="预约确认",
        content=f"您已成功预约 {payload.service_name}，预约时间：{payload.appointment_date} {payload.appointment_time}",
    ))

    # 2) 给管理员的预约通知（消息系统）
    db.add(Message(
        sender_type="system",
        sender_id=None,
        receiver_type="user",
        receiver_id="admin",
        msg_type="system",
        title="新预约通知",
        content=f"{payload.name} 预约了 {payload.service_name}，时间：{payload.appointment_date} {payload.appointment_time}",
    ))

    # 3) 管理后台通知
    db.add(AdminNotification(
        event_type="booking",
        ref_id=str(appt.id),
        title=f"新预约: {payload.name}",
        content=f"{payload.name} 预约了 {payload.service_name}\n时间: {payload.appointment_date} {payload.appointment_time}\n电话: {payload.phone or '未填写'}",
    ))

    await db.commit()

    return AppointmentCreateResponse(
        error=False,
        message="预约已提交，客服会在 2 小时内与您联系",
        data=AppointmentResponse.model_validate(appt),
    )


@router.get("/by-phone", response_model=dict)
async def list_by_phone(
    phone: str = Query(..., min_length=11, max_length=11, description="手机号"),
    limit: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    """按手机号查询该用户的预约记录（脱敏简版，可给前端展示用）"""
    stmt = (
        select(Appointment)
        .where(Appointment.phone == phone)
        .order_by(desc(Appointment.created_at))
        .limit(limit)
    )
    result = await db.execute(stmt)
    rows = result.scalars().all()
    return {
        "error": False,
        "message": "success",
        "data": {
            "items": [AppointmentResponse.model_validate(r).model_dump(mode="json") for r in rows],
            "total": len(rows),
        },
    }
