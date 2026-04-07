// ─── App Entry Point & Router ─────────────────────────────────────────────────
import { fetchCatalog, reloadCatalog } from './api.js';
import { renderCatalog } from './views/catalog.js';
import { renderInsights } from './views/insights.js';
import { renderFavorites } from './views/favorites.js';
import { renderSettings } from './views/settings.js';
import { renderAbout } from './views/about.js';
import { renderSupport } from './views/support.js';
import { initDetailModal } from './views/detail.js';

// ── Globals ───────────────────────────────────────────────────────────────────
let _currentView = 'catalog';
let _apps = [];

const viewContainer = document.getElementById('viewContainer');
const loadingScreen = document.getElementById('loadingScreen');
const allNavItems   = document.querySelectorAll('[data-view]');

// ── Toast system ──────────────────────────────────────────────────────────────
export function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const icons = {
    success: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><polyline points="22 4 12 14.01 9 11.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    error:   '<svg class="toast-icon" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    info:    '<svg class="toast-icon" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="16" r="1" fill="currentColor"/></svg>',
  };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `${icons[type] || icons.info}<span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('out');
    toast.addEventListener('animationend', () => toast.remove());
  }, 3000);
}

// ── Navigation ────────────────────────────────────────────────────────────────
function setActiveNav(view) {
  allNavItems.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === view);
  });
}

function navigate(view) {
  if (view === _currentView && !loadingScreen.style.display) return;
  _currentView = view;
  setActiveNav(view);
  renderView(view);
}

function renderView(view) {
  viewContainer.innerHTML = '';
  switch (view) {
    case 'catalog':  renderCatalog(viewContainer, _apps); break;
    case 'insights': renderInsights(viewContainer, _apps); break;
    case 'favorites': renderFavorites(viewContainer); break;
    case 'settings': renderSettings(viewContainer, async url => {
      _apps = await reloadCatalog(url || undefined);
    }); break;
    case 'support': renderSupport(viewContainer); break;
    case 'about': renderAbout(viewContainer); break;
  }
  viewContainer.scrollTop = 0;
}

// ── Boot ──────────────────────────────────────────────────────────────────────
async function boot() {
  // Register service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js').catch(err => {
      console.warn('[SW] Registration failed:', err);
    });
  }

  // Capture PWA install prompt
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    window._deferredInstallPrompt = e;
  });

  // Online/offline indicator
  const dot  = document.getElementById('statusDot');
  const text = document.getElementById('statusText');
  function updateOnline() {
    const online = navigator.onLine;
    dot.className  = 'status-dot ' + (online ? 'online' : 'offline');
    text.textContent = online ? 'Online' : 'Offline';
  }
  window.addEventListener('online',  updateOnline);
  window.addEventListener('offline', updateOnline);
  updateOnline();

  // Boot: fetch catalog
  try {
    _apps = await fetchCatalog();
  } catch (err) {
    console.error('[App] Failed to load catalog:', err);
    showToast('⚠️ Could not load catalog. Check your connection.', 'error');
    _apps = [];
  }

  // Hide loading screen and show catalog
  loadingScreen.style.display = 'none';
  renderView('catalog');

  // Attach nav event listeners
  allNavItems.forEach(btn => {
    btn.addEventListener('click', () => navigate(btn.dataset.view));
  });

  // Config modal
  const configModal       = document.getElementById('configModal');
  const configModalClose  = document.getElementById('configModalClose');
  const configCancelBtn   = document.getElementById('configCancelBtn');
  const configLoadBtn     = document.getElementById('configLoadBtn');
  const configUrlInput    = document.getElementById('configUrlInput');

  function openConfig() {
    configModal.classList.add('open');
    configModal.setAttribute('aria-hidden', 'false');
    configUrlInput.focus();
  }
  function closeConfig() {
    configModal.classList.remove('open');
    configModal.setAttribute('aria-hidden', 'true');
  }

  configModalClose?.addEventListener('click', closeConfig);
  configCancelBtn?.addEventListener('click', closeConfig);
  configModal?.addEventListener('click', e => { if (e.target === configModal) closeConfig(); });

  configLoadBtn?.addEventListener('click', async () => {
    const url = configUrlInput.value.trim();
    closeConfig();
    showToast('⚡ Loading catalog…', 'info');
    try {
      _apps = await reloadCatalog(url || undefined);
      renderView(_currentView);
      showToast('✅ Catalog loaded', 'success');
    } catch {
      showToast('❌ Failed to load URL', 'error');
    }
  });

  // Detail modal setup
  initDetailModal();
}

boot();
