/**
 * JmLockedMenuItem — 锁定菜单项
 *
 * 注册后可解锁的功能展示项，带小锁图标和描述文字。
 */
export interface JmLockedMenuItemProps {
  /** 图标 */
  icon: React.ReactNode
  /** 功能名称 */
  label: string
  /** 注册后解锁的描述 */
  description: string
}
