/**
 * JmHeader Props
 * 页头组件属性定义
 */

export type JmHeaderVariant = 'landing' | 'tool' | 'minimal' | 'transparent' | 'largeTitle' | 'search'

export interface JmHeaderProps {
  /** 自定义类名 */
  className?: string
  /** 内联样式 */
  style?: React.CSSProperties
  /** 标题文字 */
  title?: string
  /** 显示返回按钮 */
  showBack?: boolean
  /** 返回按钮点击回调 */
  onBackClick?: () => void
  /** 显示菜单按钮 */
  showMenu?: boolean
  /** 显示更多按钮 */
  showMore?: boolean
  /** 变体类型 */
  variant?: JmHeaderVariant
  /** 背景色 */
  backgroundColor?: string
  /** 文字颜色 */
  textColor?: string
}
