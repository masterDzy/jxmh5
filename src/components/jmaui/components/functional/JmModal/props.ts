import type { ReactNode } from 'react'

export interface JmModalProps {
  visible: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  footer?: ReactNode
  className?: string
  /** 全屏变体:覆盖整个屏幕,带状态栏安全区,无圆角(用于服务详情等重内容展示) */
  fullscreen?: boolean
}
