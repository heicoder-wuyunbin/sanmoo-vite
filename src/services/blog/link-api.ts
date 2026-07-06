import { get, post, put, del } from '@/services/request';
import type { ListResponse } from './types';

export interface LinkItem {
  id: number;
  name: string;
  url: string;
  description: string;
  icon: string;
  sortOrder: number;
  isActive: boolean;
  createTime: string;
  updateTime: string;
}

export interface LinkCreateRequest {
  name: string;
  url: string;
  description?: string;
  icon?: string;
  sortOrder?: number;
}

export interface LinkUpdateRequest {
  name: string;
  url: string;
  description?: string;
  icon?: string;
  sortOrder?: number;
  isActive: boolean;
}

export const fetchLinks = (params?: { page?: number; size?: number; keyword?: string }) => {
  return get<ListResponse<LinkItem>>('/admin/links', { params });
};

export const fetchActiveLinks = () => {
  return get<LinkItem[]>('/web/links');
};

export const createLink = (data: LinkCreateRequest) => {
  return post('/admin/links', { data });
};

export const updateLink = (id: number, data: LinkUpdateRequest) => {
  return put(`/admin/links/${id}`, { data });
};

export const deleteLink = (id: number) => {
  return del(`/admin/links/${id}`);
};

export const batchDeleteLinks = (ids: number[]) => {
  return del('/admin/links/batch-delete', { data: { ids } });
};