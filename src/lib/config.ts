/**
 * API 配置层 — 环境感知配置
 *
 * 四环境架构：
 * - development: 浏览器 localhost 开发，API 直连 localhost:8009
 * - lan: 手机/平板通过 192.168.31.x 局域网 IP 访问 H5，API 直连当前 hostname:8009
 *        （不走 NodeBabyLink tunnel，因为手机无 tunnel 客户端）
 * - staging: 异地组网设备（100.66.1.x）走 NodeBabyLink tunnel
 * - production: 正式发布，使用线上域名
 */

export const API_CONFIG = {
  // 开发环境（浏览器 localhost 开发）
  development: {
    baseURL: 'http://localhost:8009',
    timeout: 10000,
  },

  // 局域网联调（手机扫码 / 同 LAN 浏览器访问 192.168.31.x）
  // baseURL 为空，getBaseURL 动态拼成 http://{当前 hostname}:8009
  lan: {
    baseURL: '',
    timeout: 15000,
  },

  // 联调环境（异地组网设备）
  // 异地组网设备（100.66.1.x）经 NodeBabyLink 隧道访问本机
  staging: {
    baseURL: '',
    timeout: 15000,
  },

  // 生产环境（正式发布）
  production: {
    baseURL: 'http://api.jiuxin.com',  // TODO: 替换为实际生产域名
    timeout: 15000,
  },
} as const;

// 当前环境
export type EnvType = 'development' | 'lan' | 'staging' | 'production';

export function getEnv(): EnvType {
  if (typeof window === 'undefined') return 'development';

  // 1. 浏览器开发环境（localhost / 127.0.0.1）
  if (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1') {
    return 'development';
  }

  // 3. 局域网联调（手机/平板通过 192.168.x 访问 H5）
  // 关键：手机在同一 LAN 内能直连后端 8009，不应走 NodeBabyLink tunnel
  if (window.location.hostname.includes('192.168.')) {
    return 'lan';
  }

  // 4. 异地组网设备（100.66.x 经 NodeBabyLink 隧道访问）/ preview 域名 → staging
  if (window.location.hostname.includes('100.66.') ||
      window.location.hostname.includes('.preview.')) {
    return 'staging';
  }

  // 5. 公网域名访问（经 nginx 反代）：API 走相对路径
  if (window.location.hostname.includes('.')) {
    return 'lan';
  }

  return 'production';
}

// 获取当前环境的 API 配置
export function getAPIConfig() {
  const env = getEnv();
  return API_CONFIG[env];
}

function isPrivateIP(host: string): boolean {
  return /^127\./.test(host) ||
    /^10\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^100\.66\./.test(host);
}

// 便捷方法：获取 baseURL
export function getBaseURL(): string {
  const cfg = getAPIConfig();
  if (!cfg.baseURL && typeof window !== 'undefined') {
    const host = window.location.hostname;
    // 域名 或 公网 IP：API 走相对路径 → 经 nginx/Next.js rewrite → 后端（避免 CORS）
    if (!/^\d+\.\d+\.\d+\.\d+$/.test(host) || !isPrivateIP(host)) {
      return '';
    }
    // 私有 IP 直连：显式加端口，后端 CORS 已允许
    return `http://${host}:8009`;
  }
  return cfg.baseURL;
}

// 完整 API URL（支持相对路径和绝对路径）
export function buildURL(path: string): string {
  const baseURL = getBaseURL();
  if (path.startsWith('http')) return path;  // 已是绝对路径
  if (baseURL.startsWith('http')) {
    return `${baseURL}${path.startsWith('/') ? '' : '/'}${path}`;
  }
  // 相对路径（开发环境）
  return `${baseURL}${path.startsWith('/') ? '' : '/'}${path}`;
}
