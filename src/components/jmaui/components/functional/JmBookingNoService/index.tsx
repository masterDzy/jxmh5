'use client'

import { JmButton } from '@/components/jmaui/components/functional/JmButton'
import { JmBookingNoServiceProps } from './props'

export function JmBookingNoService({
  message = '未指定服务，请从服务页选择',
  buttonText = '去选择服务',
  redirectTo = '/services?from=booking',
  themeColor = 'var(--jm-color-brand-vermilion, #D94E3D)',
}: JmBookingNoServiceProps) {
  return (
    <div
      className="jm-booking-no-service"
      style={{ '--pl-color': themeColor } as React.CSSProperties}
    >
      <div className="jm-booking-no-service__icon" aria-hidden>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <p className="jm-booking-no-service__text">{message}</p>
      <JmButton
        variant="primary"
        size="lg"
        onClick={() => { window.location.href = redirectTo }}
      >
        {buttonText}
      </JmButton>
    </div>
  )
}

export default JmBookingNoService
