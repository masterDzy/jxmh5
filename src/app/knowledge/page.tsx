'use client'

import { useState, useEffect, useCallback } from 'react'
import { JmKnowledgeHeader, JmKnowledgeDetail, JmKnowledgeCard } from '@/components/jmaui'
import { JmCategoryTabs } from '@/components/jmaui/components/navigation/JmCategoryTabs'
import { JmFooter } from '@/components/jmaui'
import { JmSearchDrawer } from '@/components/jmaui/components/functional/JmSearchDrawer'
import { get } from '@/lib/http'

// ============ Types ============

interface KnowledgeArticle {
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

interface Category {
  id: string
  name: string
}

// ============ 主页面 ============

export default function KnowledgePage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [articles, setArticles] = useState<KnowledgeArticle[]>([])
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null)

  // 加载分类
  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await get<{ items: { id: string; name: string }[] }>('/api/v1/knowledge/categories')
        if (data.error === false && data.data) {
          // 添加"全部"选项
          setCategories([
            { id: 'all', name: '全部' },
            ...data.data.items,
          ])
        }
      } catch (err) {
        console.error('加载分类失败:', err)
      }
    }
    loadCategories()
  }, [])

  // 加载文章
  const loadArticles = useCallback(async (category: string) => {
    try {
      setLoading(true)
      setError(null)
      const data = await get<{ items: KnowledgeArticle[] }>('/api/v1/knowledge/articles', { category })
      if (data.error === false && data.data) {
        setArticles(data.data.items)
      } else {
        setError('加载失败')
      }
    } catch (err) {
      setError('网络错误')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadArticles(activeCategory)
  }, [activeCategory, loadArticles])

  // 切换分类
  const handleCategoryChange = (item: { id: string; name: string }) => {
    setActiveCategory(item.id)
  }

  // 点击文章
  const handleArticleClick = (article: KnowledgeArticle) => {
    setSelectedArticle(article)
  }

  // 搜索 state
  const [searchVisible, setSearchVisible] = useState(false)
  const handleSearchClick = useCallback(() => setSearchVisible(true), [])
  const handleSearch = useCallback((query: string) => {
    // 知识页:搜索后关闭抽屉(后续可接路由跳搜索结果)
    setSearchVisible(false)
  }, [])

  return (
    <div className="jm-knowledge-page">
      <JmKnowledgeHeader
          fixed={true}
          title="开心园地"
          slogan="以专业成就信任"
          showAvatar={true}
          backgroundColor="var(--jm-color-page-bg, #fafafa)"
          themeColor="var(--jm-color-brand-cyan, #2f748a)"
          onSearchClick={handleSearchClick}
        />

      <div className="jm-page-content jm-page-content--knowledge">
        <JmCategoryTabs
          categories={categories}
          activeId={activeCategory}
          onChange={handleCategoryChange}
          themeColor="var(--jm-color-brand-cyan, #2f748a)"
        />
      </div>

      {/* 文章列表 */}
      <div className="knowledge-page__content">
        {loading ? (
          <div className="knowledge-page__loading">
            <div className="knowledge-page__spinner" />
            <p>加载中...</p>
          </div>
        ) : error ? (
          <div className="knowledge-page__error">
            <p>{error}</p>
            <button onClick={() => loadArticles(activeCategory)}>重试</button>
          </div>
        ) : articles.length === 0 ? (
          <div className="knowledge-page__empty">
            <div className="knowledge-page__empty-icon">📚</div>
            <p>暂无内容</p>
          </div>
        ) : (
          <div className="knowledge-page__grid">
            {articles.map((article) => (
              <JmKnowledgeCard
                key={article.id}
                article={article}
                onClick={() => handleArticleClick(article)}
              />
            ))}
          </div>
        )}
      </div>

      {/* 详情弹窗 */}
      <JmKnowledgeDetail
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
      />

      {/* 搜索弹窗 */}
      <JmSearchDrawer
        visible={searchVisible}
        onClose={() => setSearchVisible(false)}
        onSearch={handleSearch}
        pageType="knowledge"
      />

      <JmFooter
        themeColors={{
          '/services':  'var(--jm-color-brand-rose, #da2e75)',
          '/yunshi':    'var(--jm-color-brand-amber, #ffad4f)',
          '/booking':   'var(--jm-color-brand-vermilion, #D94E3D)',
          '/knowledge': 'var(--jm-color-brand-cyan, #2f748a)',
          '/shop':      'var(--jm-color-brand-rose, #da2e75)',
        }}
      />
    </div>
  )
}
