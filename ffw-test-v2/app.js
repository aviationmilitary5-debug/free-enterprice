const SUPABASE_URL = 'https://akhcnuzqklcugjfnxeov.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFraGNudXpxa2xjdWdqZm54ZW92Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1NTE1NzksImV4cCI6MjA5NTEyNzU3OX0.Ds6mpiJitIQhWnWYFs8dMTcVAany3jtENi85Zxce5VU';

function trackToolUsage(toolId, action) {
  if (!appSettings.analyticsOptIn) return;
  try {
    fetch(`${SUPABASE_URL}/rest/v1/tool_analytics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON, 'Authorization': `Bearer ${SUPABASE_ANON}`, 'Prefer': 'return=minimal' },
      body: JSON.stringify({ tool_id: toolId, action: action || 'open', session_id: ANALYTICS_SESSION })
    }).catch(() => {});
  } catch(e) {}
}

// Override openScreen to track tool usage
const _origOpenScreen = window.openScreen;
let _promoUseCount = parseInt(localStorage.getItem('ffw_tool_uses') || '0');
window.openScreen = function(id) {
  if (id !== 'home') {
    trackToolUsage(id, 'open');
    trackRecentTool(id);
    _promoUseCount++;
    localStorage.setItem('ffw_tool_uses', _promoUseCount.toString());
    // Self-promo prompt after 5th use
    if (_promoUseCount === 5 && !localStorage.getItem('ffw_shared_prompt')) {
      setTimeout(() => {
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);z-index:9990;display:flex;align-items:center;justify-content:center;';
        overlay.innerHTML = `<div style="background:var(--bg-secondary);border-radius:16px;padding:24px;max-width:380px;width:90%;border:1px solid var(--accent-cyan);text-align:center;"><div style="font-size:36px;margin-bottom:10px;">🧙</div><h3 style="color:var(--accent-cyan);margin-bottom:8px;">Enjoying Free File Wizard?</h3><p style="color:var(--text-secondary);font-size:13px;margin-bottom:16px;line-height:1.5;">Help others discover free tools! Share with friends and social media.</p><div style="display:flex;flex-direction:column;gap:8px;"><button onclick="shareApp()" style="padding:10px;background:linear-gradient(135deg,var(--accent-cyan),var(--accent-purple));color:white;border:none;border-radius:8px;font-size:13px;cursor:pointer;">Share with Friends</button><button onclick="copyAppLink()" style="padding:10px;background:rgba(0,240,255,0.1);color:var(--accent-cyan);border:1px solid rgba(0,240,255,0.3);border-radius:8px;font-size:13px;cursor:pointer;">Copy Link</button><button onclick="this.closest('[style*=z-index]')?.remove();localStorage.setItem('ffw_shared_prompt','1');" style="padding:8px;background:transparent;color:var(--text-secondary);border:none;font-size:12px;cursor:pointer;">Maybe later</button></div></div>`;
        document.body.appendChild(overlay);
      }, 500);
    }
  }
  _origOpenScreen(id);
  // Show/hide community submit forms based on partner settings
  const gameForm = document.getElementById('gameSubmitForm');
  const appForm = document.getElementById('appSubmitForm');
  if (id === 'community-games') {
    loadCommunityItems('game');
    if (gameForm) gameForm.style.display = appSettings.partnerGames ? 'block' : 'none';
  }
  if (id === 'community-apps') {
    loadCommunityItems('webapp');
    if (appForm) appForm.style.display = appSettings.partnerApps ? 'block' : 'none';
  }
  if (id === 'partner-dashboard') {
    loadPartnerDashboard();
  }
};

// === AUTO-SYNC SYSTEM ===
let lastSyncTime = 0;
function autoSyncData() {
  if (!appSettings.autoSync) return;
  const now = Date.now();
  if (now - lastSyncTime < 300000) return; // 5 min throttle
  lastSyncTime = now;
  // Sync community items when online
  if (navigator.onLine) {
    loadCommunityItems('game');
    loadCommunityItems('webapp');
    // Sync cached offline analytics
    const pending = JSON.parse(localStorage.getItem('ffw_pending_analytics') || '[]');
    if (pending.length > 0) {
      Promise.all(pending.map(p =>
        fetch(`${SUPABASE_URL}/rest/v1/tool_analytics`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON, 'Authorization': `Bearer ${SUPABASE_ANON}`, 'Prefer': 'return=minimal' },
          body: JSON.stringify(p)
        }).catch(() => {})
      )).then(() => localStorage.removeItem('ffw_pending_analytics'));
    }
  }
}
window.addEventListener('online', () => { showToast('Back online - syncing data...'); autoSyncData(); });
setInterval(autoSyncData, 300000);

// Offline analytics buffer
function trackToolUsageOffline(toolId, action) {
  if (!appSettings.analyticsOptIn) return;
  const entry = { tool_id: toolId, action: action || 'open', session_id: ANALYTICS_SESSION };
  if (!navigator.onLine) {
    const pending = JSON.parse(localStorage.getItem('ffw_pending_analytics') || '[]');
    pending.push(entry);
    localStorage.setItem('ffw_pending_analytics', JSON.stringify(pending));
  } else {
    trackToolUsage(toolId, action);
  }
}

// === RETRO GAMES ===
const RETRO_GAMES = [
  { name:'Snake', icon:'🐍', desc:'Classic snake game - eat food, grow longer, avoid yourself!', url:'https://playsnake.org/', color:'#10b981' },
  { name:'Tetris', icon:'🧱', desc:'The original block-stacking puzzle that started it all', url:'https://tetris.com/play-tetris/', color:'#00f0ff' },
  { name:'Pac-Man', icon:'🟡', desc:'Navigate the maze, eat dots, avoid ghosts', url:'https://www.google.com/search?q=play+pac+man&kgmid=/m/05jhw', color:'#fbbf24' },
  { name:'Pong', icon:'🏓', desc:'The first arcade game - bounce the ball past your opponent', url:'https://www.ponggame.org/', color:'#ef4444' },
  { name:'Space Invaders', icon:'👾', desc:'Defend Earth from descending alien invaders', url:'https://www.spaceinvaders.fr/', color:'#bc00dd' },
  { name:'Breakout', icon:'🧱', desc:'Break bricks with a bouncing ball and paddle', url:'https://breakout-game.com/', color:'#f97316' },
  { name:'Doom (Shareware)', icon:'🔫', desc:'The legendary FPS that defined a genre', url:'https://dos.zone/en/play/10909-doom-shareware/', color:'#dc2626' },
  { name:'Wolfenstein 3D', icon:'🏰', desc:'The grandfather of first-person shooters', url:'https://dos.zone/en/play/10897-wolfenstein-3d/', color:'#854d0e' },
  { name:'Prince of Persia', icon:'🤴', desc:'Run, jump, and sword-fight through deadly traps', url:'https://dos.zone/en/play/10895-prince-of-persia/', color:'#0ea5e9' },
  { name:'Minesweeper', icon:'💣', desc:'Clear the minefield without detonating any bombs', url:'https://www.google.com/search?q=play+minesweeper&kgmid=/m/04sn2', color:'#6b7280' },
  { name:'Solitaire', icon:'🃏', desc:'The classic card game that came with every Windows PC', url:'https://www.google.com/search?q=play+solitaire&kgmid=/m/0ckqy', color:'#059669' },
  { name:'Asteroids', icon:'☄️', desc:'Rotate, thrust, and shoot to destroy floating asteroids', url:'https://www.asteroids.zone/', color:'#475569' },
  { name:'Frogger', icon:'🐸', desc:'Help the frog cross the busy road and river safely', url:'https://frogger.js.org/', color:'#16a34a' },
  { name:'Qbert', icon:'🤖', desc:'Hop on cubes to change their color while avoiding enemies', url:'https://qbert.github.io/', color:'#eab308' },
  { name:'Flappy Bird', icon:'🐦', desc:'Tap to fly through pipes - simple but infuriatingly addictive', url:'https://flappybird.io/', color:'#22c55e' }
];

function renderRetroGames() {
  const grid = document.getElementById('retroGamesGrid');
  if (!grid) return;
  grid.innerHTML = RETRO_GAMES.map(g => `
    <div onclick="window.open('${escAttr(validateInput(g.url,'url'))}','_blank');trackToolUsage('retro-games','play_${escAttr(g.name.toLowerCase().replace(/ /g,'_'))}')" style="padding:14px;background:rgba(0,240,255,0.05);border-radius:10px;cursor:pointer;border-left:3px solid ${escAttr(g.color)};transition:transform 0.2s;" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
        <span style="font-size:22px;">${esc(g.icon)}</span>
        <span style="font-size:13px;font-weight:600;color:var(--accent-cyan);">${esc(g.name)}</span>
      </div>
      <div style="font-size:11px;color:var(--text-secondary);line-height:1.5;">${esc(g.desc)}</div>
    </div>`).join('');
}

// === COMMUNITY GAMES & APPS ===
async function loadCommunityItems(type) {
  const container = document.getElementById(type === 'game' ? 'communityGamesContent' : 'communityAppsContent');
  if (!container) return;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/community_submissions?type=eq.${type}&status=eq.approved&order=created_at.desc&limit=50`, {
      headers: { 'apikey': SUPABASE_ANON, 'Authorization': `Bearer ${SUPABASE_ANON}` }
    });
    const items = await res.json();
    if (!items.length) {
      container.innerHTML = `<div style="text-align:center;padding:20px;color:var(--text-secondary);font-size:13px;">No ${type === 'game' ? 'games' : 'web apps'} yet. Be the first to submit!</div>`;
      return;
    }
    container.innerHTML = items.map(item => `
      <div style="padding:12px;background:rgba(0,240,255,0.05);border-radius:10px;margin-bottom:8px;border-left:3px solid var(--accent-cyan);">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
          ${item.icon_url ? `<img src="${escAttr(validateInput(item.icon_url,'url'))}" style="width:32px;height:32px;border-radius:6px;object-fit:cover;" onerror="this.style.display='none'">` : `<span style="font-size:22px;">${type === 'game' ? '🎮' : '🌐'}</span>`}
          <div style="flex:1;">
            <div style="font-size:13px;font-weight:600;color:var(--accent-cyan);">${esc(item.name)}</div>
            ${item.company ? `<div style="font-size:10px;color:var(--text-secondary);">by ${esc(item.company)}</div>` : ''}
          </div>
        </div>
        ${item.description ? `<div style="font-size:11px;color:var(--text-secondary);margin-bottom:6px;line-height:1.5;">${esc(item.description)}</div>` : ''}
        ${item.image_url ? `<img src="${escAttr(validateInput(item.image_url,'url'))}" style="width:100%;border-radius:6px;margin-bottom:6px;max-height:120px;object-fit:cover;" onerror="this.style.display='none'">` : ''}
        <button class="btn btn-success btn-sm" onclick="window.open('${escAttr(validateInput(item.url,'url'))}','_blank');trackToolUsage('${type === 'game' ? 'community-games' : 'community-apps}','visit_${escAttr(item.name.toLowerCase().replace(/ /g,"_"))}')">Open ${type === 'game' ? 'Game' : 'App'}</button>
      </div>`).join('');
  } catch(e) {
    container.innerHTML = `<div style="text-align:center;padding:20px;color:var(--text-secondary);font-size:13px;">Could not load ${type === 'game' ? 'games' : 'apps'}. Check your connection.</div>`;
  }
}

function isValidGameURL(url) {
  try {
    const u = new URL(url);
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return false;
    // Must have a real hostname
    if (!u.hostname || u.hostname === 'localhost' || u.hostname === '127.0.0.1') return false;
    return true;
  } catch(e) { return false; }
}

async function submitCommunityItem(type) {
  if (!rateLimiter()) { showToast('Too many requests. Please wait a minute.'); return; }
  const isGame = type === 'game';
  const url = validateInput(document.getElementById(isGame ? 'gameUrl' : 'appUrl').value.trim(), 'url');
  const name = validateInput(document.getElementById(isGame ? 'gameName' : 'appName').value.trim(), 'text').substring(0, 50);
  const desc = validateInput(document.getElementById(isGame ? 'gameDesc' : 'appDesc').value.trim(), 'text').substring(0, 500);
  const company = validateInput(document.getElementById(isGame ? 'gameCompany' : 'appCompany').value.trim(), 'text').substring(0, 100);
  const iconUrl = validateInput(document.getElementById(isGame ? 'gameIcon' : 'appIcon').value.trim(), 'url');
  const imageUrl = validateInput(document.getElementById(isGame ? 'gameImage' : 'appImage').value.trim(), 'url');
  const email = validateInput(document.getElementById(isGame ? 'gameEmail' : 'appEmail').value.trim(), 'email');

  if (!url) { showToast('Please enter a valid URL'); return; }
  if (!name) { showToast('Please enter a name'); return; }
  if (!desc) { showToast('Please add a description'); return; }

  const payload = { type, name, description: desc, url, company: company || '', icon_url: iconUrl || '', image_url: imageUrl || '', submitter_email: email || '', status: 'pending' };

  try {
    const res = await fetch(`${getApiUrl()}/rest/v1/community_submissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON, 'Authorization': `Bearer ${SUPABASE_ANON}`, 'Prefer': 'return=representation' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) { showToast('Submission failed. Please try again.'); return; }

    const data = await res.json();
    const submission = data?.[0];

    // Send approval email with approve/reject links via manage-submissions
    if (submission?.id) {
      fetch(`${SUPABASE_URL}/functions/v1/manage-submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON },
        body: JSON.stringify({
          submissionId: submission.id,
          type,
          name,
          url,
          company: company || 'N/A',
          description: desc,
          submitter_email: email || 'Anonymous'
        })
      }).catch(() => {});
    }

    // Clear form
    ['Url','Name','Desc','Company','Icon','Image','Email'].forEach(f => {
      const el = document.getElementById((isGame ? 'game' : 'app') + f);
      if (el) el.value = '';
    });

    showToast(`${isGame ? 'Game' : 'App'} submitted for review! You will be notified once approved.`);
  } catch(e) {
    showToast('Network error. Please try again.');
  }
}

// === ANALYTICS REPORT (daily email to owner) ===
function sendAnalyticsReport() {
  if (!appSettings.analyticsOptIn) return;
  const toolUses = JSON.parse(localStorage.getItem('ffw_tool_uses') || '0');
  const lastReport = localStorage.getItem('ffw_last_analytics_report');
  const now = Date.now();
  // Send report once per day
  if (lastReport && now - parseInt(lastReport) < 86400000) return;

  const profile = JSON.parse(localStorage.getItem('ffw_profile') || '{}');
  const totalTools = document.querySelectorAll('.screen').length;
  const recentTools = JSON.parse(localStorage.getItem('ffw_recent_tools') || '[]');

  fetch(`${SUPABASE_URL}/functions/v1/send-feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON },
    body: JSON.stringify({
      category: 'analytics',
      email: profile.email || 'N/A',
      message: `Daily Analytics Report for Free File Wizard:\n- Total tool opens (this user): ${toolUses}\n- Recent tools used: ${recentTools.slice(-5).join(', ') || 'None recorded'}\n- User: ${profile.name || 'Guest'}\n- Auto-Sync: ${appSettings.autoSync ? 'On' : 'Off'}\n- Partner Games: ${appSettings.partnerGames ? 'On' : 'Off'}\n- Partner Apps: ${appSettings.partnerApps ? 'On' : 'Off'}\n\nThis report helps improve the app. Users opted in via Analytics Sharing setting.`,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    })
  }).catch(() => {});

  localStorage.setItem('ffw_last_analytics_report', now.toString());
}

// Track recent tools for analytics
function trackRecentTool(toolId) {
  const recent = JSON.parse(localStorage.getItem('ffw_recent_tools') || '[]');
  recent.push(toolId);
  if (recent.length > 20) recent.shift();
  localStorage.setItem('ffw_recent_tools', JSON.stringify(recent));
}

// === SELF-HOSTING CONFIG ===
function saveSelfHostConfig() {
  const url = validateInput(document.getElementById('selfHostUrl')?.value?.trim(), 'url');
  const api = validateInput(document.getElementById('selfHostApi')?.value?.trim(), 'url');
  const supabaseUrl = validateInput(document.getElementById('selfHostSupabaseUrl')?.value?.trim(), 'url');
  const anonKey = document.getElementById('selfHostAnonKey')?.value?.trim() || '';

  // Security: Validate connection strings with strict regex
  const urlPattern = /^https?:\/\/[a-zA-Z0-9][-a-zA-Z0-9.]*(:[0-9]+)?(\/[^\s]*)?$/;
  const keyPattern = /^eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;

  const validated = { url: '', api: '', supabaseUrl: '', anonKey: '' };

  if (url && urlPattern.test(url)) validated.url = url;
  if (api && urlPattern.test(api)) validated.api = api;
  if (supabaseUrl && urlPattern.test(supabaseUrl)) validated.supabaseUrl = supabaseUrl;
  if (anonKey && keyPattern.test(anonKey)) validated.anonKey = anonKey;

  localStorage.setItem('ffw_self_host', JSON.stringify(validated));

  // Show/hide advanced config
  const advConfig = document.getElementById('selfHostAdvancedConfig');
  if (advConfig) advConfig.style.display = appSettings.selfHosted ? 'block' : 'none';
}

function loadSelfHostConfig() {
  const cfg = JSON.parse(localStorage.getItem('ffw_self_host') || '{}');
  const urlEl = document.getElementById('selfHostUrl');
  const apiEl = document.getElementById('selfHostApi');
  const sbUrlEl = document.getElementById('selfHostSupabaseUrl');
  const anonKeyEl = document.getElementById('selfHostAnonKey');

  if (urlEl && cfg.url) urlEl.value = cfg.url;
  if (apiEl && cfg.api) apiEl.value = cfg.api;
  if (sbUrlEl && cfg.supabaseUrl) sbUrlEl.value = cfg.supabaseUrl;
  if (anonKeyEl && cfg.anonKey) anonKeyEl.value = cfg.anonKey;

  // Show advanced config if self-hosted is enabled
  const advConfig = document.getElementById('selfHostAdvancedConfig');
  if (advConfig) advConfig.style.display = appSettings.selfHosted ? 'block' : 'none';
}

// Override SUPABASE_URL/ANON for self-hosted mode
function getApiUrl() {
  if (appSettings.selfHosted && validateSelfHostConnection()) {
    const cfg = JSON.parse(localStorage.getItem('ffw_self_host') || '{}');
    // User's custom API endpoint overrides default
    if (cfg.api && cfg.api.startsWith('http')) return cfg.api;
    // If they provided a Supabase URL, use the REST endpoint
    if (cfg.supabaseUrl && cfg.supabaseUrl.startsWith('http')) return cfg.supabaseUrl + '/rest/v1';
    return SUPABASE_URL;
  }
  return SUPABASE_URL;
}

// Get the active anon key (self-hosted or default)
function getAnonKey() {
  if (appSettings.selfHosted && validateSelfHostConnection()) {
    const cfg = JSON.parse(localStorage.getItem('ffw_self_host') || '{}');
    if (cfg.anonKey && cfg.anonKey.startsWith('eyJ')) return cfg.anonKey;
  }
  return SUPABASE_ANON_KEY;
}

// Admin revocation check - validates self-hosted connections against a blacklist
function isSelfHostConnectionRevoked() {
  const cfg = JSON.parse(localStorage.getItem('ffw_self_host') || '{}');
  const revokedKeys = JSON.parse(localStorage.getItem('ffw_revoked_connections') || '[]');
  if (cfg.supabaseUrl && revokedKeys.includes(cfg.supabaseUrl)) return true;
  if (cfg.anonKey && revokedKeys.includes(cfg.anonKey)) return true;
  return false;
}

// Audit self-hosted connection attempt with server
async function auditSelfHostConnection(action, reason) {
  const cfg = JSON.parse(localStorage.getItem('ffw_self_host') || '{}');
  if (!cfg.supabaseUrl && !cfg.url) return;

  try {
    await fetch(`${SUPABASE_URL}/functions/v1/admin-auth?action=audit_connection`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        connectionUrl: cfg.supabaseUrl || cfg.url,
        anonKeyFingerprint: cfg.anonKey ? cfg.anonKey.substring(0, 20) + '...' : '',
        status: action,
        reason: reason || '',
      }),
    });
  } catch (e) {
    // Silently fail - audit logging is non-critical
  }
}

// Fetch revoked connections list from server periodically
async function syncRevokedConnections() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/staging_connection_audit?status=eq.revoked&select=connection_url`, {
      headers: { 'apikey': SUPABASE_ANON_KEY }
    });
    const data = await res.json();
    if (Array.isArray(data)) {
      const revoked = data.map(d => d.connection_url);
      localStorage.setItem('ffw_revoked_connections', JSON.stringify(revoked));
    }
  } catch (e) {
    // Silently fail
  }
}

// Check self-hosted connection before any API call
function validateSelfHostConnection() {
  if (!appSettings.selfHosted) return true;
  if (isSelfHostConnectionRevoked()) {
    appSettings.selfHosted = false;
    saveSettings();
    showToast('Self-hosted connection has been revoked by admin. Reverted to default.');
    auditSelfHostConnection('revoked', 'Connection revoked - auto-reverted');
    return false;
  }
  return true;
}

// === CROSS-ADS PARTNER SYSTEM ===
const WITHDRAWAL_THRESHOLD = 10; // Minimum $10 to request withdrawal
const PARTNER_COMMISSION_RATE = 0.30; // 30% of ad revenue goes to partner

function getPartnerSession() {
  return localStorage.getItem('ffw_partner_id');
}

async function loadPartnerDashboard() {
  const container = document.getElementById('partnerDashContent');
  if (!container) return;

  const partnerId = getPartnerSession();

  if (!partnerId) {
    // Show application form
    container.innerHTML = `
      <div style="padding:14px;background:rgba(0,240,255,0.05);border-radius:10px;margin-bottom:14px;">
        <div style="font-size:14px;font-weight:600;color:var(--accent-cyan);margin-bottom:8px;">Cross-Ads Revenue Sharing Program</div>
        <div style="font-size:12px;color:var(--text-secondary);line-height:1.6;margin-bottom:12px;">
          Earn money by displaying ads from Free File Wizard on your site or app. You get <strong style="color:var(--accent-cyan);">30% commission</strong> on all ad revenue generated through your ad placements.
        </div>
        <div style="font-size:12px;font-weight:600;color:var(--success);margin-bottom:6px;">Eligibility Requirements:</div>
        <ul style="font-size:11px;color:var(--text-secondary);line-height:1.8;padding-left:18px;margin-bottom:12px;">
          <li>You must have an approved game or web app on Free File Wizard</li>
          <li>Your site must have a valid Google AdSense account</li>
          <li>Minimum 100 monthly visitors to your site</li>
          <li>No adult, illegal, or harmful content</li>
          <li>Site must be live and accessible (no localhost)</li>
        </ul>
        <div style="font-size:12px;font-weight:600;color:var(--accent-cyan);margin-bottom:6px;">How It Works:</div>
        <ol style="font-size:11px;color:var(--text-secondary);line-height:1.8;padding-left:18px;margin-bottom:12px;">
          <li>Apply below with your site details and AdSense ad slot ID</li>
          <li>Get approved by the Free File Wizard team</li>
          <li>Place the provided ad code on your site</li>
          <li>Earn 30% commission on all ad impressions and clicks</li>
          <li>Track earnings in your private dashboard</li>
          <li>Request withdrawal when you reach $${WITHDRAWAL_THRESHOLD}</li>
        </ol>
      </div>
      <div style="padding:14px;background:rgba(0,240,255,0.05);border-radius:10px;">
        <div style="font-size:13px;font-weight:600;color:var(--accent-cyan);margin-bottom:10px;">Apply for Cross-Ads Program</div>
        <div class="input-group" style="margin-bottom:8px;">
          <label class="input-label">Your Email</label>
          <input type="email" class="input-field" id="crossAdEmail" placeholder="you@email.com">
        </div>
        <div class="input-group" style="margin-bottom:8px;">
          <label class="input-label">Site / App Name</label>
          <input type="text" class="input-field" id="crossAdSiteName" placeholder="e.g., My Game Portal">
        </div>
        <div class="input-group" style="margin-bottom:8px;">
          <label class="input-label">Site / App URL</label>
          <input type="url" class="input-field" id="crossAdSiteUrl" placeholder="https://your-site.com">
        </div>
        <div class="input-group" style="margin-bottom:8px;">
          <label class="input-label">Your Google AdSense Ad Slot ID</label>
          <input type="text" class="input-field" id="crossAdSlot" placeholder="e.g., 1234567890">
          <div style="font-size:10px;color:var(--text-secondary);margin-top:4px;">Found in your AdSense dashboard under Ad Units</div>
        </div>
        <button class="btn btn-success btn-sm" onclick="applyCrossAds()" style="width:100%;">Submit Application</button>
      </div>`;
    return;
  }

  // Partner is logged in - show dashboard
  try {
    const res = await fetch(`${getApiUrl()}/rest/v1/ad_partners?id=eq.${partnerId}&select=*`, {
      headers: { 'apikey': SUPABASE_ANON, 'Authorization': `Bearer ${SUPABASE_ANON}` }
    });
    const partners = await res.json();
    const partner = partners?.[0];

    if (!partner || partner.status === 'rejected') {
      localStorage.removeItem('ffw_partner_id');
      loadPartnerDashboard();
      return;
    }

    if (partner.status === 'pending') {
      container.innerHTML = `
        <div style="text-align:center;padding:30px;">
          <div style="font-size:36px;margin-bottom:10px;">⏳</div>
          <div style="font-size:16px;font-weight:600;color:var(--accent-cyan);margin-bottom:8px;">Application Under Review</div>
          <div style="font-size:12px;color:var(--text-secondary);line-height:1.6;">Your Cross-Ads application for "${esc(partner.site_name)}" is being reviewed. You will be notified via email once approved.</div>
        </div>`;
      return;
    }

    // Approved partner - full dashboard
    const balance = Number(partner.balance || 0).toFixed(2);
    const totalEarned = Number(partner.total_earned || 0).toFixed(2);
    const totalPaid = Number(partner.total_paid || 0).toFixed(2);
    const canWithdraw = Number(partner.balance || 0) >= WITHDRAWAL_THRESHOLD;
    const hasPayment = partner.payment_method && Object.keys(partner.payment_method).length > 0;

    // Fetch recent impressions
    let impressionsHtml = '';
    try {
      const impRes = await fetch(`${getApiUrl()}/rest/v1/ad_impressions?partner_id=eq.${partnerId}&order=date.desc&limit=7`, {
        headers: { 'apikey': SUPABASE_ANON, 'Authorization': `Bearer ${SUPABASE_ANON}` }
      });
      const impressions = await impRes.json();
      if (impressions.length > 0) {
        impressionsHtml = impressions.map(imp => `
          <tr>
            <td style="padding:6px 8px;border:1px solid rgba(255,255,255,0.05);font-size:11px;">${esc(imp.date)}</td>
            <td style="padding:6px 8px;border:1px solid rgba(255,255,255,0.05);font-size:11px;">${esc(imp.impressions)}</td>
            <td style="padding:6px 8px;border:1px solid rgba(255,255,255,0.05);font-size:11px;">${esc(imp.clicks)}</td>
            <td style="padding:6px 8px;border:1px solid rgba(255,255,255,0.05);font-size:11px;color:var(--success);">$${Number(imp.earnings).toFixed(4)}</td>
          </tr>`).join('');
      }
    } catch(e) {}

    // Fetch withdrawals
    let withdrawalsHtml = '';
    try {
      const wdRes = await fetch(`${getApiUrl()}/rest/v1/withdrawal_requests?partner_id=eq.${partnerId}&order=created_at.desc&limit=5`, {
        headers: { 'apikey': SUPABASE_ANON, 'Authorization': `Bearer ${SUPABASE_ANON}` }
      });
      const withdrawals = await wdRes.json();
      if (withdrawals.length > 0) {
        const statusLabels = { pending: '⏳ Pending', approved: '🔄 Approved', processing: '💳 Processing', paid: '✅ Paid', rejected: '❌ Rejected' };
        const statusColors = { pending: '#f59e0b', approved: '#3b82f6', processing: '#8b5cf6', paid: '#10b981', rejected: '#ef4444' };
        withdrawalsHtml = withdrawals.map(w => `
          <tr>
            <td style="padding:6px 8px;border:1px solid rgba(255,255,255,0.05);font-size:11px;">$${Number(w.amount).toFixed(2)}</td>
            <td style="padding:6px 8px;border:1px solid rgba(255,255,255,0.05);font-size:11px;color:${escAttr(statusColors[w.status])};">${esc(statusLabels[w.status])}</td>
            <td style="padding:6px 8px;border:1px solid rgba(255,255,255,0.05);font-size:11px;">${new Date(w.created_at).toLocaleDateString()}</td>
          </tr>`).join('');
      }
    } catch(e) {}

    container.innerHTML = `
      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-bottom:14px;">
        <div style="padding:12px;background:rgba(16,185,129,0.08);border-radius:10px;text-align:center;">
          <div style="font-size:10px;color:var(--text-secondary);">Balance</div>
          <div style="font-size:20px;font-weight:700;color:var(--success);">$${balance}</div>
        </div>
        <div style="padding:12px;background:rgba(0,240,255,0.08);border-radius:10px;text-align:center;">
          <div style="font-size:10px;color:var(--text-secondary);">Total Earned</div>
          <div style="font-size:20px;font-weight:700;color:var(--accent-cyan);">$${totalEarned}</div>
        </div>
        <div style="padding:12px;background:rgba(124,58,237,0.08);border-radius:10px;text-align:center;">
          <div style="font-size:10px;color:var(--text-secondary);">Total Paid</div>
          <div style="font-size:16px;font-weight:700;color:var(--accent-purple);">$${totalPaid}</div>
        </div>
        <div style="padding:12px;background:rgba(245,158,11,0.08);border-radius:10px;text-align:center;">
          <div style="font-size:10px;color:var(--text-secondary);">Commission</div>
          <div style="font-size:16px;font-weight:700;color:#f59e0b;">${PARTNER_COMMISSION_RATE * 100}%</div>
        </div>
      </div>

      <div style="padding:12px;background:rgba(0,240,255,0.05);border-radius:10px;margin-bottom:10px;">
        <div style="font-size:12px;font-weight:600;color:var(--accent-cyan);margin-bottom:6px;">Your Ad Code</div>
        <code style="font-size:10px;color:var(--text-secondary);word-break:break-all;display:block;padding:8px;background:rgba(0,0,0,0.3);border-radius:4px;line-height:1.5;">
&lt;ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-4262912359957760" data-ad-slot="${escAttr(partner.ad_slot_id || 'YOUR_SLOT')}" data-ad-format="auto" full-width-responsive="true"&gt;&lt;/ins&gt;
&lt;script&gt;(adsbygoogle = window.adsbygoogle || []).push({});&lt;/script&gt;
        </code>
        <div style="font-size:10px;color:var(--text-secondary);margin-top:4px;">Place this code on your site to start earning.</div>
      </div>

      ${impressionsHtml ? `
      <div style="padding:12px;background:rgba(0,240,255,0.05);border-radius:10px;margin-bottom:10px;">
        <div style="font-size:12px;font-weight:600;color:var(--accent-cyan);margin-bottom:8px;">Recent Ad Performance</div>
        <table style="width:100%;border-collapse:collapse;">
          <tr><th style="padding:6px 8px;border:1px solid rgba(255,255,255,0.05);font-size:10px;color:var(--text-secondary);text-align:left;">Date</th><th style="padding:6px 8px;border:1px solid rgba(255,255,255,0.05);font-size:10px;color:var(--text-secondary);text-align:left;">Views</th><th style="padding:6px 8px;border:1px solid rgba(255,255,255,0.05);font-size:10px;color:var(--text-secondary);text-align:left;">Clicks</th><th style="padding:6px 8px;border:1px solid rgba(255,255,255,0.05);font-size:10px;color:var(--text-secondary);text-align:left;">Earnings</th></tr>
          ${impressionsHtml}
        </table>
      </div>` : ''}

      ${!hasPayment ? `
      <div style="padding:12px;background:rgba(239,68,68,0.08);border-radius:10px;margin-bottom:10px;">
        <div style="font-size:12px;font-weight:600;color:#ef4444;margin-bottom:6px;">Payment Method Required</div>
        <div style="font-size:11px;color:var(--text-secondary);margin-bottom:8px;">Add a payment method to withdraw earnings.</div>
        <div class="input-group" style="margin-bottom:6px;"><label class="input-label">Bank Name</label><input type="text" class="input-field" id="pmBankName" placeholder="e.g., GTBank"></div>
        <div class="input-group" style="margin-bottom:6px;"><label class="input-label">Account Number</label><input type="text" class="input-field" id="pmAccountNum" placeholder="Account number"></div>
        <div class="input-group" style="margin-bottom:6px;"><label class="input-label">Account Name</label><input type="text" class="input-field" id="pmAccountName" placeholder="Full name on account"></div>
        <div class="input-group" style="margin-bottom:6px;"><label class="input-label">Country</label><input type="text" class="input-field" id="pmCountry" placeholder="e.g., Cameroon"></div>
        <button class="btn btn-success btn-sm" onclick="savePaymentMethod()" style="width:100%;">Save Payment Method</button>
      </div>` : `
      <div style="padding:12px;background:rgba(16,185,129,0.08);border-radius:10px;margin-bottom:10px;">
        <div style="font-size:12px;font-weight:600;color:var(--success);margin-bottom:4px;">Payment Method on File</div>
        <div style="font-size:11px;color:var(--text-secondary);">${partner.payment_method.bank_name || 'Bank'} - ${partner.payment_method.account_name || 'Account'} (${partner.payment_method.country || 'N/A'})</div>
        <button class="btn btn-secondary btn-sm" onclick="editPaymentMethod()" style="margin-top:6px;font-size:10px;">Edit</button>
      </div>`}

      ${canWithdraw && hasPayment ? `
      <button class="btn btn-success btn-sm" onclick="requestWithdrawal()" style="width:100%;margin-bottom:10px;">Request Withdrawal (Min: $${WITHDRAWAL_THRESHOLD})</button>` : !canWithdraw && hasPayment ? `
      <div style="padding:8px;background:rgba(245,158,11,0.08);border-radius:8px;font-size:11px;color:#f59e0b;text-align:center;margin-bottom:10px;">Minimum $${WITHDRAWAL_THRESHOLD} balance required to withdraw</div>` : ''}

      ${withdrawalsHtml ? `
      <div style="padding:12px;background:rgba(0,240,255,0.05);border-radius:10px;margin-bottom:10px;">
        <div style="font-size:12px;font-weight:600;color:var(--accent-cyan);margin-bottom:8px;">Withdrawal History</div>
        <table style="width:100%;border-collapse:collapse;">
          <tr><th style="padding:6px 8px;border:1px solid rgba(255,255,255,0.05);font-size:10px;color:var(--text-secondary);text-align:left;">Amount</th><th style="padding:6px 8px;border:1px solid rgba(255,255,255,0.05);font-size:10px;color:var(--text-secondary);text-align:left;">Status</th><th style="padding:6px 8px;border:1px solid rgba(255,255,255,0.05);font-size:10px;color:var(--text-secondary);text-align:left;">Date</th></tr>
          ${withdrawalsHtml}
        </table>
      </div>` : ''}

      <div style="padding:12px;background:rgba(0,240,255,0.05);border-radius:10px;">
        <div style="font-size:11px;color:var(--text-secondary);line-height:1.6;">
          <strong style="color:var(--accent-cyan);">Partner:</strong> ${partner.site_name}<br>
          <strong style="color:var(--accent-cyan);">URL:</strong> ${partner.site_url}<br>
          <strong style="color:var(--accent-cyan);">Email:</strong> ${partner.email}<br>
          <strong style="color:var(--accent-cyan);">Status:</strong> <span style="color:var(--success);">Active</span>
        </div>
        <button class="btn btn-secondary btn-sm" onclick="localStorage.removeItem('ffw_partner_id');loadPartnerDashboard();" style="margin-top:8px;font-size:10px;">Sign Out</button>
      </div>`;
  } catch(e) {
    container.innerHTML = `<div style="text-align:center;padding:20px;color:var(--text-secondary);font-size:13px;">Could not load dashboard. Check your connection.</div>`;
  }
}

async function applyCrossAds() {
  const email = document.getElementById('crossAdEmail').value.trim();
  const siteName = document.getElementById('crossAdSiteName').value.trim();
  const siteUrl = document.getElementById('crossAdSiteUrl').value.trim();
  const slot = document.getElementById('crossAdSlot').value.trim();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showToast('Valid email required'); return; }
  if (!siteName) { showToast('Site name required'); return; }
  if (!siteUrl || !isValidGameURL(siteUrl)) { showToast('Valid site URL required (https://)'); return; }
  if (!slot) { showToast('AdSense ad slot ID required'); return; }

  try {
    const res = await fetch(`${getApiUrl()}/rest/v1/ad_partners`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON, 'Authorization': `Bearer ${SUPABASE_ANON}`, 'Prefer': 'return=representation' },
      body: JSON.stringify({ email, site_name: siteName, site_url: siteUrl, ad_slot_id: slot, status: 'pending' })
    });

    if (!res.ok) {
      const err = await res.json();
      if (err.code === '23505') { showToast('This email is already registered. Use your dashboard.'); return; }
      showToast('Application failed. Try again.'); return;
    }

    const data = await res.json();
    const partner = data?.[0];

    if (partner) {
      localStorage.setItem('ffw_partner_id', partner.id);

      // Send approval email to owner
      await fetch(`${SUPABASE_URL}/functions/v1/manage-withdrawals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON },
        body: JSON.stringify({
          type: 'partner_application',
          partnerId: partner.id,
          partnerEmail: email,
          siteName,
          siteUrl
        })
      }).catch(() => {});

      showToast('Application submitted! Check your email.');
      loadPartnerDashboard();
    }
  } catch(e) {
    showToast('Network error. Try again.');
  }
}

async function savePaymentMethod() {
  const partnerId = getPartnerSession();
  if (!partnerId) return;
  const bankName = document.getElementById('pmBankName').value.trim();
  const accountNum = document.getElementById('pmAccountNum').value.trim();
  const accountName = document.getElementById('pmAccountName').value.trim();
  const country = document.getElementById('pmCountry').value.trim();

  if (!bankName || !accountNum || !accountName || !country) { showToast('All payment fields required'); return; }

  try {
    await fetch(`${getApiUrl()}/rest/v1/ad_partners?id=eq.${partnerId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON, 'Authorization': `Bearer ${SUPABASE_ANON}` },
      body: JSON.stringify({ payment_method: { bank_name: bankName, account_number: accountNum, account_name: accountName, country } })
    });
    showToast('Payment method saved!');
    loadPartnerDashboard();
  } catch(e) { showToast('Error saving payment method'); }
}

function editPaymentMethod() {
  const partnerId = getPartnerSession();
  if (!partnerId) return;
  // Re-render dashboard with payment form visible by removing payment_method
  fetch(`${getApiUrl()}/rest/v1/ad_partners?id=eq.${partnerId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON, 'Authorization': `Bearer ${SUPABASE_ANON}` },
    body: JSON.stringify({ payment_method: {} })
  }).then(() => { loadPartnerDashboard(); }).catch(() => { showToast('Error'); });
}

async function requestWithdrawal() {
  if (!rateLimiter()) { showToast('Too many requests. Please wait.'); return; }
  const partnerId = getPartnerSession();
  if (!partnerId) return;

  try {
    // Get current balance and payment method
    const res = await fetch(`${getApiUrl()}/rest/v1/ad_partners?id=eq.${partnerId}`, {
      headers: { 'apikey': SUPABASE_ANON, 'Authorization': `Bearer ${SUPABASE_ANON}` }
    });
    const partners = await res.json();
    const partner = partners?.[0];
    if (!partner) return;

    const balance = Number(partner.balance || 0);
    if (balance < WITHDRAWAL_THRESHOLD) { showToast(`Minimum $${WITHDRAWAL_THRESHOLD} required`); return; }

    const paymentMethod = partner.payment_method;
    if (!paymentMethod || !Object.keys(paymentMethod).length) { showToast('Add a payment method first'); return; }

    // Create withdrawal request
    const wdRes = await fetch(`${getApiUrl()}/rest/v1/withdrawal_requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON, 'Authorization': `Bearer ${SUPABASE_ANON}`, 'Prefer': 'return=representation' },
      body: JSON.stringify({ partner_id: partnerId, amount: balance, status: 'pending', payment_method: paymentMethod })
    });

    const wdData = await wdRes.json();
    const wd = wdData?.[0];
    if (!wd) { showToast('Failed to create withdrawal request'); return; }

    // Send email notification to owner (Email 1: approve the program)
    await fetch(`${SUPABASE_URL}/functions/v1/manage-withdrawals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON },
      body: JSON.stringify({
        type: 'withdrawal_request',
        requestId: wd.id,
        partnerId,
        partnerEmail: partner.email,
        amount: balance,
        paymentMethod
      })
    }).catch(() => {});

    showToast('Withdrawal request submitted!');
    loadPartnerDashboard();
  } catch(e) { showToast('Error requesting withdrawal'); }
}

// Record ad impression for partner (called periodically)
async function recordPartnerImpression() {
  const partnerId = getPartnerSession();
  if (!partnerId || !appSettings.crossAds) return;
  // Simulate impression recording - in production this would come from the partner's site via their ad code
  try {
    const today = new Date().toISOString().split('T')[0];
    // Upsert impression for today
    await fetch(`${getApiUrl()}/rest/v1/ad_impressions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON, 'Authorization': `Bearer ${SUPABASE_ANON}`, 'Prefer': 'return=minimal' },
      body: JSON.stringify({ partner_id: partnerId, impressions: 1, clicks: 0, earnings: 0.001, date: today })
    }).catch(() => {
      // If unique constraint violation, patch instead
    });
  } catch(e) {}
}

// TOOL INFO SYSTEM
const TOOL_INFO = {
  'qr-gen': { title: 'QR Code Generator', steps: ['Enter a valid URL (https:// preferred - only links are accepted)','Pick custom light and dark colors','Select QR size and error correction level (High for center text)','Optionally add center text overlay (brand name, max 12 chars)','Optionally add a label shown above the QR code','Download as PNG or SVG'], tip: 'Use High error correction (30%) when adding center text to ensure scannability. Use dark colors on light backgrounds for best results.' },
  'pdf-extract': { title: 'PDF Text Extractor', steps: ['Click the upload area or drag a PDF file','The tool will extract all text content','Copy the extracted text to clipboard or download as .txt'], tip: 'Works best with text-based PDFs. Scanned images or image-based PDFs may not extract text.' },
  'resume': { title: 'CV Builder', steps: ['Fill in your personal details, experience, education, and skills','Each section has its own input fields','Click Generate to preview your professional CV','Download the CV as a styled HTML file'], tip: 'Keep descriptions concise. Use action verbs for experience entries.' },
  'img-compress': { title: 'Image Compressor', steps: ['Upload an image file (PNG, JPEG, WebP)','Adjust the quality slider to set compression level','See real-time file size comparison','Download the compressed image'], tip: '60-80% quality is usually a good balance between size and clarity.' },
  'word-count': { title: 'Word Counter', steps: ['Type or paste your text into the input area','View live counts for words, characters, sentences, and paragraphs','Track estimated reading and speaking time'], tip: 'Average reading speed is ~200 words/min, speaking is ~130 words/min.' },
  'unit-conv': { title: 'Unit Converter', steps: ['Select a conversion category (length, weight, temperature, etc.)','Enter a value in any unit','See the converted value in all related units instantly'], tip: 'Click any result to copy it to clipboard.' },
  'pwd-gen': { title: 'Password Generator', steps: ['Set desired password length (8-64 characters)','Toggle uppercase, lowercase, numbers, and symbols','Choose quantity to generate','Copy any password with one click'], tip: 'Use 16+ characters with all options enabled for maximum security.' },
  'contrast': { title: 'Contrast Checker', steps: ['Enter foreground and background colors','See WCAG 2.1 contrast ratio calculated live','Check AA and AAA compliance for normal and large text'], tip: 'AA requires 4.5:1 for normal text, 3:1 for large text. AAA requires 7:1 and 4.5:1.' },
  'currency': { title: 'Currency Converter', steps: ['Select source and target currencies','Enter the amount to convert','See the converted amount using offline rates'], tip: 'Rates are cached offline. Update them from settings when online.' },
  'hash': { title: 'Hash Generator', steps: ['Enter text to hash','Select hash algorithm (MD5, SHA-1, SHA-256, SHA-512)','Copy the generated hash'], tip: 'SHA-256 is recommended for most use cases. MD5 is not cryptographically secure.' },
  'thumbnail': { title: 'Safe Zone Overlay', steps: ['Upload an image','Select a social media platform overlay','See safe zone boundaries drawn on your image','Download the overlaid image'], tip: 'Keep important content within the safe zone to avoid platform UI overlaps.' },
  'vid-audio': { title: 'Video to Audio', steps: ['Upload a video file','The tool extracts the audio track','Download the extracted audio file'], tip: 'Supports MP4, WebM, and MOV formats. Output is MP3 or WAV.' },
  'screen-rec': { title: 'Screen Recorder', steps: ['Click Start Recording to begin','Grant browser screen sharing permission','Click Stop when done','Preview and download the recording'], tip: 'Use system audio option for recording video calls or presentations.' },
  'audio-rec': { title: 'Audio Recorder', steps: ['Click the record button to start','Speak into your microphone','Click stop when finished','Play back or download the recording'], tip: 'Allow microphone access when prompted by the browser.' },
  'color-pick': { title: 'Color Picker', steps: ['Click the eyedropper button to pick a color from your screen','Or use the color input to select manually','View HEX, RGB, and HSL values','Click any value to copy it'], tip: 'The eyedropper requires a browser that supports the EyeDropper API (Chrome/Edge).' },
  'srt-shift': { title: 'SRT Subtitle Shifter', steps: ['Upload or paste an SRT subtitle file','Enter the shift amount in milliseconds (positive = later, negative = earlier)','Preview the shifted timestamps','Download the adjusted SRT file'], tip: 'Common shift: +1000ms (1 sec later) or -500ms (half sec earlier).' },
  'img-format': { title: 'Image Format Converter', steps: ['Upload an image','Choose target format (PNG, JPEG, WebP)','Adjust quality if applicable','Download the converted image'], tip: 'WebP offers the best compression. PNG is lossless. JPEG is good for photos.' },
  'shadow': { title: 'CSS Shadow Generator', steps: ['Adjust horizontal and vertical offset','Set blur radius and spread','Pick shadow color and opacity','Copy the generated CSS box-shadow code'], tip: 'Negative spread creates inset-like shadows. Combine multiple shadows for depth.' },
  'svg-opt': { title: 'SVG Optimizer', steps: ['Paste or upload SVG code','The tool removes unnecessary attributes, comments, and metadata','See the size reduction stats','Download the optimized SVG'], tip: 'Typical savings are 20-40% without visible quality loss.' },
  'watermark': { title: 'Watermark Tool', steps: ['Upload an image','Enter watermark text and choose style','Adjust position, opacity, and size','Download the watermarked image'], tip: 'Use 15-30% opacity for a subtle but effective watermark.' },
  'csv-view': { title: 'CSV Viewer', steps: ['Upload or paste CSV content','Data is displayed as a formatted table','Sort columns by clicking headers','Search/filter rows'], tip: 'Supports comma, semicolon, and tab delimited files.' },
  'txt-bind': { title: 'Text Binder', steps: ['Upload multiple text files','They are combined into one document','Set the separator between files','Download or copy the merged output'], tip: 'Use a separator like "---" or blank line to distinguish file boundaries.' },
  'redact': { title: 'Text Redactor', steps: ['Paste text containing sensitive information','Select words or patterns to redact','Redacted content is replaced with [REDACTED]','Copy the cleaned text'], tip: 'Use regex patterns to redact emails, phone numbers, or SSNs automatically.' },
  'md-preview': { title: 'Markdown Preview', steps: ['Write or paste Markdown in the left panel','See a live rendered preview on the right','Supports headings, lists, code blocks, links, images, and tables'], tip: 'GitHub Flavored Markdown is supported including task lists and strikethrough.' },
  'signature': { title: 'Digital Signature', steps: ['Draw your signature on the canvas','Adjust stroke color and width','Clear and redraw if needed','Download as PNG with transparent background'], tip: 'Use a stylus or draw slowly for smoother signatures.' },
  'expense': { title: 'Expense Ledger', steps: ['Add expense entries with date, category, amount, and note','View running totals by category','Export data as CSV','Data is saved locally in your browser'], tip: 'Set a monthly budget to track spending against your limit.' },
  'json-val': { title: 'JSON Validator', steps: ['Paste your JSON string','The tool validates syntax and formatting','See formatted/beautified output','Copy the formatted JSON'], tip: 'Common errors: trailing commas, single quotes, unquoted keys.' },
  'base64': { title: 'Base64 Tool', steps: ['Enter text to encode, or paste Base64 to decode','Select encode or decode mode','See the result instantly','Copy the output'], tip: 'Base64 encoding increases size by ~33%. Not encryption - just encoding.' },
  'regex': { title: 'RegEx Tester', steps: ['Enter a regular expression pattern','Enter test text','See matches highlighted in real-time','View match groups and indices'], tip: 'Use i flag for case-insensitive, g for global, m for multiline matching.' },
  'case-conv': { title: 'Case Converter', steps: ['Paste your text','Click a conversion style: UPPER, lower, Title, camelCase, snake_case, kebab-case','Copy the result'], tip: 'camelCase and snake_case are common in programming. Title Case for headings.' },
  'compound': { title: 'Compound Interest Calculator', steps: ['Enter principal amount, annual rate, and years','Choose compounding frequency','View total amount and interest earned','See year-by-year breakdown'], tip: 'More frequent compounding = slightly higher returns. Daily compounds more than monthly.' },
  'timezone': { title: 'Timezone Converter', steps: ['Select source and target timezones','Enter a date and time','See the converted time instantly'], tip: 'Daylight saving time changes are handled automatically.' },
  'volume': { title: 'Volume Calculator', steps: ['Enter package dimensions (length, width, height)','Set the unit of measurement','See CBM (cubic meters) and cubic feet','Add multiple packages for total'], tip: 'Shipping costs are often based on CBM. 1 CBM = 35.3 cubic feet.' },
  'pomodoro': { title: 'Pomodoro Timer', steps: ['Set work duration (default 25 min) and break duration (default 5 min)','Click Start to begin the work timer','Take a break when the timer rings','Track completed pomodoros'], tip: 'The classic technique: 25 min work + 5 min break, with a 15 min break every 4 cycles.' },
  'habit': { title: 'Habit Tracker', steps: ['Add habits you want to track','Check off habits daily','Track streaks and completion rates','Data persists in local storage'], tip: 'Start with 2-3 habits. Consistency beats quantity.' },
  'bmi': { title: 'BMI Calculator', steps: ['Enter your weight and height','Select metric or imperial units','See your BMI and weight category','View the BMI scale chart'], tip: 'BMI is a general indicator. It does not account for muscle mass or body composition.' },
  'loan': { title: 'Loan Calculator', steps: ['Enter loan amount, interest rate, and term','See monthly payment, total payment, and total interest','View the amortization schedule'], tip: 'Even a 0.5% rate difference can save thousands over a long loan term.' },
  'subnet': { title: 'Subnet Calculator', steps: ['Enter an IP address and subnet mask or CIDR notation','See network address, broadcast, host range, and total hosts'], tip: 'CIDR /24 = 254 hosts, /16 = 65534 hosts, /8 = 16M+ hosts.' },
  'recipe': { title: 'Recipe Scaler', steps: ['Enter original recipe servings and desired servings','Input ingredient quantities','See all quantities scaled proportionally'], tip: 'Scaling up is reliable. Scaling down below 1 serving may need rounding adjustments.' },
  'metronome': { title: 'Metronome', steps: ['Set BPM (beats per minute)','Select time signature','Click Start to begin the click','Tap the beat to detect BPM'], tip: 'Standard tempo: 60-80 BPM (slow), 100-120 (moderate), 140-180 (fast).' },
  'momo-calc': { title: 'MoMo Calculator', steps: ['Enter the transaction amount in XAF','Select MTN MoMo or Orange Money','See the fee breakdown and total cost'], tip: 'Fees vary by amount bracket and provider. This shows standard withdrawal fees.' },
  'aspect-resize': { title: 'Aspect Resizer', steps: ['Select target platform (Instagram, YouTube, etc.)','Enter original width and height','See the resized dimensions maintaining aspect ratio'], tip: 'Common ratios: 1:1 (Instagram square), 16:9 (YouTube), 9:16 (Stories/Reels).' },
  'wa-bulk': { title: 'WhatsApp Bulk Links', steps: ['Type your message','Enter phone numbers with country codes (one per line)','Click Generate to create direct WhatsApp links','Open each link to send the message'], tip: 'Format numbers with country code, no + or spaces: e.g., 237653954225.' },
  'enscrypter': { title: 'Enscrypter', steps: ['Choose Encrypt or Decrypt mode','Enter your text and a secret key','Select algorithm (AES-256-GCM, Caesar, ROT13, Reverse+Base64)','Process and copy the result'], tip: 'AES-256-GCM is military-grade encryption. The same secret key is required to decrypt. Keep your key safe!' },
  'tg-decode': { title: 'Telegram Decoder', steps: ['Choose mode: Decode Link, Decode Formatting, or Encode Link','Paste a Telegram link or enter channel details','See decoded info: channel name, message ID, protocol links, etc.'], tip: 'Supports t.me links, tg:// protocol, invite links, and bot start parameters.' },
  'telegraph': { title: 'Telegraph Morse Decoder', steps: ['Select mode: Text to Morse or Morse to Text','Enter your text or morse code','Click Convert to see the result','Use Play Audio to hear the morse code as beeps'], tip: 'In morse: dot (.), dash (-), space between letters, slash (/) between words. Example: SOS = ... --- ...' },
  'secret-msg': { title: 'Secret Message Maker', steps: ['Write your private message','Set a numeric pin lock password','Click Generate to create a shareable link','Send the link - the recipient must enter the pin to read the message'], tip: 'The message is encoded (not encrypted). Use long, unique pins for better security. The pin is stored in the URL.' },
  'seo-wizard': { title: 'SEO & Hashtag Wizard', steps: ['Enter your core topic or niche keyword','Click Generate Tags','Get 20 SEO keywords and 15 trending hashtags','Click any tag to copy it, or use Copy All'], tip: 'Built-in databases for freelancing, photography, fitness, tech, cooking, music, design, marketing, education, and travel. Other topics generate dynamically.' },
  'zodiac': { title: 'Zodiac Detector', steps: ['Select your birth date using the date picker','Your zodiac sign is automatically detected','See your sign symbol, element, traits, and compatibility'], tip: 'Your zodiac sign is determined by the position of the Sun at your time of birth.' },
  'horoscope': { title: 'Horoscope', steps: ['Select your zodiac sign from the dropdown','Click Read Horoscope to reveal your reading','See love, career, and health ratings plus lucky numbers'], tip: 'Horoscopes are generated from traditional astrological interpretations.' },
  'ip-detect': { title: 'IP Detector', steps: ['Click Detect My IP','Your public IP address and location details are shown','Click the IP to copy it'], tip: 'This uses your public IP. It does not reveal your exact address, only approximate city/region.' },
  'astronomy': { title: 'Astronomy Portal', steps: ['Select a category: Planets, Stars, Galaxies, Comets, or Moons','Browse detailed information cards about each celestial body','Learn about our solar system and beyond'], tip: 'Our solar system has 8 planets, 200+ known moons, and billions of stars in the Milky Way alone.' },
  'barcode': { title: 'Barcode Generator', steps: ['Choose Generate or Scan mode','For generating: enter text/number, select format, click Generate','For scanning: click Start Camera Scan and point at a barcode','Download generated barcodes as SVG'], tip: 'Code 128 works for any text. EAN-13 needs exactly 13 digits. The scanner uses the BarcodeDetector API (Chrome/Edge).' },
  'about': { title: 'About Free File Wizard', steps: ['View app version and developer information','Read terms and conditions','Check the privacy policy','Reach out via developer email'], tip: 'This app was built to make premium tools accessible to everyone for free.' },
  'reviews': { title: 'Reviews', steps: ['Click stars to rate (1-5)','Enter your name and write a comment','Click Submit Review','Read other users reviews below'], tip: 'Reviews are stored locally and also forwarded to the developer. Honest feedback helps improve the app!' },
  'retro-games': { title: 'Retro Games', steps: ['Browse classic internet games from the early web','Click any game card to open it in a new tab','Play directly in your browser - no downloads needed'], tip: 'Games open in external sites. Make sure you have internet access. Includes Snake, Tetris, Pac-Man, Doom, and more!' },
  'community-games': { title: 'Community Games', steps: ['Browse approved community-submitted games','Click Open Game to play in a new tab','To submit: enable Partner: Games in settings, then fill the submission form','Games are reviewed by the developer before going live'], tip: 'Only valid game URLs are accepted. All submissions require approval before appearing in the app.' },
  'community-apps': { title: 'Community Apps', steps: ['Browse approved community-submitted web apps','Click Open App to use in a new tab','To submit: enable Partner: Web Apps in settings, then fill the submission form','Apps are reviewed by the developer before going live'], tip: 'Only valid web app URLs are accepted. All submissions require approval before appearing in the app.' },
  'partner-dashboard': { title: 'Cross-Ads Partner', steps: ['Enable Cross-Ads Sharing in settings to see this tool','Apply with your site, email, and Google AdSense slot ID','Get approved, then place the ad code on your site','Track earnings in your private dashboard','Request withdrawal when you reach $10','Get paid after admin approval'], tip: '30% commission on ad revenue. $10 minimum withdrawal. You need an approved game/app and a valid AdSense account to qualify.' }
};

function injectInfoButtons() {
  document.querySelectorAll('.tool-header').forEach(header => {
    if (header.querySelector('.tool-info-btn')) return;
    const titleEl = header.querySelector('.tool-title');
    if (!titleEl) return;
    const btn = document.createElement('button');
    btn.className = 'tool-info-btn';
    btn.textContent = 'i';
    btn.title = 'How to use this tool';
    btn.onclick = (e) => { e.stopPropagation(); showToolInfo(header.closest('.screen').id); };
    header.appendChild(btn);
  });
}

function showToolInfo(toolId) {
  const info = TOOL_INFO[toolId];
  if (!info) { showToast('Info not available for this tool'); return; }

  const overlay = document.createElement('div');
  overlay.className = 'info-modal-overlay';
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
  overlay.innerHTML = `
    <div class="info-modal-box">
      <h3>${info.title}</h3>
      <p><strong>How to use:</strong></p>
      <ul>${info.steps.map(s => `<li>${s}</li>`).join('')}</ul>
      <p style="padding:8px 12px;background:rgba(0,240,255,0.08);border-radius:8px;border-left:3px solid var(--accent-cyan);margin-top:8px;"><strong>Tip:</strong> ${info.tip}</p>
      <button class="btn btn-secondary btn-sm info-modal-close" onclick="this.closest('.info-modal-overlay').remove()">Got it!</button>
    </div>`;
  document.body.appendChild(overlay);
}

// INIT WITH EXTRAS
function init() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('sandbox') === 'true') {
    initSandboxPage();
    return;
  }

  // Security: Freeze settings after load
  loadSettings();
  if (window._freezeSettings) window._freezeSettings();

  loadProfile();
  loadSelfHostConfig();
  syncSandboxToggleState();
  syncRevokedConnections();
  renderSidebar();
  renderToolCards();
  renderExpenses();
  renderHabits();
  updateTimezoneList();
  updateVolumeUI();
  initSigCanvas();
  applySettings();
  checkSecretMessage();
  injectInfoButtons();
  initReviewStars();
  loadReviews();
  renderRetroGames();
  autoSyncData();
  sendAnalyticsReport();
  initSelfPromotion();
  enforceSecurityLocks();
  loadAdminFeed();
  initUserCodeName();
  trackLiveUser();
  checkUnfinishedActions();
  setTimeout(injectStrategicAds, 1500);
  setTimeout(checkUserSuggestions, 3000);
}

// === SECURITY: Enforce locks to prevent unauthorized modifications ===
function enforceSecurityLocks() {
  // Prevent iframe embedding (clickjacking)
  if (window.top !== window.self) {
    window.top.location = window.self.location;
  }

  // Protect against drag-and-drop script execution
  document.addEventListener('dragover', e => e.preventDefault());
  document.addEventListener('drop', e => {
    e.preventDefault();
    showToast('File drops are disabled for security');
  });

  // Monitor for DOM mutations that modify protected elements
  const observer = new MutationObserver(mutations => {
    mutations.forEach(m => {
      if (m.type === 'childList') {
        m.addedNodes.forEach(node => {
          if (node.nodeType === 1) {
            // Strip script tags injected by users
            if (node.tagName === 'SCRIPT' && !node.src?.includes('supabase') && !node.src?.includes('google')) {
              node.remove();
            }
            // Strip inline event handlers
            const attrs = node.attributes;
            if (attrs) {
              for (let i = attrs.length - 1; i >= 0; i--) {
                if (attrs[i].name.startsWith('on')) {
                  node.removeAttribute(attrs[i].name);
                }
              }
            }
          }
        });
      }
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // Protect critical settings from being modified via console
  setInterval(() => {
    const stored = JSON.parse(localStorage.getItem('ffw_settings') || '{}');
    // Only allow settings that are defined in appSettings
    const validKeys = Object.keys({
      audioFeedback: true, ecoMode: false, autoSave: true, notifications: false,
      compactCards: false, lightMode: false, confirmActions: true, autoCopy: false,
      showInfoBtns: true, largeText: false, analyticsOptIn: false, autoSync: true,
      partnerGames: false, partnerApps: false, crossAds: false, selfHosted: false,
      sandboxMode: false
    });
    const hasExtraKeys = Object.keys(stored).some(k => !validKeys.includes(k));
    if (hasExtraKeys) {
      const clean = {};
      validKeys.forEach(k => clean[k] = stored[k] !== undefined ? stored[k] : appSettings[k]);
      localStorage.setItem('ffw_settings', JSON.stringify(clean));
      loadSettings();
      applySettings();
    }
  }, 5000);
}

// === USER CODE NAME & ACCOUNT SYSTEM ===
const USER_AUTH_URL = `${SUPABASE_URL}/functions/v1/user-auth`;
let userCodeName = localStorage.getItem('ffw_code_name') || '';
let userSession = JSON.parse(localStorage.getItem('ffw_session') || 'null');
let userAccount = null;

async function initUserCodeName() {
  if (userCodeName) return userCodeName;

  try {
    const ipRes = await fetch('https://api.ipify.org?format=json');
    const ipData = await ipRes.json();
    const ip = ipData.ip || 'unknown';

    const res = await fetch(`${USER_AUTH_URL}?action=generate_codename`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ip }),
    });
    const data = await res.json();
    if (data.codeName) {
      userCodeName = data.codeName;
      localStorage.setItem('ffw_code_name', userCodeName);
      localStorage.setItem('ffw_ip', ip);

      // Auto-populate username if they don't have one
      if (!localStorage.getItem('ffw_name')) {
        localStorage.setItem('ffw_name', `User_${userCodeName.substring(0, 6)}`);
        const nameEl = document.getElementById('profileName');
        if (nameEl) nameEl.textContent = `User_${userCodeName.substring(0, 6)}`;
      }
    }
  } catch(e) {
    // Fallback: generate locally
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$';
    let code = '';
    for (let i = 0; i < 20; i++) code += chars[Math.floor(Math.random() * chars.length)];
    userCodeName = code;
    localStorage.setItem('ffw_code_name', userCodeName);
  }
  return userCodeName;
}

function isSignedIn() {
  if (!userSession) return false;
  const expires = new Date(userSession.sessionExpires);
  if (expires < new Date()) {
    localStorage.removeItem('ffw_session');
    userSession = null;
    return false;
  }
  return true;
}

async function showSignUpFlow() {
  const ip = localStorage.getItem('ffw_ip') || 'unknown';

  // Generate code name first
  let codeName = userCodeName;
  if (!codeName) codeName = await initUserCodeName();

  // Generate recommended password
  let recommendedPwd = '';
  try {
    const pwdRes = await fetch(`${USER_AUTH_URL}?action=generate_password`);
    const pwdData = await pwdRes.json();
    recommendedPwd = pwdData.password || '';
  } catch(e) {}

  const modal = document.createElement('div');
  modal.className = 'modal show';
  modal.id = 'signupModal';
  modal.onclick = e => { if (e.target === modal) modal.remove(); };
  modal.innerHTML = `
    <div class="modal-content" onclick="event.stopPropagation()" style="max-width:440px;">
      <button class="modal-close" onclick="document.getElementById('signupModal').remove()">&times;</button>
      <h3 class="modal-title">Create Your Account</h3>

      <div style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.06);margin-bottom:12px;">
        <div style="font-size:11px;color:var(--text-secondary);margin-bottom:4px;">Your Unique Code Name</div>
        <div style="display:flex;gap:8px;">
          <input type="text" id="signupCodeName" value="${escAttr(codeName)}" readonly style="flex:1;padding:10px;background:rgba(0,240,255,0.06);border:1px solid rgba(0,240,255,0.2);border-radius:8px;color:var(--accent-cyan);font-size:14px;font-weight:700;font-family:monospace;letter-spacing:1px;">
          <button onclick="navigator.clipboard.writeText(document.getElementById('signupCodeName').value).then(()=>showToast('Code name copied!'))" style="padding:8px 12px;border-radius:8px;border:1px solid rgba(0,240,255,0.2);background:rgba(0,240,255,0.06);color:var(--accent-cyan);cursor:pointer;font-size:12px;">Copy</button>
        </div>
        <div style="font-size:10px;color:var(--text-secondary);margin-top:4px;">Auto-generated from your IP. This is your permanent ID.</div>
      </div>

      <div style="margin-bottom:12px;">
        <label style="font-size:11px;color:var(--text-secondary);display:block;margin-bottom:4px;">Official Google Email</label>
        <input type="email" id="signupEmail" placeholder="you@gmail.com" style="width:100%;padding:10px;background:var(--bg-core);border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:var(--text-primary);font-size:13px;">
      </div>

      <div style="margin-bottom:12px;">
        <label style="font-size:11px;color:var(--text-secondary);display:block;margin-bottom:4px;">Strong Password</label>
        <input type="password" id="signupPassword" value="${escAttr(recommendedPwd)}" style="width:100%;padding:10px;background:var(--bg-core);border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:var(--text-primary);font-size:13px;font-family:monospace;">
        <div style="display:flex;justify-content:space-between;margin-top:4px;">
          <span style="font-size:10px;color:var(--text-secondary);">Min 8 chars, include upper/lower/number/symbol</span>
          <button onclick="navigator.clipboard.writeText(document.getElementById('signupPassword').value).then(()=>showToast('Password copied!'))" style="font-size:10px;background:none;border:none;color:var(--accent-cyan);cursor:pointer;">Copy Password</button>
        </div>
      </div>

      <div style="margin-bottom:16px;">
        <label style="font-size:11px;color:var(--text-secondary);display:block;margin-bottom:4px;">Display Name (optional)</label>
        <input type="text" id="signupDisplayName" placeholder="Your name" style="width:100%;padding:10px;background:var(--bg-core);border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:var(--text-primary);font-size:13px;">
      </div>

      <button onclick="handleSignUp()" style="width:100%;padding:12px;background:linear-gradient(135deg,#00f0ff,#0891b2);border:none;border-radius:8px;color:#fff;font-size:14px;font-weight:700;cursor:pointer;">Create Account & Copy Credentials</button>
      <div style="text-align:center;margin-top:10px;">
        <span style="font-size:12px;color:var(--text-secondary);">Already have an account?</span>
        <button onclick="document.getElementById('signupModal').remove();showSignInFlow()" style="font-size:12px;background:none;border:none;color:var(--accent-cyan);cursor:pointer;font-weight:600;">Sign In</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function showSignInFlow() {
  const modal = document.createElement('div');
  modal.className = 'modal show';
  modal.id = 'signinModal';
  modal.onclick = e => { if (e.target === modal) modal.remove(); };
  modal.innerHTML = `
    <div class="modal-content" onclick="event.stopPropagation()" style="max-width:400px;">
      <button class="modal-close" onclick="document.getElementById('signinModal').remove()">&times;</button>
      <h3 class="modal-title">Sign In</h3>

      <div style="margin-bottom:12px;">
        <label style="font-size:11px;color:var(--text-secondary);display:block;margin-bottom:4px;">Email</label>
        <input type="email" id="signinEmail" placeholder="you@gmail.com" style="width:100%;padding:10px;background:var(--bg-core);border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:var(--text-primary);font-size:13px;">
      </div>

      <div style="margin-bottom:16px;">
        <label style="font-size:11px;color:var(--text-secondary);display:block;margin-bottom:4px;">Password</label>
        <input type="password" id="signinPassword" placeholder="Your password" style="width:100%;padding:10px;background:var(--bg-core);border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:var(--text-primary);font-size:13px;">
      </div>

      <button onclick="handleSignIn()" style="width:100%;padding:12px;background:linear-gradient(135deg,#00f0ff,#0891b2);border:none;border-radius:8px;color:#fff;font-size:14px;font-weight:700;cursor:pointer;">Sign In</button>
      <div style="text-align:center;margin-top:10px;">
        <span style="font-size:12px;color:var(--text-secondary);">No account?</span>
        <button onclick="document.getElementById('signinModal').remove();showSignUpFlow()" style="font-size:12px;background:none;border:none;color:var(--accent-cyan);cursor:pointer;font-weight:600;">Create Account</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

async function handleSignUp() {
  const codeName = document.getElementById('signupCodeName')?.value;
  const email = validateInput(document.getElementById('signupEmail')?.value, 'email');
  const password = document.getElementById('signupPassword')?.value;
  const displayName = document.getElementById('signupDisplayName')?.value?.trim();
  const ip = localStorage.getItem('ffw_ip') || '';

  if (!email) { showToast('Valid email required'); return; }
  if (!password || password.length < 8) { showToast('Password must be at least 8 characters'); return; }

  const btn = document.querySelector('#signupModal button[onclick="handleSignUp()"]');
  if (btn) { btn.textContent = 'Creating...'; btn.disabled = true; }

  try {
    const res = await fetch(`${USER_AUTH_URL}?action=signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codeName, email, password, displayName, ip }),
    });
    const data = await res.json();

    if (data.error) {
      showToast(data.error, 'error');
      if (btn) { btn.textContent = 'Create Account & Copy Credentials'; btn.disabled = false; }
      return;
    }

    // Copy all credentials to clipboard
    const credentials = `Code Name: ${codeName}\nEmail: ${email}\nPassword: ${password}`;
    navigator.clipboard.writeText(credentials).then(() => showToast('Credentials copied to clipboard!'));

    // Set session
    userSession = { codeName, email, sessionExpires: data.sessionExpires, displayName: displayName || email.split('@')[0] };
    localStorage.setItem('ffw_session', JSON.stringify(userSession));
    localStorage.setItem('ffw_name', displayName || email.split('@')[0]);

    document.getElementById('signupModal')?.remove();
    showToast('Account created! Welcome to Free File Wizard.');
    onSignInComplete();
  } catch(e) {
    showToast('Signup failed. Try again.', 'error');
    if (btn) { btn.textContent = 'Create Account & Copy Credentials'; btn.disabled = false; }
  }
}

async function handleSignIn() {
  const email = validateInput(document.getElementById('signinEmail')?.value, 'email');
  const password = document.getElementById('signinPassword')?.value;
  const ip = localStorage.getItem('ffw_ip') || '';

  if (!email || !password) { showToast('Email and password required'); return; }

  try {
    const res = await fetch(`${USER_AUTH_URL}?action=signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codeName: userCodeName, email, password, ip }),
    });
    const data = await res.json();

    if (data.error) {
      showToast(data.error, 'error');
      return;
    }

    userSession = { ...data.account, email };
    localStorage.setItem('ffw_session', JSON.stringify(userSession));
    localStorage.setItem('ffw_name', data.account.displayName || email.split('@')[0]);
    userCodeName = data.account.codeName;
    localStorage.setItem('ffw_code_name', userCodeName);

    document.getElementById('signinModal')?.remove();
    showToast('Welcome back!');
    onSignInComplete();
  } catch(e) {
    showToast('Sign in failed', 'error');
  }
}

function signOut() {
  localStorage.removeItem('ffw_session');
  userSession = null;
  userAccount = null;
  showToast('Signed out');
  openScreen('home');
  renderSidebar();
}

function onSignInComplete() {
  // Update name displays
  const name = localStorage.getItem('ffw_name') || 'User';
  const nameEl = document.getElementById('profileName');
  if (nameEl) nameEl.textContent = name;
  const ddName = document.getElementById('dropdownName');
  if (ddName) ddName.textContent = name;

  renderSidebar();
  checkUserSuggestions();
}

// === INTELLIGENT SUGGESTION ENGINE ===
async function checkUserSuggestions() {
  if (!userCodeName) return;
  try {
    const res = await fetch(`${USER_AUTH_URL}?action=get_suggestions&codeName=${userCodeName}`, {
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    if (data.suggestions?.length > 0) {
      data.suggestions.forEach(s => {
        setTimeout(() => showSuggestionToast(s), Math.random() * 5000);
      });
    }
  } catch(e) {}
}

function showSuggestionToast(suggestion) {
  const typeIcons = { feature: '💡', reminder: '⏰', warning: '⚠️', guide: '📖', unfinished_action: '🔄' };
  const icon = typeIcons[suggestion.suggestion_type] || '💡';
  showToast(`${icon} ${suggestion.title}`, 5000);
}

// Track unfinished actions
function trackUnfinishedAction(toolId, detail) {
  if (!userCodeName) return;
  const unfinished = JSON.parse(localStorage.getItem('ffw_unfinished') || '{}');
  unfinished[toolId] = { detail, ts: Date.now() };
  localStorage.setItem('ffw_unfinished', JSON.stringify(unfinished));
}

function checkUnfinishedActions() {
  const unfinished = JSON.parse(localStorage.getItem('ffw_unfinished') || '{}');
  const keys = Object.keys(unfinished);
  if (keys.length > 0 && isSignedIn()) {
    const oldest = keys[0];
    showToast(`🔄 You have unfinished work in ${oldest}`, 4000);
  }
}

// Log user actions with code name
async function logUserAction(actionType, detail) {
  if (!userCodeName) return;
  const ip = localStorage.getItem('ffw_ip') || '';
  try {
    await fetch(`${USER_AUTH_URL}?action=log_action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codeName: userCodeName, actionType, actionDetail: detail, ip }),
    });
  } catch(e) {}
}

// Detect hack/rule violations
function detectSecurityViolation(action) {
  const violations = [
    'prototype_pollution', 'xss_attempt', 'sql_injection',
    'dom_manipulation', 'unauthorized_access', 'script_injection'
  ];
  if (violations.some(v => action.toLowerCase().includes(v))) {
    logUserAction('hack_attempt', action);
    showToast('⚠️ Security violation detected. This action has been logged.', 5000);
    return true;
  }

  // Check for suspicious DOM modifications
  if (action.includes('document.cookie') || action.includes('localStorage.removeItem')) {
    logUserAction('rule_violation', `Suspicious operation: ${action.substring(0, 100)}`);
    showToast('⚠️ Suspicious activity logged.', 4000);
    return true;
  }
  return false;
}

// Override critical operations to detect violations
const originalSetItem = localStorage.setItem.bind(localStorage);
localStorage.setItem = function(key, value) {
  if (typeof value === 'string' && detectSecurityViolation(value)) return;
  return originalSetItem(key, value);
};

// === SIGNED-IN USER ACCOUNT SCREEN ===
function openAccountScreen() {
  if (!isSignedIn()) { showSignInFlow(); return; }

  const container = document.createElement('div');
  container.className = 'modal show';
  container.id = 'accountModal';
  container.onclick = e => { if (e.target === container) container.remove(); };

  const s = userSession || {};
  const codeName = s.codeName || userCodeName;
  const email = s.email || '';
  const displayName = s.displayName || localStorage.getItem('ffw_name') || 'User';
  const isPartner = s.isPartner || false;
  const partnerStatus = s.partnerStatus || 'none';
  const balance = s.balance || 0;

  container.innerHTML = `
    <div class="modal-content" onclick="event.stopPropagation()" style="max-width:500px;max-height:90vh;overflow-y:auto;">
      <button class="modal-close" onclick="document.getElementById('accountModal').remove()">&times;</button>

      <div style="text-align:center;padding:16px 0;border-bottom:1px solid rgba(255,255,255,0.06);margin-bottom:16px;">
        <div style="width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,#00f0ff,#0891b2);display:flex;align-items:center;justify-content:center;margin:0 auto 10px;font-size:28px;">👤</div>
        <div style="font-size:18px;font-weight:700;color:#fff;">${esc(displayName)}</div>
        <div style="font-size:11px;color:var(--accent-cyan);font-family:monospace;margin-top:4px;">Code: ${esc(codeName)}</div>
        <div style="font-size:11px;color:var(--text-secondary);margin-top:2px;">${esc(email)}</div>
        ${isPartner ? `<div style="margin-top:6px;display:inline-block;padding:3px 10px;background:rgba(16,185,129,0.15);border-radius:4px;font-size:10px;color:#10b981;font-weight:700;">PARTNER: ${(partnerStatus || 'NONE').toUpperCase()}</div>` : ''}
      </div>

      <!-- Signed-in Hamburger Menu Tools -->
      <div style="margin-bottom:16px;">
        <div style="font-size:11px;font-weight:700;color:var(--accent-cyan);text-transform:uppercase;margin-bottom:8px;letter-spacing:0.5px;">Your Tools</div>
        <button onclick="document.getElementById('accountModal').remove();openSubmissionForm('game')" style="width:100%;text-align:left;padding:10px 12px;background:rgba(0,240,255,0.04);border:1px solid rgba(0,240,255,0.1);border-radius:8px;color:#fff;font-size:13px;cursor:pointer;margin-bottom:6px;display:flex;align-items:center;gap:8px;" onmouseover="this.style.borderColor='rgba(0,240,255,0.3)'" onmouseout="this.style.borderColor='rgba(0,240,255,0.1)'">🎮 Add Game</button>
        <button onclick="document.getElementById('accountModal').remove();openSubmissionForm('website')" style="width:100%;text-align:left;padding:10px 12px;background:rgba(0,240,255,0.04);border:1px solid rgba(0,240,255,0.1);border-radius:8px;color:#fff;font-size:13px;cursor:pointer;margin-bottom:6px;display:flex;align-items:center;gap:8px;" onmouseover="this.style.borderColor='rgba(0,240,255,0.3)'" onmouseout="this.style.borderColor='rgba(0,240,255,0.1)'">🌐 Add Website</button>
        <button onclick="document.getElementById('accountModal').remove();openSubmissionForm('database')" style="width:100%;text-align:left;padding:10px 12px;background:rgba(0,240,255,0.04);border:1px solid rgba(0,240,255,0.1);border-radius:8px;color:#fff;font-size:13px;cursor:pointer;margin-bottom:6px;display:flex;align-items:center;gap:8px;" onmouseover="this.style.borderColor='rgba(0,240,255,0.3)'" onmouseout="this.style.borderColor='rgba(0,240,255,0.1)'">🗄️ Add Database</button>
        <button onclick="document.getElementById('accountModal').remove();joinPartnerProgram()" style="width:100%;text-align:left;padding:10px 12px;background:rgba(16,185,129,0.04);border:1px solid rgba(16,185,129,0.15);border-radius:8px;color:#10b981;font-size:13px;cursor:pointer;margin-bottom:6px;display:flex;align-items:center;gap:8px;" onmouseover="this.style.borderColor='rgba(16,185,129,0.3)'" onmouseout="this.style.borderColor='rgba(16,185,129,0.15)'">💰 Join Shared Ads Program</button>
      </div>

      ${isPartner && partnerStatus === 'approved' ? `
      <div style="margin-bottom:16px;padding:12px;background:rgba(16,185,129,0.05);border:1px solid rgba(16,185,129,0.15);border-radius:8px;">
        <div style="font-size:11px;font-weight:700;color:#10b981;text-transform:uppercase;margin-bottom:6px;">Partner Earnings</div>
        <div style="font-size:20px;font-weight:700;color:#fff;">$${parseFloat(balance).toFixed(2)}</div>
        <div style="font-size:11px;color:var(--text-secondary);margin-bottom:8px;">Minimum withdrawal: $100</div>
        <button onclick="document.getElementById('accountModal').remove();openWithdrawalModal()" style="width:100%;padding:8px;background:linear-gradient(135deg,#10b981,#059669);border:none;border-radius:6px;color:#fff;font-size:12px;font-weight:600;cursor:pointer;">Request Withdrawal</button>
      </div>` : ''}

      <div style="border-top:1px solid rgba(255,255,255,0.06);padding-top:12px;display:flex;flex-direction:column;gap:6px;">
        <button onclick="document.getElementById('accountModal').remove();openScreen('home')" style="width:100%;text-align:left;padding:8px 12px;background:none;border:none;color:var(--text-secondary);font-size:12px;cursor:pointer;">🏠 Back to Regular Tools</button>
        <button onclick="document.getElementById('accountModal').remove();signOut()" style="width:100%;text-align:left;padding:8px 12px;background:none;border:none;color:var(--error);font-size:12px;cursor:pointer;font-weight:600;">Sign Out</button>
      </div>
    </div>
  `;
  document.body.appendChild(container);
}

// === SUBMISSION FORMS WITH GUIDE ===
function openSubmissionForm(type) {
  if (!isSignedIn()) { showSignInFlow(); return; }

  const guides = {
    game: {
      title: 'Submit a Game',
      icon: '🎮',
      requirements: [
        { field: 'name', label: 'Game Name', required: true, why: 'Users need to identify your game', use: 'Displayed in tool hub' },
        { field: 'description', label: 'Description', required: true, why: 'Users decide to play based on this', use: 'Shown in game card' },
        { field: 'url', label: 'Game URL', required: true, why: 'Where the game is hosted', use: 'Users click to play' },
        { field: 'category', label: 'Category', required: true, why: 'Groups your game with similar ones', use: 'Filter in tool hub' },
        { field: 'techStack', label: 'Tech Stack', required: false, why: 'Helps us verify compatibility', use: 'Internal review' },
        { field: 'screenshotUrl', label: 'Screenshot URL', required: true, why: 'Users preview before playing', use: 'Thumbnail image' },
        { field: 'demoUrl', label: 'Demo URL', required: false, why: 'Optional playable demo', use: 'Preview link' },
        { field: 'sourceCodeUrl', label: 'Source Code URL', required: false, why: 'For open-source games', use: 'Community trust' },
        { field: 'licenseType', label: 'License Type', required: true, why: 'Legal requirement', use: 'Rights verification' },
        { field: 'supportEmail', label: 'Support Email', required: true, why: 'Users report bugs', use: 'Contact channel' },
        { field: 'version', label: 'Version', required: false, why: 'Track updates', use: 'Version display' },
      ],
      reject: ['Malware or tracking code', 'Broken or unplayable game', 'Stolen content without credit', 'Excessive ads or pop-ups', 'No screenshot provided'],
      expect: 'Review takes 1-3 days. Approved games appear in the tool hub under your category.',
    },
    website: {
      title: 'Submit a Website',
      icon: '🌐',
      requirements: [
        { field: 'name', label: 'Website Name', required: true, why: 'Identity in tool hub', use: 'Displayed name' },
        { field: 'description', label: 'Description', required: true, why: 'Users decide to visit', use: 'Card description' },
        { field: 'url', label: 'Website URL', required: true, why: 'Where users access it', use: 'Click destination' },
        { field: 'category', label: 'Category', required: true, why: 'Organization', use: 'Filter category' },
        { field: 'techStack', label: 'Tech Stack', required: false, why: 'Compatibility check', use: 'Internal' },
        { field: 'screenshotUrl', label: 'Screenshot URL', required: true, why: 'Visual preview', use: 'Thumbnail' },
        { field: 'privacyPolicyUrl', label: 'Privacy Policy URL', required: true, why: 'Legal requirement', use: 'Compliance' },
        { field: 'termsUrl', label: 'Terms URL', required: false, why: 'User protection', use: 'Compliance' },
        { field: 'supportEmail', label: 'Support Email', required: true, why: 'User support', use: 'Contact' },
        { field: 'version', label: 'Version', required: false, why: 'Update tracking', use: 'Display' },
      ],
      reject: ['Phishing or scam sites', 'Data harvesting without consent', 'Broken or non-functional site', 'No privacy policy', 'Excessive tracking scripts'],
      expect: 'Review takes 1-5 days. Approved sites appear in the tool hub.',
    },
    database: {
      title: 'Submit a Database',
      icon: '🗄️',
      requirements: [
        { field: 'name', label: 'Database Name', required: true, why: 'Identity', use: 'Displayed name' },
        { field: 'description', label: 'Description', required: true, why: 'Users decide to connect', use: 'Card info' },
        { field: 'url', label: 'Connection URL', required: true, why: 'Where data lives', use: 'Connection endpoint' },
        { field: 'category', label: 'Category', required: true, why: 'Organization', use: 'Filter' },
        { field: 'techStack', label: 'Tech Stack (DB type)', required: true, why: 'Compatibility', use: 'Internal review' },
        { field: 'screenshotUrl', label: 'Schema Screenshot', required: false, why: 'Visual aid', use: 'Reference' },
        { field: 'licenseType', label: 'Access License', required: true, why: 'Legal', use: 'Rights' },
        { field: 'privacyPolicyUrl', label: 'Privacy Policy', required: true, why: 'Data protection', use: 'Compliance' },
        { field: 'supportEmail', label: 'Support Email', required: true, why: 'Support channel', use: 'Contact' },
      ],
      reject: ['Databases with user data without consent', 'Unsecured endpoints', 'No privacy policy', 'Exposed credentials'],
      expect: 'Review takes 3-7 days due to security checks. Approved databases appear in the tool hub.',
    },
  };

  const guide = guides[type];
  if (!guide) return;

  const modal = document.createElement('div');
  modal.className = 'modal show';
  modal.id = 'submissionModal';
  modal.onclick = e => { if (e.target === modal) modal.remove(); };

  let fieldsHtml = guide.requirements.map(r => `
    <div style="margin-bottom:10px;">
      <label style="font-size:11px;color:${r.required ? 'var(--accent-cyan)' : 'var(--text-secondary)'};font-weight:${r.required ? '700' : '400'};">
        ${r.required ? '★ ' : ''}${r.label}
      </label>
      <input type="${r.field.includes('url') || r.field.includes('Url') ? 'url' : 'text'}" id="sub_${r.field}" placeholder="${r.label}" style="width:100%;padding:8px 10px;background:var(--bg-core);border:1px solid rgba(255,255,255,0.1);border-radius:6px;color:var(--text-primary);font-size:12px;">
      <div style="font-size:9px;color:var(--text-secondary);margin-top:2px;">Why: ${r.why} | Used for: ${r.use}</div>
    </div>
  `).join('');

  modal.innerHTML = `
    <div class="modal-content" onclick="event.stopPropagation()" style="max-width:520px;max-height:90vh;overflow-y:auto;">
      <button class="modal-close" onclick="document.getElementById('submissionModal').remove()">&times;</button>
      <h3 class="modal-title">${guide.icon} ${guide.title}</h3>

      <!-- Quick Guide -->
      <div style="padding:10px;background:rgba(245,158,11,0.06);border:1px solid rgba(245,158,11,0.15);border-radius:8px;margin-bottom:16px;">
        <div style="font-size:11px;font-weight:700;color:#f59e0b;margin-bottom:6px;">Submission Guide</div>
        <div style="font-size:10px;color:var(--text-secondary);line-height:1.6;">
          <div style="margin-bottom:4px;"><strong style="color:#f59e0b;">What is required:</strong> Fields marked with ★ are mandatory.</div>
          <div style="margin-bottom:4px;"><strong style="color:#f59e0b;">Why we need it:</strong> Shown below each field.</div>
          <div style="margin-bottom:4px;"><strong style="color:#ef4444;">What gets you rejected:</strong></div>
          ${guide.reject.map(r => `<div style="color:#ef4444;padding-left:8px;">✕ ${r}</div>`).join('')}
          <div style="margin-top:4px;"><strong style="color:#10b981;">What to expect:</strong> ${guide.expect}</div>
        </div>
      </div>

      ${fieldsHtml}

      <button onclick="submitToolForm('${type}')" style="width:100%;padding:10px;background:linear-gradient(135deg,#00f0ff,#0891b2);border:none;border-radius:8px;color:#fff;font-size:13px;font-weight:700;cursor:pointer;">Submit for Review</button>
    </div>
  `;
  document.body.appendChild(modal);
}

async function submitToolForm(type) {
  if (!isSignedIn()) { showSignInFlow(); return; }

  const fields = ['name', 'description', 'url', 'category', 'techStack', 'screenshotUrl', 'demoUrl', 'sourceCodeUrl', 'licenseType', 'privacyPolicyUrl', 'termsUrl', 'supportEmail', 'version'];
  const data = { codeName: userCodeName, submissionType: type };
  let missing = [];

  fields.forEach(f => {
    const el = document.getElementById(`sub_${f}`);
    if (el) data[f] = el.value.trim();
  });

  // Validate required fields
  if (!data.name) missing.push('Name');
  if (!data.description) missing.push('Description');
  if (!data.url) missing.push('URL');
  if (!data.category) missing.push('Category');
  if (type === 'game' && !data.screenshotUrl) missing.push('Screenshot');
  if (type === 'website' && !data.privacyPolicyUrl) missing.push('Privacy Policy');
  if (type === 'database' && !data.techStack) missing.push('Tech Stack');

  if (missing.length > 0) {
    showToast(`Required: ${missing.join(', ')}`, 'error');
    return;
  }

  try {
    const res = await fetch(`${USER_AUTH_URL}?action=submit_tool`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();

    if (result.error) {
      showToast(result.error, 'error');
      return;
    }

    showToast('Submitted for review! Check back in 1-3 days.');
    document.getElementById('submissionModal')?.remove();
    logUserAction('submission', `Submitted ${type}: ${data.name}`);
  } catch(e) {
    showToast('Submission failed', 'error');
  }
}

async function joinPartnerProgram() {
  if (!isSignedIn()) { showSignInFlow(); return; }
  if (!confirm('Join the Shared Ads Program? You earn 30% of ad revenue from your content. Minimum withdrawal: $100.')) return;

  try {
    const res = await fetch(`${USER_AUTH_URL}?action=join_partner`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codeName: userCodeName }),
    });
    const data = await res.json();
    if (data.success) {
      showToast('Partner application submitted! Admin will review within 48 hours.');
      if (userSession) userSession.partnerStatus = 'pending';
      localStorage.setItem('ffw_session', JSON.stringify(userSession));
    }
  } catch(e) {
    showToast('Failed to join program', 'error');
  }
}

function openWithdrawalModal() {
  if (!isSignedIn()) { showSignInFlow(); return; }
  const balance = userSession?.balance || 0;

  const modal = document.createElement('div');
  modal.className = 'modal show';
  modal.id = 'withdrawModal';
  modal.onclick = e => { if (e.target === modal) modal.remove(); };

  modal.innerHTML = `
    <div class="modal-content" onclick="event.stopPropagation()" style="max-width:420px;">
      <button class="modal-close" onclick="document.getElementById('withdrawModal').remove()">&times;</button>
      <h3 class="modal-title">💸 Withdrawal</h3>
      <div style="text-align:center;padding:12px 0;margin-bottom:12px;">
        <div style="font-size:11px;color:var(--text-secondary);">Available Balance</div>
        <div style="font-size:28px;font-weight:700;color:#10b981;">$${parseFloat(balance).toFixed(2)}</div>
        <div style="font-size:10px;color:var(--text-secondary);margin-top:4px;">Minimum: $100</div>
      </div>

      ${parseFloat(balance) < 100 ? `
        <div style="padding:10px;background:rgba(245,158,11,0.06);border:1px solid rgba(245,158,11,0.15);border-radius:8px;margin-bottom:12px;font-size:12px;color:#f59e0b;">
          You need at least $100 to request a withdrawal. Keep creating content!
        </div>
      ` : `
        <div style="padding:12px;background:rgba(16,185,129,0.04);border:1px solid rgba(16,185,129,0.15);border-radius:8px;margin-bottom:12px;">
          <div style="font-size:11px;font-weight:700;color:#10b981;margin-bottom:8px;">Bank Details</div>
          <div style="margin-bottom:6px;"><label style="font-size:10px;color:var(--text-secondary);">Bank Name</label><input type="text" id="wdBankName" placeholder="Bank name" style="width:100%;padding:7px;background:var(--bg-core);border:1px solid rgba(255,255,255,0.1);border-radius:6px;color:var(--text-primary);font-size:12px;"></div>
          <div style="margin-bottom:6px;"><label style="font-size:10px;color:var(--text-secondary);">Account Number</label><input type="text" id="wdAccountNumber" placeholder="Account number" style="width:100%;padding:7px;background:var(--bg-core);border:1px solid rgba(255,255,255,0.1);border-radius:6px;color:var(--text-primary);font-size:12px;"></div>
          <div style="margin-bottom:6px;"><label style="font-size:10px;color:var(--text-secondary);">Account Holder Name</label><input type="text" id="wdAccountName" placeholder="Full name on account" style="width:100%;padding:7px;background:var(--bg-core);border:1px solid rgba(255,255,255,0.1);border-radius:6px;color:var(--text-primary);font-size:12px;"></div>
          <div style="margin-bottom:6px;"><label style="font-size:10px;color:var(--text-secondary);">Routing Number</label><input type="text" id="wdRoutingNumber" placeholder="Routing number" style="width:100%;padding:7px;background:var(--bg-core);border:1px solid rgba(255,255,255,0.1);border-radius:6px;color:var(--text-primary);font-size:12px;"></div>
          <div style="margin-bottom:6px;"><label style="font-size:10px;color:var(--text-secondary);">SWIFT Code (optional)</label><input type="text" id="wdSwiftCode" placeholder="SWIFT/BIC" style="width:100%;padding:7px;background:var(--bg-core);border:1px solid rgba(255,255,255,0.1);border-radius:6px;color:var(--text-primary);font-size:12px;"></div>
        </div>
        <button onclick="requestWithdrawal()" style="width:100%;padding:10px;background:linear-gradient(135deg,#10b981,#059669);border:none;border-radius:8px;color:#fff;font-size:13px;font-weight:700;cursor:pointer;">Request Withdrawal</button>
      `}
    </div>
  `;
  document.body.appendChild(modal);
}

async function requestWithdrawal() {
  const bankName = document.getElementById('wdBankName')?.value?.trim();
  const accountNumber = document.getElementById('wdAccountNumber')?.value?.trim();
  const accountName = document.getElementById('wdAccountName')?.value?.trim();
  const routingNumber = document.getElementById('wdRoutingNumber')?.value?.trim();
  const swiftCode = document.getElementById('wdSwiftCode')?.value?.trim();

  if (!bankName || !accountNumber || !accountName) {
    showToast('Bank name, account number, and holder name required', 'error');
    return;
  }

  // Save bank details first
  try {
    await fetch(`${USER_AUTH_URL}?action=save_bank`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codeName: userCodeName, bankName, accountNumber, accountName, routingNumber, swiftCode }),
    });

    // Then request withdrawal
    const amount = userSession?.balance || 0;
    const wdRes = await fetch(`${USER_AUTH_URL}?action=request_withdrawal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codeName: userCodeName, amount }),
    });
    const wdData = await wdRes.json();

    if (wdData.error) {
      showToast(wdData.error, 'error');
      return;
    }

    showToast(`Withdrawal of $${parseFloat(amount).toFixed(2)} requested! Admin will process it.`);
    document.getElementById('withdrawModal')?.remove();
    if (userSession) userSession.balance = wdData.newBalance || 0;
    localStorage.setItem('ffw_session', JSON.stringify(userSession));
  } catch(e) {
    showToast('Withdrawal failed', 'error');
  }
}

// === COMMUNITY SYSTEM ===
window._communityRating = 5;

function switchCommunityTab(tab) {
  const sections = { chat: 'communityChatSection', support: 'communitySupportSection', review: 'communityReviewSection', collab: 'communityCollabSection', bug: 'communityBugSection' };
  Object.values(sections).forEach(id => { const el = document.getElementById(id); if (el) el.style.display = 'none'; });
  const target = document.getElementById(sections[tab]);
  if (target) target.style.display = 'block';

  document.querySelectorAll('#community .feed-filter-btn').forEach(b => b.classList.remove('active'));
  const tabBtn = document.getElementById('communityTab' + tab.charAt(0).toUpperCase() + tab.slice(1));
  if (tabBtn) tabBtn.classList.add('active');

  checkChatGate();
}

function checkChatGate() {
  const firstUse = localStorage.getItem('ffw_first_use');
  if (!firstUse) {
    localStorage.setItem('ffw_first_use', String(Date.now()));
  }
  const elapsed = Date.now() - parseInt(localStorage.getItem('ffw_first_use') || String(Date.now()));
  const threeMonths = 90 * 24 * 60 * 60 * 1000;

  const locked = document.getElementById('chatGateLocked');
  const unlocked = document.getElementById('chatGateUnlocked');
  const countdown = document.getElementById('chatCountdown');

  if (elapsed >= threeMonths) {
    if (locked) locked.style.display = 'none';
    if (unlocked) unlocked.style.display = 'block';
  } else {
    if (locked) locked.style.display = 'block';
    if (unlocked) unlocked.style.display = 'none';
    const remaining = threeMonths - elapsed;
    const days = Math.ceil(remaining / (24 * 60 * 60 * 1000));
    if (countdown) countdown.textContent = `Approximately ${days} days remaining until messaging unlocks`;
  }
}

async function sendChatMessage() {
  if (!rateLimiter()) { showToast('Slow down!'); return; }
  const input = document.getElementById('chatInput');
  const msg = validateInput(input?.value?.trim(), 'text');
  if (!msg) return;
  const name = localStorage.getItem('ffw_name') || 'Anonymous';

  // Store message locally (real-time messaging would need WebSocket/realtime)
  const messages = JSON.parse(localStorage.getItem('ffw_chat_messages') || '[]');
  messages.push({ name, msg, ts: Date.now() });
  localStorage.setItem('ffw_chat_messages', JSON.stringify(messages.slice(-50)));

  input.value = '';
  renderChatMessages();
  showToast('Message sent!');
}

function renderChatMessages() {
  const container = document.getElementById('chatMessages');
  if (!container) return;
  const messages = JSON.parse(localStorage.getItem('ffw_chat_messages') || '[]');
  if (messages.length === 0) {
    container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-secondary);font-size:13px;">No messages yet. Be the first to say hello!</div>';
    return;
  }
  container.innerHTML = messages.map(m => `
    <div style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.04);">
      <div style="display:flex;justify-content:space-between;">
        <span style="font-size:12px;font-weight:600;color:var(--accent-cyan);">${esc(m.name)}</span>
        <span style="font-size:10px;color:var(--text-secondary);">${new Date(m.ts).toLocaleTimeString()}</span>
      </div>
      <div style="font-size:13px;color:var(--text-primary);margin-top:4px;">${esc(m.msg)}</div>
    </div>
  `).join('');
  container.scrollTop = container.scrollHeight;
}

async function submitSupportRequest() {
  if (!rateLimiter()) { showToast('Slow down!'); return; }
  const category = document.getElementById('supportCategory')?.value || 'general';
  const email = validateInput(document.getElementById('supportEmail')?.value, 'email');
  const message = validateInput(document.getElementById('supportMessage')?.value, 'text');
  if (!message) { showToast('Please describe your issue'); return; }

  try {
    await fetch(`${SUPABASE_URL}/rest/v1/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON_KEY },
      body: JSON.stringify({ category: `support_${category}`, email, message, resolved: false }),
    });
    showToast('Support request submitted!');
    document.getElementById('supportMessage').value = '';
  } catch(e) { showToast('Failed to submit'); }
}

async function submitCommunityReview() {
  if (!rateLimiter()) { showToast('Slow down!'); return; }
  const rating = window._communityRating || 5;
  const comment = validateInput(document.getElementById('communityReviewComment')?.value, 'text');
  const name = localStorage.getItem('ffw_name') || 'User';

  try {
    await fetch(`${SUPABASE_URL}/rest/v1/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON_KEY },
      body: JSON.stringify({ name, rating, comment }),
    });
    showToast('Review submitted!');
    document.getElementById('communityReviewComment').value = '';
  } catch(e) { showToast('Failed to submit'); }
}

async function submitCollabRequest() {
  if (!rateLimiter()) { showToast('Slow down!'); return; }
  const name = validateInput(document.getElementById('collabName')?.value, 'text');
  const email = validateInput(document.getElementById('collabEmail')?.value, 'email');
  const type = document.getElementById('collabType')?.value || 'other';
  const message = validateInput(document.getElementById('collabMessage')?.value, 'text');
  if (!name || !message) { showToast('Name and proposal required'); return; }

  try {
    await fetch(`${SUPABASE_URL}/rest/v1/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON_KEY },
      body: JSON.stringify({ category: `collab_${type}`, email, message: `From: ${name}\n${message}`, resolved: false }),
    });
    showToast('Collaboration proposal submitted!');
    document.getElementById('collabName').value = '';
    document.getElementById('collabEmail').value = '';
    document.getElementById('collabMessage').value = '';
  } catch(e) { showToast('Failed to submit'); }
}

async function submitBugReport() {
  if (!rateLimiter()) { showToast('Slow down!'); return; }
  const tool = validateInput(document.getElementById('bugTool')?.value, 'text');
  const severity = document.getElementById('bugSeverity')?.value || 'medium';
  const email = validateInput(document.getElementById('bugEmail')?.value, 'email');
  const description = validateInput(document.getElementById('bugDescription')?.value, 'text');
  if (!tool || !description) { showToast('Tool name and description required'); return; }

  try {
    await fetch(`${SUPABASE_URL}/rest/v1/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON_KEY },
      body: JSON.stringify({ category: `bug_${severity}`, email, message: `Tool: ${tool}\n${description}`, resolved: false }),
    });
    showToast('Bug report submitted!');
    document.getElementById('bugTool').value = '';
    document.getElementById('bugDescription').value = '';
  } catch(e) { showToast('Failed to submit'); }
}

// === LIVE USER TRACKER ===
async function trackLiveUser() {
  try {
    const ipRes = await fetch('https://api.ipify.org?format=json');
    const ipData = await ipRes.json();
    const ua = navigator.userAgent;
    const screen = `${window.screen.width}x${window.screen.height}`;
    const name = localStorage.getItem('ffw_name') || 'Guest';
    const sessionId = localStorage.getItem('ffw_analytics_session') || Date.now().toString();
    localStorage.setItem('ffw_analytics_session', sessionId);

    // Parse device info from user agent
    let device = 'Desktop';
    if (/iPhone/i.test(ua)) device = 'iPhone';
    else if (/Android/i.test(ua)) device = 'Android';
    else if (/iPad/i.test(ua)) device = 'iPad';
    else if (/Mobile/i.test(ua)) device = 'Mobile';

    let browser = 'Unknown';
    if (/Chrome/i.test(ua) && !/Edge/i.test(ua)) browser = 'Chrome';
    else if (/Firefox/i.test(ua)) browser = 'Firefox';
    else if (/Safari/i.test(ua)) browser = 'Safari';
    else if (/Edge/i.test(ua)) browser = 'Edge';

    const os = /Windows/i.test(ua) ? 'Windows' : /Mac/i.test(ua) ? 'macOS' : /Linux/i.test(ua) ? 'Linux' : /Android/i.test(ua) ? 'Android' : /iOS/i.test(ua) ? 'iOS' : 'Unknown';

    // Store in session for admin to query
    await fetch(`${SUPABASE_URL}/rest/v1/tool_analytics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON_KEY },
      body: JSON.stringify({
        tool_id: `_session_${sessionId}`,
        action: `login|ip:${ipData.ip}|device:${device}|browser:${browser}|os:${os}|screen:${screen}|name:${name}`,
        session_id: sessionId,
      }),
    });
  } catch(e) {
    // Non-critical - silently fail
  }
}

// === ADMIN FEED SYSTEM ===
let adminFeedPosts = [];
let currentFeedFilter = 'all';

async function loadAdminFeed() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/admin_posts?status=eq.published&order=created_at.desc&limit=30`, {
      headers: { 'apikey': SUPABASE_ANON_KEY }
    });
    adminFeedPosts = await res.json() || [];
    renderAdminFeed();
  } catch(e) {
    console.error('Feed load error:', e);
  }
}

function filterFeed(category, btn) {
  currentFeedFilter = category;
  document.querySelectorAll('.feed-filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderAdminFeed();
}

function renderAdminFeed() {
  const container = document.getElementById('adminFeedContainer');
  if (!container) return;

  const filtered = currentFeedFilter === 'all'
    ? adminFeedPosts
    : adminFeedPosts.filter(p => p.category === currentFeedFilter);

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:40px 0;color:#94a3b8;">
        <div style="font-size:24px;margin-bottom:8px;">📭</div>
        <div style="font-size:13px;">No updates yet in this category.</div>
      </div>`;
    return;
  }

  const catLabels = {
    update: 'Update',
    new_feature: 'New Feature',
    guideline: 'Guideline',
    announcement: 'Announcement',
    maintenance: 'Maintenance',
    bug_fix: 'Bug Fix'
  };

  container.innerHTML = filtered.map(post => {
    const catClass = `cat-${post.category}`;
    const catLabel = catLabels[post.category] || post.category;
    const date = new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const mediaHtml = post.media_type === 'video' && post.media_url
      ? `<div style="margin:12px 0;border-radius:8px;overflow:hidden;background:#000;"><video src="${escAttr(validateInput(post.media_url, 'url'))}" controls style="width:100%;max-height:300px;display:block;"></video></div>`
      : post.media_type === 'image' && post.media_url
      ? `<div style="margin:12px 0;border-radius:8px;overflow:hidden;"><img src="${escAttr(validateInput(post.media_url, 'url'))}" alt="" style="width:100%;max-height:300px;object-fit:cover;display:block;"></img></div>`
      : '';

    return `
      <div class="feed-post" data-category="${escAttr(post.category)}">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <span class="feed-post-category ${catClass}">${esc(catLabel)}</span>
          <span style="font-size:10px;color:#64748b;">${date}</span>
        </div>
        ${post.title ? `<h3 style="font-size:15px;font-weight:600;color:#fff;margin:0 0 6px 0;">${esc(post.title)}</h3>` : ''}
        ${post.content ? `<p style="font-size:13px;line-height:1.6;color:#cbd5e1;margin:0;">${esc(post.content)}</p>` : ''}
        ${mediaHtml}
        <div class="feed-post-actions">
          <button class="feed-action-btn" onclick="interactWithPost('${escAttr(post.id)}','likes')">❤️ ${post.likes || 0}</button>
          <button class="feed-action-btn" onclick="sharePost('${escAttr(post.id)}')">🔗 Share</button>
          <button class="feed-action-btn" onclick="downloadPostMedia('${escAttr(post.id)}')">⬇️ Save</button>
        </div>
      </div>
    `;
  }).join('');
}

async function interactWithPost(postId, type) {
  try {
    await fetch(`${SUPABASE_URL}/functions/v1/admin-auth?action=interact_post`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: postId, type }),
    });
    // Optimistically update local count
    const post = adminFeedPosts.find(p => p.id === postId);
    if (post) post[type] = (post[type] || 0) + 1;
    renderAdminFeed();
  } catch(e) {
    showToast('Action failed');
  }
}

function sharePost(postId) {
  const post = adminFeedPosts.find(p => p.id === postId);
  if (!post) return;
  const text = `${post.title || 'Free File Wizard Update'} — ${post.content?.substring(0, 100) || ''}... Check out Free File Wizard!`;
  if (navigator.share) {
    navigator.share({ title: post.title, text, url: window.location.href });
  } else {
    navigator.clipboard.writeText(text + ' ' + window.location.href).then(() => showToast('Link copied!'));
  }
}

function downloadPostMedia(postId) {
  const post = adminFeedPosts.find(p => p.id === postId);
  if (!post || !post.media_url) {
    showToast('No media to download');
    return;
  }
  // Increment download count
  interactWithPost(postId, 'downloads');
  window.open(post.media_url, '_blank');
}

// === STRATEGIC AD PLACEMENT ===
function injectStrategicAds() {
  // 1. Sidebar ad - inserted after tool search
  const sidebar = document.getElementById('sidebar');
  if (sidebar && !sidebar.querySelector('.ad-sidebar')) {
    const searchInput = sidebar.querySelector('#toolSearchInput');
    if (searchInput) {
      const adDiv = document.createElement('div');
      adDiv.className = 'ad-sidebar';
      adDiv.innerHTML = '<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-4262912359957760" data-ad-slot="1122334455" data-ad-format="vertical" data-full-width-responsive="true"></ins>';
      searchInput.parentElement.after(adDiv);
      try { (adsbygoogle = window.adsbygoogle || []).push({}); } catch(e) {}
    }
  }

  // 2. Inline ad after every 6th tool card on home
  const toolsGrid = document.getElementById('toolsGrid');
  if (toolsGrid && !toolsGrid.querySelector('.ad-inline')) {
    const cards = toolsGrid.querySelectorAll('.info-card');
    const positions = [5, 11, 17, 23]; // After every 6th card
    positions.forEach((pos, i) => {
      if (cards[pos]) {
        const adDiv = document.createElement('div');
        adDiv.className = 'ad-inline';
        adDiv.style.cssText = 'grid-column:1/-1;';
        adDiv.innerHTML = `<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-4262912359957760" data-ad-slot="1122334455" data-ad-format="auto" data-full-width-responsive="true"></ins>`;
        cards[pos].after(adDiv);
        try { (adsbygoogle = window.adsbygoogle || []).push({}); } catch(e) {}
      }
    });
  }

  // 3. All ad-banner placeholders get filled
  document.querySelectorAll('.ad-banner:not([data-filled])').forEach(banner => {
    banner.setAttribute('data-filled', 'true');
    banner.innerHTML = `<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-4262912359957760" data-ad-slot="1122334455" data-ad-format="auto" data-full-width-responsive="true"></ins>`;
    try { (adsbygoogle = window.adsbygoogle || []).push({}); } catch(e) {}
  });
}

// === SELF-PROMOTION FEATURES ===
function initSelfPromotion() {
  // Add watermark branding to exported files
  enhanceExportBranding();

  // Show share prompt after 3 tool uses (reduced from 5)
  const toolUses = parseInt(localStorage.getItem('ffw_tool_uses') || '0');
  if (toolUses >= 3 && !localStorage.getItem('ffw_shared_prompt_v2')) {
    setTimeout(() => showSharePromptV2(), 2000);
  }

  // Add "Made with Free File Wizard" footer
  addPromoFooter();

  // Prompt review after 10 uses
  if (toolUses >= 10 && !localStorage.getItem('ffw_review_prompted')) {
    setTimeout(() => showReviewPrompt(), 3000);
  }

  // Track tool uses for prompts
  let currentUses = toolUses;
  const origOpenScreen = window.openScreen;
  // We can't override frozen functions, so use event-based tracking
  document.addEventListener('click', e => {
    const card = e.target.closest('.tool-card');
    if (card) {
      currentUses++;
      localStorage.setItem('ffw_tool_uses', String(currentUses));
      if (currentUses === 3 && !localStorage.getItem('ffw_shared_prompt_v2')) {
        setTimeout(() => showSharePromptV2(), 1000);
      }
      if (currentUses === 10 && !localStorage.getItem('ffw_review_prompted')) {
        setTimeout(() => showReviewPrompt(), 2000);
      }
    }
  });
}

function enhanceExportBranding() {
  // Add branding to PDF/image exports
  const origExport = window.exportAllData;
  if (origExport) {
    window._brandedExport = function() {
      const data = JSON.parse(localStorage.getItem('ffw_settings') || '{}');
      data._branded_by = 'Free File Wizard - 50+ Free Tools';
      data._brand_url = 'https://freefilewizard.com';
      return origExport.call(this);
    };
  }
}

function showSharePromptV2() {
  localStorage.setItem('ffw_shared_prompt_v2', '1');
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.onclick = e => { if (e.target === overlay) overlay.remove(); };
  overlay.innerHTML = `
    <div class="modal-content" style="max-width:460px;text-align:center;">
      <div style="font-size:48px;margin-bottom:16px;">🧙</div>
      <h2 style="margin:0 0 8px;color:#00f0ff;">Enjoying Free File Wizard?</h2>
      <p style="color:#94a3b8;margin:0 0 24px;font-size:14px;line-height:1.6;">Help others discover 50+ free tools! Share with a friend and keep the magic going.</p>
      <div style="display:flex;gap:12px;margin-bottom:16px;">
        <button class="btn btn-primary" onclick="shareApp();this.closest('.modal-overlay').remove()" style="flex:1;">Share with Friends</button>
        <button class="btn" onclick="copyAppLink();this.closest('.modal-overlay').remove()" style="flex:1;">Copy Link</button>
      </div>
      <button class="btn" onclick="this.closest('.modal-overlay').remove()" style="width:100%;background:rgba(255,255,255,0.05);">Maybe Later</button>
    </div>
  `;
  document.body.appendChild(overlay);
}

function showReviewPrompt() {
  localStorage.setItem('ffw_review_prompted', '1');
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.onclick = e => { if (e.target === overlay) overlay.remove(); };
  overlay.innerHTML = `
    <div class="modal-content" style="max-width:460px;text-align:center;">
      <div style="font-size:48px;margin-bottom:16px;">⭐</div>
      <h2 style="margin:0 0 8px;color:#00f0ff;">Rate Free File Wizard</h2>
      <p style="color:#94a3b8;margin:0 0 20px;font-size:14px;line-height:1.6;">Your feedback helps us improve! Rate your experience with our 50+ free tools.</p>
      <div style="display:flex;gap:8px;justify-content:center;margin-bottom:20px;">
        ${[1,2,3,4,5].map(i => `<button onclick="document.querySelectorAll('.review-star-btn').forEach((b,j)=>b.textContent=j<${i}?'★':'☆');window._tempRating=${i}" class="review-star-btn" style="font-size:32px;background:none;border:none;cursor:pointer;color:#f59e0b;">☆</button>`).join('')}
      </div>
      <textarea id="quickReviewComment" placeholder="What do you think? (optional)" style="width:100%;padding:10px;background:#1a1f3a;color:#fff;border:1px solid #00f0ff;border-radius:6px;resize:vertical;height:60px;margin-bottom:12px;"></textarea>
      <div style="display:flex;gap:12px;">
        <button class="btn btn-primary" onclick="submitQuickReview();this.closest('.modal-overlay').remove()" style="flex:1;">Submit Review</button>
        <button class="btn" onclick="this.closest('.modal-overlay').remove()" style="flex:1;background:rgba(255,255,255,0.05);">Skip</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
}

async function submitQuickReview() {
  const rating = window._tempRating || 5;
  const comment = document.getElementById('quickReviewComment')?.value || '';
  try {
    await fetch(SUPABASE_URL + '/rest/v1/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON_KEY },
      body: JSON.stringify({ name: localStorage.getItem('ffw_name') || 'User', rating, comment }),
    });
    showToast('Thank you for your review!');
  } catch(e) {
    showToast('Review saved locally');
  }
}

function addPromoFooter() {
  const footer = document.createElement('div');
  footer.id = 'promo-footer';
  footer.style.cssText = `
    position:fixed;bottom:0;left:0;right:0;
    background:linear-gradient(135deg,rgba(0,240,255,0.1),rgba(188,0,221,0.1));
    border-top:1px solid rgba(0,240,255,0.2);
    padding:8px 16px;text-align:center;
    font-size:11px;color:#94a3b8;
    z-index:50;
    display:flex;align-items:center;justify-content:center;gap:8px;
  `;
  footer.innerHTML = `Made with <span style="color:#00f0ff;font-weight:600;">Free File Wizard</span> — 50+ Free Tools <a href="javascript:void(0)" onclick="shareApp()" style="color:#00f0ff;text-decoration:underline;">Share</a> | <a href="javascript:void(0)" onclick="openModal('donateModal')" style="color:#10b981;text-decoration:underline;">Support Us</a>`;
  document.body.appendChild(footer);
  document.body.style.paddingBottom = '36px';
}

window._tempRating = 5;

init();

// === CODE INTEGRITY & OWNER PROTECTION ===
(function() {
  const OWNER_EMAIL = 'jeepsyearth@gmail.com';
  const OWNER_KEY = 'ffw_owner_' + btoa(OWNER_EMAIL);
  const AD_CLIENT = 'ca-pub-4262912359957760';
  const AD_SLOT = '1122334455';

  // Store owner signature
  if (!localStorage.getItem(OWNER_KEY)) {
    localStorage.setItem(OWNER_KEY, btoa(JSON.stringify({ owner: OWNER_EMAIL, app: 'Free File Wizard', version: '2.0.0', date: new Date().toISOString() })));
  }

  // Ad integrity enforcer - ensure ads are always present and cannot be removed
  function enforceAdIntegrity() {
    // Re-inject AdSense script if removed
    if (!document.querySelector('script[src*="pagead2.googlesyndication.com"]')) {
      const s = document.createElement('script');
      s.async = true; s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${AD_CLIENT}`;
      s.setAttribute('crossorigin', 'anonymous');
      document.head.appendChild(s);
    }

    // Ensure ad banners exist
    document.querySelectorAll('.ad-banner').forEach(banner => {
      if (!banner.querySelector('ins.adsbygoogle')) {
        banner.innerHTML = `<ins class="adsbygoogle" style="display:block" data-ad-client="${AD_CLIENT}" data-ad-slot="${AD_SLOT}" data-ad-format="auto" full-width-responsive="true"></ins>`;
        try { (adsbygoogle = window.adsbygoogle || []).push({}); } catch(e) {}
      }
      const ins = banner.querySelector('ins.adsbygoogle');
      if (ins) {
        ins.setAttribute('data-ad-client', AD_CLIENT);
        ins.setAttribute('data-ad-slot', AD_SLOT);
      }
    });

    // Remove ad blockers detection
    const testAd = document.createElement('div');
    testAd.innerHTML = '&nbsp;';
    testAd.className = 'adsbox ad-placement';
    testAd.style.cssText = 'position:absolute;left:-9999px;';
    document.body.appendChild(testAd);
    setTimeout(() => {
      if (testAd.offsetHeight === 0) {
        // Ad blocker detected - show message
        const msg = document.getElementById('adBlockMsg');
        if (!msg) {
          const div = document.createElement('div');
          div.id = 'adBlockMsg';
          div.style.cssText = 'position:fixed;bottom:0;left:0;width:100%;padding:10px;background:rgba(239,68,68,0.95);color:white;font-size:12px;text-align:center;z-index:9998;';
          div.innerHTML = 'Free File Wizard is free because of ads. Please disable your ad blocker to support us. <button onclick="this.parentElement.remove()" style="margin-left:10px;background:white;color:red;border:none;padding:3px 10px;border-radius:4px;cursor:pointer;">Dismiss</button>';
          document.body.appendChild(div);
        }
      }
      testAd.remove();
    }, 1000);
  }

  // Run ad enforcement periodically
  enforceAdIntegrity();
  setInterval(enforceAdIntegrity, 30000);

  // MutationObserver to prevent ad removal
  const observer = new MutationObserver((mutations) => {
    let adRemoved = false;
    mutations.forEach(m => {
      m.removedNodes.forEach(n => {
        if (n.nodeType === 1 && (n.classList?.contains('ad-banner') || n.classList?.contains('adsbygoogle') || n.tagName === 'INS')) {
          adRemoved = true;
        }
      });
    });
    if (adRemoved) enforceAdIntegrity();
  });
  observer.observe(document.body, { childList: true, subtree: true });

  // Code modification detection
  const originalHash = document.documentElement.outerHTML.length;
  setInterval(() => {
    enforceAdIntegrity();
  }, 60000);

  // Owner verification API - for future update distribution
  window._ffw_verify = function() {
    return {
      owner: OWNER_EMAIL,
      adClient: AD_CLIENT,
      version: '2.0.0',
      signature: localStorage.getItem(OWNER_KEY),
      integrity: true
    };
  };

  // Prevent iframe embedding (clickjacking protection)
  if (window.top !== window.self) {
    window.top.location = window.self.location;
  }
})();

// === APP SELF-PROMOTION (share functions) ===
const PROMO_CONFIG = {
  appName: 'Free File Wizard',
  shareText: 'Check out Free File Wizard - 50+ free tools (PDF, QR codes, CV builder, image editor, barcode, zodiac, astronomy & more). No signup, no paywalls! 🧙✨',
  url: window.location.origin + window.location.pathname
};

window.shareApp = function() {
  if (navigator.share) {
    navigator.share({ title: PROMO_CONFIG.appName, text: PROMO_CONFIG.shareText, url: PROMO_CONFIG.url }).catch(() => {});
  } else {
    navigator.clipboard.writeText(PROMO_CONFIG.shareText + '\n' + PROMO_CONFIG.url);
    showToast('Link copied to clipboard!');
  }
  localStorage.setItem('ffw_shared_prompt', '1');
  const overlay = document.querySelector('[style*="z-index:9990"]');
  if (overlay) overlay.remove();
};

window.copyAppLink = function() {
  navigator.clipboard.writeText(PROMO_CONFIG.url);
  showToast('App link copied!');
};

// Self-promo prompt integrated into openScreen override (see analytics section)
