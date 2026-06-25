/**
 * JmZodiacGrid Props
 * 属相网格组件属性定义
 */

export interface JmZodiacGridProps {
  /** 当前选中的属相索引 (0-11) */
  selectedIndex?: number | null
  /** 点击属相回调 */
  onSelect?: (index: number) => void
  /**
   * 选中态反馈色(用于背景色块 + 文字 + 光环)
   * 默认品牌橙,适用于运势页;其他页面可通过 `themeColor` 覆盖
   * 注意:**属相图本身保持原色**,此色仅用于选中态 UI 反馈
   */
  themeColor?: string
  /** 自定义类名 */
  className?: string
  /** 是否显示提示文字 */
  showHint?: boolean
  /** 提示文字内容 */
  hintText?: string
}
