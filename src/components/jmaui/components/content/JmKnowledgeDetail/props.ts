/**
 * JmKnowledgeDetail Component Props
 * 知识详情页组件属性
 */

import { KnowledgeArticle } from '../JmKnowledgeCard/article'

export interface JmKnowledgeDetailProps {
  /** 文章数据 */
  article: KnowledgeArticle | null
  /** 关闭回调 */
  onClose: () => void
  /** 分享回调 */
  onShare?: () => void
  /** 收藏回调 */
  onFavorite?: () => void
}

export type { KnowledgeArticle }