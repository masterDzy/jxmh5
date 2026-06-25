/**
 * JmCategoryTabs Props
 */
export interface JmCategoryTabItem {
  id: string
  name: string
}

export interface JmCategoryTabsProps {
  /** 分类列表 */
  categories: JmCategoryTabItem[]
  /** 当前选中的分类ID */
  activeId?: string
  /** 默认选中的分类ID */
  defaultActiveId?: string
  /** 选中变化回调 */
  onChange?: (item: JmCategoryTabItem) => void
  /** 自定义类名 */
  className?: string
  /** 自定义样式 */
  style?: React.CSSProperties
  /** 主题色 */
  themeColor?: string
}
