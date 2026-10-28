import React, { useState } from 'react';
import { Anniversary } from '../../types';
import { anniversaryService } from '../../services/AnniversaryService';
import { Calendar, Flame, Repeat, Pencil, Trash2, Check, X } from 'lucide-react';

interface AnniversaryCardProps {
  anniversary: Anniversary;
  onUpdate?: (id: string, updated: Partial<Anniversary>) => void;
  onDelete?: (id: string) => void;
}

export const AnniversaryCard: React.FC<AnniversaryCardProps> = ({
  anniversary,
  onUpdate,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(anniversary.title);
  const [targetDate, setTargetDate] = useState(anniversary.targetDate);
  const [isRecurring, setIsRecurring] = useState(anniversary.isRecurring);
  const [notes, setNotes] = useState(anniversary.notes || '');

  const parseMonthDay = (dateStr: string) => {
    const parts = dateStr.split('-').map(Number);
    if (parts.length === 2) {
      return { month: parts[0] || 1, day: parts[1] || 1 };
    }
    if (parts.length === 3) {
      return { month: parts[1] || 1, day: parts[2] || 1 };
    }
    const d = new Date();
    return { month: d.getMonth() + 1, day: d.getDate() };
  };

  const initialMd = parseMonthDay(anniversary.targetDate);
  const [recurringMonth, setRecurringMonth] = useState(initialMd.month);
  const [recurringDay, setRecurringDay] = useState(initialMd.day);

  const countdown = anniversaryService.calculateCountdown(anniversary);
  const isUrgentOrToday = countdown.isToday || (!countdown.isPast && countdown.days <= 7);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let finalDate = targetDate;
    if (isRecurring) {
      finalDate = `${String(recurringMonth).padStart(2, '0')}-${String(recurringDay).padStart(2, '0')}`;
    } else if (!targetDate) {
      return;
    }

    onUpdate?.(anniversary.id, {
      title: title.trim(),
      targetDate: finalDate,
      isRecurring,
      notes: notes.trim(),
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTitle(anniversary.title);
    setTargetDate(anniversary.targetDate);
    setIsRecurring(anniversary.isRecurring);
    const md = parseMonthDay(anniversary.targetDate);
    setRecurringMonth(md.month);
    setRecurringDay(md.day);
    setNotes(anniversary.notes || '');
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <form
        onSubmit={handleSave}
        className="rounded-2xl p-5 bg-white text-stone-800 border-2 border-rose-300 shadow-card space-y-3.5 animate-fadeIn"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-rose-500 flex items-center gap-1">
            <Pencil className="w-3.5 h-3.5" /> 編輯紀念日 / 生日
          </span>
          {onDelete && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`確定要刪除「${anniversary.title}」嗎？`)) {
                  onDelete(anniversary.id);
                }
              }}
              className="text-stone-400 hover:text-red-500 transition-colors p-1"
              title="刪除紀念日"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        <div>
          <label className="text-[11px] font-semibold text-stone-500 block mb-1">標題名稱</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-sm px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
            required
          />
        </div>

        {isRecurring ? (
          <div>
            <label className="text-[11px] font-semibold text-stone-500 block mb-1">生日 / 紀念日月日</label>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2">
                <select
                  value={recurringMonth}
                  onChange={(e) => setRecurringMonth(Number(e.target.value))}
                  className="w-full text-sm bg-transparent focus:outline-none text-stone-800"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>{m} 月</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2">
                <select
                  value={recurringDay}
                  onChange={(e) => setRecurringDay(Number(e.target.value))}
                  className="w-full text-sm bg-transparent focus:outline-none text-stone-800"
                >
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d}>{d} 日</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <label className="text-[11px] font-semibold text-stone-500 block mb-1">目標日期 (含年份)</label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full text-sm px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
              required
            />
          </div>
        )}

        <div>
          <label className="text-[11px] font-semibold text-stone-500 block mb-1">備註訊息</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="例如：訂餐廳、買花..."
            className="w-full text-sm px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-stone-600 font-medium">
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="rounded text-rose-500 focus:ring-rose-400 w-4 h-4 accent-rose-500"
            />
            <span>每年重複 (生日/週年)</span>
          </label>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs transition-colors"
              title="取消"
            >
              <X className="w-4 h-4" />
            </button>
            <button
              type="submit"
              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Check className="w-4 h-4" /> 儲存
            </button>
          </div>
        </div>
      </form>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-5 transition-all duration-300 ${
        isUrgentOrToday
          ? 'bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-soft-glow'
          : 'bg-white/95 text-stone-800 border border-stone-100 shadow-card'
      }`}
    >
      {/* 裝飾性背景花紋 */}
      <div className="absolute -right-4 -bottom-4 opacity-10 pointer-events-none select-none text-8xl">
        ❤️
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between text-xs mb-3">
          <div className="flex items-center gap-1.5 opacity-90">
            <Calendar className="w-3.5 h-3.5" />
            <span>{countdown.targetDateFormatted}</span>
            {anniversary.isRecurring && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-black/10 text-[10px]">
                <Repeat className="w-2.5 h-2.5" /> 每年
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {isUrgentOrToday && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-semibold animate-bounce">
                <Flame className="w-3 h-3 text-amber-300 fill-amber-300" />
                即將到來
              </span>
            )}
            {onUpdate && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className={`p-1.5 rounded-lg transition-colors ${
                  isUrgentOrToday
                    ? 'hover:bg-white/20 text-white/90'
                    : 'hover:bg-stone-100 text-stone-400 hover:text-stone-700'
                }`}
                title="編輯紀念日"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-baseline justify-between mt-2">
          <div>
            <h3 className={`text-lg font-bold tracking-tight ${isUrgentOrToday ? 'text-white' : 'text-stone-800'}`}>
              {anniversary.title}
            </h3>
            {anniversary.notes && (
              <p className={`text-xs mt-1 ${isUrgentOrToday ? 'text-rose-100' : 'text-stone-500'}`}>
                {anniversary.notes}
              </p>
            )}
          </div>

          <div className="text-right shrink-0 ml-3">
            <div className="flex items-baseline gap-1">
              <span className={`text-3xl font-extrabold tracking-tight ${isUrgentOrToday ? 'text-white' : 'text-rose-600'}`}>
                {countdown.days}
              </span>
              <span className={`text-xs font-medium ${isUrgentOrToday ? 'text-rose-100' : 'text-stone-500'}`}>
                天
              </span>
            </div>
            <div className={`text-[11px] font-medium mt-0.5 ${isUrgentOrToday ? 'text-rose-100' : 'text-stone-500'}`}>
              {countdown.label}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
