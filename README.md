# Our Story 💕 情侶專屬浪漫點滴 PWA

專為戀人打造的浪漫雙人紀錄應用，支援 **PWA**（可直接安裝於手機主畫面成為原生 App 感體驗），並以 **Supabase (PostgreSQL)** 作為雲端即時同步資料庫，隨時隨地記錄彼此的願望清單、紀念日倒數與專屬驚喜。

---

## 🌟 核心功能

1. **許願池 (Wish List)**
   - 願望分類：美食探索、浪漫景點、電影約會、日常心願。
   - 狀態追蹤：待實現、進行中、已完成 💖。
   - **「悄悄準備中」** 秘密標記：給另一半驚喜前貼心標記。

2. **紀念日與倒數日 (Anniversaries & Countdowns)**
   - 計算在一起累積相伴天數（如「已相伴 3019 天」）。
   - **每年重複重要日子（生日、週年紀念）**：前台直接選擇月份與日期，即時倒數下一個週年。
   - 前台就地編輯（✏️）與隨時新增自訂紀念日。

3. **專屬驚喜 (Surprise & Milestone)**
   - 設定未來到期解鎖時間。
   - 時間到達後一鍵解鎖，觸發**愛心與粉紅彩帶噴發粒子特效**（Canvas Confetti）。
   - 支援專屬告白影音或私密訊息播放。

4. **PWA (Progressive Web App)**
   - 支援手機（iOS / Android）「加入主畫面」，獲得如同原生 App 般乾淨全螢幕體驗。

---

## 🛠️ 技術棧 (Tech Stack)

| 領域 | 技術 / 套件 | 說明 |
| :--- | :--- | :--- |
| **前端框架** | **React 18 + TypeScript** | 嚴格型別定義與現代化組件設計 |
| **建置工具** | **Vite 6** | 極速 HMR 與現代打包工具 |
| **樣式與美學** | **Tailwind CSS** | 現代柔和莫蘭迪玫瑰色系、毛玻璃效果、細緻微互動 |
| **圖示庫** | **Lucide React** | 簡潔現代的向量圖示 |
| **互動特效** | **canvas-confetti** | 愛心與彩帶噴發動畫 |
| **資料庫 (雲端)** | **Supabase (PostgreSQL)** | 免費開箱即用資料庫，支援即時同步與 RLS 安全策略 |
| **儲存架構** | **Adapter Pattern** | 抽換層設計（`SupabaseStorageAdapter` / `LocalStorageAdapter`），支援自動優雅降級 |
| **離線 / 安裝** | **vite-plugin-pwa** | Service Worker 與 App Manifest 支援 |

---

## 🚀 快速開始

### 1. 安裝依賴
```bash
npm install
```

### 2. 設定環境變數
在專案根目錄建立 `.env` 檔案（可參考 `.env.example`）：

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

> **注意**：若未填寫 Supabase Key，系統會自動優雅降級（Fallback）使用本機 `localStorage` 運作，不會報錯崩潰。

---

## 🗄️ Supabase 資料庫建置

至 Supabase 儀表板的 **SQL Editor**，執行以下建表語法：

```sql
-- 1. 紀念日資料表
create table if not exists anniversaries (
  id text primary key,
  title text not null,
  "targetDate" text not null,
  "isRecurring" boolean default false,
  notes text,
  "bgImage" text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. 許願池資料表 (支援 5 天自動過期清理)
create table if not exists wishes (
  id text primary key,
  title text not null,
  category text not null,
  status text not null default 'DRAFT',
  "isSecretPreparing" boolean default false,
  "createdAt" text not null,
  "fulfilledAt" text
);

-- 若舊表已存在，可直接執行此行補充欄位：
-- alter table wishes add column if not exists "fulfilledAt" text;

-- 3. 驚喜模組資料表
create table if not exists surprises (
  id text primary key,
  title text not null,
  "unlockAt" text not null,
  "mediaUrl" text not null,
  "isUnlocked" boolean default false
);

-- 開啟公開讀寫 RLS (供情侶雙人直接連線使用)
alter table anniversaries enable row level security;
alter table wishes enable row level security;
alter table surprises enable row level security;

create policy "Allow all operations for anniversaries" on anniversaries for all using (true) with check (true);
create policy "Allow all operations for wishes" on wishes for all using (true) with check (true);
create policy "Allow all operations for surprises" on surprises for all using (true) with check (true);

-- 4.【可選】Supabase pg_cron 雲端 5 天定時刪除任務 (即使沒開網頁，雲端也會每日自動清理)
-- 啟用 pg_cron 擴展
create extension if not exists pg_cron;

-- 設定定時任務：每天凌晨自動刪除「已實現 (FULFILLED)」超過 5 天的心願
select cron.schedule(
  'auto-delete-fulfilled-wishes-5d',
  '0 0 * * *',
  $$
    delete from wishes 
    where status = 'FULFILLED' 
      and coalesce("fulfilledAt", "createdAt")::timestamptz <= now() - interval '5 days';
  $$
);
```

---

## 💻 本地開發與打包

```bash
# 啟動開發伺服器
npm run dev

# 型別檢查與生產打包
npm run build

# 預覽生產環境建置
npm run preview
```
