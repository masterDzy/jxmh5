/**
 * JmCateLabel Props
 * 分类标签组件属性定义（紧贴型标签）
 */

export interface JmCateLabelProps {
  /** 自定义类名 */
  className?: string
  /** 内联样式 */
  style?: React.CSSProperties
  /** 标签文字 */
  text: string
  /** 标签序号（可选，如"01"） */
  number?: string
  /** 是否选中状态 */
  active?: boolean
  /** 点击回调 */
  onClick?: () => void
  /** 主题色（默认 #da2e75 玫红） */
  themeColor?: string
}
