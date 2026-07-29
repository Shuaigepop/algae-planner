// =========================================================================
// AlgaePlanner — Complete Application Logic
// Algae Stock Culture Maintenance Planning & Calendar System
// Uses Walne Medium + Trace Elements (based on Walne 1970, FAO No.361)
// =========================================================================

window.AP = {};

(function (AP) {
  'use strict';
  
  AP.activeWorkspace = localStorage.getItem('ap-active-workspace') || 'default';
  
  const loadWorkspaces = () => {
    try { 
      const v = localStorage.getItem('ap-workspaces'); 
      if (v) return JSON.parse(v);
    } catch {}
    return [{id: 'default', name: 'Default Workspace'}];
  };
  AP.workspaces = loadWorkspaces();

  // ── DEFAULT DATA ──────────────────────────────────────────────────────
  const DEFAULT_SPECIES = [
    { id: 'iso', code: 'Iso', icon: '🟡', nameZh: '等鞭金藻', nameEn: 'Isochrysis galbana', scientificName: 'Isochrysis galbana (T-Iso)', subcultureInterval: 6, inoculumRatio: 0.1, medium: 'walne', needsSilicate: false, color: '#f59e0b', flasksPerSubculture: 1, notes: '' },
    { id: 'au5', code: 'Au5', icon: '🟢', nameZh: '藻桶20L (花寶)', nameEn: 'Au5 Bucket 20L (Huabao)', scientificName: 'Algae Bucket Culture', subcultureInterval: 7, inoculumRatio: 0.1, medium: 'huabao', needsSilicate: false, color: '#84cc16', flasksPerSubculture: 0, notes: '花寶培養基，用於餵食橈足類' },
    { id: 'nanno', code: 'Nanno', icon: '🟩', nameZh: '微擬球藻', nameEn: 'Nannochloropsis oculata', scientificName: 'Nannochloropsis oculata', subcultureInterval: 8, inoculumRatio: 0.1, medium: 'walne', needsSilicate: false, color: '#10b981', flasksPerSubculture: 1, notes: '' },
    { id: 'tetra', code: 'Tetra', icon: '🔵', nameZh: '扁藻', nameEn: 'Tetraselmis suecica', scientificName: 'Tetraselmis suecica', subcultureInterval: 7, inoculumRatio: 0.1, medium: 'walne', needsSilicate: false, color: '#06b6d4', flasksPerSubculture: 1, notes: '' },
    { id: 'pro', code: 'Pro', icon: '🟣', nameZh: '舟形藻', nameEn: 'Proschkinia', scientificName: 'Proschkinia sp.', subcultureInterval: 4, inoculumRatio: 0.15, medium: 'walne', needsSilicate: true, color: '#8b5cf6', flasksPerSubculture: 1, notes: '需要矽酸鹽 (Stock D)' },
    { id: 'chaeto', code: 'Chaeto', icon: '🩷', nameZh: '角毛藻', nameEn: 'Chaetoceros calcitrans', scientificName: 'Chaetoceros calcitrans', subcultureInterval: 4, inoculumRatio: 0.15, medium: 'walne', needsSilicate: true, color: '#ec4899', flasksPerSubculture: 1, notes: '需要矽酸鹽 (Stock D)' }
  ];

  const DEFAULT_CONTAINERS = [
    { id: 'flask_2000', nameZh: '2000mL 錐形瓶', nameEn: '2000mL Erlenmeyer Flask', icon: '🧪', total: 50, inUse: 0 },
    { id: 'bucket_20', nameZh: '20L 藻桶', nameEn: '20L Carboy', icon: '🪣', total: 5, inUse: 0 }
  ];

  // ── I18N TRANSLATIONS ─────────────────────────────────────────────────
  const TRANSLATIONS = {
    zh: {
      appName: 'AlgaePlanner', appSubtitle: '藻類培養計劃系統',
      'nav.dashboard': '儀表板', 'nav.calendar': '培養日曆', 'nav.species': '藻種管理',
      'nav.inventory': '器材庫存', 'nav.demand': '養殖場需求', 'nav.walne': '培養基計算', 'nav.log': '培養日誌',
      'dashboard.totalSpecies': '管理藻種', 'dashboard.availableFlasks': '可用錐形瓶',
      'dashboard.pendingDemands': '待處理需求', 'dashboard.nextRestDay': '下次休息',
      'dashboard.todayTasks': '今日任務', 'dashboard.noTasks': '今日無任務，好好休息！🎉',
      'dashboard.upcoming': '未來 7 天', 'dashboard.speciesStatus': '藻種倒數',
      'task.inoculate': '接種', 'task.sterilize': '滅菌', 'task.harvest': '出貨',
      'task.scaleup': '放大', 'task.rest': '休息日',
      'calendar.today': '今天', 'calendar.generate': '生成排程',
      'calendar.addTask': '＋ 新增任務', 'calendar.markComplete': '✓ 全部完成',
      'species.add': '新增藻種', 'species.edit': '編輯藻種', 'species.code': '代號',
      'species.name': '名稱', 'species.scientific': '學名',
      'species.interval': '保種週期 (天)', 'species.ratio': '接種比例',
      'species.medium': '培養基', 'species.silicate': '需要矽酸鹽',
      'species.flasks': '每次用瓶數', 'species.color': '顏色',
      'species.lastSubculture': '上次接種', 'species.nextDue': '下次接種',
      'species.daysLeft': '天後', 'species.dueToday': '今天到期！', 'species.overdue': '已逾期！',
      'inventory.addType': '新增容器類型', 'inventory.statusOverview': '使用概覽',
      'inventory.name': '名稱', 'inventory.total': '總數', 'inventory.inUse': '使用中', 'inventory.available': '可用',
      'inventory.edit': '編輯數量',
      'demand.add': '新增需求', 'demand.pending': '待處理', 'demand.scheduled': '已排程',
      'demand.fulfilled': '已完成', 'demand.species': '藻種', 'demand.volume': '數量',
      'demand.dueDate': '交貨日期', 'demand.notes': '備註',
      'demand.fulfill': '標記完成', 'demand.cancel': '取消',
      'walne.inputTitle': '計算培養基用量', 'walne.totalVolume': '培養總體積 (L)',
      'walne.mediumType': '培養基類型', 'walne.usage': '每升海水添加量',
      'walne.nutrient': '營養液', 'walne.trace': '微量元素', 'walne.vitamin': '維生素',
      'walne.silicate': '矽酸鹽', 'walne.reference': '文獻參考',
      'walne.chemical': '化學品', 'walne.formula': '化學式', 'walne.amount': '用量',
      'log.add': '新增日誌', 'log.allSpecies': '所有藻種', 'log.allTypes': '所有類型',
      'log.normal': '正常', 'log.warning': '異常', 'log.contaminated': '污染',
      'common.cancel': '取消', 'common.confirm': '確認', 'common.delete': '刪除',
      'common.edit': '編輯', 'common.save': '儲存', 'common.export': '匯出', 'common.import': '匯入',
      'common.days': '天', 'common.noData': '尚無資料',
      'msg.exportSuccess': '資料匯出成功！', 'msg.importSuccess': '資料匯入成功！',
      'msg.scheduleGenerated': '排程已生成！', 'msg.taskCompleted': '任務已完成！',
      'msg.confirmDelete': '確定要刪除嗎？',
      'nav.copepods': '橈足類', 'nav.settings': '設定',
      'copepods.add': '新增批次', 'copepods.logs': '日誌記錄', 'copepods.addLog': '新增日誌',
      'settings.scheduler': '排程器設定', 'settings.horizon': '規劃天數 (Days)',
      'settings.maxDailyHours': '每日最大工時 (Mins)', 'settings.flexAdvance': '最大提前天數',
      'settings.flexDelay': '最大延遲天數', 'settings.sterilizerCap': '滅菌鍋容量 (瓶)',
      'settings.sterilizerTime': '單次滅菌時間 (Mins)', 'settings.uvTime': '紫外燈照射時間 (Mins)',
      'settings.cleaningTime': '清潔時間 (Mins)', 'settings.inocTime': '單瓶接種時間 (Mins)',
      weekdays: ['一', '二', '三', '四', '五', '六', '日'],
      weekdaysFull: ['週一', '週二', '週三', '週四', '週五', '週六', '週日'],
      months: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
    },
    en: {
      appName: 'AlgaePlanner', appSubtitle: 'Algae Culture Planning System',
      'nav.dashboard': 'Dashboard', 'nav.calendar': 'Culture Calendar', 'nav.species': 'Species',
      'nav.inventory': 'Inventory', 'nav.demand': 'Farm Demand', 'nav.walne': 'Walne Calculator', 'nav.log': 'Culture Log',
      'dashboard.totalSpecies': 'Species', 'dashboard.availableFlasks': 'Available Flasks',
      'dashboard.pendingDemands': 'Pending Demands', 'dashboard.nextRestDay': 'Next Rest Day',
      'dashboard.todayTasks': "Today's Tasks", 'dashboard.noTasks': 'No tasks today. Enjoy your rest! 🎉',
      'dashboard.upcoming': 'Next 7 Days', 'dashboard.speciesStatus': 'Species Countdown',
      'task.inoculate': 'Inoculate', 'task.sterilize': 'Sterilize', 'task.harvest': 'Harvest',
      'task.scaleup': 'Scale Up', 'task.rest': 'Rest Day',
      'calendar.today': 'Today', 'calendar.generate': 'Generate Schedule',
      'calendar.addTask': '+ Add Task', 'calendar.markComplete': '✓ Complete All',
      'species.add': 'Add Species', 'species.edit': 'Edit Species', 'species.code': 'Code',
      'species.name': 'Name', 'species.scientific': 'Scientific Name',
      'species.interval': 'Subculture Interval (days)', 'species.ratio': 'Inoculum Ratio',
      'species.medium': 'Medium', 'species.silicate': 'Needs Silicate',
      'species.flasks': 'Flasks Per Subculture', 'species.color': 'Color',
      'species.lastSubculture': 'Last Subculture', 'species.nextDue': 'Next Due',
      'species.daysLeft': 'days left', 'species.dueToday': 'Due today!', 'species.overdue': 'Overdue!',
      'inventory.addType': 'Add Container Type', 'inventory.statusOverview': 'Status Overview',
      'inventory.name': 'Name', 'inventory.total': 'Total', 'inventory.inUse': 'In Use', 'inventory.available': 'Available',
      'inventory.edit': 'Edit Quantities',
      'demand.add': 'Add Demand', 'demand.pending': 'Pending', 'demand.scheduled': 'Scheduled',
      'demand.fulfilled': 'Fulfilled', 'demand.species': 'Species', 'demand.volume': 'Volume',
      'demand.dueDate': 'Due Date', 'demand.notes': 'Notes',
      'demand.fulfill': 'Mark Fulfilled', 'demand.cancel': 'Cancel',
      'walne.inputTitle': 'Calculate Medium Requirements', 'walne.totalVolume': 'Total Culture Volume (L)',
      'walne.mediumType': 'Medium Type', 'walne.usage': 'Addition per Liter Seawater',
      'walne.nutrient': 'Nutrient Solution', 'walne.trace': 'Trace Metals', 'walne.vitamin': 'Vitamins',
      'walne.silicate': 'Silicate', 'walne.reference': 'Literature References',
      'walne.chemical': 'Chemical', 'walne.formula': 'Formula', 'walne.amount': 'Amount',
      'log.add': 'Add Entry', 'log.allSpecies': 'All Species', 'log.allTypes': 'All Types',
      'log.normal': 'Normal', 'log.warning': 'Warning', 'log.contaminated': 'Contaminated',
      'common.cancel': 'Cancel', 'common.confirm': 'Confirm', 'common.delete': 'Delete',
      'common.edit': 'Edit', 'common.save': 'Save', 'common.export': 'Export', 'common.import': 'Import',
      'common.days': 'days', 'common.noData': 'No data yet',
      'msg.exportSuccess': 'Data exported successfully!', 'msg.importSuccess': 'Data imported successfully!',
      'msg.scheduleGenerated': 'Schedule generated!', 'msg.taskCompleted': 'Task completed!',
      'msg.confirmDelete': 'Are you sure you want to delete?',
      'nav.copepods': 'Copepods', 'nav.settings': 'Settings',
      'copepods.add': 'Add Batch', 'copepods.logs': 'Logs', 'copepods.addLog': 'Add Log',
      'settings.scheduler': 'Scheduler Settings', 'settings.horizon': 'Planning Horizon (Days)',
      'settings.maxDailyHours': 'Max Daily Hours (Mins)', 'settings.flexAdvance': 'Max Advance Days',
      'settings.flexDelay': 'Max Delay Days', 'settings.sterilizerCap': 'Sterilizer Capacity (Flasks)',
      'settings.sterilizerTime': 'Sterilization Time (Mins)', 'settings.uvTime': 'UV Time (Mins)',
      'settings.cleaningTime': 'Cleaning Time (Mins)', 'settings.inocTime': 'Inoculation Time per Flask (Mins)',
      weekdays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      weekdaysFull: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    }
  };

  // ── APP STATE ─────────────────────────────────────────────────────────
  AP.state = {
    lang: 'zh',
    species: [],
    containers: [],
    tasks: [],
    demands: [],
    logs: [],
    subDates: {},
    copepods: [],
    demandTab: 'pending',
    calDate: new Date(),
    selectedDate: null,
    settings: {
      scheduleHorizon: 14, flexAdvance: 2, flexDelay: 1, sterilizerCapacity: 6,
      sterilizationTime: 180, uvTime: 20, inoculationTimePerFlask: 8, cleaningTime: 10, maxDailyHours: 480
    }
  };

  // ── IDB ───────────────────────────────────────────────────────────────
  AP.db = {
    db: null,
    init() {
      return new Promise((resolve, reject) => {
        const req = indexedDB.open('AlgaePlannerDB', 1);
        req.onupgradeneeded = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains('photos')) {
            db.createObjectStore('photos', { keyPath: 'id' });
          }
        };
        req.onsuccess = (e) => { this.db = e.target.result; resolve(); };
        req.onerror = (e) => reject(e.target.error);
      });
    },
    savePhoto(id, dataUrl) {
      return new Promise((resolve) => {
        const tx = this.db.transaction('photos', 'readwrite');
        tx.objectStore('photos').put({ id, dataUrl });
        tx.oncomplete = () => resolve();
      });
    },
    getPhoto(id) {
      return new Promise((resolve) => {
        const tx = this.db.transaction('photos', 'readonly');
        const req = tx.objectStore('photos').get(id);
        req.onsuccess = () => resolve(req.result ? req.result.dataUrl : null);
      });
    }
  };

  // ── UTILITIES ─────────────────────────────────────────────────────────
  const uid = () => Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

  const todayISO = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const nowTime = () => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  const addDays = (dateStr, n) => {
    const d = new Date(dateStr + 'T00:00:00');
    d.setDate(d.getDate() + n);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const diffDays = (d1, d2) => Math.round((new Date(d2 + 'T00:00:00') - new Date(d1 + 'T00:00:00')) / 86400000);

  const t = (key) => TRANSLATIONS[AP.state.lang]?.[key] || key;

  const spName = (sp) => sp ? (AP.state.lang === 'zh' ? sp.nameZh : sp.nameEn) : '';

  const formatDate = (ds) => {
    if (!ds) return '—';
    const d = new Date(ds + 'T00:00:00');
    const dow = (d.getDay() + 6) % 7;
    if (AP.state.lang === 'zh') {
      return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${TRANSLATIONS.zh.weekdaysFull[dow]}`;
    }
    return `${TRANSLATIONS.en.weekdays[dow]}, ${TRANSLATIONS.en.months[d.getMonth()].substring(0, 3)} ${d.getDate()}, ${d.getFullYear()}`;
  };

  const shortDate = (ds) => {
    if (!ds) return '—';
    const d = new Date(ds + 'T00:00:00');
    if (AP.state.lang === 'zh') return `${d.getMonth() + 1}/${d.getDate()}`;
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  // ── STORAGE ───────────────────────────────────────────────────────────
  const load = (key, def) => { 
    if (key !== 'ap-workspaces') key = AP.activeWorkspace + '_' + key;
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : def; } catch { return def; } 
  };
  const save = (key, data) => { 
    if (key !== 'ap-workspaces') key = AP.activeWorkspace + '_' + key;
    localStorage.setItem(key, JSON.stringify(data)); 
  };

  const loadAll = () => {
    AP.state.lang = localStorage.getItem('ap-lang') || 'zh';
    AP.state.settings = load('ap-settings', {
      scheduleHorizon: 14, flexAdvance: 2, flexDelay: 1, sterilizerCapacity: 6,
      sterilizationTime: 180, uvTime: 20, inoculationTimePerFlask: 8, cleaningTime: 10, maxDailyHours: 480
    });
    AP.state.species = load('ap-species', JSON.parse(JSON.stringify(DEFAULT_SPECIES)));
    
    // Migration for Proschkinia interval correction
    const proSp = AP.state.species.find(s => s.id === 'pro');
    if (proSp && proSp.subcultureInterval === 10) {
      proSp.subcultureInterval = 4;
      proSp.needsSilicate = true;
      proSp.notes = '需要矽酸鹽 (Stock D)';
      save('ap-species', AP.state.species);
    }

    AP.state.containers = load('ap-containers', JSON.parse(JSON.stringify(DEFAULT_CONTAINERS)));
    AP.state.tasks = load('ap-tasks', []);
    AP.state.demands = load('ap-demands', []);
    AP.state.logs = load('ap-logs', []);
    AP.state.copepods = load('ap-copepods', []);
    AP.state.subDates = load('ap-subculture-dates', {});
    if (Object.keys(AP.state.subDates).length === 0) {
      const td = todayISO();
      AP.state.species.forEach(s => { if (s.id !== 'au5') AP.state.subDates[s.id] = td; });
      save('ap-subculture-dates', AP.state.subDates);
    }
  };

  const saveAll = () => {
    save('ap-species', AP.state.species);
    save('ap-containers', AP.state.containers);
    save('ap-tasks', AP.state.tasks);
    save('ap-demands', AP.state.demands);
    save('ap-logs', AP.state.logs);
    save('ap-copepods', AP.state.copepods);
    save('ap-subculture-dates', AP.state.subDates);
  };

  // ── TOAST ─────────────────────────────────────────────────────────────
  AP.showToast = (msg, type = 'info') => {
    const c = document.getElementById('toast-container');
    if (!c) return;
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.innerHTML = `<span>${type === 'success' ? '✓' : type === 'error' ? '✗' : type === 'warning' ? '⚠' : 'ℹ'}</span> ${msg}`;
    c.appendChild(el);
    setTimeout(() => el.remove(), 4000);
  };

  // ── MODAL ─────────────────────────────────────────────────────────────
  let _modalCb = null;

  AP.openModal = (title, html, onConfirm) => {
    const ov = document.getElementById('modal-overlay');
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = html;
    const btn = document.getElementById('modal-confirm');
    btn.style.display = onConfirm ? '' : 'none';
    _modalCb = onConfirm || null;
    ov.classList.remove('hidden');
    requestAnimationFrame(() => ov.classList.add('visible'));
  };

  AP.closeModal = () => {
    const ov = document.getElementById('modal-overlay');
    ov.classList.remove('visible');
    setTimeout(() => ov.classList.add('hidden'), 300);
    _modalCb = null;
  };

  // ── NAVIGATION ────────────────────────────────────────────────────────
  AP.navigateTo = (pageId) => {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const page = document.getElementById(`page-${pageId}`);
    if (page) page.classList.add('active');
    const nav = document.querySelector(`.nav-item[data-page="${pageId}"]`);
    if (nav) nav.classList.add('active');
    document.getElementById('page-title').textContent = t(`nav.${pageId}`);
    document.getElementById('page-title').setAttribute('data-i18n', `nav.${pageId}`);
    document.getElementById('sidebar')?.classList.remove('open');
    renderPage(pageId);
  };

  // ── ROUTING ──────────────────────────────────────────────────────────
  const renderPage = (pid) => {
    const renderers = { dashboard: renderDashboard, calendar: renderCalendar, species: renderSpecies, inventory: renderInventory, demand: renderDemand, walne: renderWalne, log: renderLog, copepods: renderCopepods, settings: renderSettings };
    if (renderers[pid]) renderers[pid]();
  };

  // ── I18N ──────────────────────────────────────────────────────────────
  const applyI18n = () => {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const val = t(key);
      if (val !== key) el.textContent = val;
    });
    document.getElementById('lang-label').textContent = AP.state.lang === 'zh' ? '中文' : 'EN';
    document.getElementById('today-date').textContent = formatDate(todayISO());
    const ap = document.querySelector('.page.active');
    if (ap) renderPage(ap.id.replace('page-', ''));
  };

  // ── WORKSPACES ────────────────────────────────────────────────────────
  const renderWorkspaces = () => {
    const sel = document.getElementById('workspace-select');
    if (!sel) return;
    sel.innerHTML = AP.workspaces.map(w => `<option value="${w.id}" ${w.id === AP.activeWorkspace ? 'selected' : ''}>${w.name}</option>`).join('');
  };

  const switchWorkspace = (id) => {
    if (id === AP.activeWorkspace) return;
    AP.activeWorkspace = id;
    localStorage.setItem('ap-active-workspace', id);
    loadAll();
    const ap = document.querySelector('.page.active');
    if (ap) renderPage(ap.id.replace('page-', ''));
    AP.showToast('Workspace switched', 'success');
  };

  const createNewWorkspace = () => {
    const name = prompt('Enter new workspace name:');
    if (!name) return;
    const newId = 'ws_' + Date.now();
    AP.workspaces.push({id: newId, name});
    localStorage.setItem('ap-workspaces', JSON.stringify(AP.workspaces));
    renderWorkspaces();
    switchWorkspace(newId);
  };

  // ── SCHEDULING ENGINE ────────────────────────────────────────────────
  const generateSchedule = () => {
    const today = todayISO();
    const settings = AP.state.settings;
    const horizon = addDays(today, settings.scheduleHorizon);

    // Remove future auto-generated uncompleted tasks
    AP.state.tasks = AP.state.tasks.filter(tk => tk.completed || tk.date < today || tk.manual);

    // Collect all due events for inoculation
    const dueEvents = [];
    AP.state.species.forEach(sp => {
      if (sp.id === 'au5') return;
      let last = AP.state.subDates[sp.id] || today;
      let next = addDays(last, sp.subcultureInterval);
      while (next <= horizon) {
        let flexDates = [];
        for (let i = -settings.flexAdvance; i <= settings.flexDelay; i++) {
          flexDates.push(addDays(next, i));
        }
        dueEvents.push({ speciesId: sp.id, ideal: next, flex: flexDates, sp });
        next = addDays(next, sp.subcultureInterval);
      }
    });

    // Sort by ideal date
    dueEvents.sort((a, b) => a.ideal.localeCompare(b.ideal));

    // Consolidate onto fewer work days while checking capacity constraints
    const dayWorkload = {};
    const getWorkload = (date) => dayWorkload[date] || 0;
    const addWorkload = (date, minutes) => { dayWorkload[date] = (dayWorkload[date] || 0) + minutes; };
    const workDays = new Set();
    const assignments = [];

    // Pre-calculate demands to reserve times
    const demandTasks = [];
    AP.state.demands.filter(d => (d.status === 'pending' || d.frequency === 'weekly') && d.status !== 'fulfilled' && d.status !== 'cancelled').forEach(d => {
      // simplified logic
      if (d.frequency === 'weekly') {
        let current = today;
        let cDay = new Date(current).getDay();
        let targetDow = parseInt(d.dayOfWeek);
        let diff = targetDow - cDay;
        if (diff < 0) diff += 7;
        let nextOccur = addDays(current, diff);
        while (nextOccur <= horizon) {
          const prep = addDays(nextOccur, -2);
          const prepDate = prep >= today ? prep : today;
          demandTasks.push({ date: prepDate, type: 'scaleup', speciesId: d.speciesId, notes: `${d.volume} ${d.unit}`, demandId: d.id });
          demandTasks.push({ date: nextOccur, type: 'harvest', speciesId: d.speciesId, demandId: d.id });
          addWorkload(prepDate, 15); // est 15 min for scaleup
          addWorkload(nextOccur, 15); // est 15 min for harvest
          workDays.add(prepDate); workDays.add(nextOccur);
          nextOccur = addDays(nextOccur, 7);
        }
        if (d.status === 'pending') d.status = 'scheduled';
      } else {
        if (d.dueDate >= today) {
          const prep = addDays(d.dueDate, -2);
          const prepDate = prep >= today ? prep : today;
          demandTasks.push({ date: prepDate, type: 'scaleup', speciesId: d.speciesId, notes: `${d.volume} ${d.unit}`, demandId: d.id });
          demandTasks.push({ date: d.dueDate, type: 'harvest', speciesId: d.speciesId, demandId: d.id });
          addWorkload(prepDate, 15); addWorkload(d.dueDate, 15);
          workDays.add(prepDate); workDays.add(d.dueDate);
          d.status = 'scheduled';
        }
      }
    });

    dueEvents.forEach(ev => {
      let assigned = null;
      let minWorkload = Infinity;
      const neededTime = settings.inoculationTimePerFlask * ev.sp.flasksPerSubculture + settings.cleaningTime; // base simplified

      // Prefer existing workDays within flex range that don't exceed capacity
      for (const fd of ev.flex) {
        if (fd >= today) {
          const w = getWorkload(fd);
          if (workDays.has(fd) && (w + neededTime <= settings.maxDailyHours)) {
            assigned = fd; break;
          }
        }
      }

      // If no valid existing workday, find the best date
      if (!assigned) {
        for (const fd of ev.flex) {
          if (fd >= today) {
            const w = getWorkload(fd);
            if (w + neededTime <= settings.maxDailyHours && w < minWorkload) {
              assigned = fd;
              minWorkload = w;
            }
          }
        }
      }
      if (!assigned) assigned = ev.ideal >= today ? ev.ideal : today;
      
      workDays.add(assigned);
      addWorkload(assigned, neededTime);
      assignments.push({ speciesId: ev.speciesId, date: assigned, sp: ev.sp });
    });

    const sterilizeDays = new Set();
    assignments.forEach(a => {
      if (!AP.state.tasks.some(t => t.date === a.date && t.type === 'inoculate' && t.speciesId === a.speciesId)) {
        AP.state.tasks.push({ id: uid(), date: a.date, type: 'inoculate', speciesId: a.speciesId, completed: false, notes: '', manual: false });
      }
      const sterDay = addDays(a.date, -1);
      if (sterDay >= today) {
        const key = sterDay + '|' + a.speciesId;
        if (!sterilizeDays.has(key)) {
          sterilizeDays.add(key);
          addWorkload(sterDay, settings.sterilizationTime); // simplifying time calculation
          AP.state.tasks.push({ id: uid(), date: sterDay, type: 'sterilize', speciesId: a.speciesId, completed: false, notes: '', manual: false });
        }
      }
    });

    demandTasks.forEach(dt => {
      if (!AP.state.tasks.some(tk => tk.demandId === dt.demandId && tk.date === dt.date && tk.type === dt.type)) {
        AP.state.tasks.push({ id: uid(), date: dt.date, type: dt.type, speciesId: dt.speciesId, completed: false, notes: dt.notes || '', demandId: dt.demandId, manual: false });
      }
    });

    save('ap-tasks', AP.state.tasks);
    save('ap-demands', AP.state.demands);
    AP.showToast(t('msg.scheduleGenerated'), 'success');
    renderCalendar();
  };

  // ── DASHBOARD ─────────────────────────────────────────────────────────
  const renderDashboard = () => {
    const today = todayISO();

    // Stats
    document.getElementById('stat-species').textContent = AP.state.species.length;
    const flask = AP.state.containers.find(c => c.id === 'flask_2000');
    document.getElementById('stat-flasks').textContent = flask ? flask.total - flask.inUse : 0;
    document.getElementById('stat-demands').textContent = AP.state.demands.filter(d => d.status === 'pending').length;

    // Next rest
    const taskDates = new Set(AP.state.tasks.filter(tk => tk.date >= today && !tk.completed).map(tk => tk.date));
    let nextRest = '—';
    for (let i = 0; i <= 30; i++) {
      const d = addDays(today, i);
      if (!taskDates.has(d)) {
        nextRest = i === 0 ? t('dashboard.todayTasks').split('')[0] + '!' : `${i} ${t('common.days')}`;
        if (i === 0) nextRest = '🎉 ' + (AP.state.lang === 'zh' ? '今天' : 'Today');
        break;
      }
    }
    document.getElementById('stat-nextRest').textContent = nextRest;

    // Today tasks
    const todayTasks = AP.state.tasks.filter(tk => tk.date === today);
    document.getElementById('today-task-count').textContent = todayTasks.length;
    const ttc = document.getElementById('today-tasks');
    if (todayTasks.length === 0) {
      ttc.innerHTML = `<div class="empty-state">${t('dashboard.noTasks')}</div>`;
    } else {
      ttc.innerHTML = todayTasks.map(tk => {
        const sp = AP.state.species.find(s => s.id === tk.speciesId);
        return `<div class="task-card type-${tk.type} ${tk.completed ? 'completed' : ''}" onclick="AP.toggleTask('${tk.id}')">
          <div class="task-type type-${tk.type}">${t('task.' + tk.type)}</div>
          <div class="task-species">${sp ? sp.icon + ' ' + spName(sp) : tk.speciesId}</div>
          <div class="task-detail">${tk.notes || ''}</div>
          <div style="margin-top:8px"><input type="checkbox" ${tk.completed ? 'checked' : ''} onclick="event.stopPropagation(); AP.toggleTask('${tk.id}')" style="width:18px;height:18px;accent-color:var(--primary);cursor:pointer"></div>
        </div>`;
      }).join('');
    }

    // Upcoming 7 days
    const uc = document.getElementById('upcoming-tasks');
    let upHtml = '';
    for (let i = 1; i <= 7; i++) {
      const d = addDays(today, i);
      const dt = new Date(d + 'T00:00:00');
      const dow = (dt.getDay() + 6) % 7;
      const tasks = AP.state.tasks.filter(tk => tk.date === d && !tk.completed);
      const isRest = tasks.length === 0;
      upHtml += `<div class="upcoming-day ${isRest ? 'rest-day' : ''}">
        <div class="upcoming-date">
          <div class="date-day">${dt.getDate()}</div>
          <div class="date-weekday">${TRANSLATIONS[AP.state.lang].weekdays[dow]}</div>
        </div>
        <div class="upcoming-tasks">
          ${isRest ? `<span class="upcoming-task-pill" style="background:rgba(71,85,105,0.15);color:var(--color-rest)">😴 ${t('task.rest')}</span>` :
          tasks.map(tk => {
            const sp = AP.state.species.find(s => s.id === tk.speciesId);
            return `<span class="upcoming-task-pill type-${tk.type}">${t('task.' + tk.type)} ${sp ? sp.code : ''}</span>`;
          }).join('')}
        </div>
      </div>`;
    }
    uc.innerHTML = upHtml;

    // Species countdown
    const scc = document.getElementById('species-countdown');
    scc.innerHTML = AP.state.species.filter(sp => sp.id !== 'au5').map(sp => {
      const last = AP.state.subDates[sp.id] || today;
      const next = addDays(last, sp.subcultureInterval);
      const left = diffDays(today, next);
      const elapsed = diffDays(last, today);
      const pct = Math.max(0, Math.min(100, (elapsed / sp.subcultureInterval) * 100));
      const color = left > 2 ? sp.color : left >= 0 ? 'var(--warning)' : 'var(--danger)';
      const label = left > 0 ? `${left} ${t('species.daysLeft')}` : left === 0 ? t('species.dueToday') : t('species.overdue');
      return `<div class="species-countdown-card">
        <div class="sp-icon">${sp.icon}</div>
        <div class="sp-name">${sp.code}</div>
        <div class="sp-countdown" style="color:${color}">${left > 0 ? left : left === 0 ? '!' : left}</div>
        <div class="sp-countdown-label">${label}</div>
        <div class="sp-bar"><div class="sp-bar-fill" style="width:${pct}%;background:${color}"></div></div>
      </div>`;
    }).join('');

    // Update demand badge
    const pending = AP.state.demands.filter(d => d.status === 'pending').length;
    const badge = document.getElementById('demand-badge');
    if (pending > 0) { badge.textContent = pending; badge.classList.remove('hidden'); }
    else { badge.classList.add('hidden'); }
  };

  AP.toggleTask = (id) => {
    const tk = AP.state.tasks.find(t => t.id === id);
    if (!tk) return;
    tk.completed = !tk.completed;
    if (tk.completed && tk.type === 'inoculate') {
      AP.state.subDates[tk.speciesId] = tk.date;
      save('ap-subculture-dates', AP.state.subDates);
    }
    save('ap-tasks', AP.state.tasks);
    renderDashboard();
    AP.showToast(t('msg.taskCompleted'), 'success');
  };

  // ── CALENDAR ──────────────────────────────────────────────────────────
  const renderCalendar = () => {
    const cd = AP.state.calDate;
    const y = cd.getFullYear(), m = cd.getMonth();
    const today = todayISO();

    document.getElementById('cal-month-year').textContent =
      AP.state.lang === 'zh' ? `${y}年 ${TRANSLATIONS.zh.months[m]}` : `${TRANSLATIONS.en.months[m]} ${y}`;

    const grid = document.getElementById('calendar-grid');
    grid.innerHTML = '';

    // Weekday headers
    TRANSLATIONS[AP.state.lang].weekdays.forEach(wd => {
      grid.innerHTML += `<div class="cal-header-cell">${wd}</div>`;
    });

    const first = new Date(y, m, 1);
    let startIdx = (first.getDay() + 6) % 7; // Mon=0
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const prevDays = new Date(y, m, 0).getDate();

    // Previous month padding
    for (let i = startIdx - 1; i >= 0; i--) {
      const day = prevDays - i;
      const dateStr = addDays(`${y}-${String(m + 1).padStart(2, '0')}-01`, -(i + 1));
      grid.innerHTML += `<div class="cal-cell other-month"><div class="cal-date">${day}</div></div>`;
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayTasks = AP.state.tasks.filter(tk => tk.date === dateStr);
      const isToday = dateStr === today;
      const isSelected = dateStr === AP.state.selectedDate;
      const isRest = dayTasks.length === 0;

      let dailyMins = 0;
      const settings = AP.state.settings;
      dayTasks.forEach(tk => {
        const sp = AP.state.species.find(s => s.id === tk.speciesId);
        const flasks = sp ? sp.flasksPerSubculture : 1;
        if (tk.type === 'inoculate') {
          dailyMins += settings.uvTime + (flasks * settings.inoculationTimePerFlask) + settings.cleaningTime;
        } else if (tk.type === 'sterilize') {
          dailyMins += Math.ceil(flasks / settings.sterilizerCapacity) * settings.sterilizationTime;
        } else if (tk.type === 'scaleup' || tk.type === 'harvest') {
          dailyMins += 15;
        }
      });
      const hours = Math.floor(dailyMins / 60);
      const mins = dailyMins % 60;
      const workloadStr = dailyMins > 0 ? `⏱️ ${hours > 0 ? hours + 'h ' : ''}${mins > 0 ? mins + 'm' : ''}` : '';

      let classes = 'cal-cell';
      if (isToday) classes += ' today';
      if (isSelected) classes += ' selected';
      if (isRest) classes += ' rest-day';

      let pillsHtml = '';
      const shown = dayTasks.slice(0, 4);
      shown.forEach(tk => {
        const sp = AP.state.species.find(s => s.id === tk.speciesId);
        let qty = '';
        if (tk.type === 'inoculate' || tk.type === 'sterilize') {
          qty = sp ? ` (${sp.flasksPerSubculture}${AP.state.lang==='zh'?'瓶':'x'})` : '';
        } else if (tk.type === 'scaleup') {
          qty = tk.notes ? ` (${tk.notes})` : '';
        }
        pillsHtml += `<div class="cal-task-pill type-${tk.type} ${tk.completed ? 'completed' : ''}">${sp ? sp.icon : ''} ${sp ? sp.code : ''} ${t('task.' + tk.type)}${qty}</div>`;
      });
      if (dayTasks.length > 4) {
        pillsHtml += `<div class="cal-more">+${dayTasks.length - 4}</div>`;
      }

      grid.innerHTML += `<div class="${classes}" onclick="AP.selectDay('${dateStr}')">
        <div class="cal-date">${d}</div>
        ${workloadStr ? `<div class="workload-badge ${dailyMins > settings.maxDailyHours ? 'danger' : dailyMins > settings.maxDailyHours * 0.8 ? 'warning' : ''}">${workloadStr}</div>` : ''}
        <div class="cal-tasks">${pillsHtml}</div>
      </div>`;
    }

    // Next month padding
    const totalCells = startIdx + daysInMonth;
    const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    for (let i = 1; i <= remaining; i++) {
      grid.innerHTML += `<div class="cal-cell other-month"><div class="cal-date">${i}</div></div>`;
    }
  };

  AP.selectDay = (dateStr) => {
    AP.state.selectedDate = dateStr;
    renderCalendar();
    showDayDetail(dateStr);
  };

  const showDayDetail = (dateStr) => {
    const panel = document.getElementById('day-detail');
    document.getElementById('day-detail-date').textContent = formatDate(dateStr);

    const dayTasks = AP.state.tasks.filter(tk => tk.date === dateStr);
    const tc = document.getElementById('day-detail-tasks');

    if (dayTasks.length === 0) {
      tc.innerHTML = `<div class="empty-state">${t('dashboard.noTasks')}</div>`;
    } else {
      tc.innerHTML = dayTasks.map(tk => {
        const sp = AP.state.species.find(s => s.id === tk.speciesId);
        let qty = '';
        if (tk.type === 'inoculate' || tk.type === 'sterilize') {
          qty = sp ? `${sp.flasksPerSubculture} ${AP.state.lang==='zh'?'瓶':'flasks'}` : '';
        } else if (tk.type === 'scaleup') {
          qty = tk.notes || '';
        }
        return `<div class="day-detail-task type-${tk.type}">
          <div style="display:flex;align-items:center;justify-content:space-between">
            <div>
              <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--color-${tk.type});margin-bottom:4px">${t('task.' + tk.type)}${qty ? ' — ' + qty : ''}</div>
              <div style="font-weight:600">${sp ? sp.icon + ' ' + spName(sp) : tk.speciesId}</div>
              ${tk.notes && tk.type !== 'scaleup' ? `<div style="font-size:12px;color:var(--text-muted);margin-top:4px">${tk.notes}</div>` : ''}
            </div>
            <input type="checkbox" ${tk.completed ? 'checked' : ''} onchange="AP.toggleTask('${tk.id}')" style="width:20px;height:20px;accent-color:var(--primary);cursor:pointer">
          </div>
        </div>`;
      }).join('');
    }

    // Add task handler
    document.getElementById('day-add-task').onclick = () => openAddTaskModal(dateStr);

    // Mark all complete handler
    document.getElementById('day-mark-complete').onclick = () => {
      dayTasks.forEach(tk => {
        tk.completed = true;
        if (tk.type === 'inoculate') {
          AP.state.subDates[tk.speciesId] = tk.date;
        }
      });
      save('ap-tasks', AP.state.tasks);
      save('ap-subculture-dates', AP.state.subDates);
      showDayDetail(dateStr);
      renderCalendar();
      AP.showToast(t('msg.taskCompleted'), 'success');
    };

    panel.classList.remove('hidden');
    requestAnimationFrame(() => panel.classList.add('visible'));
  };

  const closeDayDetail = () => {
    const panel = document.getElementById('day-detail');
    panel.classList.remove('visible');
    setTimeout(() => panel.classList.add('hidden'), 400);
  };

  const openAddTaskModal = (dateStr) => {
    const speciesOptions = AP.state.species.map(s => `<option value="${s.id}">${s.code} — ${spName(s)}</option>`).join('');
    const html = `
      <div class="form-group">
        <label>${AP.state.lang === 'zh' ? '任務類型' : 'Task Type'}</label>
        <select id="new-task-type" class="form-select">
          <option value="inoculate">${t('task.inoculate')}</option>
          <option value="sterilize">${t('task.sterilize')}</option>
          <option value="harvest">${t('task.harvest')}</option>
          <option value="scaleup">${t('task.scaleup')}</option>
        </select>
      </div>
      <div class="form-group">
        <label>${t('demand.species')}</label>
        <select id="new-task-species" class="form-select">${speciesOptions}</select>
      </div>
      <div class="form-group">
        <label>${t('demand.notes')}</label>
        <input type="text" id="new-task-notes" class="form-input" placeholder="">
      </div>`;
    AP.openModal(t('calendar.addTask'), html, () => {
      AP.state.tasks.push({
        id: uid(), date: dateStr,
        type: document.getElementById('new-task-type').value,
        speciesId: document.getElementById('new-task-species').value,
        completed: false,
        notes: document.getElementById('new-task-notes').value,
        manual: true
      });
      save('ap-tasks', AP.state.tasks);
      AP.closeModal();
      renderCalendar();
      showDayDetail(dateStr);
    });
  };

  // ── SPECIES ───────────────────────────────────────────────────────────
  const renderSpecies = () => {
    const today = todayISO();
    const grid = document.getElementById('species-grid');
    grid.innerHTML = AP.state.species.map(sp => {
      const last = AP.state.subDates[sp.id];
      const next = last ? addDays(last, sp.subcultureInterval) : '—';
      const left = last ? diffDays(today, next) : '—';
      return `<div class="species-card sp-accent-${sp.id}" style="--sp-color:${sp.color}">
        <div class="sp-header">
          <div style="display:flex;align-items:center;gap:12px">
            <div class="sp-icon-wrapper" style="background:${sp.color}22">${sp.icon}</div>
            <div>
              <div class="sp-code" style="color:${sp.color}">${sp.code}</div>
              <div class="sp-scientific">${sp.scientificName}</div>
            </div>
          </div>
          <div class="sp-actions">
            <button class="btn-icon" onclick="AP.editSpecies('${sp.id}')" title="${t('common.edit')}">✏️</button>
            <button class="btn-icon" onclick="AP.deleteSpecies('${sp.id}')" title="${t('common.delete')}">🗑️</button>
          </div>
        </div>
        <div class="sp-info-grid">
          <div class="sp-info-item"><span class="sp-info-label">${t('species.interval')}</span><span class="sp-info-value">${sp.subcultureInterval} ${t('common.days')}</span></div>
          <div class="sp-info-item"><span class="sp-info-label">${t('species.medium')}</span><span class="sp-info-value" style="text-transform:capitalize">${sp.medium}</span></div>
          <div class="sp-info-item"><span class="sp-info-label">${t('species.lastSubculture')}</span><span class="sp-info-value">${last ? shortDate(last) : '—'}</span></div>
          <div class="sp-info-item"><span class="sp-info-label">${t('species.nextDue')}</span><span class="sp-info-value" style="color:${typeof left === 'number' && left <= 1 ? 'var(--danger)' : 'var(--primary)'}">${next !== '—' ? shortDate(next) : '—'}</span></div>
          <div class="sp-info-item"><span class="sp-info-label">${t('species.ratio')}</span><span class="sp-info-value">${(sp.inoculumRatio * 100).toFixed(0)}%</span></div>
          <div class="sp-info-item"><span class="sp-info-label">${t('species.flasks')}</span><span class="sp-info-value">${sp.flasksPerSubculture}</span></div>
        </div>
        ${sp.notes ? `<div style="margin-top:12px;font-size:12px;color:var(--text-muted);border-top:1px solid var(--border);padding-top:8px">${sp.notes}</div>` : ''}
      </div>`;
    }).join('');
  };

  AP.editSpecies = (id) => {
    const sp = AP.state.species.find(s => s.id === id);
    if (sp) openSpeciesModal(sp);
  };

  AP.deleteSpecies = (id) => {
    if (!confirm(t('msg.confirmDelete'))) return;
    AP.state.species = AP.state.species.filter(s => s.id !== id);
    delete AP.state.subDates[id];
    saveAll();
    renderSpecies();
    AP.showToast(t('common.delete'), 'success');
  };

  const openSpeciesModal = (existing) => {
    const isNew = !existing;
    const sp = existing || { id: uid(), code: '', icon: '🦠', nameZh: '', nameEn: '', scientificName: '', subcultureInterval: 7, inoculumRatio: 0.1, medium: 'walne', needsSilicate: false, color: '#3b82f6', flasksPerSubculture: 1, notes: '' };
    const html = `
      <div class="form-row"><div class="form-group"><label>${t('species.code')}</label><input type="text" id="sp-code" class="form-input" value="${sp.code}"></div>
      <div class="form-group"><label>Icon</label><input type="text" id="sp-icon" class="form-input" value="${sp.icon}" maxlength="4"></div></div>
      <div class="form-row"><div class="form-group"><label>${t('species.name')} (中文)</label><input type="text" id="sp-zh" class="form-input" value="${sp.nameZh}"></div>
      <div class="form-group"><label>${t('species.name')} (EN)</label><input type="text" id="sp-en" class="form-input" value="${sp.nameEn}"></div></div>
      <div class="form-group"><label>${t('species.scientific')}</label><input type="text" id="sp-sci" class="form-input" value="${sp.scientificName}"></div>
      <div class="form-row"><div class="form-group"><label>${t('species.interval')}</label><input type="number" id="sp-int" class="form-input" value="${sp.subcultureInterval}" min="1"></div>
      <div class="form-group"><label>${t('species.ratio')}</label><input type="number" id="sp-ratio" class="form-input" value="${sp.inoculumRatio}" step="0.05" min="0.05" max="1"></div></div>
      <div class="form-row"><div class="form-group"><label>${t('species.medium')}</label><select id="sp-med" class="form-select">
        <option value="walne" ${sp.medium === 'walne' ? 'selected' : ''}>Walne</option>
        <option value="huabao" ${sp.medium === 'huabao' ? 'selected' : ''}>花寶 Huabao</option>
        <option value="f2" ${sp.medium === 'f2' ? 'selected' : ''}>f/2</option>
      </select></div>
      <div class="form-group"><label>${t('species.flasks')}</label><input type="number" id="sp-flasks" class="form-input" value="${sp.flasksPerSubculture}" min="0"></div></div>
      <div class="form-group"><label><input type="checkbox" id="sp-sil" ${sp.needsSilicate ? 'checked' : ''} style="accent-color:var(--primary)"> ${t('species.silicate')}</label></div>
      <div class="form-group"><label>${t('species.color')}</label><input type="color" id="sp-color" value="${sp.color}" style="width:60px;height:36px;border:none;cursor:pointer;background:transparent"></div>
      ${!isNew ? `<div class="form-group"><label>${t('species.lastSubculture')}</label><input type="date" id="sp-lastdate" class="form-input" value="${AP.state.subDates[sp.id] || todayISO()}"></div>` : ''}
      <div class="form-group"><label>${t('demand.notes')}</label><textarea id="sp-notes" class="form-textarea">${sp.notes}</textarea></div>`;

    AP.openModal(isNew ? t('species.add') : t('species.edit'), html, () => {
      sp.code = document.getElementById('sp-code').value.trim() || sp.code;
      sp.icon = document.getElementById('sp-icon').value || '🦠';
      sp.nameZh = document.getElementById('sp-zh').value;
      sp.nameEn = document.getElementById('sp-en').value;
      sp.scientificName = document.getElementById('sp-sci').value;
      sp.subcultureInterval = parseInt(document.getElementById('sp-int').value) || 7;
      sp.inoculumRatio = parseFloat(document.getElementById('sp-ratio').value) || 0.1;
      sp.medium = document.getElementById('sp-med').value;
      sp.flasksPerSubculture = parseInt(document.getElementById('sp-flasks').value) || 0;
      sp.needsSilicate = document.getElementById('sp-sil').checked;
      sp.color = document.getElementById('sp-color').value;
      sp.notes = document.getElementById('sp-notes').value;
      if (!isNew) {
        const d = document.getElementById('sp-lastdate');
        if (d) AP.state.subDates[sp.id] = d.value;
        const idx = AP.state.species.findIndex(s => s.id === sp.id);
        if (idx >= 0) AP.state.species[idx] = sp;
      } else {
        AP.state.species.push(sp);
        AP.state.subDates[sp.id] = todayISO();
      }
      saveAll();
      renderSpecies();
      AP.closeModal();
      AP.showToast(t('common.save'), 'success');
    });
  };

  // ── INVENTORY ─────────────────────────────────────────────────────────
  const renderInventory = () => {
    const grid = document.getElementById('inventory-grid');
    grid.innerHTML = AP.state.containers.map(c => {
      const avail = c.total - c.inUse;
      const pct = c.total > 0 ? (c.inUse / c.total) * 100 : 0;
      const barColor = pct > 80 ? 'var(--danger)' : pct > 50 ? 'var(--warning)' : 'var(--primary)';
      return `<div class="inventory-card">
        <div class="inv-header">
          <div class="inv-icon">${c.icon}</div>
          <button class="btn-icon" onclick="AP.editContainer('${c.id}')" title="${t('common.edit')}">✏️</button>
        </div>
        <div class="inv-name">${AP.state.lang === 'zh' ? c.nameZh : c.nameEn}</div>
        <div class="inv-count"><span class="inv-count-value">${avail}</span><span class="inv-count-total">/ ${c.total}</span></div>
        <div class="inv-bar"><div class="inv-bar-fill" style="width:${pct}%;background:${barColor}"></div></div>
      </div>`;
    }).join('');
  };

  AP.editContainer = (id) => {
    const c = AP.state.containers.find(x => x.id === id);
    if (!c) return;
    const html = `
      <div class="form-group"><label>${t('inventory.total')}</label><input type="number" id="inv-total" class="form-input" value="${c.total}" min="0"></div>
      <div class="form-group"><label>${t('inventory.inUse')}</label><input type="number" id="inv-inuse" class="form-input" value="${c.inUse}" min="0"></div>`;
    AP.openModal(t('inventory.edit'), html, () => {
      c.total = parseInt(document.getElementById('inv-total').value) || 0;
      c.inUse = parseInt(document.getElementById('inv-inuse').value) || 0;
      save('ap-containers', AP.state.containers);
      renderInventory();
      AP.closeModal();
    });
  };

  // ── DEMAND ────────────────────────────────────────────────────────────
  const renderDemand = () => {
    document.querySelectorAll('.tab-btn').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-tab') === AP.state.demandTab);
    });
    const list = document.getElementById('demand-list');
    const filtered = AP.state.demands.filter(d => d.status === AP.state.demandTab ||
      (AP.state.demandTab === 'fulfilled' && (d.status === 'fulfilled' || d.status === 'cancelled')));

    if (filtered.length === 0) {
      list.innerHTML = `<div class="empty-state">${t('common.noData')}</div>`;
      return;
    }
    list.innerHTML = filtered.map(d => {
      const sp = AP.state.species.find(s => s.id === d.speciesId);
      return `<div class="demand-card">
        <div style="flex:1">
          <div class="demand-species">${sp ? sp.icon + ' ' + spName(sp) : d.speciesId}</div>
          <div class="demand-volume">${d.volume} ${d.unit}</div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:4px">${d.notes || ''}</div>
        </div>
        <div class="demand-due">${d.frequency === 'weekly' ? (AP.state.lang==='zh'?'每周':'Weekly ') + TRANSLATIONS[AP.state.lang].weekdaysFull[d.dayOfWeek===0?6:d.dayOfWeek-1] : `${t('demand.dueDate')}: ${shortDate(d.dueDate)}`}</div>
        <span class="demand-status status-${d.status}">${t('demand.' + d.status) || d.status}</span>
        <div style="display:flex;gap:4px;margin-left:8px">
          ${d.status === 'pending' || d.status === 'scheduled' ? `<button class="btn-sm btn-primary" onclick="AP.fulfillDemand('${d.id}')">${t('demand.fulfill')}</button>` : ''}
          <button class="btn-sm btn-danger" onclick="AP.deleteDemand('${d.id}')">🗑️</button>
        </div>
      </div>`;
    }).join('');
  };

  AP.fulfillDemand = (id) => {
    const d = AP.state.demands.find(x => x.id === id);
    if (d) { d.status = 'fulfilled'; save('ap-demands', AP.state.demands); renderDemand(); AP.showToast(t('demand.fulfill'), 'success'); }
  };

  AP.deleteDemand = (id) => {
    if (!confirm(t('msg.confirmDelete'))) return;
    AP.state.demands = AP.state.demands.filter(x => x.id !== id);
    save('ap-demands', AP.state.demands);
    renderDemand();
  };

  const openDemandModal = () => {
    const opts = AP.state.species.map(s => `<option value="${s.id}">${s.code} — ${spName(s)}</option>`).join('');
    const html = `
      <div class="form-group"><label>${t('demand.species')}</label><select id="dem-sp" class="form-select">${opts}</select></div>
      <div class="form-row">
        <div class="form-group"><label>${t('demand.volume')}</label><input type="number" id="dem-vol" class="form-input" value="1" min="1"></div>
        <div class="form-group"><label>Unit</label><select id="dem-unit" class="form-select"><option value="L">Liters (L)</option><option value="bucket">${AP.state.lang === 'zh' ? '桶' : 'Buckets'}</option></select></div>
      <div class="form-row">
        <div class="form-group"><label>${AP.state.lang==='zh'?'需求类型':'Type'}</label><select id="dem-freq" class="form-select" onchange="document.getElementById('dem-date-wrap').style.display=this.value==='once'?'block':'none';document.getElementById('dem-dow-wrap').style.display=this.value==='weekly'?'block':'none';"><option value="once">${AP.state.lang==='zh'?'单次交货':'One-time'}</option><option value="weekly">${AP.state.lang==='zh'?'每周固定':'Weekly'}</option></select></div>
      </div>
      <div class="form-group" id="dem-date-wrap"><label>${t('demand.dueDate')}</label><input type="date" id="dem-date" class="form-input" value="${addDays(todayISO(), 5)}"></div>
      <div class="form-group" id="dem-dow-wrap" style="display:none"><label>${AP.state.lang==='zh'?'每周星期几交货':'Day of Week'}</label><select id="dem-dow" class="form-select">
        ${TRANSLATIONS[AP.state.lang].weekdaysFull.map((wd, i) => `<option value="${i===6?0:i+1}">${wd}</option>`).join('')}
      </select></div>
      <div class="form-group"><label>${t('demand.notes')}</label><input type="text" id="dem-notes" class="form-input"></div>`;
    AP.openModal(t('demand.add'), html, () => {
      AP.state.demands.push({
        id: uid(),
        speciesId: document.getElementById('dem-sp').value,
        volume: document.getElementById('dem-vol').value,
        unit: document.getElementById('dem-unit').value,
        frequency: document.getElementById('dem-freq').value,
        dayOfWeek: parseInt(document.getElementById('dem-dow').value),
        requestDate: todayISO(),
        dueDate: document.getElementById('dem-date').value,
        status: 'pending',
        notes: document.getElementById('dem-notes').value
      });
      save('ap-demands', AP.state.demands);
      renderDemand();
      AP.closeModal();
      AP.showToast(t('common.save'), 'success');
    });
  };

  // ── WALNE CALCULATOR ──────────────────────────────────────────────────
  const renderWalne = () => {
    const volInput = document.getElementById('walne-volume');
    if (!volInput.hasAttribute('data-init')) {
        volInput.value = AP.state.settings.walneVolume || 1;
        const typeInput = document.querySelector(`input[name="medium-type"][value="${AP.state.settings.walneType || 'walne'}"]`);
        if(typeInput) typeInput.checked = true;
        volInput.setAttribute('data-init', '1');
        document.querySelectorAll('.preset-btns button[data-volume]').forEach(b => {
          b.classList.toggle('active', b.getAttribute('data-volume') == volInput.value);
        });
    }
    const vol = parseFloat(volInput.value) || 1;
    const type = document.querySelector('input[name="medium-type"]:checked')?.value || 'walne';
    AP.state.settings.walneVolume = vol;
    AP.state.settings.walneType = type;
    save('ap-settings', AP.state.settings);

    const needSil = type === 'walne-silicate';

    // Usage amounts
    const stockA = vol * 1.0;
    const stockC = vol * 0.1;
    const stockD = vol * 1.0;

    document.getElementById('walne-usage-content').innerHTML = `
      <table><thead><tr><th>${AP.state.lang === 'zh' ? '母液' : 'Stock'}</th><th>${t('walne.amount')}</th><th>${AP.state.lang === 'zh' ? '濃度' : 'Rate'}</th></tr></thead><tbody>
        <tr><td class="chem-name">Stock A (${t('walne.nutrient')})</td><td class="amount-highlight">${stockA.toFixed(1)} mL</td><td>1.0 mL/L</td></tr>
        <tr><td class="chem-name">Stock C (${t('walne.vitamin')})</td><td class="amount-highlight">${stockC.toFixed(2)} mL</td><td>0.1 mL/L</td></tr>
        ${needSil ? `<tr><td class="chem-name">Stock D (${t('walne.silicate')})</td><td class="amount-highlight">${stockD.toFixed(1)} mL</td><td>1.0 mL/L</td></tr>` : ''}
      </tbody></table>`;

    // Stock A recipe
    document.getElementById('walne-a-content').innerHTML = `
      <table><thead><tr><th>${t('walne.chemical')}</th><th>${t('walne.formula')}</th><th>${t('walne.amount')}/L</th></tr></thead><tbody>
        <tr><td class="chem-name">硝酸鈉 Sodium Nitrate</td><td class="chem-formula">NaNO₃</td><td>100.0 g</td></tr>
        <tr><td class="chem-name">磷酸二氫鈉 Sod. Dihydrogen Phosphate</td><td class="chem-formula">NaH₂PO₄·2H₂O</td><td>20.0 g</td></tr>
        <tr><td class="chem-name">EDTA二鈉鹽 Disodium EDTA</td><td class="chem-formula">Na₂EDTA·2H₂O</td><td>45.0 g</td></tr>
        <tr><td class="chem-name">硼酸 Boric Acid</td><td class="chem-formula">H₃BO₃</td><td>33.6 g</td></tr>
        <tr><td class="chem-name">氯化鐵 Ferric Chloride</td><td class="chem-formula">FeCl₃·6H₂O</td><td>1.3 g</td></tr>
        <tr><td class="chem-name">氯化錳 Manganese Chloride</td><td class="chem-formula">MnCl₂·4H₂O</td><td>0.36 g</td></tr>
        <tr><td class="chem-name">微量元素液 TMS (Stock B)</td><td class="chem-formula">—</td><td>1.0 mL</td></tr>
      </tbody></table>`;

    // Stock B recipe
    document.getElementById('walne-b-content').innerHTML = `
      <table><thead><tr><th>${t('walne.chemical')}</th><th>${t('walne.formula')}</th><th>${t('walne.amount')}/100mL</th></tr></thead><tbody>
        <tr><td class="chem-name">氯化鋅 Zinc Chloride</td><td class="chem-formula">ZnCl₂</td><td>2.1 g</td></tr>
        <tr><td class="chem-name">氯化鈷 Cobaltous Chloride</td><td class="chem-formula">CoCl₂·6H₂O</td><td>2.0 g</td></tr>
        <tr><td class="chem-name">鉬酸銨 Ammonium Molybdate</td><td class="chem-formula">(NH₄)₆Mo₇O₂₄·4H₂O</td><td>0.9 g</td></tr>
        <tr><td class="chem-name">硫酸銅 Cupric Sulfate</td><td class="chem-formula">CuSO₄·5H₂O</td><td>2.0 g</td></tr>
      </tbody></table>`;

    // Stock C recipe
    document.getElementById('walne-c-content').innerHTML = `
      <table><thead><tr><th>${t('walne.chemical')}</th><th>${t('walne.formula')}</th><th>${t('walne.amount')}/100mL</th></tr></thead><tbody>
        <tr><td class="chem-name">硫胺素 Thiamine HCl (B₁)</td><td class="chem-formula">C₁₂H₁₇N₄OS·HCl</td><td>10.0 mg</td></tr>
        <tr><td class="chem-name">氰鈷胺素 Cyanocobalamin (B₁₂)</td><td class="chem-formula">C₆₃H₈₈CoN₁₄O₁₄P</td><td>10.0 mg</td></tr>
        <tr><td class="chem-name">生物素 Biotin (H)</td><td class="chem-formula">C₁₀H₁₆N₂O₃S</td><td>0.2 mg</td></tr>
      </tbody></table>
      <div style="margin-top:10px;font-size:11px;color:var(--text-muted)">⚠️ ${AP.state.lang === 'zh' ? '維生素液不可高壓滅菌，需 0.22µm 過濾除菌' : 'Do NOT autoclave. Filter-sterilize through 0.22µm membrane.'}</div>`;

    // Stock D recipe
    document.getElementById('walne-d-content').innerHTML = `
      <table><thead><tr><th>${t('walne.chemical')}</th><th>${t('walne.formula')}</th><th>${t('walne.amount')}/L</th></tr></thead><tbody>
        <tr><td class="chem-name">矽酸鈉 Sodium Metasilicate</td><td class="chem-formula">Na₂SiO₃·5H₂O</td><td>40.0 g</td></tr>
      </tbody></table>
      <div style="margin-top:10px;font-size:11px;color:var(--text-muted)">💎 ${AP.state.lang === 'zh' ? '僅矽藻類需要 (如 Chaetoceros)' : 'Required only for diatoms (e.g. Chaetoceros)'}</div>`;

    // Highlight active preset
    document.querySelectorAll('.preset-btns button').forEach(b => {
      b.classList.toggle('active', parseFloat(b.getAttribute('data-volume')) === vol);
    });
  };

  // ── CULTURE LOG ───────────────────────────────────────────────────────
  const renderLog = () => {
    // Populate species filter
    const spSel = document.getElementById('log-filter-species');
    if (spSel.options.length <= 1) {
      AP.state.species.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.id;
        opt.textContent = `${s.code} — ${spName(s)}`;
        spSel.appendChild(opt);
      });
    }

    const filterSp = spSel.value;
    const filterTy = document.getElementById('log-filter-type').value;

    let logs = [...AP.state.logs].sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
    if (filterSp !== 'all') logs = logs.filter(l => l.speciesId === filterSp);
    if (filterTy !== 'all') logs = logs.filter(l => l.type === filterTy);

    const list = document.getElementById('log-entries');
    if (logs.length === 0) {
      list.innerHTML = `<div class="empty-state">${t('common.noData')}</div>`;
      return;
    }

    list.innerHTML = logs.map(l => {
      const sp = AP.state.species.find(s => s.id === l.speciesId);
      const statusIcon = l.status === 'normal' ? '✅' : l.status === 'warning' ? '⚠️' : '☠️';
      const typeColor = { inoculate: 'var(--color-inoculate)', sterilize: 'var(--color-sterilize)', observe: 'var(--info)', contamination: 'var(--danger)', harvest: 'var(--color-harvest)' };
      return `<div class="log-entry">
        <div class="log-date">${l.date}<br>${l.time}</div>
        <div class="log-type-badge" style="background:${typeColor[l.type] || 'var(--info)'}22;color:${typeColor[l.type] || 'var(--info)'}">${l.type}</div>
        <div class="log-species-name">${sp ? sp.icon + ' ' + sp.code : l.speciesId}</div>
        <div class="log-notes">${l.notes || ''}</div>
        <div class="log-status">${statusIcon}</div>
        <div class="log-actions"><button class="btn-icon" onclick="AP.deleteLog('${l.id}')" title="${t('common.delete')}">🗑️</button></div>
      </div>`;
    }).join('');
  };

  AP.deleteLog = (id) => {
    if (!confirm(t('msg.confirmDelete'))) return;
    AP.state.logs = AP.state.logs.filter(l => l.id !== id);
    save('ap-logs', AP.state.logs);
    renderLog();
  };

  const openLogModal = () => {
    const opts = AP.state.species.map(s => `<option value="${s.id}">${s.code} — ${spName(s)}</option>`).join('');
    const html = `
      <div class="form-row">
        <div class="form-group"><label>${AP.state.lang === 'zh' ? '日期' : 'Date'}</label><input type="date" id="log-date" class="form-input" value="${todayISO()}"></div>
        <div class="form-group"><label>${AP.state.lang === 'zh' ? '時間' : 'Time'}</label><input type="time" id="log-time" class="form-input" value="${nowTime()}"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>${AP.state.lang === 'zh' ? '類型' : 'Type'}</label>
          <select id="log-type" class="form-select">
            <option value="inoculate">${t('task.inoculate')}</option>
            <option value="sterilize">${t('task.sterilize')}</option>
            <option value="observe">${AP.state.lang === 'zh' ? '觀察' : 'Observe'}</option>
            <option value="contamination">${AP.state.lang === 'zh' ? '污染' : 'Contamination'}</option>
            <option value="harvest">${t('task.harvest')}</option>
          </select>
        </div>
        <div class="form-group"><label>${t('demand.species')}</label><select id="log-sp" class="form-select">${opts}</select></div>
      </div>
      <div class="form-group"><label>${AP.state.lang === 'zh' ? '狀態' : 'Status'}</label>
        <select id="log-status" class="form-select">
          <option value="normal">${t('log.normal')} ✅</option>
          <option value="warning">${t('log.warning')} ⚠️</option>
          <option value="contaminated">${t('log.contaminated')} ☠️</option>
        </select>
      </div>
      <div class="form-group"><label>${t('demand.notes')}</label><textarea id="log-notes" class="form-textarea" rows="3"></textarea></div>`;
    AP.openModal(t('log.add'), html, () => {
      AP.state.logs.push({
        id: uid(),
        date: document.getElementById('log-date').value,
        time: document.getElementById('log-time').value,
        type: document.getElementById('log-type').value,
        speciesId: document.getElementById('log-sp').value,
        status: document.getElementById('log-status').value,
        notes: document.getElementById('log-notes').value
      });
      save('ap-logs', AP.state.logs);
      renderLog();
      AP.closeModal();
      AP.showToast(t('common.save'), 'success');
    });
  };

  // ── SETTINGS ──────────────────────────────────────────────────────────
  const renderSettings = () => {
    const s = AP.state.settings;
    document.getElementById('set-horizon').value = s.scheduleHorizon;
    document.getElementById('set-max-hours').value = s.maxDailyHours;
    document.getElementById('set-flex-adv').value = s.flexAdvance;
    document.getElementById('set-flex-del').value = s.flexDelay;
    document.getElementById('set-ster-cap').value = s.sterilizerCapacity;
    document.getElementById('set-ster-time').value = s.sterilizationTime;
    document.getElementById('set-uv-time').value = s.uvTime;
    document.getElementById('set-clean-time').value = s.cleaningTime;
    document.getElementById('set-inoc-time').value = s.inoculationTimePerFlask;

    document.getElementById('btn-save-settings').onclick = () => {
      s.scheduleHorizon = parseInt(document.getElementById('set-horizon').value) || 14;
      s.maxDailyHours = parseInt(document.getElementById('set-max-hours').value) || 480;
      s.flexAdvance = parseInt(document.getElementById('set-flex-adv').value) || 2;
      s.flexDelay = parseInt(document.getElementById('set-flex-del').value) || 1;
      s.sterilizerCapacity = parseInt(document.getElementById('set-ster-cap').value) || 6;
      s.sterilizationTime = parseInt(document.getElementById('set-ster-time').value) || 180;
      s.uvTime = parseInt(document.getElementById('set-uv-time').value) || 20;
      s.cleaningTime = parseInt(document.getElementById('set-clean-time').value) || 10;
      s.inoculationTimePerFlask = parseInt(document.getElementById('set-inoc-time').value) || 8;
      save('ap-settings', s);
      AP.showToast(t('common.save'), 'success');
    };
  };

  // ── COPEPODS ──────────────────────────────────────────────────────────
  const renderCopepods = () => {
    const grid = document.getElementById('copepods-grid');
    grid.innerHTML = AP.state.copepods.map(c => `
      <div class="species-card">
        <div class="sp-header">
          <div style="display:flex;align-items:center;gap:12px">
            <div class="sp-icon-wrapper" style="background:var(--primary-soft)">🦐</div>
            <div>
              <div class="sp-code">${c.batchName}</div>
              <div class="sp-scientific">${c.status} | Start: ${shortDate(c.startDate)}</div>
            </div>
          </div>
        </div>
      </div>`).join('');

    const logsEl = document.getElementById('copepods-logs');
    const logs = AP.state.logs.filter(l => l.copepodId);
    logs.sort((a,b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time));
    
    Promise.all(logs.map(async l => {
      let photoHtml = '';
      if (l.photoId) {
        const url = await AP.db.getPhoto(l.photoId);
        if (url) photoHtml = `<div class="photo-thumb-container"><img src="${url}" class="photo-thumb" onclick="window.open('${url}')"></div>`;
      }
      return `<div class="log-entry">
        <div class="log-date">${shortDate(l.date)}<br/>${l.time}</div>
        <div class="log-type-badge">${l.type}</div>
        <div class="log-notes">${l.notes || ''}</div>
        ${photoHtml}
      </div>`;
    })).then(htmls => {
      logsEl.innerHTML = htmls.join('');
    });

    document.getElementById('btn-add-copepod').onclick = () => {
      AP.openModal(t('copepods.add'), `
        <div class="form-group"><label>Batch Name</label><input type="text" id="cp-name" class="form-input"></div>
        <div class="form-group"><label>Status</label><input type="text" id="cp-status" class="form-input" value="Active"></div>
      `, () => {
        AP.state.copepods.push({
          id: uid(), batchName: document.getElementById('cp-name').value,
          startDate: todayISO(), status: document.getElementById('cp-status').value
        });
        save('ap-copepods', AP.state.copepods);
        AP.closeModal();
        renderCopepods();
      });
    };

    document.getElementById('btn-add-copepod-log').onclick = () => {
      const opts = AP.state.copepods.map(c => `<option value="${c.id}">${c.batchName}</option>`).join('');
      if (!opts) {
         AP.showToast('Add a copepod batch first!', 'warning');
         return;
      }
      AP.openModal(t('copepods.addLog'), `
        <div class="form-group"><label>Batch</label><select id="cpl-batch" class="form-select">${opts}</select></div>
        <div class="form-group"><label>Type</label><select id="cpl-type" class="form-select">
          <option value="feed">Feed</option><option value="water">Water Change</option><option value="status">Status</option>
        </select></div>
        <div class="form-group"><label>Notes</label><input type="text" id="cpl-notes" class="form-input"></div>
        <div class="form-group"><label>Photo</label><input type="file" id="cpl-photo" class="form-input" accept="image/*" capture="environment"></div>
      `, async () => {
        const batchId = document.getElementById('cpl-batch').value;
        const file = document.getElementById('cpl-photo').files[0];
        let photoId = null;
        if (file) {
          photoId = uid();
          const dataUrl = await compressImage(file);
          await AP.db.savePhoto(photoId, dataUrl);
        }
        AP.state.logs.push({
          id: uid(), copepodId: batchId, date: todayISO(), time: nowTime(),
          type: document.getElementById('cpl-type').value,
          notes: document.getElementById('cpl-notes').value,
          photoId: photoId
        });
        save('ap-logs', AP.state.logs);
        AP.closeModal();
        renderCopepods();
      });
    };
  };

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let w = img.width, h = img.height;
          if (w > 800) { h = Math.round((h * 800) / w); w = 800; }
          if (h > 800) { w = Math.round((w * 800) / h); h = 800; }
          canvas.width = w; canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
      };
    });
  };

  // ── EXPORT / IMPORT ───────────────────────────────────────────────────
  const handleExport = () => {
    const data = { species: AP.state.species, containers: AP.state.containers, tasks: AP.state.tasks, demands: AP.state.demands, logs: AP.state.logs, subDates: AP.state.subDates, lang: AP.state.lang };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `AlgaePlanner_${todayISO()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    AP.showToast(t('msg.exportSuccess'), 'success');
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (data.species) AP.state.species = data.species;
        if (data.containers) AP.state.containers = data.containers;
        if (data.tasks) AP.state.tasks = data.tasks;
        if (data.demands) AP.state.demands = data.demands;
        if (data.logs) AP.state.logs = data.logs;
        if (data.subDates) AP.state.subDates = data.subDates;
        if (data.lang) AP.state.lang = data.lang;
        saveAll();
        localStorage.setItem('ap-lang', AP.state.lang);
        applyI18n();
        AP.showToast(t('msg.importSuccess'), 'success');
      } catch {
        AP.showToast('Import failed!', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // ── INITIALIZATION ────────────────────────────────────────────────────
  const init = async () => {
    await AP.db.init();
    loadAll();

    // Set language
    applyI18n();
    
    // Workspaces
    renderWorkspaces();
    document.getElementById('workspace-select')?.addEventListener('change', (e) => switchWorkspace(e.target.value));
    document.getElementById('btn-new-workspace')?.addEventListener('click', createNewWorkspace);

    // Navigation
    document.querySelectorAll('.nav-item').forEach(el => {
      el.addEventListener('click', () => AP.navigateTo(el.getAttribute('data-page')));
    });

    // Sidebar toggle (mobile)
    document.getElementById('sidebar-toggle')?.addEventListener('click', () => {
      document.getElementById('sidebar').classList.toggle('open');
    });

    // Language toggle
    document.getElementById('lang-toggle')?.addEventListener('click', () => {
      AP.state.lang = AP.state.lang === 'zh' ? 'en' : 'zh';
      localStorage.setItem('ap-lang', AP.state.lang);
      applyI18n();
    });

    // Modal
    document.getElementById('modal-close')?.addEventListener('click', AP.closeModal);
    document.getElementById('modal-cancel')?.addEventListener('click', AP.closeModal);
    document.getElementById('modal-overlay')?.addEventListener('click', e => { if (e.target.id === 'modal-overlay') AP.closeModal(); });
    document.getElementById('modal-confirm')?.addEventListener('click', () => { if (_modalCb) _modalCb(); });

    // Calendar nav
    document.getElementById('cal-prev')?.addEventListener('click', () => { AP.state.calDate.setMonth(AP.state.calDate.getMonth() - 1); renderCalendar(); });
    document.getElementById('cal-next')?.addEventListener('click', () => { AP.state.calDate.setMonth(AP.state.calDate.getMonth() + 1); renderCalendar(); });
    document.getElementById('cal-today')?.addEventListener('click', () => { AP.state.calDate = new Date(); renderCalendar(); });
    document.getElementById('cal-generate')?.addEventListener('click', generateSchedule);
    document.getElementById('day-detail-close')?.addEventListener('click', closeDayDetail);

    // Page buttons
    document.getElementById('btn-add-species')?.addEventListener('click', () => openSpeciesModal());
    document.getElementById('btn-add-container')?.addEventListener('click', () => {
      const html = `
        <div class="form-row"><div class="form-group"><label>${t('inventory.name')} (中文)</label><input type="text" id="cont-zh" class="form-input"></div>
        <div class="form-group"><label>${t('inventory.name')} (EN)</label><input type="text" id="cont-en" class="form-input"></div></div>
        <div class="form-row"><div class="form-group"><label>Icon</label><input type="text" id="cont-icon" class="form-input" value="🧪" maxlength="4"></div>
        <div class="form-group"><label>${t('inventory.total')}</label><input type="number" id="cont-total" class="form-input" value="10" min="1"></div></div>`;
      AP.openModal(t('inventory.addType'), html, () => {
        AP.state.containers.push({
          id: uid(), nameZh: document.getElementById('cont-zh').value, nameEn: document.getElementById('cont-en').value,
          icon: document.getElementById('cont-icon').value || '🧪', total: parseInt(document.getElementById('cont-total').value) || 10, inUse: 0
        });
        save('ap-containers', AP.state.containers);
        renderInventory();
        AP.closeModal();
      });
    });
    document.getElementById('btn-add-demand')?.addEventListener('click', openDemandModal);
    document.getElementById('btn-add-log')?.addEventListener('click', openLogModal);

    // Demand tabs
    document.querySelectorAll('.tab-btn').forEach(b => {
      b.addEventListener('click', () => { AP.state.demandTab = b.getAttribute('data-tab'); renderDemand(); });
    });

    // Walne calculator
    document.getElementById('walne-volume')?.addEventListener('input', renderWalne);
    document.querySelectorAll('input[name="medium-type"]').forEach(r => r.addEventListener('change', renderWalne));
    document.querySelectorAll('.preset-btns button[data-volume]').forEach(b => {
      b.addEventListener('click', () => { document.getElementById('walne-volume').value = b.getAttribute('data-volume'); renderWalne(); });
    });

    // Log filters
    document.getElementById('log-filter-species')?.addEventListener('change', renderLog);
    document.getElementById('log-filter-type')?.addEventListener('change', renderLog);

    // Export / Import
    document.getElementById('btn-export')?.addEventListener('click', handleExport);
    document.getElementById('btn-import')?.addEventListener('click', () => document.getElementById('file-import').click());
    document.getElementById('file-import')?.addEventListener('change', handleImport);

    // Initial render
    AP.navigateTo('dashboard');
  };

  document.addEventListener('DOMContentLoaded', init);

})(window.AP);
