import type { JmServiceItem } from '../JmServiceCarousel/props'

/**
 * JmBookingSummary Props — 预约页面顶部"已选服务"摘要
 *
 * 视觉简洁：只展示服务名 + 副标题，不复用完整大卡。
 * 受控组件：service 由父级注入，本组件不做任何数据获取。
 */
export interface JmBookingSummaryProps {
  /** 已选服务（必传，没有服务时不渲染） */
  service: JmServiceItem
  /** 容器自定义类名 */
  className?: string
}
