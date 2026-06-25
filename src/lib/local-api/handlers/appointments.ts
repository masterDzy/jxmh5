/**
 * 预约模块 handler
 * POST /api/v1/mobile/appointments
 * GET  /api/v1/mobile/appointments/by-phone
 */

import { getLocalDB } from '../../local-db'
import type { LocalRequest, LocalResponse } from '../router'

function ok(data: any, message = 'ok'): LocalResponse {
  return { error: false, message, data }
}

export async function handleAppointments(req: LocalRequest, route: string): Promise<LocalResponse> {
  const db = await getLocalDB()

  // POST /api/v1/mobile/appointments
  if (req.method === 'POST' && route === 'mobile/appointments') {
    const {
      service_id,
      service_name,
      service_category,
      user_id,
      name,
      phone,
      appointment_date,
      appointment_time,
      note,
    } = req.body || {}

    if (!service_id || !name || !phone || !appointment_date || !appointment_time) {
      return { error: true, message: '缺少必要字段', data: null }
    }

    const r = await db.query(
      `
      INSERT INTO jx_apk_appointments (
        id, service_id, service_name, service_category, user_id,
        name, phone, appointment_date, appointment_time, status, note,
        created_at, updated_at
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4,
        $5, $6, $7, $8, 'pending', $9,
        now(), now()
      )
      RETURNING *
    `,
      [
        service_id,
        service_name || '',
        service_category || null,
        user_id || null,
        name,
        phone,
        appointment_date,
        appointment_time,
        note || null,
      ]
    )
    return ok(r.rows[0], '预约提交成功')
  }

  // GET /api/v1/mobile/appointments/by-phone?phone=...
  if (req.method === 'GET' && route === 'mobile/appointments/by-phone') {
    const phone = req.query.phone
    if (!phone) return { error: true, message: '缺少 phone', data: null }
    const limit = Number(req.query.limit || 20)
    const r = await db.query(
      `SELECT * FROM jx_apk_appointments WHERE phone = $1 ORDER BY created_at DESC LIMIT $2`,
      [phone, limit]
    )
    return ok({ items: r.rows })
  }

  return { error: true, message: `Unknown appointments route: ${req.method} ${route}`, data: null }
}
