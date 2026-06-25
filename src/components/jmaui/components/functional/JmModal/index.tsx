'use client'

import type { JmModalProps } from './props'

export function JmModal({
  visible,
  onClose,
  title,
  children,
  footer,
  className = '',
  fullscreen = false,
}: JmModalProps) {
  if (!visible) return null

  return (
    <div className={`jm-modal ${fullscreen ? 'jm-modal--fullscreen' : ''} ${className}`}>
      {/* 遮罩层 */}
      <div className="jm-modal__overlay" onClick={onClose} />
      {/* 内容层 */}
      <div className="jm-modal__content" onClick={(e) => e.stopPropagation()}>
        {/* 关闭按钮:始终渲染,绝对定位在右上角,与 header 解耦(无 title 时也能关闭) */}
        <button className="jm-modal__close" onClick={onClose} type="button" aria-label="关闭">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        {/* 头部(仅当传 title 时显示,内部已不再含关闭按钮) */}
        {title && (
          <div className="jm-modal__header">
            <h3 className="jm-modal__title">{title}</h3>
          </div>
        )}
        {/* 内容 */}
        <div className="jm-modal__body">{children}</div>
        {/* 底部 */}
        {footer && <div className="jm-modal__footer">{footer}</div>}
      </div>
    </div>
  )
}

export default JmModal
