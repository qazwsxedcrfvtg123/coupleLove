import { Anniversary, AnniversaryCountdown } from '../types';
import { IStorageAdapter } from './storage/IStorageAdapter';

const DEFAULT_ANNIVERSARIES: Anniversary[] = [
  {
    id: 'anniv-1',
    title: '我們在一起的第一天 💕',
    targetDate: '2018-07-23',
    isRecurring: false,
    notes: '命中註定的相遇',
  },
  {
    id: 'anniv-2',
    title: '寶貝生日 🎂',
    targetDate: '11-15',
    isRecurring: true,
    notes: '訂餐廳、神秘禮物預備中',
  },
  {
    id: 'anniv-3',
    title: '週年紀念日 🥂',
    targetDate: '05-20',
    isRecurring: true,
    notes: '每年都要一起浪漫慶祝',
  },
];

import { createStorageAdapter } from './storage/createStorageAdapter';

export class AnniversaryService {
  constructor(
    private adapter: IStorageAdapter<Anniversary> = createStorageAdapter<Anniversary>(
      'anniversaries',
      DEFAULT_ANNIVERSARIES
    )
  ) { }

  async getAll(): Promise<Anniversary[]> {
    return this.adapter.getAll();
  }

  async addAnniversary(anniversary: Omit<Anniversary, 'id'>): Promise<Anniversary> {
    return this.adapter.create(anniversary);
  }

  async updateAnniversary(id: string, partial: Partial<Anniversary>): Promise<Anniversary> {
    return this.adapter.update(id, partial);
  }

  async deleteAnniversary(id: string): Promise<void> {
    return this.adapter.delete(id);
  }

  /**
   * 計算倒數日與已過去天數核心邏輯
   */
  calculateCountdown(anniversary: Anniversary, baseDate: Date = new Date()): AnniversaryCountdown {
    const today = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
    const msPerDay = 1000 * 60 * 60 * 24;

    const parts = anniversary.targetDate.split('-').map(Number);
    let targetYear = today.getFullYear();
    let targetMonth = 0;
    let targetDay = 1;

    if (parts.length === 2) {
      // MM-DD 格式 (生日 / 每年重複)
      targetMonth = parts[0] - 1;
      targetDay = parts[1];
    } else if (parts.length === 3) {
      // YYYY-MM-DD 格式
      targetYear = parts[0];
      targetMonth = parts[1] - 1;
      targetDay = parts[2];
    }

    const monthDayFormatted = `${targetMonth + 1} 月 ${targetDay} 日`;

    // 模式 A：非每年重複 (如：在一起的第一天 -> 計算累積天數)
    if (!anniversary.isRecurring) {
      const target = new Date(targetYear, targetMonth, targetDay);
      target.setHours(0, 0, 0, 0);
      const diffMs = today.getTime() - target.getTime();
      const diffDays = Math.floor(diffMs / msPerDay);

      if (diffDays >= 0) {
        return {
          days: diffDays,
          isToday: diffDays === 0,
          isPast: true,
          targetDateFormatted: anniversary.targetDate,
          label: diffDays === 0 ? '就是今天！🎉' : `已相伴 ${diffDays} 天`,
        };
      } else {
        // 未來的一次性事件 (如：婚禮日)
        const remaining = Math.abs(diffDays);
        return {
          days: remaining,
          isToday: false,
          isPast: false,
          targetDateFormatted: anniversary.targetDate,
          label: `倒數 ${remaining} 天`,
        };
      }
    }

    // 模式 B：每年重複 (如：生日、週年紀念日 -> 只需月和日，計算下一個週年倒數)
    const thisYearTarget = new Date(today.getFullYear(), targetMonth, targetDay);
    let nextTarget = thisYearTarget;

    if (thisYearTarget.getTime() < today.getTime()) {
      // 今年已過，推至明年
      nextTarget = new Date(today.getFullYear() + 1, targetMonth, targetDay);
    }

    const diffDays = Math.ceil((nextTarget.getTime() - today.getTime()) / msPerDay);

    return {
      days: diffDays,
      isToday: diffDays === 0,
      isPast: false,
      targetDateFormatted: monthDayFormatted,
      label: diffDays === 0 ? '就是今天！🎉' : `倒數 ${diffDays} 天`,
    };
  }
}

export const anniversaryService = new AnniversaryService();
