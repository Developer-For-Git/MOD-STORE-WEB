// ─── Favorites View ───────────────────────────────────────────────────────────
import { getFavorites, clearFavorites, on } from '../store.js';
import { getCached } from '../api.js';
import { renderCatalog, buildIcon } from './catalog.js';
import { openDetail } from './detail.js';
import { showToast } from '../app.js';

export function renderFavorites(container) {
  container.innerHTML = '';
  const view = document.createElement('div');
  view.className = 'view';

  const favIds = getFavorites();
  const catalog = getCached() || [];
  const favApps = catalog.filter(a => favIds.includes(a.id));

  view.innerHTML = `
    <div class="view-header">
      <div class="view-title-block">
        <h1 class="view-title">My <span>Favorites</span></h1>
        <p class="view-subtitle">${favApps.length} saved ${favApps.length === 1 ? 'app' : 'apps'}</p>
      </div>
      ${favApps.length > 0
        ? `<div class="view-actions"><button class="btn-danger" id="clearFavsBtn">Clear All</button></div>`
        : ''}
    </div>
    <div id="favsContent"></div>`;

  container.appendChild(view);

  const favsContent = view.querySelector('#favsContent');

  if (favApps.length === 0) {
    favsContent.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🤍</div>
        <div class="empty-state-title">No favorites yet</div>
        <p class="empty-state-sub">Tap the ❤️ on any app in the Catalog to save it here.</p>
      </div>`;
    return;
  }

  // Re-use catalog's grid rendering
  const grid = document.createElement('div');
  grid.className = 'apps-grid';

  favApps.forEach((app, i) => {
    const card = document.createElement('div');
    card.className = 'app-card';
    card.dataset.id = app.id;
    card.style.animationDelay = `${i * 30}ms`;
    const icon = buildIcon(app, 'card');
    icon.insertAdjacentHTML('afterbegin', `<span class="card-category-badge">${app.category}</span>`);
    card.appendChild(icon);
    card.insertAdjacentHTML('beforeend', `
      <div class="card-body">
        <div class="card-name">${app.name}</div>
        <div class="card-desc">${app.description}</div>
      </div>`);
    card.addEventListener('click', () => openDetail(app));
    grid.appendChild(card);
  });
  favsContent.appendChild(grid);

  const clearBtn = view.querySelector('#clearFavsBtn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      clearFavorites();
      showToast('Favorites cleared', 'info');
      renderFavoritesInPlace(favsContent);
    });
  }
}

function renderFavoritesInPlace(container) {
  container.innerHTML = `
    <div class="empty-state">
      <div class="empty-state-icon">🤍</div>
      <div class="empty-state-title">No favorites yet</div>
      <p class="empty-state-sub">Tap the ❤️ on any app in the Catalog to save it here.</p>
    </div>`;
}
