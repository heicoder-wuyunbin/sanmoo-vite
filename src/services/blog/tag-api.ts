import { request } from '@/services/request';
import type { TagItem, ListResponse } from './types';

export async function fetchTags(admin = false, params?: { page?: number; size?: number; keyword?: string }) {
  const url = admin ? '/admin/tags' : '/web/tags';
  return request<ListResponse<TagItem> | { list: TagItem[] }>(url, {
    params: admin ? params : undefined,
  });
}

export async function createTag(name: string) {
  return request<number>('/admin/tags', { method: 'POST', data: { name } });
}

export async function updateTag(id: number, name: string) {
  return request<void>(`/admin/tags/${id}`, { method: 'PUT', data: { name } });
}

export async function deleteTag(id: number) {
  return request<void>(`/admin/tags/${id}`, { method: 'DELETE' });
}

export async function batchDeleteTags(ids: number[]) {
  return request<void>('/admin/tags/batch-delete', { method: 'DELETE', data: { ids } });
}

export async function fetchTagArticles(id: number, params?: { page?: number; size?: number }) {
  return request<ListResponse<import('./types').ArticleItem>>(`/web/tags/${id}/articles`, { params });
}
