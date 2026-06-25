'use client'

import { JmKnowledgeCardProps, KnowledgeArticle } from './props'
import { backgrounds, type BackgroundKey } from '@/components/jmaui/assets/backgrounds'

/** 20 张本地图按数组顺序作为分发池,稳定 id 取模映射(id=1 → 图0,以此类推) */
const BACKGROUND_KEYS: readonly BackgroundKey[] = [
  'auroraSky', 'bambooForest', 'beachMountains', 'chineseGarden', 'chinesePagoda',
  'chinesePavilion', 'chineseTemple', 'coastalSunset', 'foggyMountains', 'forestPath',
  'forestWaterfall', 'islandSunset', 'mistyForest', 'mountainLake', 'oceanCliff',
  'oceanMountains', 'paradiseBeach', 'starryLake', 'sunsetBeach', 'tropicalBeach',
]

/** 根据 article.id 取模,得到一个稳定的本地图 key(保证不同 id 拿不同图) */
function pickBackground(articleId: number): BackgroundKey {
  return BACKGROUND_KEYS[articleId % BACKGROUND_KEYS.length]
}

export default function JmKnowledgeCard({ article, onClick }: JmKnowledgeCardProps) {
  // 优先用本地图池;不依赖后端 cover_image(避免占位图/外网加载)
  const localBg = backgrounds[pickBackground(article.id)]
  return (
    <button className="jm-knowledge-card" onClick={onClick}>
      <div className="jm-knowledge-card__cover">
        {localBg ? (
          <img
            src={localBg}
            alt={article.title}
            loading="lazy"           /* 原生懒加载:仅当卡片进入视口才下载 */
            decoding="async"        /* 异步解码:不阻塞主线程,首屏更快 */
            fetchPriority="low"     /* 低优先级:让位给关键内容 */
          />
        ) : (
          <div className="jm-knowledge-card__cover-placeholder">
            {article.is_video ? '🎬' : '📖'}
          </div>
        )}
        {article.is_video && (
          <div className="jm-knowledge-card__video-badge">▶</div>
        )}
      </div>

      <div className="jm-knowledge-card__content">
        <div className="jm-knowledge-card__category">{article.category_name}</div>
        <h3 className="jm-knowledge-card__title">{article.title}</h3>
        <p className="jm-knowledge-card__summary">{article.summary}</p>
        <div className="jm-knowledge-card__meta">
          <span className="jm-knowledge-card__date">
            {new Date(article.published_at).toLocaleDateString('zh-CN', {
              month: 'short',
              day: 'numeric',
            })}
          </span>
          <span className="jm-knowledge-card__stats">
            {article.share_count} 分享 · {article.favorite_count} 收藏
          </span>
        </div>
      </div>
    </button>
  )
}