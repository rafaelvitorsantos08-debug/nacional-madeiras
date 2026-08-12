const fs = require('fs');
let code = fs.readFileSync('src/components/AutoReports.tsx', 'utf8');

// Remove the PrintableTextarea component
code = code.replace(/function PrintableTextarea\(\) \{[\s\S]*?\}\nexport function renderAutoMontagem/, 'export function renderAutoMontagem');

// Put back the contentEditable div
code = code.replace(/<PrintableTextarea \/>/g, `<div
                contentEditable
                suppressContentEditableWarning
                className="min-h-[100px] w-full border-[1.5px] border-gray-300 dark:border-gray-600 print:border-black p-2 outline-none rounded text-sm text-black dark:text-white print:text-black bg-white dark:bg-gray-800 print:bg-transparent focus:ring-1 focus:ring-gray-500"
              />`);

fs.writeFileSync('src/components/AutoReports.tsx', code);
