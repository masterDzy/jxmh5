/**
 * JmButton Props
 * 按钮组件属性定义
 */
import type { JmSize, JmVariant } from '../../../types'

export interface JmButtonProps {
  /** 按钮文字 */
  children: React.ReactNode
  /** 点击回调 */
  onClick?: (...args: any[]) => void
  /** 尺寸 */
  size?: JmSize
  /** 样式变体 */
  variant?: JmVariant
  /** 禁用状态 */
  disabled?: boolean
  /** 是否全宽 */
  fullWidth?: boolean
  /** 自定义类名 */
  className?: string
  /** 按钮颜色 */
  color?: string
}
