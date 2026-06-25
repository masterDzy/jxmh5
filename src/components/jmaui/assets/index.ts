/**
 * jmaui/assets — 静态资源统一入口
 *
 * 通过软链接 `frontend/src/assets → ../../assets`,可以直接用 `@/assets/...` 引用项目根
 * 的 `assets/` 资源。本目录是给 jmaui 组件提供的"按主题分类的资源索引"层。
 *
 * 资源类别:
 *   - shuxiang    12 生肖(48 个,svg/png/webp/jpg)
 *   - logo        品牌 Logo(3 个)
 *   - backgrounds 背景图(20 张 jpg,按山/海/中式/天空分类)
 *   - svg         矢量素材(20 个 svg,分 animated/icon_page/static)
 *
 * 用法:
 *   import { shuxiangSvg, ZODIACS, LOGO_MAIN, backgrounds } from '@/components/jmaui/assets'
 *   import { svgStatic } from '@/components/jmaui/assets'
 *
 * 单文件直接用:
 *   import ratSvg from '@/assets/shuxiang/v2_rat.svg'  ← 跳过索引,直接拿源
 */

export * from './shuxiang'
export * from './logo'
export * from './backgrounds'
export * from './svg'
