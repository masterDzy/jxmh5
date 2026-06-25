export interface JmServerNavProps {
  className?: string
  style?: React.CSSProperties
  categories: string[]
  activeIndex: number
  onChange: (index: number) => void
  /** 每个分类的图标（ReactNode，可控颜色） */
  icons?: React.ReactNode[]
}
