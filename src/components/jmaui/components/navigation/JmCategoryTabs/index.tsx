'use client'

import { useState, useRef } from 'react'
import type { JmCategoryTabsProps, JmCategoryTabItem } from './props'

/**
 * JmCategoryTabs 分类标签切换组件
 *
 * 设计特点:
 * - chip 风格:描边圆角矩形(透明底 + 边框),不受 44px 最小按钮约束
 * - 默认态:浅灰边 + 中性灰文字
 * - 激活态:品牌色边 + 品牌色文字(保持透明底,不填充)
 * - 横向 flex + 滚动,溢出可滑
 *
 * @example
 * <JmCategoryTabs
 *   categories={[
 *     { id: 'all', name: '全部' },
 *     { id: 'qimen', name: '奇门遁甲' },
 *     { id: 'xiangmao', name: '相貌学' },
 *   ]}
 *   activeId="all"
 *   onChange={onChange}
 * />
 */
export function JmCategoryTabs({
  categories,
  activeId,
  defaultActiveId,
  onChange,
  className = '',
  style,
  themeColor = '#da2e75',
}: JmCategoryTabsProps) {
  // 如果有外部控制的 activeId，则使用受控模式
  const isControlled = activeId !== undefined
  const [internalActiveId, setInternalActiveId] = useState(defaultActiveId || categories[0]?.id)
  const tabsRef = useRef<HTMLDivElement>(null)
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map())

  const currentActiveId = isControlled ? activeId : internalActiveId

  const handleTabClick = (item: JmCategoryTabItem) => {
    if (!isControlled) {
      setInternalActiveId(item.id)
    }
    onChange?.(item)
  }

  // 注册 tab ref
  const setTabRef = (id: string) => (el: HTMLButtonElement | null) => {
    if (el) {
      tabRefs.current.set(id, el)
    } else {
      tabRefs.current.delete(id)
    }
  }

  return (
    <div
      className={`jm-category-tabs ${className}`}
      style={{
        ...style,
        '--tab-color': themeColor,
      } as React.CSSProperties}
      ref={tabsRef}
    >
      {categories.map((item) => {
        const isActive = currentActiveId === item.id
        return (
          <button
            key={item.id}
            ref={setTabRef(item.id)}
            className={`jm-category-tabs__tab ${isActive ? 'jm-category-tabs__tab--active' : ''}`}
            onClick={() => handleTabClick(item)}
          >
            {item.name}
          </button>
        )
      })}

      {/* (已移除底部滑轨指示器 — chip 描边本身就是选中反馈,见 globals.css) */}
    </div>
  )
}

export default JmCategoryTabs
