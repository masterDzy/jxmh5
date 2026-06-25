'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { JmServiceCarouselProps, JmServiceItem } from './props'
import JmServiceCard from '../JmServiceCard'

function DotIndicator({ total, current, onChange }: { total: number; current: number; onChange: (i: number) => void }) {
  return (
    <div className="jm-sc__dots" role="tablist" aria-label="服务卡片指示器">
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          className={`jm-sc__dot ${i === current ? 'jm-sc__dot--active' : ''}`}
          role="tab"
          aria-selected={i === current}
          aria-label={`跳转到第 ${i + 1} 个服务`}
        />
      ))}
    </div>
  )
}

function groupByCategory(services: JmServiceItem[]): Record<string, JmServiceItem[]> {
  const groups: Record<string, JmServiceItem[]> = {}
  services.forEach((s) => {
    const cat = s.category || '未分类'
    if (!groups[cat]) groups[cat] = []
    groups[cat].push(s)
  })
  return groups
}

export default function JmServiceCarousel({ services, onServiceClick }: JmServiceCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [activeCategory, setActiveCategory] = useState('全部')
  const categories = groupByCategory(services)

  const categoryLabels = ['全部', ...Object.keys(categories)]

  const filteredServices = activeCategory === '全部'
    ? services
    : services.filter(s => (s.category || '未分类') === activeCategory)

  const getCurrentCategory = useCallback(() => {
    return services[currentIndex]?.category || ''
  }, [services, currentIndex])

  const getCurrentInCategory = useCallback(() => {
    const currentService = filteredServices[currentIndex]
    if (!currentService) return { current: 0, total: 0 }
    const cat = currentService.category || '未分类'
    const catServices = categories[cat] || []
    const idx = catServices.findIndex((s) => s.id === currentService.id)
    return { current: idx + 1, total: catServices.length }
  }, [filteredServices, categories, currentIndex])

  useEffect(() => {
    const scrollEl = scrollRef.current
    if (!scrollEl) return

    const handleScroll = () => {
      const scrollLeft = scrollEl.scrollLeft
      const cardWidth = scrollEl.offsetWidth * 0.82 + 16
      const newIndex = Math.round(scrollLeft / cardWidth)
      if (newIndex !== currentIndex && newIndex >= 0 && newIndex < filteredServices.length) {
        setCurrentIndex(newIndex)
      }
    }

    scrollEl.addEventListener('scroll', handleScroll, { passive: true })
    return () => scrollEl.removeEventListener('scroll', handleScroll)
  }, [currentIndex, filteredServices.length])

  const scrollToCard = (index: number) => {
    const scrollEl = scrollRef.current
    if (!scrollEl) return
    const cardWidth = scrollEl.offsetWidth * 0.82 + 16
    scrollEl.scrollTo({ left: cardWidth * index, behavior: 'smooth' })
    setCurrentIndex(index)
  }

  const currentCategory = activeCategory === '全部' ? (filteredServices[currentIndex]?.category || '') : activeCategory
  const { current: inCatCurrent, total: inCatTotal } = getCurrentInCategory()

  return (
    <div className="jm-sc">
      <div className="jm-sc__tabs">
        {categoryLabels.map((label, idx) => (
          <button
            key={label}
            type="button"
            onClick={() => {
              setActiveCategory(label)
              setCurrentIndex(0)
              if (scrollRef.current) {
                scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' })
              }
            }}
            className={`jm-sc__tab ${activeCategory === label ? 'jm-sc__tab--active' : ''}`}
          >
            <span
              className={`jm-sc__tab-dot ${activeCategory === label ? 'jm-sc__tab-dot--active' : ''}`}
              aria-hidden="true"
            />
            <span className="jm-sc__tab-label">{label}</span>
            {idx < categoryLabels.length - 1 && <span className="jm-sc__tab-divider" aria-hidden="true" />}
          </button>
        ))}
      </div>

      <div ref={scrollRef} className="jm-sc__track">
        {filteredServices.map((service, index) => (
          <div
            key={service.id}
            className="jm-sc__card-snap"
            onClick={() => onServiceClick?.(service)}
          >
            <JmServiceCard service={service} isActive={index === currentIndex} />
          </div>
        ))}
        {filteredServices.length === 0 && (
          <div className="jm-sc__empty">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
              <circle cx="24" cy="24" r="20" stroke="#e0e0e0" strokeWidth="2" strokeDasharray="4 4" />
              <path d="M18 24h12M24 18v12" stroke="#e0e0e0" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span className="jm-sc__empty-text">暂无相关服务</span>
          </div>
        )}
      </div>

      <div className="jm-sc__dots-wrap">
        <DotIndicator total={filteredServices.length} current={currentIndex} onChange={scrollToCard} />
      </div>

      <div className="jm-sc__meta">
        <div className="jm-sc__meta-left">
          <div className="jm-sc__meta-tag">当前分类</div>
          <div className="jm-sc__meta-name">{currentCategory || '服务'}</div>
        </div>
        <div className="jm-sc__meta-right">
          <div className="jm-sc__meta-tag jm-sc__meta-tag--muted">分类内服务</div>
          <div className="jm-sc__meta-count">{inCatCurrent} / {inCatTotal}</div>
        </div>
      </div>
    </div>
  )
}
