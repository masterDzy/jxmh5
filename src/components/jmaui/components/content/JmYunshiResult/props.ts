/**
 * JmYunshiResult Props
 * 运势结果展示组件属性
 */

export interface JmYunshiResultProps {
  /** 选中的属相索引 (0-11) */
  zodiacIndex: number
  /** 当月天干索引 */
  monthGanIndex: number
  /** 当月地支索引 */
  monthZhiIndex: number
  /** 当年天干索引 */
  yearGanIndex: number
  /** 当年地支索引 */
  yearZhiIndex: number
  /** 当前选中视图：month | year */
  activeView?: 'month' | 'year'
  /** 视图切换回调 */
  onViewChange?: (view: 'month' | 'year') => void
  /** 主题色 */
  themeColor?: string
  /** 额外类名 */
  className?: string
  /** 样式对象 */
  style?: React.CSSProperties
}