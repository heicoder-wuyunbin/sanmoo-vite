export const ErrorCode = {
  SUCCESS: 0,

  PARAM_INVALID: 40000,
  UNAUTHORIZED: 40100,
  TOKEN_EXPIRED: 40101,
  TOKEN_INVALID: 40102,
  FORBIDDEN: 40300,
  NOT_FOUND: 40400,

  USER_NOT_FOUND: 40401,
  ARTICLE_NOT_FOUND: 40402,
  CATEGORY_NOT_FOUND: 40403,
  TAG_NOT_FOUND: 40404,

  CONFLICT: 40900,
  USERNAME_EXISTS: 40901,
  EMAIL_EXISTS: 40902,
  CATEGORY_EXISTS: 40903,
  TAG_EXISTS: 40904,
  TOPIC_EXISTS: 40905,

  RATE_LIMITED: 42900,

  INTERNAL_ERROR: 50000,
  DATABASE_ERROR: 50001,
  CACHE_ERROR: 50002,
  EMAIL_ERROR: 50003,
  FILE_ERROR: 50004,
  SEARCH_ERROR: 50005,

  OPERATION_FAILED: 50010,
} as const;

export type ErrorCodeValue = (typeof ErrorCode)[keyof typeof ErrorCode];

export const AUTH_ERROR_CODES = new Set<number>([
  ErrorCode.UNAUTHORIZED,
  ErrorCode.TOKEN_EXPIRED,
  ErrorCode.TOKEN_INVALID,
]);

export const ERROR_MESSAGES: Record<number, string> = {
  [ErrorCode.SUCCESS]: '操作成功',
  [ErrorCode.PARAM_INVALID]: '参数错误',
  [ErrorCode.UNAUTHORIZED]: '未登录或登录已过期',
  [ErrorCode.TOKEN_EXPIRED]: '登录已过期，请重新登录',
  [ErrorCode.TOKEN_INVALID]: '登录状态无效，请重新登录',
  [ErrorCode.FORBIDDEN]: '无权限执行此操作',
  [ErrorCode.NOT_FOUND]: '资源不存在',
  [ErrorCode.CONFLICT]: '资源冲突',
  [ErrorCode.USERNAME_EXISTS]: '用户名已存在',
  [ErrorCode.EMAIL_EXISTS]: '邮箱已被注册',
  [ErrorCode.RATE_LIMITED]: '操作过于频繁，请稍后再试',
  [ErrorCode.INTERNAL_ERROR]: '服务器内部错误',
  [ErrorCode.OPERATION_FAILED]: '操作失败',
};

export function isAuthError(code: number): boolean {
  return AUTH_ERROR_CODES.has(code);
}

export function getErrorMessage(code: number, fallback = '操作失败'): string {
  return ERROR_MESSAGES[code] || fallback;
}
