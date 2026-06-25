/**
 * JmKnowledgeHeader Props
 * 开心园地页眉属性定义
 */

export interface JmKnowledgeHeaderProps {
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
  /** 主题色(用于标题、徽章、头像占位等),默认 'var(--jm-color-brand-cyan, #2f748a)' */
  themeColor?: string
  /** 是否显示用户头像 */
  showAvatar?: boolean
  /** 用户头像 URL */
  avatarSrc?: string
  /** 用户名 */
  username?: string
  /** 固定定位 */
  fixed?: boolean
  /** 搜索栏点击回调 */
  onSearchClick?: () => void
}

export type { JmOursHeaderProps } from '../JmOursHeader/props'