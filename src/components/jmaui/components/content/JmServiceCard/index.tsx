'use client'

import { useState, useCallback } from 'react'
import { JmServiceCardProps } from './props'

const formatPrice = (price: number) => {
  if (price >= 10000) {
    return `${(price / 10000).toFixed(1)}万`
  }
  return price.toLocaleString()
}

const JmServiceCard: React.FC<JmServiceCardProps> = ({
  service,
  isActive = false,
  className,
  style,
  total,
  currentIndex = 0,
  onPrev,
  onNext,
  onBookNow,
}) => {
  const [sharing, setSharing] = useState(false)

  const handleShare = useCallback(async () => {
    if (sharing || !service) return
    setSharing(true)
    try {
      const shareData: ShareData = {
        title: service.name,
        text: `${service.name} - ${service.category || '玄学服务'}\n${service.origin || ''}`,
        url: window.location.origin + `/services/${service.slug}`,
      }
      if (navigator.canShare?.(shareData)) {
        await navigator.share(shareData)
      } else {
        await navigator.share({
          title: service.name,
          text: shareData.text,
        })
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') {
        console.error('分享失败:', err)
      }
    } finally {
      setSharing(false)
    }
  }, [sharing, service])

  if (!service) {
    return (
      <div className={`jm-service-card ${className || ''}`} style={style}>
        <div className="jm-service-card__empty">
          暂无服务数据
        </div>
      </div>
    )
  }

  const isPrevDisabled = currentIndex === 0
  const isNextDisabled = total !== undefined && currentIndex === total - 1

  return (
    <div
      className={`jm-service-card ${isActive ? 'is-active' : ''} ${className || ''}`}
      style={{
        // 默认尺寸：保留 inline 以便 props.style 覆盖（外部可调宽窄）
        width: '82vw',
        maxWidth: '320px',
        minWidth: '270px',
        ...style,
      }}
    >

      {/* 分享按钮 */}
      <div className="jm-service-card__share">
        <button
          onClick={handleShare}
          disabled={sharing}
          className={`jm-service-card__share-btn ${sharing ? 'jm-service-card__share-btn--sharing' : ''}`}
          title={sharing ? '分享中...' : '分享'}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A6BA43" strokeWidth="2.5">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
        </button>
      </div>

      {/* 分类标签 */}
      <div className="jm-service-card__category">
        <div className="jm-sc-layout-content" />
        <span className="jm-sc-layout-contentt">
          {service.category || '服务'}
        </span>
      </div>

      {/* 服务名称 */}
      <div className="jm-service-card__name-wrap">
        <h2 className="jm-service-card__name">
          <span className="jm-service-card__name-label">
            {service.name}
          </span>
        </h2>
      </div>

      {/* 缘起 */}
      {service.origin && (
        <div className="jm-service-card__origin">
          <div className="jm-sc-layout-origin">
            缘起
          </div>
          <p className="jm-service-card__origin-text">
            {service.origin}
          </p>
        </div>
      )}

      {/* 分隔线 */}
      <div className="jm-sc-layout-desc" />

      {/* 服务内容项 */}
      {service.content_items && service.content_items.length > 0 && (
        <div className="jm-service-card__content">
          <div className="jm-sc-layout-contentit">
            服务内容
          </div>
          <ul className="jm-service-card__content-list">
            {service.content_items.slice(0, 4).map((item, idx) => (
              <li key={idx} className="jm-service-card__content-item">
                <span className="jm-service-card__content-dot">·</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 咨询方式 & 时长 */}
      {(service.consultation_mode || service.duration) && (
        <div className="jm-service-card__meta">
          {service.consultation_mode && (
            <div>
              <span className="jm-service-card__meta-label">
                咨询方式
              </span>
              <div className="jm-service-card__meta-value">
                {service.consultation_mode}
              </div>
            </div>
          )}
          {service.duration && (
            <div className="jm-service-card__meta-item--right">
              <span className="jm-service-card__meta-label">
                服务时长
              </span>
              <div className="jm-service-card__meta-value">
                {service.duration}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 价格区域 */}
      <div className="jm-service-card__price-row">
        <div className="jm-service-card__price-info">
          <span className="jm-service-card__price-amount">
            {formatPrice(service.price)}
          </span>
          <span className="jm-service-card__price-unit">元</span>

          {service.original_price && service.original_price > service.price && (
            <span className="jm-service-card__price-original">
              ¥{service.original_price.toLocaleString()}
            </span>
          )}

          {service.has_member_price && service.member_price && (
            <span className="jm-service-card__price-member">
              会员 ¥{service.member_price.toLocaleString()}
            </span>
          )}
        </div>

        {/* 立即预约 chip — 仅在传了 onBookNow 时渲染 */}
        {onBookNow && (
          <button
            type="button"
            className="jm-service-card__book-chip"
            onClick={(e) => {
              e.stopPropagation()
              onBookNow(service)
            }}
            aria-label="立即预约"
          >
            立即预约
          </button>
        )}
      </div>

      {/* 附加条件 */}
      {service.additional_rule && (
        <div className="jm-service-card__additional-rule">
          {service.additional_rule}
        </div>
      )}

      {/* 底部信息栏 */}
      <div className="jm-service-card__footer">
        {/* 浏览量 */}
        {service.view_count > 0 && (
          <span className="jm-service-card__views">
            {service.view_count}人看过
          </span>
        )}
        {service.view_count === 0 && <span />}
      </div>

      {/* 卡片内翻页导航 */}
      {total !== undefined && total > 1 && (
        <div className="jm-sv-nav">
          <label
            className={`jm-sv-prev ${isPrevDisabled ? 'jm-sv--disabled' : ''}`}
            onClick={!isPrevDisabled ? onPrev : undefined}
          >
            ← 上一个
          </label>
          <span className="jm-sv-count">
            {currentIndex !== undefined ? currentIndex + 1 : 1} / {total}
          </span>
          <label
            className={`jm-sv-next ${isNextDisabled ? 'jm-sv--disabled' : ''}`}
            onClick={!isNextDisabled ? onNext : undefined}
          >
            下一个 →
          </label>
        </div>
      )}
    </div>
  )
}

export default JmServiceCard
