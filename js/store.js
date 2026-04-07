// ─── Store: localStorage-backed state management ─────────────────────────────
const KEYS = {
  FAVORITES: 'modstore_favorites',
  CONFIG_URL: 'modstore_config_url',
  VIEW_MODE:  'modstore_view_mode',
};

function load(key, fallback) {
  try { const v = localStorage.getItem(key); return v !== null ? JSON.parse(v) : fallback; }
  catch { return fallback; }
}
function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

// ── Reactive state ────────────────────────────────────────────────────────────
const listeners = {};
function emit(event, data) {
  (listeners[event] || []).forEach(fn => fn(data));
}
export function on(event, fn) {
  if (!listeners[event]) listeners[event] = [];
  listeners[event].push(fn);
}

// ── Favorites ─────────────────────────────────────────────────────────────────
let _favs = new Set(load(KEYS.FAVORITES, []));

export function isFavorite(id) { return _favs.has(id); }

export function toggleFavorite(id) {
  if (_favs.has(id)) { _favs.delete(id); }
  else { _favs.add(id); }
  save(KEYS.FAVORITES, [..._favs]);
  emit('favorites', { id, isFav: _favs.has(id) });
  return _favs.has(id);
}

export function getFavorites() { return [..._favs]; }
export function clearFavorites() {
  _favs = new Set();
  save(KEYS.FAVORITES, []);
  emit('favorites', { cleared: true });
}

// ── Config URL ─────────────────────────────────────────────────────────────────
export function getConfigUrl() { return load(KEYS.CONFIG_URL, ''); }
export function setConfigUrl(url) {
  save(KEYS.CONFIG_URL, url);
  emit('config', { url });
}

// ── View mode (grid | list) ───────────────────────────────────────────────────
export function getViewMode() { return load(KEYS.VIEW_MODE, 'grid'); }
export function setViewMode(mode) {
  save(KEYS.VIEW_MODE, mode);
  emit('viewMode', { mode });
}
