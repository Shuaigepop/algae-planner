const fs = require('fs');
const file = 'C:/Users/DESMOND/.gemini/antigravity/scratch/algae-planner/app.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/\$\{photoHtml\}\r?\n\s*<\/div>`;/g, 
`\${photoHtml}
          <div class="log-actions" style="margin-top:8px;">
            <button class="btn-icon" onclick="AP.editLog('\${l.id}')" title="\${t('common.edit')}">✏️</button>
            <button class="btn-icon" onclick="AP.deleteLog('\${l.id}')" title="\${t('common.delete')}">🗑️</button>
          </div>
        </div>\`;`);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed copepod logs.');
