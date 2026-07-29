const fs = require('fs');
const file = 'C:/Users/DESMOND/.gemini/antigravity/scratch/algae-planner/app.js';
let content = fs.readFileSync(file, 'utf8');

// 1. Add AP.editLog and update AP.deleteLog
const deleteLogStr = `  AP.deleteLog = (id) => {
    if (!confirm(t('msg.confirmDelete'))) return;
    AP.state.logs = AP.state.logs.filter(l => l.id !== id);
    save('ap-logs', AP.state.logs);
    renderLog();
  };`;

const newDeleteLogStr = `  AP.deleteLog = (id) => {
    if (!confirm(t('msg.confirmDelete'))) return;
    AP.state.logs = AP.state.logs.filter(l => l.id !== id);
    save('ap-logs', AP.state.logs);
    renderLog();
    if (window.location.hash === '#copepods' || document.getElementById('page-copepods').classList.contains('active')) {
      renderCopepods();
    }
  };

  AP.editLog = (id) => {
    const l = AP.state.logs.find(x => x.id === id);
    if (!l) return;
    const isAlgae = !!l.speciesId;

    const html = \`
      <div class="form-group">
        <label>Target (目标)</label>
        <div style="display:flex;gap:12px;margin-bottom:8px;">
          <label style="display:flex;align-items:center;gap:4px;"><input type="radio" name="log-target" value="algae" \${isAlgae ? 'checked' : ''} style="accent-color:var(--primary)"> Algae (藻类)</label>
          <label style="display:flex;align-items:center;gap:4px;"><input type="radio" name="log-target" value="copepod" \${!isAlgae ? 'checked' : ''} style="accent-color:var(--primary)"> Copepods (桡足类)</label>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>\${AP.state.lang === 'zh' ? '日期' : 'Date'}</label><input type="date" id="log-date" class="form-input" value="\${l.date}"></div>
        <div class="form-group"><label>\${AP.state.lang === 'zh' ? '时间' : 'Time'}</label><input type="time" id="log-time" class="form-input" value="\${l.time}"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>\${AP.state.lang === 'zh' ? '类型' : 'Type'}</label>
          <select id="log-type" class="form-select"></select>
        </div>
        <div class="form-group"><label id="log-sp-label">\${t('demand.species')}</label><select id="log-sp" class="form-select"></select></div>
      </div>
      <div class="form-group"><label>\${AP.state.lang === 'zh' ? '状态' : 'Status'}</label>
        <select id="log-status" class="form-select">
          <option value="normal" \${l.status === 'normal' ? 'selected' : ''}>\${t('log.normal')} 🟢</option>
          <option value="warning" \${l.status === 'warning' ? 'selected' : ''}>\${t('log.warning')} 🟡</option>
          <option value="contaminated" \${l.status === 'contaminated' ? 'selected' : ''}>\${t('log.contaminated')} 🔴</option>
        </select>
      </div>
      <div class="form-group"><label>\${t('demand.notes')}</label><textarea id="log-notes" class="form-textarea" rows="2">\${l.notes || ''}</textarea></div>
      <div class="form-group"><label>Photo (Leave empty to keep current)</label><input type="file" id="log-photo" class="form-input" accept="image/*" capture="environment"></div>\`;
      
    AP.openModal(t('common.edit') || 'Edit', html, async () => {
      const target = document.querySelector('input[name="log-target"]:checked').value;
      const file = document.getElementById('log-photo').files[0];
      
      if (file) {
        l.photoId = uid();
        const dataUrl = await compressImage(file);
        await AP.db.savePhoto(l.photoId, dataUrl);
      }
      
      l.date = document.getElementById('log-date').value;
      l.time = document.getElementById('log-time').value;
      l.type = document.getElementById('log-type').value;
      l.status = document.getElementById('log-status').value;
      l.notes = document.getElementById('log-notes').value;
      
      if (target === 'algae') {
        l.speciesId = document.getElementById('log-sp').value;
        l.copepodId = null;
      } else {
        l.copepodId = document.getElementById('log-sp').value;
        l.speciesId = null;
      }
      
      save('ap-logs', AP.state.logs);
      renderLog();
      renderCopepods();
      AP.closeModal();
      AP.showToast(t('common.save'), 'success');
    });

    const typeSelect = document.getElementById('log-type');
    const spSelect = document.getElementById('log-sp');
    const spLabel = document.getElementById('log-sp-label');
    const radios = document.querySelectorAll('input[name="log-target"]');
    
    const updateDropdowns = () => {
      const target = document.querySelector('input[name="log-target"]:checked').value;
      if (target === 'algae') {
        spLabel.textContent = t('demand.species');
        spSelect.innerHTML = AP.state.species.map(s => \`<option value="\${s.id}">\${s.code} - \${s.name || s.scientific}</option>\`).join('');
        typeSelect.innerHTML = \`
          <option value="inoculate">\${t('task.inoculate')}</option>
          <option value="sterilize">\${t('task.sterilize')}</option>
          <option value="observe">\${AP.state.lang === 'zh' ? '观察' : 'Observe'}</option>
          <option value="contamination">\${AP.state.lang === 'zh' ? '污染' : 'Contamination'}</option>
          <option value="harvest">\${t('task.harvest')}</option>
        \`;
      } else {
        spLabel.textContent = 'Batch (批次)';
        spSelect.innerHTML = AP.state.copepods.map(c => \`<option value="\${c.id}">\${c.batchName}</option>\`).join('');
        typeSelect.innerHTML = \`
          <option value="feed">Feed (喂食)</option>
          <option value="water">Water Change (换水)</option>
          <option value="status">Status (状态)</option>
        \`;
      }
    };
    
    radios.forEach(r => r.addEventListener('change', updateDropdowns));
    updateDropdowns();
    
    // Select initial values
    if (l.speciesId) spSelect.value = l.speciesId;
    if (l.copepodId) spSelect.value = l.copepodId;
    typeSelect.value = l.type;
  };`;

content = content.replace(deleteLogStr, newDeleteLogStr);

// 2. Update log-actions in renderLog
content = content.replace(/<div class="log-actions"><button class="btn-icon" onclick="AP\.deleteLog\('\${l\.id}'\)" title="\${t\('common\.delete'\)}">.*?<\/button><\/div>/, 
  `<div class="log-actions">
            <button class="btn-icon" onclick="AP.editLog('\${l.id}')" title="\${t('common.edit')}">✏️</button>
            <button class="btn-icon" onclick="AP.deleteLog('\${l.id}')" title="\${t('common.delete')}">🗑️</button>
          </div>`);

// 3. Update log-actions in renderCopepods
// The current copepod render log is:
//         return \`<div class="log-entry">
//           <div class="log-date">\${shortDate(l.date)}<br/>\${l.time}</div>
//           <div class="log-type-badge">\${l.type}</div>
//           <div class="log-notes">\${l.notes || ''}</div>
//           \${photoHtml}
//         </div>\`;
const oldCopepodLogEntry = "          ${photoHtml}\\n        </div>`;";
const newCopepodLogEntry = `          \${photoHtml}
          <div class="log-actions" style="margin-top:8px;">
            <button class="btn-icon" onclick="AP.editLog('\${l.id}')" title="\${t('common.edit')}">✏️</button>
            <button class="btn-icon" onclick="AP.deleteLog('\${l.id}')" title="\${t('common.delete')}">🗑️</button>
          </div>
        </div>\`;`;
content = content.replace(oldCopepodLogEntry, newCopepodLogEntry);

fs.writeFileSync(file, content, 'utf8');
console.log('Patch complete.');
