/**
 * JmLunarDate Props
 * 万年历组件属性定义
 */

export interface JmLunarDateProps {
  /** 自定义类名 */
  className?: string
  /** 内联样式 */
  style?: React.CSSProperties
  /** 显示公历日期（大字） */
  showDate?: boolean
  /** 显示干支日期 */
  showGanZhi?: boolean
  /** 显示宜忌信息 */
  showYiJi?: boolean
  /** 公历日期文字颜色 */
  dateColor?: string
  /** 干支文字颜色 */
  ganZhiColor?: string
  /** 宜字颜色 */
  yiColor?: string
}
