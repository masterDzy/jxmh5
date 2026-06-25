/**

 * JmUserProfile — 已登录用户详情页内容组件
 *
 * 自包含: 内部 useEffect 拉取 /api/v1/auth/me,内置登出确认弹窗 state。
 * page.tsx 只需在 token 存在时装载本组件,无需关心 user 状态。
 */

export interface JmUserInfo {
  id: string
  phone: string
  nickname: string | null
  avatar: string | null
  is_vip: boolean
  vip_type: string | null
  vip_expire_at: string | null
}

export interface JmUserProfileProps {
  /** 主题色 (用于会员卡按钮等) */
  themeColor?: string
  /** 点击菜单项 (key: 'profile' | 'orders' | 'consultation' | 'messages' | 'settings' | 'about') */
  onMenuClick?: (key: string) => void
  /** 点击退出登录 (由 page 注入 router.replace 逻辑) */
  onLogout: () => void | Promise<void>
}