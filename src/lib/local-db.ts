/**
 * 本地 PGlite 数据库封装
 *
 * 用途: 调试模式下,把 PostgreSQL 数据快照存到手机 IndexedDB,
 *      离线运行所有移动端 API。
 *
 * 生命周期:
 *  - 首次调用 getLocalDB(): 加载 /db/seed.sql 灌入
 *  - 后续调用: 从 IndexedDB 恢复(写操作持久化)
 *
 * 重置: resetLocalDB() 删除 IndexedDB,下次调用重新灌种子
 */

import { PGlite } from '@electric-sql/pglite'
import { pgcrypto } from '@electric-sql/pglite/contrib/pgcrypto'

let dbPromise: Promise<PGlite> | null = null

export async function getLocalDB(): Promise<PGlite> {
  if (dbPromise) return dbPromise

  dbPromise = (async () => {
    const db = new PGlite('idb://jx_apk_db', { extensions: { pgcrypto } })

    // 检查是否已初始化
    const r = await db.query<{ exists: boolean }>(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'jx_apk_users'
      ) as exists
    `)

    if (!r.rows[0].exists) {
      console.log('[LocalDB] 首次启动,加载种子数据...')
      const res = await fetch('/db/seed.sql')
      if (!res.ok) throw new Error(`Failed to load seed.sql: ${res.status}`)
      let seed = await res.text()

      // PGlite 不支持 SQL 里的 CREATE EXTENSION(扩展要通过 extensions 参数传)
      // 我们的 pgcrypto 已在构造时传了,这里把 SQL 里的 CREATE EXTENSION 行去掉
      seed = seed.replace(/CREATE EXTENSION IF NOT EXISTS pgcrypto;?/gi, '')

      await db.exec(seed)
      console.log('[LocalDB] 种子数据已加载,', seed.length, '字节')
    } else {
      console.log('[LocalDB] 从 IndexedDB 恢复')
    }

    // 调试用: 暴露到 window
    if (typeof window !== 'undefined') {
      ;(window as any).__localDb = db
    }

    return db
  })()

  return dbPromise
}

/**
 * 重置本地数据库 (删除 IndexedDB + 关闭连接)
 * 下次 getLocalDB() 调用时会重新灌种子
 */
export async function resetLocalDB(): Promise<void> {
  if (dbPromise) {
    const db = await dbPromise
    try {
      await db.close()
    } catch {
      // 忽略
    }
    dbPromise = null
  }

  if (typeof indexedDB === 'undefined') return

  // 删除 PGlite 创建的所有 IndexedDB
  if (indexedDB.databases) {
    const dbs = await indexedDB.databases()
    await Promise.all(
      dbs
        .filter((d) => d.name && (d.name.startsWith('pglite') || d.name.includes('jx_apk')))
        .map(
          (d) =>
            new Promise<void>((resolve) => {
              const req = indexedDB.deleteDatabase(d.name!)
              req.onsuccess = req.onerror = req.onblocked = () => resolve()
            })
        )
    )
  } else {
    // 兜底:直接删 jx_apk_db
    await new Promise<void>((resolve) => {
      const req = indexedDB.deleteDatabase('jx_apk_db')
      req.onsuccess = req.onerror = req.onblocked = () => resolve()
    })
  }

  console.log('[LocalDB] 已重置')
}
