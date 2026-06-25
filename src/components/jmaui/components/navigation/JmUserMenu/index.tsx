'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getGuestNickname, getGuestId } from '@/lib/guest'
import { STORAGE_KEYS, getItem } from '@/lib/storage'
import type { JmUserMenuProps } from './props'

/**
 * JmUserMenu — 页眉右上角用户入口图标 + 下拉面板
 *
 * 状态：
 * - guest: 显示名字末字 +"客"角标，点击弹出注册引导面板
 * - user: 显示名字首字，点击弹出用户信息面板
 * - loading: 灰色占位圈（等待读取 localStorage）
 */

/** 取名字的"缩写"：取最后一个字（访客_清风 → 清；用户_张三 → 三；管理员 → 管） */
function getInitial(name: string): string {
  const trimmed = name.trim()
  if (!trimmed) return '?'
  // 取最后一个字符作为"缩写"展示
  return trimmed[trimmed.length - 1]
}

export function JmUserMenu({
  themeColor = 'var(--jm-color-brand-vermilion, #D94E3D)',
  avatarSrc,
}: JmUserMenuProps) {
  const router = useRouter()

  // 从 localStorage 读取身份
  const [nickname, setNickname] = useState<string | null>(null)
  const [guestId, setGuestId] = useState<string | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    // 页面加载后从 localStorage 读取
    setNickname(getGuestNickname())
    setGuestId(getGuestId())
    setIsLoggedIn(!!getItem(STORAGE_KEYS.accessToken))
    setLoaded(true)
  }, [])

  if (!loaded) {
    return <div className="jm-user-menu__skeleton" />
  }

  return (
    <div className="jm-user-menu">
      <button
        className="jm-user-menu__btn"
        style={{ backgroundColor: themeColor }}
        onClick={() => router.push('/user/profile')}
        aria-label="用户中心"
      >
        {/* 名字缩写：游客显示"游客"，注册用户显示昵称末字 */}
        <span className="jm-user-menu__initial">
          {isLoggedIn ? getInitial(nickname || '用') : '游客'}
        </span>
        {/* 游客红点 */}
        {!isLoggedIn && guestId && (
          <span className="jm-user-menu__badge" style={{ backgroundColor: themeColor }} />
        )}
      </button>
    </div>
  )
}

export default JmUserMenu
