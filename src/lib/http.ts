/**
 * HTTP 请求层 — axios 封装
 *
 * 功能：
 * 1. 自动处理环境差异（dev/prod/capacitor）
 * 2. 请求/响应拦截器
 * 3. Token 自动刷新
 * 4. 错误统一处理
 */

import axios from 'axios';
import { getAPIConfig, buildURL, getBaseURL } from './config';
import { STORAGE_KEYS, getItem, setItem, removeItem } from './storage';
import { isLocalMode, routeLocalApi } from './local-api';

// ==================== 类型定义 ====================

export interface ApiResponse<T = any> {
  error: boolean;
  message: string;
  data: T;
}

export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// ==================== Token 管理 ====================

function getToken(type: 'access' | 'refresh'): string | null {
  return getItem(type === 'access' ? STORAGE_KEYS.accessToken : STORAGE_KEYS.refreshToken);
}

function setToken(type: 'access', token: string): void {
  setItem(type === 'access' ? STORAGE_KEYS.accessToken : STORAGE_KEYS.refreshToken, token);
}

function removeTokens(): void {
  removeItem(STORAGE_KEYS.accessToken);
  removeItem(STORAGE_KEYS.refreshToken);
}

// ==================== 创建 axios 实例 ====================

// 简化类型，使用 any 避免复杂的类型推断问题
export const http = axios.create({
  // 相对路径时不设置 baseURL，让拦截器处理
  baseURL: undefined,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==================== 请求拦截器 ====================
// 关键修复：每次请求都动态计算完整 URL，避免 baseURL 在 SSR/客户端混合上下文失效
http.interceptors.request.use(
  (conf: any) => {
    // 0. 本地调试模式: 短路,直接走 PGlite
    if (isLocalMode() && conf.url && conf.url.startsWith('/api/v1')) {
      // 把请求转给 local-api 处理
      const params = conf.params || {}
      const queryString = Object.entries(params)
        .filter(([_, v]) => v !== undefined && v !== null && v !== '')
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
        .join('&')
      const fullPath = queryString ? `${conf.url}?${queryString}` : conf.url

      conf.adapter = async () => {
        const result = await routeLocalApi({
          method: (conf.method?.toUpperCase() || 'GET') as any,
          path: fullPath,
          query: Object.fromEntries(
            Object.entries(params).map(([k, v]) => [k, String(v)])
          ),
          body: conf.data,
          headers: conf.headers || {},
        })
        return {
          data: result,
          status: result.error ? 500 : 200,
          statusText: result.error ? 'Local API Error' : 'OK',
          headers: {},
          config: conf,
        }
      }
      // 给一个假 URL 防止 axios 报"url is required"
      conf.url = fullPath
      conf.baseURL = ''
      return conf
    }

    // 添加认证 Token
    const token = getToken('access');
    if (token) {
      conf.headers.Authorization = `Bearer ${token}`;
    }

    // 强制重写 url：把相对路径用当前 env 的 baseURL 拼成完整 URL
    if (conf.url && !conf.url.startsWith('http')) {
      const dynamicBaseURL = getBaseURL();
      if (dynamicBaseURL) {
        const path = conf.url.startsWith('/') ? conf.url : `/${conf.url}`;
        conf.url = `${dynamicBaseURL.replace(/\/$/, '')}${path}`;
        conf.baseURL = dynamicBaseURL;
      }
    }

    return conf;
  },
  (error: any) => {
    console.error('[HTTP] 请求配置错误:', error);
    return Promise.reject(error);
  }
);

// ==================== 响应拦截器 ====================
http.interceptors.response.use(
  (response: any) => {
    return response;
  },
  async (error: any) => {
    const originalRequest = error.config;

    // 401 处理：尝试刷新 Token
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = getToken('refresh');
      if (refreshToken) {
        try {
          const refreshConfig = getAPIConfig();
          const refreshURL = `${refreshConfig.baseURL}/api/v1/auth/refresh`;

          const refreshResponse: any = await axios.post(
            refreshURL,
            { refresh_token: refreshToken },
            { headers: { 'Content-Type': 'application/json' } }
          );

          const newToken = refreshResponse?.data?.data?.access_token;
          if (newToken) {
            setToken('access', newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return http(originalRequest);
          }
        } catch (refreshError) {
          console.error('[HTTP] Token 刷新失败:', refreshError);
          removeTokens();
        }
      }
    }

    // 其他错误
    console.error('[HTTP] 请求错误:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
    });

    return Promise.reject(error);
  }
);

// ==================== 便捷方法 ====================

/**
 * GET 请求
 */
export async function get<T = any>(
  url: string,
  params?: Record<string, any>,
  options?: any
): Promise<ApiResponse<T>> {
  try {
    const response = await http.get<ApiResponse<T>>(url, { params, ...options });
    return response.data;
  } catch (e: any) {
    console.error('[http.get] error:', e?.message, e?.config?.url, 'status:', e?.response?.status);
    throw e;
  }
}

/**
 * POST 请求
 */
export async function post<T = any>(
  url: string,
  data?: any,
  options?: any
): Promise<ApiResponse<T>> {
  const response = await http.post<ApiResponse<T>>(url, data, options);
  return response.data;
}

/**
 * PUT 请求
 */
export async function put<T = any>(
  url: string,
  data?: any,
  options?: any
): Promise<ApiResponse<T>> {
  const response = await http.put<ApiResponse<T>>(url, data, options);
  return response.data;
}

/**
 * DELETE 请求
 */
export async function del<T = any>(
  url: string,
  options?: any
): Promise<ApiResponse<T>> {
  const response = await http.delete<ApiResponse<T>>(url, options);
  return response.data;
}

// ==================== 环境信息导出 ====================

export { getEnv, getAPIConfig, getBaseURL, buildURL } from './config';
