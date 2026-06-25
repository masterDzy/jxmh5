import type { JmShoppingBagBadgeProps } from './props'

/**
 * JmShoppingBagBadge 购物袋徽章
 *
 * 设计要点:
 * - viewBox 1024×1024,跟其他页眉徽章(莲花/书卷/蝴蝶)同坐标系
 * - 全部 path/rect 用 currentColor,颜色由外部 color CSS 决定
 * - 礼袋口高光用 #ffffff 35% 透明(不染色,保持层次感)
 *
 * 用法(常与 JmOursHeader 配合):
 *   <JmOursHeader themeColor="var(--jm-color-brand-green, #A6BA43)" badgeIcon={<JmShoppingBagBadge color="..." />} />
 */
export function JmShoppingBagBadge({
  color = 'var(--jm-color-brand-green, #A6BA43)',
  className = '',
  size = 32,
}: JmShoppingBagBadgeProps) {
  return (
    <svg
      className={`jm-shopping-bag-badge ${className}`}
      viewBox="0 0 1024 1024"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      style={{ color, display: 'block' }}
      aria-label="购物袋"
    >
      {/* 提手 — U 形弧线 */}
      <path
        d="M352 384c0-79.584 71.776-160 160-160s160 80.416 160 160"
        fill="none"
        stroke="currentColor"
        strokeWidth="48"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* 袋身 — 圆角矩形礼袋造型 */}
      <path
        d="M256 384h512l-44.8 448c-2.4 24-22.4 42.4-46.4 43.2H347.2c-24-0.8-44-19.2-46.4-43.2L256 384z"
        fill="currentColor"
      />
      {/* 礼袋口装饰条(白色高光,增加层次) */}
      <rect
        x="288"
        y="416"
        width="448"
        height="40"
        rx="8"
        fill="#ffffff"
        opacity="0.35"
      />
      {/* 蝴蝶结 — 左半三角 */}
      <path
        d="M512 320l-48-32 48-32 48 32-48 32z"
        fill="currentColor"
      />
      {/* 蝴蝶结 — 中间带 */}
      <path
        d="M464 288h96v32h-96z"
        fill="currentColor"
      />
    </svg>
  )
}

export default JmShoppingBagBadge
