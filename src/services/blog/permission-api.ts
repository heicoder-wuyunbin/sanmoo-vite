import { request } from '@/services/request';
import type { PermissionItem, PermissionTreeNode, ListResponse } from './types';

export async function fetchPermissions(params: {
  page?: number;
  size?: number;
  keyword?: string;
  module?: string;
  type?: string;
}) {
  return request<ListResponse<PermissionItem>>('/admin/permissions', { params });
}

export async function fetchPermissionTree() {
  return request<{ list: PermissionTreeNode[] }>('/admin/permissions/tree');
}

export async function fetchPermission(id: number) {
  return request<PermissionItem>(`/admin/permissions/${id}`);
}

export async function createPermission(data: Partial<PermissionItem>) {
  return request<number>('/admin/permissions', { method: 'POST', data });
}

export async function updatePermission(id: number, data: Partial<PermissionItem>) {
  return request<void>(`/admin/permissions/${id}`, { method: 'PUT', data });
}

export async function deletePermission(id: number) {
  return request<void>(`/admin/permissions/${id}`, { method: 'DELETE' });
}

export async function fetchUserPermissions() {
  return request<{ permKeys: string[] }>('/admin/user/permissions');
}

export async function fetchUserMenus() {
  return request<{ menus: { id: number; permKey: string; name: string; module: string; frontPath: string; icon: string; sortOrder: number }[] }>('/admin/user/menus');
}
