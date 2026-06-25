import type { ReactNode } from 'react'

export interface JmBottomSheetProps {
  /** 是否可见 */
  visible: boolean
  /** 关闭回调 */
  onClose: () => void
  /** 标题（可选，显示在拖拽手柄下方） */
  title?: string
  /** 内容 */
  children: ReactNode
  /** 底部固定区域（如操作按钮） */
  footer?: ReactNode
  /** 自定义类名 */
  className?: string
  /** 主题色（影响拖拽手柄和标题色） */
  themeColor?: string
  /** 点击遮罩层是否关闭（默认 true） */
  closeOnOverlay?: boolean
}