import type { ReactNode } from 'react'

/**
 * JmServiceDetailDrawer Props — 服务详情全屏抽屉(含面包屑)
 *
 * 视觉:
 *  - 全屏覆盖,从底部 translateY 滑入(0.25s 缓动)
 *  - 顶部 sticky header:左侧「< 返回」按钮 + 中间面包屑(分类 / 服务名)
 *  - body 区域可滚动,放服务大卡等重内容
 *
 * 用途:
 *  - /services 目录页点开服务时的详情容器
 *  - 替代 JmModal fullscreen,提供更明确的"导航语义"(返回 + 面包屑)
 */
export interface JmServiceDetailDrawerProps {
  /** 是否显示 */
  visible: boolean
  /** 关闭回调(点返回 / 点遮罩 / 滑出完成后) */
  onClose: () => void
  /** 面包屑第一段:所属分类名(如"个人服务"),可选 */
  categoryName?: string
  /** 面包屑第二段:当前服务名(主色显示) */
  serviceName: string
  /** 点面包屑分类名回调(可选,无则不响应) */
  onCategoryClick?: () => void
  /** 内容(通常放 JmServiceCard) */
  children: ReactNode
  /** 容器自定义类名 */
  className?: string
}
