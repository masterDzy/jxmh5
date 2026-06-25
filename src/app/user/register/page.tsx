'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { JmLeafLogo } from '@/components/jmaui/components/visual/JmLeafLogo';
import JmBrandBadge from '@/components/jmaui/components/content/JmBrandBadge';
import { post } from '@/lib/http';
import { STORAGE_KEYS, getItem, setItem, setJSON } from '@/lib/storage';
import { getGuestToken, clearGuestIdentity } from '@/lib/guest';

interface RegisterData {
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

export default function RegisterPage() {
  const router = useRouter();

  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [codeSent, setCodeSent] = useState(false);

  // 检查是否已登录
  useEffect(() => {
    const token = getItem(STORAGE_KEYS.accessToken);
    if (token) {
      router.replace('/user/profile');
    }
  }, [router]);

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

  const handleRegister = async () => {
    hideMessages();

    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      setError('请输入正确的手机号');
      return;
    }
    if (!code) {
      setError('请输入验证码');
      return;
    }
    if (!nickname || nickname.trim().length < 1) {
      setError('请输入昵称');
      return;
    }
    if (!password || password.length < 6) {
      setError('密码至少6位');
      return;
    }
    if (password !== confirmPassword) {
      setError('两次密码不一致');
      return;
    }

    setLoading(true);

    try {
      const data = await post<RegisterData>(
        '/api/v1/auth/register',
        {
          phone,
          code,
          password,
          nickname: nickname.trim(),
          guest_token: getGuestToken(),
        }
      );

      if (data.error === false && data.data) {
        setItem(STORAGE_KEYS.accessToken, data.data.access_token);
        setItem(STORAGE_KEYS.refreshToken, data.data.refresh_token);
        setJSON(STORAGE_KEYS.user, data.data.user);
        clearGuestIdentity();
        router.push('/user/profile');
      } else {
        setError(data.message || '注册失败');
      }
    } catch {
      setError('网络错误');
    } finally {
      setLoading(false);
    }
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

      {/* 注册表单 */}
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
        <div className="flex gap-3 mb-4">
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

        {/* 昵称输入 */}
        <div className="relative mb-4">
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="请输入昵称"
            maxLength={20}
            className="jm-form-input"
          />
        </div>

        {/* 密码输入 */}
        <div className="relative mb-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="请设置密码（至少6位）"
            maxLength={32}
            className="jm-form-input"
          />
        </div>

        {/* 确认密码输入 */}
        <div className="relative mb-6">
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="请再次输入密码"
            maxLength={32}
            className="jm-form-input"
          />
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

        {/* 注册按钮 */}
        <button
          onClick={handleRegister}
          disabled={loading}
          className="w-full h-[52px] rounded-xl bg-[var(--page-theme-color)] text-white text-base font-medium disabled:opacity-60 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
        >
          {loading ? '注册中...' : '注册'}
        </button>

        {/* 登录入口 */}
        <p className="mt-6 text-center">
          <span className="text-sm jm-muted">已有账号？</span>
          <button
            onClick={() => router.push('/user/login')}
            className="text-sm text-[var(--page-theme-color)] font-medium ml-1"
          >
            立即登录
          </button>
        </p>

        {/* 协议提示 */}
        <p className="mt-4 text-xs jm-muted text-center">
          注册即表示同意
          <span className="text-[var(--page-theme-color)]">《用户协议》</span>
          和
          <span className="text-[var(--page-theme-color)]">《隐私政策》</span>
        </p>
      </div>
    </div>
  );
}
