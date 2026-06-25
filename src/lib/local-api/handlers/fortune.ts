/**
 * 运势模块 handler
 * GET /api/v1/fortune
 */

import { getLocalDB } from '../../local-db'
import type { LocalRequest, LocalResponse } from '../router'

function ok(data: any): LocalResponse {
  return { error: false, message: 'ok', data }
}

export async function handleFortune(req: LocalRequest): Promise<LocalResponse> {
  const db = await getLocalDB()
  const { zodiac_id, period_type, period_start } = req.query

  if (!zodiac_id || !period_type || !period_start) {
    return { error: true, message: '缺少必要参数', data: null }
  }

  const r = await db.query(
    `
    SELECT * FROM jx_apk_fortune_readings
    WHERE zodiac_id = $1
      AND period_type = $2
      AND period_start = $3
    LIMIT 1
  `,
    [Number(zodiac_id), period_type, period_start]
  )

  if (r.rows.length === 0) {
    return { error: true, message: '该时间段运势不存在', data: null }
  }
  return ok(r.rows[0])
}
