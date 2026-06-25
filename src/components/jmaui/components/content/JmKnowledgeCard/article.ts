/**
 * 知识文章类型定义
 * 被 JmKnowledgeCard、JmKnowledgeDetail 等组件共享
 */

export interface KnowledgeArticle {
  id: number
  title: string
  cover_image: string | null
  category: string
  category_name: string
  summary: string
  content: string
  is_video: boolean
  video_url: string | null
  share_count: number
  favorite_count: number
  published_at: string
}