// ─── Search & filter utilities ───────────────────────────────────────────────

/** Normalise a string for comparison. */
function norm(s) { return String(s || '').toLowerCase().trim(); }

/**
 * Filter apps by search query and category.
 * @param {Array}  apps      - full catalog
 * @param {string} query     - search text
 * @param {string} category  - category filter ('All' = no filter)
 * @returns {Array} filtered list
 */
export function filterApps(apps, query = '', category = 'All', platform = 'All') {
  const q = norm(query);
  return apps.filter(app => {
    // Platform filter
    if (platform !== 'All' && norm(app.platform) !== norm(platform)) return false;
    // Category filter
    if (category !== 'All' && norm(app.category) !== norm(category)) return false;
    // Search
    if (!q) return true;
    return (
      norm(app.name).includes(q) ||
      norm(app.description).includes(q) ||
      norm(app.category).includes(q) ||
      norm(app.subcategory).includes(q) ||
      (app.tags || []).some(t => norm(t).includes(q))
    );
  });
}

/**
 * Extract unique categories from catalog with counts.
 * @param {Array} apps
 * @returns {Array<{name, count}>} sorted by count desc
 */
export function getCategories(apps) {
  const map = {};
  apps.forEach(a => { map[a.category] = (map[a.category] || 0) + 1; });
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));
}

/** Simple debounce. */
export function debounce(fn, ms = 200) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}
