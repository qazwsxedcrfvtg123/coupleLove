// 願望清單狀態
export type WishStatus = 'DRAFT' | 'PUBLISHED' | 'IN_PROGRESS' | 'FULFILLED';

// 願望清單分類
export type WishCategory = 'FOOD' | 'TRAVEL' | 'MOVIE' | 'DAILY' | string;

export interface Wish {
  id: string;
  title: string;
  category: WishCategory;
  status: WishStatus;
  isSecretPreparing: boolean; // 悄悄準備中標記
  createdAt: string; // ISO 8601
  fulfilledAt?: string; // 實現完成時間 (ISO 8601)，用於滿 5 天定時自動刪除
}

// 紀念日與倒數日
export interface Anniversary {
  id: string;
  title: string;
  targetDate: string; // YYYY-MM-DD 或 MM-DD (生日/每年重複只需月日)
  isRecurring: boolean; // 是否每年重複 (如生日、週年)
  notes?: string;
  bgImage?: string;
}

// 倒數計算結果
export interface AnniversaryCountdown {
  days: number;
  isToday: boolean;
  isPast: boolean; // 非循環且已過期
  targetDateFormatted: string;
  label: string; // 例如："還有 15 天" 或 "已相伴 520 天"
}

// 生日與驚喜模組
export interface Surprise {
  id: string;
  title: string;
  unlockAt: string; // ISO 8601
  mediaUrl: string; // 影片/媒體 URL 或 Base64
  isUnlocked: boolean;
}
