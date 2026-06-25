/**
 * JmProductGrid Props
 * 商品网格组件属性
 *
 * 网格容器，渲染一组 JmProductCard。
 * 复用 JmProductCard 的产品数据结构（JmProductItem）。
 */

import type { JmProductItem } from '../JmProductCard/props'

export interface JmProductGridProps {
  /** 商品列表（复用 JmProductCard 的 JmProductItem 类型） */
  products: JmProductItem[]
  /** 网格列数（默认 2，移动端最常用） */
  columns?: 2 | 3
  /** 加载状态 */
  loading?: boolean
  /** 错误信息 */
  error?: string | null
  /** 加入购物车回调 */
  onAddToCart?: (product: JmProductItem) => void
  /** 点击商品回调 */
  onProductClick?: (product: JmProductItem) => void
  /** 空状态文案 */
  emptyText?: string
  /** 自定义类名 */
  className?: string
  /** 自定义内联样式（动态值例外） */
  style?: React.CSSProperties
  /** 主题色（透传到子卡片,影响 chip 描边 + 图标色） */
  themeColor?: string
}
