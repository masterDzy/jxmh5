'use client'

import { Fragment } from 'react'
import {
  DEFAULT_APPOINTMENT_STEPS,
  type JmAppointmentTipsProps,
} from './props'

/**
 * JmAppointmentTips 预约流程提示组件（横向 Tab 形态）
 *
 * 视觉：5 个等宽 tab 横向拼接，tab 之间用 `>` 箭头连接
 *   - 当前：实心主色背景 + 白字
 *   - 已完成：白底 + 主色字 + 主色 `>`
 *   - 未开始：白底 + 灰字 + 灰 `>`
 *   - 最后一步无箭头（终点）
 *
 * 渲染结构（箭头在 tab 外部,作为兄弟元素,保证字样不被切掉/覆盖）：
 *   <tabs>
 *     <tab>label</tab>   <arrow>></arrow>   <tab>label</tab>   ...
 *   </tabs>
 *
 * 行内：tab 内 13px label 居中,arrow 14px 居中
 */
export function JmAppointmentTips({
  steps = DEFAULT_APPOINTMENT_STEPS,
  currentStepId,
  onStepClick,
  themeColor = '#D94E3D',
  doneColor = '#A6BA43',
  className = '',
  style,
}: JmAppointmentTipsProps) {
  const currentIdx = steps.findIndex((s) => s.id === currentStepId)

  return (
    <div
      className={`jm-appointment-tips jm-appointment-tips--tabs ${className}`}
      data-theme-color={themeColor}
      data-done-color={doneColor}
      style={style}
    >
      {steps.map((step, idx) => {
        const isCurrent = idx === currentIdx
        const isDone = idx < currentIdx
        const isLast = idx === steps.length - 1
        // arrow 颜色取自前一个 tab 的状态:前 tab 是 current/done → 主色,upcoming → 灰
        const arrowStateClass = isCurrent
          ? 'jm-appointment-tips__tab--current'
          : isDone
            ? 'jm-appointment-tips__tab--done'
            : 'jm-appointment-tips__tab--upcoming'
        const tabStateClass = isCurrent
          ? 'jm-appointment-tips__tab--current'
          : isDone
            ? 'jm-appointment-tips__tab--done'
            : 'jm-appointment-tips__tab--upcoming'

        return (
          <Fragment key={step.id}>
            <button
              type="button"
              className={`jm-appointment-tips__tab ${tabStateClass}`}
              disabled={!isDone || !onStepClick}
              onClick={() => isDone && onStepClick?.(step.id)}
              aria-label={step.label}
            >
              <span className="jm-appointment-tips__label">{step.label}</span>
            </button>
            {!isLast && (
              <span
                className={`jm-appointment-tips__arrow ${arrowStateClass}`}
                aria-hidden
              >
                &gt;
              </span>
            )}
          </Fragment>
        )
      })}
    </div>
  )
}

export default JmAppointmentTips
