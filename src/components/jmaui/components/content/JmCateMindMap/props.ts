import type { ReactNode } from 'react'

/**
 * 思维导图式子分类
 */
export interface JmCateMindMapSub {
  /** 子分类 id */
  id: string
  /** 子分类标题 */
  title: string
  /** 简短描述(可选) */
  description?: string
  /** 自定义图标(可选,默认走内置 SVG) */
  icon?: ReactNode
  /** 初级价格(可选,缺则卡片不显示价格区间) */
  initialPrice?: number
  /** 高级价格(可选,缺则卡片不显示价格区间) */
  advancedPrice?: number
  /** 货币单位(可选,默认 'CNY',跟价格区间一起显示) */
  currency?: string
}

/**
 * 一级大分类(对应 3 大卡片之一)
 */
export interface JmCateMindMapCategory {
  /** 分类 id(唯一) */
  id: string
  /** 分类标题 */
  title: string
  /** 分类副标题/描述 */
  description?: string
  /** 分类图标(可选) */
  icon?: ReactNode
  /** 子分类(脑图分支数) */
  children: JmCateMindMapSub[]
}

/**
 * JmCateMindMap 组件 Props
 *
 * ## 双模式
 *
 * 组件支持两种数据来源,**传对配置 props 即可在任意页面复用**:
 *
 * ### 1. 静态模式(传 `categories`)
 *
 * 适合: 演示页 / 测试 / 嵌入固定数据。
 *
 * ```tsx
 * <JmCateMindMap
 *   categories={[
 *     { id: 'person', title: '个人类', children: [...] },
 *   ]}
 *   themeColor="..."
 * />
 * ```
 *
 * ### 2. 动态模式(不传 `categories`,组件自管数据)
 *
 * 适合: 业务页面 / 任意需要后端分类的页面。
 *
 * 组件内部会:
 * 1. 调用 `GET /api/v1/mobile/newproduct` 拉产品(扁平结构,内含 `categories[].products[]`)
 * 2. 转成 `JmCateMindMapCategory[]` 渲染(1 次拿全,无需二次拼)
 *
 * 加载/错误态由组件自身处理,page 不用关心。
 *
 * ```tsx
 * <JmCateMindMap themeColor="..." onSelect={(cat, sub) => ...} />
 * ```
 *
 * @example
 * <JmCateMindMap
 *   categories={[
 *     { id: 'person', title: '个人类', children: [...] },
 *     { id: 'corp',   title: '企业类', children: [...] },
 *     { id: 'event',  title: '活动与培训', children: [...] },
 *   ]}
 *   themeColor="var(--jm-color-brand-vermilion, #D94E3D)"
 *   onSelect={(cat, sub) => router.push(`/services?cat=${cat}&sub=${sub}`)}
 * />
 */
export interface JmCateMindMapProps {
  /**
   * 大分类列表(可选)
   *
   * - **传入非空数组** → 静态模式:用 props 渲染,跳过 API
   * - **不传 / 传空数组** → 动态模式:组件自调后端拉数据
   */
  categories?: JmCateMindMapCategory[]
  /** 初始激活的分类 id(可选) */
  defaultActiveId?: string
  /** 主题色(默认品牌朱红) */
  themeColor?: string
  /**
   * 点击子分类时回调
   * @deprecated sub card 已改为不可点(避免误触"只是看看"),
   *  主操作改走右下角"立即预约"按钮 (onBookNow)。
   *  保留此 prop 仅作兼容,待 mindmap / test 页面重构后删除。
   */
  onSelect?: (categoryId: string, subId: string) => void
  /** 点击子分类卡片右下角"立即预约"按钮时回调 */
  onBookNow?: (categoryId: string, subId: string) => void
  /** 子分类卡片右下角按钮文案（默认"立即预约"） */
  bookButtonText?: string
  /** 根容器 className */
  className?: string
}
