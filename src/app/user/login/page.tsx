'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { JmLeafLogo } from '@/components/jmaui/components/visual/JmLeafLogo';
import JmBrandBadge from '@/components/jmaui/components/content/JmBrandBadge';
import { post } from '@/lib/http';
import { STORAGE_KEYS, getItem, setItem, setJSON } from '@/lib/storage';
import { getGuestToken, clearGuestIdentity } from '@/lib/guest';

interface LoginData {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    phone: string;
    nickname: string | null;
    avatar: string | null;
    is_vip: boolean;
    vip_type: string | null;
    vip_expire_at: string | null;
  };
}

function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');

  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingWechat, setLoadingWechat] = useState(false);
  const [error, setError] = useState('');
  const [codeSent, setCodeSent] = useState(false);

  // 检查是否已登录
  useEffect(() => {
    const token = getItem(STORAGE_KEYS.accessToken);
    if (token) {
      router.replace(redirect || '/user/profile');
    }
  }, [router, redirect]);

  // 验证码倒计时
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const hideMessages = useCallback(() => {
    setError('');
    setCodeSent(false);
  }, []);

  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(e.target.value.replace(/\D/g, '').slice(0, 11));
    hideMessages();
  };

  const handleCodeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCode(e.target.value.replace(/\D/g, '').slice(0, 6));
    hideMessages();
  };

  const handleSendCode = async () => {
    hideMessages();

    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      setError('请输入正确的手机号');
      return;
    }

    try {
      const data = await post('/api/v1/auth/send-code', { phone });

      if (data.error === false) {
        setCountdown(60);
        setCodeSent(true);
      } else {
        setError(data.message || '发送失败');
      }
    } catch {
      setError('网络错误');
    }
  };

  const handlePhoneLogin = async () => {
    hideMessages();

    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      setError('请输入正确的手机号');
      return;
    }
    if (!code) {
      setError('请输入验证码');
      return;
    }

    setLoading(true);

    try {
      const data = await post<LoginData>(
        '/api/v1/auth/phone-login',
        { phone, code, guest_token: getGuestToken() }
      );

      if (data.error === false && data.data) {
        setItem(STORAGE_KEYS.accessToken, data.data.access_token);
        setItem(STORAGE_KEYS.refreshToken, data.data.refresh_token);
        setJSON(STORAGE_KEYS.user, data.data.user);
        clearGuestIdentity();
        router.push(redirect || '/user/profile');
      } else {
        setError(data.message || '登录失败');
      }
    } catch {
      setError('网络错误');
    } finally {
      setLoading(false);
    }
  };

  const handleWechatLogin = () => {
    setLoadingWechat(true);
    setTimeout(() => {
      setLoadingWechat(false);
      alert('微信登录开发中');
    }, 300);
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center px-6 pt-[calc(60px+env(safe-area-inset-top))] pb-[calc(40px+env(safe-area-inset-bottom))] bg-[#fafafa]"
      style={{ '--page-theme-color': 'var(--jm-color-brand-rose, #da2e75)' } as React.CSSProperties}
    >
      {/* Logo 区域 */}
      <div className="flex flex-col items-center">
        <JmLeafLogo width={80} />
        <div className="mt-4">
          <JmBrandBadge />
        </div>
      </div>

      {/* 登录表单 */}
      <div className="w-full max-w-[360px] mt-12">
        {/* 手机号输入 */}
        <div className="relative mb-4">
          <input
            type="tel"
            value={phone}
            onChange={handlePhoneInput}
            placeholder="请输入手机号"
            className="jm-form-input"
          />
        </div>

        {/* 验证码输入 + 发送按钮 */}
        <div className="flex gap-3 mb-6">
          <input
            type="text"
            value={code}
            onChange={handleCodeInput}
            placeholder="请输入验证码"
            className="flex-1 jm-form-input"
          />
          <button
            onClick={handleSendCode}
            disabled={countdown > 0}
            className="w-[120px] h-[52px] rounded-xl bg-white border border-[var(--page-theme-color)] text-[var(--page-theme-color)] text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
          >
            {countdown > 0 ? `${countdown}s` : '获取验证码'}
          </button>
        </div>

        {/* 验证码发送成功提示 */}
        {codeSent && !error && (
          <div className="mb-4 p-3 rounded-lg bg-green-50 text-green-600 text-sm text-center">
            验证码已发送，请注意查收
          </div>
        )}

        {/* 错误提示 */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-500 text-sm text-center">
            {error}
          </div>
        )}

        {/* 手机号登录按钮 */}
        <button
          onClick={handlePhoneLogin}
          disabled={loading}
          className="w-full h-[52px] rounded-xl bg-[var(--page-theme-color)] text-white text-base font-medium disabled:opacity-60 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
        >
          {loading ? '登录中...' : '登录'}
        </button>

        {/* 分割线 */}
        <div className="flex items-center gap-4 my-8">
          <div className="flex-1 jm-divider-line" />
          <span className="text-sm jm-muted">其他登录方式</span>
          <div className="flex-1 jm-divider-line" />
        </div>

        {/* 微信登录按钮 */}
        <button
          onClick={handleWechatLogin}
          disabled={loadingWechat}
          className="w-full h-[52px] rounded-xl bg-[#07c160] text-white text-base font-medium disabled:opacity-60 disabled:cursor-not-allowed transition-all active:scale-[0.98] flex items-center justify-center gap-3"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8.5 11c-.83 0-1.5-.67-1.5-1.5S7.67 8 8.5 8s1.5.67 1.5 1.5S9.33 11 8.5 11zm5 0c-.83 0-1.5-.67-1.5-1.5S12.67 8 13.5 8s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
            <path d="M12 2C6.48 2 2 6.48 2 12c0 2.17.7 4.18 1.88 5.82L2 22l4.18-1.88C7.82 21.3 9.83 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zM8.5 8c.83 0 1.5.67 1.5 1.5S9.33 11 8.5 11 7 10.33 7 9.5 7.67 8 8.5 8zm5 0c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5S12 10.33 12 9.5 12.67 8 13.5 8z"/>
          </svg>
          {loadingWechat ? '登录中...' : '微信一键登录'}
        </button>

        {/* 注册入口 */}
        <p className="mt-6 text-center">
          <span className="text-sm jm-muted">还没有账号？</span>
          <button
            onClick={() => router.push('/user/register')}
            className="text-sm text-[var(--page-theme-color)] font-medium ml-1"
          >
            立即注册
          </button>
        </p>

        {/* 协议提示 */}
        <p className="mt-4 text-xs jm-muted text-center">
          登录即表示同意
          <span className="text-[var(--page-theme-color)]">《用户协议》</span>
          和
          <span className="text-[var(--page-theme-color)]">《隐私政策》</span>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#fafafa]" />}>
      <LoginPageInner />
    </Suspense>
  )
}
