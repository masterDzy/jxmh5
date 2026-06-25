/**
 * JmAppointmentTips Props — 预约流程提示（横向 stepper）
 *
 * 设计说明：
 *  - 4 步标准流程：策划师+交付 → 预约时间 → 联系信息 → 备注提交（2026-06-14 起）
 *  - 当前步骤：实心 + 放大 + 主色 + 投影
 *  - 已完成：填充 + 勾选 + 主色
 *  - 未开始：空心灰
 *  - 点击已完成步骤可回跳（onStepClick 可选）
 *  - 移动端水平排布，圆点 28px + 步骤名 13px，整体宽度自适应
 */

export interface JmAppointmentStep {
  /** 步骤 ID（用户自定义，用于 currentStepId 匹配 + onStepClick 回参） */
  id: string
  /** 步骤名称（圆点下方的标签） */
  label: string
  /** 副文字（可选，显示在标签下方，更小字号） */
  description?: string
}

export interface JmAppointmentTipsProps {
  /**
   * 步骤列表
   * 不传则用 4 步标准模板：策划师 / 预约时间 / 联系信息 / 备注提交
   */
  steps?: JmAppointmentStep[]
  /** 当前活跃步骤 ID（与 steps[].id 匹配） */
  currentStepId: string
  /**
   * 可选：点击某步骤回调
   * 已完成步骤才可点；当前步骤 + 未开始步骤忽略
   */
  onStepClick?: (stepId: string) => void
  /** 主色（默认 #D94E3D 朱红） */
  themeColor?: string
  /** 已完成色（默认 #A6BA43 绿） */
  doneColor?: string
  /** 容器自定义类名 */
  className?: string
  /** 容器自定义样式 */
  style?: React.CSSProperties
}

/** 标准 4 步流程（与 /booking 页面对齐；2026-06-14 首屏改造：第 1 步由"交付方式"改为"策划师+交付"） */
export const DEFAULT_APPOINTMENT_STEPS: JmAppointmentStep[] = [
  { id: 'planner', label: '策划师' },
  { id: 'time', label: '预约时间' },
  { id: 'info', label: '联系信息' },
  { id: 'confirm', label: '备注提交' },
]
