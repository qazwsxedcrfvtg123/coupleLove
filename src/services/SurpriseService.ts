import { Surprise } from '../types';
import { IStorageAdapter } from './storage/IStorageAdapter';

// 預設驚喜，解鎖時間可設置為現在時間往後 1 分鐘方便即時體驗
const getFutureTime = (seconds: number) => new Date(Date.now() + seconds * 1000).toISOString();

const DEFAULT_SURPRISES: Surprise[] = [
  {
    id: 'surprise-1',
    title: '專屬給妳的生日告白影片 🎥🎁',
    unlockAt: getFutureTime(30), // 30 秒後可解鎖
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
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
  ) {}

  async getSurprises(): Promise<Surprise[]> {
    return this.adapter.getAll();
  }

  async getActiveSurprise(): Promise<Surprise | null> {
    const list = await this.adapter.getAll();
    return list[0] || null;
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
