'use client'

import { useEffect, useRef } from 'react'
import type { JmAnimatedGraphicProps } from './props'

// 预定义 SVG 图形
const SVG_PATHS = {
  leaf: `<g fill="#D94E3D">
    <path d="M32 92c.28 8.42 6.98 10.32 12.75 3.75C50.53 89.18 50.61 88.05 53.33 79.33 56.05 70.61 52.68 70.64 45 72c-1.09.49-1.9.62-3 1-6.2 2.13-10.06-2.65-4.75-6.75C42.56 62.15 46.74 64.55 52.07 61.07 57.41 57.6 48.4 53.36 47 50c-.25-1.99.87-4.47 3-5 7.72-1.94 8.97 11.32 12 15 6.21-1.33 19.62-2.36 21.77 6.23 2.15 8.59-3.79 19.64-12.77 19.77v-1c.1-4.46 13.63-13.98 1.75-16.75C60.88 61.47 65.79 75.57 60.75 80.75 55.71 85.93 57.94 96.56 52.1 101.1 46.26 105.63 41.97 109.75 36 114c-.74 1.89 3.76 2.8 0 3 13.22 11.64 47.7 10.59 59-2 .82-1.36.57-4.39 1-6-7.95 1.48-15.82 2.45-22.23-3.77-6.41-5.22-12.3-13.22-3.77-17.23-2.24 14.66 17-3.2 26-9.72-.33-.42 2.25-3.79 2-4 0-7.77.92-17.68 0-25-1.92-7.31 1.81-15.44-1-22-1.33-.38-3.36-2.06-2 0-5.05-8.43-7.89-19.16-18.98-21.02C34.34 34.65 35.07 45.07 33.33 56.33 31.59 67.59 33.01 80.54 32 92z"/>
  </g>`,
  hand: `<g fill="#D94E3D">
    <path d="M1655 6642c-35-22-60-50-52-58 3-4 21 3 40 15 47 29 68 26 104-11 57-61 71-103 99-301 12-83 15-148 10-251-10-221-44-326-131-411-32-31-41-45-33-53 19-19 83 25 111 77 54 100 76 174 87 290 16 171-3 359-51 518-38 123-57 158-98 181-47 27-48 27-86 4z"/>
  </g>`,
  waves: `<g fill="none" stroke="#D4AF37" stroke-width="1.5">
    <path d="M0 22Q33 2 66 22T132 22"/>
    <path d="M0 38Q33 18 66 38T132 38"/>
    <path d="M0 50Q33 30 66 50T132 50"/>
  </g>`,
  dots: `<circle cx="66" cy="66" r="40" fill="none" stroke="#D4AF37" stroke-width="1" opacity="0.3"/>
    <circle cx="66" cy="66" r="60" fill="none" stroke="#D4AF37" stroke-width="0.5" opacity="0.2"/>`,
  geometric: `<polygon fill="url(#geoGrad)" opacity="0.4" points="66,10 116,38 116,94 66,122 16,94 16,38"/>
    <circle cx="66" cy="66" r="8" fill="#D4AF37" opacity="0.5"/>`,
}

// 预定义颜色
const DEFAULT_COLORS: Record<string, string> = {
  leaf: '#D94E3D',
  hand: '#D94E3D',
  waves: '#D4AF37',
  dots: '#D4AF37',
  geometric: '#D4AF37',
}

/**
 * JmAnimatedGraphic 动画图形组件
 * 用于页面中的动态装饰图形
 */
export function JmAnimatedGraphic({
  className = '',
  style,
  variant = 'leaf',
  customPaths,
  animation = 'breathe',
  duration = 3,
  delay = 0,
  autoPlay = true,
  color,
  opacity = 1,
  width = 100,
  height = 100,
}: JmAnimatedGraphicProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!autoPlay || animation === 'none' || typeof window === 'undefined') return

    // 动态加载 GSAP
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js'
    script.onload = () => {
      if (!containerRef.current) return

      const element = containerRef.current.querySelector('.jm-animated-graphic__svg')

      const gsap = (window as any).gsap
      if (!gsap || !element) return

      const animationConfig: any = {
        duration,
        delay,
        ease: 'sine.inOut',
      }

      switch (animation) {
        case 'breathe':
          gsap.to(element, {
            scale: 0.94,
            transformOrigin: 'center center',
            ...animationConfig,
            repeat: -1,
            yoyo: true,
          })
          break
        case 'float':
          gsap.to(element, {
            y: -8,
            ...animationConfig,
            repeat: -1,
            yoyo: true,
          })
          break
        case 'skew':
          gsap.to(element, {
            skewX: 5,
            ...animationConfig,
            repeat: -1,
            yoyo: true,
          })
          break
        case 'pulse':
          gsap.to(element, {
            opacity: 0.7,
            ...animationConfig,
            repeat: -1,
            yoyo: true,
          })
          break
        case 'swing':
          gsap.to(element, {
            rotation: 5,
            transformOrigin: 'top center',
            ...animationConfig,
            repeat: -1,
            yoyo: true,
          })
          break
        case 'rotate':
          gsap.to(element, {
            rotation: 360,
            transformOrigin: 'center center',
            duration: 8,
            repeat: -1,
            ease: 'none',
          })
          break
      }
    }
    document.head.appendChild(script)

    return () => {
      // 清理
    }
  }, [animation, duration, delay, autoPlay])

  const animationClass = animation !== 'none' ? `jm-animation-${animation}` : ''
  const fillColor = color || DEFAULT_COLORS[variant] || '#D4AF37'

  const svgContent = customPaths?.length
    ? customPaths.map((d, i) => <path key={i} d={d} fill={fillColor} />)
    : SVG_PATHS[variant as keyof typeof SVG_PATHS] || SVG_PATHS.leaf

  const viewBoxMap: Record<string, string> = {
    leaf: '0 0 132 147',
    hand: '0 0 457 800',
    waves: '0 0 132 66',
    dots: '0 0 132 132',
    geometric: '0 0 132 132',
  }

  return (
    <div
      ref={containerRef}
      className={`jm-animated-graphic ${animationClass} ${className}`}
      style={{
        opacity,
        width,
        height,
        ...style,
        ['--jm-duration' as string]: `${duration}s`,
      }}
    >
      <div
        className="jm-animated-graphic__svg"
        dangerouslySetInnerHTML={{
          __html: `<svg viewBox="${viewBoxMap[variant] || '0 0 100 100'}" xmlns="http://www.w3.org/2000/svg">
            ${variant === 'geometric' ? '<defs><linearGradient id="geoGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#D4AF37" stopOpacity="0.5"/><stop offset="100%" stopColor="#2f748a" stopOpacity="0.5"/></linearGradient></defs>' : ''}
            ${svgContent}
          </svg>`,
        }}
      />
    </div>
  )
}
