/**
 * BgGraphics SVG Assets
 * SVG 资源路径（存放在 public/jmaui/svg/）
 */

/** 树叶 SVG 路径 */
export const leafSvgPath = '/jmaui/svg/leaf.svg'

/** 手部 SVG 路径 */
export const handSvgPath = '/jmaui/svg/hand.svg'

/** 圆点网格 SVG */
export const dotsSvgPath = '/jmaui/svg/dots.svg'

/** 波浪 SVG */
export const wavesSvgPath = '/jmaui/svg/waves.svg'

/** 几何图形 SVG */
export const geometricSvgPath = '/jmaui/svg/geometric.svg'

/** 根据 variant 获取 SVG 路径 */
export function getSvgPathByVariant(variant: string): string {
  switch (variant) {
    case 'leaf':
      return leafSvgPath
    case 'hand':
      return handSvgPath
    case 'dots':
      return dotsSvgPath
    case 'waves':
      return wavesSvgPath
    case 'geometric':
      return geometricSvgPath
    default:
      return leafSvgPath
  }
}
