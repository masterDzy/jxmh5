'use client'

import type { JmServiceDetailDrawerProps } from './props'

/**
 * JmServiceDetailDrawer — 服务详情全屏抽屉
 *
 * 设计要点:
 *  - 顶部 sticky header:左「< 返回」按钮 + 中面包屑(分类 / 服务名)
 *  - 滑入动画:从底部 translateY(100%) 滑到 0(0.25s 缓动)
 *  - 遮罩点击关闭
 *  - body 区域可滚动
 *
 * 与 JmModal fullscreen 的区别:
 *  - header 有「< 返回」文字按钮(明确出口),不只是关闭 ×
 *  - 有面包屑显示「我在哪」(分类 / 服务名),导航语义更清晰
 *  - 从底部滑入,有"从目录划过去"的空间感
 */
export function JmServiceDetailDrawer({
  visible,
  onClose,
  categoryName,
  serviceName,
  onCategoryClick,
  children,
  className = '',
}: JmServiceDetailDrawerProps) {
  if (!visible) return null

  return (
    <div className={`jm-service-detail-drawer ${className}`}>
      {/* 遮罩层 */}
      <div className="jm-service-detail-drawer__overlay" onClick={onClose} />

      {/* 抽屉内容(从底部滑入) */}
      <div className="jm-service-detail-drawer__content">
        {/* 顶部手柄条(沿用 .jm-yunshi-drawer 视觉,暗示"抽屉"形态) */}
        <div className="jm-service-detail-drawer__handle" aria-hidden>
          <div className="jm-service-detail-drawer__handle-bar" />
        </div>

        {/* 右上角关闭按钮(始终渲染,与 header 内的「< 返回」并存 — 两种关闭入口) */}
        <button
          type="button"
          className="jm-service-detail-drawer__close"
          onClick={onClose}
          aria-label="关闭"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* 顶部 header:返回 + 面包屑 */}
        <div className="jm-service-detail-drawer__header">
          <button
            type="button"
            className="jm-service-detail-drawer__back"
            onClick={onClose}
            aria-label="返回目录"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span>返回</span>
          </button>

          {/* 面包屑 */}
          <div className="jm-service-detail-drawer__breadcrumb">
            {categoryName && (
              <>
                <button
                  type="button"
                  className="jm-service-detail-drawer__crumb"
                  onClick={onCategoryClick}
                  disabled={!onCategoryClick}
                >
                  {categoryName}
                </button>
                <span className="jm-service-detail-drawer__crumb-sep">/</span>
              </>
            )}
            <span className="jm-service-detail-drawer__crumb jm-service-detail-drawer__crumb--current">
              {serviceName}
            </span>
          </div>
        </div>

        {/* body 区域(可滚动) */}
        <div className="jm-service-detail-drawer__body">
          {children}
        </div>
      </div>
    </div>
  )
}

export default JmServiceDetailDrawer
