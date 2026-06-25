'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { JmFooterProps } from './props'

// SVG 图标组件
const IconServices = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
)

const IconYunshi = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 3v2M12 19v2M3 12h2M19 12h2" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const IconBooking = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M3 10h18" />
    <path d="M8 2v4M16 2v4" />
    <path d="M9 14l2 2 4-4" />
  </svg>
)

const IconGarden = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
    <circle cx="9" cy="10" r="1" fill="currentColor" />
    <circle cx="15" cy="10" r="1" fill="currentColor" />
  </svg>
)

const IconShop = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <path d="M3 6h18" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
)

// 默认每个 Tab 的选中色(从全局 CSS 变量读,可在 props.themeColors 覆盖)
// 与全局品牌色 = 页眉主题色约定保持一致
const DEFAULT_THEME_COLORS: Record<string, string> = {
  '/services':  'var(--jm-color-brand-rose, #da2e75)',         // 玫红
  '/yunshi':    'var(--jm-color-brand-amber, #ffad4f)',         // 橙黄
  '/booking':   'var(--jm-color-brand-vermilion, #D94E3D)',     // 朱红
  '/knowledge': 'var(--jm-color-brand-cyan, #2f748a)',          // 青
  '/shop':      'var(--jm-color-brand-green, #A6BA43)',         // 苔绿
}

const defaultTabs = [
  { label: '我们的服务', url: '/services', icon: <IconServices /> },
  { label: '运势解读', url: '/yunshi', icon: <IconYunshi /> },
  { label: '立即预约', url: '/booking', icon: <IconBooking /> },
  { label: '开心园地', url: '/knowledge', icon: <IconGarden /> },
  { label: '幸运商城', url: '/shop', icon: <IconShop /> },
]

export function JmFooter({
  className = '',
  style,
  tabs = defaultTabs,
  layoutStyle = 'icon-top-text-bottom',
  backgroundColor = '#ffffff',
  textColor = '#6b6b6b',
  iconColor = '#6b6b6b',
  activeColor = 'var(--jm-color-brand-vermilion, #D94E3D)',
  themeColors,
}: JmFooterProps) {
  const pathname = usePathname()

  const isActive = (url: string) => {
    if (url === '/') return pathname === '/'
    return pathname.startsWith(url)
  }

  // 合并 themeColors(props 优先,未指定则用默认从 CSS 变量读)
  const resolvedThemeColors: Record<string, string> = {
    ...DEFAULT_THEME_COLORS,
    ...themeColors,
  }

  return (
    <footer
      className={`jm-footer jm-footer--${layoutStyle} ${className}`}
      style={{ backgroundColor, ...style }}
    >
      {tabs.map((tab, index) => {
        const active = isActive(tab.url)
        const tabActiveColor = resolvedThemeColors[tab.url] || activeColor

        return (
          <Link
            key={index}
            href={tab.url}
            className={`jm-footer__tab ${active ? 'jm-footer__tab--active' : ''}`}
            data-active-color={tabActiveColor}
          >
            <span
              className="jm-footer__tab-icon"
              style={{ color: active ? tabActiveColor : iconColor }}
            >
              {tab.icon}
            </span>
            <span
              className="jm-footer__tab-label"
              style={{ color: active ? tabActiveColor : textColor }}
            >
              {tab.label}
            </span>
          </Link>
        )
      })}
    </footer>
  )
}