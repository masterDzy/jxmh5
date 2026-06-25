/**
 * shuxiang — 12 生肖图标索引
 *
 * 源文件位置: `assets/shuxiang/v2_{name}.{svg|png|webp|jpg}`(项目根 assets 软链到 src/assets)
 *
 * 命名对照(地支顺序):
 *   rat    鼠  │ ox      牛  │ tiger   虎  │ rabbit  兔
 *   dragon 龙  │ snake   蛇  │ horse   马  │ goat    羊
 *   monkey 猴  │ chicken 鸡  │ dog     狗  │ pig     猪
 *
 * 格式选择建议:
 *   svg  → H5 矢量展示,可继承 currentColor 改色
 *   webp → H5 移动端,体积最小,推荐
 *   png  → 通用位图(透明背景)
 *   jpg  → 备用
 *
 * 用法:
 *   import { shuxiangSvg, shuxiangWebp, ZODIACS } from '@/components/jmaui/assets/shuxiang'
 *   <img src={shuxiangWebp.rat} />
 *   ZODIACS.map(z => <img key={z.key} src={z.src} title={z.cn} />)
 */

// === SVG 矢量(推荐 H5 展示,可改色) ===
import ratSvg from '@/assets/shuxiang/v2_rat.svg'
import oxSvg from '@/assets/shuxiang/v2_ox.svg'
import tigerSvg from '@/assets/shuxiang/v2_tiger.svg'
import rabbitSvg from '@/assets/shuxiang/v2_rabbit.svg'
import dragonSvg from '@/assets/shuxiang/v2_dragon.svg'
import snakeSvg from '@/assets/shuxiang/v2_snake.svg'
import horseSvg from '@/assets/shuxiang/v2_horse.svg'
import goatSvg from '@/assets/shuxiang/v2_goat.svg'
import monkeySvg from '@/assets/shuxiang/v2_monkey.svg'
import chickenSvg from '@/assets/shuxiang/v2_chicken.svg'
import dogSvg from '@/assets/shuxiang/v2_dog.svg'
import pigSvg from '@/assets/shuxiang/v2_pig.svg'

// === WebP(推荐 H5 移动端,体积最小) ===
import ratWebp from '@/assets/shuxiang/v2_rat.webp'
import oxWebp from '@/assets/shuxiang/v2_ox.webp'
import tigerWebp from '@/assets/shuxiang/v2_tiger.webp'
import rabbitWebp from '@/assets/shuxiang/v2_rabbit.webp'
import dragonWebp from '@/assets/shuxiang/v2_dragon.webp'
import snakeWebp from '@/assets/shuxiang/v2_snake.webp'
import horseWebp from '@/assets/shuxiang/v2_horse.webp'
import goatWebp from '@/assets/shuxiang/v2_goat.webp'
import monkeyWebp from '@/assets/shuxiang/v2_monkey.webp'
import chickenWebp from '@/assets/shuxiang/v2_chicken.webp'
import dogWebp from '@/assets/shuxiang/v2_dog.webp'
import pigWebp from '@/assets/shuxiang/v2_pig.webp'

// === PNG(透明背景) ===
import ratPng from '@/assets/shuxiang/v2_rat.png'
import oxPng from '@/assets/shuxiang/v2_ox.png'
import tigerPng from '@/assets/shuxiang/v2_tiger.png'
import rabbitPng from '@/assets/shuxiang/v2_rabbit.png'
import dragonPng from '@/assets/shuxiang/v2_dragon.png'
import snakePng from '@/assets/shuxiang/v2_snake.png'
import horsePng from '@/assets/shuxiang/v2_horse.png'
import goatPng from '@/assets/shuxiang/v2_goat.png'
import monkeyPng from '@/assets/shuxiang/v2_monkey.png'
import chickenPng from '@/assets/shuxiang/v2_chicken.png'
import dogPng from '@/assets/shuxiang/v2_dog.png'
import pigPng from '@/assets/shuxiang/v2_pig.png'

// === JPG(备用) ===
import ratJpg from '@/assets/shuxiang/v2_rat.jpg'
import oxJpg from '@/assets/shuxiang/v2_ox.jpg'
import tigerJpg from '@/assets/shuxiang/v2_tiger.jpg'
import rabbitJpg from '@/assets/shuxiang/v2_rabbit.jpg'
import dragonJpg from '@/assets/shuxiang/v2_dragon.jpg'
import snakeJpg from '@/assets/shuxiang/v2_snake.jpg'
import horseJpg from '@/assets/shuxiang/v2_horse.jpg'
import goatJpg from '@/assets/shuxiang/v2_goat.jpg'
import monkeyJpg from '@/assets/shuxiang/v2_monkey.jpg'
import chickenJpg from '@/assets/shuxiang/v2_chicken.jpg'
import dogJpg from '@/assets/shuxiang/v2_dog.jpg'
import pigJpg from '@/assets/shuxiang/v2_pig.jpg'

/** 生肖英文 key(地支顺序) */
export type ZodiacKey =
  | 'rat' | 'ox' | 'tiger' | 'rabbit'
  | 'dragon' | 'snake' | 'horse' | 'goat'
  | 'monkey' | 'chicken' | 'dog' | 'pig'

/** 生肖中文名 */
export const ZODIAC_CN: Record<ZodiacKey, string> = {
  rat: '鼠', ox: '牛', tiger: '虎', rabbit: '兔',
  dragon: '龙', snake: '蛇', horse: '马', goat: '羊',
  monkey: '猴', chicken: '鸡', dog: '狗', pig: '猪',
}

/** 生肖地支 */
export const ZODIAC_DIZHI: Record<ZodiacKey, string> = {
  rat: '子', ox: '丑', tiger: '寅', rabbit: '卯',
  dragon: '辰', snake: '巳', horse: '午', goat: '未',
  monkey: '申', chicken: '酉', dog: '戌', pig: '亥',
}

/** SVG 矢量图(可继承 currentColor) */
export const shuxiangSvg: Record<ZodiacKey, string> = {
  rat: ratSvg.src, ox: oxSvg.src, tiger: tigerSvg.src, rabbit: rabbitSvg.src,
  dragon: dragonSvg.src, snake: snakeSvg.src, horse: horseSvg.src, goat: goatSvg.src,
  monkey: monkeySvg.src, chicken: chickenSvg.src, dog: dogSvg.src, pig: pigSvg.src,
}

/** WebP(推荐移动端) */
export const shuxiangWebp: Record<ZodiacKey, string> = {
  rat: ratWebp.src, ox: oxWebp.src, tiger: tigerWebp.src, rabbit: rabbitWebp.src,
  dragon: dragonWebp.src, snake: snakeWebp.src, horse: horseWebp.src, goat: goatWebp.src,
  monkey: monkeyWebp.src, chicken: chickenWebp.src, dog: dogWebp.src, pig: pigWebp.src,
}

/** PNG(透明背景) */
export const shuxiangPng: Record<ZodiacKey, string> = {
  rat: ratPng.src, ox: oxPng.src, tiger: tigerPng.src, rabbit: rabbitPng.src,
  dragon: dragonPng.src, snake: snakePng.src, horse: horsePng.src, goat: goatPng.src,
  monkey: monkeyPng.src, chicken: chickenPng.src, dog: dogPng.src, pig: pigPng.src,
}

/** JPG(备用) */
export const shuxiangJpg: Record<ZodiacKey, string> = {
  rat: ratJpg.src, ox: oxJpg.src, tiger: tigerJpg.src, rabbit: rabbitJpg.src,
  dragon: dragonJpg.src, snake: snakeJpg.src, horse: horseJpg.src, goat: goatJpg.src,
  monkey: monkeyJpg.src, chicken: chickenJpg.src, dog: dogJpg.src, pig: pigJpg.src,
}

/** 12 生肖顺序数组(地支正序) — 适合 .map() 渲染 */
export const ZODIACS: ReadonlyArray<{
  key: ZodiacKey
  cn: string
  dizhi: string
  svg: string
  webp: string
  png: string
  jpg: string
}> = [
  { key: 'rat',     cn: '鼠', dizhi: '子', svg: ratSvg.src,     webp: ratWebp.src,     png: ratPng.src,     jpg: ratJpg.src },
  { key: 'ox',      cn: '牛', dizhi: '丑', svg: oxSvg.src,      webp: oxWebp.src,      png: oxPng.src,      jpg: oxJpg.src },
  { key: 'tiger',   cn: '虎', dizhi: '寅', svg: tigerSvg.src,   webp: tigerWebp.src,   png: tigerPng.src,   jpg: tigerJpg.src },
  { key: 'rabbit',  cn: '兔', dizhi: '卯', svg: rabbitSvg.src,  webp: rabbitWebp.src,  png: rabbitPng.src,  jpg: rabbitJpg.src },
  { key: 'dragon',  cn: '龙', dizhi: '辰', svg: dragonSvg.src,  webp: dragonWebp.src,  png: dragonPng.src,  jpg: dragonJpg.src },
  { key: 'snake',   cn: '蛇', dizhi: '巳', svg: snakeSvg.src,   webp: snakeWebp.src,   png: snakePng.src,   jpg: snakeJpg.src },
  { key: 'horse',   cn: '马', dizhi: '午', svg: horseSvg.src,   webp: horseWebp.src,   png: horsePng.src,   jpg: horseJpg.src },
  { key: 'goat',    cn: '羊', dizhi: '未', svg: goatSvg.src,    webp: goatWebp.src,    png: goatPng.src,    jpg: goatJpg.src },
  { key: 'monkey',  cn: '猴', dizhi: '申', svg: monkeySvg.src,  webp: monkeyWebp.src,  png: monkeyPng.src,  jpg: monkeyJpg.src },
  { key: 'chicken', cn: '鸡', dizhi: '酉', svg: chickenSvg.src, webp: chickenWebp.src, png: chickenPng.src, jpg: chickenJpg.src },
  { key: 'dog',     cn: '狗', dizhi: '戌', svg: dogSvg.src,     webp: dogWebp.src,     png: dogPng.src,     jpg: dogJpg.src },
  { key: 'pig',     cn: '猪', dizhi: '亥', svg: pigSvg.src,     webp: pigWebp.src,     png: pigPng.src,     jpg: pigJpg.src },
] as const
