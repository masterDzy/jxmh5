'use client'

import type { JmZodiacGridProps } from './props'
import { shuxiangWebp, ZODIAC_CN, type ZodiacKey } from '@/components/jmaui/assets'

/** 12 生肖(地支顺序) — key 与 shuxiangWebp / ZODIAC_CN 严格对齐 */
const ZODIAC_DATA: ReadonlyArray<{ key: ZodiacKey; name: string }> = [
  { key: 'rat',     name: ZODIAC_CN.rat },
  { key: 'ox',      name: ZODIAC_CN.ox },
  { key: 'tiger',   name: ZODIAC_CN.tiger },
  { key: 'rabbit',  name: ZODIAC_CN.rabbit },
  { key: 'dragon',  name: ZODIAC_CN.dragon },
  { key: 'snake',   name: ZODIAC_CN.snake },
  { key: 'horse',   name: ZODIAC_CN.horse },
  { key: 'goat',    name: ZODIAC_CN.goat },
  { key: 'monkey',  name: ZODIAC_CN.monkey },
  { key: 'chicken', name: ZODIAC_CN.chicken },
  { key: 'dog',     name: ZODIAC_CN.dog },
  { key: 'pig',     name: ZODIAC_CN.pig },
]

/**
 * JmZodiacGrid 属相网格组件
 *
 * 图标:使用 `assets/shuxiang/v2_*.webp`(项目根软链到 src/assets)
 *      属相图色特殊,**保持原色**,不跟页面主题色
 * 选中态:仅在背景框上叠 **1px 实色矩形外框**(竖向 80×88),无背景、无光环、无缩放,
 *        不改图本身颜色、不改文字样式,极简反馈
 */
export function JmZodiacGrid({
  selectedIndex = null,
  onSelect,
  themeColor = 'var(--jm-color-brand-orange, #fb5c3e)',
  className = '',
  showHint = true,
  hintText = '点击属相可以获得运势播报哟',
}: JmZodiacGridProps) {
  return (
    <div className={`jm-zodiac-grid-wrapper ${className}`}>
      {showHint && (
        <div className="jm-zodiac-grid__hint text-center mb-3">
          <p className="text-[13px] text-[#999]">{hintText}</p>
        </div>
      )}
      <div className={`jm-zodiac-grid ${selectedIndex !== null ? 'jm-zodiac-grid--selected' : ''}`}>
        {ZODIAC_DATA.map((zodiac, index) => {
          const isActive = selectedIndex === index
          return (
            <button
              key={zodiac.key}
              type="button"
              className={`jm-zodiac-grid__item ${isActive ? 'jm-zodiac-grid__item--active' : ''}`}
              onClick={() => onSelect?.(index)}
              aria-pressed={isActive ? 'true' : 'false'}
              style={{ '--zodiac-active-color': themeColor } as React.CSSProperties}
            >
              <div className="jm-zodiac-grid__icon">
                <div className="jm-zodiac-grid__bg">
                  {/* 真实生肖图(位图,保持原色,不跟页眉色) */}
                  <img
                    className="jm-zodiac-grid__img"
                    src={shuxiangWebp[zodiac.key]}
                    alt={zodiac.name}
                    width={72}
                    height={72}
                    draggable={false}
                  />
                </div>
              </div>
              <span className="jm-zodiac-grid__label">{zodiac.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default JmZodiacGrid
