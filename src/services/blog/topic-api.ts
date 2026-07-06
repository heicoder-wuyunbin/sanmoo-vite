import { request } from '@/services/request';
import type { TopicItem, ListResponse } from './types';

export async function fetchTopics() {
  return request<ListResponse<TopicItem> | { list: TopicItem[] }>('/admin/topics');
}

export async function createTopic(data: { name: string; description?: string; coverImage?: string; articleIds?: number[] }) {
  return request<number>('/admin/topics', { method: 'POST', data });
}

export async function updateTopic(id: number, data: { name: string; description?: string; coverImage?: string; articleIds?: number[] }) {
  return request<void>(`/admin/topics/${id}`, { method: 'PUT', data });
}

export async function deleteTopic(id: number) {
  return request<void>(`/admin/topics/${id}`, { method: 'DELETE' });
}

export async function batchDeleteTopics(ids: number[]) {
  return request<void>('/admin/topics/batch-delete', { method: 'DELETE', data: { ids } });
}

export async function fetchTopicArticles(id: number) {
  return request<{ articleIds: number[] }>(`/admin/topics/${id}/articles`);
}

// ─── Web 端专题接口 ──────────────────────────────────────────

export async function fetchWebTopics(params: { page?: number; size?: number }) {
  return request<{ page: number; size: number; total: number; list: TopicItem[] }>(`/web/topics`, { params });
}

export async function fetchWebTopicDetail(id: number) {
  return request<{ topic: TopicItem }>(`/web/topics/${id}`);
}

export async function fetchWebTopicArticles(topicId: number, params: { page?: number; size?: number }) {
  return request<{ page: number; size: number; total: number; list: any[] }>(`/web/topics/${topicId}/articles`, { params });
}
