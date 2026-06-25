/**
 * JmHeroBanner Props
 * 英雄区域组件属性定义
 */

export interface JmHeroBannerProps {
  /** 自定义类名 */
  className?: string
  /** 内联样式 */
  style?: React.CSSProperties
  /** 背景颜色 */
  backgroundColor?: string
  /** 背景图片 URL */
  backgroundImage?: string
  /** 高度模式 */
  height?: 'full' | 'half' | 'auto'
  /** 内容子元素 */
  children?: React.ReactNode
}
