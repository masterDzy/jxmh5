'use client'

/**
 * JmCateMindMap 调试页
 *
 * 路径: /mindmap
 *
 * 目的:
 * - 单独展示 JmCateMindMap,绕过 coms 页的 tab + 9 个 tab + 长滚动
 * - 提供主题色切换、初始 activeId 预设,快速看各种状态
 * - 回调日志区,看 onSelect / SVG path 数据
 * - 干净背景,专注组件本身
 */

import { useState, useRef, useEffect } from 'react'
import { JmCateMindMap } from '@/components/jmaui'
import type {
  JmCateMindMapProps,
} from '@/components/jmaui/components/content/JmCateMindMap/props'

// ────────────────────────────────────────────────────────
// 主题色预设
// ────────────────────────────────────────────────────────
type ThemePreset = { name: string; value: string; cssVar: string }
const THEME_PRESETS: readonly ThemePreset[] = [
  { name: '朱红', value: '#D94E3D', cssVar: 'var(--jm-color-brand-vermilion, #D94E3D)' },
  { name: '玫红', value: '#da2e75', cssVar: 'var(--jm-color-brand-rose, #da2e75)' },
  { name: '青',   value: '#2f748a', cssVar: 'var(--jm-color-brand-cyan, #2f748a)' },
  { name: '苔绿', value: '#A6BA43', cssVar: 'var(--jm-color-brand-green, #A6BA43)' },
  { name: '橙',   value: '#fb5c3e', cssVar: 'var(--jm-color-brand-orange, #fb5c3e)' },
]

// ────────────────────────────────────────────────────────
// 主页
// ────────────────────────────────────────────────────────
export default function MindmapDebugPage() {
  const [theme, setTheme] = useState<ThemePreset>(THEME_PRESETS[0])
  const [defaultActiveId, setDefaultActiveId] = useState<string | undefined>(undefined)
  const [logs, setLogs] = useState<string[]>([])
  const logRef = useRef<HTMLPreElement>(null)

  // 自动滚到底
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [logs])

  const handleSelect: JmCateMindMapProps['onSelect'] = (cat, sub) => {
    const ts = new Date().toLocaleTimeString('zh-CN', { hour12: false })
    const line = `[${ts}] onSelect(cat="${cat}", sub="${sub}")`
    setLogs(prev => [...prev, line])
  }

  const clearLogs = () => setLogs([])

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa', paddingBottom: 24 }}>
      {/* 顶部控制条 */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          background: 'rgba(255,255,255,0.96)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid #e5e5e5',
          padding: '12px 16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <a
              href="/"
              style={{
                fontSize: 14,
                color: '#666',
                textDecoration: 'none',
                padding: '4px 8px',
                border: '1px solid #ddd',
                borderRadius: 6,
              }}
            >
              ← 返回
            </a>
            <h1 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>
              JmCateMindMap 调试页
            </h1>
          </div>
          <span style={{ fontSize: 12, color: '#999' }}>/mindmap</span>
        </div>

        {/* 主题色 */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: '#666', marginRight: 4, alignSelf: 'center' }}>主题色:</span>
          {THEME_PRESETS.map(p => (
            <button
              key={p.value}
              type="button"
              onClick={() => setTheme(p)}
              style={{
                padding: '4px 10px',
                fontSize: 12,
                borderRadius: 12,
                border: `1px solid ${theme.value === p.value ? p.value : '#e5e5e5'}`,
                background: theme.value === p.value ? `color-mix(in srgb, ${p.value} 10%, transparent)` : '#fff',
                color: theme.value === p.value ? p.value : '#666',
                cursor: 'pointer',
                minHeight: 28,
                fontWeight: theme.value === p.value ? 600 : 400,
              }}
            >
              {p.name}
            </button>
          ))}
        </div>

        {/* 初始 activeId */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: '#666', marginRight: 4, alignSelf: 'center' }}>初始展开:</span>
          {[
            { id: undefined, label: '无(阶段 1)' },
            { id: 'cat-0',   label: '个人类' },
            { id: 'cat-1',   label: '企业类' },
            { id: 'cat-2',   label: '活动与培训' },
          ].map(opt => (
            <button
              key={opt.label}
              type="button"
              onClick={() => setDefaultActiveId(opt.id)}
              style={{
                padding: '4px 10px',
                fontSize: 12,
                borderRadius: 12,
                border: `1px solid ${defaultActiveId === opt.id ? theme.value : '#e5e5e5'}`,
                background: defaultActiveId === opt.id ? `color-mix(in srgb, ${theme.value} 10%, transparent)` : '#fff',
                color: defaultActiveId === opt.id ? theme.value : '#666',
                cursor: 'pointer',
                minHeight: 28,
                fontWeight: defaultActiveId === opt.id ? 600 : 400,
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* 数据源:固定走 newproduct API,见 JmCateMindMap 内部 buildMindMapData */}
      </div>

      {/* 组件本体 */}
      <div
        key={`${theme.value}-${defaultActiveId}`}
        // 加 key 强制重 mount,确保 defaultActiveId 改变时重置状态
        style={{ padding: '16px 0' }}
      >
        <JmCateMindMap
          themeColor={theme.cssVar}
          defaultActiveId={defaultActiveId}
          onSelect={handleSelect}
        />
      </div>

      {/* 回调日志 */}
      <div
        style={{
          margin: '16px',
          padding: 12,
          background: '#171717',
          borderRadius: 8,
          color: '#0f0',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: '#888' }}>
            回调日志 ({logs.length})
          </span>
          <button
            type="button"
            onClick={clearLogs}
            style={{
              padding: '2px 8px',
              fontSize: 11,
              background: '#333',
              color: '#aaa',
              border: '1px solid #555',
              borderRadius: 4,
              cursor: 'pointer',
              minHeight: 24,
            }}
          >
            清空
          </button>
        </div>
        <pre
          ref={logRef}
          style={{
            margin: 0,
            fontSize: 11,
            fontFamily: 'ui-monospace, monospace',
            lineHeight: 1.5,
            maxHeight: 200,
            overflowY: 'auto',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
          }}
        >
          {logs.length === 0 ? '// 点击子卡片会触发 onSelect 回调,日志会出现在这里' : logs.join('\n')}
        </pre>
      </div>
    </div>
  )
}
