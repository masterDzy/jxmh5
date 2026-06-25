'use client'

import type { JmHeroBannerProps } from './props'

/**
 * JmHeroBanner 英雄区域组件
 * 用于页面顶部的主视觉区域
 */
export function JmHeroBanner({
  className = '',
  style,
  backgroundColor = '#fafafa',
  backgroundImage,
  height = 'auto',
  children,
}: JmHeroBannerProps) {
  const heightClass = `jm-hero-banner--${height}`

  const bannerStyle: React.CSSProperties = {
    backgroundColor,
    ...(backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : {}),
    ...style,
  }

  return (
    <div className={`jm-hero-banner ${heightClass} ${className}`} style={bannerStyle}>
      <div className="jm-hero-banner__overlay" />
      <div className="jm-hero-banner__content" style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  )
}
