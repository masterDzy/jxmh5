import { JmServiceItem } from '../JmServiceCarousel/props'

export interface JmServiceCardProps {
  service: JmServiceItem
  isActive?: boolean
  className?: string
  style?: React.CSSProperties
  // 翻页相关
  total?: number
  currentIndex?: number
  onPrev?: () => void
  onNext?: () => void
  /**
   * 立即预约回调
   * - 不传则不渲染 chip 按钮
   * - 传入则在大卡价格行右侧显示「立即预约」芯片按钮
   * - 典型用法：跳到 /booking?serviceId=xxx
   */
  onBookNow?: (service: JmServiceItem) => void
}
