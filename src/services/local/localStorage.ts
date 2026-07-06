import type { ArticleItem } from '@/services/blog/api';

const FAVORITES_KEY = 'sanmoo-favorites';
const HISTORY_KEY = 'sanmoo-history';
const MAX_HISTORY_SIZE = 50;

export interface FavoriteItem extends Omit<ArticleItem, 'content'> {
  addedAt: number;
}

export interface HistoryItem extends Omit<ArticleItem, 'content'> {
  readAt: number;
}

export const getFavorites = (): FavoriteItem[] => {
  try {
    const data = localStorage.getItem(FAVORITES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const addFavorite = (article: ArticleItem): void => {
  const favorites = getFavorites();
  const exists = favorites.find((item) => item.id === article.id);
  if (!exists) {
    favorites.unshift({ ...article, addedAt: Date.now() });
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }
};

export const removeFavorite = (articleId: number): void => {
  const favorites = getFavorites();
  const filtered = favorites.filter((item) => item.id !== articleId);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered));
};

export const isFavorite = (articleId: number): boolean => {
  const favorites = getFavorites();
  return favorites.some((item) => item.id === articleId);
};

export const getHistory = (): HistoryItem[] => {
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const addHistory = (article: ArticleItem): void => {
  const history = getHistory();
  const existingIndex = history.findIndex((item) => item.id === article.id);
  if (existingIndex !== -1) {
    history.splice(existingIndex, 1);
  }
  history.unshift({ ...article, readAt: Date.now() });
  if (history.length > MAX_HISTORY_SIZE) {
    history.pop();
  }
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
};

export const clearHistory = (): void => {
  localStorage.removeItem(HISTORY_KEY);
};

export const removeHistoryItem = (articleId: number): void => {
  const history = getHistory();
  const filtered = history.filter((item) => item.id !== articleId);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
};
