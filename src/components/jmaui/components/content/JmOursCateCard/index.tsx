'use client'

import type { JmOursCateCardProps } from './props'

/**
 * JmOursCateCard 服务分类卡片
 *
 * 顶部：左边标题标签 + 右边空白
 * 下方：子类项垂直展示
 */
export function JmOursCateCard({
  className = '',
  style,
  title,
  items,
  onItemClick,
  themeColor = '#da2e75',
}: JmOursCateCardProps) {
  return (
    <div className={`jm-category-card ${className}`} style={style}>
      {/* 顶部标题行 */}
      <div className="jm-category-card__header">
        {/* 左侧标题标签 */}
        <div className="jm-category-card__header-label">
          <span className="jm-category-card__header-title">{title}</span>
        </div>
        {/* 右侧空白区域 */}
        <div className="jm-category-card__header-empty" />
      </div>

      {/* 子分类项列表 */}
      <div className="jm-category-card__items">
        {items.map((item, index) => (
          <button
            key={index}
            className="jm-category-card__item"
            onClick={() => onItemClick?.(item, index)}
          >
            <span className="jm-category-card__item-dot" style={{ background: themeColor }} />
            <span className="jm-category-card__item-name">{item.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default JmOursCateCard
