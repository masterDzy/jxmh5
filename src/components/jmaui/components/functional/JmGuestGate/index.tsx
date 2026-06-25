'use client'
import { useRouter } from 'next/navigation'
import type { JmGuestGateProps } from './props'

export function JmGuestGate({
  children,
  guestNickname,
  isLoading = false,
  isReady = false,
  onRegisterClick,
  themeColor = 'var(--page-theme-color, #D94E3D)',
}: JmGuestGateProps) {
  const router = useRouter()

  // Loading: show skeleton
  if (isLoading) {
    return (
      <div className="jm-guest-gate jm-guest-gate--loading">
        <div className="jm-guest-gate__skeleton" />
      </div>
    )
  }

  // Has valid guest identity: show children
  if (isReady) {
    return <>{children}</>
  }

  // No identity: show gate overlay with registration prompt
  return (
    <div className="jm-guest-gate">
      <div className="jm-guest-gate__overlay">
        <div className="jm-guest-gate__card">
          {/* Lock icon */}
          <div className="jm-guest-gate__icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={themeColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              <circle cx="12" cy="16" r="1" />
            </svg>
          </div>
          <h3 className="jm-guest-gate__title">登录后查看完整内容</h3>
          <p className="jm-guest-gate__desc">注册即可享受更多专属服务</p>
          <button
            className="jm-guest-gate__btn"
            style={{ backgroundColor: themeColor } as React.CSSProperties}
            onClick={() => {
              if (onRegisterClick) {
                onRegisterClick()
              } else {
                router.push('/user/login?redirect=' + encodeURIComponent(window.location.pathname))
              }
            }}
          >
            注册 / 登录
          </button>
          <button
            className="jm-guest-gate__skip"
            onClick={() => {
              // Continue as guest - this function could be provided
              // For now, just go back
              router.back()
            }}
          >
            暂不登录
          </button>
        </div>
      </div>
    </div>
  )
}

export default JmGuestGate
