'use client'

import type { JmDateSelectorProps } from './props'

function formatDate(d: Date) {
  const month = d.getMonth() + 1
  const day = d.getDate()
  const weekDay = ['日', '一', '二', '三', '四', '五', '六'][d.getDay()]
  return { month, day, weekDay }
}

export function JmDateSelector({
  dates,
  selectedIndex,
  onSelect,
  themeColor = '#D94E3D',
  className = '',
}: JmDateSelectorProps) {
  return (
    <div className={`jm-date-selector ${className}`}>
      <div className="jm-date-selector__scroll">
        {dates.map((d, idx) => {
          const { month, day, weekDay } = formatDate(d)
          const isSelected = selectedIndex === idx
          const isToday = idx === 0
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelect(idx)}
              className={`jm-date-selector__item ${isSelected ? 'jm-date-selector__item--active' : ''}`}
              style={isSelected ? { '--theme-color': themeColor } as React.CSSProperties : undefined}
            >
              <span className="jm-date-selector__weekday">
                {isToday ? '今天' : `周${weekDay}`}
              </span>
              <span className="jm-date-selector__day">
                {month}/{day}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default JmDateSelector
