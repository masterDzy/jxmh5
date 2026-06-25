/**
 * 本地 API 路由
 *
 * 把 /api/v1/* 的请求根据 path 转发到对应的 handler
 * 由 http.ts 的 axios 拦截器调用
 */

import { handleServices } from './handlers/services'
import { handleFortune } from './handlers/fortune'
import { handleKnowledge } from './handlers/knowledge'
import { handleShop } from './handlers/shop'
import { handleAuth } from './handlers/auth'
import { handleAppointments } from './handlers/appointments'
import { handlePages } from './handlers/pages'
import { handlePlanner } from './handlers/planner'

export interface LocalRequest {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  path: string // 例如 '/api/v1/mobile/services?parent_id=enterprise'
  query: Record<string, string>
  body: any
  headers: Record<string, string>
}

export type LocalResponse = {
  error: boolean
  message: string
  data: any
}

/**
 * 判断是否处于本地模式
 * 通过 localStorage.jx_apk_local_db 开关控制
 * 也支持 ?local=1 query param 临时开启
 */
export function isLocalMode(): boolean {
  if (typeof window === 'undefined') return false

  // 1. 优先看 localStorage 开关
  const flag = window.localStorage.getItem('jx_apk_local_db')
  if (flag === '1') return true
  if (flag === '0') return false

  // 2. 兜底: 看 URL query 参数 (?local=1)
  try {
    const url = new URL(window.location.href)
    if (url.searchParams.get('local') === '1') return true
  } catch {
    // ignore
  }

  return false
}

export async function routeLocalApi(req: LocalRequest): Promise<LocalResponse> {
  const path = req.path.split('?')[0]
  // 归一化(去掉 /api/v1 前缀)
  const route = path.replace(/^\/api\/v1\//, '')

  try {
    if (route.startsWith('mobile/services')) return await handleServices(req, route)
    if (route === 'mobile/planner') return await handlePlanner(req, route)
    if (route === 'fortune') return await handleFortune(req)
    if (route.startsWith('knowledge')) return await handleKnowledge(req, route)
    if (route.startsWith('shop')) return await handleShop(req, route)
    if (route.startsWith('auth')) return await handleAuth(req, route)
    if (route.startsWith('mobile/appointments')) return await handleAppointments(req, route)
    if (route.startsWith('pages/content')) return await handlePages(req, route)
    return { error: true, message: `No local handler for /api/v1/${route}`, data: null }
  } catch (e: any) {
    console.error('[LocalAPI] handler error:', req.path, e)
    return { error: true, message: e?.message || String(e), data: null }
  }
}
