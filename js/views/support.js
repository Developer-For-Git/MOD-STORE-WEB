// ─── Support View ─────────────────────────────────────────────────────────────
export function renderSupport(container) {
  container.innerHTML = '';
  const view = document.createElement('div');
  view.className = 'view';

  view.innerHTML = `
    <div class="view-header">
      <div class="view-title-block">
        <h1 class="view-title">Help & <span>Support</span></h1>
        <p class="view-subtitle">Get in touch with the MOD Store team</p>
      </div>
    </div>

    <div class="settings-section" style="margin-top: 1rem;">
      <div class="settings-section-title">Contact Us</div>
      
      <div id="requestAppBtn" class="settings-row" style="cursor:pointer">
        <div class="settings-row-icon" style="background:rgba(255,255,255,0.04);border:1px solid var(--border)">
          <svg viewBox="0 0 24 24" fill="none" style="color:var(--text-2)"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        <div class="settings-row-info">
          <div class="settings-row-label">Request an App</div>
          <div class="settings-row-sub">Missing an app? Let us know and we'll add it</div>
        </div>
      </div>
      
      <div id="reportBugBtn" class="settings-row" style="cursor:pointer">
        <div class="settings-row-icon" style="background:rgba(255,255,255,0.04);border:1px solid var(--border)">
          <svg viewBox="0 0 24 24" fill="none" style="color:var(--text-2)"><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 8v4M12 16h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        <div class="settings-row-info">
          <div class="settings-row-label">Report a Bug / Feedback</div>
          <div class="settings-row-sub">Found a glitch or have ideas to improve? Tell us!</div>
        </div>
      </div>
      
      <a href="mailto:modstoredeveloperteam@outlook.com?subject=Contact%20Developer" class="settings-row" style="text-decoration:none;cursor:pointer">
        <div class="settings-row-icon" style="background:var(--surface-crimson);border:1px solid var(--border-crimson)">
          <svg viewBox="0 0 24 24" fill="none" style="color:var(--crimson)"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        <div class="settings-row-info">
          <div class="settings-row-label">Talk to Us</div>
          <div class="settings-row-sub">Just want to chat with the developer? Say hello!</div>
        </div>
      </a>
      
    </div>
    
    <div style="text-align:center;margin-top:2rem;color:var(--text-3);font-size:0.85rem">
       Replies will be from <a href="mailto:modstoredeveloperteam@outlook.com" style="color:var(--crimson)">modstoredeveloperteam@outlook.com</a>
    </div>
  `;

  container.appendChild(view);

  // ── Modal Logic ─────────────────────────────────────────────────────────────
  const requestAppBtn = view.querySelector('#requestAppBtn');
  requestAppBtn.addEventListener('click', () => {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.8);backdrop-filter:blur(5px);z-index:9999;display:flex;align-items:center;justify-content:center;padding:1rem;opacity:0;transition:opacity 0.2s;';
    
    const modal = document.createElement('div');
    modal.style.cssText = 'background:var(--bg-1);border:1px solid var(--border);border-radius:12px;width:100%;max-width:400px;padding:1.5rem;box-shadow:0 10px 40px rgba(0,0,0,0.5);display:flex;flex-direction:column;gap:1.5rem;transform:scale(0.95);transition:transform 0.2s;';
    
    modal.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <h2 style="font-size:1.2rem;font-weight:600;margin:0;color:var(--text-1)">Request an App</h2>
        <button id="closeReqModal" style="background:none;border:none;color:var(--text-3);cursor:pointer;padding:0.25rem;">
          <svg viewBox="0 0 24 24" fill="none" style="width:20px;height:20px"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </button>
      </div>
      <div style="display:flex;flex-direction:column;gap:1rem;">
        <div>
          <label style="display:block;font-size:0.85rem;color:var(--text-2);margin-bottom:0.4rem;">App Name <span style="color:var(--crimson)">*</span></label>
          <input type="text" id="reqAppName" placeholder="e.g. Spotify" style="width:100%;background:rgba(255,255,255,0.05);border:1px solid var(--border);color:#fff;border-radius:8px;padding:0.75rem;font-size:0.95rem;outline:none;transition:border-color 0.2s;" />
        </div>
        <div>
          <label style="display:block;font-size:0.85rem;color:var(--text-2);margin-bottom:0.4rem;">App Link (Optional)</label>
          <input type="url" id="reqAppLink" placeholder="e.g. https://example.com" style="width:100%;background:rgba(255,255,255,0.05);border:1px solid var(--border);color:#fff;border-radius:8px;padding:0.75rem;font-size:0.95rem;outline:none;" />
        </div>
        <div>
          <label style="display:block;font-size:0.85rem;color:var(--text-2);margin-bottom:0.4rem;">Description or Reason (Optional)</label>
          <textarea id="reqAppDesc" rows="3" placeholder="Tell us why we should add it..." style="width:100%;background:rgba(255,255,255,0.05);border:1px solid var(--border);color:#fff;border-radius:8px;padding:0.75rem;font-size:0.95rem;outline:none;resize:none;font-family:inherit;"></textarea>
        </div>
      </div>
      <button id="submitReqBtn" class="btn-primary" style="width:100%;justify-content:center;padding:0.75rem;">Submit Request</button>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // Animate in
    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
      modal.style.transform = 'scale(1)';
    });

    const nameInput = modal.querySelector('#reqAppName');
    nameInput.addEventListener('input', () => nameInput.style.borderColor = 'var(--border)');

    const closeModal = () => {
      overlay.style.opacity = '0';
      modal.style.transform = 'scale(0.95)';
      setTimeout(() => overlay.remove(), 200);
    };
    
    modal.querySelector('#closeReqModal').addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => { if(e.target === overlay) closeModal(); });
    
    modal.querySelector('#submitReqBtn').addEventListener('click', () => {
      const name = nameInput.value.trim();
      const link = modal.querySelector('#reqAppLink').value.trim();
      const desc = modal.querySelector('#reqAppDesc').value.trim();
      
      if(!name) {
        nameInput.style.borderColor = 'var(--crimson)';
        nameInput.focus();
        return;
      }
      
      const subject = encodeURIComponent("App Request: " + name);
      const body = encodeURIComponent(
        "App Name: " + name + "\n" +
        "App Link: " + (link || "Not provided") + "\n\n" +
        "Description:\n" + (desc || "No description provided.")
      );
      
      window.location.href = "mailto:modstoredeveloperteam@outlook.com?subject=" + subject + "&body=" + body;
      closeModal();
    });
  });

  const reportBugBtn = view.querySelector('#reportBugBtn');
  reportBugBtn.addEventListener('click', () => {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.8);backdrop-filter:blur(5px);z-index:9999;display:flex;align-items:center;justify-content:center;padding:1rem;opacity:0;transition:opacity 0.2s;';
    
    const modal = document.createElement('div');
    modal.style.cssText = 'background:var(--bg-1);border:1px solid var(--border);border-radius:12px;width:100%;max-width:400px;padding:1.5rem;box-shadow:0 10px 40px rgba(0,0,0,0.5);display:flex;flex-direction:column;gap:1.5rem;transform:scale(0.95);transition:transform 0.2s;';
    
    modal.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <h2 style="font-size:1.2rem;font-weight:600;margin:0;color:var(--text-1)">Report a Bug</h2>
        <button id="closeBugModal" style="background:none;border:none;color:var(--text-3);cursor:pointer;padding:0.25rem;">
          <svg viewBox="0 0 24 24" fill="none" style="width:20px;height:20px"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </button>
      </div>
      <div style="background:rgba(255,23,68,0.1);border-left:3px solid var(--crimson);padding:0.75rem;border-radius:0 8px 8px 0;">
        <p style="margin:0;font-size:0.85rem;color:var(--text-1);line-height:1.4;">
          <strong>Tip:</strong> Please upload a video or screenshot in your email! It makes it much easier to debug the website or app fast.
        </p>
      </div>
      <div style="display:flex;flex-direction:column;gap:1rem;">
        <div>
          <label style="display:block;font-size:0.85rem;color:var(--text-2);margin-bottom:0.4rem;">App or Website Name <span style="color:var(--crimson)">*</span></label>
          <input type="text" id="bugAppName" placeholder="e.g. MOD Store / Spicetify" style="width:100%;background:rgba(255,255,255,0.05);border:1px solid var(--border);color:#fff;border-radius:8px;padding:0.75rem;font-size:0.95rem;outline:none;transition:border-color 0.2s;" />
        </div>
        <div>
          <label style="display:block;font-size:0.85rem;color:var(--text-2);margin-bottom:0.4rem;">Bug Description <span style="color:var(--crimson)">*</span></label>
          <textarea id="bugAppDesc" rows="4" placeholder="Describe the issue you're facing in detail..." style="width:100%;background:rgba(255,255,255,0.05);border:1px solid var(--border);color:#fff;border-radius:8px;padding:0.75rem;font-size:0.95rem;outline:none;resize:none;font-family:inherit;transition:border-color 0.2s;"></textarea>
        </div>
      </div>
      <button id="submitBugBtn" class="btn-primary" style="width:100%;justify-content:center;padding:0.75rem;">Submit Report</button>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
      modal.style.transform = 'scale(1)';
    });

    const nameInput = modal.querySelector('#bugAppName');
    const descInput = modal.querySelector('#bugAppDesc');
    nameInput.addEventListener('input', () => nameInput.style.borderColor = 'var(--border)');
    descInput.addEventListener('input', () => descInput.style.borderColor = 'var(--border)');

    const closeModal = () => {
      overlay.style.opacity = '0';
      modal.style.transform = 'scale(0.95)';
      setTimeout(() => overlay.remove(), 200);
    };
    
    modal.querySelector('#closeBugModal').addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => { if(e.target === overlay) closeModal(); });
    
    modal.querySelector('#submitBugBtn').addEventListener('click', () => {
      const name = nameInput.value.trim();
      const desc = descInput.value.trim();
      
      let valid = true;
      if (!name) { nameInput.style.borderColor = 'var(--crimson)'; valid = false; }
      if (!desc) { descInput.style.borderColor = 'var(--crimson)'; valid = false; }
      
      if (!valid) return;
      
      const subject = encodeURIComponent("Bug Report: " + name);
      const body = encodeURIComponent(
        "App / Website Name: " + name + "\n\n" +
        "Bug Description:\n" + desc + "\n\n" +
        "(Please remember to attach any relevant screenshots or error videos here!)"
      );
      
      window.location.href = "mailto:modstoredeveloperteam@outlook.com?subject=" + subject + "&body=" + body;
      closeModal();
    });
  });
}
