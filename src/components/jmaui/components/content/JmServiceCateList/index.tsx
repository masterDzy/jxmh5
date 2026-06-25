'use client'

import { useState, useEffect } from 'react'
import type { JmServiceCateListProps, JmServiceCateListItem, JmServiceItem } from './props'

export type { JmServiceCateListItem, JmServiceItem }

/**
 * JmServiceCateList 服务分类列表组件（书卷·竖式目录）
 *
 * 点击分类标题 → 原地上方展开预览卡片（两栏小卡片）
 *
 * @example
 * <JmServiceCateList
 *   categories={categories}
 *   onPreviewCardClick={onPreviewCardClick}
 * />
 */
export function JmServiceCateList({
  className = '',
  style,
  categories,
  loading = false,
  error = null,
  onCategoryClick,
  onServiceClick,
  themeColor = '#da2e75',
  accentColor = '#D94E3D',
  onPreviewCardClick,
}: JmServiceCateListProps) {
  // 当前激活的类目
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null)

  // 当前选中的服务索引
  const [activeServiceIndex, setActiveServiceIndex] = useState(0)

  // 排序后的分类列表
  const [orderedCategories, setOrderedCategories] = useState<JmServiceCateListItem[]>(categories)

  // 同步外部 categories 变化
  useEffect(() => {
    setOrderedCategories(categories)
  }, [categories])

  // 点击类目标题 → 原地展开/收起
  const handleCategoryClick = (item: JmServiceCateListItem) => {
    const isSameCategory = activeCategoryId === item.id

    if (isSameCategory) {
      setActiveCategoryId(null)
      setOrderedCategories(categories)
    } else {
      setActiveCategoryId(item.id)
      setActiveServiceIndex(0)
      setOrderedCategories([item, ...categories.filter(c => c.id !== item.id)])
      onCategoryClick?.(item)
    }
  }

  // 点击预览小卡片
  const handlePreviewCardClick = (service: JmServiceItem, category: JmServiceCateListItem, index: number) => {
    setActiveServiceIndex(index)
    onPreviewCardClick?.(service, category, index)
  }

  // 渲染预览小卡片 - 极简产品目录
  const renderPreviewCards = (category: JmServiceCateListItem) => (
    <div className="jm-service-cate-list__preview-grid">
      {category.services.map((svc, idx) => (
        <div
          key={svc.id}
          className="jm-service-cate-list__preview-item"
          onClick={() => handlePreviewCardClick(svc, category, idx)}
        >
          <div className="jm-service-cate-list__preview-item-name">{svc.name}</div>
          {category.previewSubs?.[svc.id] && (
            <div className="jm-service-cate-list__preview-item-sub">
              {category.previewSubs[svc.id]}
            </div>
          )}
        </div>
      ))}
    </div>
  )

  return (
    <div className={`jm-service-cate-list ${className}`} style={style}>
      <div className="jm-service-cate-list__scrolls">
        {loading ? (
          <div className="jm-service-cate-list__loading">
            <div className="jm-service-cate-list__spinner" />
          </div>
        ) : error ? (
          <div className="jm-service-cate-list__empty">{error}</div>
        ) : orderedCategories.length === 0 ? (
          <div className="jm-service-cate-list__empty">暂无服务内容</div>
        ) : orderedCategories.map((item, index) => {
          const isActive = activeCategoryId === item.id
          return (
            <div
              key={item.id}
              className={`jm-service-cate-list__scroll ${isActive ? 'jm-service-cate-list__scroll--open' : ''}`}
            >
              {/* 卷头部 - 点击展开/收起 */}
              <button
                className="jm-service-cate-list__scroll-header"
                onClick={() => handleCategoryClick(item)}
              >
                <div className="jm-service-cate-list__scroll-left">
                  <span className="jm-service-cate-list__scroll-num">
                    {String((item.originalIndex ?? index) + 1).padStart(2, '0')}
                  </span>
                </div>
                <div className="jm-service-cate-list__meta">
                  <div className="jm-service-cate-list__scroll-title">{item.name}</div>
                </div>
              </button>

              {/* 展开时显示预览小卡片 */}
              {isActive && (
                <div className="jm-service-cate-list__preview-slot">
                  {renderPreviewCards(item)}
                </div>
              )}

              {/* 分隔线 */}
              {index < orderedCategories.length - 1 && (
                <div className="jm-service-cate-list__divider" />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default JmServiceCateList