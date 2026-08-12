const fs = require('fs');
let code = fs.readFileSync('src/components/AutoReports.tsx', 'utf8');

// For tr borders
code = code.replace(/border-b border-gray-300 break-inside-avoid/g, 'border-b border-gray-300 print:border-black break-inside-avoid');

// For opening tr Abertura Header
code = code.replace(/border-t border-gray-300 w-full break-inside-avoid/g, 'border-t border-gray-300 print:border-black w-full break-inside-avoid');

// For block headers (QTD, FOLHA, etc)
code = code.replace(/print:border-y print:border-black print:text-black font-semibold uppercase/g, 'print:border-y print:border-black print:text-black font-semibold uppercase');
// Check if print:border-y is there
code = code.replace(/print:border-y print:border-gray-300/g, 'print:border-y print:border-black');

// Check the Abertura Header
code = code.replace(/<td colSpan=\{totalCols\} className="px-3 py-2 text-center font-bold text-sm uppercase text-black dark:text-white print:text-black border-transparent print:border-transparent">/g, 
'<td colSpan={totalCols} className="px-3 py-2 text-center font-bold text-[14px] sm:text-[16px] print:text-[18px] uppercase text-black dark:text-white print:text-black border-y print:border-black">');

code = code.replace(/print:border-transparent font-medium/g, 'print:border-black font-medium');

// Also, the main title tables etc.
code = code.replace(/border-\[1\.5px\] border-black print:border-black/g, 'border-[2px] border-black print:border-black');
code = code.replace(/border-b-2 border-black pb-4 mb-4 mt-2 print:border-black/g, 'border-b-[2px] border-black pb-4 mb-4 mt-2 print:border-black');

fs.writeFileSync('src/components/AutoReports.tsx', code);
