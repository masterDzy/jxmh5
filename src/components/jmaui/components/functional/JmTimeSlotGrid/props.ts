export interface JmTimeSlotGridProps {
  slots: string[]
  selectedSlot: string | null
  onSelect: (slot: string) => void
  cols?: number
  themeColor?: string
  className?: string
}
