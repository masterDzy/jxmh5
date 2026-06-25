'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { JmLeafLogo } from '../components/jmaui/components/visual/JmLeafLogo';
import JmBrandBadge from '../components/jmaui/components/content/JmBrandBadge';
import JmNinePalace from '../components/jmaui/components/visual/JmNinePalace';
import { JmLunarDate } from '../components/jmaui/components/functional/JmLunarDate';
import { JmFooter } from '@/components/jmaui';

export default function HomePage() {
  const router = useRouter()
  const logoTapCount = useRef(0)
  const logoTapTimer = useRef<NodeJS.Timeout | null>(null)

  // 6秒后自动进入服务页面
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/services')
    }, 6000)
    return () => clearTimeout(timer)
  }, [router])

  // 隐藏手势:连点 logo 5 次 → 进入调试面板
  const handleLogoTap = () => {
    logoTapCount.current += 1
    if (logoTapTimer.current) clearTimeout(logoTapTimer.current)
    logoTapTimer.current = setTimeout(() => {
      logoTapCount.current = 0
    }, 2000)
    if (logoTapCount.current >= 5) {
      logoTapCount.current = 0
      if (logoTapTimer.current) clearTimeout(logoTapTimer.current)
      router.push('/debug')
    }
  }

  return (
    <div style={{
      background: '#fafafa',
      height: '100dvh',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: 'env(safe-area-inset-top) 16px env(safe-area-inset-bottom)',
      boxSizing: 'border-box',
      justifyContent: 'flex-start',
    }}>
      <div style={{
        marginTop: '85px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        {/* logo 包一层可点击 div (5 连点手势入口,不影响视觉) */}
        <div onClick={handleLogoTap} style={{ cursor: 'pointer' }}>
          <JmLeafLogo width={88} />
        </div>

        <div style={{ marginTop: '35px' }}>
          <JmBrandBadge />
        </div>

        <div style={{ marginTop: '45px' }}>
          <JmNinePalace />
        </div>
      </div>

      {/* 万年历 - 右下角 */}
      <div style={{
        position: 'fixed',
        right: '16px',
        bottom: 'calc(16px + env(safe-area-inset-bottom))',
      }}>
        <JmLunarDate dateColor='#525252' ganZhiColor='#999' yiColor='#D94E3D' />
      </div>
    </div>
  );
}
