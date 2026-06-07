const fs = require('fs');
let content = fs.readFileSync('src/components/AutoReports.tsx', 'utf8');

content = content
  .replace(/text-black/g, 'text-gray-900 dark:text-gray-100 print:text-black')
  .replace(/border-black/g, 'border-gray-800 dark:border-gray-600 print:border-black')
  .replace(/divide-black/g, 'divide-gray-800 dark:divide-gray-600 print:divide-black')
  .replace(/bg-gray-100/g, 'bg-gray-100 dark:bg-gray-700 print:bg-gray-100')
  .replace(/bg-white/g, 'bg-white dark:bg-gray-800 print:bg-white')
  .replace(/hover:bg-gray-50/g, 'hover:bg-gray-50 dark:hover:bg-gray-700 print:hover:bg-transparent')
  .replace(/bg-gray-50"/g, 'bg-gray-50 dark:bg-gray-900 print:bg-gray-50"')
  .replace(/bg-gray-50 /g, 'bg-gray-50 dark:bg-gray-900 print:bg-gray-50 ')
  .replace(/text-green-700/g, 'text-emerald-700 dark:text-emerald-400 print:text-green-700')
  .replace(/bg-gray-200/g, 'bg-gray-200 dark:bg-gray-600 print:bg-gray-200');

// Fix duplicates created if it was run twice, just in case
content = content.replace(/dark:text-gray-100 dark:text-gray-100/g, 'dark:text-gray-100');

fs.writeFileSync('src/components/AutoReports.tsx', content);
