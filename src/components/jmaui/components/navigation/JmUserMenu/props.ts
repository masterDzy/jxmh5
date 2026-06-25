/**
 * JmUserMenu — 页眉右上角用户入口
 *
 * 读取 localStorage 中的游客/用户身份，显示对应图标和下拉菜单。
 * 游客显示"客"字角标；点击弹出面板显示昵称 + 注册引导。
 * 注册用户显示用户头像占位 + 用户信息 + 退出。
 */
export interface JmUserMenuProps {
  /** 主题色 */
  themeColor?: string
  /** 已登录用户头像 URL */
  avatarSrc?: string
}
