import { importArticles } from '@/services/blog/api';

/** 导入状态 */
export type ArticleImportStatus = 'pending' | 'importing' | 'success' | 'failed' | 'skipped';

/** 单篇文章导入项 */
export interface ArticleImportItem {
  id: number;
  title: string;
  description: string;
  content: string;
  categoryId?: number;
  tagIds?: number[];
  topicIds?: number[];
  isTop?: number;
  isPublished?: number;
  status: ArticleImportStatus;
  error?: string;
  resultId?: number;
}

/** 状态变更回调 */
export type OnStatusChange = (items: ArticleImportItem[]) => void;

/** 单篇导入 API 调用 */
async function importSingleArticle(item: ArticleImportItem): Promise<{ status: ArticleImportStatus; error?: string; id?: number }> {
  const res = await importArticles([{
    title: item.title,
    description: item.description,
    content: item.content,
    categoryId: item.categoryId,
    tagIds: item.tagIds || [],
    topicIds: item.topicIds || [],
    isTop: item.isTop ?? 0,
    isPublished: item.isPublished ?? 0,
  }]);

  const result = res.data?.results?.[0];
  if (!result) {
    return { status: 'failed', error: '未知错误' };
  }

  if (result.success) {
    return { status: 'success', id: result.id };
  }

  // 后端返回的 status 字段区分 skipped 和 failed
  if (result.status === 'skipped') {
    return { status: 'skipped', error: result.error };
  }

  return { status: 'failed', error: result.error || '导入失败' };
}

/**
 * 文章导入控制器
 * 维护任务队列，最多 2 篇并发导入
 */
export class ArticleImporter {
  private items: ArticleImportItem[];
  private maxConcurrent: number;
  private activeCount: number;
  private onStatusChange: OnStatusChange;
  private aborted: boolean;

  constructor(
    items: ArticleImportItem[],
    onStatusChange: OnStatusChange,
    maxConcurrent = 2,
  ) {
    this.items = items;
    this.maxConcurrent = maxConcurrent;
    this.activeCount = 0;
    this.onStatusChange = onStatusChange;
    this.aborted = false;
  }

  getItems(): ArticleImportItem[] {
    return this.items;
  }

  /** 开始导入所有文章 */
  async start(): Promise<void> {
    this.aborted = false;
    const pending = this.items.filter((item) => item.status === 'pending');

    // 使用信号量控制并发
    const running: Promise<void>[] = [];
    for (const item of pending) {
      if (this.aborted) break;

      // 等待有空闲槽位
      while (this.activeCount >= this.maxConcurrent && !this.aborted) {
        await this.delay(100);
      }
      if (this.aborted) break;

      this.activeCount++;
      const task = this.importOne(item).finally(() => {
        this.activeCount--;
      });
      running.push(task);
    }

    await Promise.allSettled(running);
  }

  /** 重试单篇文章 */
  async retry(itemId: number): Promise<void> {
    const item = this.items.find((i) => i.id === itemId);
    if (!item || item.status === 'importing') return;

    item.status = 'pending';
    item.error = undefined;
    this.notify();

    this.activeCount++;
    await this.importOne(item).finally(() => {
      this.activeCount--;
    });
  }

  /** 终止导入 */
  abort(): void {
    this.aborted = true;
  }

  /** 获取汇总信息 */
  getSummary(): { success: number; failed: number; skipped: number; pending: number; importing: number } {
    const summary = { success: 0, failed: 0, skipped: 0, pending: 0, importing: 0 };
    for (const item of this.items) {
      switch (item.status) {
        case 'success': summary.success++; break;
        case 'failed': summary.failed++; break;
        case 'skipped': summary.skipped++; break;
        case 'pending': summary.pending++; break;
        case 'importing': summary.importing++; break;
      }
    }
    return summary;
  }

  private async importOne(item: ArticleImportItem): Promise<void> {
    item.status = 'importing';
    this.notify();

    try {
      const result = await importSingleArticle(item);
      item.status = result.status;
      if (result.error) {
        item.error = result.error;
      }
      if (result.id) {
        item.resultId = result.id;
      }
    } catch (err: any) {
      item.status = 'failed';
      item.error = err?.message || '网络错误，请重试';
    }

    this.notify();
  }

  private notify(): void {
    this.onStatusChange([...this.items]);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}