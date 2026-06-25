/**
 * JmYunshiDrawer 运势内容底部抽屉组件
 *
 * 功能：
 * - 点击属相后从底部滑出
 * - 支持拖拽滑动关闭（swipe down to dismiss）
 * - 展示运势内容（周/月运势切换）
 * - 展示5个维度：综合、健康、事业、财运、婚恋
 */

'use client'

import { useState, useCallback, useRef, useEffect } from 'react'

// ============================================================
// 常量数据
// ============================================================

const ZODIAC_NAMES = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪']
const ZODIAC_EMOJI = ['🐀', '🐂', '🐯', '🐰', '🐉', '🐍', '🐴', '🐑', '🐒', '🐔', '🐶', '🐷']

// 维度配置
const DIMENSIONS = [
  { key: 'overall', label: '综合', icon: '✨' },
  { key: 'health', label: '健康', icon: '💪' },
  { key: 'career', label: '事业', icon: '📈' },
  { key: 'wealth', label: '财运', icon: '💰' },
  { key: 'love', label: '婚恋', icon: '💕' },
] as const

// ============================================================
// 类型定义
// ============================================================

export interface FortuneData {
  zodiac_id: number
  period_type: 'day' | 'week' | 'month'
  period_start: string
  period_end: string
  overall_score: number
  overall_content: string
  health_score: number
  health_content: string
  career_score: number
  career_content: string
  wealth_score: number
  wealth_content: string
  love_score: number
  love_content: string
  lucky_direction?: string
  lucky_color?: string
  lucky_number?: string
  lucky_item?: string
  lucky_words?: string
  taboo?: string
}

export interface JmYunshiDrawerProps {
  /** 选中的属相索引 (0-11)，null 则不显示 */
  zodiacIndex: number | null
  /** 周运势数据 */
  weekData?: FortuneData | null
  /** 月运势数据 */
  monthData?: FortuneData | null
  /** 主题色 */
  themeColor?: string
  /** 是否打开 */
  isOpen: boolean
  /** 关闭回调 */
  onClose: () => void
}

// ============================================================
// 星级评分组件
// ============================================================

function StarRating({ score, color }: { score: number; color: string }) {
  return (
    <div className="jm-yunshi-drawer__stars">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`jm-yunshi-drawer__star ${star <= score ? 'jm-yunshi-drawer__star--active' : ''}`}
          style={star <= score ? { color } : undefined}
        >
          ★
        </span>
      ))}
    </div>
  )
}

// ============================================================
// 主组件
// ============================================================

const DISMISS_THRESHOLD = 80
const DRAG_RATIO = 0.4

export function JmYunshiDrawer({
  zodiacIndex,
  weekData,
  monthData,
  themeColor = '#da2e75',
  isOpen,
  onClose,
}: JmYunshiDrawerProps) {
  const [activeView, setActiveView] = useState<'week' | 'month'>('week')
  const [dragY, setDragY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const startYRef = useRef(0)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const handleClose = useCallback(() => {
    onClose()
    setDragY(0)
  }, [onClose])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startYRef.current = e.touches[0].clientY
    setIsDragging(true)
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return
    const deltaY = e.touches[0].clientY - startYRef.current
    if (deltaY > 0) setDragY(deltaY * DRAG_RATIO)
  }, [isDragging])

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false)
    if (dragY > DISMISS_THRESHOLD) handleClose()
    else setDragY(0)
  }, [dragY, handleClose])

  if (zodiacIndex === null) return null

  // 获取当前数据
  const currentData = activeView === 'week' ? weekData : monthData

  // 渲染维度卡片
  const renderDimensionCard = (dim: typeof DIMENSIONS[number]) => {
    const scoreKey = `${dim.key}_score` as keyof FortuneData
    const contentKey = `${dim.key}_content` as keyof FortuneData
    const score = (currentData?.[scoreKey] as number) ?? 0
    const content = (currentData?.[contentKey] as string) ?? '暂无数据'

    return (
      <div key={dim.key} className="jm-yunshi-drawer__dimension">
        <div className="jm-yunshi-drawer__dimension-header">
          <span className="jm-yunshi-drawer__dimension-icon">{dim.icon}</span>
          <span className="jm-yunshi-drawer__dimension-label">{dim.label}</span>
          <StarRating score={score} color={themeColor} />
        </div>
        <p className="jm-yunshi-drawer__dimension-content">{content}</p>
      </div>
    )
  }

  return (
    <>
      {/* 遮罩层 */}
      <div
        className={`jm-yunshi-drawer__backdrop ${isOpen ? 'jm-yunshi-drawer__backdrop--visible' : ''}`}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* 抽屉主体 */}
      {/* eslint-disable-next-line react/no-inline-styles */}
      <div
        className={`jm-yunshi-drawer ${isOpen ? 'jm-yunshi-drawer--open' : ''} ${isDragging ? 'jm-yunshi-drawer--dragging' : ''}`}
        style={{ '--drawer-translate': isOpen ? dragY : 100 } as React.CSSProperties}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        role="dialog"
        aria-modal="true"
        aria-label={`${ZODIAC_NAMES[zodiacIndex]}运势`}
      >
        {/* 手柄 */}
        <div className="jm-yunshi-drawer__handle" aria-hidden="true">
          <div className="jm-yunshi-drawer__handle-bar" />
        </div>

        {/* 头部：属相 Emoji + 标题一行 */}
        <div className="jm-yunshi-drawer__header">
          <div className="jm-yunshi-drawer__header-main">
            <span className="jm-yunshi-drawer__emoji">
              {ZODIAC_EMOJI[zodiacIndex]}
            </span>
            <div className="jm-yunshi-drawer__title-text">
              <span className="jm-yunshi-drawer__title">
                {ZODIAC_NAMES[zodiacIndex]}的{activeView === 'week' ? '本周' : '本月'}运势
              </span>
              {currentData && (
                <span className="jm-yunshi-drawer__period">
                  {currentData.period_start} ~ {currentData.period_end}
                </span>
              )}
            </div>
          </div>
          {/* 右上角关闭按钮(CSS 已就绪,JSX 补上) */}
          <button
            type="button"
            className="jm-yunshi-drawer__close"
            onClick={handleClose}
            aria-label="关闭"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* 内容区 */}
        <div ref={contentRef} className="jm-yunshi-drawer__content">
          {/* 时间切换 Tab */}
          <div className="jm-yunshi-drawer__tabs">
            <button
              type="button"
              className={`jm-yunshi-drawer__tab ${activeView === 'week' ? 'jm-yunshi-drawer__tab--active' : ''}`}
              style={activeView === 'week' ? { background: themeColor } : undefined}
              onClick={() => setActiveView('week')}
            >
              本周运势
            </button>
            <button
              type="button"
              className={`jm-yunshi-drawer__tab ${activeView === 'month' ? 'jm-yunshi-drawer__tab--active' : ''}`}
              style={activeView === 'month' ? { background: themeColor } : undefined}
              onClick={() => setActiveView('month')}
            >
              本月运势
            </button>
          </div>

          {/* 五个维度 */}
          <div className="jm-yunshi-drawer__dimensions">
            {DIMENSIONS.map(renderDimensionCard)}
          </div>

          {/* 幸运信息和禁忌 */}
          {currentData && (
            <div className="jm-yunshi-drawer__extra">
              {/* 幸运信息 */}
              <div className="jm-yunshi-drawer__lucky">
                <div className="jm-yunshi-drawer__lucky-title">幸运信息</div>
                <div className="jm-yunshi-drawer__lucky-items">
                  {currentData.lucky_direction && (
                    <div className="jm-yunshi-drawer__lucky-item">
                      <span className="jm-yunshi-drawer__lucky-label">幸运方位</span>
                      <span className="jm-yunshi-drawer__lucky-value">{currentData.lucky_direction}</span>
                    </div>
                  )}
                  {currentData.lucky_color && (
                    <div className="jm-yunshi-drawer__lucky-item">
                      <span className="jm-yunshi-drawer__lucky-label">幸运色彩</span>
                      <span className="jm-yunshi-drawer__lucky-value">{currentData.lucky_color}</span>
                    </div>
                  )}
                  {currentData.lucky_number && (
                    <div className="jm-yunshi-drawer__lucky-item">
                      <span className="jm-yunshi-drawer__lucky-label">幸运数字</span>
                      <span className="jm-yunshi-drawer__lucky-value">{currentData.lucky_number}</span>
                    </div>
                  )}
                  {currentData.lucky_item && (
                    <div className="jm-yunshi-drawer__lucky-item">
                      <span className="jm-yunshi-drawer__lucky-label">幸运物品</span>
                      <span className="jm-yunshi-drawer__lucky-value">{currentData.lucky_item}</span>
                    </div>
                  )}
                </div>
                {currentData.lucky_words && (
                  <div className="jm-yunshi-drawer__lucky-words">
                    「{currentData.lucky_words}」
                  </div>
                )}
              </div>

              {/* 禁忌 */}
              {currentData.taboo && (
                <div className="jm-yunshi-drawer__taboo">
                  <div className="jm-yunshi-drawer__taboo-title">⚠️ 今日禁忌</div>
                  <p className="jm-yunshi-drawer__taboo-content">{currentData.taboo}</p>
                </div>
              )}
            </div>
          )}

          {/* 无数据提示 */}
          {!currentData && (
            <div className="jm-yunshi-drawer__empty">
              <p>暂无{activeView === 'week' ? '周' : '月'}运势数据</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default JmYunshiDrawer
