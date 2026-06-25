'use client'

/**
 * 调试面板
 *
 * 入口: 启动页 (/) 连点 logo 5 次
 * 用途: 切换本地调试模式 (PGlite) / 重置本地数据库
 *
 * 注意: 这是开发专用页面,生产环境可以删掉
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { JmLocalDbSwitch } from '@/components/JmLocalDbSwitch'
import { getLocalDB } from '@/lib/local-db'
import { getEnv } from '@/lib/config'
import { getItem, getJSON, STORAGE_KEYS } from '@/lib/storage'

export default function DebugPage() {
  const router = useRouter()
  const [stats, setStats] = useState<{ users: number; services: number; products: number; fortune: number; cart: number; appointments: number } | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [sqlResult, setSqlResult] = useState<string>('')
  const [sqlInput, setSqlInput] = useState<string>('SELECT count(*) FROM jx_apk_users')
  const env = getEnv()
  const localMode = getItem('jx_apk_local_db') === '1'

  useEffect(() => {
    const user = getJSON(STORAGE_KEYS.user)
    setCurrentUser(user)
  }, [])

  const loadStats = async () => {
    setLoading(true)
    try {
      const db = await getLocalDB()
      const r = await db.query(`
        SELECT
          (SELECT count(*)::int FROM jx_apk_users) as users,
          (SELECT count(*)::int FROM jx_apk_m_services) as services,
          (SELECT count(*)::int FROM jx_apk_shop_products) as products,
          (SELECT count(*)::int FROM jx_apk_fortune_readings) as fortune,
          (SELECT count(*)::int FROM jx_apk_shop_cart_items) as cart,
          (SELECT count(*)::int FROM jx_apk_appointments) as appointments
      `)
      setStats((r.rows[0] as any) || null)
    } catch (e: any) {
      alert('加载统计失败: ' + (e?.message || String(e)))
    } finally {
      setLoading(false)
    }
  }

  const runSql = async () => {
    setLoading(true)
    try {
      const db = await getLocalDB()
      const r = await db.query(sqlInput)
      setSqlResult(JSON.stringify(r.rows, null, 2))
    } catch (e: any) {
      setSqlResult('❌ ' + (e?.message || String(e)))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#fafafa]" style={{ paddingTop: 'calc(20px + env(safe-area-inset-top))', paddingBottom: 'calc(20px + env(safe-area-inset-bottom))' }}>
      <div className="px-4 max-w-screen-md mx-auto">
        {/* 顶栏 */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-[24px] font-semibold text-[#171717]">🛠 调试面板</h1>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 h-[36px] rounded-full bg-white border border-[#e0e0e0] text-[14px] text-[#666] active:scale-95 transition-transform"
          >
            ← 返回
          </button>
        </div>

        {/* 环境信息 */}
        <div className="mb-4 p-3 rounded-2xl bg-white text-[13px] text-[#666] leading-relaxed">
          <div><b>环境:</b> {env}</div>
          <div><b>本地模式:</b> {localMode ? '✅ 开启 (走 PGlite)' : '❌ 关闭 (走远端)'}</div>
          {currentUser && <div><b>当前用户:</b> {currentUser.phone || currentUser.nickname || JSON.stringify(currentUser)}</div>}
        </div>

        {/* 开关 */}
        <div className="mb-4">
          <JmLocalDbSwitch />
        </div>

        {/* 数据库统计 */}
        <div className="mb-4 p-3 rounded-2xl bg-white">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-[15px] font-semibold text-[#171717]">📊 数据库统计</h2>
            <button
              type="button"
              onClick={loadStats}
              disabled={loading}
              className="px-3 h-[32px] rounded-full bg-[#D94E3D] text-white text-[13px] disabled:opacity-50 active:scale-95 transition-transform"
            >
              {loading ? '加载中...' : '刷新'}
            </button>
          </div>
          {stats ? (
            <div className="grid grid-cols-2 gap-2 text-[13px]">
              <div className="p-2 rounded bg-[#fafafa]">用户: <b>{stats.users}</b></div>
              <div className="p-2 rounded bg-[#fafafa]">服务: <b>{stats.services}</b></div>
              <div className="p-2 rounded bg-[#fafafa]">商品: <b>{stats.products}</b></div>
              <div className="p-2 rounded bg-[#fafafa]">运势: <b>{stats.fortune}</b></div>
              <div className="p-2 rounded bg-[#fafafa]">购物车: <b>{stats.cart}</b></div>
              <div className="p-2 rounded bg-[#fafafa]">预约: <b>{stats.appointments}</b></div>
            </div>
          ) : (
            <p className="text-[13px] text-[#999]">点刷新查看 PGlite 中的实际数据</p>
          )}
        </div>

        {/* SQL 调试器 */}
        <div className="mb-4 p-3 rounded-2xl bg-white">
          <h2 className="text-[15px] font-semibold text-[#171717] mb-2">🔍 SQL 调试器</h2>
          <textarea
            value={sqlInput}
            onChange={(e) => setSqlInput(e.target.value)}
            rows={3}
            className="w-full p-2 rounded bg-[#fafafa] text-[13px] font-mono border border-[#e0e0e0] focus:outline-none focus:border-[#D94E3D]"
            placeholder="SELECT * FROM jx_apk_users LIMIT 5"
          />
          <button
            type="button"
            onClick={runSql}
            disabled={loading}
            className="mt-2 w-full h-[40px] rounded-full bg-[#D94E3D] text-white text-[14px] font-medium disabled:opacity-50 active:scale-[0.98] transition-transform"
          >
            执行
          </button>
          {sqlResult && (
            <pre className="mt-2 p-2 rounded bg-[#1a1a1a] text-[#a6e22e] text-[12px] font-mono overflow-auto max-h-[300px] whitespace-pre-wrap">
              {sqlResult}
            </pre>
          )}
        </div>

        {/* 提示 */}
        <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-[12px] text-[#666] leading-relaxed">
          <b>💡 使用提示:</b>
          <ul className="mt-1 ml-4 list-disc space-y-0.5">
            <li>打开本地调试模式 → 杀 APP 重开 → 所有 API 走 PGlite</li>
            <li>关闭 → 杀 APP 重开 → 走回真后端</li>
            <li>本地模式开启时会自动预热 PGlite(灌种子)</li>
            <li>"重置"按钮清空本地数据 + 重新灌种子</li>
            <li>SQL 调试器可以验证 PGlite 中的实际数据</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
