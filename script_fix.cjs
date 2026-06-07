const fs = require('fs');

let content = fs.readFileSync('src/components/AutoReports.tsx', 'utf8');

content = content.replace(/hover:bg-gray-50 dark:bg-gray-900 print:bg-gray-50 dark:hover:bg-gray-700 print:hover:bg-transparent/g, 'hover:bg-gray-50 dark:hover:bg-gray-700 print:hover:bg-transparent');

// Let's check for other similar mistakes.
// what about `text-emerald-700` being replaced again? No, I just ran once.
// what about `bg-white`? hover:bg-white doesn't exist.

fs.writeFileSync('src/components/AutoReports.tsx', content);
