// ─── About View ───────────────────────────────────────────────────────────────
export function renderAbout(container) {
  container.innerHTML = '';
  const view = document.createElement('div');
  view.className = 'view';

  view.innerHTML = `
    <div class="view-header">
      <div class="view-title-block">
        <h1 class="view-title">App <span>About</span></h1>
        <p class="view-subtitle">Information and tech stack</p>
      </div>
    </div>

    <div class="settings-section" style="margin-top: 1rem;">
      <div class="settings-row">
        <div class="settings-row-icon" style="background:var(--surface-crimson);border:1px solid var(--border-crimson)">
          <svg viewBox="0 0 32 32" fill="none" style="width:18px;height:18px"><path d="M16 2L28 9V23L16 30L4 23V9L16 2Z" stroke="url(#ag)" stroke-width="1.5"/><path d="M16 7L23 11V19L16 23L9 19V11L16 7Z" fill="url(#ag)" opacity="0.7"/><defs><linearGradient id="ag" x1="4" y1="2" x2="28" y2="30"><stop stop-color="#FF1744"/><stop offset="1" stop-color="#9B0F2B"/></linearGradient></defs></svg>
        </div>
        <div class="settings-row-info">
          <div class="settings-row-label">MOD Store Web</div>
          <div class="settings-row-sub">Version 1.0.0 · PWA · Open Source</div>
        </div>
      </div>
      <div class="settings-row">
        <div class="settings-row-icon" style="background:rgba(255,255,255,0.04);border:1px solid var(--border)">
          <svg viewBox="0 0 24 24" fill="none" style="color:var(--text-2)"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" fill="currentColor"/></svg>
        </div>
        <div class="settings-row-info">
          <div class="settings-row-label">Developer-For-Git</div>
          <div class="settings-row-sub"><a href="https://github.com/Developer-For-Git" target="_blank" style="color:var(--crimson);text-decoration:none">View GitHub Profile</a></div>
        </div>
      </div>
      <div class="settings-row">
        <div class="settings-row-icon" style="background:rgba(255,255,255,0.04);border:1px solid var(--border)">
          <svg viewBox="0 0 24 24" fill="none" style="color:var(--text-2)"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        <div class="settings-row-info">
          <div class="settings-row-label">Tech Stack</div>
          <div class="settings-row-sub">Built with Vanilla HTML, CSS, JavaScript</div>
        </div>
      </div>
    </div>`;

  container.appendChild(view);
}
