/**
 * 策划师模块 handler
 * GET /api/v1/mobile/planner
 */

import { getLocalDB } from '../../local-db'
import type { LocalRequest, LocalResponse } from '../router'

function ok(data: any, message = 'ok'): LocalResponse {
  return { error: false, message, data }
}

export async function handlePlanner(_req: LocalRequest, _route: string): Promise<LocalResponse> {
  const db = await getLocalDB()

  const r = await db.query(
    'SELECT id, name, specialty, description, single_price, full_price, avatar_url, sort_order FROM planner WHERE status = 1 ORDER BY sort_order ASC, id ASC'
  )

  const planners = r.rows.map((row: any) => ({
    id: row.id,
    name: row.name,
    specialty: row.specialty,
    description: row.description,
    single_price: parseFloat(row.single_price) || 0,
    full_price: parseFloat(row.full_price) || 0,
    avatar_url: row.avatar_url,
    sort_order: row.sort_order,
  }))

  return ok({ planners, total: planners.length })
}
