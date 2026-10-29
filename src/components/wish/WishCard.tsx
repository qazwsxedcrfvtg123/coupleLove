import React from 'react';
import { Wish, WishStatus } from '../../types';
import { Sparkles, Heart, CheckCircle2, Clock, Trash2 } from 'lucide-react';

interface WishCardProps {
  wish: Wish;
  onToggleSecret: (id: string) => void;
  onUpdateStatus: (id: string, status: WishStatus) => void;
  onDelete?: (id: string) => void;
}

const getFulfilledRetentionText = (fulfilledAt?: string, createdAt?: string, days = 5): string => {
  const targetTimeStr = fulfilledAt || createdAt;
  if (!targetTimeStr) return `${days}天後清除`;
  const fulfilledMs = new Date(targetTimeStr).getTime();
  const expireMs = fulfilledMs + days * 24 * 60 * 60 * 1000;
  const diffMs = expireMs - Date.now();

  if (diffMs <= 0) return '即將自動清除';
  const remDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  const remHours = Math.floor((diffMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));

  if (remDays >= 1) {
    return `${remDays} 天後自動清除`;
  }
  return `${Math.max(1, remHours)} 小時後自動清除`;
};

const CATEGORY_MAP: Record<string, { label: string; color: string }> = {
  FOOD: { label: '美食探索', color: 'bg-amber-50 text-amber-600 border-amber-200' },
  TRAVEL: { label: '浪漫景點', color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  MOVIE: { label: '電影約會', color: 'bg-purple-50 text-purple-600 border-purple-200' },
  DAILY: { label: '日常心願', color: 'bg-rose-50 text-rose-600 border-rose-200' },
};

const STATUS_LABELS: Record<WishStatus, { label: string; badge: string }> = {
  DRAFT: { label: '草稿', badge: 'bg-stone-100 text-stone-500' },
  PUBLISHED: { label: '待實現', badge: 'bg-blue-50 text-blue-600' },
  IN_PROGRESS: { label: '進行中', badge: 'bg-rose-50 text-rose-600 animate-pulse' },
  FULFILLED: { label: '已完成 💖', badge: 'bg-green-50 text-green-700 font-medium' },
};

export const WishCard: React.FC<WishCardProps> = ({
  wish,
  onToggleSecret,
  onUpdateStatus,
  onDelete,
}) => {
  const categoryInfo = CATEGORY_MAP[wish.category] || {
    label: wish.category,
    color: 'bg-stone-50 text-stone-600 border-stone-200',
  };
  const statusInfo = STATUS_LABELS[wish.status];

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-white/95 p-5 shadow-card backdrop-blur-sm border transition-all duration-300 hover:shadow-soft-glow hover:-translate-y-0.5 ${
        wish.isSecretPreparing ? 'border-rose-300 ring-2 ring-rose-100' : 'border-stone-100'
      }`}
    >
      {/* 悄悄準備中頂部光暈提示條 */}
      {wish.isSecretPreparing && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-400 via-rose-500 to-red-400 animate-pulse" />
      )}

      {/* 頂部標籤列 */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className={`px-2.5 py-0.5 text-xs rounded-full border font-medium ${categoryInfo.color}`}>
          {categoryInfo.label}
        </span>
        <div className="flex items-center gap-1.5">
          {wish.status === 'FULFILLED' && (
            <span className="inline-flex items-center gap-1 text-[11px] text-stone-500 bg-stone-100/90 px-2 py-0.5 rounded-full font-normal">
              <Clock className="w-3 h-3 text-stone-400" />
              {getFulfilledRetentionText(wish.fulfilledAt, wish.createdAt, 5)}
            </span>
          )}
          <span className={`px-2.5 py-0.5 text-xs rounded-full ${statusInfo.badge}`}>
            {statusInfo.label}
          </span>
        </div>
      </div>

      {/* 願望標題 */}
      <h3
        className={`text-base font-semibold text-stone-800 leading-snug mb-3 ${
          wish.status === 'FULFILLED' ? 'line-through text-stone-400' : ''
        }`}
      >
        {wish.title}
      </h3>

      {/* 悄悄準備中溫馨驚喜提示 */}
      {wish.isSecretPreparing && (
        <div className="flex items-center gap-1.5 p-2.5 mb-3 rounded-xl bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-100 text-rose-700 text-xs font-medium">
          <Sparkles className="w-4 h-4 text-rose-500 shrink-0 animate-spin" style={{ animationDuration: '4s' }} />
          <span>噓！有人正為這個心願悄悄準備驚喜中... 🤫</span>
        </div>
      )}

      {/* 底部互動按鈕群 */}
      <div className="flex items-center justify-between pt-3 border-t border-stone-100 text-xs">
        <button
          onClick={() => onToggleSecret(wish.id)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium transition-all active:scale-95 ${
            wish.isSecretPreparing
              ? 'bg-rose-500 text-white shadow-sm shadow-rose-200'
              : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
          }`}
          title="偷偷準備此心願給對方一個驚喜"
        >
          <Heart className={`w-3.5 h-3.5 ${wish.isSecretPreparing ? 'fill-current' : ''}`} />
          {wish.isSecretPreparing ? '已在悄悄準備中' : '悄悄準備中'}
        </button>

        <div className="flex items-center gap-1">
          {wish.status !== 'FULFILLED' ? (
            <button
              onClick={() => onUpdateStatus(wish.id, 'FULFILLED')}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-stone-500 hover:text-green-600 hover:bg-green-50 transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              實現
            </button>
          ) : (
            <>
              <button
                onClick={() => onUpdateStatus(wish.id, 'PUBLISHED')}
                className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-50 transition-colors"
                title="重啟心願"
              >
                <Clock className="w-3.5 h-3.5" />
                重啟
              </button>
              {onDelete && (
                <button
                  onClick={() => onDelete(wish.id)}
                  className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  title="立即刪除"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  刪除
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
