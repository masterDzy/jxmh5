'use client'

import { useState, useEffect } from 'react'
import { JmOursHeader } from '@/components/jmaui/components/navigation/JmOursHeader'
import { JmShoppingBagBadge } from '@/components/jmaui/components/visual/JmShoppingBagBadge'
import { JmCategoryTabs } from '@/components/jmaui/components/navigation/JmCategoryTabs'
import { JmFooter, JmShopProductList, JmCartDrawer, JmCartFloatButton, JmServiceDetailDrawer, JmProductDetail } from '@/components/jmaui'
import { CartProvider, useCart } from './context/CartContext'
import type { JmProductItem } from '@/components/jmaui/components/content/JmProductCard/props'
import type { JmCartItem } from '@/components/jmaui/components/functional/JmCartDrawer/props'
import { get, post, del } from '@/lib/http'

interface Category {
  id: string
  name: string
  cover_image: string | null
}

interface ShopApiResponse<T> {
  error: boolean
  message: string
  data: T
}

interface PaginatedData<T> {
  items: T[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

function ShopContent() {
  const [categories, setCategories] = useState<Category[]>([])
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [showCart, setShowCart] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<JmProductItem | null>(null)
  const [products, setProducts] = useState<JmProductItem[]>([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [productsError, setProductsError] = useState<string | null>(null)
  const { items, total, itemCount, addItem, removeItem, updateQuantity } = useCart()

  // 加载分类
  useEffect(() => {
    async function loadCategories() {
      try {
        const result = await get<PaginatedData<Category>>('/api/v1/shop/categories')
        if (!result.error && result.data) {
          setCategories([{ id: 'all', name: '全部', cover_image: null }, ...result.data.items])
        }
      } catch (err) {
        console.error('加载分类失败:', err)
      }
    }
    loadCategories()
  }, [])

  // 加载商品(activeCategory 变化时重拉)
  useEffect(() => {
    async function loadProducts() {
      try {
        setProductsLoading(true)
        setProductsError(null)
        const params: Record<string, any> = { page: 1, page_size: 20 }
        if (activeCategory !== 'all') params.category = activeCategory
        const result = await get<PaginatedData<any>>('/api/v1/shop/products', params)
        if (!result.error && result.data) {
          const items: JmProductItem[] = result.data.items.map((item: any) => ({
            id: typeof item.id === 'string' ? parseInt(item.id, 10) || item.id : item.id,
            name: item.name || '',
            cover_image: item.cover_image || null,
            images: item.images || [],
            category: item.category?.id || item.category_id || '',
            category_name: item.category?.name || item.category_name || '',
            price: typeof item.price === 'number' ? item.price : parseFloat(item.price || '0'),
            original_price: item.original_price != null
              ? (typeof item.original_price === 'number' ? item.original_price : parseFloat(item.original_price))
              : null,
            is_virtual: item.is_virtual ?? false,
            stock: typeof item.stock === 'number' ? item.stock : parseInt(item.stock, 10) || 0,
            description: item.description || '',
            content: item.content,
            created_at: item.created_at,
          }))
          setProducts(items)
        } else {
          setProductsError('加载失败，请联系管理员')
        }
      } catch (err) {
        console.error('加载商品失败:', err)
        setProductsError('加载失败，请联系管理员')
      } finally {
        setProductsLoading(false)
      }
    }
    loadProducts()
  }, [activeCategory])

  // 加入购物车
  const handleAddToCart = async (product: JmProductItem) => {
    if (product.stock <= 0) {
      return
    }
    try {
      const result = await post<any>('/api/v1/shop/cart', undefined, {
        params: { user_id: 'guest', product_id: product.id, quantity: 1 },
      })
      if (!result.error && result.data) {
        addItem({ ...result.data, product, quantity: 1 })
      }
    } catch (err) {
      console.error('加入购物车失败:', err)
    }
  }

  // 移除购物车商品
  const handleRemoveFromCart = async (cartId: number) => {
    try {
      await del(`/api/v1/shop/cart/${cartId}`, {
        params: { user_id: 'guest' },
      })
      removeItem(cartId)
    } catch (err) {
      console.error('移除失败:', err)
    }
  }

  // 结算
  const handleCheckout = async () => {
    if (items.length === 0) return

    // TODO: 实现结算流程
    alert('结算功能开发中...')
  }

  const activeCategoryData = categories.find(c => c.id === activeCategory)

  return (
    <div className="jm-shop-page">
      <JmOursHeader
        fixed={true}
        title="幸运商城"
        slogan="以专业成就信任"
        showAvatar
        backgroundColor="var(--jm-color-page-bg, #fafafa)"
        themeColor="var(--jm-color-brand-green, #A6BA43)"
        /* 购物袋徽章 — 苔绿,与 title 同色 */
        badgeIcon={<JmShoppingBagBadge color="var(--jm-color-brand-green, #A6BA43)" />}
      />

      <div className="jm-page-content jm-page-content--shop">
        <JmCategoryTabs
          categories={categories}
          activeId={activeCategory}
          onChange={(c) => setActiveCategory(c.id)}
          themeColor="var(--jm-color-brand-green, #A6BA43)"
        />
      </div>

      {activeCategoryData && activeCategoryData.cover_image && (
        <div className="jm-shop-banner">
          <img src={activeCategoryData.cover_image} alt={activeCategoryData.name} />
          <div className="shop-banner__text">
            <h2>{activeCategoryData.name}</h2>
          </div>
        </div>
      )}

      <div className="jm-shop-content">
        <JmShopProductList
          products={products}
          loading={productsLoading}
          error={productsError}
          onAddToCart={handleAddToCart}
          onProductClick={(p) => setSelectedProduct(p)}
          themeColor="var(--jm-color-brand-green, #A6BA43)"
        />
      </div>

      {/* 悬浮购物车按钮 */}
      <JmCartFloatButton
        count={itemCount}
        onClick={() => setShowCart(true)}
      />

      {/* 购物车抽屉 */}
      <JmCartDrawer
        open={showCart}
        onClose={() => setShowCart(false)}
        items={items as JmCartItem[]}
        total={total}
        onUpdateQuantity={updateQuantity}
        onRemove={handleRemoveFromCart}
        onCheckout={handleCheckout}
      />

      {/* 商品详情抽屉 — 复用 JmServiceDetailDrawer 壳 + JmProductDetail 内容 */}
      <JmServiceDetailDrawer
        visible={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        categoryName="幸运商城"
        serviceName={selectedProduct?.name ?? '商品详情'}
      >
        {selectedProduct && (
          <JmProductDetail
            product={selectedProduct}
            themeColor="var(--jm-color-brand-green, #A6BA43)"
            onAddToCart={(p) => {
              handleAddToCart(p)
              setSelectedProduct(null)
              setShowCart(true)
            }}
          />
        )}
      </JmServiceDetailDrawer>

      <JmFooter
        themeColors={{
          '/services':  'var(--jm-color-brand-rose, #da2e75)',
          '/yunshi':    'var(--jm-color-brand-amber, #ffad4f)',
          '/booking':   'var(--jm-color-brand-vermilion, #D94E3D)',
          '/knowledge': 'var(--jm-color-brand-cyan, #2f748a)',
          '/shop':      'var(--jm-color-brand-green, #A6BA43)',
        }}
      />
    </div>
  )
}

export default function ShopPage() {
  return (
    <CartProvider>
      <ShopContent />
    </CartProvider>
  )
}