'use client'

import { Suspense, useState, useCallback } from 'react'
import { JmBookingHeader } from '@/components/jmaui/components/navigation/JmBookingHeader'
import { JmFooter } from '@/components/jmaui/components/navigation/JmFooter'
import { JmLunarDate } from '@/components/jmaui/components/functional/JmLunarDate'
import JmBookingForm from '@/components/jmaui/components/functional/JmBookingForm'

const THEME_COLOR = 'var(--jm-color-brand-vermilion, #D94E3D)'

// ── 页面骨架 ───────────────────────────────────────
function BookingPageInner() {
  const [searchVisible, setSearchVisible] = useState(false)
  const handleSearchClick = useCallback(() => setSearchVisible(true), [])

  return (
    <div
      className="min-h-screen bg-[#fafafa]"
      style={{ '--page-theme-color': THEME_COLOR } as React.CSSProperties}
    >
      <JmBookingHeader
        fixed={true}
        title="预约咨询"
        slogan="相约只是开始"
        showAvatar={true}
        backgroundColor="var(--jm-color-page-bg, #fafafa)"
        themeColor={THEME_COLOR}
        onSearchClick={handleSearchClick}
      />

      <div className="jm-page-content jm-page-content--booking">
        {/* 农历日期 */}
        <div className="py-2 flex items-center justify-center">
          <JmLunarDate dateColor="#525252" ganZhiColor="#999" yiColor="#D94E3D" />
        </div>

        {/* 预约表单 — 所有业务逻辑在组件内部 */}
        <JmBookingForm themeColor={THEME_COLOR} />
      </div>

      <JmFooter
        themeColors={{
          '/services':  'var(--jm-color-brand-rose, #da2e75)',
          '/yunshi':    'var(--jm-color-brand-amber, #ffad4f)',
          '/booking':   THEME_COLOR,
          '/knowledge': 'var(--jm-color-brand-cyan, #2f748a)',
          '/shop':      'var(--jm-color-brand-rose, #da2e75)',
        }}
      />
    </div>
  )
}

export default function BookingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
          <p className="text-[14px] text-[#999]">加载中...</p>
        </div>
      }
    >
      <BookingPageInner />
    </Suspense>
  )
}
