'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { JmGuestProfile } from '@/components/jmaui/components/content/JmGuestProfile';
import { get, post } from '@/lib/http';
import { STORAGE_KEYS, getItem, removeItem } from '@/lib/storage';
import { getGuestId, getGuestNickname } from '@/lib/guest';

interface UserInfo {
  id: string;
  phone: string;
  nickname: string | null;
  avatar: string | null;
  is_vip: boolean;
  vip_type: string | null;
  vip_expire_at: string | null;
}

function getMemberLabel(user: UserInfo): string {
  if (!user.is_vip) return '免费用户';
  if (user.vip_type === 'svip') return 'SVIP会员';
  return 'VIP会员';
}

function getMemberColor(user: UserInfo): string {
  if (!user.is_vip) return '#999';
  if (user.vip_type === 'svip') return '#D4AF37';
  return 'var(--page-theme-color, #da2e75)';
}

/**
 * 确保游客有本地身份兜底
 * 即使后端访客系统未初始化，也能展示游客详情页而非跳转登录
 */
function ensureLocalGuestIdentity(): { id: string; nickname: string } {
  let id = getGuestId();
  if (!id) {
    id = 'local_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const nickname = '访客_' + id.slice(-4);
    localStorage.setItem(STORAGE_KEYS.guestId, id);
    localStorage.setItem(STORAGE_KEYS.guestNickname, nickname);
    return { id, nickname };
  }
  return { id, nickname: getGuestNickname() || '游客' };
}

// ==================== 页面级子组件（游客详情页专用，不抽出） ====================

function MenuItem({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 px-4 h-[56px] active:bg-gray-50 transition-colors">
      <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">{icon}</div>
      <span className="flex-1 text-left text-[#171717]">{label}</span>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="#ccc"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>
    </button>
  );
}

function MenuDivider() {
  return <div className="mx-4 jm-divider-line" />;
}

// ==================== 页面组件 ====================

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [guestNickname, setGuestNickname] = useState<string | null>(null);

  useEffect(() => {
    const token = getItem(STORAGE_KEYS.accessToken);

    if (token) {
      // 已登录：获取用户信息
      setIsGuest(false);
      fetchUserInfo();
    } else {
      // 游客：确保有本地身份兜底，展示游客详情页（不跳转登录/注册）
      setIsGuest(true);
      const identity = ensureLocalGuestIdentity();
      setGuestNickname(identity.nickname);
      setLoading(false);
    }
  }, [router]);

  const fetchUserInfo = async () => {
    try {
      const data = await get<{ user: UserInfo }>('/api/v1/auth/me');
      if (data.error === false && data.data) {
        setUser(data.data.user);
      } else {
        handleLogout();
      }
    } catch {
      console.error('获取用户信息失败');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await post('/api/v1/auth/logout');
    } catch { /* ignore */ }
    removeItem(STORAGE_KEYS.accessToken);
    removeItem(STORAGE_KEYS.refreshToken);
    removeItem(STORAGE_KEYS.user);
    router.replace('/user/login');
  };

  const confirmLogout = () => setShowLogoutConfirm(true);
  const cancelLogout = () => setShowLogoutConfirm(false);

  const executeLogout = () => {
    setShowLogoutConfirm(false);
    handleLogout();
  };

  const formatPhone = (phone: string) => {
    if (!phone) return '未绑定';
    return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
  };

  const formatExpireDate = (dateStr: string | null) => {
    if (!dateStr) return '永久';
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <div className="jm-muted">加载中...</div>
      </div>
    );
  }

  // 游客页面 — 组件装载 + 路由回调
  if (isGuest) {
    return (
      <JmGuestProfile
        guestNickname={guestNickname}
        themeColor="var(--jm-color-brand-vermilion, #D94E3D)"
        onRegisterClick={() => router.push('/user/register')}
        onMessagesClick={() => router.push('/user/messages')}
        onBackClick={() => router.back()}
      />
    );
  }

  // 游客未通过检测
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <div className="jm-muted">未登录</div>
      </div>
    );
  }

  // 已登录用户页面
  const memberLabel = getMemberLabel(user);
  const memberColor = getMemberColor(user);
  const displayName = user.nickname || formatPhone(user.phone);

  return (
    <div className="min-h-screen bg-[#fafafa] pb-[calc(40px+env(safe-area-inset-bottom))]"
      style={{ '--page-theme-color': 'var(--jm-color-brand-rose, #da2e75)' } as React.CSSProperties}
    >
      {/* 用户信息头部 — 已登录用户有用户信息，保留内联 */}
      <div className="relative px-6 pt-[calc(20px+env(safe-area-inset-top))] pb-12"
        style={{ background: 'linear-gradient(135deg, var(--page-theme-color, #da2e75) 0%, #D94E3D 100%)' }}
      >
        <div className="flex items-center justify-between mb-8">
          <span className="text-white text-sm">九信云</span>
          {/* JmLeafLogo 用 React.lazy 或条件渲染更好，这里先保留内联引用 */}
        </div>
        <div className="flex items-center gap-4">
          <div className="w-[72px] h-[72px] rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
            {user.avatar ? (
              <img src={user.avatar} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              <svg width="36" height="36" viewBox="0 0 24 24" fill="rgba(255,255,255,0.9)">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-white text-xl font-medium">{displayName}</h2>
            <p className="text-white/70 text-sm mt-1">{formatPhone(user.phone)}</p>
          </div>
          <div className="px-3 py-1 rounded-full text-white text-xs font-medium bg-white/20">
            {memberLabel}
          </div>
        </div>
      </div>

      <div className="mx-4 -mt-6 p-4 jm-modal-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${memberColor}15` }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill={memberColor}>
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
              </svg>
            </div>
            <div>
              <p className="font-medium text-[#171717]">{memberLabel}</p>
              <p className="text-xs jm-muted mt-0.5">
                到期时间：{formatExpireDate(user.vip_expire_at)}
              </p>
            </div>
          </div>
          <button className="px-4 py-2 rounded-full text-white text-sm font-medium"
            style={{ backgroundColor: memberColor }}>
            {user.is_vip ? '续费' : '立即开通'}
          </button>
        </div>
      </div>

      <div className="mt-4 mx-4 rounded-2xl bg-white overflow-hidden">
        <MenuItem icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--page-theme-color, #da2e75)">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        } label="个人资料" onClick={() => {}} />
        <MenuDivider />
        <MenuItem icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--page-theme-color, #da2e75)">
            <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V8h16v10zm-2-1h-6v-2h6v2zM7 17v-2h7v2H7z"/>
          </svg>
        } label="我的订单" onClick={() => {}} />
        <MenuDivider />
        <MenuItem icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--page-theme-color, #da2e75)">
            <path d="M21 6h-2v9H6v2c0 .55.45 1 1 1h11l4 4V7c0-.55-.45-1-1-1zm-4 6V3c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v14l4-4h10c.55 0 1-.45 1-1z"/>
          </svg>
        } label="咨询记录" onClick={() => {}} />
        <MenuDivider />
        <MenuItem icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--page-theme-color, #da2e75)">
            <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
          </svg>
        } label="消息通知" onClick={() => router.push('/user/messages')} />
      </div>

      <div className="mt-4 mx-4 rounded-2xl bg-white overflow-hidden">
        <MenuItem icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#999">
            <path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59-.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0-.44.17-.47.41l-.36 2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
          </svg>
        } label="设置" onClick={() => {}} />
        <MenuDivider />
        <MenuItem icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#999">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
        } label="关于我们" onClick={() => {}} />
      </div>

      <div className="mt-8 mx-4">
        <button onClick={confirmLogout} className="w-full jm-form-button-ghost">
          退出登录
        </button>
      </div>

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50">
          <div className="w-full max-w-[300px] rounded-2xl bg-white overflow-hidden">
            <div className="p-6 text-center">
              <h3 className="text-lg font-medium text-[#171717]">确认退出登录？</h3>
              <p className="text-sm jm-muted mt-2">退出后将返回登录页面</p>
            </div>
            <div className="flex jm-modal-divider">
              <button onClick={cancelLogout} className="flex-1 jm-modal-btn-secondary">取消</button>
              <button onClick={executeLogout} className="flex-1 h-[52px] text-[var(--page-theme-color)] font-medium">确认退出</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
