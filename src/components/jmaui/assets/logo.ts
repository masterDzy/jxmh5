/**
 * logo — 项目 Logo / 品牌资源索引
 *
 * 源文件位置: `assets/logo/`
 * 当前图标: `logoapp.svg`(篆刻印章风格,品牌色 #D94E3D)
 *
 * 用法:
 *   import { LOGO_MAIN, LOGOS } from '@/components/jmaui/assets/logo'
 *   <img src={LOGO_MAIN} />
 */

import logoApp from '@/assets/logo/logoapp.svg'
import logo2 from '@/assets/logo/logo2.svg'
import logo3 from '@/assets/logo/logo3.png'

/** 主 Logo(SVG 矢量,推荐) */
export const LOGO_MAIN = logoApp.src

/** 备用 Logo 2(SVG) */
export const LOGO_ALT = logo2.src

/** 备用 Logo 3(PNG) */
export const LOGO_ALT_PNG = logo3.src

/** Logo 全清单 */
export const LOGOS = {
  main: logoApp.src,
  alt: logo2.src,
  altPng: logo3.src,
} as const
