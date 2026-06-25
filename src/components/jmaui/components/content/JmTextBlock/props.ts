/**
 * JmTextBlock Props
 * 文本块组件属性定义
 */

export interface JmTextBlockProps {
  /** 自定义类名 */
  className?: string
  /** 内联样式 */
  style?: React.CSSProperties
  /** 标题 */
  title?: string
  /** 正文内容 */
  content: string
  /** 对齐方式 */
  alignment?: 'left' | 'center' | 'right'
  /** 标题颜色 */
  titleColor?: string
  /** 正文字颜色 */
  contentColor?: string
  /** 标题字号 */
  titleSize?: 'sm' | 'base' | 'lg' | 'xl'
  /** 正文字号 */
  contentSize?: 'xs' | 'sm' | 'base' | 'lg'
}
