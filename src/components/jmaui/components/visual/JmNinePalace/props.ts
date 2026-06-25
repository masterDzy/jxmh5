export interface JmPalaceCellData {
  symbol?: string
  main?: string
  sub?: string
  color?: string
  symbols?: string[]
}
export interface JmNinePalaceProps {
  className?: string
  style?: React.CSSProperties
  cells?: JmPalaceCellData[]
}
