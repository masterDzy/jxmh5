'use client'

/**
 * jmaui 组件展示页面 - Tab 导航版
 * 左侧 Tab 分类导航，右侧内容区展示组件
 */

import { useState } from 'react'
import {
  JmButton,
  JmLunarDate,
  JmTextBlock,
  JmHeroBanner,
  JmServiceCard,
  JmHeader,
  JmFooter,
  JmServerNav,
  JmOursHeader,
  JmBookingHeader,
  JmYunshiHeader,
  JmCategoryTabs,
  JmBgGraphics,
  JmAnimatedGraphic,
  JmLeafLogo,
  JmServiceCarousel,
  JmOursCateCard,
  JmServiceCateList,
  JmCateLabel,
  JmZodiacGrid,
  JmYunshiDrawer,
  JmYunshiResult,
  JmKnowledgeCard,
  JmKnowledgeDetail,
  JmProductCard,
  JmProductGrid,
  JmShopProductList,
  JmCateMindMap,
  JmPlannerList,
  JmCartDrawer,
  JmCartFloatButton,
  JmKnowledgeHeader,
  JmContactField,
  JmTextarea,
  JmModal,
  JmDateSelector,
  JmDateTimePicker,
  JmTimeSlotGrid,
  JmDeliveryPicker,
  JmBookingSummary,
  JmSearchDrawer,
  JmAppointmentTips,
  JmServiceDetailDrawer,
  JmShoppingBagBadge,
  JmBottomSheet,
  JmBookingFlow,
  type JmServiceItem,
  type JmServiceCateListItem,
  type JmOursCateItem,
  type KnowledgeArticle,
  type JmProductItem,
  type JmCartItem,
} from '@/components/jmaui'
import JmBrandBadge from '@/components/jmaui/components/content/JmBrandBadge'
import JmNinePalace from '@/components/jmaui/components/visual/JmNinePalace'
import type { JmPalaceCellData } from '@/components/jmaui/components/visual/JmNinePalace/props'

// ============================================================
// Mock 数据
// ============================================================

const mockService: JmServiceItem = {
  id: 'svc-001',
  name: '格局透视·时机推演',
  slug: 'geju-tuoshi',
  service_type: 'product',
  parent_id: null,
  price: 5999,
  original_price: 7999,
  has_member_price: true,
  member_price: 3999,
  cover_image: null,
  images: null,
  origin: '缘起：透过格局，洞见时机',
  description: '通过八字格局分析，结合大运流年，为您推演人生重要时机节点。',
  content_items: ['格局层次深度分析', '十年大运走向梳理', '流年关键节点提示', '趋吉避凶策略建议'],
  additional_rule: null,
  pricing_type: 'fixed',
  price_range_min: null,
  price_range_max: null,
  area_unit: null,
  consultation_mode: '线上咨询',
  duration: '60分钟',
  status: 1,
  is_hot: true,
  is_recommend: true,
  view_count: 128,
  sort_order: 1,
  category: '命理服务',
}

const mockServices: JmServiceItem[] = [
  mockService,
  { ...mockService, id: 'svc-002', name: '人脉经营·资源整合', slug: 'renmai-jiyuan', price: 3999, original_price: 4999, has_member_price: true, member_price: 2999, origin: '缘起：人脉即财脉', content_items: ['人脉图谱分析', '贵人方位定位', '资源整合策略', '人际关系调和'], category: '人脉服务', consultation_mode: '线下咨询', duration: '90分钟', is_hot: false, is_recommend: true },
  { ...mockService, id: 'svc-003', name: '空间诊断·能量优化', slug: 'kongjian-zhenduan', price: 8999, original_price: 12999, has_member_price: false, origin: '缘起：环境磁场影响人生运势', content_items: ['风水格局诊断', '能量气场分析', '布局调整方案', '吉祥物建议'], category: '风水服务', consultation_mode: '上门服务', duration: '120分钟', is_hot: true, is_recommend: false },
]

const mockNinePalaceCells: JmPalaceCellData[] = [
  { symbol: '庚', main: '格局透视', sub: '时机推演', color: '#D94E3D' },
  { symbol: '乙', main: '局势研判', sub: '策略定制', color: '#2f748a' },
  { symbol: '壬', main: '空间诊断', sub: '能量优化', color: '#D4AF37' },
  { symbol: '癸', main: '决策前瞻', sub: '前瞻指引', color: '#A6BA43' },
  {},
  { symbols: ['丁', '己'], main: '风险预警', sub: '避坑指南', color: '#da2e75' },
  { symbol: '戊丙', main: '人脉经营', sub: '资源整合', color: '#ffad4f' },
  { symbol: '辛', main: '突破方向', sub: '执行路径', color: '#6b6b6b' },
  {},
]

const mockArticles: KnowledgeArticle[] = [
  { id: 1, title: '八字命理入门：如何读懂自己的命盘', cover_image: null, category: 'mingli', category_name: '命理', summary: '八字是中国传统命理学的核心...', content: '八字，又称四柱八字...', is_video: false, video_url: null, share_count: 328, favorite_count: 156, published_at: '2026-05-20' },
  { id: 2, title: '家居风水：客厅布局的五大禁忌', cover_image: null, category: 'fengshui', category_name: '风水', summary: '客厅是住宅的核心区域...', content: '客厅风水是家居风水的重中之重...', is_video: true, video_url: 'https://example.com/video', share_count: 512, favorite_count: 287, published_at: '2026-05-18' },
]

const mockProducts: JmProductItem[] = [
  { id: 1, name: '黄铜葫芦挂件', cover_image: null, images: [], category: 'pendant', category_name: '挂件', price: 99, original_price: 159, is_virtual: false, stock: 88, description: '精制黄铜葫芦，寓意福禄双全。', content: '', created_at: '2026-05-01' },
  { id: 2, name: '八卦镜挂件', cover_image: null, images: [], category: 'pendant', category_name: '挂件', price: 159, original_price: null, is_virtual: false, stock: 56, description: '精铜八卦镜，辟邪化煞。', content: '', created_at: '2026-05-03' },
  { id: 3, name: '2026年流年运程书', cover_image: null, images: [], category: 'book', category_name: '书籍', price: 68, original_price: 88, is_virtual: true, stock: 999, description: '十二生肖全年运势详解。', content: '', created_at: '2026-04-20' },
  { id: 4, name: '开运铜钱摆件', cover_image: null, images: [], category: 'display', category_name: '摆件', price: 268, original_price: 368, is_virtual: false, stock: 30, description: '清代铜钱造型，招财进宝。', content: '', created_at: '2026-05-08' },
]

const mockCartItems: JmCartItem[] = [
  { id: 101, product_id: 1, quantity: 2, product: mockProducts[0] },
  { id: 102, product_id: 2, quantity: 1, product: mockProducts[1] },
]

const timeSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '19:00', '20:00', '21:00']

function getNextDays(count: number) {
  const days = []
  const today = new Date()
  for (let i = 0; i < count; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    days.push(d)
  }
  return days
}

// ============================================================
// 瀑布流单元格
// ============================================================

function ShowcaseItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="coms-showcase-item">
      <div className="coms-showcase-item__label">{label}</div>
      {children}
    </div>
  )
}

/** JmServiceDetailDrawer 演示组件 — 独立 state,避免污染 ShowcaseItem */
function ServiceDetailDrawerDemo() {
  const [visible, setVisible] = useState(false)
  return (
    <>
      <button
        type="button"
        onClick={() => setVisible(true)}
        style={{ padding: '8px 16px', border: '1px solid #da2e75', borderRadius: 8, color: '#da2e75', background: 'transparent' }}
      >
        打开服务详情抽屉
      </button>
      <JmServiceDetailDrawer
        visible={visible}
        onClose={() => setVisible(false)}
        categoryName="个人服务"
        serviceName={mockServices[0]?.name ?? '服务详情'}
      >
        <div style={{ padding: 16 }}>
          <JmServiceCard
            service={mockServices[0]}
            total={mockServices.length}
            currentIndex={0}
          />
        </div>
      </JmServiceDetailDrawer>
    </>
  )
}

// ============================================================
// Tab 内容定义
// ============================================================

const TABS = [
  { id: 'home', label: '首页' },
  { id: 'services', label: '服务' },
  { id: 'booking', label: '预约' },
  { id: 'shop', label: '商城' },
  { id: 'yunshi', label: '运势' },
  { id: 'knowledge', label: '知识' },
  { id: 'nav', label: '导航' },
  { id: 'visual', label: '视觉' },
  { id: 'form', label: '表单' },
] as const

type TabId = typeof TABS[number]['id']

// ============================================================
// 页面组件
// ============================================================

export default function ComponentsShowcasePage() {
  const [activeTab, setActiveTab] = useState<TabId>('home')
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null)
  const [cartItems, setCartItems] = useState<JmCartItem[]>(mockCartItems)
  const [cartOpen, setCartOpen] = useState(false)
  const cartTotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const [selectedZodiac, setSelectedZodiac] = useState<number | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerDemoOpen, setDrawerDemoOpen] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedDateIdx, setSelectedDateIdx] = useState<number | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<string>('')
  const [formName, setFormName] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formNote, setFormNote] = useState('')
  const [searchDrawerOpen, setSearchDrawerOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [demoPickedDateIdx, setDemoPickedDateIdx] = useState<number | null>(null)
  const [demoPickedTime, setDemoPickedTime] = useState<string | null>(null)
  // 交付方式 demo 状态
  const [demoDeliveryMode, setDemoDeliveryMode] = useState<'online' | 'onsite' | 'home' | ''>('')
  const [demoDeliveryMode2, setDemoDeliveryMode2] = useState<'online' | 'onsite' | 'home' | ''>('online')
  // 知识页组合 demo 状态(页眉 + tab 紧贴的真实使用方式)
  const [demoKnoTab, setDemoKnoTab] = useState('all')

  const handleZodiacSelect = (index: number) => {
    setSelectedZodiac(index)
    setDrawerOpen(true)
  }

  const handleUpdateQuantity = (id: number, quantity: number) => {
    setCartItems(prev => prev.map(item => item.id === id ? { ...item, quantity } : item))
  }
  const handleRemoveFromCart = (id: number) => {
    setCartItems(prev => prev.filter(item => item.id !== id))
  }

  // 底部弹窗 demo 状态
  const [bsSimpleVisible, setBsSimpleVisible] = useState(false)
  const [bsBookingVisible, setBsBookingVisible] = useState(false)
  const bookDemoServiceId = '999'
  const bookDemoServiceName = '八字详批'

  const nextDays = getNextDays(14)

  // ============================================================
  // 渲染各 Tab 内容
  // ============================================================

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="coms-content">
            <ShowcaseItem label="JmLeafLogo 浮叶 Logo">
              <div className="flex flex-col items-center gap-3">
                <JmLeafLogo width={88} />
                <JmLeafLogo width={60} />
                <JmLeafLogo width={44} />
              </div>
            </ShowcaseItem>
            <ShowcaseItem label="JmBrandBadge 品牌徽章">
              <JmBrandBadge brand="九信" tagline="—" subtitle="时运伙伴！" />
            </ShowcaseItem>
            <ShowcaseItem label="JmNinePalace 九宫格">
              <div className="flex justify-center">
                <JmNinePalace cells={mockNinePalaceCells} style={{ width: '200px', height: '200px' }} />
              </div>
            </ShowcaseItem>
            <ShowcaseItem label="JmLunarDate 万年历">
              <JmLunarDate showDate showGanZhi showYiJi />
            </ShowcaseItem>
            <ShowcaseItem label="JmAnimatedGraphic 动画图形">
              <div className="grid grid-cols-3 gap-3 justify-items-center">
                <JmAnimatedGraphic variant="leaf" animation="breathe" width={56} height={56} />
                <JmAnimatedGraphic variant="waves" animation="float" width={56} height={56} />
                <JmAnimatedGraphic variant="dots" animation="pulse" width={56} height={56} />
                <JmAnimatedGraphic variant="geometric" animation="swing" width={56} height={56} />
                <JmAnimatedGraphic variant="leaf" animation="rotate" width={56} height={56} />
              </div>
            </ShowcaseItem>
          </div>
        )

      case 'services':
        return (
          <div className="coms-content">
            <ShowcaseItem label="JmOursHeader 服务页眉">
              <JmOursHeader title="我们的服务" slogan="以专业成就信任" showAvatar />
            </ShowcaseItem>
            <ShowcaseItem label="JmServiceCateList 服务分类列表">
              <JmServiceCateList
                categories={[
                  { id: 'c1', name: '命理服务', services: [{ id: 's1', name: '格局透视', price: 5999, original_price: 7999, category: '命理服务', is_hot: true, slug: '', service_type: 'product', parent_id: null, origin: '', description: '', has_member_price: false, member_price: 0, cover_image: null, images: null, content_items: [], additional_rule: null, pricing_type: 'fixed', price_range_min: null, price_range_max: null, area_unit: null, consultation_mode: '', duration: '', status: 1, is_recommend: false, view_count: 0, sort_order: 0 }] },
                  { id: 'c2', name: '风水服务', services: [{ id: 's2', name: '空间诊断', price: 8999, original_price: 12999, category: '风水服务', is_hot: true, slug: '', service_type: 'product', parent_id: null, origin: '', description: '', has_member_price: false, member_price: 0, cover_image: null, images: null, content_items: [], additional_rule: null, pricing_type: 'fixed', price_range_min: null, price_range_max: null, area_unit: null, consultation_mode: '', duration: '', status: 1, is_recommend: false, view_count: 0, sort_order: 0 }] },
                ]}
                onServiceClick={(service, category) => console.log('service:', service, 'category:', category)}
              />
            </ShowcaseItem>
            <ShowcaseItem label="JmServiceCarousel 服务走马灯">
              <div className="ml-[-16px] mr-[-16px]">
                <JmServiceCarousel services={mockServices} onServiceClick={(s) => console.log('clicked:', s.name)} />
              </div>
            </ShowcaseItem>
            <ShowcaseItem label="JmOursCateCard 服务分类卡片">
              <JmOursCateCard
                title="企业服务"
                subtitle="这里是服务大类"
                themeColor="#da2e75"
                items={[
                  { name: '企业初创', description: 'xxxxx' },
                  { name: '企业合伙', description: 'xxxxx' },
                  { name: '股权架构', description: '设计最优结构' },
                ]}
                onItemClick={(item) => console.log(item.name)}
              />
            </ShowcaseItem>
            <ShowcaseItem label="JmServiceCard 服务卡片（带翻页）">
              <JmServiceCard
                service={mockServices[0]}
                total={mockServices.length}
                currentIndex={0}
              />
            </ShowcaseItem>
            <ShowcaseItem label="JmServiceDetailDrawer 服务详情抽屉（点下方按钮触发）">
              <ServiceDetailDrawerDemo />
            </ShowcaseItem>
            <ShowcaseItem label="JmPlannerList 策划师列表（自管 fetch, 后端 8009）">
              <JmPlannerList
                themeColor="var(--jm-color-brand-rose, #da2e75)"
                onBookNow={(p) => console.log('[showcase] 预约:', p.name)}
              />
            </ShowcaseItem>
          </div>
        )

      case 'booking':
        return (
          <div className="coms-content">
            <ShowcaseItem label="JmBookingHeader 预约页眉">
              <JmBookingHeader title="立即预约" />
            </ShowcaseItem>
            <ShowcaseItem label="JmAppointmentTips 预约流程 stepper">
              <JmAppointmentTips currentStepId="service" />
            </ShowcaseItem>
            <ShowcaseItem label="JmAppointmentTips 走到第 3 步（预约日期）">
              <JmAppointmentTips currentStepId="date" />
            </ShowcaseItem>
            <ShowcaseItem label="JmAppointmentTips 全部完成（可点回跳）">
              <JmAppointmentTips
                currentStepId="confirm"
                onStepClick={(id) => console.log('跳到步骤:', id)}
              />
            </ShowcaseItem>
            <ShowcaseItem label="JmBookingSummary 已选服务摘要">
              <JmBookingSummary service={mockService} />
            </ShowcaseItem>
            <ShowcaseItem label="JmDeliveryPicker 交付方式（未选）">
              <JmDeliveryPicker
                value={demoDeliveryMode}
                onChange={setDemoDeliveryMode}
                modes={[
                  { value: 'online', label: '线上咨询', desc: '微信视频/电话' },
                  { value: 'onsite', label: '到店面谈', desc: '线下门店' },
                  { value: 'home',   label: '上门服务', desc: '实地勘测' },
                ]}
                label="请选择交付方式"
                required
              />
            </ShowcaseItem>
            <ShowcaseItem label="JmDeliveryPicker 交付方式（已选 2 个,演示选中态）">
              <JmDeliveryPicker
                value={demoDeliveryMode2}
                onChange={setDemoDeliveryMode2}
                modes={[
                  { value: 'online', label: '线上咨询', desc: '微信视频/电话' },
                  { value: 'onsite', label: '到店面谈', desc: '线下门店' },
                ]}
                label="请选择交付方式"
                required
              />
            </ShowcaseItem>
            <ShowcaseItem label="JmContactField 联系字段">
              <div className="flex flex-col gap-4">
                <JmContactField
                  type="text"
                  label="姓名"
                  required
                  value={formName}
                  onChange={setFormName}
                  placeholder="请输入您的姓名"
                />
                <JmContactField
                  type="tel"
                  label="手机号"
                  required
                  value={formPhone}
                  onChange={setFormPhone}
                  placeholder="请输入手机号码"
                />
              </div>
            </ShowcaseItem>
            <ShowcaseItem label="JmDateSelector 日期选择">
              <JmDateSelector
                dates={nextDays}
                selectedIndex={selectedDateIdx}
                onSelect={setSelectedDateIdx}
              />
            </ShowcaseItem>
            <ShowcaseItem label="JmTimeSlotGrid 时间段网格">
              <JmTimeSlotGrid
                slots={timeSlots}
                selectedSlot={selectedSlot}
                onSelect={setSelectedSlot}
              />
            </ShowcaseItem>
            <ShowcaseItem label="JmDateTimePicker 日期+时段两栏选择器">
              <JmDateTimePicker
                dates={nextDays}
                selectedDateIndex={demoPickedDateIdx}
                selectedTime={demoPickedTime}
                onDateChange={setDemoPickedDateIdx}
                onTimeChange={setDemoPickedTime}
              />
            </ShowcaseItem>
            <ShowcaseItem label="JmTextarea 多行文本">
              <JmTextarea
                value={formNote}
                onChange={setFormNote}
                placeholder="请描述您想咨询的问题或需求..."
                label="备注"
              />
            </ShowcaseItem>
            <ShowcaseItem label="JmModal 弹窗">
              <JmButton size="sm" onClick={() => setModalVisible(true)}>打开弹窗</JmButton>
            </ShowcaseItem>
            <ShowcaseItem label="JmButton 按钮组">
              <div className="flex flex-col gap-3">
                <div className="flex gap-2 flex-wrap">
                  <JmButton size="sm">小按钮</JmButton>
                  <JmButton size="md">中按钮</JmButton>
                  <JmButton size="lg">大按钮</JmButton>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <JmButton variant="primary">主要</JmButton>
                  <JmButton variant="secondary">次要</JmButton>
                  <JmButton variant="outline">描边</JmButton>
                  <JmButton variant="ghost">幽灵</JmButton>
                </div>
              </div>
            </ShowcaseItem>
            <ShowcaseItem label="JmBottomSheet 底部弹窗（通用）">
              <JmButton size="sm" onClick={() => setBsSimpleVisible(true)}>打开底部弹窗</JmButton>
              <JmBottomSheet visible={bsSimpleVisible} onClose={() => setBsSimpleVisible(false)} title="通用底部弹窗">
                <div className="py-4 space-y-3">
                  <p className="text-sm text-gray-600">JmBottomSheet 是一个通用底部弹窗组件，支持半屏弹出、拖拽关闭、overlay 点击关闭。</p>
                  <p className="text-sm text-gray-600">可传入 title 显示标题栏，footer 显示底部固定操作区。</p>
                  <div className="flex gap-2 pt-2">
                    <JmButton size="sm" variant="outline" onClick={() => setBsSimpleVisible(false)}>关闭</JmButton>
                  </div>
                </div>
              </JmBottomSheet>
            </ShowcaseItem>
            <ShowcaseItem label="JmBookingFlow 预约流程底部弹窗（完整 4 步）">
              <JmButton size="sm" onClick={() => setBsBookingVisible(true)}>打开预约流程</JmButton>
              <JmBottomSheet
                visible={bsBookingVisible}
                onClose={() => setBsBookingVisible(false)}
                title="预约服务"
                themeColor="var(--jm-color-brand-rose, #da2e75)"
              >
                <JmBookingFlow
                  serviceId={bookDemoServiceId}
                  serviceName={bookDemoServiceName}
                  onClose={() => setBsBookingVisible(false)}
                  onSuccess={() => {
                    setBsBookingVisible(false)
                    alert('预约成功（演示）')
                  }}
                  themeColor="var(--jm-color-brand-rose, #da2e75)"
                />
              </JmBottomSheet>
            </ShowcaseItem>
          </div>
        )

      case 'shop':
        return (
          <div className="coms-content">
            <ShowcaseItem label="JmCategoryTabs 分类标签组">
              <JmCategoryTabs
                categories={[
                  { id: 'all', name: '全部' },
                  { id: 'pendant', name: '挂件' },
                  { id: 'book', name: '书籍' },
                  { id: 'display', name: '摆件' },
                ]}
                activeId="all"
                onChange={(item) => console.log(item.name)}
              />
            </ShowcaseItem>
            <ShowcaseItem label="JmProductGrid 商品网格">
              <JmProductGrid
                products={mockProducts}
                onAddToCart={(p) => console.log('add to cart:', p.name)}
                emptyText="暂无商品"
              />
            </ShowcaseItem>
            <ShowcaseItem label="JmProductCard 商品卡片">
              <div className="flex flex-col gap-3">
                {mockProducts.slice(0, 2).map((product) => (
                  <JmProductCard key={product.id} product={product} onAddToCart={(p) => console.log('add to cart:', p.name)} />
                ))}
              </div>
            </ShowcaseItem>
            <ShowcaseItem label="JmShopProductList 商城商品列表（受控）">
              <JmShopProductList
                products={mockProducts}
                loading={false}
                error={null}
                onAddToCart={(p) => console.log('add to cart:', p.name)}
              />
            </ShowcaseItem>
            <ShowcaseItem label="JmCateMindMap 思维导图式产品目录（点大卡 → 扇形分支）">
              <JmCateMindMap
                themeColor="var(--jm-color-brand-rose, #da2e75)"
                categories={[
                  {
                    id: 'person',
                    title: '个人类',
                    description: '八字命理 · 紫微斗数 · 占卜',
                    children: [
                      { id: 'bazi',  title: '八字详批', description: '四柱排盘 + 大运流年' },
                      { id: 'ziwei', title: '紫微斗数', description: '十二宫位 · 格局分析' },
                      { id: 'tarot', title: '塔罗占卜', description: '单张 / 三张 / 凯尔特' },
                      { id: 'dream', title: '解梦',     description: '周公解梦 + 心理学' },
                    ],
                  },
                  {
                    id: 'corp',
                    title: '企业类',
                    description: '风水顾问 · 营销策划 · 团队培训',
                    children: [
                      { id: 'fengshui', title: '办公风水', description: '现场勘察 + 调整方案' },
                      { id: 'naming',   title: '品牌取名', description: '音形义 + 八字配合' },
                      { id: 'train',    title: '国学培训', description: '团队定制课程' },
                    ],
                  },
                  {
                    id: 'event',
                    title: '活动与培训',
                    description: '沙龙 · 讲座 · 工作坊',
                    children: [
                      { id: 'salon',   title: '主题沙龙', description: '小型聚会 · 20 人内' },
                      { id: 'lecture', title: '公开讲座', description: '周末场 · 主题分享' },
                      { id: 'workshop', title: '工作坊',  description: '实操训练 · 半天/全天' },
                    ],
                  },
                ]}
                onSelect={(cat, sub) => console.log('select:', cat, '→', sub)}
              />
            </ShowcaseItem>
            <ShowcaseItem label="JmCartFloatButton 购物车悬浮">
              <div className="relative h-14 bg-gray-100 rounded">
                <JmCartFloatButton count={cartItems.reduce((s, i) => s + i.quantity, 0)} onClick={() => setCartOpen(true)} />
              </div>
            </ShowcaseItem>
            <ShowcaseItem label="JmCartDrawer 购物车抽屉（点击上面悬浮按钮触发）">
              <JmCartDrawer
                open={cartOpen}
                onClose={() => setCartOpen(false)}
                items={cartItems}
                total={cartItems.reduce((s, i) => s + i.product.price * i.quantity, 0)}
                onUpdateQuantity={(id, q) =>
                  setCartItems((items) => items.map((it) => (it.id === id ? { ...it, quantity: q } : it)))
                }
                onRemove={(id) => setCartItems((items) => items.filter((it) => it.id !== id))}
                onCheckout={() => alert('结算（演示）')}
              />
            </ShowcaseItem>
          </div>
        )

      case 'yunshi':
        return (
          <div className="coms-content">
            <ShowcaseItem label="JmYunshiHeader 运势页眉">
              <JmYunshiHeader title="每日运势" />
            </ShowcaseItem>
            <ShowcaseItem label="JmZodiacGrid 属相网格">
              <div className="flex flex-col gap-2">
                <JmZodiacGrid
                  selectedIndex={null}
                  onSelect={handleZodiacSelect}
                  themeColor="#fb5c3e"
                  showHint
                  hintText="点击选择属相，查看运势"
                />
                <div className="text-xs text-gray-400 text-center">
                  已选：{selectedZodiac !== null ? ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'][selectedZodiac] : '未选择'}
                </div>
              </div>
            </ShowcaseItem>
            <ShowcaseItem label="JmYunshiDrawer 运势抽屉（默认展开）">
              <JmYunshiDrawer
                zodiacIndex={0}
                weekData={null}
                monthData={null}
                themeColor="#fb5c3e"
                isOpen={drawerDemoOpen}
                onClose={() => setDrawerDemoOpen(false)}
              />
            </ShowcaseItem>
            <ShowcaseItem label="JmYunshiResult 运势结果展示">
              <JmYunshiResult
                zodiacIndex={selectedZodiac ?? 0}
                monthGanIndex={2}
                monthZhiIndex={5}
                yearGanIndex={7}
                yearZhiIndex={3}
                activeView="month"
                onViewChange={(v) => console.log('切换视图:', v)}
                themeColor="#fb5c3e"
              />
            </ShowcaseItem>
          </div>
        )

      case 'knowledge':
        return (
          <div className="coms-content">
            <ShowcaseItem label="JmKnowledgeHeader 知识页眉">
              <JmKnowledgeHeader title="开心园地" slogan="以专业成就信任" showAvatar />
            </ShowcaseItem>
            <ShowcaseItem label="JmKnowledgeHeader + JmCategoryTabs 组合(知识页真实布局)">
              <div className="flex flex-col bg-[#fafafa] rounded overflow-hidden border border-gray-200">
                <JmKnowledgeHeader
                  title="开心园地"
                  slogan="以专业成就信任"
                  showAvatar
                  themeColor="var(--jm-color-brand-cyan, #2f748a)"
                />
                <JmCategoryTabs
                  categories={[
                    { id: 'all',     name: '全部' },
                    { id: 'qimen',   name: '奇门遁甲' },
                    { id: 'xiang',   name: '相貌学' },
                    { id: 'shou',    name: '手相' },
                  ]}
                  activeId={demoKnoTab}
                  onChange={(c) => setDemoKnoTab(c.id)}
                  themeColor="var(--jm-color-brand-cyan, #2f748a)"
                />
              </div>
            </ShowcaseItem>
            <ShowcaseItem label="JmKnowledgeCard 知识卡片">
              <div className="flex flex-col gap-3">
                {mockArticles.map((article) => (
                  <JmKnowledgeCard key={article.id} article={article} onClick={() => setSelectedArticle(article)} />
                ))}
              </div>
            </ShowcaseItem>
            <ShowcaseItem label="JmKnowledgeDetail 知识详情（点击上方卡片触发）">
              <JmKnowledgeDetail
                article={selectedArticle}
                onClose={() => setSelectedArticle(null)}
                onShare={() => console.log('分享')}
                onFavorite={() => console.log('收藏')}
              />
            </ShowcaseItem>
          </div>
        )

      case 'nav':
        return (
          <div className="coms-content">
            <ShowcaseItem label="JmHeader 页头">
              <div className="flex flex-col gap-2">
                <JmHeader title="默认页头" />
                <JmHeader title="透明页头" variant="transparent" backgroundColor="#fafafa" />
                <JmHeader title="沉浸式" variant="minimal" showBack />
              </div>
            </ShowcaseItem>
            <ShowcaseItem label="JmServerNav 分类导航">
              <JmServerNav categories={['命理服务', '风水服务', '人脉服务', '决策咨询']} activeIndex={0} onChange={(i) => console.log(i)} />
            </ShowcaseItem>
            <ShowcaseItem label="JmFooter 页脚">
              {/* 用 transform 强制建立新的 fixed 定位上下文,让 JmFooter 固定在容器内而不是视口底部 */}
              <div className="coms-showcase-footer-demo">
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
            </ShowcaseItem>
          </div>
        )

      case 'visual':
        return (
          <div className="coms-content">
            <ShowcaseItem label="JmBgGraphics 背景装饰">
              <div className="grid grid-cols-2 gap-2">
                {(['leaf', 'waves', 'dots', 'geometric'] as const).map((variant) => (
                  <div key={variant} className="h-20 bg-gray-50 rounded overflow-hidden relative">
                    <JmBgGraphics variant={variant} position="section" opacity={0.4} />
                  </div>
                ))}
              </div>
            </ShowcaseItem>
            <ShowcaseItem label="JmHeroBanner 英雄区域">
              <JmHeroBanner backgroundColor="#da2e75" height="half">
                <div className="p-4 text-center text-white">
                  <div className="text-lg font-semibold mb-1" style={{ fontFamily: '"Noto Serif SC", serif' }}>九信阁</div>
                  <div className="text-xs opacity-80" style={{ letterSpacing: '0.1em' }}>时运伙伴 · 命理服务</div>
                </div>
              </JmHeroBanner>
            </ShowcaseItem>
            <ShowcaseItem label="JmShoppingBagBadge 购物袋徽章(多色,用于页眉 badgeIcon)">
              <div className="flex gap-6 items-center flex-wrap">
                <div className="flex flex-col items-center gap-1">
                  <JmShoppingBagBadge color="var(--jm-color-brand-green, #A6BA43)" size={40} />
                  <span className="text-[12px] text-gray-500">苔绿 / 商城默认</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <JmShoppingBagBadge color="var(--jm-color-brand-rose, #da2e75)" size={40} />
                  <span className="text-[12px] text-gray-500">玫红</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <JmShoppingBagBadge color="var(--jm-color-brand-vermilion, #D94E3D)" size={40} />
                  <span className="text-[12px] text-gray-500">朱红</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <JmShoppingBagBadge color="var(--jm-color-brand-cyan, #2f748a)" size={40} />
                  <span className="text-[12px] text-gray-500">青</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <JmShoppingBagBadge color="#171717" size={40} />
                  <span className="text-[12px] text-gray-500">黑</span>
                </div>
              </div>
            </ShowcaseItem>
            <ShowcaseItem label="JmCateLabel 分类标签">
              <div className="flex flex-col gap-2">
                <div className="flex gap-2 flex-wrap">
                  <JmCateLabel text="企业服务" />
                  <JmCateLabel text="个人服务" />
                  <JmCateLabel text="命理咨询" />
                </div>
                <div className="flex gap-2 flex-wrap">
                  <JmCateLabel text="热门" themeColor="#D94E3D" />
                  <JmCateLabel text="推荐" themeColor="#A6BA43" />
                  <JmCateLabel text="新品" themeColor="#2f748a" />
                </div>
              </div>
            </ShowcaseItem>
            <ShowcaseItem label="JmTextBlock 文本块">
              <div className="flex flex-col gap-4">
                <JmTextBlock title="标题文字" content="这是正文内容，支持多行文字展示。九信阁，为您提供专业的命理服务。" alignment="left" />
                <JmTextBlock title="居中标题" content="居中对齐的文本块，适用于引言、引导语等场景。" alignment="center" titleColor="#da2e75" contentColor="#666" />
              </div>
            </ShowcaseItem>
          </div>
        )

      case 'form':
        return (
          <div className="coms-content">
            <ShowcaseItem label="JmContactField 类型变体">
              <div className="flex flex-col gap-4">
                <JmContactField type="text" label="文本" value="示例文字" onChange={() => {}} />
                <JmContactField type="tel" label="手机号" value="13800138000" onChange={() => {}} placeholder="请输入手机号" />
                <JmContactField type="email" label="邮箱" value="" onChange={() => {}} placeholder="请输入邮箱" />
                <JmContactField type="password" label="密码" value="123456" onChange={() => {}} disabled />
                <JmContactField type="text" label="错误状态" value="错误输入" onChange={() => {}} error="这是一个错误提示" />
              </div>
            </ShowcaseItem>
            <ShowcaseItem label="JmTextarea 变体">
              <div className="flex flex-col gap-4">
                <JmTextarea value="默认内容" onChange={() => {}} label="默认" />
                <JmTextarea value="" onChange={() => {}} placeholder="请输入描述..." label="空内容" rows={4} />
              </div>
            </ShowcaseItem>
            <ShowcaseItem label="JmSearchDrawer 搜索抽屉">
              <div className="flex gap-2 flex-wrap">
                <JmButton size="sm" onClick={() => setSearchDrawerOpen(true)}>打开搜索抽屉</JmButton>
              </div>
              {searchQuery && (
                <div className="mt-2 text-xs text-gray-500">最近搜索：{searchQuery}</div>
              )}
            </ShowcaseItem>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="coms-page">
      {/* 顶部标题 */}
      <div className="coms-page__header">
        <h1 className="coms-page__title">jmaui 组件展示</h1>
        <p className="coms-page__subtitle">九信阁移动端 H5 组件库</p>
      </div>

      {/* 主体：左侧 Tab + 右侧内容 */}
      <div className="coms-layout">
        {/* 左侧 Tab 导航 */}
        <div className="coms-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`coms-tabs__item ${activeTab === tab.id ? 'coms-tabs__item--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 右侧内容区 */}
        <div className="coms-main">
          {renderContent()}
        </div>
      </div>

      {/* 弹出层 */}
      <JmKnowledgeDetail article={selectedArticle} onClose={() => setSelectedArticle(null)} />
      <JmYunshiDrawer
        zodiacIndex={selectedZodiac}
        weekData={null}
        monthData={null}
        themeColor="#fb5c3e"
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
      <JmCartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        total={cartTotal}
        onUpdateQuantity={handleUpdateQuantity}
        onRemove={handleRemoveFromCart}
        onCheckout={() => { alert('结算开发中...'); setCartOpen(false) }}
      />
      <JmModal visible={modalVisible} onClose={() => setModalVisible(false)} title="提示弹窗">
        <div className="text-center py-4">
          <p className="text-sm text-gray-600 mb-4">这是一个通用的弹窗组件，支持自定义标题、内容和底部操作。</p>
          <JmButton variant="primary" onClick={() => setModalVisible(false)}>知道了</JmButton>
        </div>
      </JmModal>

      <style>{`
        .coms-page {
          min-height: 100vh;
          background: #fafafa;
          display: flex;
          flex-direction: column;
        }
        .coms-page__header {
          padding: 20px 16px 12px;
          text-align: center;
          background: #fff;
          border-bottom: 1px solid #eee;
        }
        .coms-page__title {
          font-size: 20px;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0 0 4px;
          font-family: 'Noto Serif SC', serif;
          letter-spacing: 0.04em;
        }
        .coms-page__subtitle {
          font-size: 12px;
          color: #999;
          margin: 0;
        }
        .coms-layout {
          display: flex;
          flex: 1;
          height: calc(100vh - 80px);
        }
        .coms-tabs {
          width: 72px;
          flex-shrink: 0;
          background: #fff;
          border-right: 1px solid #eee;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
        }
        .coms-tabs::-webkit-scrollbar { display: none; }
        .coms-tabs__item {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 56px;
          font-size: 12px;
          color: #666;
          background: none;
          border: none;
          border-bottom: 1px solid #f0f0f0;
          cursor: pointer;
          transition: all 0.2s;
          writing-mode: horizontal-tb;
        }
        .coms-tabs__item--active {
          color: #D94E3D;
          background: #FFF5F4;
          font-weight: 600;
        }
        .coms-main {
          flex: 1;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          padding: 12px;
        }
        .coms-content {
          columns: 2 200px;
          column-gap: 10px;
        }
        .coms-showcase-item {
          break-inside: avoid;
          margin-bottom: 10px;
          background: #fff;
          border-radius: 8px;
          padding: 12px;
          border: 1px solid #e8e8e8;
        }
        .coms-showcase-item__label {
          font-size: 10px;
          color: #D94E3D;
          letter-spacing: 0.1em;
          margin-bottom: 10px;
          font-weight: 500;
        }
        /* JmFooter demo 容器:用 transform 强制建立新的 fixed 定位上下文,让 footer 固定在容器内 */
        .coms-showcase-footer-demo {
          position: relative;
          transform: translateZ(0);
          height: 64px;
          overflow: hidden;
          border-radius: 8px;
        }
      `}</style>
    </div>
  )
}
