import { request } from '@/services/request';
import type { UserItem, ListResponse } from './types';

export async function fetchUsers(params: { page?: number; size?: number; keyword?: string }) {
  return request<ListResponse<UserItem>>('/admin/users', { params });
}

export async function createUser(data: { username: string; password: string; email?: string }) {
  return request<number>('/admin/users', { method: 'POST', data });
}

export async function updateUser(id: number, data: { username?: string; password?: string; email?: string }) {
  return request<void>(`/admin/users/${id}`, { method: 'PUT', data });
}

export async function deleteUser(id: number) {
  return request<void>(`/admin/users/${id}`, { method: 'DELETE' });
}

export async function batchDeleteUsers(ids: number[]) {
  return request<void>('/admin/users/batch-delete', { method: 'DELETE', data: { ids } });
}

export async function toggleUserStatus(id: number) {
  return request<void>(`/admin/users/${id}/status`, { method: 'PUT' });
}

export async function updateUserPassword(
  id: number,
  data: string | { password?: string; oldPassword?: string; newPassword?: string },
) {
  const payload =
    typeof data === 'string'
      ? { password: data }
      : { password: data.password ?? data.newPassword, oldPassword: data.oldPassword, newPassword: data.newPassword };
  return request<void>(`/admin/users/${id}/password`, { method: 'PUT', data: payload });
}
