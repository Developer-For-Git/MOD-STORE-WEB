// ─── Catalog View ─────────────────────────────────────────────────────────────
import { isFavorite, toggleFavorite, getViewMode, setViewMode, on } from '../store.js';
import { formatSize, formatDownloads, seedGradient, getInitials } from '../api.js';
import { filterApps, getCategories, debounce } from '../utils/search.js';
import { openDetail } from './detail.js';

let _apps = [];
let _query = '';
let _category = 'All';
let _platform = 'All';
let _mode = 'grid';

/** Build an icon element with lazy-load + gradient fallback. */
export function buildIcon(app, size = 'card') {
  const wrap = document.createElement('div');
  const cls = size === 'card' ? 'card-icon-wrap' : (size === 'list' ? 'list-icon' : 'fresh-icon');
  wrap.className = cls;

  const [c1, c2] = seedGradient(app.id || app.name);
  const fb = document.createElement('div');
  fb.className = 'icon-fallback';
  fb.style.background = `linear-gradient(135deg, ${c1}, ${c2})`;
  fb.textContent = getInitials(app.name);
  wrap.appendChild(fb);

  if (app.icon) {
    const img = new Image();
    img.className = size === 'card' ? 'card-icon' : 'list-icon-img';
    img.alt = app.name;
    img.loading = 'lazy';
    img.decoding = 'async';
    img.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity 0.3s';
    wrap.style.position = 'relative';
    img.onload = () => { img.style.opacity = '1'; };
    img.onerror = () => img.remove();
    img.src = app.icon;
    wrap.appendChild(img);
  }
  return wrap;
}

function favHtml(id) {
  const fav = isFavorite(id);
  return `<button class="card-fav-btn ${fav ? 'is-fav' : ''}" data-fav="${id}" aria-label="${fav ? 'Remove from' : 'Add to'} favorites">
    <svg viewBox="0 0 24 24" fill="none"><path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" stroke="currentColor" stroke-width="1.8" ${fav ? 'fill="currentColor"' : ''}/></svg>
  </button>`;
}

function buildCard(app, delay = 0) {
  const card = document.createElement('div');
  card.className = 'app-card';
  card.dataset.id = app.id;
  card.style.animationDelay = `${delay}ms`;

  const icon = buildIcon(app, 'card');
  const fav = isFavorite(app.id);
  icon.insertAdjacentHTML('afterbegin', `<span class="card-category-badge">${app.category}</span>`);
  icon.insertAdjacentHTML('afterbegin', favHtml(app.id));

  card.appendChild(icon);
  const sizeLabel = (app.size && typeof app.size === 'number') ? formatSize(app.size) : (app.size || 'Varies');
  card.insertAdjacentHTML('beforeend', `
    <div class="card-body">
      <div class="card-name">${app.name}</div>
      <div class="card-desc">${app.description}</div>
      <div class="card-meta">
        ${app.platform ? `<span class="card-platform">${app.platform}</span>` : `<span class="card-size">${sizeLabel}</span>`}
        ${app.author ? `<span class="card-author">by ${app.author}</span>` : ''}
        ${app.rating ? `<span class="card-rating"><svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>${app.rating}</span>` : ''}
      </div>
    </div>`);

  card.addEventListener('click', e => {
    if (e.target.closest('[data-fav]')) return;
    openDetail(app);
  });
  return card;
}

function buildListItem(app, delay = 0) {
  const item = document.createElement('div');
  item.className = 'app-list-item';
  item.dataset.id = app.id;
  item.style.animationDelay = `${delay}ms`;

  item.appendChild(buildIcon(app, 'list'));
  const fav = isFavorite(app.id);
  const sizeLabel = (app.size && typeof app.size === 'number') ? formatSize(app.size) : (app.size || 'Varies');
  item.insertAdjacentHTML('beforeend', `
    <div class="list-info">
      <div class="list-name">${app.name}</div>
      <div class="list-desc">${app.description}</div>
    </div>
    <div class="list-meta">
      <span class="list-tag">${sizeLabel}</span>
      <button class="list-fav-btn ${fav ? 'is-fav' : ''}" data-fav="${app.id}" aria-label="Toggle favorite">
        <svg viewBox="0 0 24 24" fill="none"><path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" stroke="currentColor" stroke-width="1.8" ${fav ? 'fill="currentColor"' : ''}/></svg>
      </button>
    </div>`);

  item.addEventListener('click', e => {
    if (e.target.closest('[data-fav]')) return;
    openDetail(app);
  });
  return item;
}

function renderGrid(apps, container) {
  const grid = document.createElement('div');
  grid.className = 'apps-grid';
  apps.forEach((app, i) => grid.appendChild(buildCard(app, i * 25)));
  container.appendChild(grid);
}

function renderList(apps, container) {
  const list = document.createElement('div');
  list.className = 'apps-list';
  apps.forEach((app, i) => list.appendChild(buildListItem(app, i * 20)));
  container.appendChild(list);
}

function handleFavClick(e) {
  const btn = e.target.closest('[data-fav]');
  if (!btn) return;
  const id = btn.dataset.fav;
  const isFav = toggleFavorite(id);
  document.querySelectorAll(`[data-fav="${id}"]`).forEach(b => {
    b.classList.toggle('is-fav', isFav);
    const path = b.querySelector('path');
    if (path) path.setAttribute('fill', isFav ? 'currentColor' : 'none');
  });
}

export function renderCatalog(container, apps) {
  _apps = apps;
  _mode = getViewMode();

  container.innerHTML = '';
  const view = document.createElement('div');
  view.className = 'view';
  view.id = 'catalogView';

  const categories = getCategories(apps);

  view.innerHTML = `
    <div class="view-header">
      <div class="view-title-block">
        <h1 class="view-title">App <span>Catalog</span></h1>
        <p class="view-subtitle">${apps.length} apps across ${categories.length} categories</p>
      </div>
    </div>
    <div class="catalog-toolbar">
      <div class="toolbar-search search-wrap">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/><path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        <input type="search" id="catalogSearch" class="search-input" placeholder="Search apps, games, tools…" autocomplete="off" aria-label="Search catalog">
        <button class="search-clear" id="searchClear" aria-label="Clear search">✕</button>
      </div>
      <div class="view-toggle">
        <button class="view-toggle-btn ${_mode === 'grid' ? 'active' : ''}" id="viewGrid" aria-label="Grid view">
          <svg viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1" fill="currentColor"/><rect x="14" y="3" width="7" height="7" rx="1" fill="currentColor"/><rect x="3" y="14" width="7" height="7" rx="1" fill="currentColor"/><rect x="14" y="14" width="7" height="7" rx="1" fill="currentColor"/></svg>
        </button>
        <button class="view-toggle-btn ${_mode === 'list' ? 'active' : ''}" id="viewList" aria-label="List view">
          <svg viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="2" rx="1" fill="currentColor"/><rect x="3" y="11" width="18" height="2" rx="1" fill="currentColor"/><rect x="3" y="17" width="18" height="2" rx="1" fill="currentColor"/></svg>
        </button>
      </div>
    </div>
    <div class="filter-row" id="filterRow">
      <button class="chip active" data-cat="All">All (${apps.length})</button>
      ${categories.map(c => `<button class="chip" data-cat="${c.name}">${c.name} (${c.count})</button>`).join('')}
    </div>
    <div class="filter-row" id="platformFilterRow" style="margin-top: 4px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 8px;">
      <button class="chip ${_platform === 'All' ? 'active' : ''}" data-plat="All" style="font-size:0.75rem">All Platforms</button>
      <button class="chip ${_platform === 'PC' ? 'active' : ''}" data-plat="PC" style="font-size:0.75rem">PC Apps</button>
      <button class="chip ${_platform === 'TV' ? 'active' : ''}" data-plat="TV" style="font-size:0.75rem">TV Apps</button>
    </div>
    <p class="result-count" id="resultCount"><strong>${apps.length}</strong> apps</p>
    <div id="appsList"></div>`;

  container.appendChild(view);

  const searchInput = view.querySelector('#catalogSearch');
  const searchClear = view.querySelector('#searchClear');
  const filterRow   = view.querySelector('#filterRow');
  const platformFilterRow = view.querySelector('#platformFilterRow');
  const resultCount = view.querySelector('#resultCount');
  const appsList    = view.querySelector('#appsList');

  function refresh() {
    const filtered = filterApps(_apps, _query, _category, _platform);
    resultCount.innerHTML = `<strong>${filtered.length}</strong> of ${_apps.length} apps`;
    appsList.innerHTML = '';
    if (filtered.length === 0) {
      appsList.innerHTML = `<div class="empty-state"><div class="empty-state-icon">🔍</div><div class="empty-state-title">No results found</div><p class="empty-state-sub">Try a different search or category.</p></div>`;
      return;
    }
    _mode === 'grid' ? renderGrid(filtered, appsList) : renderList(filtered, appsList);
  }

  searchInput.addEventListener('input', debounce(e => {
    _query = e.target.value;
    searchClear.classList.toggle('visible', !!_query);
    refresh();
  }, 220));

  searchClear.addEventListener('click', () => {
    _query = '';
    searchInput.value = '';
    searchClear.classList.remove('visible');
    refresh();
  });

  filterRow.addEventListener('click', e => {
    const chip = e.target.closest('[data-cat]');
    if (!chip) return;
    _category = chip.dataset.cat;
    filterRow.querySelectorAll('.chip').forEach(c => c.classList.toggle('active', c === chip));
    refresh();
  });

  platformFilterRow.addEventListener('click', e => {
    const chip = e.target.closest('[data-plat]');
    if (!chip) return;
    _platform = chip.dataset.plat;
    platformFilterRow.querySelectorAll('.chip').forEach(c => c.classList.toggle('active', c === chip));
    refresh();
  });

  view.querySelector('#viewGrid').addEventListener('click', () => {
    _mode = 'grid'; setViewMode('grid');
    view.querySelector('#viewGrid').classList.add('active');
    view.querySelector('#viewList').classList.remove('active');
    refresh();
  });
  view.querySelector('#viewList').addEventListener('click', () => {
    _mode = 'list'; setViewMode('list');
    view.querySelector('#viewList').classList.add('active');
    view.querySelector('#viewGrid').classList.remove('active');
    refresh();
  });

  view.addEventListener('click', handleFavClick);
  refresh();
}
