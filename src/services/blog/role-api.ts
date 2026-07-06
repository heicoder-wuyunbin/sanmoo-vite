import { request } from '@/services/request';
import type { RoleItem, ListResponse } from './types';

export async function fetchRoles(params: { page?: number; size?: number; keyword?: string }) {
  return request<ListResponse<RoleItem>>('/admin/roles', { params });
}

export async function fetchAllRoles() {
  return request<ListResponse<RoleItem>>('/admin/roles/all');
}

export async function fetchRole(id: number) {
  return request<RoleItem>(`/admin/roles/${id}`);
}

export async function createRole(data: Partial<RoleItem>) {
  return request<number>('/admin/roles', { method: 'POST', data });
}

export async function updateRole(id: number, data: Partial<RoleItem>) {
  return request<void>(`/admin/roles/${id}`, { method: 'PUT', data });
}

export async function deleteRole(id: number) {
  return request<void>(`/admin/roles/${id}`, { method: 'DELETE' });
}

export async function fetchRolePermissions(id: number) {
  return request<{ permKeys: string[] }>(`/admin/roles/${id}/permissions`);
}

export async function assignRolePermissions(id: number, permKeys: string[]) {
  return request<void>(`/admin/roles/${id}/permissions`, { method: 'PUT', data: { permKeys } });
}

export async function assignUserRoles(userId: number, roleIds: number[]) {
  return request<void>(`/admin/users/${userId}/roles`, { method: 'PUT', data: { roleIds } });
}
