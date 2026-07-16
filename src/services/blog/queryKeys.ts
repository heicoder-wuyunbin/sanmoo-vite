export const queryKeys = {
  all: ['admin'] as const,

  tags: () => [...queryKeys.all, 'tags'] as const,
  tagList: (params: { page?: number; size?: number; keyword?: string }) =>
    [...queryKeys.tags(), 'list', params.page, params.size, params.keyword] as const,

  categories: () => [...queryKeys.all, 'categories'] as const,
  categoryList: (params: { page?: number; size?: number; keyword?: string }) =>
    [...queryKeys.categories(), 'list', params.page, params.size, params.keyword] as const,

  topics: () => [...queryKeys.all, 'topics'] as const,
  topicList: () => [...queryKeys.topics(), 'list'] as const,

  mpUsers: () => [...queryKeys.all, 'mp-users'] as const,
  mpUserList: (params: { page?: number; size?: number; keyword?: string }) =>
    [...queryKeys.mpUsers(), 'list', params.page, params.size, params.keyword] as const,

  links: () => [...queryKeys.all, 'links'] as const,
  linkList: (params: { page?: number; size?: number; keyword?: string }) =>
    [...queryKeys.links(), 'list', params.page, params.size, params.keyword] as const,

  articles: () => [...queryKeys.all, 'articles'] as const,
  articleList: (params: Record<string, unknown>) =>
    [...queryKeys.articles(), 'list', params] as const,

  dashboard: () => [...queryKeys.all, 'dashboard'] as const,
  dashboardStats: () => [...queryKeys.dashboard(), 'stats'] as const,
  dashboardArticles: () => [...queryKeys.dashboard(), 'articles'] as const,
  dashboardTags: () => [...queryKeys.dashboard(), 'tags'] as const,
  dashboardReadRank: () => [...queryKeys.dashboard(), 'read-rank'] as const,
  dashboardVisitors: (days: number) => [...queryKeys.dashboard(), 'visitors', days] as const,

  settings: () => [...queryKeys.all, 'settings'] as const,
  settingList: () => [...queryKeys.settings(), 'list'] as const,

  files: () => [...queryKeys.all, 'files'] as const,
  fileList: (params: Record<string, unknown>) =>
    [...queryKeys.files(), 'list', params] as const,

  errorLogs: () => [...queryKeys.all, 'error-logs'] as const,
  errorLogList: (params: Record<string, unknown>) =>
    [...queryKeys.errorLogs(), 'list', params] as const,

  visitors: () => [...queryKeys.all, 'visitors'] as const,
  visitorList: (params: Record<string, unknown>) =>
    [...queryKeys.visitors(), 'list', params] as const,

  web: {
    all: ['web'] as const,
    articles: (params: Record<string, unknown>) => ['web', 'articles', params] as const,
    articleDetail: (id: number) => ['web', 'article', id] as const,
    categories: () => ['web', 'categories'] as const,
    tags: () => ['web', 'tags'] as const,
    topics: () => ['web', 'topics'] as const,
    archives: () => ['web', 'archives'] as const,
    links: () => ['web', 'links'] as const,
    search: (keyword: string) => ['web', 'search', keyword] as const,
  },
} as const;
