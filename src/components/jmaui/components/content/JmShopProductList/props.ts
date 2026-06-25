/**
 * JmShopProductList Props
 * 商城商品列表组件属性(受控模式)
 *
 * 设计:数据由 page 拉取 + 转换,组件只负责渲染。
 *   - page 通过 useEffect 调 get('/api/v1/shop/products')
 *   - page 转换后通过 products 传入
 *   - 组件根据 loading / error / products 渲染对应状态
 */

import type { JmProductItem } from '../JmProductCard/props'

export interface JmShopProductListProps {
  /** 商品列表(由 page 拉取 + 转换后传入) */
  products: JmProductItem[]
  /** 加载中(由 page 维护) */
  loading: boolean
  /** 错误信息(由 page 维护) */
  error: string | null
  /** 加入购物车回调 */
  onAddToCart?: (product: JmProductItem) => void
  /** 商品点击回调 */
  onProductClick?: (product: JmProductItem) => void
  /**
   * 主题色(跟随页眉色),透传给 JmProductGrid → JmProductCard 按钮芯片
   * 默认 #da2e75 玫红
   */
  themeColor?: string
  /** 空态文案,默认 '暂无商品' */
  emptyText?: string
  className?: string
  style?: React.CSSProperties
}
