import { getAccessToken, getRefreshToken, setAuth, clearAuth, getCurrentUser } from '@/utils/auth';
import { useAuthStore } from '@/store/useAuthStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export interface RequestConfig {
  method?: string;
  headers?: Record<string, string>;
  data?: any;
  params?: Record<string, any>;
  requestType?: string;
  _retry?: boolean;
}

export interface Result<T> {
  success: boolean;
  data: T;
  errorCode?: string;
  errorMessage?: string;
}

export type RequestError = Error & {
  errorCode?: string;
  errorMessage?: string;
};

function buildUrl(url: string, params?: Record<string, any>): string {
  const baseUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
  if (!params) return baseUrl;
  
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

function handleRequestData(data: any, requestType?: string): any {
  if (requestType === 'form' || data instanceof FormData) {
    return data;
  }
  return JSON.stringify(data);
}

function handleHeaders(headers: Record<string, string> = {}, requestType?: string): Record<string, string> {
  const newHeaders = { ...headers };
  if (!newHeaders['Content-Type'] && requestType !== 'form') {
    newHeaders['Content-Type'] = 'application/json';
  }
  return newHeaders;
}

function redirectToLogin(): void {
  clearAuth();
  useAuthStore.getState().clearAuthInfo();
  if (window.location.pathname.startsWith('/admin')) {
    window.location.href = `/user/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
  }
}

let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (error: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

export async function request<T>(url: string, config: RequestConfig = {}): Promise<Result<T>> {
  const { method = 'GET', headers: configHeaders = {}, data, params, requestType } = config;
  
  const fullUrl = buildUrl(url, params);
  const headers = handleHeaders(configHeaders, requestType);
  
  const token = getAccessToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  const requestOptions: RequestInit = {
    method,
    headers,
  };
  
  if (method !== 'GET' && method !== 'HEAD' && data) {
    requestOptions.body = handleRequestData(data, requestType);
  }
  
  try {
    let response = await fetch(fullUrl, requestOptions);
    
    if (response.status === 401 && !config._retry) {
      if (isRefreshing) {
        try {
          const newToken = await new Promise<string>((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          });
          headers.Authorization = `Bearer ${newToken}`;
          requestOptions.headers = headers;
          response = await fetch(fullUrl, requestOptions);
        } catch (err) {
          throw new Error('UNAUTHORIZED');
        }
      } else {
        config._retry = true;
        isRefreshing = true;
        const refreshToken = getRefreshToken();
        
        if (!refreshToken) {
          isRefreshing = false;
          redirectToLogin();
          throw new Error('UNAUTHORIZED');
        }

        try {
          const refreshUrl = buildUrl('/auth/refresh');
          const refreshRes = await fetch(refreshUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          });

          if (!refreshRes.ok) {
            throw new Error('Refresh failed');
          }

          const refreshData = await refreshRes.json();
          if (!refreshData.success) {
            throw new Error(refreshData.errorMessage || 'Refresh failed');
          }

          const { accessToken: newAccess, refreshToken: newRefresh } = refreshData.data;
          const user = getCurrentUser();
          if (user) {
            setAuth(newAccess, newRefresh, user);
            useAuthStore.getState().setAuthInfo(newAccess, newRefresh, user);
          }
          
          processQueue(null, newAccess);
          
          headers.Authorization = `Bearer ${newAccess}`;
          requestOptions.headers = headers;
          response = await fetch(fullUrl, requestOptions);
        } catch (err) {
          processQueue(err, null);
          redirectToLogin();
          throw new Error('UNAUTHORIZED');
        } finally {
          isRefreshing = false;
        }
      }
    } else if (response.status === 401) {
      redirectToLogin();
      throw new Error('UNAUTHORIZED');
    }
    
    const result = await response.json();
    if (!result.success) {
      const requestError = new Error(result.errorMessage || '请求失败') as RequestError;
      requestError.name = 'RequestError';
      requestError.errorCode = result.errorCode;
      requestError.errorMessage = result.errorMessage;
      throw requestError;
    }
    
    return result;
  } catch (error) {
    console.error('请求错误:', error);
    throw error;
  }
}

export const get = <T>(url: string, config?: RequestConfig) => request<T>(url, { ...config, method: 'GET' });
export const post = <T>(url: string, config?: RequestConfig) => request<T>(url, { ...config, method: 'POST' });
export const put = <T>(url: string, config?: RequestConfig) => request<T>(url, { ...config, method: 'PUT' });
export const del = <T>(url: string, config?: RequestConfig) => request<T>(url, { ...config, method: 'DELETE' });
