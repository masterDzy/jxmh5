/**
 * JmShoppingBagBadge Props
 *
 * 幸运商城页眉专用徽章 SVG — 购物袋造型
 * 内联 SVG 而非 <img>,以便 currentColor 跟随外部 color 样式染色
 */

export interface JmShoppingBagBadgeProps {
  /**
   * 徽章主色 — 走 CSS `color` 属性,内部 SVG 用 `currentColor` 自动接管
   * 默认使用 jm-color-brand-green 苔绿
   */
  color?: string
  /** 自定义类名 */
  className?: string
  /** 尺寸(px),默认 32(与页眉徽章同尺寸) */
  size?: number
}
