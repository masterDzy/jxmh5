/**
 * BgGraphics Props
 * 背景装饰组件属性定义
 */
import type { JmAnimationType, JmPosition, JmSvgVariant } from '../../../types'

export interface BgGraphicsProps {
  /** 图形类型 */
  variant: JmSvgVariant
  /** 位置: full=全屏, section=区域 */
  position?: JmPosition
  /** SVG 资源路径（可选，默认用内置图形） */
  src?: string
  /** 透明度 0-1 */
  opacity?: number
  /** 磨砂模糊像素 */
  blur?: number
  /** 动画配置 */
  animation?: {
    type: JmAnimationType
    duration?: number
    delay?: number
  }
  /** 配色数组 */
  colors?: string[]
  /** CSS 类名 */
  className?: string
}
