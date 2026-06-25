'use client'

import { getSvgComponentByVariant } from './svg-assets'
import type { BgGraphicsProps } from './props'

/**
 * JmBgGraphics 背景装饰组件
 * 用于页面区域性/全屏背景，带 SVG 动画效果
 * 使用内联 SVG 确保稳定渲染
 */
export function JmBgGraphics({
  variant = 'leaf',
  position = 'section',
  opacity = 1,
  blur = 0,
  animation,
  className = '',
}: BgGraphicsProps) {
  // 获取 SVG 组件
  const SvgComponent = getSvgComponentByVariant(variant)

  // 动画类名
  const animationClass = animation?.type && animation.type !== 'none'
    ? `jm-animation-${animation.type}`
    : ''

  // 容器样式
  const containerStyle: React.CSSProperties = {
    opacity,
    ...(blur > 0 ? { filter: `blur(${blur}px)` } : {}),
  }

  return (
    <div
      className={`jm-bg-graphics jm-bg-graphics--${position} ${animationClass} ${className}`}
      style={containerStyle}
    >
      <SvgComponent className="jm-bg-graphics__img" />
    </div>
  )
}
