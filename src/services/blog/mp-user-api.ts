import { request } from '@/services/request';
import type { MPUserSummary, ListResponse } from './types';

export async function fetchMPUsers(params: { page?: number; size?: number; keyword?: string }) {
  return request<ListResponse<MPUserSummary>>('/admin/mp-users', { params });
}