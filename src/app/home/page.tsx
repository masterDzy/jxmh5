'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { JmLeafLogo } from '../../components/jmaui/components/visual/JmLeafLogo';
import JmBrandBadge from '../../components/jmaui/components/content/JmBrandBadge';
import JmNinePalace from '../../components/jmaui/components/visual/JmNinePalace';
import { JmLunarDate } from '../../components/jmaui/components/functional/JmLunarDate';


export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/services');
    }, 5000);
    return () => clearTimeout(timer);
  }, [router]);

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
        marginTop: '50px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <JmLeafLogo width={88} />

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
