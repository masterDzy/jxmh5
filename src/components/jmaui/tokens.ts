/**
 * jmaui Design Tokens
 * 九信阁移动端 H5 组件库设计规范
 */

/** 品牌色 */
export const colors = {
  /** 明朱红 */
  vermilion: '#D94E3D',
  /** 玫瑰红 */
  rose: '#da2e75',
  /** 石青 */
  cyan: '#2f748a',
  /** 橙金 */
  orange: '#ffad4f',
  /** 土金 */
  gold: '#D4AF37',
  /** 品牌红 */
  brandRed: '#da5343',
}

/** 中性色 */
export const neutrals = {
  /** 背景 */
  background: '#fafafa',
  /** 卡片 */
  surface: '#ffffff',
  /** 边框 */
  border: '#e0e0e0',
  /** 禁用 */
  disabled: '#999999',
  /** 次要文字 */
  secondary: '#6b6b6b',
  /** 主要文字 */
  primary: '#1a1a1a',
  /** 辅助文字 */
  muted: '#999999',
}

/** 语义色 */
export const semantic = {
  success: '#52c41a',
  warning: '#faad14',
  error: '#ff4d4f',
  info: '#1890ff',
}

/** 间距 */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
}

/** 圆角 */
export const radius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
}

/** 字号 */
export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 24,
  xxl: 32,
}

/** 字重 */
export const fontWeight = {
  regular: 400,
  medium: 500,
  bold: 700,
}

/** 行高 */
export const lineHeight = {
  tight: 1.3,
  normal: 1.5,
  relaxed: 1.8,
}

/** 字体族 */
export const fontFamily = {
  /** 标题/品牌 - 台湾明体 */
  heading: "'cwTeXMing', serif",
  /** 正文/UI - 思源黑体 */
  body: "'Noto Sans SC', sans-serif",
  /** 长文/CMS - 思源宋体 */
  cms: "'Noto Serif SC', serif",
}

/** 合并为统一 tokens 对象 */
export const jmauiTokens = {
  colors,
  neutrals,
  semantic,
  spacing,
  radius,
  fontSize,
  fontWeight,
  lineHeight,
  fontFamily,
}

export type JmTokens = typeof jmauiTokens
