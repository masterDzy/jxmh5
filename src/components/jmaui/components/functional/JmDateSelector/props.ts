export interface JmDateSelectorProps {
  dates: Date[]
  selectedIndex: number | null
  onSelect: (index: number) => void
  themeColor?: string
  className?: string
}
