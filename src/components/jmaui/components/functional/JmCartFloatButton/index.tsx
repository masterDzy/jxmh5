'use client'

import type { JmCartFloatButtonProps } from './props'

/**
 * JmCartFloatButton 悬浮购物车按钮
 *
 * 固定在视口右下角的购物车入口浮岛。
 * - 圆形/胶囊形主体，深色背景
 * - 右上角红色角标显示 count（>99 显示 99+）
 * - 可选显示总价（小额绿色）
 * - 触摸热区 ≥ 44×44px
 * - z-index 50（盖在内容上，不盖 modal）
 *
 * @example
 * <JmCartFloatButton
 *   count={cartItems.reduce((s, i) => s + i.quantity, 0)}
 *   totalPrice={cartTotal}
 *   onClick={() => setCartOpen(true)}
 * />
 */
export function JmCartFloatButton({
  count,
  totalPrice,
  onClick,
  position = 'bottom-right',
  themeColor = '#D94E3D',
  className = '',
  style,
}: JmCartFloatButtonProps) {
  const positionClass =
    position === 'bottom-center'
      ? 'jm-cart-float-button--center'
      : 'jm-cart-float-button--right'

  // 动态值：背景色由 themeColor 派生
  const dynamicStyle: React.CSSProperties = {
    ...(themeColor ? { backgroundColor: themeColor } : {}),
    ...(style || {}),
  }

  const displayCount = count > 99 ? '99+' : count

  return (
    <button
      type="button"
      className={`jm-cart-float-button ${positionClass} ${className}`}
      style={dynamicStyle}
      onClick={onClick}
      aria-label="打开购物车"
    >
      {/* 购物车图标 */}
      <svg
        className="jm-cart-float-button__icon"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
      </svg>

      {/* 总价（可选） */}
      {typeof totalPrice === 'number' && totalPrice > 0 && (
        <span className="jm-cart-float-button__price">¥{totalPrice.toFixed(2)}</span>
      )}

      {/* 数量红点 */}
      {count > 0 && (
        <span className="jm-cart-float-button__badge">{displayCount}</span>
      )}
    </button>
  )
}

export default JmCartFloatButton
