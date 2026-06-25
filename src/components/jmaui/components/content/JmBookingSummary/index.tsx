'use client'

import type { JmBookingSummaryProps } from './props'

/**
 * JmBookingSummary — 预约页面顶部"已选服务"摘要
 *
 * 受控展示型组件：service 由父级注入，本组件不做任何数据获取。
 * 视觉简洁：服务名（大字号、品牌色可选）+ 副标题（次级文案、单行省略）。
 */
export function JmBookingSummary({ service, className = '' }: JmBookingSummaryProps) {
  if (!service) return null
  return (
    <div className={`jm-booking-summary ${className}`}>
      <h3 className="jm-booking-summary__title">{service.name}</h3>
      {service.description && (
        <p className="jm-booking-summary__subtitle">{service.description}</p>
      )}
    </div>
  )
}

export default JmBookingSummary
