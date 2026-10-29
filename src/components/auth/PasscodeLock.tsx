import React, { useState, useEffect, useCallback } from 'react';
import { Lock, Heart, Delete, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PasscodeLockProps {
  onUnlock: () => void;
  correctPasscode?: string;
}

export const PasscodeLock: React.FC<PasscodeLockProps> = ({
  onUnlock,
  correctPasscode = '130723',
}) => {
  const [pin, setPin] = useState<string>('');
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleDigit = useCallback(
    (digit: string) => {
      if (pin.length < 6) {
        if (navigator.vibrate) navigator.vibrate(30);
        setPin((prev) => prev + digit);
      }
    },
    [pin]
  );

  const handleDelete = useCallback(() => {
    if (navigator.vibrate) navigator.vibrate(20);
    setPin((prev) => prev.slice(0, -1));
    setIsError(false);
    setErrorMsg('');
  }, []);

  // 鍵盤輸入監聽 (支援電腦實體鍵盤 0-9 與 Backspace)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) {
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        handleDelete();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDigit, handleDelete]);

  // 當輸入滿 6 位時自動驗證
  useEffect(() => {
    if (pin.length === 6) {
      if (pin === correctPasscode) {
        // 密碼正確：觸發愛心撒花並解鎖
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#f43f5e', '#fb7185', '#fda4af', '#ffffff'],
        });
        localStorage.setItem('couple_app_unlocked', 'true');
        setTimeout(() => {
          onUnlock();
        }, 300);
      } else {
        // 密碼錯誤：震動並提示
        if (navigator.vibrate) navigator.vibrate([80, 50, 80]);
        setIsError(true);
        setErrorMsg('密碼不正確，請重新輸入 💔');
        const timer = setTimeout(() => {
          setPin('');
          setIsError(false);
        }, 800);
        return () => clearTimeout(timer);
      }
    }
  }, [pin, correctPasscode, onUnlock]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-tr from-rose-100/90 via-pink-50/95 to-rose-100/90 backdrop-blur-xl select-none">
      {/* 浪漫光暈裝飾 */}
      <div className="absolute top-1/4 -left-12 w-64 h-64 rounded-full bg-rose-300/30 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-12 w-64 h-64 rounded-full bg-pink-300/30 blur-3xl pointer-events-none" />

      <div
        className={`w-full max-w-xs bg-white/90 backdrop-blur-2xl rounded-3xl p-6 shadow-soft-glow border border-white/80 flex flex-col items-center transition-all ${
          isError ? 'animate-bounce' : 'animate-fadeIn'
        }`}
      >
        {/* 頂部圖示 */}
        <div className="relative mb-3">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-rose-500 to-pink-400 flex items-center justify-center shadow-lg shadow-rose-200">
            {pin.length === 6 && pin === correctPasscode ? (
              <Sparkles className="w-8 h-8 text-white animate-spin" />
            ) : (
              <Lock className="w-8 h-8 text-white" />
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          </div>
        </div>

        <h2 className="text-lg font-black text-stone-800 tracking-tight">專屬空間已鎖定</h2>
        <p className="text-xs text-stone-400 mt-1 mb-5 text-center">
          請輸入 6 位專屬愛情密碼進入
        </p>

        {/* 6 位 PIN 碼圓點顯示 */}
        <div className="flex items-center gap-3.5 mb-6">
          {Array.from({ length: 6 }).map((_, idx) => {
            const isFilled = idx < pin.length;
            return (
              <div
                key={idx}
                className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                  isError
                    ? 'bg-rose-500 ring-4 ring-rose-200'
                    : isFilled
                    ? 'bg-rose-500 scale-125 shadow-sm shadow-rose-300'
                    : 'bg-stone-200'
                }`}
              />
            );
          })}
        </div>

        {/* 錯誤提示 */}
        {errorMsg && (
          <p className="text-xs font-medium text-rose-500 mb-3 animate-pulse">
            {errorMsg}
          </p>
        )}

        {/* 數字鍵盤 (0-9 與 刪除) */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-[240px]">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigit(digit)}
              className="h-14 rounded-2xl bg-stone-50 hover:bg-rose-50 active:bg-rose-100 text-stone-800 hover:text-rose-600 font-bold text-xl flex items-center justify-center transition-all active:scale-95 shadow-xs"
            >
              {digit}
            </button>
          ))}

          {/* 底部功能行：清空、0、刪除 */}
          <button
            type="button"
            onClick={() => {
              setPin('');
              setIsError(false);
              setErrorMsg('');
            }}
            className="h-14 rounded-2xl text-[11px] font-semibold text-stone-400 hover:text-stone-600 transition-colors flex items-center justify-center active:scale-95"
          >
            清空
          </button>

          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="h-14 rounded-2xl bg-stone-50 hover:bg-rose-50 active:bg-rose-100 text-stone-800 hover:text-rose-600 font-bold text-xl flex items-center justify-center transition-all active:scale-95 shadow-xs"
          >
            0
          </button>

          <button
            type="button"
            onClick={handleDelete}
            className="h-14 rounded-2xl text-stone-500 hover:text-rose-600 hover:bg-rose-50 transition-colors flex items-center justify-center active:scale-95"
            title="倒退刪除"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        <p className="text-[10px] text-stone-300 mt-5">U&S Story · 戀人私密守護</p>
      </div>
    </div>
  );
};
