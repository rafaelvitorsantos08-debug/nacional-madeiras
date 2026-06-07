const fs = require('fs');
let content = fs.readFileSync('src/components/LancamentosRelatoriosModule.tsx', 'utf8');

content = content.replace(/bg-\[\#e2efda\]/g, 'bg-[#e2efda] dark:bg-emerald-900/40');
// The regex below might fail if it's already there
content = content.replace(/className="bg-\[\#e2efda\] dark:bg-emerald-900\/40 text-xs uppercase text-gray-800 /g, 'className="bg-[#e2efda] dark:bg-emerald-900/40 text-xs uppercase text-gray-800 dark:text-emerald-100 ');

content = content.replace(/border-\[\#c2d6b3\]/g, 'border-[#c2d6b3] dark:border-emerald-800/40');
content = content.replace(/border-gray-200/g, 'border-gray-200 dark:border-gray-700');
content = content.replace(/border-gray-300/g, 'border-gray-300 dark:border-gray-600');
content = content.replace(/bg-white/g, 'bg-white dark:bg-gray-800');
content = content.replace(/hover:bg-gray-50/g, 'hover:bg-gray-50 dark:hover:bg-gray-700');
content = content.replace(/bg-gray-50/g, 'bg-gray-50 dark:bg-gray-900');
content = content.replace(/text-green-700/g, 'text-green-700 dark:text-emerald-400');
// Some text colors might already be overridden by index.css,. but let's be safe.
// Let's replace only the `text-gray-800 flex` part for the title.
content = content.replace(/text-gray-800/g, 'text-gray-800 dark:text-gray-100');

fs.writeFileSync('src/components/LancamentosRelatoriosModule.tsx', content);
