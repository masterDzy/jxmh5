/**
 * 知识模块 handler
 * GET /api/v1/knowledge/categories
 * GET /api/v1/knowledge/articles?category=...
 * GET /api/v1/knowledge/articles/{id}
 */

import { getLocalDB } from '../../local-db'
import type { LocalRequest, LocalResponse } from '../router'

function ok(data: any): LocalResponse {
  return { error: false, message: 'ok', data }
}

export async function handleKnowledge(req: LocalRequest, route: string): Promise<LocalResponse> {
  const db = await getLocalDB()

  if (route === 'knowledge/categories') {
    const r = await db.query(`
      SELECT id, name, slug, icon, sort_order
      FROM jx_apk_knowledge_categories
      WHERE status = 1
      ORDER BY sort_order ASC
    `)
    return ok({ items: r.rows })
  }

  if (route === 'knowledge/articles') {
    const { category, page = '1', page_size = '20' } = req.query
    const offset = (Number(page) - 1) * Number(page_size)
    const r = await db.query(
      `
      SELECT a.id, a.article_uuid, a.title, a.summary, a.cover_image,
             a.category_id, a.is_video, a.video_url, a.view_count,
             a.share_count, a.favorite_count, a.published_at,
             c.name as category_name
      FROM jx_apk_knowledge_articles a
      LEFT JOIN jx_apk_knowledge_categories c ON c.id = a.category_id
      WHERE a.status = 1
        AND ($1::text IS NULL OR a.category_id = $1)
      ORDER BY a.is_featured DESC, a.sort_order ASC
      LIMIT $2 OFFSET $3
    `,
      [category && category !== 'all' ? category : null, Number(page_size), offset]
    )
    const totalR = await db.query(
      `
      SELECT count(*)::int as total FROM jx_apk_knowledge_articles
      WHERE status = 1 AND ($1::text IS NULL OR category_id = $1)
    `,
      [category && category !== 'all' ? category : null]
    )
    const total: number = (totalR.rows[0] as any).total
    return ok({
      items: r.rows,
      total,
      page: Number(page),
      page_size: Number(page_size),
      total_pages: Math.ceil(total / Number(page_size)),
    })
  }

  const detailMatch = route.match(/^knowledge\/articles\/(.+)$/)
  if (detailMatch) {
    const idOrUuid = detailMatch[1]
    const r = await db.query(
      `
      SELECT a.*, c.name as category_name
      FROM jx_apk_knowledge_articles a
      LEFT JOIN jx_apk_knowledge_categories c ON c.id = a.category_id
      WHERE a.id::text = $1 OR a.article_uuid = $1
      LIMIT 1
    `,
      [idOrUuid]
    )
    if (r.rows.length === 0) return { error: true, message: '文章不存在', data: null }
    return ok(r.rows[0])
  }

  return { error: true, message: `Unknown knowledge route: ${route}`, data: null }
}
