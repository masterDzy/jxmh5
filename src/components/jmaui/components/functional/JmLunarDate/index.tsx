'use client'

import { Lunar } from 'lunar-javascript'
import type { JmLunarDateProps } from './props'

/**
 * JmLunarDate 万年历组件
 *
 * 布局A（极简一行）：5月5日 · 己卯日 · 宜嫁娶
 */
export function JmLunarDate({
  className = '',
  style,
  showDate = true,
  showGanZhi = true,
  showYiJi = true,
  dateColor = '#525252',
  ganZhiColor = '#999',
  yiColor = '#D94E3D',
}: JmLunarDateProps) {
  const today = new Date()
  const lunar = Lunar.fromDate(today)

  const month = today.getMonth() + 1
  const day = today.getDate()
  const dateStr = `${month}月${day}日`

  const ganzhiDay = lunar.getDayInGanZhi()

  // @ts-ignore - lunar-javascript 类型定义不完整
  const yiList = lunar.getDayYi?.() || []
  // @ts-ignore
  const yiText = yiList?.length > 0 ? yiList[0] : ''

  const separator = ' · '

  return (
    <div className={`jm-lunar-date jm-lunar-date--inline ${className}`} style={style}>
      {showDate && (
        <span className="jm-lunar-date__date" style={{ color: dateColor }}>
          {dateStr}
        </span>
      )}
      {showGanZhi && (
        <>
          <span className="jm-lunar-date__sep" style={{ color: ganZhiColor }}>{separator}</span>
          <span className="jm-lunar-date__ganzhi" style={{ color: ganZhiColor }}>
            {ganzhiDay}日
          </span>
        </>
      )}
      {showYiJi && (
        <>
          <span className="jm-lunar-date__sep" style={{ color: ganZhiColor }}>{separator}</span>
          <span className="jm-lunar-date__yi" style={{ color: yiColor }}>
            <span style={{ fontWeight: 700 }}>宜</span>{yiText}
          </span>
        </>
      )}
    </div>
  )
}
