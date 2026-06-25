/**
 * BgGraphics Animations
 * CSS 动画实现（兼容 H5，无 GSAP 依赖）
 */

export const animationKeyframes = `
@keyframes jm-breathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(0.97); }
}

@keyframes jm-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

@keyframes jm-skew {
  0%, 100% { transform: skewX(0deg); }
  50% { transform: skewX(28deg); }
}

@keyframes jm-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

@keyframes jm-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
`

export const animationStyles: Record<string, string> = {
  none: '',
  breathe: 'jm-breathe 3s ease-in-out infinite',
  float: 'jm-float 3s ease-in-out infinite',
  skew: 'jm-skew 3s ease-in-out infinite',
  pulse: 'jm-pulse 2s ease-in-out infinite',
}
