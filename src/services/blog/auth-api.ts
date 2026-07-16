import { request } from '@/services/request';

export async function login(data: { username: string; password: string; code?: string }) {
  return request<{
    accessToken: string;
    refreshToken: string;
    username?: string;
    isAdmin?: boolean;
    user?: import('./types').UserItem;
  }>('/auth/login', { method: 'POST', data });
}

export async function sendLoginVerificationCode(data: { username: string; password: string }) {
  return request<{ userId: number; identifier: string }>('/auth/send-verification-code', { method: 'POST', data });
}

export async function checkMFA(data: { username: string }) {
  return request<{ needMfa: boolean }>('/auth/check-mfa', { method: 'POST', data });
}

export async function changePassword(
  data: { oldPassword: string; newPassword: string },
  options?: { skipErrorHandler?: boolean },
) {
  return request<void>('/user/password', { method: 'POST', data, ...(options || {}) });
}
