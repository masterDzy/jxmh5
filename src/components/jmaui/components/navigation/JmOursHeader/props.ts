/**
 * JmOursHeader Props
 * "我们的服务"页面专用页眉属性定义
 */

import type { ReactNode } from 'react'

export interface JmOursHeaderProps {
  /** 自定义类名 */
  className?: string
  /** 内联样式 */
  style?: React.CSSProperties
  /** 页面标题 */
  title?: string
  /** 口号/副标题 */
  slogan?: string
  /** 背景色 */
  backgroundColor?: string
  /** 主题色（默认 #da2e75 玫瑰红） */
  themeColor?: string
  /** 是否显示用户头像 */
  showAvatar?: boolean
  /** 用户头像 URL */
  avatarSrc?: string
  /** 用户名 */
  username?: string
  /** 固定定位 */
  fixed?: boolean
  /** 搜索图标点击回调 */
  onSearchClick?: () => void
  /**
   * 自定义徽章 SVG 节点 — 默认莲花 lianh2
   * 商城页可传入购物袋 SVG,知识页可传入书卷 SVG 等
   * 接受 viewBox="0 0 1024 1024" 的 SVG,组件会自动套用 jm-ours-header__badge 类
   */
  badgeIcon?: ReactNode
}
