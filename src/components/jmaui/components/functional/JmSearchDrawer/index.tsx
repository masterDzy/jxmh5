'use client'

import { useState, useEffect, useRef } from 'react'

// ==================== 类型 ====================

export interface JmSearchDrawerProps {
  /** 是否显示 */
  visible: boolean
  /** 关闭回调 */
  onClose: () => void
  /** 搜索提交回调 */
  onSearch: (query: string) => void
  /** 搜索历史 key（用于 localStorage） */
  historyKey?: string
  /** 搜索框 placeholder */
  placeholder?: string
  /** 页面类型（用于区分搜索范围） */
  pageType?: 'services' | 'knowledge' | 'shop' | 'global'
}

interface SearchHistory {
  items: string[]
  maxItems: number
}

// ==================== 常量 ====================

// (已移除 DEFAULT_HOT_TAGS — 热门标签数据无后端来源,纯前端硬编码的"虚拟"标签)

const DEFAULT_PLACEHOLDERS: Record<string, string> = {
  services: '搜索服务项目...',
  knowledge: '搜索知识文章...',
  shop: '搜索商品...',
  global: '搜索九信阁...',
}

// ==================== 工具函数 ====================

function getHistory(key: string): SearchHistory {
  if (typeof window === 'undefined') return { items: [], maxItems: 10 }
  try {
    const data = localStorage.getItem(`search_history_${key}`)
    return data ? JSON.parse(data) : { items: [], maxItems: 10 }
  } catch {
    return { items: [], maxItems: 10 }
  }
}

function saveHistory(key: string, history: SearchHistory): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(`search_history_${key}`, JSON.stringify(history))
  } catch {
    // 忽略存储错误
  }
}

function addToHistory(key: string, query: string): void {
  const history = getHistory(key)
  // 去除重复项
  history.items = history.items.filter(item => item !== query)
  // 添加到开头
  history.items.unshift(query)
  // 限制数量
  history.items = history.items.slice(0, history.maxItems)
  saveHistory(key, history)
}

function removeFromHistory(key: string, query: string): void {
  const history = getHistory(key)
  history.items = history.items.filter(item => item !== query)
  saveHistory(key, history)
}

function clearHistory(key: string): void {
  saveHistory(key, { items: [], maxItems: 10 })
}

// ==================== 组件 ====================

export function JmSearchDrawer({
  visible,
  onClose,
  onSearch,
  historyKey = 'global',
  pageType = 'global',
  placeholder,
}: JmSearchDrawerProps) {
  const [query, setQuery] = useState('')
  const [history, setHistory] = useState<SearchHistory>({ items: [], maxItems: 10 })
  const inputRef = useRef<HTMLInputElement>(null)

  const displayPlaceholder = placeholder || DEFAULT_PLACEHOLDERS[pageType] || '搜索...'

  // 加载历史记录
  useEffect(() => {
    if (visible) {
      setHistory(getHistory(historyKey))
      // 自动聚焦输入框
      setTimeout(() => inputRef.current?.focus(), 100)
    } else {
      setQuery('')
    }
  }, [visible, historyKey])

  // 处理搜索
  const handleSearch = (searchQuery: string) => {
    const q = searchQuery.trim()
    if (!q) return
    addToHistory(historyKey, q)
    setHistory(getHistory(historyKey))
    onSearch(q)
    setQuery('')
    onClose()
  }

  // 处理输入框回车
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(query)
    }
  }

  // 处理历史项点击
  const handleHistoryClick = (item: string) => {
    handleSearch(item)
  }

  // 处理历史项删除
  const handleHistoryRemove = (e: React.MouseEvent, item: string) => {
    e.stopPropagation()
    removeFromHistory(historyKey, item)
    setHistory(getHistory(historyKey))
  }

  // 处理清除历史
  const handleClearHistory = () => {
    clearHistory(historyKey)
    setHistory({ items: [], maxItems: 10 })
  }

  if (!visible) return null

  return (
    <div className="jm-search-drawer">
      {/* 遮罩层 */}
      <div className="jm-search-drawer__overlay" onClick={onClose} />

      {/* 弹窗内容 */}
      <div className="jm-search-drawer__content">
        {/* 搜索头部 */}
        <div className="jm-search-drawer__header">
          <div className="jm-search-drawer__input-wrap">
            <svg className="jm-search-drawer__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              ref={inputRef}
              type="text"
              className="jm-search-drawer__input"
              placeholder={displayPlaceholder}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            {query && (
              <button
                className="jm-search-drawer__clear"
                onClick={() => setQuery('')}
                aria-label="清除"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M15 9l-6 6M9 9l6 6"/>
                </svg>
              </button>
            )}
          </div>
          <button className="jm-search-drawer__cancel" onClick={onClose}>
            取消
          </button>
        </div>

        {/* (已移除"热门搜索"虚拟标签区 — 标签数据无后端来源,纯前端硬编码,
            删除后搜索抽屉只剩:搜索输入框 + 搜索历史 两块) */}

        {/* 历史搜索 */}
        {history.items.length > 0 && (
          <div className="jm-search-drawer__section">
            <div className="jm-search-drawer__section-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
              </svg>
              <span>搜索历史</span>
              <button className="jm-search-drawer__clear-btn" onClick={handleClearHistory}>
                清空
              </button>
            </div>
            <div className="jm-search-drawer__history">
              {history.items.map(item => (
                <div
                  key={item}
                  className="jm-search-drawer__history-item"
                  onClick={() => handleHistoryClick(item)}
                >
                  <svg className="jm-search-drawer__history-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 6v6l4 2"/>
                  </svg>
                  <span className="jm-search-drawer__history-text">{item}</span>
                  <button
                    className="jm-search-drawer__history-remove"
                    onClick={e => handleHistoryRemove(e, item)}
                    aria-label="删除"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default JmSearchDrawer
