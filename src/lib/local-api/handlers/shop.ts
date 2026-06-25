/**
 * 商城模块 handler
 * GET    /api/v1/shop/categories
 * GET    /api/v1/shop/products
 * GET    /api/v1/shop/cart
 * POST   /api/v1/shop/cart
 * DELETE /api/v1/shop/cart/{id}
 * DELETE /api/v1/shop/cart (清空)
 */

import { getLocalDB } from '../../local-db'
import type { LocalRequest, LocalResponse } from '../router'

function ok(data: any, message = 'ok'): LocalResponse {
  return { error: false, message, data }
}

export async function handleShop(req: LocalRequest, route: string): Promise<LocalResponse> {
  const db = await getLocalDB()

  // GET /api/v1/shop/categories
  if (req.method === 'GET' && route === 'shop/categories') {
    const r = await db.query(`
      SELECT id, name, cover_image, description, sort_order
      FROM jx_apk_shop_categories
      WHERE is_active = true
      ORDER BY sort_order ASC
    `)
    return ok({ items: r.rows })
  }

  // GET /api/v1/shop/products
  if (req.method === 'GET' && route === 'shop/products') {
    const { category, is_hot, is_recommend, page = '1', page_size = '20' } = req.query
    const offset = (Number(page) - 1) * Number(page_size)
    const r = await db.query(
      `
      SELECT * FROM jx_apk_shop_products
      WHERE is_active = true
        AND ($1::text IS NULL OR category_id = $1)
        AND ($2::boolean IS FALSE OR is_hot = true)
        AND ($3::boolean IS FALSE OR is_recommend = true)
      ORDER BY sort_order ASC
      LIMIT $4 OFFSET $5
    `,
      [category || null, is_hot === 'true', is_recommend === 'true', Number(page_size), offset]
    )
    const totalR = await db.query(
      `
      SELECT count(*)::int as total FROM jx_apk_shop_products
      WHERE is_active = true
        AND ($1::text IS NULL OR category_id = $1)
    `,
      [category || null]
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

  // GET /api/v1/shop/cart
  if (req.method === 'GET' && route === 'shop/cart') {
    const user_id = req.query.user_id || 'guest'
    const r = await db.query(
      `
      SELECT c.id, c.user_id, c.product_id, c.quantity, c.created_at,
             p.name, p.cover_image, p.price, p.original_price
      FROM jx_apk_shop_cart_items c
      LEFT JOIN jx_apk_shop_products p ON p.id = c.product_id
      WHERE c.user_id = $1
      ORDER BY c.created_at DESC
    `,
      [user_id]
    )
    return ok({ items: r.rows })
  }

  // POST /api/v1/shop/cart (加购物车)
  if (req.method === 'POST' && route === 'shop/cart') {
    const user_id = req.query.user_id || req.body?.user_id || 'guest'
    const product_id = req.query.product_id || req.body?.product_id
    const quantity = Number(req.query.quantity || req.body?.quantity || 1)
    if (!product_id) return { error: true, message: '缺少 product_id', data: null }

    // 检查是否已存在
    const existing = await db.query(
      'SELECT * FROM jx_apk_shop_cart_items WHERE user_id = $1 AND product_id = $2',
      [user_id, product_id]
    )
    if (existing.rows.length > 0) {
      // 累加数量
      const r = await db.query(
        'UPDATE jx_apk_shop_cart_items SET quantity = quantity + $1 WHERE id = $2 RETURNING *',
        [quantity, (existing.rows[0] as any).id]
      )
      return ok(r.rows[0], '已加入购物车')
    } else {
      // 新增
      const r = await db.query(
        `INSERT INTO jx_apk_shop_cart_items (id, user_id, product_id, quantity, created_at)
         VALUES (gen_random_uuid(), $1, $2, $3, now()) RETURNING *`,
        [user_id, product_id, quantity]
      )
      return ok(r.rows[0], '已加入购物车')
    }
  }

  // DELETE /api/v1/shop/cart (清空)
  if (req.method === 'DELETE' && route === 'shop/cart') {
    const user_id = req.query.user_id || 'guest'
    await db.query('DELETE FROM jx_apk_shop_cart_items WHERE user_id = $1', [user_id])
    return ok(null, '已清空购物车')
  }

  // DELETE /api/v1/shop/cart/{id}
  const itemMatch = route.match(/^shop\/cart\/(.+)$/)
  if (req.method === 'DELETE' && itemMatch) {
    const id = itemMatch[1]
    const user_id = req.query.user_id || 'guest'
    await db.query(
      'DELETE FROM jx_apk_shop_cart_items WHERE id = $1 AND user_id = $2',
      [id, user_id]
    )
    return ok(null, '已删除')
  }

  return { error: true, message: `Unknown shop route: ${req.method} ${route}`, data: null }
}
