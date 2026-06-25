import JmPageClient from './_components/JmPageClient'

/**
 * /p/[slug] 服务端 wrapper
 *
 * Next.js 16 + output: 'export' 模式下,worker 检查 `prerenderedRoutes.length > 0`
 * 来判断 generateStaticParams 是否"存在"。返回空数组会被当作"缺失"。
 * 必须至少返回一个 slug 才能让构建通过,这里用一个不可达的占位 slug,
 * 真正内容由 JmPageClient 运行时从 API 加载。
 */
export function generateStaticParams() {
  return [{ slug: '__placeholder__' }]
}

export default function PageRoute() {
  return <JmPageClient />
}
