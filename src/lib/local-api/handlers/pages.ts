/**
 * 页面内容 handler
 * GET /api/v1/pages/content/{slug}
 *
 * 注意: pages / page_versions / published_pages 表在 jx_m_apk 库是空的 (0 行),
 * 移动端会拿到 404. 调试模式下 front-end 会显示"页面未找到"
 */

import { getLocalDB } from '../../local-db'
import type { LocalRequest, LocalResponse } from '../router'

function ok(data: any): LocalResponse {
  return { error: false, message: 'ok', data }
}

export async function handlePages(req: LocalRequest, route: string): Promise<LocalResponse> {
  if (req.method !== 'GET') {
    return { error: true, message: '只支持 GET', data: null }
  }

  const match = route.match(/^pages\/content\/(.+)$/)
  if (!match) return { error: true, message: 'Unknown pages route', data: null }
  const slug = match[1]

  const db = await getLocalDB()
  // published_pages 在生产是空表;如果有数据就读,没有就返回 null
  const r = await db.query(
    `SELECT * FROM published_pages WHERE route = $1 AND status = 'published' LIMIT 1`,
    [slug]
  )
  if (r.rows.length === 0) {
    return { error: true, message: '页面未找到', data: null }
  }
  return ok({ page: r.rows[0], content: { modules: [], global: {} } })
}
