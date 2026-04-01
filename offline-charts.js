/* ================================
   LOCALOAN — PURE CSS/HTML CHARTS
   Offline debt charts for LocaLoan.
   Reads from global loadData(), strategies, and amortization helpers.
================================= */

const LOAN_CHART_COLORS = ['#F97316','#F43F5E','#8B5CF6','#06B6D4','#10B981','#EAB308','#94A3B8'];

function renderOfflineCharts() {
  const view = window.currentChartView || 'timeline';
  const data  = loadData();
  const loans = (data.loans || []).filter(l => !l.deleted && l.balance > 0);

  ['loanTimelineChart','loanBreakdownChart','loanCompareChart'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.style.display = 'none'; el.innerHTML = ''; }
  });

  if (!loans.length) { showEmptyChartState(); return; }

  const extra    = (data.strategies && data.strategies.extraMonthly) || 0;
  const strategy = (data.strategies && data.strategies.active) || 'avalanche';

  let containerId = 'loanTimelineChart';
  let html = '';

  if (view === 'timeline') {
    containerId = 'loanTimelineChart';
    // Simulate payoff and plot balance-over-months curve (sampled at each month)
    const result = _simStrategy(loans, extra, strategy);
    const totalMonths = Math.min(result.months, 120);
    const balances = result.monthlyTotals.slice(0, totalMonths);
    const maxBal   = balances[0] || 1;

    html = `<div class="text-xs text-gray-500 uppercase tracking-widest mb-3" style="font-family:'Space Mono',monospace">Payoff Curve (${strategy === 'avalanche' ? 'Avalanche' : 'Snowball'})</div>`;
    html += `<div class="flex items-end gap-px" style="height:80px;align-items:flex-end">`;

    const step = Math.max(1, Math.floor(balances.length / 40));
    const sampled = [];
    for (let i = 0; i < balances.length; i += step) sampled.push(balances[i]);
    if (sampled[sampled.length-1] !== 0) sampled.push(0);

    const maxS = sampled[0] || 1;
    sampled.forEach((bal, i) => {
      const h = Math.max(((bal / maxS) * 100), bal > 0 ? 2 : 0);
      const opacity = 0.5 + (i / sampled.length) * 0.5;
      html += `<div class="flex-1 rounded-t" style="height:${h}%;background:#F97316;opacity:${(1 - i / sampled.length).toFixed(2)};min-height:${bal > 0 ? '2px' : '0'};transition:height 0.3s"></div>`;
    });
    html += `</div>`;
    html += `<div class="flex justify-between text-xs text-gray-600 mt-1"><span>Now</span><span>${result.months} mo</span></div>`;
    html += `<div class="mt-3 text-center text-sm font-bold" style="color:#fdba74">Debt-free in ${_monthsLabel(result.months)} · $${result.totalInterest.toFixed(0)} total interest</div>`;

  } else if (view === 'breakdown') {
    containerId = 'loanBreakdownChart';
    // Per-loan: remaining balance bar
    const totalDebt = loans.reduce((s,l) => s + l.balance, 0);
    html = `<div class="text-xs text-gray-500 uppercase tracking-widest mb-3" style="font-family:'Space Mono',monospace">Balance by Loan</div>`;
    html += `<div class="text-center text-2xl font-bold mb-4" style="color:#f1f5f9">$${totalDebt.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}</div>`;

    loans.sort((a,b) => b.balance - a.balance).forEach((loan, i) => {
      const pct   = totalDebt ? ((loan.balance / totalDebt) * 100).toFixed(0) : 0;
      const width = totalDebt ? (loan.balance / totalDebt) * 100 : 0;
      const color = LOAN_CHART_COLORS[i % LOAN_CHART_COLORS.length];
      const mono  = _simOneMinOnly(loan);
      html += `
        <div class="mb-3">
          <div class="flex justify-between text-sm mb-1">
            <span class="flex items-center gap-2">
              <span style="width:8px;height:8px;border-radius:50%;background:${color};display:inline-block;flex-shrink:0"></span>
              <span class="text-gray-300 truncate" style="max-width:140px">${loan.label}</span>
              <span class="text-xs text-gray-600">${loan.apr}%</span>
            </span>
            <span class="text-gray-400">$${loan.balance.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})} <span class="text-gray-600">(${pct}%)</span></span>
          </div>
          <div class="h-3 bg-gray-700 rounded-full overflow-hidden">
            <div class="h-full rounded-full" style="width:${width}%;background:${color}"></div>
          </div>
          <div class="text-xs text-gray-600 mt-0.5">Payoff in ${_monthsLabel(mono)} at min payment</div>
        </div>`;
    });

  } else if (view === 'compare') {
    containerId = 'loanCompareChart';
    const avResult  = _simStrategy(loans, extra, 'avalanche');
    const sbResult  = _simStrategy(loans, extra, 'snowball');
    const avWins    = avResult.totalInterest <= sbResult.totalInterest;
    const maxInterest = Math.max(avResult.totalInterest, sbResult.totalInterest, 1);
    const avWidth   = (avResult.totalInterest / maxInterest) * 100;
    const sbWidth   = (sbResult.totalInterest / maxInterest) * 100;
    const saved     = Math.abs(avResult.totalInterest - sbResult.totalInterest);

    html = `<div class="text-xs text-gray-500 uppercase tracking-widest mb-3" style="font-family:'Space Mono',monospace">Strategy Comparison</div>`;
    html += `
      <div class="mb-4">
        <div class="flex justify-between text-sm mb-1">
          <span class="flex items-center gap-2">
            <span style="width:8px;height:8px;border-radius:50%;background:#F97316;display:inline-block"></span>
            <span class="font-bold" style="color:#fdba74">Avalanche</span>
            <span class="text-xs text-gray-500">(highest APR first)</span>
          </span>
          <span class="text-gray-400">$${avResult.totalInterest.toFixed(0)} · ${_monthsLabel(avResult.months)}</span>
        </div>
        <div class="h-4 bg-gray-700 rounded-full overflow-hidden">
          <div class="h-full rounded-full" style="width:${avWidth}%;background:#F97316;opacity:${avWins ? 1 : 0.55}"></div>
        </div>
      </div>
      <div class="mb-4">
        <div class="flex justify-between text-sm mb-1">
          <span class="flex items-center gap-2">
            <span style="width:8px;height:8px;border-radius:50%;background:#8B5CF6;display:inline-block"></span>
            <span class="font-bold" style="color:#c4b5fd">Snowball</span>
            <span class="text-xs text-gray-500">(smallest balance first)</span>
          </span>
          <span class="text-gray-400">$${sbResult.totalInterest.toFixed(0)} · ${_monthsLabel(sbResult.months)}</span>
        </div>
        <div class="h-4 bg-gray-700 rounded-full overflow-hidden">
          <div class="h-full rounded-full" style="width:${sbWidth}%;background:#8B5CF6;opacity:${!avWins ? 1 : 0.55}"></div>
        </div>
      </div>
      <div class="text-center text-sm mt-2" style="color:#fdba74">
        ${avWins ? 'Avalanche' : 'Snowball'} saves <span class="font-bold">$${saved.toFixed(0)}</span> in interest
        ${avResult.months !== sbResult.months ? ` and ${_monthsLabel(Math.abs(avResult.months - sbResult.months))}` : ''}
      </div>`;
  }

  const container = document.getElementById(containerId);
  if (container) { container.style.display = 'block'; container.innerHTML = html; }
}

function showEmptyChartState() {
  const el = document.getElementById('loanTimelineChart');
  if (el) {
    el.style.display = 'block';
    el.innerHTML = '<div class="text-center text-gray-500 py-8" style="font-family:\'Space Mono\',monospace;font-size:13px">Add a loan to see your payoff charts</div>';
  }
}

/* ── Internal simulation helpers ─────────────────────────── */
function _simStrategy(loans, extra, strategy) {
  if (!loans.length) return { months: 0, totalInterest: 0, monthlyTotals: [] };

  const sorted = strategy === 'avalanche'
    ? [...loans].sort((a,b) => b.apr - a.apr)
    : [...loans].sort((a,b) => a.balance - b.balance);

  const balances = {};
  loans.forEach(l => balances[l.id] = l.balance);
  let totalInterest = 0;
  const monthlyTotals = [];
  let month = 0;
  const today = new Date();

  while (Object.values(balances).some(b => b > 0.01) && month < 600) {
    month++;
    const currentDate = new Date(today.getFullYear(), today.getMonth() + month - 1, 1);

    // Apply interest
    loans.forEach(l => {
      if (balances[l.id] <= 0) return;
      const apr = _effectiveApr(l, currentDate);
      const interest = balances[l.id] * (apr / 100 / 12);
      totalInterest += interest;
      balances[l.id] += interest;
    });

    // Apply minimums
    let rollover = extra;
    loans.forEach(l => {
      if (balances[l.id] <= 0) return;
      const pmt = Math.min(l.minimumPayment || 25, balances[l.id]);
      balances[l.id] = Math.max(0, balances[l.id] - pmt);
    });

    // Apply extra + rollover to target
    for (const l of sorted) {
      if (balances[l.id] > 0 && rollover > 0) {
        const pmt = Math.min(rollover, balances[l.id]);
        balances[l.id] = Math.max(0, balances[l.id] - pmt);
        rollover -= pmt;
        if (balances[l.id] <= 0) {
          // Roll overpayment to next
        }
        break;
      }
    }

    const totalBal = Object.values(balances).reduce((s,b) => s + Math.max(0, b), 0);
    monthlyTotals.push(totalBal);
  }

  return { months: month, totalInterest, monthlyTotals };
}

function _simOneMinOnly(loan) {
  let bal = loan.balance;
  const monthlyRate = (loan.apr / 100) / 12;
  let month = 0;
  while (bal > 0.01 && month < 600) {
    month++;
    const interest = bal * monthlyRate;
    const pmt = Math.max(loan.minimumPayment || 25, interest + 0.01);
    bal = Math.max(0, bal - (pmt - interest));
  }
  return month;
}

function _effectiveApr(loan, currentDate) {
  if (loan.promoApr != null && loan.promoApr >= 0 && loan.promoAprEnds) {
    const end = new Date(loan.promoAprEnds + 'T00:00:00');
    if (currentDate <= end) return loan.promoApr;
  }
  return loan.apr;
}

function _monthsLabel(n) {
  if (!n || n <= 0) return '0 months';
  const yr = Math.floor(n / 12);
  const mo = n % 12;
  if (yr === 0) return `${mo} mo`;
  if (mo === 0) return `${yr} yr`;
  return `${yr} yr ${mo} mo`;
}

window.renderAllCharts = function() { renderOfflineCharts(); };

window.switchChartView = function(view) {
  window.currentChartView = view;
  document.querySelectorAll('.chart-tab').forEach(btn => {
    const active = btn.dataset.view === view;
    btn.style.background = active ? '#F97316' : '';
    btn.style.color      = active ? '#fff' : '';
    btn.classList.toggle('active-chart-tab', active);
  });
  renderOfflineCharts();
};

window.renderChartControls = function() {
  const v = window.currentChartView || 'timeline';
  const tab = (id, label) => {
    const a = v === id;
    return `<button onclick="switchChartView('${id}')" class="chart-tab flex-shrink-0 px-3 py-1.5 text-xs rounded font-bold" data-view="${id}" style="${a ? 'background:#F97316;color:#fff' : 'background:rgba(255,255,255,0.06);color:#94a3b8'};font-family:'Space Mono',monospace">${label}</button>`;
  };
  return `<div class="flex gap-2 mb-4 overflow-x-auto pb-1">
    ${tab('timeline','Payoff Curve')}
    ${tab('breakdown','By Loan')}
    ${tab('compare','Avl vs Snwbl')}
  </div>`;
};
