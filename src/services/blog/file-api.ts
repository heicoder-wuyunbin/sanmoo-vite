import { request } from '@/services/request';
import type { FileItem } from './types';

export async function uploadAdminFile(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return request<{ url: string; size: number }>(
    '/admin/files/upload',
    { method: 'POST', data: formData, requestType: 'form' },
  );
}

export async function fetchAdminFiles(params?: { page?: number; size?: number; keyword?: string }) {
  return request<{ page: number; size: number; total: number; list: FileItem[] }>(
    '/admin/files',
    { params },
  );
}

export async function deleteAdminFile(id: number) {
  return request<void>(`/admin/files/${id}`, { method: 'DELETE' });
}
