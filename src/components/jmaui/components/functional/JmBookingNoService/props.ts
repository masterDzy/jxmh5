export interface JmBookingNoServiceProps {
  /** 错误提示文字，默认 '未指定服务，请从服务页选择' */
  message?: string
  /** 按钮文字，默认 '去选择服务' */
  buttonText?: string
  /** 跳转目标，默认 '/services?from=booking' */
  redirectTo?: string
  /** 主题色 */
  themeColor?: string
}
