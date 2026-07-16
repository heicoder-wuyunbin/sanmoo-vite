/**
 * API 统一出口（barrel re-export）
 *
 * 所有页面统一从此文件导入，内部按领域拆分到各模块文件：
 *   - types.ts         共享类型
 *   - auth-api.ts      认证相关
 *   - article-api.ts   文章相关
 *   - category-api.ts  分类相关
 *   - tag-api.ts       标签相关
 *   - topic-api.ts     专题相关
 *   - user-api.ts      后台用户管理
 *   - dashboard-api.ts 仪表盘 & 日志
 *   - settings-api.ts  配置 & 缓存 & 搜索
 *   - file-api.ts      文件管理
 *   - mp-user-api.ts   小程序用户管理
 *   - helpers.ts       响应解包工具
 */

// ─── 类型 ────────────────────────────────────────────────────
export type {
  ArticleItem, ArticleDetail, WebArticleDetail, ArticleOption, TOCItem,
  TagItem, CategoryItem, TopicItem, UserItem,
  BlogSettings, DashboardStats, DashboardDistributionItem, DashboardHeatmapItem,
  VisitorRecord, ErrorLogRecord, FileItem,
  ArchiveItem, ArchiveArticleItem,
  CacheClearResult, CacheWarmupResult, CacheStatsResult,
  MPUserSummary, MPUserTag, MPUserInterest, ProfileDimension,
  MPUserProfile, RadarData, MPUserDetail,
  ListResponse,
  ArticleReadStat, CategoryReadStat, TagReadStat, ContentTrendItem,
} from './types';

// ─── 认证 ────────────────────────────────────────────────────
export { login, sendLoginVerificationCode, checkMFA, changePassword } from './auth-api';

// ─── 文章 ────────────────────────────────────────────────────
export {
  fetchArticles, fetchArticleDetail, fetchAdminArticleDetail,
  createArticle, updateArticle, updateArticleStatus, batchUpdateArticleStatus,
  deleteArticle, batchDeleteArticles, fetchPublishedArticleOptions, fetchArchives,
  fetchRelatedArticles, fetchHotArticles, likeArticle, fetchRandomArticle,
  downloadArticlesCSV,
} from './article-api';

// ─── 分类 ────────────────────────────────────────────────────
export {
  fetchCategories, createCategory, updateCategory,
  deleteCategory, batchDeleteCategories, fetchCategoryArticles,
} from './category-api';

// ─── 标签 ────────────────────────────────────────────────────
export {
  fetchTags, createTag, updateTag,
  deleteTag, batchDeleteTags, fetchTagArticles,
} from './tag-api';

// ─── 专题 ────────────────────────────────────────────────────
export {
  fetchTopics, createTopic, updateTopic,
  deleteTopic, batchDeleteTopics, fetchTopicArticles,
  fetchWebTopics, fetchWebTopicDetail, fetchWebTopicArticles,
} from './topic-api';

// ─── 用户管理 ────────────────────────────────────────────────
export {
  updateUserPassword,
} from './user-api';

// ─── 仪表盘 & 日志 ───────────────────────────────────────────
export {
  fetchDashboard, fetchPv, fetchTagStatistics, fetchCategoryStatistics,
  fetchArticlePublishHeatmap, fetchTopicStatistics, fetchMpUserGrowth,
  fetchArticleReadStatistics, fetchCategoryReadStatistics, fetchTagReadStatistics, fetchContentTrend,
  fetchVisitorRecords, deleteVisitorRecord, batchDeleteVisitorRecords, clearAllVisitorRecords,
  fetchErrorLogs, deleteErrorLog, batchDeleteErrorLogs, clearAllErrorLogs,
  importErrorLogs, exportErrorLogs,
} from './dashboard-api';

// ─── 配置 & 缓存 & 搜索 ──────────────────────────────────────
export {
  fetchSettings, updateSettings,
  sendEmailVerificationCode, verifyEmailVerificationCode,
  fetchHotSearches, syncMeiliSearch,
} from './settings-api';

// ─── 文件 ────────────────────────────────────────────────────
export { uploadAdminFile, fetchAdminFiles, deleteAdminFile } from './file-api';

// ─── 小程序用户 ──────────────────────────────────────────────
export {
  fetchMPUsers,
} from './mp-user-api';

// ─── 友情链接 ────────────────────────────────────────────────
export {
  fetchLinks, fetchActiveLinks, createLink, updateLink,
  deleteLink, batchDeleteLinks,
} from './link-api';
export type { LinkItem, LinkCreateRequest, LinkUpdateRequest } from './link-api';

// ─── 工具函数 ────────────────────────────────────────────────
export { unwrapList, unwrapPagedList } from './helpers';
