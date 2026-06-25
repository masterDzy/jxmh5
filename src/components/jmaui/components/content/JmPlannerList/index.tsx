'use client'

import { Fragment, useEffect, useState } from 'react'
import { JmPlannerListProps, PlannerItem } from './props'
import { plannerAPI } from '@/lib/mobile-api'
import { SPACE_LABEL_MAP, type DeliverySpace } from '@/lib/delivery'
import { JmDateTimePicker } from '@/components/jmaui/components/functional/JmDateTimePicker'

const formatPrice = (n: number): string => {
  return n > 0 ? `¥${Math.round(n)}` : '价格待定'
}

export function JmPlannerList({
  themeColor = 'var(--jm-color-brand-vermilion, #D94E3D)',
  selectedPlannerId = null,
  selectedDeliverySpace = null,
  dates,
  selectedDateIndex = null,
  selectedTime = null,
  address = '',
  onPlannerSelect,
  onDeliverySpaceChange,
  onDateChange,
  onTimeChange,
  onAddressChange,
  onBookNow,
  className = '',
}: JmPlannerListProps) {
  const [planners, setPlanners] = useState<PlannerItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [avatarFailed, setAvatarFailed] = useState<Set<number>>(new Set())

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    ;(async () => {
      try {
        const res = await plannerAPI.getPlanners()
        if (cancelled) return
        if (res.error || !res.data) {
          throw new Error(res.message || '策划师接口返回异常')
        }
        setPlanners(res.data.planners)
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : String(e))
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  const controlledMode = typeof onPlannerSelect === 'function'

  const renderDeliveryRadios = (p: PlannerItem, isSelected: boolean) => {
    if (!controlledMode) return null

    return (
      <div className="jm-pl__delivery">
        <div className="jm-pl__delivery-label">交付方式</div>
        <div className="jm-pl__delivery-options">
          {(['online', 'onsite'] as DeliverySpace[]).map(space => (
            <label
              key={space}
              className={`jm-pl__delivery-radio${selectedDeliverySpace === space ? ' jm-pl__delivery-radio--active' : ''}`}
            >
              <input
                type="radio"
                name={`delivery-space-${p.id}`}
                className="jm-pl__delivery-radio-input"
                checked={selectedDeliverySpace === space}
                onChange={() => {
                  if (!isSelected && onPlannerSelect) {
                    onPlannerSelect(p)
                  }
                  onDeliverySpaceChange?.(space)
                }}
              />
              <span className="jm-pl__delivery-radio-label">{SPACE_LABEL_MAP[space]}</span>
            </label>
          ))}
        </div>
      </div>
    )
  }

  const renderInlineDatePicker = () => {
    if (!selectedDeliverySpace || !dates || dates.length === 0 || !onDateChange || !onTimeChange) return null

    return (
      <div className="jm-pl__date-area">
        <JmDateTimePicker
          dates={dates}
          selectedDateIndex={selectedDateIndex}
          selectedTime={selectedTime}
          onDateChange={onDateChange}
          onTimeChange={onTimeChange}
          themeColor={themeColor}
        />
      </div>
    )
  }

  const renderAddressInput = () => {
    if (selectedDeliverySpace !== 'onsite' || !onAddressChange) return null

    return (
      <div className="jm-pl__address-area">
        <div className="jm-pl__address-label">线下地址</div>
        <input
          type="text"
          className="jm-pl__address-input"
          placeholder="请输入线下会面地址"
          value={address}
          onChange={e => onAddressChange(e.target.value)}
        />
      </div>
    )
  }

  return (
    <div
      className={`jm-pl ${className}`}
      style={{ '--pl-color': themeColor } as React.CSSProperties}
    >
      {loading && (
        <div className="jm-pl__loading" role="status" aria-live="polite">
          <div className="jm-pl__spinner" />
          <span>策划师加载中...</span>
        </div>
      )}

      {!loading && error && (
        <div className="jm-pl__error" role="alert">
          <p>策划师加载失败：{error}</p>
          <button type="button" className="jm-pl__retry" onClick={() => { setError(null); setPlanners([]); setLoading(true) }}>
            重试
          </button>
        </div>
      )}

      {!loading && !error && planners.length === 0 && (
        <div className="jm-pl__empty">暂无策划师</div>
      )}

      {!loading && !error && planners.length > 0 && (
        <div className="jm-pl__list">
          {planners
            .filter(p => selectedPlannerId === null || p.id === selectedPlannerId)
            .map(p => {
            const placeholderChar = p.name.trim().charAt(0) || '?'
            const showPlaceholder = !p.avatar_url || avatarFailed.has(p.id)
            const isSelected = selectedPlannerId === p.id
            return (
              <Fragment key={p.id}>
                <div
                  className={`jm-pl__card${isSelected ? ' jm-pl-card--selected' : ''}`}
                  onClick={() => { if (controlledMode) onPlannerSelect!(p) }}
                  role={controlledMode ? 'button' : undefined}
                  aria-pressed={controlledMode ? isSelected : undefined}
                  tabIndex={controlledMode ? 0 : undefined}
                >
                  <div className="jm-pl__avatar">
                    {showPlaceholder ? (
                      <div className="jm-pl__placeholder" aria-hidden>{placeholderChar}</div>
                    ) : (
                      <img src={p.avatar_url!} alt={p.name} loading="lazy"
                        onError={() => { setAvatarFailed(prev => { const next = new Set(prev); next.add(p.id); return next }) }} />
                    )}
                  </div>

                  <div className="jm-pl__body">
                    <div className="jm-pl__name">{p.name}</div>
                    <div className="jm-pl__specialty">{p.specialty}</div>
                    <div className="jm-pl__desc">{p.description}</div>
                    <div className="jm-pl__prices">
                      <span className="jm-pl__price-single">
                        <span className="jm-pl__price-label">单次答疑</span>
                        <span className="jm-pl__price-num">{formatPrice(p.single_price)}</span>
                      </span>
                      <span className="jm-pl__price-sep" aria-hidden>·</span>
                      <span className="jm-pl__price-full">
                        <span className="jm-pl__price-label">全案策划</span>
                        <span className="jm-pl__price-num">{formatPrice(p.full_price)}</span>
                      </span>
                    </div>
                    {controlledMode && renderDeliveryRadios(p, isSelected)}
                  </div>

                  {!controlledMode && onBookNow && (
                    <button type="button" className="jm-pl__book" onClick={(e) => { e.stopPropagation(); onBookNow(p) }} aria-label={`${p.name} - 立即预约`}>
                      立即预约
                    </button>
                  )}
                </div>

                {isSelected && controlledMode && (
                  <div className="jm-pl-card__inline-extras">
                    {renderInlineDatePicker()}
                    {renderAddressInput()}
                  </div>
                )}
              </Fragment>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default JmPlannerList
