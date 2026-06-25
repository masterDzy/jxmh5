/**
 * JmCartDrawer Props
 * 购物车抽屉组件属性
 */

import type { JmProductItem } from '../../content/JmProductCard/props'

export interface JmCartItem {
  id: number
  product_id: number
  quantity: number
  product: JmProductItem
}

export interface JmCartDrawerProps {
  open: boolean
  onClose: () => void
  items: JmCartItem[]
  total: number
  onUpdateQuantity: (id: number, quantity: number) => void
  onRemove: (id: number) => void
  onCheckout?: () => void
  className?: string
  style?: React.CSSProperties
}