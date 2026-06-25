// API client for mobile — connects to /api/v1
// Auth: reads tokens from localStorage (same key as admin: auth_access_token / auth_refresh_token)

const API_BASE = '/api/v1';

async function getToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_access_token');
}

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = await getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  
  let res = await fetch(`${API_BASE}${url}`, { ...options, headers });
  
  // Refresh on 401
  if (res.status === 401) {
    const refresh = localStorage.getItem('auth_refresh_token');
    if (refresh) {
      const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refresh }),
      });
      if (refreshRes.ok) {
        const data = await refreshRes.json();
        const newToken = data.data?.access_token;
        if (newToken) {
          localStorage.setItem('auth_access_token', newToken);
          headers['Authorization'] = `Bearer ${newToken}`;
          res = await fetch(`${API_BASE}${url}`, { ...options, headers });
        }
      }
    }
  }
  
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export const api = {
  // Auth — login to get tokens
  login: async (email: string, password: string) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data.data?.access_token) {
      localStorage.setItem('auth_access_token', data.data.access_token);
      localStorage.setItem('auth_refresh_token', data.data.refresh_token);
    }
    return data;
  },
  
  // Categories
  getCategories: () => fetchWithAuth('/services/categories'),
  
  // Services — all or by category
  getServices: (params?: { parent_id?: string; status?: number; page?: number; page_size?: number; is_recommend?: boolean }) => {
    const q = new URLSearchParams();
    if (params?.parent_id) q.set('parent_id', params.parent_id);
    if (params?.status !== undefined) q.set('status', String(params.status));
    if (params?.page) q.set('page', String(params.page));
    if (params?.page_size) q.set('page_size', String(params.page_size));
    if (params?.is_recommend !== undefined) q.set('is_recommend', String(params.is_recommend));
    const query = q.toString();
    return fetchWithAuth(`/services${query ? '?' + query : ''}`);
  },
  
  getService: (id: string) => fetchWithAuth(`/services/${id}`),
};
