/**
 * 交付空间常量
 *
 * 业务含义：客户在 booking 选完策划师后，
 * 选择线上或线下交付方式。
 *
 * 后端对应：jxmapk/backend/app/constants/delivery.py
 *   改这里必须同步改后端 Enum，反之亦然。
 */

export const DELIVERY_SPACES = ['online', 'onsite'] as const
export type DeliverySpace = (typeof DELIVERY_SPACES)[number]

export const SPACE_LABEL_MAP: Record<DeliverySpace, string> = {
  online: '线上',
  onsite: '线下',
}

// 交付形式（文档 / 谈话）— 2026-06-21 补全，与后端 DeliveryForm 枚举对齐
export const DELIVERY_FORMS = ['document', 'conversation'] as const
export type DeliveryForm = (typeof DELIVERY_FORMS)[number]

export const FORM_LABEL_MAP: Record<DeliveryForm, string> = {
  document: '文档',
  conversation: '谈话',
}

