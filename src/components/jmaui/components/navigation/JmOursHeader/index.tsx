'use client'

import { JmUserMenu } from '@/components/jmaui/components/navigation/JmUserMenu'
import type { JmOursHeaderProps } from './props'

/**
 * JmOursHeader "我们的服务"专用页眉组件
 *
 * 布局：竖线 + 徽章(SVG) + 页面名称 + 口号 + 用户头像（右侧）
 *
 * @example
 * <JmOursHeader
 *   title="我们的服务"
 *   slogan="以专业成就信任"
 *   showAvatar
 * />
 */
export function JmOursHeader({
  className = '',
  style,
  title = '我们的服务',
  slogan = '以专业成就信任',
  backgroundColor,
  themeColor = 'var(--jm-color-brand-rose, #da2e75)',
  showAvatar = true,
  avatarSrc = '',
  username = '用户',
  fixed = false,
  onSearchClick,
  badgeIcon,
}: JmOursHeaderProps) {
  return (
    <header
      className={`jm-ours-header ${fixed ? 'jm-ours-header--fixed' : ''} ${className}`}
      style={{
        backgroundColor,
        ...style,
      }}
    >
      {/* 左侧：徽章 + 标题 + 口号 */}
      <div className="jm-ours-header__left" style={{ marginLeft: '8px' }}>
        {/* 徽章 + 文字组 */}
        <div className="jm-ours-header__badge-group">
          {/* 徽章 SVG — 默认莲花 lianh2,可通过 badgeIcon prop 替换(商城/知识/预约各传不同) */}
          {badgeIcon ?? (
            <svg
              className="jm-ours-header__badge"
              viewBox="0 0 1024 1024"
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
            >
              <path
                d="M391.944828 842.151724l61.793103 33.544828-33.544828-61.793104c-63.558621-118.289655-97.103448-236.57931-97.103448-351.337931v-17.655172l1.765517-19.42069-7.062069-5.296552c-52.965517-40.606897-107.696552-72.386207-167.724137-95.337931l-22.951725-8.827586-3.531034 24.717242C102.4 448.441379 123.586207 554.372414 183.613793 653.241379c44.137931 74.151724 114.758621 137.710345 208.331035 188.910345zM699.144828 462.565517c0 114.758621-31.77931 233.048276-97.103449 351.337931l-33.544827 61.793104 61.793103-33.544828c93.572414-52.965517 164.193103-116.524138 208.331035-188.910345 60.027586-98.868966 79.448276-204.8 61.793103-314.262069l-3.531034-24.717241-22.951725 8.827586c-60.027586 22.951724-114.758621 54.731034-165.95862 95.337931l-10.593104 5.296552 1.765518 19.42069c-1.765517 7.062069 0 12.358621 0 19.420689z"
                fill={themeColor}
              />
              <path
                d="M526.124138 105.931034l-15.889655-17.655172-15.889655 17.655172c-86.510345 98.868966-128.882759 218.924138-128.882759 356.634483 0 134.17931 42.372414 264.827586 128.882759 386.648276l17.655172 24.717241 17.655172-24.717241c84.744828-121.82069 128.882759-252.468966 128.882759-386.648276-1.765517-137.710345-45.903448-257.765517-132.413793-356.634483zM979.862069 729.158621c-40.606897-12.358621-79.448276-17.655172-120.055172-17.655173h-10.593104l-7.062069 8.827586c-52.965517 68.855172-127.117241 127.117241-218.924138 173.02069L564.965517 921.6l63.558621 10.593103c24.717241 3.531034 49.434483 5.296552 70.62069 5.296552 40.606897 0 75.917241-5.296552 109.462069-17.655172 107.696552-40.606897 162.427586-128.882759 180.082758-158.896552l14.124138-22.951724-22.951724-8.827586zM178.317241 718.565517l-7.062069-8.827586h-10.593103c-38.841379 1.765517-79.448276 7.062069-116.524138 17.655172l-26.482759 8.827587 14.124138 22.951724c17.655172 30.013793 74.151724 120.055172 180.082759 158.896552 31.77931 12.358621 68.855172 17.655172 109.462069 17.655172 22.951724 0 45.903448-1.765517 68.855172-5.296552l63.558621-10.593103-58.262069-28.248276c-90.041379-45.903448-164.193103-104.165517-217.158621-173.02069z"
                fill={themeColor}
              />
            </svg>
          )}

          {/* 标题 + 口号 */}
          <div className="jm-ours-header__text-group">
            <h1
              className="jm-ours-header__title"
              style={{ color: themeColor }} /* 页面名称用玫红，呼应徽章 */
            >
              {title}
            </h1>
            <span className="jm-ours-header__slogan" style={{ color: '#999' }}>
              {slogan}
            </span>
          </div>
        </div>
      </div>

      {/* 右侧：搜索栏 + 用户头像 */}
      <div className="jm-ours-header__right">
        {/* 搜索栏 */}
        <div className="jm-ours-header__search" onClick={onSearchClick} role="button" tabIndex={0}>
          <svg className="jm-ours-header__search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
          <span className="jm-ours-header__search-text">搜索</span>
        </div>

        {/* 用户入口 */}
        {showAvatar && <JmUserMenu themeColor={themeColor} avatarSrc={avatarSrc} />}
      </div>
    </header>
  )
}
