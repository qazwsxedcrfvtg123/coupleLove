import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Surprise } from '../../types';
import { surpriseService } from '../../services/SurpriseService';
import { Lock, Gift, Play, X, Heart, Sparkles, RefreshCw } from 'lucide-react';
import usImage from '../../images/us.jpg';

interface SurpriseUnlockModalProps {
  surprise: Surprise;
  onSurpriseUpdated: (updated: Surprise) => void;
}

const getYouTubeEmbedUrl = (url: string): string | null => {
  if (!url) return null;
  const regExp = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/;
  const match = url.match(regExp);
  if (match && match[1]) {
    return `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0`;
  }
  return null;
};

export const SurpriseUnlockModal: React.FC<SurpriseUnlockModalProps> = ({
  surprise,
  onSurpriseUpdated,
}) => {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const youtubeEmbedUrl = getYouTubeEmbedUrl(surprise.mediaUrl);

  const handleEditMediaUrl = async () => {
    const newUrl = prompt('請輸入新的驚喜影片網址（支援 YouTube 連結或 MP4 直連）：', surprise.mediaUrl);
    if (newUrl && newUrl.trim() && newUrl.trim() !== surprise.mediaUrl) {
      const updated = await surpriseService.updateSurprise(surprise.id, { mediaUrl: newUrl.trim() });
      onSurpriseUpdated(updated);
    }
  };

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
      <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-pink-500 via-rose-500 to-rose-600 text-white shadow-soft-glow border border-white/20">
        {/* 情侶專屬合照底圖：透明度淡化並柔和融合，不顯突兀 */}
        <div
          className="absolute inset-0 bg-cover pointer-events-none transition-transform duration-1000 scale-105"
          style={{
            backgroundImage: `url(${usImage})`,
            backgroundPosition: 'center 30%',
            opacity: 0.22,
            filter: 'contrast(105%) saturate(110%)',
          }}
        />

        {/* 浪漫玫瑰色柔焦與暗角覆蓋層，確保文字清晰好讀 */}
        <div className="absolute inset-0 bg-gradient-to-t from-rose-950/40 via-transparent to-black/10 pointer-events-none" />
        <div className="absolute top-0 right-0 -mr-6 -mt-6 w-36 h-36 rounded-full bg-white/15 blur-2xl pointer-events-none" />

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
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4 pt-3 border-t border-white/10 text-[10px] text-rose-200">
            <RefreshCw className="w-3 h-3" />
            <span>測試與設定：</span>
            <button
              onClick={() => handleTestReset(0)}
              className="underline hover:text-white"
            >
              立即解鎖
            </button>
            <span>|</span>
            <button
              onClick={() => handleTestReset(30)}
              className="underline hover:text-white"
            >
              倒數 30 秒
            </button>
            <span>|</span>
            <button
              onClick={handleEditMediaUrl}
              className="underline hover:text-white"
            >
              更換影片網址
            </button>
          </div>
        </div>
      </div>

      {/* 驚喜影片彈出層 (獨立標題列 + 16:9 純淨視訊 + 浪漫告白卡) */}
      {isPlayingVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsPlayingVideo(false);
          }}
        >
          <div className="relative w-full max-w-lg bg-stone-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10 ring-1 ring-white/10 flex flex-col animate-fadeIn">
            {/* 1. 獨立頂部標題列 (徹底解決與 YouTube 標題/按鈕重疊問題) */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-stone-900/90 border-b border-white/10">
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-400 flex items-center justify-center shadow-xs shrink-0">
                  <Heart className="w-4 h-4 text-white fill-white" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-white text-sm font-bold truncate leading-tight">
                    {surprise.title}
                  </h4>
                  <p className="text-[10px] text-rose-300/80">專屬浪漫驚喜影音</p>
                </div>
              </div>

              <button
                onClick={() => setIsPlayingVideo(false)}
                className="w-8 h-8 rounded-full bg-white/10 text-stone-300 flex items-center justify-center hover:bg-white/20 hover:text-white transition-all shrink-0 active:scale-95"
                title="關閉影片"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 2. 影片播放器 (純淨無重疊，完整 16:9 比例) */}
            <div className="aspect-video w-full bg-black flex items-center justify-center relative overflow-hidden">
              {youtubeEmbedUrl ? (
                <iframe
                  src={youtubeEmbedUrl}
                  title={surprise.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <video
                  src={surprise.mediaUrl}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain"
                />
              )}
            </div>

            {/* 3. 浪漫告白留言與互動列 */}
            <div className="relative p-4 sm:p-5 bg-stone-950 text-stone-200 border-t border-white/10 space-y-3 overflow-hidden">
              {/* 微光底紋合照浮水印 */}
              <div
                className="absolute inset-0 bg-cover pointer-events-none opacity-[0.08]"
                style={{
                  backgroundImage: `url(${usImage})`,
                  backgroundPosition: 'center 30%',
                  filter: 'grayscale(20%)',
                }}
              />
              <div className="relative px-3.5 py-3 rounded-2xl bg-white/[0.04] border border-white/5 text-xs text-rose-100/90 text-center leading-relaxed font-light">
                <span className="text-rose-400 text-sm font-serif mr-1">“</span>
                這世界再大，有你的地方才是我最想駐足的風景。生日快樂，我的唯一 💕
                <span className="text-rose-400 text-sm font-serif ml-1">”</span>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  onClick={() => fireHeartConfetti()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 hover:bg-rose-500/25 transition-all active:scale-95 text-[11px]"
                >
                  <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                  再次灑花 💖
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleEditMediaUrl}
                    className="text-[11px] text-stone-400 hover:text-white underline transition-colors"
                  >
                    更換影片
                  </button>
                  <button
                    onClick={() => setIsPlayingVideo(false)}
                    className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium transition-all"
                  >
                    完成觀看
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
