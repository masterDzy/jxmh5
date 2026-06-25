'use client'

import { useState } from 'react'
import type { JmProductCardProps, JmProductItem, JmProductGridProps } from './props'
import { colors } from '../../../tokens'

/**
 * JmProductCard 商品卡片组件
 *
 * @example
 * <JmProductCard
 *   product={{
 *     id: 1,
 *     name: "开光金蟾摆件",
 *     cover_image: "https://...",
 *     price: 299.00,
 *     original_price: 399.00,
 *     stock: 50,
 *   }}
 *   onAddToCart={(p) => handleAdd(p)}
 * />
 */
export function JmProductCard({
  product,
  onAddToCart,
  className = '',
  style,
  themeColor = '#da2e75',
}: JmProductCardProps) {
  const [adding, setAdding] = useState(false)

  const handleAddToCart = async () => {
    if (product.stock <= 0) {
      return
    }
    if (adding) return

    setAdding(true)
    try {
      onAddToCart?.(product)
    } finally {
      setAdding(false)
    }
  }

  const hasDiscount = product.original_price && product.original_price > product.price

  return (
    <div
      className={`jm-product-card ${className}`}
      style={{ ...style, '--product-theme-color': themeColor } as React.CSSProperties}
    >
      {/* 商品封面 */}
      <div className="jm-product-card__cover">
        {product.cover_image ? (
          <img src={product.cover_image} alt={product.name} />
        ) : (
          <div className="jm-product-card__placeholder">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
          </div>
        )}
        {/* 虚拟商品标识 */}
        {product.is_virtual && (
          <span className="jm-product-card__badge">虚拟</span>
        )}
        {/* 缺货标识 */}
        {product.stock <= 0 && (
          <div className="jm-product-card__soldout">售罄</div>
        )}
      </div>

      {/* 商品信息 */}
      <div className="jm-product-card__info">
        <h3 className="jm-product-card__name">{product.name}</h3>

        {/* 价格 */}
        <div className="jm-product-card__price">
          <span className="jm-product-card__price-current">
            ¥{product.price.toFixed(2)}
          </span>
          {hasDiscount && (
            <span className="jm-product-card__price-original">
              ¥{product.original_price!.toFixed(2)}
            </span>
          )}
        </div>

        {/* 加入购物车按钮 */}
        <button
          className="jm-product-card__add"
          onClick={handleAddToCart}
          disabled={adding || product.stock <= 0}
        >
          {adding ? '添加中...' : product.stock <= 0 ? '已售罄' : '加入购物车'}
        </button>
      </div>
    </div>
  )
}

