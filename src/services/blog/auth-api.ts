import { request } from '@/services/request';

export async function login(data: { username: string; password: string; code?: string }) {
  return request<{
    accessToken: string;
    refreshToken: string;
    username?: string;
    roleName?: string;
    user?: import('./types').UserItem;
  }>('/auth/login', { method: 'POST', data });
}

export async function sendLoginVerificationCode(data: { username: string; password: string }) {
  return request<{ userId: number }>('/auth/send-verification-code', { method: 'POST', data });
}

export async function changePassword(
  data: { oldPassword: string; newPassword: string },
  options?: { skipErrorHandler?: boolean },
) {
  return request<void>('/user/password', { method: 'POST', data, ...(options || {}) });
}
