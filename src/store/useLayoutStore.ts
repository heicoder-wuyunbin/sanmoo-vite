import { create } from 'zustand';
import {
  fetchArticles,
  fetchSettings,
  fetchCategories,
  fetchTags,
  unwrapList,
  type BlogSettings,
} from '@/services/blog/api';

type TaxonomyItem = {
  id: number;
  name: string;
  articleCount?: number;
};

const normalizeTaxonomyItems = (items: unknown[]): TaxonomyItem[] =>
  (items || []).filter(
    (item) =>
      typeof item === 'object' &&
      item !== null &&
      'id' in item &&
      'name' in item &&
      item &&
      (item as { id?: unknown }).id !== undefined &&
      (item as { id?: unknown }).id !== null &&
      typeof (item as { name?: unknown }).name === 'string' &&
      (item as { name: string }).name.trim().length > 0,
  ) as TaxonomyItem[];

const deriveTagsFromArticles = (
  articles: Array<{ tags?: Array<{ id: number; name: string }> }>,
): TaxonomyItem[] => {
  const tagMap = new Map<number, TaxonomyItem>();

  articles.forEach((article) => {
    (article.tags || []).forEach((tag) => {
      if (!tag?.id || !tag.name) {
        return;
      }

      const existing = tagMap.get(tag.id);
      if (existing) {
        existing.articleCount = (existing.articleCount || 0) + 1;
        return;
      }

      tagMap.set(tag.id, {
        id: tag.id,
        name: tag.name,
        articleCount: 1,
      });
    });
  });

  return Array.from(tagMap.values()).sort(
    (a, b) => (b.articleCount || 0) - (a.articleCount || 0) || a.id - b.id,
  );
};

interface LayoutState {
  settings: Partial<BlogSettings>;
  categories: TaxonomyItem[];
  tags: TaxonomyItem[];
  articleCount: number;
  isLoaded: boolean;
  loadGlobalData: () => Promise<void>;
}

export const useLayoutStore = create<LayoutState>((set, get) => ({
  settings: {},
  categories: [],
  tags: [],
  articleCount: 0,
  isLoaded: false,
  loadGlobalData: async () => {
    if (get().isLoaded) return;
    try {
      const [settingsRes, categoriesRes, tagsRes, articlesRes] = await Promise.all([
        fetchSettings(false),
        fetchCategories(false),
        fetchTags(false),
        fetchArticles({ page: 1, size: 1 }),
      ]);

      let normalizedTags = normalizeTaxonomyItems(unwrapList(tagsRes.data) || []);

      // Some backend environments report tag total but return an empty web tag list.
      // Fall back to deriving visible tags from the public article list so the web tag
      // index and sidebar remain usable for readers.
      if (normalizedTags.length === 0) {
        try {
          const fullArticlesRes = await fetchArticles({ page: 1, size: 200 });
          normalizedTags = deriveTagsFromArticles(fullArticlesRes.data.list || []);
        } catch (fallbackError) {
          console.error('Failed to derive tags from articles', fallbackError);
        }
      }

      set({
        settings: settingsRes.data || {},
        categories: normalizeTaxonomyItems(unwrapList(categoriesRes.data) || []),
        tags: normalizedTags,
        articleCount: articlesRes.data.total || 0,
        isLoaded: true,
      });
    } catch (error) {
      console.error('Failed to load global data', error);
    }
  },
}));
