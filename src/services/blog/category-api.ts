import { request } from '@/services/request';
import type { CategoryItem, ListResponse } from './types';

export async function fetchCategories(admin = false, params?: { page?: number; size?: number; keyword?: string }) {
  const url = admin ? '/admin/categories' : '/web/categories';
  return request<ListResponse<CategoryItem> | { list: CategoryItem[] }>(url, {
    params: admin ? params : undefined,
  });
}

export async function createCategory(name: string) {
  return request<number>('/admin/categories', { method: 'POST', data: { name } });
}

export async function updateCategory(id: number, name: string) {
  return request<void>(`/admin/categories/${id}`, { method: 'PUT', data: { name } });
}

export async function deleteCategory(id: number) {
  return request<void>(`/admin/categories/${id}`, { method: 'DELETE' });
}

export async function batchDeleteCategories(ids: number[]) {
  return request<void>('/admin/categories/batch-delete', { method: 'DELETE', data: { ids } });
}

export async function fetchCategoryArticles(id: number, params?: { page?: number; size?: number }) {
  return request<ListResponse<import('./types').ArticleItem>>(`/web/categories/${id}/articles`, { params });
}
