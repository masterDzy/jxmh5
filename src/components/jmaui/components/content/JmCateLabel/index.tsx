'use client'

import type { JmCateLabelProps } from './props'

/**
 * JmCateLabel 分类标签组件（紧贴型）
 *
 * 特点：
 * - 数字与文字紧贴，无间距
 * - 支持多行自动换行
 * - 简洁的胶囊样式
 *
 * @example
 * <JmCateLabel text="企业服务" number="01" active />
 * <JmCateLabel text="个人服务" onClick={() => {}} />
 */
export function JmCateLabel({
  className = '',
  style,
  text,
  number,
  active = false,
  onClick,
  themeColor = '#da2e75',
}: JmCateLabelProps) {
  return (
    <button
      className={`jm-cate-label ${active ? 'jm-cate-label--active' : ''} ${className}`}
      style={{
        ...style,
        '--label-color': themeColor,
      } as React.CSSProperties}
      onClick={onClick}
    >
      {number && <span className="jm-cate-label__number">{number}</span>}
      <span className="jm-cate-label__text">{text}</span>
    </button>
  )
}

export default JmCateLabel
