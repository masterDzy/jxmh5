/**
 * svg — 矢量素材索引(分 3 个子集)
 *
 * 源文件位置: `assets/svg/`
 *   animated/  — 动效原型(部分文件为 .html 调试页,这里只导 svg)
 *     logoaction.svg / shou.svg / srlogo.svg
 *   icon_page/ — 页面图标 + 分区图标
 *     jy.svg / kxyd.svg / zdgl.svg  ← 页面级
 *     btnarea/   wmdfw.svg / yuyue.svg         ← 按钮区
 *     topares/   geren.svg / kxyd-badge.svg / qiye.svg / qtfw.svg  ← 顶部区
 *   static/    — 静态装饰
 *     dots / geometric / hand / lianh1-3 / waves
 *
 * 用法:
 *   import { svgAnimated, svgStatic, SVG_ICONS } from '@/components/jmaui/assets/svg'
 *   <img src={svgStatic.waves} />
 *   <Icon name="yuyue" />
 */

import logoaction from '@/assets/svg/animated/logoaction.svg'
import shou from '@/assets/svg/animated/shou.svg'
import srlogo from '@/assets/svg/animated/srlogo.svg'

// === icon_page 页面级 ===
// 注:`古书.svg` 在 commit 1 中清理(原文件名被 sed 批处理误伤为
// `"assets/svg/icon_page/古书.svg` 乱路径),这里不再 import
import jy from '@/assets/svg/icon_page/jy.svg'
import kxyd from '@/assets/svg/icon_page/kxyd.svg'
import zdgl from '@/assets/svg/icon_page/zdgl.svg'
import shoppingBag from '@/assets/svg/icon_page/shopping-bag.svg'

// === icon_page/btnarea 按钮区 ===
import wmdfw from '@/assets/svg/icon_page/btnarea/wmdfw.svg'
import yuyue from '@/assets/svg/icon_page/btnarea/yuyue.svg'

// === icon_page/toparea 顶部区 ===
import geren from '@/assets/svg/icon_page/toparea/geren.svg'
import kxydBadge from '@/assets/svg/icon_page/toparea/kxyd-badge.svg'
import qiye from '@/assets/svg/icon_page/toparea/qiye.svg'
import qtfw from '@/assets/svg/icon_page/toparea/qtfw.svg'

// === static 静态装饰 ===
import dots from '@/assets/svg/static/dots.svg'
import geometric from '@/assets/svg/static/geometric.svg'
import hand from '@/assets/svg/static/hand.svg'
import lianh1 from '@/assets/svg/static/lianh1.svg'
import lianh2 from '@/assets/svg/static/lianh2.svg'
import lianh3 from '@/assets/svg/static/lianh3.svg'
import waves from '@/assets/svg/static/waves.svg'

/** 动效原型(配套 .html 通常是交互演示,仅导 svg 供实际使用) */
export const svgAnimated = {
  logoaction: logoaction.src,
  shou: shou.src,
  srlogo: srlogo.src,
} as const

/** 页面级图标 */
export const svgIconPage = {
  jy: jy.src,          // 吉祥(? — 简写)
  kxyd: kxyd.src,      // 开运预约
  zdgl: zdgl.src,      // 指导攻略
  shoppingBag: shoppingBag.src,  // 购物袋(幸运商城徽章)
} as const

/** 按钮区图标 */
export const svgBtnArea = {
  wmdfw: wmdfw.src,    // 我们的服务
  yuyue: yuyue.src,    // 预约
} as const

/** 顶部区图标 */
export const svgTopArea = {
  geren: geren.src,            // 个人
  kxydBadge: kxydBadge.src,    // 开运预约徽章
  qiye: qiye.src,              // 企业
  qtfw: qtfw.src,              // 其他服务
} as const

/** 静态装饰 */
export const svgStatic = {
  dots: dots.src,
  geometric: geometric.src,
  hand: hand.src,
  lianh1: lianh1.src,
  lianh2: lianh2.src,
  lianh3: lianh3.src,
  waves: waves.src,
} as const

/** 全部 SVG 扁平化索引(便于运行时按名取) */
export const SVG_ICONS: Record<string, string> = {
  // animated
  'animated.logoaction': logoaction.src,
  'animated.shou': shou.src,
  'animated.srlogo': srlogo.src,
  // icon_page
  'icon_page.jy': jy.src,
  'icon_page.kxyd': kxyd.src,
  'icon_page.zdgl': zdgl.src,
  'icon_page.shopping-bag': shoppingBag.src,
  'icon_page.btnarea.wmdfw': wmdfw.src,
  'icon_page.btnarea.yuyue': yuyue.src,
  'icon_page.toparea.geren': geren.src,
  'icon_page.toparea.kxyd-badge': kxydBadge.src,
  'icon_page.toparea.qiye': qiye.src,
  'icon_page.toparea.qtfw': qtfw.src,
  // static
  'static.dots': dots.src,
  'static.geometric': geometric.src,
  'static.hand': hand.src,
  'static.lianh1': lianh1.src,
  'static.lianh2': lianh2.src,
  'static.lianh3': lianh3.src,
  'static.waves': waves.src,
} as const

/** 按子集取图标的辅助函数 */
export function getSvgIcon(path: keyof typeof SVG_ICONS): string {
  return SVG_ICONS[path]
}
