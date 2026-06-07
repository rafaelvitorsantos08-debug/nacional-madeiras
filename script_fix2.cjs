const fs = require('fs');

let content = fs.readFileSync('src/components/AutoReports.tsx', 'utf8');

content = content.replace(/dark:bg-gray-900 print:bg-gray-50 dark:bg-gray-900 print:bg-gray-50/g, 'dark:bg-gray-900 print:bg-gray-50');

fs.writeFileSync('src/components/AutoReports.tsx', content);
