// ─── Detail Modal View ────────────────────────────────────────────────────────
import { isFavorite, toggleFavorite } from '../store.js';
import { formatSize, formatDownloads, seedGradient, getInitials } from '../api.js';
import { fmtDate } from '../utils/insights-calc.js';
import { showToast } from '../app.js';
import { buildIcon } from './catalog.js';

let _overlay, _container, _content, _closeBtn, _backBtn, _currentApp;

function getEls() {
  _overlay   = document.getElementById('detailModal');
  _container = document.getElementById('detailModalContainer');
  _content   = document.getElementById('detailModalContent');
  _closeBtn  = document.getElementById('detailModalClose');
  _backBtn   = document.getElementById('detailModalBack');
}

export function openDetail(app) {
  getEls();
  _currentApp = app;
  _content.innerHTML = '';

  // ── Resolve download URL ──────────────────────────────────────────────────
  const resolvedDownload = (app.downloadUrl && app.downloadUrl !== '#')
    ? app.downloadUrl
    : (app.repoUrl && app.repoUrl !== '' ? app.repoUrl
      : (app.githubRepo ? `https://github.com/${app.githubRepo}/releases/latest` : null));

  const repoLink = app.repoUrl || (app.githubRepo ? `https://github.com/${app.githubRepo}` : null)
    || (app.gitlabRepo && app.gitlabDomain ? `https://${app.gitlabDomain}/${app.gitlabRepo}` : null);


  // ── Unified Hero Banner ───────────────────────────────────────────────────
  const bannerWrap = document.createElement('div');
  bannerWrap.className = 'detail-banner-wrapper';

  const bannerContent = document.createElement('div');
  bannerContent.className = 'detail-banner-content';

  const iconWrap = document.createElement('div');
  iconWrap.className = 'detail-icon';
  const [c1, c2] = seedGradient(app.id || app.name);
  const fb = document.createElement('div');
  fb.className = 'icon-fallback';
  fb.style.background = `linear-gradient(135deg, ${c1}, ${c2})`;
  fb.textContent = getInitials(app.name);
  iconWrap.appendChild(fb);
  if (app.icon) {
    const img = new Image();
    img.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:inherit;opacity:0;transition:opacity 0.3s';
    img.onload = () => { img.style.opacity = '1'; };
    img.src = app.icon;
    iconWrap.style.position = 'relative';
    iconWrap.appendChild(img);
  }

  const info = document.createElement('div');
  info.className = 'detail-header-info';
  const fav = isFavorite(app.id);
  const platformLabel = app.platform || '';
  
  // Build info inner HTML
  info.innerHTML = `
    <h2 class="detail-name" id="detailModalTitle">${app.name}</h2>
    <div style="display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;margin-bottom:0.25rem">
      <span class="detail-category-tag">${app.subcategory || app.category}</span>
      ${platformLabel ? `<span class="detail-platform-tag">${platformLabel}</span>` : ''}
    </div>
    ${app.author ? `<div style="font-size:0.9rem;color:var(--text-3);margin-bottom:0.5rem">by ${app.author}</div>` : ''}
    ${app.rating ? `<div class="detail-rating" style="margin-bottom:0.75rem">
      <span class="stars">${'<svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="none"/></svg>'.repeat(Math.round(app.rating))}</span>
      <span class="count">${app.rating}</span>
      <span>&bull; v${app.version || '—'}</span>
    </div>` : ''}
  `;

  // Append actions directly inside the header info
  const actions = document.createElement('div');
  actions.className = 'detail-actions';
  actions.innerHTML = `
    ${resolvedDownload
      ? `<a href="${resolvedDownload}" class="btn-primary" target="_blank" rel="noopener noreferrer" id="detailDownloadBtn">
           <svg viewBox="0 0 24 24" fill="none" style="width:16px;height:16px"><path d="M12 16l-6-6h4V4h4v6h4l-6 6z" fill="currentColor"/><rect x="4" y="18" width="16" height="2" rx="1" fill="currentColor"/></svg>
           Download
         </a>`
      : ''}
    ${repoLink ? `<a href="${repoLink}" class="btn-secondary-link" target="_blank" rel="noopener noreferrer" id="detailRepoBtn" title="View Repository">
        <svg viewBox="0 0 24 24" fill="none" style="width:15px;height:15px"><path d="M12 2C6.48 2 2 6.58 2 12.22c0 4.51 2.87 8.33 6.84 9.68.5.09.68-.22.68-.49 0-.24-.01-.87-.01-1.71-2.78.62-3.37-1.37-3.37-1.37-.45-1.17-1.1-1.48-1.1-1.48-.9-.63.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.13-4.56-5.04 0-1.11.39-2.02 1.03-2.73-.1-.26-.45-1.3.1-2.7 0 0 .84-.28 2.75 1.05A9.4 9.4 0 0 1 12 6.84c.85 0 1.7.12 2.5.33 1.91-1.33 2.75-1.05 2.75-1.05.55 1.4.2 2.44.1 2.7.64.71 1.03 1.62 1.03 2.73 0 3.92-2.34 4.78-4.57 5.03.36.32.68.94.68 1.9 0 1.37-.01 2.48-.01 2.81 0 .27.18.59.69.49C19.13 20.55 22 16.73 22 12.22 22 6.58 17.52 2 12 2z" fill="currentColor"/></svg>
        Repo
      </a>` : ''}
    <button class="detail-fav-btn ${fav ? 'is-fav' : ''}" id="detailFavBtn" aria-label="${fav ? 'Remove from' : 'Add to'} favorites">
      <svg viewBox="0 0 24 24" fill="none"><path id="detailFavPath" d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" stroke="currentColor" stroke-width="1.8" ${fav ? 'fill="currentColor"' : ''}/></svg>
    </button>`;
  info.appendChild(actions);

  bannerContent.appendChild(iconWrap);
  bannerContent.appendChild(info);
  bannerWrap.appendChild(bannerContent);
  _content.appendChild(bannerWrap);

  // ── Main Layout (Grid) ───────────────────────────────────────────────────
  const grid = document.createElement('div');
  grid.className = 'detail-grid';

  const mainCol = document.createElement('div');
  mainCol.className = 'detail-main-col';
  
  const sideCol = document.createElement('div');
  sideCol.className = 'detail-side-col';

  // ── Screenshots (Main Column) ─────────────────────────────────────────────
  const isValidURL = (url) => {
    if (!url || typeof url !== 'string') return false;
    const s = url.trim().toLowerCase();
    return s.length > 0 && s !== 'n/a' && s !== 'none' && s !== 'null' && s !== 'undefined' && s !== '-' && !url.endsWith('/');
  };
  const shots = (app.screenshots || []).filter(isValidURL);
  
  if (shots.length > 0) {
    const gallery = document.createElement('div');
    gallery.className = 'detail-screenshots';
    gallery.innerHTML = `
      <p class="detail-section-title">Screenshots</p>
      <div class="screenshots-scroll">
        ${shots.map(s => `
          <div class="screenshot-item" style="background:var(--bg-3);border-radius:var(--r-lg);height:180px;min-width:120px;display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative;cursor:zoom-in;">
            <img src="${s}" 
                 loading="lazy" 
                 referrerpolicy="no-referrer"
                 class="screenshot-thumb"
                 style="opacity:0;transition:opacity 0.4s ease;width:auto;height:100%"
                 onload="this.style.opacity='1'"
                 onerror="let p=this.parentElement; p.style.display='none'; p.classList.add('load-failed'); if(!p.parentElement.querySelector('.screenshot-item:not(.load-failed)')) p.closest('.detail-screenshots').style.display='none';">
          </div>
        `).join('')}
      </div>`;
      
    const thumbImgs = Array.from(gallery.querySelectorAll('.screenshot-thumb'));
    thumbImgs.forEach((img, idx) => {
      img.addEventListener('click', () => {
        let currentIndex = idx;
        
        const lightbox = document.createElement('div');
        lightbox.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.85);backdrop-filter:blur(8px);z-index:9999;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity 0.2s';
        
        const fullImg = document.createElement('img');
        fullImg.src = shots[currentIndex];
        fullImg.style.cssText = 'max-width:85%;max-height:85%;object-fit:contain;border-radius:12px;box-shadow:0 10px 40px rgba(0,0,0,0.5);transform:scale(0.95);transition:transform 0.2s, opacity 0.2s;user-select:none';
        
        // Close Button
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" style="width:24px;height:24px"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
        closeBtn.style.cssText = 'position:absolute;top:20px;right:20px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.1);color:#fff;width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;backdrop-filter:blur(4px);z-index:2;transition:background 0.2s';
        closeBtn.onmouseover = () => closeBtn.style.background = 'rgba(255,255,255,0.2)';
        closeBtn.onmouseleave = () => closeBtn.style.background = 'rgba(255,255,255,0.1)';
        
        // Prev Button
        const prevBtn = document.createElement('button');
        prevBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" style="width:32px;height:32px"><path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        prevBtn.style.cssText = 'position:absolute;left:20px;top:50%;transform:translateY(-50%);background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.1);color:#fff;width:50px;height:50px;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;backdrop-filter:blur(4px);z-index:2;transition:background 0.2s';
        prevBtn.onmouseover = () => prevBtn.style.background = 'rgba(255,255,255,0.2)';
        prevBtn.onmouseleave = () => prevBtn.style.background = 'rgba(255,255,255,0.1)';
        
        // Next Button
        const nextBtn = document.createElement('button');
        nextBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" style="width:32px;height:32px"><path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        nextBtn.style.cssText = 'position:absolute;right:20px;top:50%;transform:translateY(-50%);background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.1);color:#fff;width:50px;height:50px;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;backdrop-filter:blur(4px);z-index:2;transition:background 0.2s';
        nextBtn.onmouseover = () => nextBtn.style.background = 'rgba(255,255,255,0.2)';
        nextBtn.onmouseleave = () => nextBtn.style.background = 'rgba(255,255,255,0.1)';

        const showImage = (index) => {
          if (index < 0) index = shots.length - 1;
          if (index >= shots.length) index = 0;
          currentIndex = index;
          fullImg.style.opacity = '0';
          setTimeout(() => {
            fullImg.src = shots[currentIndex];
            fullImg.onload = () => fullImg.style.opacity = '1';
          }, 150);
        };
        
        const closeLightbox = () => {
          lightbox.style.opacity = '0';
          fullImg.style.transform = 'scale(0.95)';
          setTimeout(() => lightbox.remove(), 200);
          document.removeEventListener('keydown', keyHandler);
        };

        const keyHandler = (e) => {
          if (e.key === 'Escape') closeLightbox();
          if (e.key === 'ArrowLeft') showImage(currentIndex - 1);
          if (e.key === 'ArrowRight') showImage(currentIndex + 1);
        };
        document.addEventListener('keydown', keyHandler);

        closeBtn.addEventListener('click', closeLightbox);
        prevBtn.addEventListener('click', (e) => { e.stopPropagation(); showImage(currentIndex - 1); });
        nextBtn.addEventListener('click', (e) => { e.stopPropagation(); showImage(currentIndex + 1); });
        lightbox.addEventListener('click', (e) => { if(e.target === lightbox) closeLightbox(); });

        if (shots.length > 1) {
          lightbox.appendChild(prevBtn);
          lightbox.appendChild(nextBtn);
        }
        
        lightbox.appendChild(fullImg);
        lightbox.appendChild(closeBtn);
        document.body.appendChild(lightbox);
        
        requestAnimationFrame(() => {
          lightbox.style.opacity = '1';
          fullImg.style.transform = 'scale(1)';
        });
      });
    });
    mainCol.appendChild(gallery);
  }

  // ── About (Main Column) ───────────────────────────────────────────────────
  const body = document.createElement('div');
  body.className = 'detail-body';
  body.innerHTML = `
    <div>
      <p class="detail-section-title">About</p>
      <p class="detail-description">${app.description}</p>
    </div>`;
  mainCol.appendChild(body);

  // ── Side Column (Cards) ───────────────────────────────────────────────────
  const pkgId = app.packageName || app.id;
  const tagsHtml = (app.tags || []).map(t => `<span class="tag-pill">#${t}</span>`).join('');
  
  const sideContent = document.createElement('div');
  sideContent.className = 'detail-body side-content-wrapper';
  
  // Premium Stats Card
  const statsHtml = `
    <div class="detail-info-card">
      <div class="info-row">
        <span class="info-label">Size</span>
        <span class="info-value">${app.size && app.size !== 'Varies' ? formatSize(app.size) : (app.size || '—')}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Downloads</span>
        <span class="info-value">${formatDownloads(app.downloads)}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Platform</span>
        <span class="info-value">${app.platform || '—'}</span>
      </div>
    </div>
  `;

  // Technical Info Card
  const techHtml = `
    <div class="detail-info-card" style="margin-top:var(--sp-4)">
      <p class="detail-section-title" style="margin-bottom:var(--sp-4)">Technical Info</p>
      <div class="info-grid">
        ${pkgId ? `<div><span class="info-label">Package</span><br><span class="info-value mono">${pkgId}</span></div>` : ''}
        <div><span class="info-label">Version</span><br><span class="info-value">${app.version || app.latestVersion || '—'}</span></div>
        <div><span class="info-label">Category</span><br><span class="info-value">${app.category}</span></div>
        <div><span class="info-label">Author</span><br><span class="info-value">${app.author || '—'}</span></div>
        ${app.officialSite ? `<div style="padding-top:0.5rem;grid-column:1/-1"><span class="info-label">Official Site</span><br><a href="${app.officialSite}" target="_blank" rel="noopener" style="color:var(--accent);font-size:0.78rem;word-break:break-all">${app.officialSite}</a></div>` : ''}
      </div>
    </div>
  `;

  sideContent.innerHTML = `
    ${statsHtml}
    ${techHtml}
    ${tagsHtml ? `<div style="margin-top:var(--sp-4)"><p class="detail-section-title">Tags</p><div class="detail-tags">${tagsHtml}</div></div>` : ''}
  `;
  
  sideCol.appendChild(sideContent);

  grid.appendChild(mainCol);
  grid.appendChild(sideCol);
  _content.appendChild(grid);

  // ── Favourite toggle ───────────────────────────────────────────────────────
  actions.querySelector('#detailFavBtn').addEventListener('click', () => {
    const nowFav = toggleFavorite(app.id);
    const btn  = actions.querySelector('#detailFavBtn');
    const path = actions.querySelector('#detailFavPath');
    btn.classList.toggle('is-fav', nowFav);
    path.setAttribute('fill', nowFav ? 'currentColor' : 'none');
    // Sync all other fav buttons on page
    document.querySelectorAll(`[data-fav="${app.id}"]`).forEach(b => {
      b.classList.toggle('is-fav', nowFav);
      const p = b.querySelector('path');
      if (p) p.setAttribute('fill', nowFav ? 'currentColor' : 'none');
    });
    showToast(nowFav ? `❤️ Added to Favorites` : `💔 Removed from Favorites`, nowFav ? 'success' : 'info');
  });

  // ── Open modal ────────────────────────────────────────────────────────────
  _overlay.setAttribute('aria-hidden', 'false');
  _container.classList.add('modal-full');
  _overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  _overlay.scrollTop = 0;
  _closeBtn.focus();
}

export function closeDetail() {
  getEls();
  _overlay.classList.remove('open');
  _overlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  setTimeout(() => { if (_content) _content.innerHTML = ''; }, 320);
}

export function initDetailModal() {
  getEls();
  _closeBtn.addEventListener('click', closeDetail);
  if (_backBtn) _backBtn.addEventListener('click', closeDetail);
  _overlay.addEventListener('click', e => { if (e.target === _overlay) closeDetail(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && _overlay.classList.contains('open')) closeDetail();
  });
}
