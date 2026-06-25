/**
 * backgrounds — 背景图索引
 *
 * 源文件位置: `assets/backgrounds/*.jpg`
 * 20 张,按场景分类:
 *   山系  foggy-mountains / misty-forest / forest-path / forest-waterfall / bamboo-forest / mountain-lake
 *   海系  beach-* / coastal-* / island-* / ocean-* / paradise / tropical / starry-lake / sunset-beach
 *   园林  chinese-garden / chinese-pagoda / chinese-pavilion / chinese-temple
 *   天空  aurora-sky
 *
 * 用法:
 *   import { backgrounds, BACKGROUNDS_BY_CATEGORY } from '@/components/jmaui/assets/backgrounds'
 *   <img src={backgrounds.auroraSky} />
 *   BACKGROUNDS_BY_CATEGORY.mountain.map(b => <img key={b.key} src={b.src} />)
 */

import auroraSky from '@/assets/backgrounds/aurora-sky.jpg'
import bambooForest from '@/assets/backgrounds/bamboo-forest.jpg'
import beachMountains from '@/assets/backgrounds/beach-mountains.jpg'
import chineseGarden from '@/assets/backgrounds/chinese-garden.jpg'
import chinesePagoda from '@/assets/backgrounds/chinese-pagoda.jpg'
import chinesePavilion from '@/assets/backgrounds/chinese-pavilion.jpg'
import chineseTemple from '@/assets/backgrounds/chinese-temple.jpg'
import coastalSunset from '@/assets/backgrounds/coastal-sunset.jpg'
import foggyMountains from '@/assets/backgrounds/foggy-mountains.jpg'
import forestPath from '@/assets/backgrounds/forest-path.jpg'
import forestWaterfall from '@/assets/backgrounds/forest-waterfall.jpg'
import islandSunset from '@/assets/backgrounds/island-sunset.jpg'
import mistyForest from '@/assets/backgrounds/misty-forest.jpg'
import mountainLake from '@/assets/backgrounds/mountain-lake.jpg'
import oceanCliff from '@/assets/backgrounds/ocean-cliff.jpg'
import oceanMountains from '@/assets/backgrounds/ocean-mountains.jpg'
import paradiseBeach from '@/assets/backgrounds/paradise-beach.jpg'
import starryLake from '@/assets/backgrounds/starry-lake.jpg'
import sunsetBeach from '@/assets/backgrounds/sunset-beach.jpg'
import tropicalBeach from '@/assets/backgrounds/tropical-beach.jpg'

export type BackgroundKey =
  | 'auroraSky' | 'bambooForest' | 'beachMountains'
  | 'chineseGarden' | 'chinesePagoda' | 'chinesePavilion' | 'chineseTemple'
  | 'coastalSunset' | 'foggyMountains' | 'forestPath' | 'forestWaterfall'
  | 'islandSunset' | 'mistyForest' | 'mountainLake'
  | 'oceanCliff' | 'oceanMountains' | 'paradiseBeach'
  | 'starryLake' | 'sunsetBeach' | 'tropicalBeach'

export const BACKGROUND_CN: Record<BackgroundKey, string> = {
  auroraSky: '极光星空',
  bambooForest: '竹林',
  beachMountains: '海滩远山',
  chineseGarden: '中式园林',
  chinesePagoda: '中式宝塔',
  chinesePavilion: '中式凉亭',
  chineseTemple: '中式庙宇',
  coastalSunset: '海岸日落',
  foggyMountains: '云雾山峦',
  forestPath: '森林小径',
  forestWaterfall: '森林瀑布',
  islandSunset: '海岛日落',
  mistyForest: '迷雾森林',
  mountainLake: '山间湖泊',
  oceanCliff: '海洋悬崖',
  oceanMountains: '海洋远山',
  paradiseBeach: '天堂海滩',
  starryLake: '星空湖面',
  sunsetBeach: '日落海滩',
  tropicalBeach: '热带海滩',
}

/** 全量 key → url 字符串(URL 形式,可直接给 <img src>) */
export const backgrounds: Record<BackgroundKey, string> = {
  auroraSky: auroraSky.src,
  bambooForest: bambooForest.src,
  beachMountains: beachMountains.src,
  chineseGarden: chineseGarden.src,
  chinesePagoda: chinesePagoda.src,
  chinesePavilion: chinesePavilion.src,
  chineseTemple: chineseTemple.src,
  coastalSunset: coastalSunset.src,
  foggyMountains: foggyMountains.src,
  forestPath: forestPath.src,
  forestWaterfall: forestWaterfall.src,
  islandSunset: islandSunset.src,
  mistyForest: mistyForest.src,
  mountainLake: mountainLake.src,
  oceanCliff: oceanCliff.src,
  oceanMountains: oceanMountains.src,
  paradiseBeach: paradiseBeach.src,
  starryLake: starryLake.src,
  sunsetBeach: sunsetBeach.src,
  tropicalBeach: tropicalBeach.src,
}

/** 分类场景索引(便于按主题选择) */
export const BACKGROUNDS_BY_CATEGORY = {
  /** 山系 — 运势/命理类页面 */
  mountain: [
    { key: 'foggyMountains' as const,  cn: '云雾山峦',   src: foggyMountains.src },
    { key: 'mistyForest' as const,     cn: '迷雾森林',   src: mistyForest.src },
    { key: 'forestPath' as const,      cn: '森林小径',   src: forestPath.src },
    { key: 'forestWaterfall' as const, cn: '森林瀑布',   src: forestWaterfall.src },
    { key: 'bambooForest' as const,    cn: '竹林',       src: bambooForest.src },
    { key: 'mountainLake' as const,    cn: '山间湖泊',   src: mountainLake.src },
  ],
  /** 海系 — 心境/开阔类页面 */
  sea: [
    { key: 'paradiseBeach' as const,   cn: '天堂海滩',   src: paradiseBeach.src },
    { key: 'tropicalBeach' as const,   cn: '热带海滩',   src: tropicalBeach.src },
    { key: 'sunsetBeach' as const,     cn: '日落海滩',   src: sunsetBeach.src },
    { key: 'coastalSunset' as const,   cn: '海岸日落',   src: coastalSunset.src },
    { key: 'islandSunset' as const,    cn: '海岛日落',   src: islandSunset.src },
    { key: 'oceanCliff' as const,      cn: '海洋悬崖',   src: oceanCliff.src },
    { key: 'oceanMountains' as const,  cn: '海洋远山',   src: oceanMountains.src },
    { key: 'beachMountains' as const,  cn: '海滩远山',   src: beachMountains.src },
    { key: 'starryLake' as const,      cn: '星空湖面',   src: starryLake.src },
  ],
  /** 中式园林 — 知识/文化类页面 */
  chinese: [
    { key: 'chineseGarden' as const,   cn: '中式园林',   src: chineseGarden.src },
    { key: 'chinesePagoda' as const,   cn: '中式宝塔',   src: chinesePagoda.src },
    { key: 'chinesePavilion' as const, cn: '中式凉亭',   src: chinesePavilion.src },
    { key: 'chineseTemple' as const,   cn: '中式庙宇',   src: chineseTemple.src },
  ],
  /** 天空 — 个人主页/首页 */
  sky: [
    { key: 'auroraSky' as const,       cn: '极光星空',   src: auroraSky.src },
  ],
} as const
