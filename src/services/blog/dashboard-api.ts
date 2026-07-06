import { request } from '@/services/request';
import type {
  DashboardStats, DashboardDistributionItem, DashboardHeatmapItem,
  VisitorRecord, ErrorLogRecord, ListResponse,
  ArticleReadStat, CategoryReadStat, TagReadStat, ContentTrendItem,
} from './types';

export async function fetchDashboard() {
  return request<{ dashboard: DashboardStats }>('/admin/dashboard');
}

export async function fetchPv(days = 7) {
  return request<Array<{ date: string; pv: number }>>('/admin/dashboard/pv', { params: { days } });
}

export async function fetchTagStatistics() {
  return request<{ list: DashboardDistributionItem[] } | DashboardDistributionItem[]>(
    '/admin/dashboard/tag-statistics',
  );
}

export async function fetchCategoryStatistics() {
  return request<{ list: DashboardDistributionItem[] } | DashboardDistributionItem[]>(
    '/admin/dashboard/category-statistics',
  );
}

export async function fetchArticlePublishHeatmap() {
  return request<{ list: DashboardHeatmapItem[] } | DashboardHeatmapItem[]>('/admin/dashboard/heatmap');
}

export async function fetchTopicStatistics() {
  return request<{ list: DashboardDistributionItem[] } | DashboardDistributionItem[]>(
    '/admin/dashboard/topic-statistics',
  );
}

export async function fetchMpUserGrowth(days = 30) {
  return request<{ list: DashboardHeatmapItem[] } | DashboardHeatmapItem[]>(
    '/admin/dashboard/mp-user-growth',
    { params: { days } },
  );
}

export async function fetchArticleReadStatistics(page = 1, size = 20) {
  return request<ListResponse<ArticleReadStat>>('/admin/dashboard/article-read-statistics', { params: { page, size } });
}

export async function fetchCategoryReadStatistics() {
  return request<CategoryReadStat[]>('/admin/dashboard/category-read-statistics');
}

export async function fetchTagReadStatistics() {
  return request<TagReadStat[]>('/admin/dashboard/tag-read-statistics');
}

export async function fetchContentTrend(days = 30) {
  return request<ContentTrendItem[]>('/admin/dashboard/content-trend', { params: { days } });
}

// ─── 访客记录 ────────────────────────────────────────────────

export async function fetchVisitorRecords(page = 1, size = 10, keyword = '') {
  return request<ListResponse<VisitorRecord>>('/admin/dashboard/visitors', { params: { page, size, keyword } });
}

export async function deleteVisitorRecord(id: number) {
  return request<void>(`/admin/dashboard/visitors/${id}`, { method: 'DELETE' });
}

export async function batchDeleteVisitorRecords(ids: number[]) {
  return request<void>('/admin/dashboard/visitors/batch-delete', { method: 'DELETE', data: { ids } });
}

export async function clearAllVisitorRecords() {
  return request<void>('/admin/dashboard/visitors/clear', { method: 'DELETE' });
}

// ─── 错误日志 ────────────────────────────────────────────────

export async function fetchErrorLogs(page = 1, size = 10, keyword = '') {
  return request<ListResponse<ErrorLogRecord>>('/admin/dashboard/errors', { params: { page, size, keyword } });
}

export async function deleteErrorLog(id: number) {
  return request<void>(`/admin/dashboard/errors/${id}`, { method: 'DELETE' });
}

export async function batchDeleteErrorLogs(ids: number[]) {
  return request<void>('/admin/dashboard/errors/batch-delete', { method: 'DELETE', data: { ids } });
}

export async function clearAllErrorLogs() {
  return request<void>('/admin/dashboard/errors/clear', { method: 'DELETE' });
}

export async function importErrorLogs(logs: Partial<ErrorLogRecord>[]) {
  return request<{ imported: number }>('/admin/dashboard/errors/import', { method: 'POST', data: { logs } });
}

export async function exportErrorLogs() {
  return request<ErrorLogRecord[]>('/admin/dashboard/errors/export');
}
