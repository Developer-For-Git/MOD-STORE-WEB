// ─── Insights View ────────────────────────────────────────────────────────────
import { formatSize } from '../api.js';
import { buildIcon } from './catalog.js';
import { openDetail } from './detail.js';
import {
  totalStorage, avgSize, freshArrivals, categoryBreakdown,
  updateHallOfFame, daysSince, fmtDate
} from '../utils/insights-calc.js';

/** Draw category bar chart on a canvas element. */
function drawCategoryChart(canvas, breakdown) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const max = breakdown[0]?.[1] || 1;
  const barH = Math.floor((H - 40) / breakdown.length) - 8;
  const labelW = 100;
  const padding = 16;

  ctx.clearRect(0, 0, W, H);

  breakdown.forEach(([cat, count], i) => {
    const y = padding + i * (barH + 8);
    const barW = Math.max(4, ((count / max) * (W - labelW - padding * 2)));

    // Bar background
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.beginPath();
    roundRect(ctx, labelW, y, W - labelW - padding, barH, 4);
    ctx.fill();

    // Gradient bar
    const grad = ctx.createLinearGradient(labelW, 0, labelW + barW, 0);
    grad.addColorStop(0, '#FF1744');
    grad.addColorStop(1, '#9B0F2B');
    ctx.fillStyle = grad;
    ctx.beginPath();
    roundRect(ctx, labelW, y, barW, barH, 4);
    ctx.fill();

    // Label
    ctx.fillStyle = 'rgba(255,255,255,0.65)';
    ctx.font = '600 12px Inter, system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(cat, labelW - 8, y + barH / 2);

    // Count
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = '700 12px Inter, system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(count, labelW + barW + 6, y + barH / 2);
  });
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function metricColor(idx) {
  const styles = [
    { bg: 'var(--surface-crimson)', border: 'var(--border-crimson)', color: 'var(--crimson)' },
    { bg: 'rgba(68,129,235,0.12)',  border: 'rgba(68,129,235,0.35)',  color: '#4481eb' },
    { bg: 'rgba(17,153,142,0.12)', border: 'rgba(17,153,142,0.35)',  color: '#11998e' },
    { bg: 'rgba(247,151,30,0.12)', border: 'rgba(247,151,30,0.35)',  color: '#f7971e' },
  ];
  return styles[idx % styles.length];
}

export function renderInsights(container, apps) {
  container.innerHTML = '';
  const view = document.createElement('div');
  view.className = 'view';

  const total     = apps.length;
  const storage   = totalStorage(apps);
  const avg       = avgSize(apps);
  const fresh     = freshArrivals(apps, 90);
  const breakdown = categoryBreakdown(apps);
  const hof       = updateHallOfFame(apps, 10);

  const metrics = [
    { label: 'Total Apps', value: total, icon: '📦', sub: 'in catalog' },
    { label: 'Catalog Size', value: formatSize(storage), icon: '💾', sub: 'total storage' },
    { label: 'Avg App Size', value: formatSize(avg), icon: '📊', sub: 'per app' },
    { label: 'Fresh (90d)', value: fresh.length, icon: '✨', sub: 'recently added' },
  ];

  view.innerHTML = `
    <div class="view-header">
      <div class="view-title-block">
        <h1 class="view-title">Deep <span>Insights</span></h1>
        <p class="view-subtitle">Analytics and statistics for your app catalog</p>
      </div>
    </div>
    <div class="insights-grid" id="metricsGrid"></div>
    <div id="insightsSections"></div>`;

  container.appendChild(view);

  // ── Metric cards ──────────────────────────────────────────────────────────
  const grid = view.querySelector('#metricsGrid');
  metrics.forEach((m, i) => {
    const s = metricColor(i);
    const card = document.createElement('div');
    card.className = 'metric-card';
    card.style.animationDelay = `${i * 60}ms`;
    card.innerHTML = `
      <div class="metric-icon" style="background:${s.bg};border:1px solid ${s.border}">
        <span style="font-size:1.1rem">${m.icon}</span>
      </div>
      <div class="metric-label">${m.label}</div>
      <div class="metric-value" style="color:${s.color}">${m.value}</div>
      <div class="metric-sub">${m.sub}</div>`;
    grid.appendChild(card);
  });

  const sections = view.querySelector('#insightsSections');

  // ── Hall of Fame ──────────────────────────────────────────────────────────
  const hofSection = document.createElement('div');
  hofSection.className = 'insights-section';
  hofSection.innerHTML = `
    <div class="insights-section-header">
      <div class="insights-section-icon"><svg viewBox="0 0 24 24" fill="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" stroke-width="1.8" fill="currentColor"/></svg></div>
      <div class="insights-section-title">Update Hall of Fame</div>
    </div>
    <div class="hall-of-fame-list" id="hofList"></div>`;
  sections.appendChild(hofSection);

  const hofList = hofSection.querySelector('#hofList');
  const rankClasses = ['gold', 'silver', 'bronze'];
  hof.forEach((app, i) => {
    const item = document.createElement('div');
    item.className = 'hof-item';
    const days = daysSince(app.updated);
    const rankCls = rankClasses[i] || '';
    item.innerHTML = `<span class="hof-rank ${rankCls}">${i + 1}</span>`;
    item.appendChild(buildIcon(app, 'list'));
    item.insertAdjacentHTML('beforeend', `
      <div class="hof-info">
        <div class="hof-name">${app.name}</div>
        <div class="hof-meta">Updated ${fmtDate(app.updated)}</div>
      </div>
      <span class="hof-badge">${days === 0 ? 'Today' : days + 'd ago'}</span>`);
    item.addEventListener('click', () => openDetail(app));
    hofList.appendChild(item);
  });

  // ── Category Breakdown Chart ───────────────────────────────────────────────
  const chartSection = document.createElement('div');
  chartSection.className = 'insights-section';
  chartSection.innerHTML = `
    <div class="insights-section-header">
      <div class="insights-section-icon"><svg viewBox="0 0 24 24" fill="none"><rect x="3" y="12" width="4" height="9" rx="1" fill="currentColor"/><rect x="10" y="7" width="4" height="14" rx="1" fill="currentColor"/><rect x="17" y="3" width="4" height="18" rx="1" fill="currentColor"/></svg></div>
      <div class="insights-section-title">Category Breakdown</div>
    </div>
    <div class="chart-wrap"><canvas id="categoryChart"></canvas></div>`;
  sections.appendChild(chartSection);

  // Draw chart after DOM is attached
  requestAnimationFrame(() => {
    const canvas = view.querySelector('#categoryChart');
    if (!canvas) return;
    const wrap = canvas.parentElement;
    const W = wrap.clientWidth - 40;
    const H = Math.max(breakdown.length * 36, 120);
    canvas.width = W;
    canvas.height = H;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    drawCategoryChart(canvas, breakdown);
  });

  // ── Fresh Arrivals ────────────────────────────────────────────────────────
  const freshSection = document.createElement('div');
  freshSection.className = 'insights-section';
  freshSection.innerHTML = `
    <div class="insights-section-header">
      <div class="insights-section-icon"><svg viewBox="0 0 24 24" fill="none"><path d="M12 2v4M12 18v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M2 12h4M18 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></div>
      <div class="insights-section-title">Fresh Arrivals</div>
    </div>
    <div class="fresh-list" id="freshList"></div>`;
  sections.appendChild(freshSection);

  const freshList = freshSection.querySelector('#freshList');
  if (fresh.length === 0) {
    freshList.innerHTML = `<p style="padding:1.5rem;color:var(--text-3);text-align:center;font-size:0.85rem">No apps added in the last 90 days.</p>`;
  } else {
    fresh.slice(0, 10).forEach(app => {
      const days = daysSince(app.added);
      const item = document.createElement('div');
      item.className = 'fresh-item';
      item.innerHTML = '';
      item.appendChild(buildIcon(app, 'fresh'));
      item.insertAdjacentHTML('beforeend', `
        <div class="fresh-info">
          <div class="fresh-name">${app.name}</div>
          <div class="fresh-date">Added ${fmtDate(app.added)}</div>
        </div>
        <span class="fresh-new-badge">${days === 0 ? 'NEW' : days + 'd ago'}</span>`);
      item.addEventListener('click', () => openDetail(app));
      freshList.appendChild(item);
    });
  }
}
