import { request } from '@/services/request';
import type {
  BlogSettings,
  CacheClearResult,
  CacheWarmupResult,
  CacheStatsResult,
  CoreConfig,
  PrivacyConfig,
  ComplianceInfo,
  SocialConfig,
  SearchConfig,
  StorageConfig,
  EmailConfig,
  WechatConfig,
} from './types';

export async function fetchSettings(admin = false) {
  const url = admin ? '/admin/settings' : '/web/settings';
  return request<BlogSettings>(url);
}

export async function updateSettings(data: Partial<BlogSettings>) {
  return request<void>('/admin/settings', { method: 'PUT', data });
}

export async function fetchCoreConfig() {
  return request<CoreConfig>('/admin/settings/core');
}

export async function updateCoreConfig(data: Partial<CoreConfig>) {
  return request<void>('/admin/settings/core', { method: 'PUT', data });
}

export async function fetchPrivacyConfig() {
  return request<PrivacyConfig>('/admin/settings/privacy');
}

export async function updatePrivacyConfig(data: Partial<PrivacyConfig>) {
  return request<void>('/admin/settings/privacy', { method: 'PUT', data });
}

export async function fetchSocialConfig() {
  return request<SocialConfig>('/admin/settings/social');
}

export async function updateSocialConfig(data: Partial<SocialConfig>) {
  return request<void>('/admin/settings/social', { method: 'PUT', data });
}

export async function fetchSearchConfig() {
  return request<SearchConfig>('/admin/settings/search');
}

export async function updateSearchConfig(data: Partial<SearchConfig>) {
  return request<void>('/admin/settings/search', { method: 'PUT', data });
}

export async function fetchStorageConfig() {
  return request<StorageConfig>('/admin/settings/storage');
}

export async function updateStorageConfig(data: Partial<StorageConfig>) {
  return request<void>('/admin/settings/storage', { method: 'PUT', data });
}

export async function fetchEmailConfig() {
  return request<EmailConfig>('/admin/settings/email');
}

export async function updateEmailConfig(data: Partial<EmailConfig>) {
  return request<void>('/admin/settings/email', { method: 'PUT', data });
}

export async function sendEmailVerificationCode(emailConfig: {
  host: string; port: string; username: string; password: string; from: string; loginMfaEnabled?: boolean;
}) {
  return request<{ identifier: string }>('/admin/settings/email/send-code', { method: 'POST', data: { emailConfig } });
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

export async function fetchMeiliSearchStats() {
  return request<{ articleCount: number; indexStatus: string; lastSyncTime: string }>('/admin/search/stats');
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

export async function fetchWebCompliance() {
  return request<ComplianceInfo>('/web/compliance');
}

export async function fetchWechatConfig() {
  return request<WechatConfig>('/admin/settings/wechat');
}

export async function updateWechatConfig(data: Partial<WechatConfig>) {
  return request<void>('/admin/settings/wechat', { method: 'PUT', data });
}
