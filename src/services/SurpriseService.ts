import { Surprise } from '../types';
import { IStorageAdapter } from './storage/IStorageAdapter';

// 預設驚喜，解鎖時間可設置為現在時間往後 1 分鐘方便即時體驗
const getFutureTime = (seconds: number) => new Date(Date.now() + seconds * 1000).toISOString();

const DEFAULT_SURPRISES: Surprise[] = [
  {
    id: 'surprise-1',
    title: '專屬給妳的生日告白影片 🎥🎁',
    unlockAt: getFutureTime(30), // 30 秒後可解鎖
    mediaUrl: 'https://www.youtube.com/watch?v=aXGMt-UNfOI&list=RDaXGMt-UNfOI&start_radio=1&pp=ygUW5oiR5aW95Zac5q2h5aazIOWFreaKmKAHAQ%3D%3D',
    isUnlocked: false,
  },
];

import { createStorageAdapter } from './storage/createStorageAdapter';

export class SurpriseService {
  constructor(
    private adapter: IStorageAdapter<Surprise> = createStorageAdapter<Surprise>(
      'surprises',
      DEFAULT_SURPRISES
    )
  ) { }

  async getSurprises(): Promise<Surprise[]> {
    return this.adapter.getAll();
  }

  async getActiveSurprise(): Promise<Surprise | null> {
    const list = await this.adapter.getAll();
    const item = list[0];

    // 如果資料庫中還是舊的預設測試影片 (BigBuckBunny) 或與 DEFAULT_SURPRISES 不同，自動更新至資料庫
    if (
      item &&
      DEFAULT_SURPRISES[0] &&
      item.mediaUrl !== DEFAULT_SURPRISES[0].mediaUrl &&
      (item.mediaUrl?.includes('BigBuckBunny') || item.id === 'surprise-1')
    ) {
      try {
        const updated = await this.adapter.update(item.id, {
          mediaUrl: DEFAULT_SURPRISES[0].mediaUrl,
        });
        return updated;
      } catch (e) {
        console.warn('[SurpriseService] 自動同步 mediaUrl 失敗:', e);
      }
    }

    return item || null;
  }

  async updateSurprise(id: string, partial: Partial<Surprise>): Promise<Surprise> {
    return this.adapter.update(id, partial);
  }

  isReadyToUnlock(surprise: Surprise): boolean {
    const unlockTime = new Date(surprise.unlockAt).getTime();
    return Date.now() >= unlockTime;
  }

  async markAsUnlocked(id: string): Promise<Surprise> {
    const item = await this.adapter.getById(id);
    if (!item) throw new Error('驚喜不存在');

    if (!this.isReadyToUnlock(item) && !item.isUnlocked) {
      throw new Error('解鎖時間尚未到達！請耐心等待驚喜時刻 ❤️');
    }

    return this.adapter.update(id, { isUnlocked: true });
  }

  async resetSurpriseTime(id: string, secondsFromNow: number): Promise<Surprise> {
    return this.adapter.update(id, {
      unlockAt: new Date(Date.now() + secondsFromNow * 1000).toISOString(),
      isUnlocked: false,
    });
  }
}

export const surpriseService = new SurpriseService();
