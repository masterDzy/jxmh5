/**
 * JmServiceCateList Props
 * 服务分类列表组件属性定义（书卷·竖式目录）
 */

import type { JmServiceItem } from '../JmServiceCarousel/props'

export type { JmServiceItem }

export interface JmServiceCateListItem {
  /** 分类ID */
  id: string
  /** 分类名称 */
  name: string
  /** 服务列表 */
  services: JmServiceItem[]
  /** 原始索引（用于显示序号） */
  originalIndex?: number
  /** 服务预览副解读映射 {serviceId: "事业·财富·健康"} */
  previewSubs?: Record<string, string>
}

export interface JmServiceCateListProps {
  /** 自定义类名 */
  className?: string
  /** 内联样式 */
  style?: React.CSSProperties
  /** 分类数据列表 */
  categories: JmServiceCateListItem[]
  /** 加载状态 */
  loading?: boolean
  /** 错误信息 */
  error?: string | null
  /** 点击分类回调 */
  onCategoryClick?: (category: JmServiceCateListItem) => void
  /** 点击服务回调 */
  onServiceClick?: (service: JmServiceItem, category: JmServiceCateListItem) => void
  /** 主题色（默认 #da2e75 玫红） */
  themeColor?: string
  /** 强调色（默认 #D94E3D 朱红） */
  accentColor?: string
  /** 点击预览小卡片回调 - 返回 (service, category, index) */
  onPreviewCardClick?: (service: JmServiceItem, category: JmServiceCateListItem, index: number) => void
}
