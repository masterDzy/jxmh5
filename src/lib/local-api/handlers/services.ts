/**
 * 服务模块 handler
 * 仅保留 booking 详情单条接口；列表/分类展示已迁 newproduct + JmCateMindMap
 */

import { getLocalDB } from '../../local-db'
import type { LocalRequest, LocalResponse } from '../router'

function ok(data: any, message = 'ok'): LocalResponse {
  return { error: false, message, data }
}

export async function handleServices(_req: LocalRequest, route: string): Promise<LocalResponse> {
  const db = await getLocalDB()

  // GET /api/v1/mobile/services/{id}
  const detailMatch = route.match(/^mobile\/services\/(.+)$/)
  if (detailMatch) {
    const id = detailMatch[1]
    const r = await db.query('SELECT * FROM jx_apk_m_services WHERE id = $1', [id])
    if (r.rows.length === 0) return { error: true, message: '服务不存在', data: null }
    return ok(r.rows[0])
  }

  return { error: true, message: `Unknown services route: ${route}`, data: null }
}
