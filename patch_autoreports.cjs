const fs = require('fs');
let code = fs.readFileSync('src/components/AutoReports.tsx', 'utf8');

// Replace standard font sizes for print
code = code.replace(/text-\[11px\] sm:text-sm print:text-sm/g, 'text-[11px] sm:text-sm print:text-[16px]');
code = code.replace(/text-sm print:text-sm/g, 'text-sm print:text-[16px]');

// Find places that have print:border-transparent but they are table cells/headers, 
// and change them to print:border-black to make the grid strong.
code = code.replace(/print:border-transparent font-medium/g, 'print:border-black font-medium');
code = code.replace(/border-[#1e293b] print:border-transparent/g, 'border-[#1e293b] print:border-black');
code = code.replace(/print:divide-gray-300/g, 'print:divide-black');

// For the main table header
code = code.replace(/print:border-transparent print:border-transparent/g, 'print:border-black');
code = code.replace(/border-transparent print:border-transparent/g, 'border-transparent print:border-black');

// Also the "QTD", "FOLHA DE PORTA", etc. headers
// These are currently text-sm or text-[9px]. Let's just ensure print:text-[14px] or larger is applied to the th elements.
code = code.replace(/<th className="px-3 py-2 text-center whitespace-nowrap border-x border-\[#1e293b\] print:border-black/g, '<th className="px-3 py-2 text-center whitespace-nowrap border-x border-[#1e293b] print:border-black print:text-[14px]');

// Fix the body cells which have: className="px-3 py-2 text-center border-x border-gray-200 print:border-gray-300 font-medium"
// We already replaced print:border-gray-300 with print:border-black earlier, let's make sure
code = code.replace(/print:border-gray-300/g, 'print:border-black');

// The main container border in TableLayout
code = code.replace(/print:border-transparent rounded overflow-x-auto shadow-sm/g, 'print:border-black print:border rounded overflow-x-auto shadow-sm');

// Abertura Header has `text-sm uppercase text-black dark:text-white print:text-black border-transparent print:border-transparent` (or something similar)
code = code.replace(/text-sm uppercase text-black dark:text-white print:text-black border-transparent print:border-transparent/g, 'text-[14px] sm:text-[16px] print:text-[18px] uppercase text-black dark:text-white print:text-black print:border-black border-y');

fs.writeFileSync('src/components/AutoReports.tsx', code);
