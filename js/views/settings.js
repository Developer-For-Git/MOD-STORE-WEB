// ─── Settings View ────────────────────────────────────────────────────────────
import { getConfigUrl, setConfigUrl, clearFavorites, getFavorites } from '../store.js';
import { reloadCatalog, REMOTE_URL } from '../api.js';
import { showToast } from '../app.js';

export function renderSettings(container, onReload) {
  container.innerHTML = '';
  const view = document.createElement('div');
  view.className = 'view';

  const currentUrl = getConfigUrl();
  const activeUrl  = currentUrl || REMOTE_URL;
  const favCount   = getFavorites().length;

  view.innerHTML = `
    <div class="view-header">
      <div class="view-title-block">
        <h1 class="view-title">App <span>Settings</span></h1>
        <p class="view-subtitle">Configure catalog source and preferences</p>
      </div>
    </div>

    <!-- Catalog Sources -->
    <div class="settings-section">
      <div class="settings-section-title">Catalog Sources</div>
      
      <!-- Default Catalog -->
      <div class="settings-row" style="opacity: 0.7; pointer-events: none;">
        <div class="settings-row-icon" style="background:#1e1e1e;border:1px solid #333">
          <svg viewBox="0 0 24 24" fill="none" style="color:var(--text-2)"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/></svg>
        </div>
        <div class="settings-row-info">
          <div class="settings-row-label">Primary Catalog <span class="card-category-badge" style="background:rgba(255,255,255,0.1);color:#fff;margin-left:6px;font-size:0.6rem">LOCKED</span></div>
          <div class="settings-row-sub" style="word-break:break-all;font-size:0.7rem">${REMOTE_URL}</div>
        </div>
      </div>

      <!-- Additional Catalog -->
      <div class="settings-row">
        <div class="settings-row-icon" style="background:var(--surface-crimson);border:1px solid var(--border-crimson)">
          <svg viewBox="0 0 24 24" fill="none" style="color:var(--crimson)"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor"/></svg>
        </div>
        <div class="settings-row-info">
          <div class="settings-row-label">Additional JSON URL</div>
          <div class="settings-row-sub" id="currentUrlDisplay" style="word-break:break-all;font-size:0.7rem">${currentUrl || 'None configured'}</div>
        </div>
        <div class="settings-row-action">
          <button class="btn-secondary" id="editUrlBtn" style="font-size:0.8rem;padding:0.4rem 0.8rem">${currentUrl ? 'Edit' : 'Add'}</button>
        </div>
      </div>
      
      <div class="settings-row" id="urlEditorRow" style="display:none;flex-direction:column;align-items:stretch;gap:0.75rem">
        <div class="form-group" style="margin:0">
          <label class="form-label">Custom JSON URL</label>
          <input type="url" id="urlInput" class="form-input" placeholder="https://example.com/extra-apps.json" value="${currentUrl || ''}">
          <p class="form-hint">Extend the primary catalog with an additional <code style="color:var(--text-crimson)">apps</code> array matching the schema.</p>
        </div>
        <div class="form-actions" style="padding:0">
          <button class="btn-danger" id="removeUrlBtn" style="display:${currentUrl ? 'block' : 'none'}">Remove</button>
          <div style="flex:1"></div>
          <button class="btn-secondary" id="cancelUrlBtn">Cancel</button>
          <button class="btn-primary" id="saveUrlBtn">Save & Reload</button>
        </div>
      </div>
    </div>

    <!-- Data Management -->
    <div class="settings-section">
      <div class="settings-section-title">Data Management</div>
      <div class="settings-row">
        <div class="settings-row-icon" style="background:rgba(255,255,255,0.04);border:1px solid var(--border)">
          <svg viewBox="0 0 24 24" fill="none" style="color:var(--text-2)"><path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" stroke="currentColor" stroke-width="1.8" fill="currentColor"/></svg>
        </div>
        <div class="settings-row-info">
          <div class="settings-row-label">Saved Favorites</div>
          <div class="settings-row-sub">${favCount} app${favCount !== 1 ? 's' : ''} saved locally</div>
        </div>
        <div class="settings-row-action">
          <button class="btn-danger" id="clearFavsBtn" style="font-size:0.78rem">Clear</button>
        </div>
      </div>
      <div class="settings-row">
        <div class="settings-row-icon" style="background:rgba(255,255,255,0.04);border:1px solid var(--border)">
          <svg viewBox="0 0 24 24" fill="none" style="color:var(--text-2)"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" stroke-width="1.8"/></svg>
        </div>
        <div class="settings-row-info">
          <div class="settings-row-label">Clear App Cache</div>
          <div class="settings-row-sub">Force re-fetch the catalog JSON</div>
        </div>
        <div class="settings-row-action">
          <button class="btn-secondary" id="clearCacheBtn" style="font-size:0.78rem">Clear</button>
        </div>
      </div>
    </div>

    <!-- PWA -->
    <div class="settings-section">
      <div class="settings-section-title">Progressive Web App</div>
      <div class="settings-row">
        <div class="settings-row-icon" style="background:rgba(255,255,255,0.04);border:1px solid var(--border)">
          <svg viewBox="0 0 24 24" fill="none" style="color:var(--text-2)"><rect x="5" y="2" width="14" height="20" rx="2" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="17" r="1" fill="currentColor"/></svg>
        </div>
        <div class="settings-row-info">
          <div class="settings-row-label">Install as App</div>
          <div class="settings-row-sub">Add to Home Screen for offline access</div>
        </div>
        <div class="settings-row-action">
          <button class="btn-secondary" id="installPwaBtn" style="font-size:0.78rem">Install</button>
        </div>
      </div>
    </div>
`;
  container.appendChild(view);

  // ── URL editor ─────────────────────────────────────────────────────────────
  const editBtn     = view.querySelector('#editUrlBtn');
  const removeBtn   = view.querySelector('#removeUrlBtn');
  const cancelBtn   = view.querySelector('#cancelUrlBtn');
  const saveBtn     = view.querySelector('#saveUrlBtn');
  const editorRow   = view.querySelector('#urlEditorRow');
  const urlInput    = view.querySelector('#urlInput');
  const urlDisplay  = view.querySelector('#currentUrlDisplay');

  editBtn.addEventListener('click', () => {
    editorRow.style.display = 'flex';
    editBtn.style.display = 'none';
    urlInput.focus();
  });
  cancelBtn.addEventListener('click', () => {
    editorRow.style.display = 'none';
    editBtn.style.display = '';
  });
  removeBtn.addEventListener('click', async () => {
    setConfigUrl('');
    urlDisplay.textContent = 'None configured';
    urlInput.value = '';
    editorRow.style.display = 'none';
    editBtn.style.display = '';
    editBtn.textContent = 'Add';
    removeBtn.style.display = 'none';
    showToast('⚡ Reloading catalog…', 'info');
    try {
      if (onReload) await onReload();
      showToast('✅ Catalog reloaded', 'success');
    } catch {
      showToast('❌ Failed to reload catalog', 'error');
    }
  });
  saveBtn.addEventListener('click', async () => {
    const url = urlInput.value.trim();
    setConfigUrl(url);
    urlDisplay.textContent = url || 'None configured';
    editorRow.style.display = 'none';
    editBtn.style.display = '';
    editBtn.textContent = url ? 'Edit' : 'Add';
    removeBtn.style.display = url ? 'block' : 'none';
    showToast('⚡ Reloading catalog…', 'info');
    try {
      if (onReload) await onReload(url || null);
      showToast('✅ Catalog loaded', 'success');
    } catch {
      showToast('❌ Failed to load catalog', 'error');
    }
  });

  // ── Clear favorites ────────────────────────────────────────────────────────
  view.querySelector('#clearFavsBtn').addEventListener('click', () => {
    clearFavorites();
    view.querySelector('.settings-row .settings-row-sub').textContent = '0 apps saved locally';
    showToast('Favorites cleared', 'info');
  });

  // ── Clear cache ────────────────────────────────────────────────────────────
  view.querySelector('#clearCacheBtn').addEventListener('click', async () => {
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));
      showToast('Cache cleared', 'success');
    } else {
      showToast('Cache API not available', 'error');
    }
  });

  // ── PWA install ────────────────────────────────────────────────────────────
  view.querySelector('#installPwaBtn').addEventListener('click', () => {
    if (window._deferredInstallPrompt) {
      window._deferredInstallPrompt.prompt();
    } else {
      showToast('Open in Chrome/Edge and use "Add to Home Screen"', 'info');
    }
  });
}
