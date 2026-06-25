import React from 'react'

export interface SvgAssetProps {
  className?: string
  style?: React.CSSProperties
}

/** 波浪 SVG */
export function SvgLeaf({ className, style }: SvgAssetProps) {
  return (
    <svg className={className} style={style} viewBox="0 0 132 66" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="waveGradLeaf" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.3"/>
          <stop offset="50%" stopColor="#D4AF37" stopOpacity="0.6"/>
          <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.3"/>
        </linearGradient>
      </defs>
      <g>
        <path fill="url(#waveGradLeaf)" d="M0,33 Q33,13 66,33 T132,33 L132,66 L0,66 Z"/>
        <path fill="none" stroke="#D4AF37" strokeWidth="1" opacity="0.4" d="M0,33 Q33,13 66,33 T132,33"/>
        <path fill="none" stroke="#D4AF37" strokeWidth="0.5" opacity="0.3" d="M0,43 Q33,23 66,43 T132,43"/>
        <path fill="none" stroke="#D4AF37" strokeWidth="0.5" opacity="0.3" d="M0,53 Q33,33 66,53 T132,53"/>
      </g>
    </svg>
  )
}

/** 手绘植物 SVG */
export function SvgHand({ className, style }: SvgAssetProps) {
  return (
    <svg className={className} style={style} viewBox="0 0 132 147" xmlns="http://www.w3.org/2000/svg">
      <g fill="#D94E3D" stroke="none">
        <path d="M 32.00 92.00 C 32.28 100.42 38.98 102.32 44.75 95.75 C 50.53 89.18 50.61 88.05 53.33 79.33 C 56.05 70.61 52.68 70.64 45.00 72.00 C 43.91 72.49 43.10 72.62 42.00 73.00 C 35.80 75.13 31.94 70.35 37.25 66.25 C 42.56 62.15 46.74 64.55 52.07 61.07 C 57.41 57.60 48.40 53.36 47.00 50.00 C 46.75 48.01 47.88 45.53 50.00 45.00 C 57.72 43.06 58.97 55.32 62.00 59.00 C 68.21 57.67 81.62 56.64 83.77 65.23 C 85.92 73.82 79.98 84.87 71.00 85.00 C 71.00 83.67 71.00 82.33 71.00 81.00 C 71.10 76.54 84.63 67.02 72.75 64.25 C 60.88 61.47 65.79 75.57 60.75 80.75 C 55.71 85.93 57.94 96.56 52.10 101.10 C 46.26 105.63 41.97 109.75 36.00 114.00 C 35.26 115.89 39.76 116.80 36.00 117.00 C 49.22 128.64 83.70 127.59 95.00 115.00 C 95.82 113.64 95.57 110.61 96.00 109.00 C 88.05 110.48 80.18 111.45 73.77 106.23 C 67.36 101.01 61.47 93.01 70.00 89.00 C 67.76 103.66 87.00 106.52 96.00 100.00 C 95.67 99.58 97.95 96.21 98.00 96.00 C 98.00 88.23 98.92 78.32 97.00 71.00 C 95.08 63.69 97.81 55.56 95.00 49.00 C 93.67 48.62 91.64 46.94 93.00 46.00 C 87.95 37.57 85.11 26.84 74.02 24.98 C 62.94 23.11 52.26 17.96 43.30 26.30 C 34.34 34.65 35.07 45.07 33.33 56.33 C 31.59 67.59 33.01 80.54 32.00 92.00 Z"/>
      </g>
      <g fill="#A6BA43" stroke="none">
        <path d="M 94.00 43.00 C 94.10 43.32 96.22 47.41 95.00 48.00 C 96.73 47.22 98.03 48.83 99.00 49.00 C 108.91 50.47 119.59 42.78 121.00 33.00 C 114.80 34.18 108.00 34.73 103.00 38.00 C 100.87 39.95 100.21 43.85 97.00 44.00 C 96.86 42.19 97.44 39.92 99.00 39.00 C 99.54 33.02 96.62 24.71 90.00 24.00 C 88.28 31.05 92.87 36.78 94.00 43.00 Z"/>
      </g>
      <g fill="#B8C667" stroke="none">
        <path d="M 99.00 39.00 C 97.44 39.92 96.86 42.19 97.00 44.00 C 100.21 43.85 100.87 39.95 103.00 38.00 C 102.41 38.39 96.76 41.00 99.00 39.00 Z"/>
      </g>
      <g fill="#F0E0B4" stroke="none">
        <path d="M 94.00 46.00 C 94.19 47.58 94.29 46.93 95.00 48.00 C 96.22 47.41 94.10 43.32 94.00 43.00 C 94.18 43.96 93.88 45.03 94.00 46.00 Z"/>
      </g>
      <g fill="#EDA69D" stroke="none">
        <path d="M 47.00 50.00 C 47.07 50.18 48.00 50.00 48.00 50.00 C 48.12 48.69 48.50 45.65 50.00 45.00 C 47.88 45.53 46.75 48.01 47.00 50.00 Z"/>
      </g>
      <g fill="#FBF0ED" stroke="none">
        <path d="m 48,50 c 1.83,2.81 9.71,5.93 6.22,10.22 -3.49,4.29 -7.53,3.92 -12.89,5.11 -5.36,1.19 -7.93,8.87 0.67,7.67 1.10,-0.38 1.91,-0.51 3,-1 2.96,-1.33 8.21,-5.98 10.89,-2.89 2.69,3.09 -3.735725,15.461746 -2.805725,19.381746 C 63.574275,85.771746 57.62,63.34 70.01,63.01 82.39,62.67 76.699409,80.608306 67.679409,84.448306 l 1.915726,3.999999 C 78.575135,88.318305 85.92,73.82 83.77,65.23 81.62,56.64 68.21,57.67 62,59 58.97,55.32 57.72,43.06 50,45 c -1.5,0.65 -1.88,3.69 -2,5 z"/>
      </g>
    </svg>
  )
}

/** 圆点网格 SVG */
export function SvgDots({ className, style }: SvgAssetProps) {
  return (
    <svg className={className} style={style} viewBox="0 0 132 132" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="dotsPat" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="2" fill="#D4AF37" opacity="0.6"/>
        </pattern>
      </defs>
      <rect width="132" height="132" fill="url(#dotsPat)"/>
      <g>
        <circle cx="66" cy="66" r="40" fill="none" stroke="#D4AF37" strokeWidth="1" opacity="0.3"/>
        <circle cx="66" cy="66" r="60" fill="none" stroke="#D4AF37" strokeWidth="0.5" opacity="0.2"/>
      </g>
    </svg>
  )
}

/** 波浪 SVG */
export function SvgWaves({ className, style }: SvgAssetProps) {
  return (
    <svg className={className} style={style} viewBox="0 0 132 66" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="waveGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.4"/>
          <stop offset="50%" stopColor="#D4AF37" stopOpacity="0.8"/>
          <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.4"/>
        </linearGradient>
      </defs>
      <g>
        <path fill="url(#waveGrad2)" d="M0,22 Q33,2 66,22 T132,22 L132,66 L0,66 Z"/>
        <path fill="none" stroke="#D4AF37" strokeWidth="1.5" opacity="0.5" d="M0,22 Q33,2 66,22 T132,22"/>
        <path fill="none" stroke="#D4AF37" strokeWidth="1" opacity="0.35" d="M0,38 Q33,18 66,38 T132,38"/>
        <path fill="none" stroke="#D4AF37" strokeWidth="0.5" opacity="0.25" d="M0,50 Q33,30 66,50 T132,50"/>
      </g>
    </svg>
  )
}

/** 几何图形 SVG */
export function SvgGeometric({ className, style }: SvgAssetProps) {
  return (
    <svg className={className} style={style} viewBox="0 0 132 132" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="geoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.5"/>
          <stop offset="100%" stopColor="#2f748a" stopOpacity="0.5"/>
        </linearGradient>
      </defs>
      <g>
        <polygon fill="url(#geoGrad)" opacity="0.4" points="66,10 116,38 116,94 66,122 16,94 16,38"/>
        <polygon fill="none" stroke="#D4AF37" strokeWidth="1" opacity="0.6" points="66,10 116,38 116,94 66,122 16,94 16,38"/>
        <polygon fill="none" stroke="#D4AF37" strokeWidth="0.5" opacity="0.4" points="66,25 101,45 101,87 66,107 31,87 31,45"/>
        <circle cx="66" cy="66" r="8" fill="#D4AF37" opacity="0.5"/>
      </g>
    </svg>
  )
}

/** srlogo（与 hand 相同的手绘植物变体） */
export const SvgSrlogo = SvgHand

/** logoaction 动态 Logo - 外部 SVG + GSAP 动画 */
export function SvgLogoaction({ className, style }: SvgAssetProps) {
  return (
    <img
      src="/assets/svg/animated/logoaction.svg"
      className={className}
      style={style}
      alt="logoaction"
    />
  )
}

/** shou 静态手部图形 - 外部 SVG */
export function SvgShou({ className, style }: SvgAssetProps) {
  return (
    <img
      src="/assets/svg/animated/shou.svg"
      className={className}
      style={style}
      alt="shou"
    />
  )
}

/** 根据 variant 获取 SVG 组件 */
export function getSvgComponentByVariant(variant: string): React.FC<SvgAssetProps> {
  switch (variant) {
    case 'leaf': return SvgLeaf
    case 'hand': return SvgHand
    case 'dots': return SvgDots
    case 'waves': return SvgWaves
    case 'geometric': return SvgGeometric
    case 'srlogo': return SvgSrlogo
    case 'logoaction': return SvgLogoaction
    case 'shou': return SvgShou
    default: return SvgLeaf
  }
}
