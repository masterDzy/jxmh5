/**
 * Mobile 专用 API client
 * 使用统一的 http 层，支持环境自动切换
 */

import { post, get, getAPIConfig } from './http';
import { STORAGE_KEYS, getItem, setItem, removeItem, getJSON, setJSON } from './storage';

// ==================== 类型定义 ====================

export interface MobileUser {
  id: string;
  phone?: string;
  nickname?: string;
  avatar?: string;
  // ... 其他字段
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: MobileUser;
}

export interface ApiResult<T = any> {
  code: number;
  message: string;
  data?: T;
}

// ==================== Token 管理 ====================

export const mobileAuth = {
  // 发送验证码
  sendCode: async (phone: string): Promise<ApiResult> => {
    const result = await post('/api/v1/auth/send-code', { phone });
    return { code: 200, message: result.message, data: result.data };
  },

  // 手机号登录
  phoneLogin: async (phone: string, code: string): Promise<ApiResult<LoginResponse>> => {
    const result = await post<LoginResponse>('/api/v1/auth/phone-login', { phone, code });

    if (!result.error && result.data) {
      const loginData = result.data as unknown as LoginResponse;
      setItem(STORAGE_KEYS.accessToken, loginData.access_token);
      setItem(STORAGE_KEYS.refreshToken, loginData.refresh_token);
      setJSON(STORAGE_KEYS.user, loginData.user);
      return { code: 200, message: result.message || '登录成功', data: loginData };
    }
    return { code: result.error ? 500 : 200, message: result.message || '登录失败' };
  },

  // 微信登录
  wechatLogin: async (code: string): Promise<ApiResult<LoginResponse>> => {
    const result = await post<LoginResponse>('/api/v1/auth/wechat-login', { code });

    if (!result.error && result.data) {
      const loginData = result.data as unknown as LoginResponse;
      setItem(STORAGE_KEYS.accessToken, loginData.access_token);
      setItem(STORAGE_KEYS.refreshToken, loginData.refresh_token);
      setJSON(STORAGE_KEYS.user, loginData.user);
      return { code: 200, message: result.message || '登录成功', data: loginData };
    }
    return { code: result.error ? 500 : 200, message: result.message || '登录失败' };
  },

  // 获取当前用户
  getMe: async (): Promise<ApiResult<MobileUser>> => {
    const token = getItem(STORAGE_KEYS.accessToken);
    if (!token) return { code: 401, message: '未登录' };

    const config = getAPIConfig();
    const url = `${config.baseURL}/api/v1/auth/me`;

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  // 登出
  logout: async (): Promise<void> => {
    const token = getItem(STORAGE_KEYS.accessToken);
    if (token) {
      try {
        const config = getAPIConfig();
        await fetch(`${config.baseURL}/api/v1/auth/logout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      } catch {
        // 忽略错误
      }
    }
    removeItem(STORAGE_KEYS.accessToken);
    removeItem(STORAGE_KEYS.refreshToken);
    removeItem(STORAGE_KEYS.user);
  },

  // 检查是否已登录
  isLoggedIn: (): boolean => {
    if (typeof window === 'undefined') return false;
    return !!getItem(STORAGE_KEYS.accessToken);
  },

  // 获取本地用户信息
  getLocalUser: (): MobileUser | null => {
    if (typeof window === 'undefined') return null;
    return getJSON<MobileUser>(STORAGE_KEYS.user);
  },
};

// ==================== 其他 API 模块示例 ====================

/**
 * 服务相关 API
 * 注意：这里使用相对路径，http 层会自动处理环境差异
 */
export const servicesAPI = {
  // 获取单个服务详情（booking 详情用；列表/分类展示已迁 newproduct + JmCateMindMap）
  getService: (id: string) => get(`/api/v1/mobile/services/${id}`),
};

/**
 * 页面内容 API
 */
export const pagesAPI = {
  // 获取页面内容
  getPageContent: (slug: string) => get(`/api/v1/pages/content/${slug}`),
};

/**
 * 知识文章 API
 */
export const knowledgeAPI = {
  // 获取文章列表
  getArticles: (params?: { page?: number; page_size?: number; category_id?: string }) =>
    get('/api/v1/knowledge/articles', params),

  // 获取文章详情
  getArticle: (id: string) => get(`/api/v1/knowledge/articles/${id}`),
};

// ==================== 新产品 API (newproduct 表) ====================

export const newproductAPI = {
  getProducts: () => get('/api/v1/mobile/newproduct'),
  getProduct: (id: string | number) => get(`/api/v1/mobile/newproduct/${id}`),
};

// ==================== 策划师 API (planner 表) ====================

export const plannerAPI = {
  getPlanners: () => get('/api/v1/mobile/planner'),
};

// ==================== 环境信息 ====================

export { getEnv } from './http';
