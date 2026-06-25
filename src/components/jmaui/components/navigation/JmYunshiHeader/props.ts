/**
 * JmYunshiHeader Props
 * "运势解读"页面专用页眉属性定义
 */

export interface JmYunshiHeaderProps {
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
  /** 主题色（默认 #e09530 深金） */
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