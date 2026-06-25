/**
 * JmOursCateCard Props
 * 服务分类卡片组件属性定义
 */

export interface JmOursCateItem {
  /** 分类名称 */
  name: string
  /** 分类描述 */
  description?: string
  /** 分类图标（emoji 或 SVG） */
  icon?: React.ReactNode
}

export interface JmOursCateCardProps {
  /** 自定义类名 */
  className?: string
  /** 内联样式 */
  style?: React.CSSProperties
  /** 主标题（如"企业服务"） */
  title: string
  /** 小标题/副标题（如"这里是服务大类"） */
  subtitle?: string
  /** 分类项列表 */
  items: JmOursCateItem[]
  /** 点击分类项回调 */
  onItemClick?: (item: JmOursCateItem, index: number) => void
  /** 主题色（默认 #da2e75 玫红） */
  themeColor?: string
}
