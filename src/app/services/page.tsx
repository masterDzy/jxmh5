'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { JmOursHeader } from '@/components/jmaui/components/navigation/JmOursHeader'
import { JmFooter } from '@/components/jmaui/components/navigation/JmFooter'
import { JmCateMindMap } from '@/components/jmaui/components/content/JmCateMindMap'
import { JmSearchDrawer } from '@/components/jmaui/components/functional/JmSearchDrawer'
import { JmBottomSheet } from '@/components/jmaui/components/functional/JmBottomSheet'
import { JmBookingFlow } from '@/components/jmaui/components/functional/JmBookingFlow'
import type { JmCateMindMapCategory } from '@/components/jmaui/components/content/JmCateMindMap/props'
import { newproductAPI } from '@/lib/mobile-api'

interface NewProductItem {
  id: number
  name: string
  subtitle: string
  初级价格: number
  中级价格: number | null
  高级价格: number | null
  member_price: number
  货币单位: string
}

interface NewProductCategory {
  name: string
  subtitle?: string | null
  products: NewProductItem[]
}

interface NewProductData {
  categories: NewProductCategory[]
  total: number
}

export default function ServicesPage() {
  const [newProductData, setNewProductData] = useState<NewProductData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchVisible, setSearchVisible] = useState(false)
  const [searchResults, setSearchResults] = useState<NewProductItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  const [sheetOpen, setSheetOpen] = useState(false)
  const [bookServiceId, setBookServiceId] = useState('')
  const [bookServiceName, setBookServiceName] = useState('')

  const mindMapData: JmCateMindMapCategory[] = useMemo(() => {
    if (!newProductData) return []
    return newProductData.categories.map((cat, idx) => ({
      id: `cat-${idx}`,
      title: cat.name,
      description: cat.subtitle ?? undefined,
      children: cat.products.map(p => ({
        id: String(p.id),
        title: p.name,
        description: p.subtitle,
        initialPrice: p.初级价格,
        advancedPrice: p.高级价格 ?? undefined,
        currency: p.货币单位,
      })),
    }))
  }, [newProductData])

  const allProducts = useMemo(
    () => newProductData?.categories.flatMap(c => c.products) ?? [],
    [newProductData]
  )

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await newproductAPI.getProducts()
      if (result.error || !result.data) {
        throw new Error(result.message || '获取产品数据失败')
      }
      setNewProductData(result.data as NewProductData)
    } catch (err) {
      console.error('获取产品数据失败:', {
        error: err,
        message: err instanceof Error ? err.message : String(err),
      })
      setError(err instanceof Error ? err.message : '加载失败，请重试')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleBookNow = (_categoryId: string, subId: string) => {
    const product = allProducts.find(p => String(p.id) === subId)
    setBookServiceId(subId)
    setBookServiceName(product?.name ?? '')
    setSheetOpen(true)
  }

  const handleBookingSuccess = () => {
    setSheetOpen(false)
    setBookServiceId('')
    setBookServiceName('')
  }

  const handleSearchClick = () => { setSearchVisible(true) }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (!query.trim()) { setSearchResults([]); return }
    const results = allProducts.filter(p =>
      p.name.includes(query) || p.subtitle?.includes(query)
    )
    setSearchResults(results)
  }

  return (
    <div
      className="jm-services-page"
      style={{ '--page-theme-color': 'var(--jm-color-brand-rose, #da2e75)' } as React.CSSProperties}
    >
      <JmOursHeader
        title="我们的服务"
        slogan="以专业成就信任"
        showAvatar={true}
        backgroundColor="var(--jm-color-page-bg, #fafafa)"
        themeColor="var(--jm-color-brand-rose, #da2e75)"
        fixed={true}
        onSearchClick={handleSearchClick}
      />

      <div className="jm-page-content jm-page-content--services">
        {loading ? (
          <div className="jm-loading">加载中...</div>
        ) : error ? (
          <div className="jm-error">{error}</div>
        ) : (
          <JmCateMindMap
            categories={mindMapData}
            themeColor="var(--jm-color-brand-rose, #da2e75)"
            onBookNow={handleBookNow}
          />
        )}
      </div>

      <JmFooter
        themeColors={{
          '/services':  'var(--jm-color-brand-rose, #da2e75)',
          '/yunshi':    'var(--jm-color-brand-amber, #ffad4f)',
          '/booking':   'var(--jm-color-brand-vermilion, #D94E3D)',
          '/knowledge': 'var(--jm-color-brand-cyan, #2f748a)',
          '/shop':      'var(--jm-color-brand-rose, #da2e75)',
        }}
      />

      <JmSearchDrawer
        visible={searchVisible}
        onClose={() => setSearchVisible(false)}
        onSearch={handleSearch}
        pageType="services"
      />

      {searchQuery && (
        <div className="jm-search-result-modal">
          <div className="jm-search-result-modal__title">
            "{searchQuery}" 的搜索结果
          </div>
          <div className="jm-search-result-modal__count">
            找到 {searchResults.length} 个服务
          </div>
          {searchResults.length > 0 && (
            <div className="jm-search-result-modal__hint">
              点击查看详情
            </div>
          )}
        </div>
      )}

      <JmBottomSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="预约服务"
        themeColor="var(--jm-color-brand-rose, #da2e75)"
      >
        {bookServiceId && (
          <JmBookingFlow
            serviceId={bookServiceId}
            serviceName={bookServiceName}
            onClose={() => setSheetOpen(false)}
            onSuccess={handleBookingSuccess}
            themeColor="var(--jm-color-brand-rose, #da2e75)"
          />
        )}
      </JmBottomSheet>
    </div>
  )
}
