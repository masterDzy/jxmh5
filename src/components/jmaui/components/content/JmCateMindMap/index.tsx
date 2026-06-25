'use client'

import { useState, useRef, useEffect, useLayoutEffect } from 'react'
import type { JmCateMindMapCategory, JmCateMindMapProps } from './props'
import { newproductAPI } from '@/lib/mobile-api'

/**
 * NewProduct API 原始字段 → JmCateMindMapCategory 转换
 *
 * 数据流:
 *   NewProductData = { categories: [{ name, subtitle, products: [{ id, name, subtitle, ... }] }] }
 *   → JmCateMindMapCategory[]
 *
 * 直接扁平映射,因为 newproduct 接口返回的"分类 → 产品列表"就是脑图想要的层级结构。
 * 顶级分类的 id 用 `cat-${idx}` 生成(因为 newproduct 分类没有独立 id 字段)。
 *
 * 分类副标题(`subtitle`)直接走 API,不再组件层 fallback — 文案在 DB `jx_apk_newproduct.分类副标题` 维护。
 */
function buildMindMapData(
  newProductData: {
    categories: {
      name: string
      subtitle?: string | null
      products: {
        id: number
        name: string
        subtitle?: string | null
        初级价格?: number
        高级价格?: number | null
        货币单位?: string
      }[]
    }[]
  },
): JmCateMindMapCategory[] {
  return newProductData.categories.map((cat, idx) => ({
    id: `cat-${idx}`,
    title: cat.name,
    description: cat.subtitle ?? undefined,
    children: cat.products.map(p => ({
      id: String(p.id),
      title: p.name,
      description: p.subtitle ?? undefined,
      initialPrice: p.初级价格,
      advancedPrice: p.高级价格 ?? undefined,
      currency: p.货币单位,
    })),
  }))
}

/**
 * JmCateMindMap — 思维导图式产品目录选择器
 *
 * **双模式数据源**:
 * - 传 `categories` → 静态模式(用 props 渲染)
 * - 不传 → 动态模式(组件自调 newproduct API,1 次拿全分类+产品)
 *
 * 两阶段动画:
 *   阶段 1: 3 大卡垂直排列,占满父容器
 *   阶段 2 (点选某大卡后):
 *     - 选中大卡缩到左上(约 40vw 宽)
 *     - 其它大卡缩成小条堆在选中大卡下方
 *     - 选中大卡右边缘扇形散出 N 条 SVG 贝塞尔曲线 + 竖排子分类小卡
 *
 * 主题色:通过 CSS 变量 `--mm-color` 透传,所有连线 / 边框 / 选中态跟随
 *
 * @example 见 props.ts
 */
export function JmCateMindMap({
  categories: externalCategories,
  defaultActiveId,
  themeColor = 'var(--jm-color-brand-vermilion, #D94E3D)',
  onSelect,
  onBookNow,
  bookButtonText = '立即预约',
  className = '',
}: JmCateMindMapProps) {
  // onSelect 已弃用:产品场景下 sub card 不可点(避免误触"只是看看"),
  // 主操作改走右下角"立即预约"按钮 (onBookNow)。
  // 保留 onSelect prop 是为了不让 mindmap / test 调试页立即报 TS 错误,
  // 等那两个页面重构时再删除 (JSDoc 已标 @deprecated)。
  void onSelect
  // ─── 内部数据状态(动态模式用) ───
  const [apiData, setApiData] = useState<JmCateMindMapCategory[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ─── 溢出滚动指示器:子卡超出可视区时底部显示跳动箭头 ───
  const [moreBelow, setMoreBelow] = useState(false)
  const subsRef = useRef<HTMLDivElement>(null)

  // ─── 动态量"可见区高度"注入 CSS 变量 ───
  // 原因:.jm-page-content 在 fixed header/footer 之间,直接用 100dvh 算 row 高
  //      会把 subs 撑得跟视口一样高,内容放得下 → 没有 overflow → 指示器不出现
  // 解决:组件 mount/resize 时量出 (footerTop - mmTop) 才是真正可画的区域,
  //      注入 --mm-visible-h 变量,CSS 用 minmax(0, var(--mm-visible-h))
  // 设计:.jm-mm 跟 footer 顶完全贴住(0 距离),不缓冲。
  //      jm-mm padding 上下 0,row 高度 = jm-mm 实际高度 = (footerTop - mmTop)
  //      跟 .jm-mm--collapsed .jm-mm__card min-height:163 (3×163+2×12=513) 高度一致
  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return

    const measure = () => {
      const mmRect = el.getBoundingClientRect()
      // 找页面上 fixed 在底部的 footer(可能在任意 jmaui 根容器里)
      const footer = document.querySelector<HTMLElement>('.jm-footer')
      const footerTop = footer
        ? footer.getBoundingClientRect().top
        : window.innerHeight
      // row 高度 = 可视区完整高度,jm-mm 跟 footer 顶完全贴住
      const visible = Math.max(180, footerTop - mmRect.top + 3)
      el.style.setProperty('--mm-visible-h', `${visible}px`)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [])

  // 决定最终展示的数据源:有外部 props 用外部,否则用 API 拉来的
  const useStatic = !!externalCategories && externalCategories.length > 0
  const categories = useStatic ? externalCategories : apiData

  // ─── 动态模式:不传 categories 时自管 fetch (newproduct 表 1 次拿全) ───
  useEffect(() => {
    if (useStatic) return  // 静态模式不拉 API
    let cancelled = false
    setLoading(true)
    setError(null)
    ;(async () => {
      try {
        const res = await newproductAPI.getProducts()
        if (cancelled) return
        if (res.error || !res.data) {
          throw new Error(res.message || '产品接口返回异常')
        }
        const built = buildMindMapData(res.data as any)
        setApiData(built)
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : String(e))
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [useStatic])

  // ─── 选中态 + SVG 路径 ───
  const [activeId, setActiveId] = useState<string | null>(defaultActiveId ?? null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [paths, setPaths] = useState<{ d: string; key: string }[]>([])
  const subRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const pathsDrawnRef = useRef<string | null>(null)

  // ─── subs 溢出检测:内容超出可视区时显示底部跳动箭头 ───
  useEffect(() => {
    const el = subsRef.current
    if (!el) return
    const check = () => {
      const overflow = el.scrollHeight > el.clientHeight + 2
      const notAtBottom = el.scrollTop < el.scrollHeight - el.clientHeight - 10
      setMoreBelow(overflow && notAtBottom)
    }
    check()
    const ro = new ResizeObserver(check)
    ro.observe(el)
    el.addEventListener('scroll', check, { passive: true })
    return () => {
      ro.disconnect()
      el.removeEventListener('scroll', check)
    }
  }, [activeId])

  /**
   * 量位置 + 生成 SVG path
   * 当前实现:清除所有连线,只保留布局关系
   */
  const generatePaths = () => {
    const container = containerRef.current
    if (!container) return
    const cRect = container.getBoundingClientRect()
    const activeCard = container.querySelector<HTMLElement>('[data-mm-active-card="true"]')
    if (!activeCard) return
    const aRect = activeCard.getBoundingClientRect()
    const subEls = Array.from(
      container.querySelectorAll<HTMLElement>('[data-mm-sub-index]')
    ).sort(
      (x, y) =>
        Number(x.getAttribute('data-mm-sub-index')) -
        Number(y.getAttribute('data-mm-sub-index'))
    )
    const nodes: { right: number; top: number; bottom: number; left: number; midX: number; midY: number }[] = []
    nodes.push({
      right: aRect.right - cRect.left,
      top: aRect.top - cRect.top,
      bottom: aRect.bottom - cRect.top,
      left: aRect.left - cRect.left,
      midX: aRect.left + aRect.width / 2 - cRect.left,
      midY: aRect.top + aRect.height / 2 - cRect.top,
    })
    subEls.forEach(el => {
      const r = el.getBoundingClientRect()
      nodes.push({
        right: r.right - cRect.left,
        top: r.top - cRect.top,
        bottom: r.bottom - cRect.top,
        left: r.left - cRect.left,
        midX: r.left + r.width / 2 - cRect.left,
        midY: r.top + r.height / 2 - cRect.top,
      })
    })
    setPaths([])
  }

  // active 切换后,等动画结束再量连线
  useLayoutEffect(() => {
    if (!activeId) {
      setPaths([])
      pathsDrawnRef.current = null
      return
    }
    const container = containerRef.current
    if (!container) return

    if (pathsDrawnRef.current === activeId) return

    let cancelled = false
    const onEnd = (e: TransitionEvent) => {
      if (cancelled) return
      if (e.propertyName === 'padding' || e.propertyName === 'width') {
        container.removeEventListener('transitionend', onEnd as any)
        requestAnimationFrame(() => {
          if (!cancelled) {
            generatePaths()
            pathsDrawnRef.current = activeId
          }
        })
      }
    }
    container.addEventListener('transitionend', onEnd as any)

    const fallback = setTimeout(() => {
      if (cancelled) return
      container.removeEventListener('transitionend', onEnd as any)
      generatePaths()
      pathsDrawnRef.current = activeId
    }, 650)

    return () => {
      cancelled = true
      container.removeEventListener('transitionend', onEnd as any)
      clearTimeout(fallback)
    }
  }, [activeId, categories])

  // 窗口尺寸变化时重画连线
  useEffect(() => {
    if (!activeId) return
    const onResize = () => generatePaths()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [activeId])

  const activeCategory = activeId ? categories.find(c => c.id === activeId) ?? null : null

  const handleCardClick = (id: string) => {
    if (activeId === id) {
      setActiveId(null)
      return
    }
    setActiveId(id)
  }

  // ─── 渲染 ───
  return (
    <div
      ref={containerRef}
      className={`jm-mm ${activeId ? 'jm-mm--expanded' : 'jm-mm--collapsed'} ${className}`}
      style={{ '--mm-color': themeColor } as React.CSSProperties}
    >
      {/* 加载/错误/空态:三态只渲染其中一个 */}
      {loading && (
        <div className="jm-mm__loading" role="status" aria-live="polite">
          <div className="jm-mm__spinner" />
          <span>分类加载中...</span>
        </div>
      )}
      {!loading && error && (
        <div className="jm-mm__error" role="alert">
          <p>分类加载失败:{error}</p>
          <button
            type="button"
            className="jm-mm__retry"
            onClick={() => {
              // 重置 error 后,useEffect 不会重跑,所以手动 setState 触发
              setError(null)
              setApiData([])  // 触发 useEffect 重跑
            }}
          >
            重试
          </button>
        </div>
      )}
      {!loading && !error && categories.length === 0 && (
        <div className="jm-mm__empty">暂无分类数据</div>
      )}

      {/* 正常渲染 */}
      {!loading && !error && categories.length > 0 && (
        <>
          {/* 左侧:大卡列表(堆叠 / 全屏) */}
          <div
            className="jm-mm__cards"
            data-state={activeId ? 'collapsed' : 'full'}
          >
            {categories.map(cat => {
              const isActive = cat.id === activeId
              const isDimmed = activeId !== null && !isActive
              return (
                <div
                  key={cat.id}
                  data-mm-active-card={isActive ? 'true' : 'false'}
                  className={`jm-mm__card ${isActive ? 'jm-mm__card--active' : ''} ${isDimmed ? 'jm-mm__card--dimmed' : ''}`}
                  onClick={() => handleCardClick(cat.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleCardClick(cat.id)
                    }
                  }}
                >
                  <div className="jm-mm__card-body">
                    <div className="jm-mm__card-title">{cat.title}</div>
                    {!activeId && cat.description && (
                      <div className="jm-mm__card-desc">{cat.description}</div>
                    )}
                  </div>
                  <div className="jm-mm__card-arrow" aria-hidden>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 6l6 6-6 6" />
                    </svg>
                  </div>
                </div>
              )
            })}
            {/* 底部磨砂 pill:溢出可滚时静默提示"更多" */}
            {moreBelow && (
              <div className="jm-mm__sub-more" aria-hidden>
                <div className="jm-mm__sub-more__inner">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 13l5 5 5-5" />
                    <path d="M7 6l5 5 5-5" />
                  </svg>
                </div>
              </div>
            )}
          </div>

          {/* 右侧:思维导图分支 */}
          {activeCategory && (
            <div
              className="jm-mm__branch"
              data-state="expanded"
              aria-label={`${activeCategory.title} 子分类`}
            >
              <svg className="jm-mm__lines" aria-hidden>
                {paths.map(p => (
                  <path
                    key={p.key}
                    d={p.d}
                    fill="none"
                    stroke="var(--mm-color, #D94E3D)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    className="jm-mm__line"
                  />
                ))}
              </svg>

              <div className="jm-mm__subs" ref={subsRef}>
                {activeCategory.children.map((sub, idx) => {
                  const hasInitialPrice = typeof sub.initialPrice === 'number'
                  return (
                    <div
                      key={sub.id}
                      ref={(el) => {
                        if (el) subRefs.current.set(sub.id, el)
                        else subRefs.current.delete(sub.id)
                      }}
                      data-mm-sub-index={idx}
                      className="jm-mm__sub"
                      style={{ '--mm-sub-delay': `${idx * 60}ms` } as React.CSSProperties}
                    >
                      <div className="jm-mm__sub-body">
                        <div className="jm-mm__sub-title">{sub.title}</div>
                        {sub.description && (
                          <div className="jm-mm__sub-desc">{sub.description.slice(-4)}</div>
                        )}
                      </div>
                      {(hasInitialPrice || onBookNow) && (
                        <div className="jm-mm__sub-footer">
                          {hasInitialPrice && (
                            <div className="jm-mm__sub-price">
                              <span className="jm-mm__sub-price-num">{sub.initialPrice}</span>
                              <span className="jm-mm__sub-price-unit">元起</span>
                            </div>
                          )}
                          {onBookNow && (
                            <button
                              type="button"
                              className="jm-mm__sub-book"
                              onClick={(e) => {
                                e.stopPropagation()
                                onBookNow(activeCategory.id, sub.id)
                              }}
                              aria-label={`${sub.title} - 立即预约`}
                            >
                              {bookButtonText}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default JmCateMindMap
