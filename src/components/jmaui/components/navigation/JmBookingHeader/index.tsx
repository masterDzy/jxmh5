'use client'

import { JmUserMenu } from '@/components/jmaui/components/navigation/JmUserMenu'
import type { JmBookingHeaderProps } from './props'

/**
 * JmBookingHeader "预约咨询"专用页眉组件
 *
 * 布局：竖线 + 徽章(SVG) + 页面名称 + 口号 + 用户头像（右侧）
 *
 * @example
 * <JmBookingHeader
 *   title="预约咨询"
 *   slogan="相约只是开始"
 *   showAvatar
 * />
 */
export function JmBookingHeader({
  className = '',
  style,
  title = '预约咨询',
  slogan = '相约只是开始',
  backgroundColor,
  themeColor = 'var(--jm-color-brand-vermilion, #D94E3D)',
  showAvatar = true,
  avatarSrc = '',
  username = '用户',
  fixed = false,
  onSearchClick,
}: JmBookingHeaderProps) {
  return (
    <header
      className={`jm-booking-header ${fixed ? 'jm-booking-header--fixed' : ''} ${className}`}
      style={{
        backgroundColor,
        ...style,
      }}
    >
      {/* 左侧：徽章 + 标题 + 口号 */}
      <div className="jm-booking-header__left" style={{ marginLeft: '8px' }}>
        {/* 徽章 + 文字组 */}
        <div className="jm-booking-header__badge-group">
          {/* 徽章 SVG - yuyue */}
          <svg
            className="jm-booking-header__badge"
            viewBox="0 0 1024 1024"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
          >
            <path
              d="M917.4 164.4c-15.1-6.1-31.1-9.6-47.3-10.2-55.7-9.2-131.4 5-191.2 35.8 17.7-41.4-49.6-23.3-75.2-16.9-82.3 20.5-156.4 57.5-222.3 108 5.8-35.2-40.5-14.7-73.7 11.7-65.5 52-117.5 114.1-149.3 189.3-28.3 66.9-28.1 134.7-2.7 197.8 85.9-90.8 167.5-177.7 272.6-265 117.6-97.9 258.2-173.2 339.8-180-307.6 148.5-511 394-708.9 644.8h342.7V867H95.3c6-2.4 11.4-6.1 15.9-10.9 22.8-23.9 41.5-51.5 65.7-74.2 30.5-28.6 32.2-26.3 58.4-26.9 50.9-1.3 102.5-4.8 152.5-13.6 106.4-18.6 197.3-65.2 266.7-145.5 17.4-20.1 34.1-54.1-10.6-52.8 15.7-7.2 27-11.5 37.4-17.1 81.6-43.5 157.2-93.4 205.1-172.4 13-21.2 27.8-62-16-54 24-22.5 47.9-41.1 66.8-63.3 28.5-32.9 21.1-55.6-19.8-71.9z"
              fill={themeColor}
            />
          </svg>

          {/* 标题 + 口号 */}
          <div className="jm-booking-header__text-group">
            <h1
              className="jm-booking-header__title"
              style={{ color: themeColor }}
            >
              {title}
            </h1>
            <span className="jm-booking-header__slogan" style={{ color: '#999' }}>
              {slogan}
            </span>
          </div>
        </div>
      </div>

      {/* 右侧：搜索栏 + 用户头像 */}
      <div className="jm-booking-header__right">
        {/* 搜索栏 */}
        <div
          className="jm-booking-header__search"
          onClick={onSearchClick}
          role="button"
          tabIndex={0}
          aria-label="搜索"
        >
          <svg className="jm-booking-header__search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
          <span className="jm-booking-header__search-text">搜索</span>
        </div>

        {/* 用户入口 */}
        {showAvatar && <JmUserMenu themeColor={themeColor} avatarSrc={avatarSrc} />}
      </div>
    </header>
  )
}