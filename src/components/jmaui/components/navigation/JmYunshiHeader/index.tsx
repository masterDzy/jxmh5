'use client'

import type { JmYunshiHeaderProps } from './props'

/**
 * JmYunshiHeader "运势解读"专用页眉组件
 *
 * 布局：徽章(SVG) + 页面名称 + 口号 + 用户头像（右侧）
 *
 * @example
 * <JmYunshiHeader
 *   title="运势解读"
 *   slogan="最妙的生命曲线"
 *   showAvatar
 * />
 */
export function JmYunshiHeader({
  className = '',
  style,
  title = '运势解读',
  slogan = '最妙的生命曲线',
  backgroundColor,
  themeColor = 'var(--jm-color-brand-orange, #fb5c3e)',
  showAvatar = true,
  avatarSrc = '',
  username = '用户',
  fixed = false,
  onSearchClick,
}: JmYunshiHeaderProps) {
  return (
    <header
      className={`jm-yunshi-header ${fixed ? 'jm-yunshi-header--fixed' : ''} ${className}`}
      style={{
        backgroundColor,
        ...style,
      }}
    >
      {/* 左侧：徽章 + 标题 + 口号 */}
      <div className="jm-yunshi-header__left" style={{ marginLeft: '8px' }}>
        {/* 徽章 + 文字组 */}
        <div className="jm-yunshi-header__badge-group">
          {/* 徽章 SVG - geren */}
          <svg
            className="jm-yunshi-header__badge"
            viewBox="0 0 1024 1024"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
          >
            <path
              d="M723.66132 412.937746c42.67403-48.170883 46.330802-106.813726 46.330802-106.813726 0-166.50331-187.760406-203.154843-187.760406-203.154843s-9.75464-46.076102-68.682071-46.076102-69.089462 46.076102-69.089462 46.076102C274.988832 146.949848 253.043655 234.915086 253.043655 305.076629s48.76865 105.766335 48.76865 105.766335c-202.39269 111.00134-169.473949 285.883127-169.473949 285.883127s40.234234 253.419208 381.21064 248.183553 375.926904-246.089421 375.926904-246.089421C924.832487 511.374294 723.66132 412.937746 723.66132 412.937746zM851.728244 679.032203c0 0-31.455513 216.768325-338.333888 221.480284-306.879025 4.711959-343.089381-223.365198-343.089381-223.365198S140.677848 519.754071 322.830944 419.852995c0 0-43.891655-32.044183-43.891655-95.189766s19.750335-142.313909 172.275005-181.896447c0 0 9.145827-41.468751 62.180711-41.468751s61.813604 41.468751 61.813604 41.468751 168.984041 32.986315 168.984041 182.839228c0 0-3.290964 52.778234-41.697462 96.132548C702.495188 421.737909 883.548914 510.330802 851.728244 679.032203z"
              fill={themeColor}
            />
          </svg>

          {/* 标题 + 口号 */}
          <div className="jm-yunshi-header__text-group">
            <h1
              className="jm-yunshi-header__title"
              style={{ color: themeColor }}
            >
              {title}
            </h1>
            <span className="jm-yunshi-header__slogan" style={{ color: '#999' }}>
              {slogan}
            </span>
          </div>
        </div>
      </div>

      {/* 右侧：搜索栏 + 用户头像 */}
      <div className="jm-yunshi-header__right">
        {/* 搜索栏 */}
        <div
          className="jm-yunshi-header__search"
          onClick={onSearchClick}
          role="button"
          tabIndex={0}
          aria-label="搜索"
        >
          <svg className="jm-yunshi-header__search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
          <span className="jm-yunshi-header__search-text">搜索</span>
        </div>

        {/* 用户头像 */}
        {showAvatar && (
          <div className="jm-yunshi-header__avatar" title={username}>
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt={username}
                className="jm-yunshi-header__avatar-img"
              />
            ) : (
              <div
                className="jm-yunshi-header__avatar-placeholder"
                style={{ backgroundColor: themeColor }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}