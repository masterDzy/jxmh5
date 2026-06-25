/**

 * JmGuestProfile — 游客详情页内容组件
 *
 * 展示游客身份详情 + 注册引导 + 锁定/可用功能列表。
 * 纯展示组件，不处理身份逻辑（由 page.tsx 传入）。
 */
export interface JmGuestProfileProps {
  /** 游客昵称 */
  guestNickname?: string | null
  /** 主题色 */
  themeColor?: string
  /** 点击注册/登录按钮 */
  onRegisterClick: () => void
  /** 点击消息通知 */
  onMessagesClick: () => void
  /** 点击暂不登录返回 */
  onBackClick?: () => void
}
