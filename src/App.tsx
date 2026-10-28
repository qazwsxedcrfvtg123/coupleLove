import React, { useState, useEffect } from 'react';
import { Wish, Anniversary, Surprise, WishCategory, WishStatus } from './types';
import { wishService } from './services/WishService';
import { anniversaryService } from './services/AnniversaryService';
import { surpriseService } from './services/SurpriseService';
import { WishCard } from './components/wish/WishCard';
import { AnniversaryCard } from './components/anniversary/AnniversaryCard';
import { SurpriseUnlockModal } from './components/surprise/SurpriseUnlockModal';
import { Heart, Calendar, Gift, Sparkles, Plus } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'wishes' | 'anniversaries' | 'surprise'>('wishes');

  // 狀態管理
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [anniversaries, setAnniversaries] = useState<Anniversary[]>([]);
  const [surprise, setSurprise] = useState<Surprise | null>(null);

  // 許願池篩選
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus] = useState<string>('ALL');
  const [newWishTitle, setNewWishTitle] = useState('');
  const [newWishCategory, setNewWishCategory] = useState<WishCategory>('DAILY');
  const [isAddingWish, setIsAddingWish] = useState(false);

  // 載入資料
  const loadData = async () => {
    const w = await wishService.getWishes({
      category: selectedCategory as WishCategory,
      status: selectedStatus as WishStatus,
    });
    setWishes(w);

    const a = await anniversaryService.getAll();
    setAnniversaries(a);

    const s = await surpriseService.getActiveSurprise();
    setSurprise(s);
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory, selectedStatus]);

  // 願望互動處理
  const handleToggleSecret = async (id: string) => {
    await wishService.toggleSecretPreparing(id);
    loadData();
  };

  const handleUpdateStatus = async (id: string, status: WishStatus) => {
    await wishService.updateStatus(id, status);
    loadData();
  };

  const handleCreateWish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWishTitle.trim()) return;
    await wishService.addWish(newWishTitle.trim(), newWishCategory);
    setNewWishTitle('');
    setIsAddingWish(false);
    loadData();
  };

  // 紀念日新增狀態
  const [isAddingAnniversary, setIsAddingAnniversary] = useState(false);
  const [newAnnivTitle, setNewAnnivTitle] = useState('');
  const [newAnnivDate, setNewAnnivDate] = useState('');
  const [newAnnivRecurring, setNewAnnivRecurring] = useState(true);
  const [newAnnivMonth, setNewAnnivMonth] = useState(new Date().getMonth() + 1);
  const [newAnnivDay, setNewAnnivDay] = useState(new Date().getDate());
  const [newAnnivNotes, setNewAnnivNotes] = useState('');

  // 紀念日互動處理
  const handleUpdateAnniversary = async (id: string, partial: Partial<Anniversary>) => {
    await anniversaryService.updateAnniversary(id, partial);
    loadData();
  };

  const handleDeleteAnniversary = async (id: string) => {
    await anniversaryService.deleteAnniversary(id);
    loadData();
  };

  const handleCreateAnniversary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnivTitle.trim()) return;

    let targetDate = newAnnivDate;
    if (newAnnivRecurring) {
      targetDate = `${String(newAnnivMonth).padStart(2, '0')}-${String(newAnnivDay).padStart(2, '0')}`;
    } else if (!newAnnivDate) {
      return;
    }

    await anniversaryService.addAnniversary({
      title: newAnnivTitle.trim(),
      targetDate,
      isRecurring: newAnnivRecurring,
      notes: newAnnivNotes.trim(),
    });
    setNewAnnivTitle('');
    setNewAnnivDate('');
    setNewAnnivRecurring(true);
    setNewAnnivNotes('');
    setIsAddingAnniversary(false);
    loadData();
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-rose-50/40 pb-28 pt-4 px-4 flex flex-col">
      {/* 頂部品牌 Header */}
      <header className="flex items-center justify-between py-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-400 flex items-center justify-center shadow-sm shadow-rose-200">
            <Heart className="w-5 h-5 text-white fill-white" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-stone-800">Our Story</h1>
            <p className="text-[10px] text-stone-400">專屬於我們的浪漫點滴</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-rose-100 text-rose-600 text-xs font-semibold shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-rose-500" />
          <span>相戀中</span>
        </div>
      </header>

      {/* 核心內容視圖 */}
      <main className="flex-1 space-y-4">
        {/* TAB 1: 願望清單 */}
        {activeTab === 'wishes' && (
          <div className="space-y-4 animate-fadeIn">
            {/* 篩選與新增控制列 */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1 text-xs">
                {['ALL', 'FOOD', 'TRAVEL', 'MOVIE', 'DAILY'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 transition-colors ${
                      selectedCategory === cat
                        ? 'bg-rose-500 text-white shadow-xs'
                        : 'bg-white/80 text-stone-600 hover:bg-white'
                    }`}
                  >
                    {cat === 'ALL' ? '全部' : cat === 'FOOD' ? '美食' : cat === 'TRAVEL' ? '景點' : cat === 'MOVIE' ? '電影' : '日常'}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setIsAddingWish(!isAddingWish)}
                className="shrink-0 p-2 rounded-full bg-stone-900 text-white shadow-sm hover:bg-stone-800 active:scale-95 transition-all"
                title="新增願望"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* 新增願望表單 */}
            {isAddingWish && (
              <form onSubmit={handleCreateWish} className="p-4 bg-white rounded-2xl border border-rose-100 shadow-card space-y-3 animate-fadeIn">
                <input
                  type="text"
                  placeholder="輸入想一起做的事情..."
                  value={newWishTitle}
                  onChange={(e) => setNewWishTitle(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
                  autoFocus
                />
                <div className="flex items-center justify-between">
                  <select
                    value={newWishCategory}
                    onChange={(e) => setNewWishCategory(e.target.value as WishCategory)}
                    className="text-xs px-2.5 py-1.5 rounded-lg bg-stone-50 border border-stone-200 text-stone-700"
                  >
                    <option value="DAILY">日常心願</option>
                    <option value="FOOD">美食探索</option>
                    <option value="TRAVEL">浪漫景點</option>
                    <option value="MOVIE">電影約會</option>
                  </select>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingWish(false)}
                      className="px-3 py-1.5 text-xs text-stone-500 hover:text-stone-700"
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-rose-500 text-white hover:bg-rose-600 shadow-sm"
                    >
                      許下心願
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* 願望卡片列表 */}
            <div className="space-y-3">
              {wishes.length === 0 ? (
                <div className="text-center py-12 text-stone-400 text-sm">
                  目前尚無願望，快點擊上方「+」一起寫下浪漫清單吧！
                </div>
              ) : (
                wishes.map((wish) => (
                  <WishCard
                    key={wish.id}
                    wish={wish}
                    onToggleSecret={handleToggleSecret}
                    onUpdateStatus={handleUpdateStatus}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 2: 紀念日與倒數日 */}
        {activeTab === 'anniversaries' && (
          <div className="space-y-3.5 animate-fadeIn">
            {/* 標題列與新增按鈕 */}
            <div className="flex items-center justify-between px-1">
              <div>
                <h2 className="text-sm font-bold text-stone-700">重要日子</h2>
                <p className="text-[11px] text-stone-400">點擊筆形圖示隨時更改日期或備註</p>
              </div>
              <button
                onClick={() => setIsAddingAnniversary(!isAddingAnniversary)}
                className="shrink-0 p-2 rounded-full bg-stone-900 text-white shadow-sm hover:bg-stone-800 active:scale-95 transition-all"
                title="新增紀念日"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* 新增紀念日表單 */}
            {isAddingAnniversary && (
              <form
                onSubmit={handleCreateAnniversary}
                className="p-4 bg-white rounded-2xl border border-rose-200 shadow-card space-y-3 animate-fadeIn"
              >
                <h3 className="text-xs font-bold text-rose-500">新增紀念日 / 重要日期</h3>
                <div>
                  <label className="text-[11px] font-semibold text-stone-500 block mb-1">標題</label>
                  <input
                    type="text"
                    placeholder="例如：第一次約會、交往紀念日..."
                    value={newAnnivTitle}
                    onChange={(e) => setNewAnnivTitle(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
                    required
                    autoFocus
                  />
                </div>
                {newAnnivRecurring ? (
                  <div>
                    <label className="text-[11px] font-semibold text-stone-500 block mb-1">生日 / 紀念日月日</label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2">
                        <select
                          value={newAnnivMonth}
                          onChange={(e) => setNewAnnivMonth(Number(e.target.value))}
                          className="w-full text-sm bg-transparent focus:outline-none text-stone-800"
                        >
                          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                            <option key={m} value={m}>{m} 月</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2">
                        <select
                          value={newAnnivDay}
                          onChange={(e) => setNewAnnivDay(Number(e.target.value))}
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
                      value={newAnnivDate}
                      onChange={(e) => setNewAnnivDate(e.target.value)}
                      className="w-full text-sm px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
                      required
                    />
                  </div>
                )}
                <div>
                  <label className="text-[11px] font-semibold text-stone-500 block mb-1">備註訊息 (選填)</label>
                  <input
                    type="text"
                    placeholder="例如：訂景觀餐廳、買花..."
                    value={newAnnivNotes}
                    onChange={(e) => setNewAnnivNotes(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-stone-600 font-medium">
                    <input
                      type="checkbox"
                      checked={newAnnivRecurring}
                      onChange={(e) => setNewAnnivRecurring(e.target.checked)}
                      className="rounded text-rose-500 focus:ring-rose-400 w-4 h-4 accent-rose-500"
                    />
                    <span>每年重複 (生日/週年)</span>
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingAnniversary(false)}
                      className="px-3 py-1.5 text-xs text-stone-500 hover:text-stone-700"
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-rose-500 text-white hover:bg-rose-600 shadow-sm"
                    >
                      新增
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* 列表 */}
            {anniversaries.map((anniversary) => (
              <AnniversaryCard
                key={anniversary.id}
                anniversary={anniversary}
                onUpdate={handleUpdateAnniversary}
                onDelete={handleDeleteAnniversary}
              />
            ))}
          </div>
        )}

        {/* TAB 3: 生日與神秘驚喜 */}
        {activeTab === 'surprise' && surprise && (
          <div className="space-y-4 animate-fadeIn">
            <SurpriseUnlockModal
              surprise={surprise}
              onSurpriseUpdated={(updated) => setSurprise(updated)}
            />
          </div>
        )}
      </main>

      {/* 底部導覽列 (Mobile-First Fixed Bottom Navigation Bar) */}
      <nav className="fixed bottom-3 left-4 right-4 max-w-md mx-auto bg-white/90 backdrop-blur-xl border border-stone-100 rounded-3xl p-1.5 shadow-2xl flex items-center justify-around z-40">
        <button
          onClick={() => setActiveTab('wishes')}
          className={`flex flex-col items-center gap-1 py-1 px-4 rounded-2xl transition-all ${
            activeTab === 'wishes'
              ? 'text-rose-500 bg-rose-50 font-bold'
              : 'text-stone-400 hover:text-stone-600'
          }`}
        >
          <Heart className={`w-5 h-5 ${activeTab === 'wishes' ? 'fill-current' : ''}`} />
          <span className="text-[10px]">願望池</span>
        </button>

        <button
          onClick={() => setActiveTab('anniversaries')}
          className={`flex flex-col items-center gap-1 py-1 px-4 rounded-2xl transition-all ${
            activeTab === 'anniversaries'
              ? 'text-rose-500 bg-rose-50 font-bold'
              : 'text-stone-400 hover:text-stone-600'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[10px]">紀念日</span>
        </button>

        <button
          onClick={() => setActiveTab('surprise')}
          className={`flex flex-col items-center gap-1 py-1 px-4 rounded-2xl transition-all ${
            activeTab === 'surprise'
              ? 'text-rose-500 bg-rose-50 font-bold'
              : 'text-stone-400 hover:text-stone-600'
          }`}
        >
          <Gift className={`w-5 h-5 ${activeTab === 'surprise' ? 'fill-rose-500' : ''}`} />
          <span className="text-[10px]">專屬驚喜</span>
        </button>
      </nav>
    </div>
  );
};
