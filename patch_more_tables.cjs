const fs = require('fs');
let code = fs.readFileSync('src/components/AutoReports.tsx', 'utf8');

// Add print:text-[16px] where missing on these tables
code = code.replace(/text-\[11px\] sm:text-xs bg-white print:bg-white/g, 'text-[11px] sm:text-[14px] print:text-[16px] bg-white print:bg-white');
code = code.replace(/text-\[11px\] sm:text-sm print:border-y print:border-black/g, 'text-[11px] sm:text-[14px] print:text-[16px] print:border-y print:border-black');

// For small text elements in tables
code = code.replace(/text-gray-500 text-\[11px\] font-medium/g, 'text-gray-500 text-[11px] print:text-[14px] font-medium print:text-black');
code = code.replace(/text-transparent text-\[11px\]/g, 'text-transparent text-[11px] print:text-[14px]');

// Also fix some text-xs -> text-[14px] in print
code = code.replace(/text-xs print:text-black/g, 'text-[12px] print:text-[14px] print:text-black');
code = code.replace(/text-xs text-black print:text-black/g, 'text-[12px] print:text-[14px] text-black print:text-black');
code = code.replace(/text-xs uppercase text-gray-600 font-bold print:text-gray-600/g, 'text-[12px] print:text-[14px] uppercase text-gray-600 font-bold print:text-black');

// Fix text-[8.5px] to be legible in print
code = code.replace(/text-\[8\.5px\] uppercase print:text-black/g, 'text-[8.5px] print:text-[12px] uppercase print:text-black');

// Fix text-[9px] to be legible in print
code = code.replace(/text-\[9px\] uppercase px-2 py-1\.5 flex items-center justify-center text-gray-700 dark:text-gray-300 print:text-black/g, 'text-[9px] print:text-[13px] uppercase px-2 py-1.5 flex items-center justify-center text-gray-700 dark:text-gray-300 print:text-black');

// Fix text-[12px] headers in some specific tables
code = code.replace(/text-\[12px\] text-gray-900 dark:text-gray-100 print:text-black/g, 'text-[12px] print:text-[16px] text-gray-900 dark:text-gray-100 print:text-black');
code = code.replace(/text-\[9px\] w-1\/2 text-gray-800 dark:text-gray-200 print:text-black/g, 'text-[9px] print:text-[14px] w-1/2 text-gray-800 dark:text-gray-200 print:text-black');

// Any stray "text-sm uppercase mb-4 print:bg-transparent print:text-black"
code = code.replace(/text-sm uppercase mb-4 print:bg-transparent print:text-black/g, 'text-sm print:text-[18px] uppercase mb-4 print:bg-transparent print:text-black');

// The relatorio headers (cliente, obra, resp)
code = code.replace(/font-medium text-lg print:text-black uppercase text-black/g, 'font-medium text-lg print:text-[20px] print:text-black uppercase text-black');
code = code.replace(/font-medium text-lg print:text-black text-black/g, 'font-medium text-lg print:text-[20px] print:text-black text-black');

fs.writeFileSync('src/components/AutoReports.tsx', code);
