'use client'

import type { JmTextBlockProps } from './props'

/**
 * JmTextBlock 文本块组件
 * 用于显示标题和正文内容
 */
export function JmTextBlock({
  className = '',
  style,
  title,
  content,
  alignment = 'left',
  titleColor = '#1a1a1a',
  contentColor = '#6b6b6b',
  titleSize = 'base',
  contentSize = 'base',
}: JmTextBlockProps) {
  const alignmentClass = `jm-text-block--${alignment}`

  return (
    <div className={`jm-text-block ${alignmentClass} ${className}`} style={style}>
      {title && (
        <h3
          className={`jm-text-block__title jm-text-block__title--${titleSize}`}
          style={{ color: titleColor }}
        >
          {title}
        </h3>
      )}
      <p
        className={`jm-text-block__content jm-text-block__content--${contentSize}`}
        style={{ color: contentColor }}
      >
        {content}
      </p>
    </div>
  )
}
