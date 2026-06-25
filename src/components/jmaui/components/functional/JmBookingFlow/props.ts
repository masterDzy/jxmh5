import type { PlannerItem } from '@/components/jmaui/components/content/JmPlannerList/props'
import type { DeliverySpace, DeliveryForm } from '@/lib/delivery'

export type BookingFlowStep = 'planner' | 'time' | 'info' | 'confirm'

export const BOOKING_FLOW_STEPS: { id: BookingFlowStep; label: string }[] = [
  { id: 'planner', label: '策划师' },
  { id: 'time', label: '预约时间' },
  { id: 'info', label: '联系信息' },
  { id: 'confirm', label: '确认' },
]

export interface JmBookingFlowProps {
  /** 服务 ID（从服务页传入） */
  serviceId: string
  /** 服务名称（用于摘要显示） */
  serviceName: string
  /** 关闭底部弹窗回调 */
  onClose: () => void
  /** 预约提交成功回调 */
  onSuccess?: () => void
  /** 主题色 */
  themeColor?: string
  /** 自定义类名 */
  className?: string
}

export interface BookingFlowState {
  plannerId: number | null
  selectedPlanner: PlannerItem | null
  deliverySpace: DeliverySpace | null
  deliveryForm: DeliveryForm | null
  selectedDateIndex: number | null
  selectedTime: string | null
  name: string
  phone: string
  note: string
  address: string
  submitting: boolean
  errorMsg: string
}