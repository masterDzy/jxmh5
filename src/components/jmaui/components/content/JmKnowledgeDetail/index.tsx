'use client'

import { useEffect, useState } from 'react'
import { JmKnowledgeDetailProps, KnowledgeArticle } from './props'

const JmKnowledgeDetail: React.FC<JmKnowledgeDetailProps> = ({
  article,
  onClose,
  onShare,
  onFavorite,
}) => {
  const [isActive, setIsActive] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)

  // 入场动画
  useEffect(() => {
    if (article) {
      // 延迟添加 active 类以触发动画
      requestAnimationFrame(() => {
        setIsActive(true)
      })
      // 锁定背景滚动
      document.body.style.overflow = 'hidden'
    } else {
      setIsActive(false)
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [article])

  // 处理关闭
  const handleClose = () => {
    setIsActive(false)
    // 等待动画完成后调用回调
    setTimeout(() => {
      onClose()
    }, 300)
  }

  // 处理分享
  const handleShare = () => {
    if (onShare) {
      onShare()
    } else {
      // 默认分享行为
      if (article && navigator.share) {
        navigator.share({
          title: article.title,
          text: article.summary,
          url: window.location.href,
        })
      } else if (article) {
        navigator.clipboard.writeText(window.location.href)
        alert('链接已复制到剪贴板')
      }
    }
  }

  // 处理收藏
  const handleFavorite = () => {
    setIsFavorited(!isFavorited)
    if (onFavorite) {
      onFavorite()
    } else if (article) {
      alert(isFavorited ? `已取消收藏：${article.title}` : `已收藏：${article.title}`)
    }
  }

  // 处理内容点击（防止冒泡关闭）
  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  if (!article) return null

  // 格式化日期
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div
      className={`jm-knowledge-detail ${isActive ? 'active' : ''}`}
      onClick={handleClose}
    >
      {/* 固定顶部栏 */}
      <header className="jm-knowledge-detail__header" onClick={handleContentClick}>
        <button
          className="jm-knowledge-detail__back"
          onClick={handleClose}
          aria-label="返回"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <div className="jm-knowledge-detail__actions">
          <button
            className="jm-knowledge-detail__action"
            onClick={handleShare}
            aria-label="分享"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
            <span>分享</span>
          </button>

          <button
            className={`jm-knowledge-detail__action jm-knowledge-detail__action--favorite ${
              isFavorited ? 'active' : ''
            }`}
            onClick={handleFavorite}
            aria-label={isFavorited ? '取消收藏' : '收藏'}
          >
            <svg viewBox="0 0 24 24" fill={isFavorited ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <span>{isFavorited ? '已收藏' : '收藏'}</span>
          </button>
        </div>
      </header>

      {/* 可滚动内容区 */}
      <div className="jm-knowledge-detail__body">
        {/* 封面图 */}
        <div className="jm-knowledge-detail__cover">
          {article.cover_image ? (
            <img src={article.cover_image} alt={article.title} />
          ) : (
            <div className="jm-knowledge-detail__cover-placeholder">
              {article.is_video ? '🎬' : '📖'}
            </div>
          )}
          {/* 视频标识 */}
          {article.is_video && (
            <div className="jm-knowledge-detail__video-badge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5,3 19,12 5,21" />
              </svg>
              视频
            </div>
          )}
        </div>

        {/* 文章主体 */}
        <div className="jm-knowledge-detail__content" onClick={handleContentClick}>
          {/* 标题 */}
          <h1 className="jm-knowledge-detail__title">{article.title}</h1>

          {/* 元信息 */}
          <div className="jm-knowledge-detail__meta">
            <span className="jm-knowledge-detail__category">{article.category_name}</span>
            <span className="jm-knowledge-detail__dot">·</span>
            <span className="jm-knowledge-detail__date">{formatDate(article.published_at)}</span>
          </div>

          {/* 统计信息 */}
          <div className="jm-knowledge-detail__stats">
            <span className="jm-knowledge-detail__stat">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
              {article.share_count} 分享
            </span>
            <span className="jm-knowledge-detail__stat">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              {article.favorite_count} 收藏
            </span>
          </div>

          {/* 摘要区块 - 蓝色左边框 */}
          {article.summary && (
            <div className="jm-knowledge-detail__summary">
              <div className="jm-knowledge-detail__summary-label">摘要</div>
              <p className="jm-knowledge-detail__summary-text">{article.summary}</p>
            </div>
          )}

          {/* 正文内容 - HTML渲染 */}
          {article.content && (
            <div
              className="jm-knowledge-detail__article"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default JmKnowledgeDetail

// 导出类型供外部使用
export type { JmKnowledgeDetailProps, KnowledgeArticle }
