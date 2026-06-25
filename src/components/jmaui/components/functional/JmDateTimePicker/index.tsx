'use client'

import { useMemo, useState } from 'react'
import { DEFAULT_TIME_SLOTS, type JmDateTimePickerProps } from './props'

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

/** 把任意日期对齐到当周周一(本地时区) */
function startOfWeek(d: Date): Date {
  const out = new Date(d)
  out.setHours(0, 0, 0, 0)
  const dow = out.getDay() // 0(日) - 6(土)
  const diff = dow === 0 ? -6 : 1 - dow // 让周一成为一周首日
  out.setDate(out.getDate() + diff)
  return out
}

/** "6月1日 - 6月7日" */
function formatRange(start: Date, end: Date) {
  return `${start.getMonth() + 1}月${start.getDate()}日 - ${end.getMonth() + 1}月${end.getDate()}日`
}

/**
 * JmDateTimePicker 统一日期+时间段选择器(两栏式,周视图)
 *
 *   ┌──────────────┬──────────────┐
 *   │ <  6月1-7日  >              │
 *   │  日 一 二 三 四 五 六         │
 *   │  ┌─┬─┬─┬─┬─┬─┬─┐  周视图(7 列)
 *   │  │1│2│3│4│5│6│7│            │
 *   │  └─┴─┴─┴─┴─┴─┴─┘            │
 *   ├──────────────┤
 *   │  6月4日 已选  │  时段标题     │
 *   │  [09:00][10:00][11:00]       │
 *   │  [14:00] ...        时段      │
 *   └──────────────┴──────────────┘
 *
 * 周首日 = 周一(国内习惯),周切换通过 < > 按钮
 */
export function JmDateTimePicker({
  dates,
  timeSlots = DEFAULT_TIME_SLOTS,
  selectedDateIndex,
  selectedTime,
  onDateChange,
  onTimeChange,
  themeColor = '#D94E3D',
  className = '',
}: JmDateTimePickerProps) {
  const [today] = useState(() => new Date())

  // 可选日期集合
  const enabledSet = useMemo(
    () => new Set(dates.map((d) => d.toDateString())),
    [dates]
  )

  // 当前查看的周(周一)
  const [viewWeekStart, setViewWeekStart] = useState(() => {
    const first = dates[0] ?? new Date()
    return startOfWeek(first)
  })

  const weekEnd = useMemo(() => {
    const e = new Date(viewWeekStart)
    e.setDate(viewWeekStart.getDate() + 6)
    return e
  }, [viewWeekStart])

  // 7 天(周一 → 周日)
  const weekDays = useMemo(() => {
    const days: Date[] = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(viewWeekStart)
      d.setDate(viewWeekStart.getDate() + i)
      days.push(d)
    }
    return days
  }, [viewWeekStart])

  const selectedDate = selectedDateIndex !== null ? dates[selectedDateIndex] : null

  // 切周限制:不允许翻到比 dates[0] 更早的周
  const canPrev = useMemo(() => {
    if (dates.length === 0) return false
    const minDate = dates[0]
    const minWeekStart = startOfWeek(minDate)
    return viewWeekStart > minWeekStart
  }, [viewWeekStart, dates])

  // 切到包含 dates[dates.length-1] 的周
  const canNext = useMemo(() => {
    if (dates.length === 0) return true
    const maxDate = dates[dates.length - 1]
    const maxWeekStart = startOfWeek(maxDate)
    return viewWeekStart < maxWeekStart
  }, [viewWeekStart, dates])

  return (
    <div
      className={`jm-date-time-picker ${className}`}
      style={{ '--theme-color': themeColor } as React.CSSProperties}
    >
      {/* 左:周视图 */}
      <div className="jm-date-time-picker__calendar">
        <div className="jm-date-time-picker__calendar-header">
          <button
            type="button"
            className="jm-date-time-picker__calendar-nav"
            onClick={() => {
              if (!canPrev) return
              const d = new Date(viewWeekStart)
              d.setDate(viewWeekStart.getDate() - 7)
              setViewWeekStart(d)
            }}
            disabled={!canPrev}
            aria-label="上一周"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div className="jm-date-time-picker__calendar-month">
            {formatRange(viewWeekStart, weekEnd)}
          </div>
          <button
            type="button"
            className="jm-date-time-picker__calendar-nav"
            onClick={() => {
              if (!canNext) return
              const d = new Date(viewWeekStart)
              d.setDate(viewWeekStart.getDate() + 7)
              setViewWeekStart(d)
            }}
            disabled={!canNext}
            aria-label="下一周"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        <div className="jm-date-time-picker__calendar-weekdays">
          {WEEKDAYS.map((w) => (
            <div key={w}>{w}</div>
          ))}
        </div>

        <div className="jm-date-time-picker__calendar-grid">
          {weekDays.map((date, idx) => {
            const enabled = enabledSet.has(date.toDateString())
            const isToday = isSameDay(date, today)
            const isSelected = selectedDate ? isSameDay(date, selectedDate) : false
            const classes = [
              'jm-date-time-picker__calendar-day',
              !enabled && 'jm-date-time-picker__calendar-day--disabled',
              isToday && 'jm-date-time-picker__calendar-day--today',
              isSelected && 'jm-date-time-picker__calendar-day--active',
            ]
              .filter(Boolean)
              .join(' ')

            return (
              <button
                key={idx}
                type="button"
                className={classes}
                disabled={!enabled}
                onClick={() => {
                  if (!enabled) return
                  const i = dates.findIndex((d) => isSameDay(d, date))
                  if (i >= 0) onDateChange(i)
                }}
              >
                <span className="jm-date-time-picker__calendar-day-num">
                  {date.getDate()}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 右:时段 */}
      <div className="jm-date-time-picker__time">
        <div className="jm-date-time-picker__time-title">
          {selectedDate
            ? `${selectedDate.getMonth() + 1}月${selectedDate.getDate()}日`
            : '请先选择日期'}
        </div>
        <div className="jm-date-time-picker__time-grid">
          {timeSlots.map((slot) => {
            const isActive = selectedTime === slot
            const disabled = !selectedDate
            const classes = [
              'jm-date-time-picker__time-item',
              isActive && 'jm-date-time-picker__time-item--active',
            ]
              .filter(Boolean)
              .join(' ')
            return (
              <button
                key={slot}
                type="button"
                className={classes}
                disabled={disabled}
                onClick={() => onTimeChange(slot)}
              >
                {slot}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default JmDateTimePicker
