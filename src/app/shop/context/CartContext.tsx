'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'
import type { JmProductItem } from '@/components/jmaui/components/content/JmProductCard/props'

interface CartItemData {
  id: number
  product_id: number
  quantity: number
  product: JmProductItem
}

interface CartContextType {
  items: CartItemData[]
  total: number
  itemCount: number
  addItem: (item: CartItemData) => void
  removeItem: (id: number) => void
  updateQuantity: (id: number, quantity: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItemData[]>([])

  const addItem = (item: CartItemData) => {
    setItems(prev => {
      const existing = prev.find(i => i.product_id === item.product_id)
      if (existing) {
        return prev.map(i =>
          i.product_id === item.product_id
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        )
      }
      return [...prev, item]
    })
  }

  const removeItem = (id: number) => {
    setItems(prev => prev.filter(i => i.id !== id))
  }

  const updateQuantity = (id: number, quantity: number) => {
    setItems(prev =>
      prev.map(i => (i.id === id ? { ...i, quantity } : i))
    )
  }

  const clearCart = () => setItems([])

  // 计算总价
  const total = items.reduce((sum, item) => {
    return sum + item.product.price * item.quantity
  }, 0)

  // 计算商品总数
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider value={{ items, total, itemCount, addItem, removeItem, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}