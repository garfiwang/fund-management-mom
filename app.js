/**
 * Client MOM Fund Management System - Dynamic Calculation Engine & Dashboard
 * 遵循官方權威資料與 100% 絕對數學加總對齊原則
 */

let appState = {
  accountsData: null,
  transactionsData: null,
  fundMomData: null
};

// Initialize Application
document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
  computeHoldingsAndTotals();
  renderSummary();
  renderCharts();
  renderFundCards();
  renderTransactionsTable();
});

// Load JSON data
async function loadData() {
  try {
    const [accRes, txRes, fundMomRes] = await Promise.all([
      fetch('data/accounts.json'),
      fetch('data/transactions.json'),
      fetch('data/fund_details_mom.json')
    ]);
    if (accRes.ok && txRes.ok) {
      appState.accountsData = await accRes.json();
      const txRaw = await txRes.json();
      appState.transactionsData = txRaw.transactions || txRaw;
    } else {
      throw new Error('Data fetch failed');
    }
    if (fundMomRes.ok) {
      appState.fundMomData = await fundMomRes.json();
    }
  } catch (err) {
    console.error('Error loading JSON data:', err);
  }
}

// 核心動態浮點數精確計算引擎 (嚴禁靜態或硬編碼估算)
function computeHoldingsAndTotals() {
  const data = appState.accountsData;
  if (!data || !data.accounts || data.accounts.length === 0) return;

  const mainAcc = data.accounts[0];
  let calculatedTotalValuation = 0;

  mainAcc.holdings.forEach(h => {
    // 1. 動態計算每一持股之精確估值 (單位數 * 最新官方公布淨值)
    const exactValuation = h.units * h.latest_price;
    h.current_valuation = Math.round(exactValuation);

    // 2. 動態計算未實現損益 (目前估值 - 初始投入成本)
    h.profit_loss = h.current_valuation - h.cost_amount;

    // 3. 動態計算報酬率 ((最新價 - 均價) / 均價)
    const rate = ((h.latest_price - h.avg_price) / h.avg_price) * 100;
    h.return_rate = (rate >= 0 ? '+' : '') + rate.toFixed(2) + '%';

    // 4. 累加至總資產
    calculatedTotalValuation += h.current_valuation;
  });

  // 5. 確保跨卡片與總匯總額 100% 絕對數學加總對齊
  data.total_current_valuation = calculatedTotalValuation;
  mainAcc.current_balance = calculatedTotalValuation;
}

// Render Summary KPIs
function renderSummary() {
  const data = appState.accountsData;
  if (!data) return;

  const fmt = (num) => 'NT$ ' + Math.round(num).toLocaleString();
  
  document.getElementById('totalValuation').textContent = fmt(data.total_current_valuation);
  
  // 動態計算總損益與總報酬率
  const pnl = data.total_current_valuation - data.total_initial_amount;
  const pnlPct = ((pnl / data.total_initial_amount) * 100).toFixed(2);
  
  const pnlEl = document.getElementById('totalPnL');
  const pnlRateEl = document.getElementById('pnlRate');

  if (pnl >= 0) {
    pnlEl.textContent = '+' + fmt(pnl);
    pnlEl.className = 'metric-value text-emerald';
    pnlRateEl.className = 'metric-sub text-emerald';
    pnlRateEl.innerHTML = `<i class="fa-solid fa-arrow-trend-up"></i> +${pnlPct}% 總報酬率`;
  } else {
    pnlEl.textContent = '-' + fmt(Math.abs(pnl));
    pnlEl.className = 'metric-value text-rose';
    pnlRateEl.className = 'metric-sub text-rose';
    pnlRateEl.innerHTML = `<i class="fa-solid fa-arrow-trend-down"></i> ${pnlPct}% 總報酬率`;
  }

  const updateTag = document.getElementById('lastUpdatedText');
  if (updateTag) {
    updateTag.textContent = `估值基準: ${data.valuation_date || '2026-08-25'}`;
  }
}

// Render Chart Visualizations
function renderCharts() {
  const data = appState.accountsData;
  if (!data) return;

  const mainAcc = data.accounts[0];
  const holdings = mainAcc ? mainAcc.holdings : [];

  // Chart 1: Asset Allocation Doughnut (以各基金動態計算後之即時估值繪製)
  const ctxAllocation = document.getElementById('allocationChart').getContext('2d');
  const labels = holdings.map(h => h.target_name);
  const vals = holdings.map(h => h.current_valuation);

  new Chart(ctxAllocation, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: vals,
        backgroundColor: ['#2563eb', '#059669', '#d97706'],
        borderColor: '#ffffff',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#334155', padding: 14, font: { family: 'Plus Jakarta Sans', size: 12, weight: '600' } }
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const pct = ((context.raw / total) * 100).toFixed(1);
              return `${context.label}: $${context.raw.toLocaleString()} (${pct}%)`;
            }
          }
        }
      },
      cutout: '65%'
    }
  });

  // Chart 2: Valuation Bar Chart (各基金投入成本 vs 動態即時估值)
  const ctxBar = document.getElementById('valuationBarChart').getContext('2d');
  new Chart(ctxBar, {
    type: 'bar',
    data: {
      labels: ['元大穩健ETF (40%)', '安聯四季債 (30%)', '野村高股息 (30%)'],
      datasets: [
        {
          label: '投入本金 (TWD)',
          data: holdings.map(h => h.cost_amount),
          backgroundColor: '#94a3b8',
          borderRadius: 4
        },
        {
          label: '目前估值 (TWD)',
          data: holdings.map(h => h.current_valuation),
          backgroundColor: '#059669',
          borderRadius: 4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: { color: '#334155', font: { family: 'Plus Jakarta Sans', size: 12, weight: '600' } }
        },
        tooltip: {
          callbacks: {
            label: (context) => `${context.dataset.label}: $${context.raw.toLocaleString()}`
          }
        }
      },
      scales: {
        x: { ticks: { color: '#475569', font: { weight: '600' } }, grid: { display: false } },
        y: {
          ticks: {
            color: '#475569',
            callback: (val) => '$' + (val / 10000) + '萬'
          },
          grid: { color: '#f1f5f9' }
        }
      }
    }
  });
}

// Render 3 Target Fund Cards (全數自 holdings 物件動態取出數值呈現)
function renderFundCards() {
  const container = document.getElementById('fundCardsContainer');
  if (!container) return;

  const data = appState.accountsData;
  const mainAcc = data ? data.accounts[0] : null;
  const holdings = mainAcc ? mainAcc.holdings : [];

  const meta = {
    YUANTA_STABLE: {
      color: "#2563eb",
      page: "yuanta_stable_research.html",
      risk: "RR3 中度風險",
      strategy: "全球跨資產 ETF 組合，核心配置股債 ETF 防守兼備"
    },
    ALLIANZ_BOND: {
      color: "#059669",
      page: "allianz_bond_research.html",
      risk: "RR3 中度風險",
      strategy: "優質全球債券組合，專注固定收益累積與抗下行波動"
    },
    NOMURA_DIVIDEND: {
      color: "#d97706",
      page: "nomura_dividend_research.html",
      risk: "RR3 中度風險",
      strategy: "成熟市場高股息企業，累積型無須頻繁除息繳稅，追求穩定增值"
    }
  };

  container.innerHTML = '';
  holdings.forEach((h, idx) => {
    const m = meta[h.fund_code] || { color: "#2563eb", page: "index.html", risk: "RR3", strategy: "" };
    const div = document.createElement('div');
    div.className = 'account-card';
    div.style.borderTop = `4px solid ${m.color}`;

    const pnlClass = h.profit_loss >= 0 ? 'text-emerald' : 'text-rose';
    const pnlSign = h.profit_loss >= 0 ? '+' : '';

    div.innerHTML = `
      <div class="account-card-header">
        <div>
          <div class="account-name" style="font-size: 1.05rem;">${idx + 1}) ${h.target_name}</div>
          <div class="account-valuation-big" style="color: ${m.color}; font-size: 1.5rem;">NT$ ${h.current_valuation.toLocaleString()}</div>
        </div>
        <span class="account-tag" style="background: ${m.color}15; color: ${m.color}; border: 1px solid ${m.color}30; font-weight: 800;">
          目標配置 ${h.allocation_ratio}
        </span>
      </div>

      <div class="account-details-list">
        <div class="detail-row">
          <span class="detail-label">初始成本</span>
          <span class="detail-value" style="font-weight: 700;">NT$ ${h.cost_amount.toLocaleString()}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">未實現損益</span>
          <span class="detail-value ${pnlClass}" style="font-weight: 700;">${pnlSign}$${Math.abs(h.profit_loss).toLocaleString()} (${h.return_rate})</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">持股單位數</span>
          <span class="detail-value" style="font-weight: 700;">${h.units.toLocaleString(undefined, {maximumFractionDigits: 2})} 單位</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">最新參考淨值</span>
          <span class="detail-value" style="font-weight: 700; color: var(--text-primary);">$${h.latest_price.toFixed(4)} TWD (${h.latest_date})</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">風險評級</span>
          <span class="detail-value" style="font-weight: 700; color: #059669;">${m.risk}</span>
        </div>
      </div>

      <div class="insurance-banner" style="background: #f8fafc; border-color: #e2e8f0; margin-top: 14px; margin-bottom: 14px;">
        <div class="insurance-title" style="color: var(--text-secondary);"><i class="fa-solid fa-lightbulb"></i> 資產定位與優勢</div>
        <div style="font-size: 0.82rem; color: var(--text-secondary); line-height: 1.5;">
          ${m.strategy}
        </div>
      </div>

      <a href="${m.page}" class="nav-btn" style="display: block; text-align: center; background: ${m.color}; color: #ffffff; font-weight: 800; padding: 10px; border-radius: 8px; border: none; text-decoration: none;">
        <i class="fa-solid fa-square-poll-vertical"></i> 查看該基金專屬研究報告 (基本資料/持股/淨值/風險)
      </a>
    `;
    container.appendChild(div);
  });
}

// Render Transactions Table
function renderTransactionsTable() {
  const tbody = document.getElementById('txTableBody');
  if (!tbody) return;

  const txList = appState.transactionsData || [];
  tbody.innerHTML = '';

  txList.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-weight: 600;">${item.date}</td>
      <td><span class="account-tag" style="font-size:0.75rem;">${item.account_id}</span></td>
      <td><span class="badge-tx buy">${item.type}</span></td>
      <td style="font-weight: 700; color: var(--color-indigo);">${item.target_name}</td>
      <td style="color: var(--text-secondary);">${item.units.toLocaleString(undefined, {maximumFractionDigits: 2})}</td>
      <td style="color: var(--text-secondary);">$${item.price.toFixed(4)}</td>
      <td style="font-weight: 800; color: var(--text-primary);">$${item.total_amount.toLocaleString()}</td>
      <td style="color: var(--text-muted); font-size: 0.82rem;">${item.note || '-'}</td>
    `;
    tbody.appendChild(tr);
  });
}
