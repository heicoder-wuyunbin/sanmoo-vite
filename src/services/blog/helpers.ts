import type { ListResponse } from './types';

/** 解包 { list: T[] } 形式的响应 */
export function unwrapList<T>(payload: { list: T[] } | T[] | ListResponse<T> | undefined): T[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.list)) return payload.list;
  return [];
}

/** 解包分页响应 */
export function unwrapPagedList<T>(
  payload: { list: T[]; page?: number; size?: number; total?: number } | T[] | ListResponse<T> | undefined,
  fallbackPage = 1,
  fallbackSize = 10,
) {
  if (!payload) return { list: [] as T[], page: fallbackPage, size: fallbackSize, total: 0 };
  if (Array.isArray(payload)) return { list: payload, page: fallbackPage, size: fallbackSize, total: payload.length };
  return {
    list: payload.list || [],
    page: (payload as { page?: number }).page || fallbackPage,
    size: (payload as { size?: number }).size || fallbackSize,
    total: (payload as { total?: number }).total || payload.list?.length || 0,
  };
}
