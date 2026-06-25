import type { DeliverySpace } from '@/lib/delivery'

export interface PlannerItem {
  id: number
  name: string
  specialty: string
  description: string
  single_price: number
  full_price: number
  avatar_url: string | null
  sort_order: number
}

export interface JmPlannerListProps {
  themeColor?: string
  selectedPlannerId?: number | null
  selectedDeliverySpace?: DeliverySpace | null
  onPlannerSelect?: (planner: PlannerItem) => void
  onDeliverySpaceChange?: (space: DeliverySpace) => void
  dates?: Date[]
  selectedDateIndex?: number | null
  selectedTime?: string | null
  onDateChange?: (index: number) => void
  onTimeChange?: (time: string) => void
  address?: string
  onAddressChange?: (val: string) => void
  onBookNow?: (planner: PlannerItem) => void
  className?: string
}
