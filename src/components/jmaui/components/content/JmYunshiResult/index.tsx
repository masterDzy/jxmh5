/**
 * JmYunshiResult 运势结果展示组件
 *
 * 功能：
 * - 切换当月/当年运势视图
 * - 展示天干/地支十神卡片
 * - 展开动画效果
 */

'use client'

import type { JmYunshiResultProps } from './props'

// 天干数据
const TIANGAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
// 地支数据
const DIZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
// 十二生肖名称
const ZODIAC_NAMES = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪']

// 天干五行属性
const TIANGAN_WUXING = ['木', '木', '火', '火', '土', '土', '金', '金', '水', '水']
// 天干阴阳
const TIANGAN_YINYANG = [0, 1, 0, 1, 0, 1, 0, 1, 0, 1]

// 地支五行属性
const DIZHI_WUXING = ['水', '土', '木', '木', '土', '火', '火', '土', '金', '金', '土', '水']
// 地支阴阳
const DIZHI_YINYANG = [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1]

// 五行索引
const WUXING_INDEX: Record<string, number> = { '木': 0, '火': 1, '土': 2, '金': 3, '水': 4 }
// 五行相生顺序
const WUXING_SHENG = ['木', '火', '土', '金', '水']

// 十神信息数据库
const SHISHEN_INFO: Record<string, {
  name: string
  meaning: string
  feature: string
  advice: string
}> = {
  '偏财': { name: '偏财', meaning: '意外之财、投机获利', feature: '投资收益、意外红包、灰色收入、投机赚取', advice: '宜投资理财、把握机会、分散风险、忌贪婪' },
  '正财': { name: '正财', meaning: '正当收入、稳步财利', feature: '工资收入、生意利润、勤劳致富、稳健理财', advice: '宜脚踏实地、稳步发展、正当经营、忌冒进' },
  '七杀': { name: '七杀', meaning: '挑战压力、变革机遇', feature: '竞争激烈、变故挑战、危机并存、破旧立新', advice: '宜迎难而上、积极应对、化压力为动力、忌退缩' },
  '正官': { name: '正官', meaning: '规矩责任、晋升机会', feature: '上司认可、职位晋升、名誉地位、按部就班', advice: '宜守规矩、把握机会、维护关系、忌急躁' },
  '印星': { name: '印星', meaning: '贵人相助、学业证书', feature: '贵人扶持、学习进步、房产文书、靠山靠背', advice: '宜学习进修、结交贵人、稳打稳扎、忌依赖' },
  '枭神': { name: '枭神', meaning: '独立创造、冷门机遇', feature: '偏门学问、独立思考、不按常理、出奇制胜', advice: '宜独辟蹊径、创新思维、把握偏门、忌随大流' },
  '食神': { name: '食神', meaning: '表达创意、吃喝享受', feature: '口福享受、创意输出、技术发挥、表达表演', advice: '宜发挥特长、展示才华、享受生活、忌压抑' },
  '伤官': { name: '伤官', meaning: '才华展现、叛逆创新', feature: '才华横溢、创新思维、不服管制、敢于突破', advice: '宜展示才华、突破创新、适度收敛、忌狂妄' },
  '比肩': { name: '比肩', meaning: '并肩同行、合作共赢', feature: '同事助力、合作创业、朋友支持、公平竞争', advice: '宜合作共赢、借助他人、公平竞争、忌独断' },
  '劫财': { name: '劫财', meaning: '竞争破耗、动态平衡', feature: '竞争激烈、破耗损失、动态博弈、抢财争富', advice: '宜守财防骗、主动出击、分散风险、忌投机' }
}

/**
 * 计算十神
 */
function calcShiShen(userZhiIndex: number, targetIndex: number, isTargetGan: boolean): string {
  const aWuXing = DIZHI_WUXING[userZhiIndex]
  const aYinYang = DIZHI_YINYANG[userZhiIndex]
  const bWuXing = isTargetGan ? TIANGAN_WUXING[targetIndex] : DIZHI_WUXING[targetIndex]
  const bYinYang = isTargetGan ? TIANGAN_YINYANG[targetIndex] : DIZHI_YINYANG[targetIndex]

  const aIndex = WUXING_INDEX[aWuXing]
  const bIndex = WUXING_INDEX[bWuXing]

  if (aWuXing === bWuXing) return aYinYang === bYinYang ? '比肩' : '劫财'
  if (WUXING_SHENG[bIndex % 5] === aWuXing) return bYinYang === 0 ? '印星' : '枭神'
  if (WUXING_SHENG[aIndex % 5] === bWuXing) return bYinYang === 0 ? '食神' : '伤官'
  const aKeIndex = (aIndex + 2) % 5
  if (aKeIndex === bIndex) return aYinYang === bYinYang ? '偏财' : '正财'
  const bKeIndex = (bIndex + 2) % 5
  if (bKeIndex === aIndex) return aYinYang === bYinYang ? '七杀' : '正官'
  return '未知'
}

function getShiShen(userZhiIndex: number, ganIndex: number, zhiIndex: number) {
  return {
    gan: calcShiShen(userZhiIndex, ganIndex, true),
    zhi: calcShiShen(userZhiIndex, zhiIndex, false)
  }
}

function getShiShenDetail(s: string) {
  return SHISHEN_INFO[s] || { name: s, meaning: '暂无解释', feature: '暂无特征', advice: '暂无建议' }
}

export function JmYunshiResult({
  zodiacIndex,
  monthGanIndex,
  monthZhiIndex,
  yearGanIndex,
  yearZhiIndex,
  activeView = 'month',
  onViewChange,
  themeColor = '#fb5c3e',
  className = '',
  style
}: JmYunshiResultProps) {
  // 计算十神
  const monthShiShen = getShiShen(zodiacIndex, monthGanIndex, monthZhiIndex)
  const yearShiShen = getShiShen(zodiacIndex, yearGanIndex, yearZhiIndex)

  const currentShiShen = activeView === 'month' ? monthShiShen : yearShiShen
  const currentGanIndex = activeView === 'month' ? monthGanIndex : yearGanIndex
  const currentZhiIndex = activeView === 'month' ? monthZhiIndex : yearZhiIndex

  const renderCard = (title: string, ganZhi: string, wuxing: string, shishen: string, color: string, bg: string) => {
    const d = getShiShenDetail(shishen)
    return (
      <div className="jm-yunshi-result__card flex items-stretch overflow-hidden" style={{ borderRadius: '12px' }}>
        <div className="w-1 flex-shrink-0" style={{ background: color }} />
        <div className="flex-1 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[13px] font-medium" style={{ color: '#6b6b6b' }}>{title}</span>
            <div className="flex items-center">
              <span className="text-[12px] text-[#999] mr-2">{ganZhi}</span>
              <span className="text-[14px] font-semibold" style={{ color }}>{wuxing}</span>
            </div>
          </div>
          <div className="text-[15px] text-[#1a1a1a] mb-2">
            <span className="text-[#999]">十神：</span>
            <span className="font-semibold" style={{ color }}>{d.name}</span>
          </div>
          <div className="text-[13px] text-[#1a1a1a] mb-1">
            <span className="text-[#999]">含义：</span>{d.meaning}
          </div>
          <div className="text-[13px] text-[#1a1a1a] mb-1">
            <span className="text-[#999]">来法：</span>{d.feature}
          </div>
          <div className="text-[13px] text-[#1a1a1a]">
            <span className="text-[#999]">建议：</span>{d.advice}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`jm-yunshi-result ${className}`} style={style}>
      {/* 视图切换 Tab */}
      <div className="bg-white rounded-xl p-1 mb-4 flex" style={{ border: '1px solid rgba(0,0,0,0.06)' }}>
        <button
          className={`jm-yunshi-result__tab flex-1 py-2 text-[14px] font-medium rounded-lg transition-all ${activeView === 'month' ? 'text-white' : 'text-[#6b6b6b]'}`}
          style={activeView === 'month' ? { background: themeColor } : undefined}
          onClick={() => onViewChange?.('month')}
        >
          当月运势
        </button>
        <button
          className={`jm-yunshi-result__tab flex-1 py-2 text-[14px] font-medium rounded-lg transition-all ${activeView === 'year' ? 'text-white' : 'text-[#6b6b6b]'}`}
          style={activeView === 'year' ? { background: themeColor } : undefined}
          onClick={() => onViewChange?.('year')}
        >
          当年运势
        </button>
      </div>

      {/* 十神卡片 */}
      <div className="space-y-3">
        {renderCard('天干', `${TIANGAN[currentGanIndex]}·`, TIANGAN_WUXING[currentGanIndex], currentShiShen.gan, themeColor, 'rgba(218, 46, 117, 0.06)')}
        {renderCard('地支', `${DIZHI[currentZhiIndex]}·`, DIZHI_WUXING[currentZhiIndex], currentShiShen.zhi, '#A6BA43', 'rgba(166, 186, 67, 0.06)')}
      </div>

      {/* 属相说明 */}
      <div className="jm-yunshi-result__zodiac-info rounded-xl p-4 mt-4">
        <div className="flex items-center mb-2">
          <span className="text-[16px] font-semibold text-[#1a1a1a]">
            {ZODIAC_NAMES[zodiacIndex]}年出生
          </span>
        </div>
        <p className="text-[13px] text-[#6b6b6b] leading-relaxed">
          地支为{DIZHI[zodiacIndex]}，五行属{DIZHI_WUXING[zodiacIndex]}，{DIZHI_YINYANG[zodiacIndex] === 0 ? '阳' : '阴'}性。
        </p>
      </div>
    </div>
  )
}

export default JmYunshiResult