'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { get } from '@/lib/http';
import {
  PageModule,
  PageContent,
  LayoutType,
  GlobalConfig,
} from '@/components/types';
// jmaui 组件
import {
  JmBgGraphics,
  JmButton,
  JmLunarDate,
  JmTextBlock,
  JmHeroBanner,
  JmHeader,
  JmFooter,
} from '@/components/jmaui';

interface PageApiResponse {
  error: boolean;
  message: string;
  data: {
    page: {
      id: string;
      slug: string;
      layout: LayoutType;
    };
    content: PageContent;
  } | null;
}

async function getPage(slug: string): Promise<PageApiResponse | null> {
  try {
    const json = await get<PageApiResponse['data']>(`/api/v1/pages/content/${slug}`);
    if (json.error || !json.data) return null;
    return { error: false, message: 'ok', data: json.data };
  } catch {
    return null;
  }
}

/**
 * 按模块 type 渲染 jmaui 组件。
 * 仅支持 jm 前缀的模块类型(从 API 拿到的 PageModule)。
 */
function renderModule(module: PageModule, index: number): React.ReactNode {
  const { type, props } = module;
  const key = `${type}-${index}`;

  switch (type) {
    case 'bgGraphics':
      return <JmBgGraphics key={key} {...(props as any)} />;
    case 'jmButton':
      return <JmButton key={key} {...(props as any)} />;
    case 'jmLunarDate':
      return <JmLunarDate key={key} {...(props as any)} />;
    case 'jmTextBlock':
      return <JmTextBlock key={key} {...(props as any)} />;
    case 'jmHeroBanner':
      return <JmHeroBanner key={key} {...(props as any)} />;
    case 'jmHeader':
      return <JmHeader key={key} {...(props as any)} />;
    case 'jmFooter':
      return <JmFooter key={key} {...(props as any)} />;
    default:
      // 未知 / 旧版模块类型 → 静默忽略,避免阻塞其他模块
      console.warn(`[JmPageClient] 跳过不支持的模块类型: ${type}`);
      return null;
  }
}

export default function JmPageClient() {
  const params = useParams();
  const slug = params.slug as string;
  const [pageData, setPageData] = useState<PageApiResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPage() {
      setLoading(true);
      const data = await getPage(slug);
      setPageData(data);
      setLoading(false);
    }
    if (slug) {
      fetchPage();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-stone-500">加载中...</p>
        </div>
      </div>
    );
  }

  if (!pageData || pageData.error || !pageData.data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 text-stone-800">页面未找到</h1>
          <p className="text-stone-500">抱歉，您访问的页面不存在</p>
        </div>
      </div>
    );
  }

  const { content } = pageData.data;
  const { modules = [] } = content;
  const sortedModules = [...modules].sort((a, b) => a.position - b.position);

  // 当前仅支持 full 布局(按 position 顺序渲染所有模块)
  return (
    <div className="min-h-screen">
      {sortedModules.map((module, i) => renderModule(module, i))}
    </div>
  );
}
