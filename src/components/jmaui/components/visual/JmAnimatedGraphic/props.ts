/**
 * JmAnimatedGraphic Props
 * 动画图形组件属性定义
 */

export type AnimationType = 'none' | 'breathe' | 'float' | 'skew' | 'pulse' | 'swing' | 'rotate' | 'shimmer'

export interface JmAnimatedGraphicProps {
  /** 自定义类名 */
  className?: string
  /** 内联样式 */
  style?: React.CSSProperties
  /** 图形变体 */
  variant?: 'leaf' | 'hand' | 'waves' | 'dots' | 'geometric' | 'custom'
  /** 自定义 SVG 路径数据 */
  customPaths?: string[]
  /** 动画类型 */
  animation?: AnimationType
  /** 动画持续时间（秒） */
  duration?: number
  /** 动画延迟（秒） */
  delay?: number
  /** 是否自动播放 */
  autoPlay?: boolean
  /** 图标颜色 */
  color?: string
  /** 透明度 */
  opacity?: number
  /** 宽度 */
  width?: number | string
  /** 高度 */
  height?: number | string
}
