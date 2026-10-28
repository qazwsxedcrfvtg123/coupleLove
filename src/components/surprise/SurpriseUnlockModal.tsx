import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Surprise } from '../../types';
import { surpriseService } from '../../services/SurpriseService';
import { Lock, Gift, Play, X, Heart, Sparkles, RefreshCw } from 'lucide-react';

interface SurpriseUnlockModalProps {
  surprise: Surprise;
  onSurpriseUpdated: (updated: Surprise) => void;
}

export const SurpriseUnlockModal: React.FC<SurpriseUnlockModalProps> = ({
  surprise,
  onSurpriseUpdated,
}) => {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);

  // 彩帶與愛心噴發特效
  const fireHeartConfetti = useCallback(() => {
    const count = 200;
    const defaults = { origin: { y: 0.7 } };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
      colors: ['#f43f5e', '#ec4899', '#fda4af', '#ffffff'],
    });
    fire(0.2, {
      spread: 60,
      colors: ['#f43f5e', '#fb7185', '#ffe4e6'],
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    });
  }, []);

  // 計算剩餘時間
  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      const target = new Date(surprise.unlockAt).getTime();
      const diff = target - now;

      if (diff <= 0) {
        setIsReady(true);
        setTimeLeft(null);
      } else {
        setIsReady(false);
        const totalSeconds = Math.floor(diff / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        setTimeLeft({ hours, minutes, seconds });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [surprise.unlockAt]);

  const handleUnlockClick = async () => {
    try {
      const updated = await surpriseService.markAsUnlocked(surprise.id);
      fireHeartConfetti();
      onSurpriseUpdated(updated);
      setIsPlayingVideo(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message);
      }
    }
  };

  const handleTestReset = async (seconds: number) => {
    const updated = await surpriseService.resetSurpriseTime(surprise.id, seconds);
    onSurpriseUpdated(updated);
  };

  return (
    <>
      <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-pink-500 via-rose-500 to-rose-600 text-white shadow-soft-glow">
        <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center">
          {/* 動態徽章圖示 */}
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-4 shadow-inner">
            {surprise.isUnlocked ? (
              <Gift className="w-8 h-8 text-amber-200 animate-bounce" />
            ) : isReady ? (
              <Sparkles className="w-8 h-8 text-yellow-300 animate-spin" />
            ) : (
              <Lock className="w-8 h-8 text-white/90 animate-pulse" />
            )}
          </div>

          <h2 className="text-xl font-bold tracking-tight mb-1">{surprise.title}</h2>
          <p className="text-xs text-rose-100 mb-5">
            {surprise.isUnlocked
              ? '驚喜已解鎖！隨時可重溫浪漫回憶'
              : isReady
              ? '✨ 驚喜時刻已降臨，請親手揭開秘密！'
              : '專屬浪漫封印中，等待解鎖時刻到達...'}
          </p>

          {/* 倒數時鐘 */}
          {!surprise.isUnlocked && timeLeft && (
            <div className="grid grid-cols-3 gap-2.5 w-full max-w-xs mb-5">
              <div className="bg-black/20 rounded-xl p-2.5 backdrop-blur-sm">
                <span className="text-2xl font-black font-mono">
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span className="block text-[10px] text-rose-200 uppercase mt-0.5">小時</span>
              </div>
              <div className="bg-black/20 rounded-xl p-2.5 backdrop-blur-sm">
                <span className="text-2xl font-black font-mono">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span className="block text-[10px] text-rose-200 uppercase mt-0.5">分鐘</span>
              </div>
              <div className="bg-black/20 rounded-xl p-2.5 backdrop-blur-sm">
                <span className="text-2xl font-black font-mono">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
                <span className="block text-[10px] text-rose-200 uppercase mt-0.5">秒</span>
              </div>
            </div>
          )}

          {/* 解鎖/播放按鈕 */}
          {surprise.isUnlocked ? (
            <button
              onClick={() => setIsPlayingVideo(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-rose-600 font-bold text-sm shadow-lg hover:bg-rose-50 transition-all active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              觀看驚喜影片
            </button>
          ) : (
            <button
              disabled={!isReady}
              onClick={handleUnlockClick}
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all shadow-lg active:scale-95 ${
                isReady
                  ? 'bg-amber-300 text-stone-900 hover:bg-amber-200 shadow-amber-400/40 animate-pulse'
                  : 'bg-white/30 text-white/70 cursor-not-allowed'
              }`}
            >
              <Heart className={`w-4 h-4 ${isReady ? 'fill-current text-rose-600' : ''}`} />
              {isReady ? '揭開驚喜禮物 🎁' : '時間未到（封印中）'}
            </button>
          )}

          {/* 測試快捷按鈕列 (Dev/Demo Shortcut) */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/10 text-[10px] text-rose-200">
            <RefreshCw className="w-3 h-3" />
            <span>快速測試：</span>
            <button
              onClick={() => handleTestReset(0)}
              className="underline hover:text-white"
            >
              立即抵達解鎖時刻
            </button>
            <span>|</span>
            <button
              onClick={() => handleTestReset(30)}
              className="underline hover:text-white"
            >
              倒數 30 秒
            </button>
          </div>
        </div>
      </div>

      {/* 驚喜影片彈出層 (HTML5 Video Player Modal) */}
      {isPlayingVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg bg-stone-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10">
            {/* 關閉按鈕 */}
            <button
              onClick={() => setIsPlayingVideo(false)}
              className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/90 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* 影片標題區 */}
            <div className="p-4 bg-gradient-to-b from-stone-900 to-transparent absolute top-0 left-0 right-0 z-10">
              <h4 className="text-white text-sm font-semibold truncate pr-10">{surprise.title}</h4>
            </div>

            {/* HTML5 影片播放器 */}
            <div className="aspect-video w-full bg-black flex items-center justify-center">
              <video
                src={surprise.mediaUrl}
                controls
                autoPlay
                playsInline
                className="w-full h-full object-contain"
              />
            </div>

            {/* 溫馨留言區 */}
            <div className="p-4 bg-stone-900 text-stone-200 text-xs text-center border-t border-white/5">
              <p>「這世界再大，有你的地方才是我最想駐足的風景。生日快樂，我的唯一 💕」</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
