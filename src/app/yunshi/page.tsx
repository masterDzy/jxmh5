'use client'

import { useState, useEffect, useCallback } from 'react'
import { JmYunshiHeader, JmFooter, JmZodiacGrid, JmYunshiDrawer, type FortuneData } from '@/components/jmaui'
import { JmSearchDrawer } from '@/components/jmaui/components/functional/JmSearchDrawer'
import { get } from '@/lib/http'

// 获取当前周的起止日期
function getCurrentWeekRange(): { start: string; end: string } {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)

  const format = (d: Date) => d.toISOString().split('T')[0]
  return { start: format(monday), end: format(sunday) }
}

// 获取当月的起止日期
function getCurrentMonthRange(): { start: string; end: string } {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  const format = (d: Date) => d.toISOString().split('T')[0]
  return { start: format(start), end: format(end) }
}

// API 获取运势数据
async function fetchFortuneData(zodiacId: number, periodType: string, periodStart: string): Promise<FortuneData | null> {
  try {
    const json = await get<FortuneData>('/api/v1/fortune', {
      zodiac_id: zodiacId,
      period_type: periodType,
      period_start: periodStart,
    })
    if (json.error === false && json.data) {
      return json.data
    }
    return null
  } catch {
    return null
  }
}

export default function YunshiPage() {
  const [selectedZodiac, setSelectedZodiac] = useState<number | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [weekData, setWeekData] = useState<FortuneData | null>(null)
  const [monthData, setMonthData] = useState<FortuneData | null>(null)
  const [loading, setLoading] = useState(false)

  // 选择属相后加载数据
  const handleSelectZodiac = useCallback(async (index: number) => {
    setSelectedZodiac(index)
    setDrawerOpen(true)
    setLoading(true)

    // 获取当前周和月的日期范围
    const weekRange = getCurrentWeekRange()
    const monthRange = getCurrentMonthRange()

    // 并行获取周运势和月运势
    const [week, month] = await Promise.all([
      fetchFortuneData(index, 'week', weekRange.start),
      fetchFortuneData(index, 'month', monthRange.start),
    ])

    setWeekData(week)
    setMonthData(month)
    setLoading(false)
  }, [])

  // 关闭抽屉时清除数据
  const handleClose = useCallback(() => {
    setDrawerOpen(false)
    setWeekData(null)
    setMonthData(null)
  }, [])

  // 搜索 state
  const [searchVisible, setSearchVisible] = useState(false)
  const handleSearchClick = useCallback(() => setSearchVisible(true), [])
  const handleSearch = useCallback((query: string) => {
    // 运势页:搜索词用于按"生肖"或"主题"过滤(此处仅关闭抽屉,后续可接路由)
    setSearchVisible(false)
  }, [])

  return (
    <main className="min-h-screen bg-[#fafafa] pb-[64px]">
      <JmYunshiHeader
        fixed={true}
        title="运势解读"
        slogan="最妙的生命曲线"
        showAvatar={true}
        backgroundColor="var(--jm-color-page-bg, #fafafa)"
        themeColor="var(--jm-color-brand-orange, #fb5c3e)"
        onSearchClick={handleSearchClick}
      />

      <div className="jm-page-content jm-page-content--yunshi">
        {/* 提示语 */}
        <div className="jm-zodiac-grid__hint">
          <p className="text-[13px] jm-muted text-center">
            点击属相查看本周、本月运势
          </p>
        </div>

        {/* 属相网格 */}
        <div className="mt-4">
          <JmZodiacGrid
            selectedIndex={selectedZodiac}
            onSelect={handleSelectZodiac}
            themeColor="#da2e75"
            showHint={false}
          />
        </div>
      </div>

      {/* 运势抽屉 */}
      <JmYunshiDrawer
        zodiacIndex={selectedZodiac}
        weekData={weekData}
        monthData={monthData}
        themeColor="#da2e75"
        isOpen={drawerOpen}
        onClose={handleClose}
      />

      {/* 搜索弹窗 */}
      <JmSearchDrawer
        visible={searchVisible}
        onClose={() => setSearchVisible(false)}
        onSearch={handleSearch}
        pageType="global"
      />

      <JmFooter
        themeColors={{
          '/services':  'var(--jm-color-brand-rose, #da2e75)',
          '/yunshi':    'var(--jm-color-brand-amber, #ffad4f)',
          '/booking':   'var(--jm-color-brand-vermilion, #D94E3D)',
          '/knowledge': 'var(--jm-color-brand-cyan, #2f748a)',
          '/shop':      'var(--jm-color-brand-rose, #da2e75)',
        }}
      />
    </main>
  )
}
