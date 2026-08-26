/**
 * Client MOM Fund Management System - Total Dashboard Application Logic
 */

const fallbackData = {
  accounts: {
    client: "MOM",
    client_name: "MOM",
    client_age: 85,
    currency: "TWD",
    total_initial_amount: 2000000,
    total_current_valuation: 1965950,
    total_deductions: 0,
    total_dividends: 0,
    valuation_date: "2026-08-25",
    last_updated: "2026-08-26",
    accounts: [
      {
        account_id: "MOM-01",
        name: "MOM 綜合基金理財帳戶",
        initial_amount: 2000000,
        current_balance: 1965950,
        holdings: [
          {
            fund_code: "YUANTA_STABLE",
            target_name: "元大全球ETF穩健組合基金",
            allocation_ratio: "40%",
            units: 34028.073160,
            avg_price: 23.5100,
            latest_price: 23.2100,
            latest_date: "2026-08-21",
            cost_amount: 800000,
            current_valuation: 789792,
            profit_loss: -10208,
            return_rate: "-1.28%"
          },
          {
            fund_code: "ALLIANZ_BOND",
            target_name: "安聯四季回報債券組合基金-A類型(累積)-新臺幣",
            allocation_ratio: "30%",
            units: 35226.353484,
            avg_price: 17.0327,
            latest_price: 16.8865,
            latest_date: "2026-08-25",
            cost_amount: 600000,
            current_valuation: 594849,
            profit_loss: -5151,
            return_rate: "-0.86%"
          },
          {
            fund_code: "NOMURA_DIVIDEND",
            target_name: "野村全球高股息基金累積型新台幣",
            allocation_ratio: "30%",
            units: 13544.018059,
            avg_price: 44.3000,
            latest_price: 42.9200,
            latest_date: "2026-08-20",
            cost_amount: 600000,
            current_valuation: 581309,
            profit_loss: -18691,
            return_rate: "-3.12%"
          }
        ]
      }
    ]
  },
  transactions: [
    {
      id: "TX-MOM-20260818-01",
      date: "2026-08-18",
      account_id: "MOM-01",
      target_name: "元大全球ETF穩健組合基金",
      type: "申購",
      units: 34028.073160,
      price: 23.5100,
      total_amount: 800000,
      note: "初始配置 40%"
    },
    {
      id: "TX-MOM-20260818-02",
      date: "2026-08-18",
      account_id: "MOM-01",
      target_name: "安聯四季回報債券組合基金-A類型(累積)-新臺幣",
      type: "申購",
      units: 35226.353484,
      price: 17.0327,
      total_amount: 600000,
      note: "初始配置 30%"
    },
    {
      id: "TX-MOM-20260818-03",
      date: "2026-08-18",
      account_id: "MOM-01",
      target_name: "野村全球高股息基金累積型新台幣",
      type: "申購",
      units: 13544.018059,
      price: 44.3000,
      total_amount: 600000,
      note: "初始配置 30%"
    }
  ]
};

let appState = {
  accountsData: null,
  transactionsData: null,
  fundMomData: null
};

// Initialize Application
document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
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
    console.log('Using local fallback data...');
    appState.accountsData = fallbackData.accounts;
    appState.transactionsData = fallbackData.transactions;
  }
}

// Render Summary KPIs
function renderSummary() {
  const data = appState.accountsData;
  if (!data) return;

  const fmt = (num) => 'NT$ ' + Math.round(num).toLocaleString();
  
  document.getElementById('totalValuation').textContent = fmt(data.total_current_valuation);
  
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

  // Chart 1: Asset Allocation Doughnut (Current Valuations)
  const ctxAllocation = document.getElementById('allocationChart').getContext('2d');
  const vals = holdings.map(h => h.current_valuation || h.cost_amount);

  new Chart(ctxAllocation, {
    type: 'doughnut',
    data: {
      labels: [
        '元大全球ETF穩健組合基金',
        '安聯四季回報債券組合基金-A',
        '野村全球高股息基金累積型'
      ],
      datasets: [{
        data: vals.length === 3 ? vals : [789792, 594849, 581309],
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

  // Chart 2: Valuation Bar Chart
  const ctxBar = document.getElementById('valuationBarChart').getContext('2d');
  new Chart(ctxBar, {
    type: 'bar',
    data: {
      labels: ['元大穩健ETF (40%)', '安聯四季債 (30%)', '野村高股息 (30%)'],
      datasets: [
        {
          label: '投入本金 (TWD)',
          data: [800000, 600000, 600000],
          backgroundColor: '#94a3b8',
          borderRadius: 4
        },
        {
          label: '目前估值 (TWD)',
          data: holdings.map(h => h.current_valuation || h.cost_amount),
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

// Render 3 Target Fund Cards
function renderFundCards() {
  const container = document.getElementById('fundCardsContainer');
  if (!container) return;

  const data = appState.accountsData;
  const mainAcc = data ? data.accounts[0] : null;
  const holdings = mainAcc ? mainAcc.holdings : [];

  const hYuanta = holdings.find(h => h.fund_code === 'YUANTA_STABLE') || {};
  const hAllianz = holdings.find(h => h.fund_code === 'ALLIANZ_BOND') || {};
  const hNomura = holdings.find(h => h.fund_code === 'NOMURA_DIVIDEND') || {};

  const fundsInfo = [
    {
      code: "YUANTA_STABLE",
      name: "1) 元大全球ETF穩健組合基金",
      ratio: "40%",
      amount: `NT$ ${(hYuanta.current_valuation || 789792).toLocaleString()}`,
      cost: "NT$ 800,000",
      pnl: `${hYuanta.profit_loss || -10208}`,
      rate: `${hYuanta.return_rate || '-1.28%'}`,
      units: "34,028.07 單位",
      nav: `$${hYuanta.latest_price || 23.2100} TWD (${hYuanta.latest_date || '2026/08/21'})`,
      risk: "RR3 中度風險",
      strategy: "全球跨資產 ETF 組合，核心配置股債 ETF 防守兼備",
      color: "#2563eb",
      page: "yuanta_stable_research.html"
    },
    {
      code: "ALLIANZ_BOND",
      name: "2) 安聯四季回報債券組合基金-A類型(累積)-新臺幣",
      ratio: "30%",
      amount: `NT$ ${(hAllianz.current_valuation || 594849).toLocaleString()}`,
      cost: "NT$ 600,000",
      pnl: `${hAllianz.profit_loss || -5151}`,
      rate: `${hAllianz.return_rate || '-0.86%'}`,
      units: "35,226.35 單位",
      nav: `$${hAllianz.latest_price || 16.8865} TWD (${hAllianz.latest_date || '2026/08/25'})`,
      risk: "RR3 中度風險",
      strategy: "優質全球債券組合，專注固定收益累積與抗下行波動",
      color: "#059669",
      page: "allianz_bond_research.html"
    },
    {
      code: "NOMURA_DIVIDEND",
      name: "3) 野村全球高股息基金累積型新台幣",
      ratio: "30%",
      amount: `NT$ ${(hNomura.current_valuation || 581309).toLocaleString()}`,
      cost: "NT$ 600,000",
      pnl: `${hNomura.profit_loss || -18691}`,
      rate: `${hNomura.return_rate || '-3.12%'}`,
      units: "13,544.02 單位",
      nav: `$${hNomura.latest_price || 42.9200} TWD (${hNomura.latest_date || '2026/08/20'})`,
      risk: "RR3 中度風險",
      strategy: "成熟市場高股息企業，累積型無須頻繁除息繳稅，追求穩定增值",
      color: "#d97706",
      page: "nomura_dividend_research.html"
    }
  ];

  container.innerHTML = '';
  fundsInfo.forEach(fund => {
    const div = document.createElement('div');
    div.className = 'account-card';
    div.style.borderTop = `4px solid ${fund.color}`;

    const pnlNum = parseFloat(fund.pnl);
    const pnlClass = pnlNum >= 0 ? 'text-emerald' : 'text-rose';
    const pnlSign = pnlNum >= 0 ? '+' : '';

    div.innerHTML = `
      <div class="account-card-header">
        <div>
          <div class="account-name" style="font-size: 1.05rem;">${fund.name}</div>
          <div class="account-valuation-big" style="color: ${fund.color}; font-size: 1.5rem;">${fund.amount}</div>
        </div>
        <span class="account-tag" style="background: ${fund.color}15; color: ${fund.color}; border: 1px solid ${fund.color}30; font-weight: 800;">
          目標配置 ${fund.ratio}
        </span>
      </div>

      <div class="account-details-list">
        <div class="detail-row">
          <span class="detail-label">初始成本</span>
          <span class="detail-value" style="font-weight: 700;">${fund.cost}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">未實現損益</span>
          <span class="detail-value ${pnlClass}" style="font-weight: 700;">${pnlSign}$${Math.abs(pnlNum).toLocaleString()} (${fund.rate})</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">持股單位數</span>
          <span class="detail-value" style="font-weight: 700;">${fund.units}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">最新參考淨值</span>
          <span class="detail-value" style="font-weight: 700; color: var(--text-primary);">${fund.nav}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">風險評級</span>
          <span class="detail-value" style="font-weight: 700; color: #059669;">${fund.risk}</span>
        </div>
      </div>

      <div class="insurance-banner" style="background: #f8fafc; border-color: #e2e8f0; margin-top: 14px; margin-bottom: 14px;">
        <div class="insurance-title" style="color: var(--text-secondary);"><i class="fa-solid fa-lightbulb"></i> 資產定位與優勢</div>
        <div style="font-size: 0.82rem; color: var(--text-secondary); line-height: 1.5;">
          ${fund.strategy}
        </div>
      </div>

      <a href="${fund.page}" class="nav-btn" style="display: block; text-align: center; background: ${fund.color}; color: #ffffff; font-weight: 800; padding: 10px; border-radius: 8px; border: none; text-decoration: none;">
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
      <td style="color: var(--text-secondary);">$${item.price}</td>
      <td style="font-weight: 800; color: var(--text-primary);">$${item.total_amount.toLocaleString()}</td>
      <td style="color: var(--text-muted); font-size: 0.82rem;">${item.note || '-'}</td>
    `;
    tbody.appendChild(tr);
  });
}
