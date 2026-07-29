const fs = require('fs');
const path = require('path');
const dir = 'C:\\Users\\DESMOND\\.gemini\\antigravity\\scratch\\algae-planner';

// 1. Update index.html
let html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');

html = html.replace(/<body>/, `<body>
  <div class="ocean-bg"><div class="caustics"></div></div>

  <!-- Pill Navbar -->
  <nav class="pill-navbar glass">
    <div class="nav-left">
      <div class="logo">
        <span class="logo-icon">🧬</span>
        <span class="logo-text">AlgaePlanner</span>
      </div>
    </div>
    <div class="nav-links">
      <a class="nav-item active" data-page="dashboard" id="nav-dashboard"><span class="nav-text" data-i18n="nav.dashboard">儀表板</span></a>
      <a class="nav-item" data-page="calendar" id="nav-calendar"><span class="nav-text" data-i18n="nav.calendar">培養日曆</span></a>
      <a class="nav-item" data-page="species" id="nav-species"><span class="nav-text" data-i18n="nav.species">藻種管理</span></a>
      <a class="nav-item" data-page="inventory" id="nav-inventory"><span class="nav-text" data-i18n="nav.inventory">器材庫存</span></a>
      <a class="nav-item" data-page="demand" id="nav-demand"><span class="nav-text" data-i18n="nav.demand">養殖場需求</span><span id="demand-badge" class="nav-badge hidden">0</span></a>
      <a class="nav-item" data-page="walne" id="nav-walne"><span class="nav-text" data-i18n="nav.walne">培養基計算</span></a>
      <a class="nav-item" data-page="log" id="nav-log"><span class="nav-text" data-i18n="nav.log">培養日誌</span></a>
      <a class="nav-item" data-page="copepods" id="nav-copepods"><span class="nav-text" data-i18n="nav.copepods">橈足類</span></a>
      <a class="nav-item" data-page="settings" id="nav-settings"><span class="nav-text" data-i18n="nav.settings">設定</span></a>
    </div>
    <div class="nav-right">
      <select id="workspace-select" class="form-select nav-select"></select>
      <button id="btn-new-workspace" class="btn-sm btn-outline">+ WS</button>
      <button id="lang-toggle" class="btn-icon" title="Switch Language">
        <span id="lang-label">EN</span>
      </button>
      <div class="today-badge" id="today-badge">
        <span class="today-pulse"></span>
        <span id="today-date"></span>
      </div>
      <button id="btn-export" class="btn-icon" title="Export">💾</button>
      <button id="btn-import" class="btn-icon" title="Import">📂</button>
    </div>
  </nav>`);

html = html.replace(/<!-- ===== Sidebar ===== -->[\s\S]*?<\/aside>/, '');
html = html.replace(/<header class="main-header">[\s\S]*?<\/header>/, '<div class="page-header-title"><h1 id="page-title" class="page-title" data-i18n="nav.dashboard">儀表板</h1></div>');

html = html.replace(/<div id="copepods-logs" class="log-entries"><\/div>/, `<div id="copepods-calendar" class="calendar-wrapper" style="margin-bottom:2rem;"><div id="copepods-cal-grid" class="calendar-grid"></div></div>
      <div id="copepods-logs" class="log-entries"></div>`);

fs.writeFileSync(path.join(dir, 'index.html'), html);

// 2. Update styles.css
let css = fs.readFileSync(path.join(dir, 'styles.css'), 'utf8');
css = css.replace(/@import url[^;]+;/, `@import url('https://fonts.googleapis.com/css2?family=Barlow:wght@300;400;500;600;700&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500;600&display=swap');`);

css = css.replace(/:root\s*\{[\s\S]*?\}/, `:root {
  --primary: #0ea5e9;
  --primary-hover: #38bdf8;
  --danger: #ef4444;
  --warning: #f59e0b;
  --success: #10b981;
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
  --border-light: rgba(255, 255, 255, 0.15);
  --glass-bg: rgba(255, 255, 255, 0.05);
  --glass-hover: rgba(255, 255, 255, 0.1);
  --bg-page: #000;
  --shadow-soft: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
  --shadow-hover: 0 8px 32px 0 rgba(0, 0, 0, 0.5);
  --inner-glow: inset 0 1px 1px rgba(255, 255, 255, 0.1);
  
  --color-inoculate: #38bdf8;
  --color-sterilize: #fb923c;
  --color-harvest: #34d399;
  --color-scaleup: #a78bfa;
  --color-rest: #94a3b8;
}`);

css = css.replace(/body\s*\{[\s\S]*?\}/, `body {
  font-family: 'Barlow', system-ui, -apple-system, sans-serif;
  background: var(--bg-page);
  color: var(--text-main);
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  position: relative;
}

/* Background */
.ocean-bg {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: -1;
  background: radial-gradient(circle at 50% 100%, #061f36, #000000 60%);
  overflow: hidden;
}

.caustics {
  position: absolute;
  top: -50%; left: -50%; right: -50%; bottom: -50%;
  background: url('data:image/svg+xml;utf8,%3Csvg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noiseFilter"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="3" stitchTiles="stitch"/%3E%3C/filter%3E%3Crect width="100%25" height="100%25" filter="url(%23noiseFilter)"/%3E%3C/svg%3E');
  opacity: 0.1;
  mix-blend-mode: color-dodge;
  animation: wave 20s linear infinite alternate;
  pointer-events: none;
}

@keyframes wave {
  0% { transform: scale(1) translate(0, 0); }
  100% { transform: scale(1.1) translate(2%, 2%); }
}

h1, h2, h3, h4, h5, h6, .page-title, .section-title, .logo-text, .sp-code {
  font-family: 'Instrument Serif', serif;
  font-style: italic;
  font-weight: 400;
  letter-spacing: 0.5px;
}
`);

css = css.replace(/\.glass\s*\{[\s\S]*?\}/, `.glass {
  background: var(--glass-bg);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid var(--border-light);
  box-shadow: var(--shadow-soft), var(--inner-glow);
  border-radius: 16px;
  color: var(--text-main);
}`);

css += `
.pill-navbar {
  position: fixed;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 24px;
  border-radius: 50px;
  width: 95%;
  max-width: 1400px;
  z-index: 1000;
}
.nav-left .logo {
  font-size: 20px; font-weight: 800; display: flex; align-items: center; gap: 8px;
}
.nav-links {
  display: flex; gap: 4px;
}
.nav-item {
  padding: 8px 16px; border-radius: 20px; font-weight: 600; cursor: pointer; transition: 0.2s; color: var(--text-muted); text-decoration: none; display: flex; align-items: center; gap: 6px;
}
.nav-item:hover, .nav-item.active {
  background: var(--glass-hover); color: #fff;
}
.nav-right {
  display: flex; align-items: center; gap: 12px;
}
.nav-select {
  padding: 6px 12px; border-radius: 12px; height: 36px; min-width: 120px;
}
.page-header-title {
  padding: 24px 32px 0 32px;
}
.main-content {
  margin-top: 90px;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
`;

css = css.replace(/background:\s*var\(--glass-bg\);/g, 'background: var(--glass-bg); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); box-shadow: var(--shadow-soft), var(--inner-glow);');
css = css.replace(/background:\s*var\(--bg-page\);/g, 'background: rgba(0,0,0,0.3); backdrop-filter: blur(12px); box-shadow: inset 0 0 10px rgba(0,0,0,0.5);');

fs.writeFileSync(path.join(dir, 'styles.css'), css);

// 3. Update app.js
let js = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');

js = js.replace(/const renderCopepods = \\(\\) => \\{/, `const renderCopepods = () => {
    // Render copepod calendar first
    const calGrid = document.getElementById('copepods-cal-grid');
    if (calGrid) {
      calGrid.innerHTML = '';
      const today = new Date();
      const pastLogs = AP.state.logs.filter(l => l.copepodId != null);
      
      const weekdays = TRANSLATIONS[AP.state.lang].weekdays;
      weekdays.forEach(wd => {
        calGrid.innerHTML += \\\`<div class="cal-header-cell">\\\${wd}</div>\\\`;
      });
      
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      const startIdx = (firstDay.getDay() + 6) % 7;
      const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
      
      for(let i=0; i<startIdx; i++) calGrid.innerHTML += '<div class="cal-cell other-month"></div>';
      
      for(let d=1; d<=daysInMonth; d++) {
        const dStr = \\\`\\\${today.getFullYear()}-\\\${String(today.getMonth()+1).padStart(2,'0')}-\\\${String(d).padStart(2,'0')}\\\`;
        const dayLogs = pastLogs.filter(l => l.date === dStr);
        let pillsHtml = '';
        dayLogs.forEach(log => {
          let badgeColor = log.status === 'normal' ? 'var(--success)' : (log.status === 'warning' ? 'var(--warning)' : 'var(--danger)');
          pillsHtml += \\\`<div class="cal-task-pill" style="background:\\\${badgeColor}; color:#000;">\\\${log.type === 'feed' ? '🍲 Feed' : (log.type === 'water' ? '💧 Water' : (log.type === 'observe' ? '👁️ Obs' : '📋 Log'))}</div>\\\`;
        });
        
        let classes = 'cal-cell' + (dStr === todayISO() ? ' today' : '');
        calGrid.innerHTML += \\\`<div class="\\\${classes}">
          <div class="cal-date">\\\${d}</div>
          <div class="cal-tasks">\\\${pillsHtml}</div>
        </div>\\\`;
      }
      
      const totalCells = startIdx + daysInMonth;
      const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
      for(let i=0; i<remaining; i++) calGrid.innerHTML += '<div class="cal-cell other-month"></div>';
    }
`);

fs.writeFileSync(path.join(dir, 'app.js'), js);
console.log('Update script completed successfully!');
