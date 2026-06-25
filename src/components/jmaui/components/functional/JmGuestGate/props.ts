export interface JmGuestGateProps {
  /** 子内容 — 有 guest 身份时才渲染 */
  children: React.ReactNode
  /** 游客昵称 */
  guestNickname?: string
  /** 是否正在加载身份 */
  isLoading?: boolean
  /** 是否有有效身份 */
  isReady?: boolean
  /** 注册/登录成功后回调 */
  onRegisterClick?: () => void
  /** 主题色 */
  themeColor?: string
}
