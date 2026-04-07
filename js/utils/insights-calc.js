// ─── Insights calculation utilities ──────────────────────────────────────────

/** Total storage footprint of entire catalog (bytes). */
export function totalStorage(apps) {
  return apps.reduce((s, a) => s + (a.size || 0), 0);
}

/** Average app size (bytes). */
export function avgSize(apps) {
  if (!apps.length) return 0;
  return totalStorage(apps) / apps.length;
}

/** Count apps updated within last N days. */
export function recentlyUpdated(apps, days = 30) {
  const cutoff = Date.now() - days * 86400000;
  return apps.filter(a => a.updated && new Date(a.updated).getTime() > cutoff);
}

/** Count apps added within last N days. */
export function freshArrivals(apps, days = 90) {
  const cutoff = Date.now() - days * 86400000;
  return apps
    .filter(a => a.added && new Date(a.added).getTime() > cutoff)
    .sort((a, b) => new Date(b.added) - new Date(a.added));
}

/** Category breakdown: { category -> count }. */
export function categoryBreakdown(apps) {
  const map = {};
  apps.forEach(a => { map[a.category] = (map[a.category] || 0) + 1; });
  return Object.entries(map).sort((a, b) => b[1] - a[1]);
}

/** Update Hall of Fame: rank by how recently they were updated (most recent = 1st). */
export function updateHallOfFame(apps, top = 10) {
  return [...apps]
    .filter(a => a.updated)
    .sort((a, b) => new Date(b.updated) - new Date(a.updated))
    .slice(0, top);
}

/** Days since a date string. */
export function daysSince(dateStr) {
  if (!dateStr) return null;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}

/** Format a date string to locale display. */
export function fmtDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}
