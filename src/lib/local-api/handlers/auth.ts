/**
 * 认证模块 handler (全部 mock)
 *
 * 调试模式下:
 *  - send-code: 验证码固定 123456
 *  - phone-login: 任意 6 位 code 都通过,返回 mock JWT
 *  - wechat-login: 总是成功
 *  - me: 从 localStorage 读用户
 *  - logout: 总是 200
 *  - refresh: 总是 200 + 新 token
 */

import { STORAGE_KEYS, getItem, getJSON } from '@/lib/storage'
import type { LocalRequest, LocalResponse } from '../router'

function ok(data: any, message = 'ok'): LocalResponse {
  return { error: false, message, data }
}

function makeMockUser(phone: string) {
  return {
    id: 'mock-user-' + Date.now(),
    phone,
    nickname: '调试用户',
    avatar: '',
    member_level: 0,
    member_expire_at: null,
  }
}

function makeMockToken(userId: string): string {
  // 假 JWT: base64(header).base64(payload).signature
  // 不需要真的可验证,只要看起来像就行
  const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }))
  const payload = btoa(
    JSON.stringify({ sub: userId, exp: Math.floor(Date.now() / 1000) + 86400 * 30 })
  )
  return `${header}.${payload}.mock-signature`
}

export async function handleAuth(req: LocalRequest, route: string): Promise<LocalResponse> {
  // POST /api/v1/auth/send-code
  if (req.method === 'POST' && route === 'auth/send-code') {
    const phone = req.body?.phone
    if (!phone) return { error: true, message: '缺少 phone', data: null }
    console.log(`[LocalAuth] send-code: phone=${phone} code=123456`)
    return ok({ code: 123456, expires_in: 300 }, '验证码已发送（调试模式）')
  }

  // POST /api/v1/auth/phone-login
  if (req.method === 'POST' && route === 'auth/phone-login') {
    const { phone, code } = req.body || {}
    if (!phone || !code) {
      return { error: true, message: '缺少 phone 或 code', data: null }
    }
    if (code.length !== 6) {
      return { error: true, message: '验证码必须是 6 位', data: null }
    }
    const user = makeMockUser(phone)
    return ok({
      access_token: makeMockToken(user.id),
      refresh_token: makeMockToken(user.id + '-refresh'),
      user,
    }, '登录成功（调试模式）')
  }

  // POST /api/v1/auth/wechat-login
  if (req.method === 'POST' && route === 'auth/wechat-login') {
    const user = makeMockUser('wechat_' + Date.now())
    return ok({
      access_token: makeMockToken(user.id),
      refresh_token: makeMockToken(user.id + '-refresh'),
      user,
    }, '登录成功（调试模式）')
  }

  // GET /api/v1/auth/me
  if (req.method === 'GET' && route === 'auth/me') {
    // 优先从 localStorage 读真实保存的用户 (跟原 login 页保持一致)
    const cached = getJSON<any>(STORAGE_KEYS.user)
    if (cached) {
      return ok({ user: cached })
    }
    // 兜底:返回一个假用户
    return ok({ user: makeMockUser('13800000000') })
  }

  // POST /api/v1/auth/logout
  if (req.method === 'POST' && route === 'auth/logout') {
    return ok(null, '已登出')
  }

  // POST /api/v1/auth/refresh
  if (req.method === 'POST' && route === 'auth/refresh') {
    return ok({
      access_token: makeMockToken('refreshed-' + Date.now()),
      refresh_token: makeMockToken('refreshed-' + Date.now() + '-refresh'),
    })
  }

  return { error: true, message: `Unknown auth route: ${req.method} ${route}`, data: null }
}
