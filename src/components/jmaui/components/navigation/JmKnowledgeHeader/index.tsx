/**
 * JmKnowledgeHeader 开心园地页眉组件
 *
 * 布局：竖线 + 开心园地徽章(SVG) + 页面名称 + 口号 + 用户头像（右侧）
 *
 * @example
 * <JmKnowledgeHeader
 *   title="开心园地"
 *   slogan="以专业成就信任"
 *   showAvatar
 * />
 */
'use client'

import type { JmKnowledgeHeaderProps } from './props'

export function JmKnowledgeHeader({
  className = '',
  style,
  title = '开心园地',
  slogan = '以专业成就信任',
  backgroundColor,
  themeColor = 'var(--jm-color-brand-cyan, #2f748a)',
  showAvatar = true,
  avatarSrc = '',
  username = '用户',
  fixed = false,
  onSearchClick,
}: JmKnowledgeHeaderProps) {
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
          {/* 开心园地徽章 SVG */}
          <svg
            className="jm-ours-header__badge"
            viewBox="0 0 1024 1024"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
          >
            <path
              d="M566.4768 762.582109c7.223855 1.210182 14.689745-0.781964 18.822982-2.904436l392.750545-206.829382c13.293382-7.019055 18.394764-23.458909 11.394328-36.789527a27.331491 27.331491 0 0 0-36.77091-11.375709L568.171055 707.639855l-426.542546-91.303564a46.638545 46.638545 0 1 1 19.567709-91.210473c24.892509 4.784873 410.772945 87.468218 411.424582 87.468218 4.263564 0 8.582982-0.986764 12.6976-3.165091l392.750545-206.829381a27.182545 27.182545 0 0 0 2.085237-47.383273 27.294255 27.294255 0 0 0-27.461818-0.763346L567.7056 557.186327l-426.077091-91.042909a46.657164 46.657164 0 0 1 19.567709-91.191854c24.706327 4.338036 384.167564 81.957236 386.029382 81.957236 4.654545 0 8.918109-1.489455 12.827927-3.630545 0 0.055855 394.109673-204.1856 394.109673-204.1856 26.586764-13.758836 24.259491-29.751855-5.082764-35.54211l-382.417454-75.031272c-29.360873-5.771636-75.291927 0.353745-102.139346 13.572654L111.150545 326.060218c-4.784873 2.2528-9.197382 5.213091-13.069963 8.8064a100.463709 100.463709 0 0 0-45.446982 64.474764 101.003636 101.003636 0 0 0 31.315782 96.330473 100.891927 100.891927 0 0 0-31.315782 53.8624 101.040873 101.040873 0 0 0 31.390255 96.404945 101.003636 101.003636 0 0 0 46.247563 173.931055c37.143273 7.968582 437.229382 93.519127 439.109818 93.314327 4.784873-0.484073 11.841164-1.042618 15.937164-3.127855l392.750545-206.903854a27.070836 27.070836 0 0 0 11.412946-36.677818 27.312873 27.312873 0 0 0-36.789527-11.412946l-384.986764 202.752-426.077091-91.173236a46.638545 46.638545 0 0 1 19.567709-91.210473l405.280582 87.151709z m-22.751418-534.379054l183.035345 36.95709-80.523636 38.0928-182.960873-36.901236 80.449164-38.148654z m0 0"
              fill={themeColor}
            />
          </svg>

          {/* 标题 + 口号 */}
          <div className="jm-ours-header__text-group">
            <h1
              className="jm-ours-header__title"
              style={{ color: themeColor }}
            >
              {title}
            </h1>
            <span className="jm-ours-header__slogan" style={{ color: 'var(--jm-color-text-muted, #999)' }}>
              {slogan}
            </span>
          </div>
        </div>
      </div>

      {/* 右侧：搜索栏 + 用户头像 */}
      <div className="jm-ours-header__right">
        {/* 搜索栏 */}
        <div
          className="jm-ours-header__search"
          onClick={onSearchClick}
          role="button"
          tabIndex={0}
          aria-label="搜索"
        >
          <svg className="jm-ours-header__search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
          <span className="jm-ours-header__search-text">搜索</span>
        </div>

        {/* 用户头像 */}
        {showAvatar && (
          <div className="jm-ours-header__avatar" title={username}>
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt={username}
                className="jm-ours-header__avatar-img"
              />
            ) : (
              <div
                className="jm-ours-header__avatar-placeholder"
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

export default JmKnowledgeHeader