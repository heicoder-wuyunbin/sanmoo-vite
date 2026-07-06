// 存储键名
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_INFO_KEY = 'userInfo';

const decodeBase64Url = (value: string): string => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  return atob(padded);
};

const parseJwtPayload = (token: string): Record<string, any> => {
  const [, payload = ''] = token.split('.');
  if (!payload) {
    throw new Error('Invalid token payload');
  }

  return JSON.parse(decodeBase64Url(payload));
};

// 获取token
export const getAccessToken = (): string | null => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

// 获取刷新token
export const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

// 获取当前用户信息
export const getCurrentUser = (): { username: string; roleName: string } | undefined => {
  const userStr = localStorage.getItem(USER_INFO_KEY);
  if (!userStr) return undefined;
  try {
    return JSON.parse(userStr);
  } catch {
    return undefined;
  }
};

// 从 JWT 中解析当前用户 ID（兼容常见 claim 命名）
export const getCurrentUserId = (): number | undefined => {
  const token = getAccessToken();
  if (!token) return undefined;

  try {
    const payload = parseJwtPayload(token);
    const rawUserId =
      payload.userId ??
      payload.userID ??
      payload.uid ??
      payload.id ??
      payload.user_id;
    const userId = Number(rawUserId);
    return Number.isFinite(userId) ? userId : undefined;
  } catch {
    return undefined;
  }
};

// 设置认证信息
export const setAuth = (
  accessToken: string,
  refreshToken: string,
  userInfo: { username: string; roleName: string }
): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
};

// 清除认证信息
export const clearAuth = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_INFO_KEY);
};

// 检查token是否过期
export const isTokenExpired = (token: string, offsetSeconds: number = 0): boolean => {
  try {
    const payload = parseJwtPayload(token);
    const exp = payload.exp * 1000;
    return Date.now() > exp - offsetSeconds * 1000;
  } catch {
    return true;
  }
};
