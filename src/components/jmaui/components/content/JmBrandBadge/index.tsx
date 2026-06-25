import React from 'react'
import { JmBrandBadgeProps } from './props'

const JmBrandBadge: React.FC<JmBrandBadgeProps> = ({
  brand = '九信',
  tagline = '—',
  subtitle = '时运伙伴！',
  className,
  style,
}) => {
  return (
    <div className={`jm-brand-badge ${className || ''}`} style={style}>
      <span className="jm-brand-badge__brand">{brand}</span>
      <span className="jm-brand-badge__tagline">{tagline}</span>
      <span className="jm-brand-badge__subtitle">{subtitle}</span>
    </div>
  )
}

export default JmBrandBadge
