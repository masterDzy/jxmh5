'use client'

import type { JmGuestProfileProps } from './props'

/**
 * JmGuestProfile — 游客详情页内容组件
 *
 * 展示游客身份详情 + 温馨提示引导 + 我的服务列表（全部可用，无功能锁定）。
 * 与注册用户、订阅用户的差别仅在顶部"游客"徽章 + 顶端温馨提示横幅，
 * 功能区不区分身份，全部菜单项可点击。
 *
 * @example
 * <JmGuestProfile
 *   guestNickname="访客_ABC1"
 *   themeColor="#D94E3D"
 *   onRegisterClick={() => router.push('/user/register')}
 *   onMessagesClick={() => router.push('/user/messages')}
 *   onBackClick={() => router.back()}
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
      {/* 顶部背景 — 头像 + 昵称 + 游客徽章 (紧凑布局，与 JmUserProfile 头部对齐) */}
      <div
        className="relative px-6 pt-[calc(20px+env(safe-area-inset-top))] pb-6"
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

      {/* 我的服务列表 — 全部可用，无功能锁定 */}
      <div className="mt-4 mx-4 rounded-2xl bg-white overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-[#f5f5f5]">
          <span className="text-xs text-[var(--page-theme-color,#D94E3D)] font-medium">我的服务</span>
        </div>

        {/* 消息通知 — 已有路由 /user/messages */}
        <button
          onClick={onMessagesClick}
          className="w-full flex items-center gap-3 px-4 h-[56px] active:bg-gray-50 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill={resolvedTheme}>
              <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
            </svg>
          </div>
          <span className="flex-1 text-left text-[#171717]">消息通知</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#ccc">
            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
          </svg>
        </button>
        <div className="mx-4 jm-divider-line" />

        {/* 预约记录 — 路由 TODO */}
        <button
          onClick={() => { /* TODO: 跳转预约记录页 */ }}
          className="w-full flex items-center gap-3 px-4 h-[56px] active:bg-gray-50 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill={resolvedTheme}>
              <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V8h16v10zm-2-1h-6v-2h6v2zM7 17v-2h7v2H7z"/>
            </svg>
          </div>
          <span className="flex-1 text-left text-[#171717]">预约记录</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#ccc">
            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
          </svg>
        </button>
        <div className="mx-4 jm-divider-line" />

        {/* 咨询记录 — 路由 TODO（已解锁，无需注册）*/}
        <button
          onClick={() => { /* TODO: 跳转咨询记录页 */ }}
          className="w-full flex items-center gap-3 px-4 h-[56px] active:bg-gray-50 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill={resolvedTheme}>
              <path d="M21 6h-2v9H6v2c0 .55.45 1 1 1h11l4 4V7c0-.55-.45-1-1-1zm-4 6V3c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v14l4-4h10c.55 0 1-.45 1-1z"/>
            </svg>
          </div>
          <span className="flex-1 text-left text-[#171717]">咨询记录</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#ccc">
            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
          </svg>
        </button>
        <div className="mx-4 jm-divider-line" />

        {/* 收藏内容 — 路由 TODO（已解锁，无需注册）*/}
        <button
          onClick={() => { /* TODO: 跳转收藏内容页 */ }}
          className="w-full flex items-center gap-3 px-4 h-[56px] active:bg-gray-50 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill={resolvedTheme}>
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
          <span className="flex-1 text-left text-[#171717]">收藏内容</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#ccc">
            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
          </svg>
        </button>
      </div>

      {/* 温馨提示横幅 — 软化引导（放在我的服务下方）*/}
      <div className="mt-4 mx-4 p-4 rounded-2xl bg-[#fef7f5] border border-[#fde8e4]">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center flex-shrink-0 border border-[#fde8e4]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill={resolvedTheme}>
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-[#171717] mb-1">温馨提示</h3>
            <ul
              className="text-xs text-[#666]"
              style={{ lineHeight: '2', letterSpacing: '0.5px' }}
            >
              <li className="relative pl-3.5 before:content-['•'] before:absolute before:left-0 before:text-[#999] before:font-bold">
                注册后获得更多运势播报的内容。
              </li>
              <li className="relative pl-3.5 before:content-['•'] before:absolute before:left-0 before:text-[#999] before:font-bold">
                订阅用户可以获得全部的运势播报的内容，并享受一定的服务折扣。
              </li>
              <li className="relative pl-3.5">欢迎大家注册和订阅。</li>
            </ul>
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={onRegisterClick}
                className="h-9 px-5 rounded-full text-white text-sm font-medium border-none cursor-pointer active:opacity-80 active:scale-[0.98] transition-all"
                style={{ backgroundColor: resolvedTheme }}
              >
                立即注册
              </button>
              {onBackClick && (
                <button
                  onClick={onBackClick}
                  className="h-9 px-5 rounded-full text-[#999] text-sm bg-transparent border-none cursor-pointer hover:text-[#666] transition-colors"
                >
                  暂不登录
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default JmGuestProfile