export interface JmServiceItem {
  id: string
  name: string
  slug: string
  service_type: 'category' | 'product'
  parent_id: string | null
  price: number
  original_price: number | null
  has_member_price: boolean
  member_price: number | null
  cover_image: string | null
  images: string[] | null
  origin: string | null      // 缘起
  description: string | null // 描述
  content_items: string[] | null // 服务内容项
  additional_rule: string | null
  pricing_type: 'fixed' | 'range' | 'negotiable'
  price_range_min: number | null
  price_range_max: number | null
  area_unit: string | null
  consultation_mode: string | null  // 咨询方式
  duration: string | null  // 时长
  /** 可选交付方式（与后端 delivery_modes 字段对齐，可选） */
  delivery_modes?: string[] | null
  status: number
  is_hot: boolean
  is_recommend: boolean
  view_count: number
  sort_order: number
  category?: string  // 分类名称（前端用）
}

export interface JmServiceCarouselProps {
  services: JmServiceItem[]
  onServiceClick?: (service: JmServiceItem) => void
}
