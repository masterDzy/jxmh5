'use client'

import type { JmTimeSlotGridProps } from './props'

export function JmTimeSlotGrid({
  slots,
  selectedSlot,
  onSelect,
  cols = 3,
  themeColor = '#D94E3D',
  className = '',
}: JmTimeSlotGridProps) {
  return (
    <div
      className={`jm-time-slot-grid ${className}`}
      style={{ '--cols': cols, '--theme-color': themeColor } as React.CSSProperties}
    >
      {slots.map((slot) => (
        <button
          key={slot}
          type="button"
          onClick={() => onSelect(slot)}
          className={`jm-time-slot-grid__item ${selectedSlot === slot ? 'jm-time-slot-grid__item--active' : ''}`}
        >
          {slot}
        </button>
      ))}
    </div>
  )
}

export default JmTimeSlotGrid
