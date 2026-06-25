/**
 * JmFooter Props
 * 页脚组件属性定义
 */

export type JmFooterStyle = 'icon-top-text-bottom' | 'icon-left-text-right'

import type { ReactNode } from 'react'

export interface JmFooterTab {
  /** 图标（React 节点，通常是 SVG） */
  icon: ReactNode
  /** 标签文字 */
  label: string
  /** 跳转链接 */
  url: string
}

export interface JmFooterProps {
  /** 自定义类名 */
  className?: string
  /** 内联样式 */
  style?: React.CSSProperties
  /** Tab 列表 */
  tabs?: JmFooterTab[]
  /** 布局风格 */
  layoutStyle?: JmFooterStyle
  /** 背景色 */
  backgroundColor?: string
  /** 文字颜色 */
  textColor?: string
  /** 图标颜色 */
  iconColor?: string
  /** 选中态颜色(全局兜底,默认 'var(--jm-color-brand-vermilion, #D94E3D)') */
  activeColor?: string
  /**
   * 每个 Tab 选中态颜色(按 url 匹配)
   * 优先于 activeColor,可传入 CSS 变量或任意 CSS color 字符串
   * 例: { '/services': 'var(--jm-color-brand-rose, #da2e75)' }
   */
  themeColors?: Record<string, string>
}
