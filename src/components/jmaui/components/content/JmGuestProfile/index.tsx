'use client'

import { JmLockedMenuItem } from '@/components/jmaui/components/functional/JmLockedMenuItem'
import type { JmGuestProfileProps } from './props'

/**
 * JmGuestProfile — 游客详情页内容组件
 *
 * 展示游客身份详情 + 注册引导 + 锁定/可用功能列表。
 *
 * @example
 * <JmGuestProfile
 *   guestNickname="访客_ABC1"
 *   themeColor="#D94E3D"
 *   onRegisterClick={() => router.push('/user/register')}
 *   onMessagesClick={() => router.push('/user/messages')}
 * />
 */
export function JmGuestProfile({
  guestNickname,
  themeColor = '#D94E3D',
  onRegisterClick,
  onMessagesClick,
  onBackClick,
}: JmGuestProfileProps) {
  const resolvedTheme = themeColor

  return (
    <div
      className="min-h-screen bg-[#fafafa] pb-[calc(40px+env(safe-area-inset-bottom))]"
      style={{ '--page-theme-color': resolvedTheme } as React.CSSProperties}
    >
      {/* 顶部背景 — 仅保留用户头像+昵称区域 */}
      <div
        className="relative px-6 pt-[calc(40px+env(safe-area-inset-top))] pb-12"
        style={{ background: `linear-gradient(135deg, ${resolvedTheme} 0%, #e8685a 100%)` }}
      >
        <div className="flex items-center gap-4">
          <div className="w-[72px] h-[72px] rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-white text-2xl font-bold">客</span>
          </div>
          <div className="flex-1">
            <h2 className="text-white text-xl font-medium">{guestNickname || '游客'}</h2>
            <p className="text-white/70 text-sm mt-1">游客模式</p>
          </div>
          <div className="px-3 py-1 rounded-full text-white text-xs font-medium bg-white/20">
            游客
          </div>
        </div>
      </div>

      {/* 注册引导卡片 */}
      <div className="mx-4 -mt-6 p-5 rounded-2xl bg-white shadow-sm border border-[#fde8e4]">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-[#fef2f0] flex items-center justify-center mx-auto mb-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={resolvedTheme} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="10" cy="7" r="4" />
              <line x1="19" y1="8" x2="19" y2="14" />
              <line x1="16" y1="11" x2="22" y2="11" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-[#171717] mb-2">注册后享受更多服务</h3>
          <p className="text-sm text-[#999] mb-5 leading-relaxed">
            查看完整内容 · 预约记录管理 · 专属会员权益 · 消息通知
          </p>
          <button
            className="w-full h-[48px] rounded-full text-white text-base font-medium border-none cursor-pointer transition-all active:opacity-80 active:scale-[0.98]"
            style={{ backgroundColor: resolvedTheme }}
            onClick={onRegisterClick}
          >
            注册 / 登录
          </button>
          {onBackClick && (
            <button
              className="w-full mt-3 h-[44px] rounded-full text-[#999] text-sm bg-transparent border-none cursor-pointer hover:text-[#666] transition-colors"
              onClick={onBackClick}
            >
              暂不登录，继续浏览
            </button>
          )}
        </div>
      </div>

      {/* 锁定功能列表 — 真正需要注册后才能用的功能 */}
      <div className="mt-4 mx-4 rounded-2xl bg-white overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-[#f5f5f5]">
          <span className="text-xs text-[#bbb] font-medium">注册后可解锁以下功能</span>
        </div>
        <JmLockedMenuItem
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#ccc">
              <path d="M21 6h-2v9H6v2c0 .55.45 1 1 1h11l4 4V7c0-.55-.45-1-1-1zm-4 6V3c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v14l4-4h10c.55 0 1-.45 1-1z"/>
            </svg>
          }
          label="咨询记录"
          description="注册后可查看历史咨询内容"
        />
        <div className="mx-4 jm-divider-line" />
        <JmLockedMenuItem
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#ccc">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          }
          label="收藏内容"
          description="注册后可收藏服务与文章"
        />
      </div>

      {/* 可用功能列表 — 游客已可直接使用的功能 */}
      <div className="mt-4 mx-4 rounded-2xl bg-white overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-[#f5f5f5]">
          <span className="text-xs text-[var(--page-theme-color,#D94E3D)] font-medium">游客可用的功能</span>
        </div>
        <button
          onClick={onMessagesClick}
          className="w-full flex items-center gap-3 px-4 h-[56px] active:bg-gray-50 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#D94E3D">
              <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
            </svg>
          </div>
          <span className="flex-1 text-left text-[#171717]">消息通知</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#ccc">
            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
          </svg>
        </button>
        <div className="mx-4 jm-divider-line" />
        <button
          onClick={() => { /* TODO: 跳转预约记录页 */ }}
          className="w-full flex items-center gap-3 px-4 h-[56px] active:bg-gray-50 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#D94E3D">
              <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V8h16v10zm-2-1h-6v-2h6v2zM7 17v-2h7v2H7z"/>
            </svg>
          </div>
          <span className="flex-1 text-left text-[#171717]">预约记录</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#ccc">
            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
          </svg>
        </button>
      </div>
    </div>
  )
}

export default JmGuestProfile
