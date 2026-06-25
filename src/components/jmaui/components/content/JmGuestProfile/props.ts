/**

 * JmGuestProfile — 游客详情页内容组件
 *
 * 展示游客身份详情 + 温馨提示引导 + 我的服务列表（全部可用，无功能锁定）。
 * 纯展示组件，不处理身份逻辑（由 page.tsx 传入）。
 */
export interface JmGuestProfileProps {
  /** 游客昵称 */
  guestNickname?: string | null
  /** 主题色 */
  themeColor?: string
  /** 点击"立即注册"按钮 */
  onRegisterClick: () => void
  /** 点击消息通知 */
  onMessagesClick: () => void
  /** 点击"暂不登录"返回 */
  onBackClick?: () => void
}