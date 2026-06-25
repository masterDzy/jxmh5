/**
 * 存储工具层 — 统一 localStorage 操作
 *
 * 规则：
 * 1. 所有 localStorage 操作必须包裹 try/catch
 * 2. Token keys 统一在此定义，避免散落多处
 */

export const STORAGE_KEYS = {
  accessToken: 'jx_apk_access_token',
  refreshToken: 'jx_apk_refresh_token',
  user: 'jx_apk_user',
  guestToken: 'jx_apk_guest_token',
  guestId: 'jx_apk_guest_id',
  guestNickname: 'jx_apk_guest_nickname',
} as const

// ==================== 安全读写 ====================

export function getItem(key: string): string | null {
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

export function setItem(key: string, value: string): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, value)
  } catch {
    // 忽略存储错误（私有模式/存储满）
  }
}

export function removeItem(key: string): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(key)
  } catch {
    // 忽略
  }
}

export function getJSON<T = unknown>(key: string): T | null {
  const raw = getItem(key)
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function setJSON(key: string, value: unknown): void {
  setItem(key, JSON.stringify(value))
}
