import { request } from '@/services/request';
import type {
  MPUserSummary, MPUserDetail, MPUserProfile, MPUserTag, RadarData, ListResponse,
} from './types';

export async function fetchMPUsers(params: { page?: number; size?: number; keyword?: string; tagName?: string }) {
  return request<ListResponse<MPUserSummary>>('/admin/mp-users', { params });
}

export async function fetchMPUserDetail(openid: string) {
  return request<MPUserDetail>(`/admin/mp-users/${openid}`);
}

export async function fetchMPUserProfile(openid: string) {
  return request<MPUserProfile>(`/admin/mp-users/${openid}/profile`);
}

export async function generateMPUserProfile(openid: string) {
  return request<MPUserProfile>(`/admin/mp-users/${openid}/profile`, { method: 'POST' });
}

export async function generateMPUserTags(openid: string) {
  return request<MPUserTag[]>(`/admin/mp-users/${openid}/tags/generate`, { method: 'POST' });
}

export async function refreshRadar(openid: string) {
  return request<RadarData>(`/admin/mp-users/${openid}/radar/refresh`, { method: 'POST' });
}

export async function deleteMPUserTag(openid: string, tagId: number) {
  return request<void>(`/admin/mp-users/${openid}/tags/${tagId}`, { method: 'DELETE' });
}
