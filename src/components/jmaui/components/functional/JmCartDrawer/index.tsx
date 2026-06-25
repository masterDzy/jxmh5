'use client'

import type { JmCartDrawerProps } from './props'

/**
 * JmCartDrawer 购物车抽屉组件
 *
 * @example
 * <JmCartDrawer
 *   open={showCart}
 *   onClose={() => setShowCart(false)}
 *   items={cartItems}
 *   total={totalPrice}
 *   onUpdateQuantity={updateQuantity}
 *   onRemove={removeItem}
 *   onCheckout={handleCheckout}
 * />
 */
export function JmCartDrawer({
  open,
  onClose,
  items,
  total,
  onUpdateQuantity,
  onRemove,
  onCheckout,
  className = '',
  style,
}: JmCartDrawerProps) {
  if (!open) return null

  return (
    <div className={`jm-cart-drawer ${className}`} style={style}>
      {/* 遮罩层 */}
      <div className="jm-cart-drawer__overlay" onClick={onClose} />

      {/* 抽屉内容 */}
      <div className="jm-cart-drawer__content" onClick={e => e.stopPropagation()}>
        {/* 头部 */}
        <div className="jm-cart-drawer__header">
          <h3>购物车</h3>
          <button onClick={onClose} aria-label="关闭">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* 购物车内容 */}
        <div className="jm-cart-drawer__body">
          {items.length === 0 ? (
            <div className="jm-cart-drawer__empty">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              <p>购物车是空的</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="jm-cart-drawer__item">
                <div className="jm-cart-drawer__item-cover">
                  {item.product.cover_image ? (
                    <img src={item.product.cover_image} alt={item.product.name} />
                  ) : (
                    <div className="jm-cart-drawer__item-placeholder">商品</div>
                  )}
                </div>
                <div className="jm-cart-drawer__item-info">
                  <h4>{item.product.name}</h4>
                  <span className="jm-cart-drawer__item-price">
                    ¥{item.product.price.toFixed(2)}
                  </span>
                </div>
                <div className="jm-cart-drawer__item-actions">
                  <button
                    onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                    aria-label="减少"
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                    aria-label="增加"
                  >
                    +
                  </button>
                  <button
                    onClick={() => onRemove(item.id)}
                    className="jm-cart-drawer__item-delete"
                    aria-label="删除"
                  >
                    删除
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 底部结算 */}
        {items.length > 0 && (
          <div className="jm-cart-drawer__footer">
            <div className="jm-cart-drawer__total">
              <span>合计:</span>
              <span className="jm-cart-drawer__total-price">¥{total.toFixed(2)}</span>
            </div>
            <button className="jm-cart-drawer__checkout" onClick={onCheckout}>
              去结算
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

