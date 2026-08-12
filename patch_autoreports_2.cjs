const fs = require('fs');
let code = fs.readFileSync('src/components/AutoReports.tsx', 'utf8');

// For TableLayout table tag
code = code.replace(/<table className="min-w-full divide-y divide-gray-300 dark:divide-gray-600 print:divide-black text-\[11px\] sm:text-sm print:border-y print:border-black">/g, 
'<table className="min-w-full divide-y divide-gray-300 dark:divide-gray-600 print:divide-black text-[11px] sm:text-sm print:text-[16px] print:border-y print:border-black">');

// For TableLayout th tag: replace print:border-transparent with print:border-black print:text-[14px]
code = code.replace(/border-x border-\[#1e293b\] print:border-transparent/g, 'border-x border-[#1e293b] print:border-black print:text-[14px]');

// Find all `border-gray-200 print:border-gray-300` or `print:border-gray-200`
code = code.replace(/print:border-gray-200/g, 'print:border-black');

// For Abertura Header, try to replace if it wasn't matched
code = code.replace(/<td colSpan=\{totalCols\} className="px-3 py-2 text-center font-bold text-sm uppercase text-black dark:text-white print:text-black border-transparent print:border-black">/g, 
'<td colSpan={totalCols} className="px-3 py-2 text-center font-bold text-[14px] sm:text-[16px] print:text-[18px] uppercase text-black dark:text-white print:text-black print:border-black border-y">');

code = code.replace(/<td colSpan=\{totalCols\} className="px-3 py-2 text-center font-bold text-sm uppercase text-black dark:text-white print:text-black border-transparent print:border-transparent">/g, 
'<td colSpan={totalCols} className="px-3 py-2 text-center font-bold text-[14px] sm:text-[16px] print:text-[18px] uppercase text-black dark:text-white print:text-black print:border-black border-y">');

fs.writeFileSync('src/components/AutoReports.tsx', code);
