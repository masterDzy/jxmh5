/**
 * JmContactField Props — 联系信息字段(姓名/手机号/邮箱等)
 *
 * 适用于表单中的"联系类"输入项:
 *  - 带 label(标题)
 *  - required 必填星号(品牌色)
 *  - error 错误提示(下方红字)
 *  - 支持 type 切换:text/tel/email/password/number
 */
export interface JmContactFieldProps {
  type?: 'text' | 'tel' | 'email' | 'password' | 'number'
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
  required?: boolean
  autoFocus?: boolean
  error?: string
  disabled?: boolean
  className?: string
}
