/**
 * JmDeliveryPicker Props — 交付方式选择器（受控 chip 形态）
 *
 * 设计说明：
 *  - 视觉：两列 chip 横排（默认最多 3 个），白底 + 1px 灰边框
 *  - 选中态：实色品牌色背景 + 白字
 *  - 选项由父级从 service.delivery_modes 动态传入，本组件不做数据获取
 *  - 受控组件：value/onChange 双向绑定
 */

/** 交付方式标识（与后端保持一致的小写英文） */
export type JmDeliveryMode = 'online' | 'onsite' | 'home'

/** 单个交付方式选项 */
export interface JmDeliveryOption {
  /** 选项值（与后端 delivery_modes 字段对齐） */
  value: JmDeliveryMode
  /** 主标题（如"线上咨询"） */
  label: string
  /** 副描述（可选，如"微信视频/电话"） */
  desc?: string
}

/**
 * 业务映射: mode → label/desc,作为组件层 DEFAULT 暴露
 * page 层 MUST NOT 自创 mode→label 映射,直接 import 此常量
 */
export const DEFAULT_DELIVERY_OPTIONS: Record<JmDeliveryMode, Omit<JmDeliveryOption, 'value'>> = {
  online: { label: '线上咨询', desc: '微信视频 / 电话' },
  onsite: { label: '到店面谈', desc: '线下门店' },
  home:   { label: '上门服务', desc: '实地勘测' },
}

/**
 * 默认 fallback 列表: 未带 delivery_modes 字段时给两个最常用的
 * page 层 MUST NOT 自创 fallback 列表
 */
export const DEFAULT_DELIVERY_MODES: JmDeliveryMode[] = ['online', 'onsite']

export interface JmDeliveryPickerProps {
  /** 当前选中值（受控；空串 = 未选） */
  value: JmDeliveryMode | ''
  /** 选中回调（点击同一项不再触发；空值不会回调） */
  onChange: (mode: JmDeliveryMode) => void
  /** 可选项（父级从 service.delivery_modes 派生） */
  modes: JmDeliveryOption[]
  /** 步骤标题（默认"请选择交付方式"） */
  label?: string
  /** 是否必填（影响标题中的红色星号 *） */
  required?: boolean
  /** 错误文案（红色辅助说明） */
  error?: string
  /** 容器自定义类名 */
  className?: string
}
