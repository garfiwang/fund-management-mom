# MOM - 基金管理（專案藍圖）

> 本檔為跨 Agent 通用的專案藍圖（AGENTS.md 開放標準）。任何 Agent 的每個 session 都應先讀本檔＋`handoff.md`。

## 專案簡介
MOM - 85 歲高齡投資人基金理財管理專案。負責 2,000,000 NTD 初始資本防護、40%/30%/30% 基金組合追蹤、動態淨值估值與抗通膨績效儀表板維護，包含 3 檔基金專屬研究分頁。

## 客戶簡介與風控策略
- **客戶代號**：MOM
- **年齡**：85 歲
- **風險等級**：極低風險 (RR3 極限控管)
- **投資目標**：本金保全無損失風險，目標年化報酬率超越台灣通膨率 (2.0% ~ 2.5%)
- **初始金額**：NT$ 2,000,000

## 追蹤基金與目標配置 (40% / 30% / 30%)
1. **元大全球ETF穩健組合基金**：40% (NT$ 800,000) - 全球跨資產 ETF 組合
2. **安聯四季回報債券組合基金-A類型(累積)-新臺幣**：30% (NT$ 600,000) - 優質全球債券組合
3. **野村全球高股息基金累積型新台幣**：30% (NT$ 600,000) - 成熟市場高股息龍頭企業 (累積免稅負)

## 目標與路線圖
- [x] 階段一：專案需求確認與三層級基礎建置 (L1, L2, L3 已建立)
- [x] 階段二：客戶代號 MOM 資產配置與交易資料庫建立 (NT$ 2,000,000 初始本金)
- [x] 階段三：總儀錶板開發 (含 40/30/30 配置圖表、估值卡片與抗通膨防護線)
- [x] 階段四：開發三檔基金獨立專屬研究頁面 (含基本資料、前十大持股、近30日淨值、區域產業分佈與風險指標)
- [x] 階段五：發布至 GitHub Pages 與 Obsidian 筆記同步

## 資料夾結構
```
[Project] 基金管理/
├── .gitignore
├── AGENTS.md
├── handoff.md
├── index.html
├── yuanta_stable_research.html (元大穩健ETF 40% 獨立研究頁)
├── allianz_bond_research.html (安聯四季債 30% 獨立研究頁)
├── nomura_dividend_research.html (野村高股息 30% 獨立研究頁)
├── styles.css
├── app.js
├── accounts/
│   └── mom_portfolio.md
└── data/
    ├── accounts.json
    ├── fund_details_mom.json
    └── transactions.json
```

## 同步層級（本專案初始化至第 3層級）

| 層級 | 平台 | 位置 | 讀取時機 |
|------|------|------|---------|
| L1 | 本地（GDrive） | `AGENTS.md`＋`handoff.md` | 每個 session |
| L2 | GitHub | garfiwang/fund-management-mom | 指定時 |
| L3 | Obsidian | `/Users/garfiwang/Documents/Obsidian/[Project] 基金管理-程蘭英/專案工作流程.md` | 有需要時 |

## 工作約定
- 任何 Agent、任何電腦：**開工先讀 `handoff.md`，收工必更新 `handoff.md`**
- 所有回應與文件使用繁體中文
- 修改前先確認計畫，優先保留原有資料結構
