import { request } from '@/services/request';
import type { BlogSettings, CacheClearResult, CacheWarmupResult, CacheStatsResult } from './types';

export async function fetchSettings(admin = false) {
  const url = admin ? '/admin/settings' : '/web/settings';
  return request<BlogSettings>(url);
}

export async function updateSettings(data: Partial<BlogSettings>) {
  return request<void>('/admin/settings', { method: 'PUT', data });
}

export async function sendEmailVerificationCode(emailConfig: {
  host: string; port: string; username: string; password: string; from: string; loginMfaEnabled?: boolean;
}) {
  return request<void>('/admin/settings/email/send-code', { method: 'POST', data: { emailConfig } });
}

export async function verifyEmailVerificationCode(email: string, code: string) {
  return request<void>('/admin/settings/email/verify-code', { method: 'POST', data: { email, code } });
}

export async function fetchHotSearches() {
  return request<string[]>('/web/search/hot');
}

export async function syncMeiliSearch() {
  return request<{ count: number; msg: string }>('/admin/search/sync', { method: 'POST' });
}

// ─── 缓存管理 ────────────────────────────────────────────────

export async function clearCache() {
  return request<CacheClearResult>('/admin/cache/clear', { method: 'POST' });
}

export async function warmupCache() {
  return request<CacheWarmupResult>('/admin/cache/warmup', { method: 'POST' });
}

export async function fetchCacheStats() {
  return request<CacheStatsResult>('/admin/cache/stats');
}
