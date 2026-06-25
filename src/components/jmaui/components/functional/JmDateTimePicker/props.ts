/**
 * JmDateTimePicker Props — 统一日期+时间段选择器(两栏式)
 *
 * 设计:左 = 月历,右 = 时段网格
 *   - 月历渲染完整月份,可选日期高亮(在 dates 范围内可点击)
 *   - 不可选日期(超出范围)灰色
 *   - 选日期 → 联动时段(右侧仍展示同一天,时段独立可选)
 *   - 移动端窄屏(<480px)自动改为上下两栏
 *   - 月份切换通过 < > 按钮
 */

/** 组件默认可预约时段:10:00 - 18:00,每 2 小时一档 */
export const DEFAULT_TIME_SLOTS: string[] = [
  '10:00', '12:00', '14:00', '16:00', '18:00',
]

export interface JmDateTimePickerProps {
  /** 可选日期列表(从今天开始的 N 天,组件据此标记哪些日期可点) */
  dates: Date[]
  /** 时间段数组,默认 DEFAULT_TIME_SLOTS */
  timeSlots?: string[]
  /** 选中日期在 dates 数组中的索引(未选 = null) */
  selectedDateIndex: number | null
  /** 选中时间(格式 'HH:mm',未选 = null) */
  selectedTime: string | null
  /** 选中日期回调 */
  onDateChange: (index: number) => void
  /** 选中时间回调 */
  onTimeChange: (time: string) => void
  /** 主色(默认 #D94E3D) */
  themeColor?: string
  /** 自定义类名 */
  className?: string
}
