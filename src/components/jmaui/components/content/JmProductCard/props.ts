/**
 * JmProductCard Props
 * 商品卡片组件属性
 */

export interface JmProductItem {
  id: number
  name: string
  cover_image: string | null
  images?: string[]
  category: string
  category_name: string
  price: number
  original_price?: number | null
  is_virtual: boolean
  stock: number
  description: string
  content?: string
  created_at?: string
}

export interface JmProductCardProps {
  product: JmProductItem
  onAddToCart?: (product: JmProductItem) => void
  className?: string
  style?: React.CSSProperties
  /**
   * 主题色(跟随页眉色),用于按钮芯片的边框/文字
   * 默认 #da2e75 玫红,商城页可传 var(--jm-color-brand-rose) 等
   */
  themeColor?: string
}

export interface JmProductGridProps {
  products: JmProductItem[]
  loading?: boolean
  error?: string | null
  onAddToCart?: (product: JmProductItem) => void
  emptyText?: string
  className?: string
  style?: React.CSSProperties
  /**
   * 主题色(跟随页眉色),会透传给所有 JmProductCard
   */
  themeColor?: string
}