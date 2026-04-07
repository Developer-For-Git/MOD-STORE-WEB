// ─── API: fetches and caches the app catalog ─────────────────────────────────
import { getConfigUrl } from './store.js';

const REMOTE_URL = 'https://raw.githubusercontent.com/Developer-For-Git/MOD-STORE-DATA-/refs/heads/main/apps.json';
const SAMPLE_URL = './data/sample.json';
let _cache = null;

export async function fetchCatalog(forceUrl) {
  const customUrl = forceUrl !== undefined ? forceUrl : getConfigUrl();
  let combinedApps = [];
  let fetchedAny = false;

  const fetchSource = async (url) => {
    try {
      const res = await fetch(url, { cache: 'no-cache' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      return Array.isArray(json) ? json : (json.apps || json.data || []);
    } catch (err) {
      throw err;
    }
  };

  // 1. Always load Default DB
  try {
    const defaultApps = await fetchSource(REMOTE_URL);
    combinedApps.push(...defaultApps);
    fetchedAny = true;
  } catch (err) {
    console.warn('[API] Primary URL failed:', err.message);
  }

  // 2. Load Custom DB if present
  if (customUrl && customUrl !== REMOTE_URL) {
    try {
      const customApps = await fetchSource(customUrl);
      combinedApps.push(...customApps);
      fetchedAny = true;
    } catch (err) {
      console.warn('[API] Custom URL failed:', err.message);
    }
  }

  // 3. Fallback to sample if nothing loaded
  if (!fetchedAny) {
    try {
      combinedApps = await fetchSource(SAMPLE_URL);
    } catch(err) {
      if (_cache) return _cache;
      throw err;
    }
  }

  // Filter for TV and PC platforms only
  combinedApps = combinedApps.filter(app => {
    const p = (app.platform || '').toUpperCase();
    return p === 'TV' || p === 'PC';
  });

  _cache = combinedApps;
  return combinedApps;
}

/** Return cached catalog (or null). */
export function getCached() { return _cache; }

/** The default remote catalog URL. */
export { REMOTE_URL };

/** Invalidate cache and reload. */
export async function reloadCatalog(url) {
  _cache = null;
  return fetchCatalog(url || REMOTE_URL);
}

/** Format bytes into human-readable size string. Handles numbers or strings with units. */
export function formatSize(input) {
  if (!input || input === '—') return '—';
  const s = String(input).trim();
  // If already contains KB/MB/GB (with or without spaces), just return it
  if (/\s*[KMG]B$/i.test(s)) return s;
  const n = parseFloat(s);
  if (isNaN(n)) return s; // 'Varies', 'N/A', etc.
  if (n >= 1e9) return (n / 1e9).toFixed(1) + ' GB';
  if (n >= 1e6) return (n / 1e6).toFixed(0) + ' MB';
  if (n >= 1e3) return (n / 1e3).toFixed(0) + ' KB';
  return n + ' B';
}

/** Format download count. */
export function formatDownloads(n) {
  if (!n) return '—';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(0) + 'K';
  return String(n);
}

/** Generate a CSS gradient string deterministically from a string seed. */
export function seedGradient(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  const palettes = [
    ['#DC143C','#9B0F2B'], ['#4481eb','#04befe'],
    ['#f7971e','#ffd200'], ['#11998e','#38ef7d'],
    ['#6a11cb','#2575fc'], ['#667eea','#764ba2'],
    ['#c94b4b','#4b134f'], ['#2c3e50','#4ca1af'],
    ['#360033','#0b8793'], ['#373b44','#4286f4'],
  ];
  return palettes[h % palettes.length];
}

/** Get initials from app name for the fallback avatar. */
export function getInitials(name) {
  return name.split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();
}
