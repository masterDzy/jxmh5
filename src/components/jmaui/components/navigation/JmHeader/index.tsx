'use client'

import { JmUserMenu } from '@/components/jmaui/components/navigation/JmUserMenu'
import type { JmHeaderProps } from './props'

/**
 * JmHeader 页头组件
 * 用于页面顶部的导航栏
 */
export function JmHeader({
  className = '',
  style,
  title = '',
  showBack = false,
  onBackClick,
  showMenu = false,
  showMore = false,
  variant = 'landing',
  backgroundColor,
  textColor = '#1a1a1a',
}: JmHeaderProps) {
  const variantClass = `jm-header--${variant}`

  const headerStyle: React.CSSProperties = {
    ...(backgroundColor ? { backgroundColor } : {}),
    ...style,
  }

  return (
    <header className={`jm-header ${variantClass} ${className}`} style={headerStyle}>
      <div className="jm-header__left">
        {showBack && (
          <button className="jm-header__btn" aria-label="返回" onClick={onBackClick}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        )}
        {showMenu && (
          <button className="jm-header__btn" aria-label="菜单">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {title && (
        <h1 className="jm-header__title" style={{ color: textColor }}>
          {title}
        </h1>
      )}

      <div className="jm-header__right">
        {showMore && (
          <button className="jm-header__btn" aria-label="更多">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="1" fill="currentColor" />
              <circle cx="19" cy="12" r="1" fill="currentColor" />
              <circle cx="5" cy="12" r="1" fill="currentColor" />
            </svg>
          </button>
        )}
        <JmUserMenu themeColor="var(--page-theme-color, #da5343)" />
      </div>
    </header>
  )
}
