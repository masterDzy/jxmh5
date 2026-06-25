'use client'

/**
 * 本地调试模式开关
 * 用在 login 页 (无登录态) 和 profile 页 (有登录态)
 */

import { useEffect, useState } from 'react'
import { STORAGE_KEYS, getItem, setItem, removeItem } from '@/lib/storage'
import { resetLocalDB, getLocalDB } from '@/lib/local-db'

export function JmLocalDbSwitch() {
  const [enabled, setEnabled] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [warming, setWarming] = useState(false)

  useEffect(() => {
    setEnabled(getItem('jx_apk_local_db') === '1')
  }, [])

  const toggle = (next: boolean) => {
    if (next) {
      setItem('jx_apk_local_db', '1')
      setEnabled(true)
      // 立刻预热 PGlite,让下次启动时无需等
      setWarming(true)
      getLocalDB()
        .then(() => {
          alert('✅ 本地调试模式已开启\n✅ 数据库已预热\n下次启动时所有 /api/v1/* 直接走本地 PGlite')
        })
        .catch((e) => {
          alert('✅ 模式已开启,但预热失败: ' + e?.message + '\n下次启动会重试')
        })
        .finally(() => setWarming(false))
    } else {
      removeItem('jx_apk_local_db')
      setEnabled(false)
      alert('已关闭本地调试模式\n下次启动时走回真后端')
    }
  }

  const handleReset = async () => {
    if (!confirm('确认重置本地数据库?\n所有本地写入的购物车、预约、用户将被清空,重新加载种子数据。')) return
    setResetting(true)
    try {
      await resetLocalDB()
      // 立即重新预热
      await getLocalDB()
      alert('✅ 本地数据库已重置 + 重新灌入种子')
    } catch (e: any) {
      alert('❌ 重置失败: ' + (e?.message || String(e)))
    } finally {
      setResetting(false)
    }
  }

  return (
    <div className="w-full rounded-2xl bg-amber-50 border border-amber-200 overflow-hidden">
      <div className="px-4 py-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#f59e0b">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l7.59-7.59L21 8l-9 9z"/>
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[15px] text-[#171717] font-medium">本地调试模式 (PGlite)</p>
          <p className="text-[12px] text-[#666] mt-0.5 truncate">
            {warming ? '⏳ 预热中...' : enabled ? '✅ 已开启 — 所有 API 走本地数据库' : '关闭 — 走后端 API'}
          </p>
        </div>
        <button
          type="button"
          aria-label={enabled ? '关闭本地调试模式' : '开启本地调试模式'}
          onClick={() => toggle(!enabled)}
          disabled={warming}
          className="w-[52px] h-[30px] rounded-full p-[2px] transition-colors flex-shrink-0 disabled:opacity-50"
          style={{ backgroundColor: enabled ? '#D94E3D' : '#e0e0e0' }}
        >
          <div
            className="w-[26px] h-[26px] rounded-full bg-white shadow transition-transform"
            style={{ transform: enabled ? 'translateX(22px)' : 'translateX(0)' }}
          />
        </button>
      </div>
      {enabled && (
        <>
          <div className="border-t border-amber-200" />
          <button
            type="button"
            onClick={handleReset}
            disabled={resetting}
            className="w-full px-4 py-3 text-left text-[14px] text-amber-700 hover:bg-amber-100 transition-colors disabled:opacity-40"
          >
            {resetting ? '重置中...' : '🔄 重置本地数据库 (清空并重新灌种子)'}
          </button>
        </>
      )}
    </div>
  )
}
