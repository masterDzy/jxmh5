'use client'

import { useCallback } from 'react'
import type { JmShopProductListProps } from './props'
import { JmProductGrid } from '../JmProductGrid'
import type { JmProductItem } from '../JmProductCard/props'

/**
 * JmShopProductList 商城商品列表组件(受控)
 *
 * @example
 *   // 父页面
 *   const [products, setProducts] = useState<JmProductItem[]>([])
 *   useEffect(() => {
 *     const data = await get('/api/v1/shop/products', { category })
 *     setProducts(data.items.map(toJmProductItem))
 *   }, [category])
 *
 *   <JmShopProductList products={products} loading={loading} error={error} />
 */
export function JmShopProductList({
  products,
  loading,
  error,
  onAddToCart,
  onProductClick,
  emptyText = '暂无商品',
  className = '',
  style,
  themeColor = '#da2e75',
}: JmShopProductListProps) {
  const handleAddToCart = useCallback((product: JmProductItem) => {
    onAddToCart?.(product)
  }, [onAddToCart])

  const handleProductClick = useCallback((product: JmProductItem) => {
    onProductClick?.(product)
  }, [onProductClick])

  return (
    <div className={`shop-product-list ${className}`} style={style}>
      <JmProductGrid
        products={products}
        loading={loading}
        error={error}
        onAddToCart={handleAddToCart}
        onProductClick={handleProductClick}
        emptyText={emptyText}
        themeColor={themeColor}
      />
    </div>
  )
}

export default JmShopProductList
