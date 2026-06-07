const fs = require('fs');
let content = fs.readFileSync('src/components/LancamentosRelatoriosModule.tsx', 'utf8');

content = content.replace(/bg-emerald-50\/30/g, 'bg-emerald-50/30 dark:bg-emerald-900/10');
content = content.replace(/border-emerald-100/g, 'border-emerald-100 dark:border-emerald-800/30');
content = content.replace(/border-emerald-200/g, 'border-emerald-200 dark:border-emerald-700/50');
content = content.replace(/text-emerald-800/g, 'text-emerald-800 dark:text-emerald-500');

fs.writeFileSync('src/components/LancamentosRelatoriosModule.tsx', content);
