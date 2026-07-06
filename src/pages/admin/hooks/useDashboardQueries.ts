import { useQuery } from '@tanstack/react-query';
import {
  fetchArticlePublishHeatmap,
  fetchArticleReadStatistics,
  fetchCategoryStatistics,
  fetchCategoryReadStatistics,
  fetchContentTrend,
  fetchDashboard,
  fetchMpUserGrowth,
  fetchPv,
  fetchTagReadStatistics,
  fetchTagStatistics,
  fetchTopicStatistics,
  type DashboardStats,
  unwrapList,
} from '@/services/blog/api';

/** 通用：{ name, value } 分布数据 */
export type DistributionData = { name: string; value: number };

/** 通用：{ date, count } 时间序列数据 */
export type TimeSeriesData = { date: string; count: number };

// ─── 仪表盘概览 + PV ──────────────────────────────────────────

export function useDashboardOverview() {
  return useQuery({
    queryKey: ['dashboardData'],
    queryFn: async () => {
      const [statsRes, pvRes] = await Promise.all([
        fetchDashboard(),
        fetchPv(7),
      ]);

      const stats: DashboardStats =
        statsRes.data?.dashboard ?? (statsRes.data as unknown as DashboardStats);

      const rawPvList = Array.isArray(pvRes.data)
        ? (pvRes.data as Array<{ date: string; pv?: number; count?: number }>)
        : ((pvRes.data as { list?: Array<{ date: string; pv?: number; count?: number }> })?.list ?? []);

      const pvList: TimeSeriesData[] = rawPvList.map((item) => ({
        date: item.date,
        count: item.count ?? item.pv ?? 0,
      }));

      return { stats, pvList };
    },
  });
}

// ─── 分类统计 ──────────────────────────────────────────────────

export function useCategoryStats() {
  return useQuery({
    queryKey: ['categoryStats'],
    queryFn: async (): Promise<DistributionData[]> => {
      const res = await fetchCategoryStatistics();
      return unwrapList(res.data).map((item) => ({
        name: item.name,
        value: Number(item.value ?? 0),
      }));
    },
  });
}

// ─── 标签统计 ──────────────────────────────────────────────────

export function useTagStats() {
  return useQuery({
    queryKey: ['tagStats'],
    queryFn: async (): Promise<DistributionData[]> => {
      const res = await fetchTagStatistics();
      return unwrapList(res.data).map((item) => ({
        name: item.name,
        value: Number(item.value ?? 0),
      }));
    },
  });
}

// ─── 文章发布热力图 ────────────────────────────────────────────

export function useHeatmapData() {
  return useQuery({
    queryKey: ['heatmapData'],
    queryFn: async (): Promise<TimeSeriesData[]> => {
      const res = await fetchArticlePublishHeatmap();
      return unwrapList(res.data).map((item) => ({
        date: item.date,
        count: Number(item.count ?? 0),
      }));
    },
  });
}

// ─── 专题文章分布 ──────────────────────────────────────────────

export function useTopicDist() {
  return useQuery({
    queryKey: ['topicDistData'],
    queryFn: async (): Promise<DistributionData[]> => {
      const res = await fetchTopicStatistics();
      return unwrapList(res.data).map((item) => ({
        name: item.name,
        value: Number(item.value ?? 0),
      }));
    },
  });
}

// ─── 微信用户增长 ──────────────────────────────────────────────

export function useMpUserGrowth(days = 30) {
  return useQuery({
    queryKey: ['mpUserGrowthData', days],
    queryFn: async (): Promise<TimeSeriesData[]> => {
      const res = await fetchMpUserGrowth(days);
      return unwrapList(res.data).map((item) => ({
        date: item.date,
        count: Number(item.count ?? 0),
      }));
    },
  });
}

// ─── 文章阅读量统计 ────────────────────────────────────────────

export function useArticleReadStatistics(page = 1, size = 20) {
  return useQuery({
    queryKey: ['articleReadStatistics', page, size],
    queryFn: async () => {
      const res = await fetchArticleReadStatistics(page, size);
      return res.data;
    },
  });
}

// ─── 分类阅读量统计 ────────────────────────────────────────────

export function useCategoryReadStatistics() {
  return useQuery({
    queryKey: ['categoryReadStatistics'],
    queryFn: async () => {
      const res = await fetchCategoryReadStatistics();
      return res.data;
    },
  });
}

// ─── 标签阅读量统计 ────────────────────────────────────────────

export function useTagReadStatistics() {
  return useQuery({
    queryKey: ['tagReadStatistics'],
    queryFn: async () => {
      const res = await fetchTagReadStatistics();
      return res.data;
    },
  });
}

// ─── 内容热度趋势 ──────────────────────────────────────────────

export function useContentTrend(days = 30) {
  return useQuery({
    queryKey: ['contentTrend', days],
    queryFn: async () => {
      const res = await fetchContentTrend(days);
      return res.data;
    },
  });
}
