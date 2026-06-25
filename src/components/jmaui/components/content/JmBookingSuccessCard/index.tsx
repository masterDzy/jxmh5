'use client'

import { JmButton } from '@/components/jmaui/components/functional/JmButton'
import type { JmBookingSuccessCardProps } from './props'

/**
 * JmBookingSuccessCard —预约成功反馈卡片
 *
 * 视觉层级(自上而下):
 * 1. 成功图标:圆形 brand底色 +白色对勾 SVG
 * 2. 标题 「预约已提交」
 * 3. 预约编号（可选，从 API 返回值捕获）
 * 4. 描述 「我们将在2小时内与您联系确认预约详情」
 * 5. 预约信息卡片:分组展示
 *    - 策划师区域:头像 + 姓名 + 专长 + 简介（仅在 plannerName 存在时渲染）
 *    - 核心信息行:服务项目 / 交付方式 / 预约时间 / 预约人 / 联系电话
 *    - 条件行:备注 / 地址（仅非空时显示）
 * 6. 「返回首页」按钮:brand 色 fullWidth
 */
export function JmBookingSuccessCard({
  serviceName,
  plannerName,
  plannerAvatar,
  plannerSpecialty,
  plannerDescription,
  deliveryModeLabel,
  deliveryLabel,
  bookerName,
  bookerPhone,
  appointmentTime,
  bookingId,
  note,
  address,
  resetLabel = '返回首页',
  themeColor = 'var(--page-theme-color, #D94E3D)',
  onReset,
}: JmBookingSuccessCardProps) {
  const finalDeliveryLabel = deliveryLabel ?? deliveryModeLabel ?? ''
  return (
    <div className="jm-booking-success-card">
      {/* 成功图标 */}
      <div
        className="jm-booking-success-card__icon"
        style={{ '--bsc-theme': themeColor } as React.CSSProperties}
      >
        <svg
          className="jm-booking-success-card__icon-check"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      {/* 标题 */}
      <h2 className="jm-booking-success-card__title">预约已提交</h2>

      {/* 预约编号（可选） */}
      {bookingId && (
        <p className="jm-booking-success-card__booking-id">预约编号：{bookingId}</p>
      )}

      {/* 描述 */}
      <p className="jm-booking-success-card__desc">我们将在2小时内与您联系确认预约详情</p>

      {/* 预约信息卡片 */}
      <section className="jm-booking-success-card__info">
        {/* 策划师区域 — 仅在 plannerName 存在时显示 */}
        {plannerName && (
          <>
            <div className="jm-booking-success-card__planner">
              {plannerAvatar ? (
                <img
                  className="jm-booking-success-card__planner-avatar"
                  src={plannerAvatar}
                  alt={plannerName}
                />
              ) : (
                <div className="jm-booking-success-card__planner-avatar jm-booking-success-card__planner-avatar--fallback">
                  {plannerName.charAt(0)}
                </div>
              )}
              <div className="jm-booking-success-card__planner-info">
                <div className="jm-booking-success-card__planner-name">
                  {plannerName}
                  {plannerSpecialty && (
                    <span className="jm-booking-success-card__planner-specialty"> · {plannerSpecialty}</span>
                  )}
                </div>
                {plannerDescription && (
                  <div className="jm-booking-success-card__planner-description">{plannerDescription}</div>
                )}
              </div>
            </div>
            <div className="jm-booking-success-card__divider" />
          </>
        )}

        <div className="jm-booking-success-card__rows">
          <div className="jm-booking-success-card__row">
            <span className="jm-booking-success-card__row-label">服务项目</span>
            <span className="jm-booking-success-card__row-value">{serviceName}</span>
          </div>
          <div className="jm-booking-success-card__divider" />
          <div className="jm-booking-success-card__row">
            <span className="jm-booking-success-card__row-label">交付方式</span>
            <span className="jm-booking-success-card__row-value">{finalDeliveryLabel}</span>
          </div>
          <div className="jm-booking-success-card__divider" />
          <div className="jm-booking-success-card__row">
            <span className="jm-booking-success-card__row-label">预约时间</span>
            <span className="jm-booking-success-card__row-value">{appointmentTime}</span>
          </div>
          <div className="jm-booking-success-card__divider" />
          <div className="jm-booking-success-card__row">
            <span className="jm-booking-success-card__row-label">预约人</span>
            <span className="jm-booking-success-card__row-value">{bookerName}</span>
          </div>
          <div className="jm-booking-success-card__divider" />
          <div className="jm-booking-success-card__row">
            <span className="jm-booking-success-card__row-label">联系电话</span>
            <span className="jm-booking-success-card__row-value">{bookerPhone}</span>
          </div>
          {note && (
            <>
              <div className="jm-booking-success-card__divider" />
              <div className="jm-booking-success-card__row jm-booking-success-card__row--multiline">
                <span className="jm-booking-success-card__row-label">备注</span>
                <span className="jm-booking-success-card__row-value">{note}</span>
              </div>
            </>
          )}
          {address && (
            <>
              <div className="jm-booking-success-card__divider" />
              <div className="jm-booking-success-card__row jm-booking-success-card__row--multiline">
                <span className="jm-booking-success-card__row-label">地址</span>
                <span className="jm-booking-success-card__row-value">{address}</span>
              </div>
            </>
          )}
        </div>
      </section>

      {/* 返回按钮 */}
      <JmButton
        variant="primary"
        size="lg"
        fullWidth
        onClick={onReset}
        className="jm-booking-success-card__reset-btn"
      >
        {resetLabel}
      </JmButton>
    </div>
  )
}

export default JmBookingSuccessCard
