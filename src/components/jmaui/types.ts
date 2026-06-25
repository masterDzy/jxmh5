/**
 * jmaui Types
 * 九信阁移动端 H5 组件库类型定义
 */

/** 动画类型 */
export type JmAnimationType = 'none' | 'breathe' | 'float' | 'skew' | 'pulse'

/** 位置类型 */
export type JmPosition = 'full' | 'section'

/** SVG 图形变体 */
export type JmSvgVariant = 'leaf' | 'hand' | 'dots' | 'waves' | 'geometric' | 'srlogo' | 'logoaction' | 'shou'

/** 组件尺寸 */
export type JmSize = 'sm' | 'md' | 'lg'

/** 组件变体 */
export type JmVariant = 'primary' | 'secondary' | 'outline' | 'ghost'

/** 文本对齐 */
export type JmTextAlign = 'left' | 'center' | 'right'

/** Flex 对齐 */
export type JmAlign = 'start' | 'center' | 'end' | 'stretch'

/** Flex 分布 */
export type JmJustify = 'start' | 'center' | 'end' | 'between' | 'around'

/** 通用 Props */
export interface JmBaseProps {
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}

/** 带 ID 的 Props */
export interface JmIdProps {
  id?: string
}
