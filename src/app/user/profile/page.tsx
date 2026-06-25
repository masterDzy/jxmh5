'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { JmGuestProfile } from '@/components/jmaui/components/content/JmGuestProfile';
import { JmUserProfile } from '@/components/jmaui/components/content/JmUserProfile';
import { STORAGE_KEYS, getItem, removeItem } from '@/lib/storage';
import { getGuestId, getGuestNickname, getRandomChineseNickname } from '@/lib/guest';

const THEME_ROSE = 'var(--jm-color-brand-rose, #da2e75)';
const THEME_VERMILION = 'var(--jm-color-brand-vermilion, #D94E3D)';

/**
 * 游客本地身份兜底：后端访客系统未初始化时也能展示游客详情页
 */
function ensureLocalGuestIdentity(): { id: string; nickname: string } {
  let id = getGuestId();
  if (!id) {
    id = 'local_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const nickname = getRandomChineseNickname();
    localStorage.setItem(STORAGE_KEYS.guestId, id);
    localStorage.setItem(STORAGE_KEYS.guestNickname, nickname);
    return { id, nickname };
  }
  return { id, nickname: getGuestNickname() || '游客' };
}

export default function ProfilePage() {
  const router = useRouter();
  const [isGuest, setIsGuest] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const [guestNickname, setGuestNickname] = useState<string | null>(null);

  useEffect(() => {
    const token = getItem(STORAGE_KEYS.accessToken);
    setHasToken(!!token);
    setIsGuest(!token);
    if (!token) {
      setGuestNickname(ensureLocalGuestIdentity().nickname);
    }
  }, []);

  const handleLogout = () => {
    removeItem(STORAGE_KEYS.accessToken);
    removeItem(STORAGE_KEYS.refreshToken);
    removeItem(STORAGE_KEYS.user);
    router.replace('/user/login');
  };

  // 路由回调映射
  const handleMenuClick = (key: string) => {
    switch (key) {
      case 'messages':
        router.push('/user/messages');
        break;
      // TODO: 接入真实路由
      case 'profile':
      case 'orders':
      case 'consultation':
      case 'settings':
      case 'about':
      default:
        break;
    }
  };

  // 游客
  if (isGuest) {
    return (
      <JmGuestProfile
        guestNickname={guestNickname}
        themeColor={THEME_VERMILION}
        onRegisterClick={() => router.push('/user/register')}
        onMessagesClick={() => router.push('/user/messages')}
        onBackClick={() => router.back()}
      />
    );
  }

  // 已登录
  if (hasToken) {
    return (
      <JmUserProfile
        themeColor={THEME_ROSE}
        onMenuClick={handleMenuClick}
        onLogout={handleLogout}
      />
    );
  }

  // 兜底（理论上不会走到）
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
      <div className="jm-muted">加载中...</div>
    </div>
  );
}
