import { request } from '@/services/request';
import { getAccessToken } from '@/utils/auth';
import type { ArticleItem, ArticleDetail, ArticleOption, ListResponse, WebArticleDetail } from './types';

export async function fetchArticles(params: {
  page?: number;
  size?: number;
  keyword?: string;
  categoryId?: number;
  tagId?: number;
  isPublished?: number;
  admin?: boolean;
}) {
  const { admin, ...rest } = params;
  const url = admin ? '/admin/articles' : '/web/articles';
  return request<ListResponse<ArticleItem>>(url, { params: rest });
}

export async function fetchArticleDetail(id: number) {
  return request<WebArticleDetail>(`/web/articles/${id}`);
}

export async function fetchAdminArticleDetail(id: number) {
  return request<{ article?: ArticleDetail }>(`/admin/articles/${id}`);
}

export async function createArticle(data: {
  title: string;
  titleImage?: string;
  description: string;
  content: string;
  categoryId?: number;
  tagIds?: number[];
  topicIds?: number[];
  isTop?: number;
  isPublished?: number;
}) {
  return request<number>('/admin/articles', { method: 'POST', data });
}

export async function updateArticle(
  id: number,
  data: Partial<{
    title: string;
    titleImage?: string;
    description: string;
    content: string;
    categoryId?: number;
    tagIds?: number[];
    topicIds?: number[];
    isTop?: number;
    isPublished?: number;
  }>,
) {
  return request<void>(`/admin/articles/${id}`, { method: 'PUT', data });
}

export async function updateArticleStatus(id: number, data: { isPublished?: boolean; isTop?: boolean }) {
  return request<void>(`/admin/articles/${id}/status`, { method: 'PUT', data });
}

export async function batchUpdateArticleStatus(ids: number[], data: { isPublished?: boolean; isTop?: boolean }) {
  return request<void>('/admin/articles/batch-status', { method: 'PUT', data: { ids, ...data } });
}

export async function deleteArticle(id: number) {
  return request<void>(`/admin/articles/${id}`, { method: 'DELETE' });
}

export async function batchDeleteArticles(ids: number[]) {
  return request<void>('/admin/articles/batch-delete', { method: 'DELETE', data: { ids } });
}

export async function fetchPublishedArticleOptions() {
  return request<ListResponse<ArticleOption>>('/admin/articles/published-options');
}

export async function fetchArchives() {
  return request<{ list: import('./types').ArchiveItem[] }>('/web/archives');
}

export async function fetchRelatedArticles(id: number, size?: number) {
  return request<ArticleItem[]>(`/web/articles/${id}/related`, { params: { size } });
}

export async function fetchHotArticles(limit?: number) {
  return request<ArticleItem[]>(`/web/articles/hot`, { params: { limit } });
}

export async function likeArticle(id: number) {
  return request<{ likeNum: number }>(`/web/articles/${id}/like`, { method: 'POST' });
}

export async function fetchRandomArticle(excludeId?: number) {
  return request<ArticleItem>(`/web/articles/random`, { params: { exclude: excludeId } });
}

export async function downloadArticlesCSV(keyword?: string) {
  const token = getAccessToken();
  const params = new URLSearchParams();
  if (keyword) params.append('keyword', keyword);
  const qs = params.toString();
  const url = `/api/admin/articles/export${qs ? `?${qs}` : ''}`;
  try {
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText || `导出失败 (HTTP ${res.status})`);
    }
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const json = await res.json();
      if (!json.success) {
        throw new Error(json.errorMessage || '导出失败');
      }
    }
    const blob = await res.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `articles_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  } catch (err) {
    const msg = err instanceof Error ? err.message : '导出失败';
    // 使用 antd message 提示错误
    import('antd').then(({ message }) => message.error(msg));
    console.error('导出 CSV 失败:', err);
  }
}
