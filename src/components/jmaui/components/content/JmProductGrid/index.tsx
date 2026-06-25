'use client'

import { JmProductCard } from '../JmProductCard'
import type { JmProductGridProps } from './props'

/**
 * JmProductGrid 商品网格组件
 *
 * 网格容器，渲染一组 JmProductCard。支持 2/3 列布局、空状态、加载状态。
 *
 * @example
 * <JmProductGrid
 *   products={products}
 *   onAddToCart={handleAdd}
 *   emptyText="暂无商品"
 * />
 */
export function JmProductGrid({
  products,
  columns = 2,
  loading = false,
  error = null,
  onAddToCart,
  onProductClick,
  emptyText = '暂无商品',
  className = '',
  style,
  themeColor = '#da2e75',
}: JmProductGridProps) {
  if (loading) {
    return (
      <div className={`jm-product-grid jm-product-grid--loading ${className}`} style={style}>
        <div className="jm-product-grid__spinner" />
        <p>加载中...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`jm-product-grid jm-product-grid--error ${className}`} style={style}>
        <p>{error}</p>
      </div>
    )
  }

  if (!products || products.length === 0) {
    return (
      <div className={`jm-product-grid jm-product-grid--empty ${className}`} style={style}>
        <div className="jm-product-grid__empty-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 01-8 0" />
          </svg>
        </div>
        <p>{emptyText}</p>
      </div>
    )
  }

  // 列数修饰符（CSS 备用，移动端默认 2 列）
  const columnsClass = columns === 3 ? 'jm-product-grid--cols-3' : 'jm-product-grid--cols-2'

  return (
    <div
      className={`jm-product-grid ${columnsClass} ${className}`}
      style={style}
    >
      {products.map((product) => (
        <div
          key={product.id}
          className="jm-product-grid__item"
          onClick={onProductClick ? () => onProductClick(product) : undefined}
        >
          <JmProductCard
            product={product}
            onAddToCart={onAddToCart}
            themeColor={themeColor}
          />
        </div>
      ))}
    </div>
  )
}

export default JmProductGrid
