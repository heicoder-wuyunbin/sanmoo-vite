/**
 * 全局共享类型定义
 * 所有 API 接口的 TypeScript 类型集中管理。
 */

// ─── 通用 ────────────────────────────────────────────────────

export type ListResponse<T> = {
  page: number;
  size: number;
  total: number;
  list: T[];
};

// ─── 文章 ────────────────────────────────────────────────────

export type ArticleItem = {
  id: number;
  title: string;
  slug?: string; // SEO 友好 URL 别名
  titleImage?: string;
  description?: string;
  content?: string;
  createTime: string;
  updateTime?: string;
  readNum: number;
  likeNum?: number;
  isTop: boolean;
  isPublished: boolean;
  publishTime?: string; // 定时发布时间
  categoryId?: number;
  categoryName?: string;
  tags: { id: number; name: string }[];
  topics?: { id: number; name: string }[];
};

export type ArticleDetail = ArticleItem & {
  contentHtml?: string;
  prevArticle?: { id: number; title: string };
  nextArticle?: { id: number; title: string };
};

export type TOCItem = {
  level: number;
  text: string;
  id: string;
};

export type WebArticleDetail = {
  article: ArticleItem;
  contentHtml?: string;
  toc?: TOCItem[];
  prevArticle?: ArticleItem;
  nextArticle?: ArticleItem;
};

export type ArticleOption = {
  id: number;
  title: string;
};

// ─── 分类 & 标签 ─────────────────────────────────────────────

export type TagItem = {
  id: number;
  name: string;
  articleCount: number;
};

export type CategoryItem = {
  id: number;
  name: string;
  articleCount: number;
};

// ─── 专题 ────────────────────────────────────────────────────

export type TopicItem = {
  id: number;
  title: string;
  description: string;
  cover: string;
  createTime: string;
  articleCount: number;
};

// ─── 用户 ────────────────────────────────────────────────────

export type UserItem = {
  id: number;
  username: string;
  email?: string;
  status?: string;
  roleId?: number;
  roleName?: string;
  createTime?: string;
  updateTime?: string;
};

// ─── 配置 ────────────────────────────────────────────────────

export type BlogSettings = {
  coreConfig: {
        blogName: string;
        author: string;
        introduction: string;
        avatar: string;
        poster: string;
        privacyPolicy?: string;
        rssEnabled?: boolean;
      };
  uiConfig: {
    githubHome: string;
    csdnHome: string;
    giteeHome: string;
    zhihuHome: string;
    githubShow: boolean;
    csdnShow: boolean;
    giteeShow: boolean;
    zhihuShow: boolean;
    recommendStrategy: 'rule' | 'weighted' | 'cf';
    searchEngine: 'NONE' | 'MEILISEARCH';
    hotSearchMode: boolean;
    hotSearchWords: string;
    meilisearchHost: string;
    meilisearchApiKey: string;
    meilisearchIndex: string;
  };
  storageConfig?: {
    uploadStrategy: string;
    uploadLocalDir: string;
    uploadLocalUrlPrefix: string;
    uploadQiniuBucket: string;
    uploadQiniuDomain: string;
    uploadAliyunEndpoint: string;
    uploadAliyunBucket: string;
    uploadAliyunDomain: string;
  };
  emailConfig?: {
    host: string;
    port: string;
    username: string;
    password: string;
    from: string;
    loginMfaEnabled?: boolean;
  };
};

// ─── 仪表盘 ──────────────────────────────────────────────────

export type DashboardStats = {
  articleCount: number;
  publishedArticleCount: number;
  unpublishedArticleCount?: number;
  categoryCount: number;
  tagCount: number;
  userCount: number;
  visitorCount: number;
  todayPv: number;
  topicCount: number;
  mpUserCount: number;
  totalReads: number;
  yesterdayPv: number;
  todayMpUserCount: number;
  yesterdayMpUserCount: number;
};

export type DashboardDistributionItem = {
  name: string;
  value: number;
};

export type DashboardHeatmapItem = {
  date: string;
  count: number;
};

export type ArticleReadStat = {
  id: number;
  title: string;
  readNum: number;
  categoryId: number;
  category: string;
  createTime: string;
};

export type CategoryReadStat = {
  id: number;
  name: string;
  articleCount: number;
  totalReads: number;
};

export type TagReadStat = {
  id: number;
  name: string;
  articleCount: number;
  totalReads: number;
};

export type ContentTrendItem = {
  date: string;
  totalPv: number;
  articlePv: number;
  newArticles: number;
};

// ─── 日志 ────────────────────────────────────────────────────

export type VisitorRecord = {
  id: number;
  traceId: string;
  requestMethod: string;
  requestUrl: string;
  visitorUserId: number;
  visitorName: string;
  ipAddress: string;
  visitTime: string;
  responseTime: number;
  responseStatus: number;
  requestSource: string;
  isError: boolean;
  userAgent?: string;
  requestParams?: string;
  requestBody?: string;
  responseBody?: string;
};

export type ErrorLogRecord = {
  id: number;
  accessLogId: number;
  traceId: string;
  errorCode: string;
  errorMessage: string;
  errorDetail: string;
  stackTrace: string;
  requestUrl: string;
  requestMethod: string;
  requestParams: string;
  requestBody: string;
  responseBody: string;
  ipAddress: string;
  userAgent: string;
  createTime: string;
};

// ─── 文件 ────────────────────────────────────────────────────

export type FileItem = {
  id: number;
  filename: string;
  size: number;
  lastModified: string;
  path: string;
};

// ─── 归档 ────────────────────────────────────────────────────

export type ArchiveArticleItem = {
  id: number;
  title: string;
  createTime: string;
};

export type ArchiveItem = {
  month: string;
  items: ArchiveArticleItem[];
};

// ─── 缓存 ────────────────────────────────────────────────────

export type CacheClearResult = { cleared: number };

export type CacheWarmupResult = {
  articles: number;
  categories: number;
  tags: number;
  dashboard: boolean;
  settings: boolean;
  archives: boolean;
  hotSearches: boolean;
  message: string;
};

export type CacheStatsResult = {
  data: {
    totalKeys: number;
    prefixCounts: Record<string, number>;
    memoryUsed: string;
  };
};

// ─── 小程序用户 ──────────────────────────────────────────────

export type MPUserSummary = {
  id: number;
  openid: string;
  nickname: string;
  avatar: string;
  status: number;
  firstLoginTime: string;
  lastLoginTime: string;
  tagCount: number;
  viewCount: number;
  favoriteCount: number;
  createTime: string;
};

export type MPUserTag = {
  id: number;
  tagName: string;
  tagCategory: string;
  score: number;
  source: string;
  createTime: string;
};

export type MPUserInterest = {
  dimensionType: string;
  dimensionId: number;
  dimensionName: string;
  score: number;
};

export type ProfileDimension = {
  dimension: string;
  score: number;
};

export type MPUserProfile = {
  dimensions: ProfileDimension[];
  updatedAt?: string;
};

export type RadarData = {
  tags: MPUserTag[];
  interests: MPUserInterest[];
  profile: MPUserProfile | null;
};

export type MPUserDetail = {
  id: number;
  openid: string;
  nickname: string;
  avatar: string;
  status: number;
  firstLoginTime: string;
  lastLoginTime: string;
  viewCount: number;
  favoriteCount: number;
  totalStaySeconds: number;
  tags: MPUserTag[];
  interests: MPUserInterest[];
  profile: MPUserProfile | null;
  createTime: string;
};

// ─── 权限 & 角色 ─────────────────────────────────────────────

export type PermissionItem = {
  id: number;
  permKey: string;
  name: string;
  module: string;
  type: 'api' | 'menu' | 'button';
  description?: string;
  sortOrder: number;
  status: number;
  createTime: string;
  updateTime: string;
};

export type PermissionTreeNode = {
  module: string;
  moduleName: string;
  children: PermissionItem[];
};

export type RoleItem = {
  id: number;
  name: string;
  description?: string;
  status: number;
  sortOrder: number;
  createTime: string;
  updateTime: string;
};
