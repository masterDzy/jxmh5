/**
 * JmProductDetail Props
 *
 * 商品详情内容组件 — 设计为放在 JmServiceDetailDrawer 等容器里使用
 * 纯视觉组件,不维护任何业务 state
 */

import type { JmProductItem } from '../JmProductCard/props'

export interface JmProductDetailProps {
  /** 商品数据 */
  product: JmProductItem
  /** 主题色(默认 #A6BA43 苔绿,与商城页眉一致) */
  themeColor?: string
  /** 点击「加入购物车」回调 */
  onAddToCart?: (product: JmProductItem) => void
  /** 自定义类名 */
  className?: string
}
