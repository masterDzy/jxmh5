/**
 * 访客身份模块 — 自动生成访客身份
 *
 * 流程：
 * 1. 页面加载时自动检查 localStorage 中是否有 guest_token
 * 2. 有则验证有效性（GET /api/v1/guest/me）
 * 3. 无效/无则创建新访客（POST /api/v1/guest/create）
 * 4. 失败后重试一次（2s 后），仍失败则本地生成兜底身份
 */

import { useState, useEffect, useRef } from 'react';
import { post, get } from './http';
import { STORAGE_KEYS, getItem, setItem, removeItem } from './storage';

// ==================== 类型定义 ====================

export interface GuestInfo {
  id: string;
  nickname: string;
  token: string;
  isLoading: boolean;
  isReady: boolean;
}

interface GuestData {
  id: string;
  nickname: string;
  device_fingerprint?: string;
}

interface GuestCreateResult {
  guest: GuestData;
  token: string;
}

interface GuestMeResult {
  id: string;
  nickname: string;
}

// ==================== 设备指纹 ====================

function generateDeviceFingerprint(): string {
  if (typeof window === 'undefined') return 'fp_ssr';

  const signals = [
    navigator.userAgent,
    String(screen.width),
    String(screen.height),
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    navigator.language,
  ];
  // djb2 hash — 无需 crypto.subtle，兼容所有移动浏览器
  const str = signals.join('||');
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
    hash = hash & hash; // 32-bit integer
  }
  return 'fp_' + Math.abs(hash).toString(36);
}

// ==================== API 调用 ====================

async function createGuest(deviceFingerprint: string): Promise<GuestCreateResult | null> {
  try {
    const result = await post<GuestCreateResult>('/api/v1/guest/create', {
      device_fingerprint: deviceFingerprint,
    });
    if (result.error === false && result.data) {
      return result.data;
    }
    return null;
  } catch {
    return null;
  }
}

async function validateGuest(token: string): Promise<GuestMeResult | null> {
  try {
    // 注意：如果用户已登录（存在 access_token），http 拦截器会用 access_token 覆盖
    // 此处传入的 Authorization 头。访客场景下通常无 access_token，因此可正常工作。
    const result = await get<GuestMeResult>(
      '/api/v1/guest/me',
      undefined,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (result.error === false && result.data) {
      return result.data;
    }
    return null;
  } catch {
    return null;
  }
}

// ==================== React Hook ====================

export function useGuest(): GuestInfo {
  const [state, setState] = useState<GuestInfo>({
    id: '',
    nickname: '',
    token: '',
    isLoading: true,
    isReady: false,
  });
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function tryCreateGuestWithRetry(attempt: number) {
      const fingerprint = generateDeviceFingerprint();
      const result = await createGuest(fingerprint);

      if (cancelled) return;

      if (result) {
        setItem(STORAGE_KEYS.guestToken, result.token);
        setItem(STORAGE_KEYS.guestId, result.guest.id);
        setItem(STORAGE_KEYS.guestNickname, result.guest.nickname);
        setState({
          id: result.guest.id,
          nickname: result.guest.nickname,
          token: result.token,
          isLoading: false,
          isReady: true,
        });
        return;
      }

      // 首次失败：2s 后重试一次
      if (attempt < 1) {
        retryTimerRef.current = setTimeout(() => {
          if (!cancelled) tryCreateGuestWithRetry(attempt + 1);
        }, 2000);
        return;
      }

      // 重试也失败：本地兜底身份
      const fallbackId = generateDeviceFingerprint();
      setState({
        id: fallbackId,
        nickname: '访客_' + fallbackId.slice(-4),
        token: '',
        isLoading: false,
        isReady: true,
      });
    }

    async function init() {
      if (typeof window === 'undefined') {
        setState((prev) => ({ ...prev, isLoading: false }));
        return;
      }

      // Step 1: 尝试从 localStorage 加载已有访客
      const existingToken = getItem(STORAGE_KEYS.guestToken);
      if (existingToken) {
        const me = await validateGuest(existingToken);
        if (!cancelled && me) {
          setState({
            id: me.id,
            nickname: me.nickname,
            token: existingToken,
            isLoading: false,
            isReady: true,
          });
          return;
        }
        // Token 无效，清理并重新创建
        clearGuestIdentityInternal();
      }

      // Step 2: 创建新访客
      await tryCreateGuestWithRetry(0);
    }

    init();

    return () => {
      cancelled = true;
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }
    };
  }, []);

  return state;
}

// ==================== 同步读取工具 ====================

export function getGuestToken(): string | null {
  return getItem(STORAGE_KEYS.guestToken);
}

export function getGuestId(): string | null {
  return getItem(STORAGE_KEYS.guestId);
}

export function getGuestNickname(): string | null {
  return getItem(STORAGE_KEYS.guestNickname);
}

// ==================== 清理 ====================

function clearGuestIdentityInternal(): void {
  removeItem(STORAGE_KEYS.guestToken);
  removeItem(STORAGE_KEYS.guestId);
  removeItem(STORAGE_KEYS.guestNickname);
}

export function clearGuestIdentity(): void {
  clearGuestIdentityInternal();
}
