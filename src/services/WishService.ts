import { Wish, WishCategory, WishStatus } from '../types';
import { IStorageAdapter } from './storage/IStorageAdapter';

const DEFAULT_WISHES: Wish[] = [
  {
    id: 'wish-1',
    title: '一起去北海道看初雪與吃拉麵 ❄️',
    category: 'TRAVEL',
    status: 'IN_PROGRESS',
    isSecretPreparing: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'wish-2',
    title: '手做私廚法式晚餐燭光之夜 🍷',
    category: 'FOOD',
    status: 'PUBLISHED',
    isSecretPreparing: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'wish-3',
    title: '在客廳重溫宮崎駿所有動畫電影 🎬',
    category: 'MOVIE',
    status: 'FULFILLED',
    isSecretPreparing: false,
    createdAt: new Date().toISOString(),
    fulfilledAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

import { createStorageAdapter } from './storage/createStorageAdapter';

export class WishService {
  constructor(private adapter: IStorageAdapter<Wish> = createStorageAdapter<Wish>('wishes', DEFAULT_WISHES)) {}

  async getWishes(filter?: { category?: WishCategory | 'ALL'; status?: WishStatus | 'ALL' }): Promise<Wish[]> {
    // 每次載入時自動清理已實現超過 5 天的心願
    await this.cleanupFulfilledWishes(5).catch((err) =>
      console.warn('[WishService] 自動清理過期已實現願望時發生提示:', err)
    );

    const all = await this.adapter.getAll();
    return all.filter((w) => {
      if (filter?.category && filter.category !== 'ALL' && w.category !== filter.category) {
        return false;
      }
      if (filter?.status && filter.status !== 'ALL' && w.status !== filter.status) {
        return false;
      }
      return true;
    });
  }

  async addWish(title: string, category: WishCategory): Promise<Wish> {
    return this.adapter.create({
      title,
      category,
      status: 'PUBLISHED',
      isSecretPreparing: false,
      createdAt: new Date().toISOString(),
    });
  }

  /**
   * 悄悄準備中切換：
   * 當一方點選「悄悄準備中」，自動推進狀態至 IN_PROGRESS 並設標記。
   */
  async toggleSecretPreparing(id: string): Promise<Wish> {
    const item = await this.adapter.getById(id);
    if (!item) throw new Error('願望不存在');

    const nextSecretState = !item.isSecretPreparing;
    return this.adapter.update(id, {
      isSecretPreparing: nextSecretState,
      status: nextSecretState ? 'IN_PROGRESS' : item.status === 'IN_PROGRESS' ? 'PUBLISHED' : item.status,
    });
  }

  async updateStatus(id: string, status: WishStatus): Promise<Wish> {
    const partial: Partial<Wish> = { status };
    if (status === 'FULFILLED') {
      // 標記實現時間，啟動 5 天過期倒數
      partial.fulfilledAt = new Date().toISOString();
    } else {
      // 若重新發起願望，清除實現時間
      partial.fulfilledAt = undefined;
    }
    return this.adapter.update(id, partial);
  }

  /**
   * 清理已實現超過 retentionDays 天數的心願 (預設 5 天)
   * 同時支援 Supabase 與 LocalStorage
   */
  async cleanupFulfilledWishes(retentionDays: number = 5): Promise<number> {
    const all = await this.adapter.getAll();
    const now = Date.now();
    const thresholdMs = retentionDays * 24 * 60 * 60 * 1000;

    const expiredWishes = all.filter((w) => {
      if (w.status !== 'FULFILLED') return false;
      const targetTimeStr = w.fulfilledAt || w.createdAt;
      if (!targetTimeStr) return false;
      const timeMs = new Date(targetTimeStr).getTime();
      return now - timeMs >= thresholdMs;
    });

    if (expiredWishes.length > 0) {
      await Promise.all(expiredWishes.map((w) => this.adapter.delete(w.id)));
    }

    return expiredWishes.length;
  }

  async deleteWish(id: string): Promise<void> {
    return this.adapter.delete(id);
  }
}

// 預設導出單例實例，同時支援依賴注入更換底層 Adapter
export const wishService = new WishService();
