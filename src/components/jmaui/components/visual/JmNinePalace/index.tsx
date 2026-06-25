import React, { useEffect, useRef } from 'react'
import { JmNinePalaceProps, JmPalaceCellData } from './props'

const CELL_POSITIONS = [
  { top: 0, left: 0 },
  { top: 0, left: 80 },
  { top: 0, left: 160 },
  { top: 80, left: 0 },
  { top: 80, left: 80 },
  { top: 80, left: 160 },
  { top: 160, left: 0 },
  { top: 160, left: 80 },
  { top: 160, left: 160 },
]

const ANIMATION_ORDER = [0, 2, 1, 3, 4, 5, 6, 7, 8]
const EMPTY_CELLS = [4, 8]

// 默认九宫格数据（复刻自 jiuxin/mobile components-showcase）
const DEFAULT_CELLS: JmPalaceCellData[] = [
  { symbol: '庚', main: '格局透视', sub: '时机推演', color: '#D94E3D' },
  { symbol: '乙', main: '局势研判', sub: '策略定制', color: '#2f748a' },
  { symbol: '壬', main: '空间诊断', sub: '能量优化', color: '#D4AF37' },
  { symbol: '癸', main: '决策前瞻', sub: '方向指引', color: '#A6BA43' },
  { main: '', sub: '', color: 'transparent' },
  { symbols: ['丁', '己'], main: '风险预警', sub: '避坑指南', color: '#da2e75' },
  { symbols: ['戊', '丙'], main: '人脉经营', sub: '资源整合', color: '#ffad4f' },
  { symbol: '辛', main: '突破方向', sub: '执行路径', color: '#6b6b6b' },
  { main: '', sub: '', color: 'transparent' },
]

const JmNinePalace: React.FC<JmNinePalaceProps> = ({
  className = '',
  style,
  cells = DEFAULT_CELLS,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    ANIMATION_ORDER.forEach((orderIndex) => {
      const cellIndex = orderIndex
      const cell = container.querySelector(`[data-cell-id="${cellIndex}"]`) as HTMLElement
      if (!cell) return

      const delay = cellIndex * 300 + Math.random() * 100
      const mainEl = cell.querySelector('.jm-nine-palace__main') as HTMLElement
      const subEl = cell.querySelector('.jm-nine-palace__sub') as HTMLElement

      setTimeout(() => {
        cell.classList.add('visible')
        if (mainEl) {
          setTimeout(() => mainEl.classList.add('show'), 300)
        }
        if (subEl) {
          setTimeout(() => subEl.classList.add('show'), 500)
        }
      }, delay)
    })
  }, [])

  const renderSymbol = (cellData: JmPalaceCellData, color: string) => {
    if (cellData.symbols && cellData.symbols.length > 0) {
      return (
        <div className="jm-nine-palace__symbol" style={{ color }}>
          {cellData.symbols.map((s, i) => (
            <span key={i}>{s}</span>
          ))}
        </div>
      )
    }
    if (cellData.symbol) {
      return (
        <div className="jm-nine-palace__symbol" style={{ color }}>
          {cellData.symbol}
        </div>
      )
    }
    return null
  }

  return (
    <div
      ref={containerRef}
      className={`jm-nine-palace ${className}`}
      style={style}
    >
      <svg
        className="jm-nine-palace__svg"
        viewBox="0 0 241 241"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      >
        <line x1="80" y1="0" x2="80" y2="241" stroke="rgba(212,175,55,0.35)" strokeWidth="1" />
        <line x1="160" y1="0" x2="160" y2="241" stroke="rgba(212,175,55,0.35)" strokeWidth="1" />
        <line x1="0" y1="80" x2="241" y2="80" stroke="rgba(212,175,55,0.35)" strokeWidth="1" />
        <line x1="0" y1="160" x2="241" y2="160" stroke="rgba(212,175,55,0.35)" strokeWidth="1" />
      </svg>
      {Array.from({ length: 9 }, (_, index) => {
        const cellData = cells[index]
        const isEmpty = EMPTY_CELLS.includes(index)
        const color = cellData?.color || '#525252'

        return (
          <div
            key={index}
            data-cell-id={index}
            className="jm-nine-palace__cell"
            style={{
              top: CELL_POSITIONS[index].top,
              left: CELL_POSITIONS[index].left,
              zIndex: 1,
            }}
          >
            {!isEmpty && cellData && (
              <>
                {renderSymbol(cellData, color)}
                {cellData.main && (
                  <div className="jm-nine-palace__main" style={{ color }}>{cellData.main}</div>
                )}
                {cellData.sub && (
                  <div className="jm-nine-palace__sub" style={{ color }}>{cellData.sub}</div>
                )}
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default JmNinePalace
