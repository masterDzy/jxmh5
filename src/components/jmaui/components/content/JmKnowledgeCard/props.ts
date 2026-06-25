import { KnowledgeArticle } from './article'

export type { KnowledgeArticle }

export interface JmKnowledgeCardProps {
  article: KnowledgeArticle
  onClick: () => void
}