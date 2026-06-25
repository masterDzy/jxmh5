'use client'

import type { JmButtonProps } from './props'

/**
 * JmButton 按钮组件
 */
export function JmButton({
  children,
  onClick,
  size = 'md',
  variant = 'primary',
  disabled = false,
  fullWidth = false,
  className = '',
  color,
}: JmButtonProps) {
  const classes = [
    'jm-btn',
    `jm-btn--${size}`,
    `jm-btn--${variant}`,
    fullWidth ? 'jm-btn--full-width' : '',
    className,
  ].filter(Boolean).join(' ')

  const style = color ? { backgroundColor: color, borderColor: color, color: '#ffffff' } : undefined

  return (
    <button
      className={classes}
      onClick={onClick}
      disabled={disabled}
      style={style}
    >
      {children}
    </button>
  )
}
