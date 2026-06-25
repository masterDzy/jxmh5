/**
 * JmCartFloatButton Props
 * 悬浮购物车按钮组件属性
 *
 * 固定在视口右下角的购物车入口浮岛，显示商品数红点。
 * 点击后由父组件控制 JmCartDrawer 的 visible。
 */

export type JmCartFloatButtonPosition = 'bottom-right' | 'bottom-center'

export interface JmCartFloatButtonProps {
  /** 购物车商品总数（用于红点显示） */
  count: number
  /** 总价（可选；提供则在按钮上以小额绿色显示） */
  totalPrice?: number
  /** 点击回调 */
  onClick: () => void
  /** 定位方式（默认 bottom-right） */
  position?: JmCartFloatButtonPosition
  /** 主题色（默认 #D94E3D） */
  themeColor?: string
  /** 自定义类名 */
  className?: string
  /** 自定义内联样式（动态值例外） */
  style?: React.CSSProperties
}
