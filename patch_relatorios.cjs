const fs = require('fs');
let code = fs.readFileSync('src/components/RelatoriosModule.tsx', 'utf8');

// For the main table
code = code.replace(/<table className="w-full border-collapse border border-black text-left mb-8">/g, 
'<table className="w-full border-collapse border-[2px] border-black text-left mb-8 print:text-[16px]">');

// Make header thicker in print
code = code.replace(/<tr className="bg-gray-100">/g, 
'<tr className="bg-gray-100 print:border-b-2 print:border-black">');

// For all cells in this manual report, make border thicker in print (e.g., border-2 in print doesn't exist, we could use print:border-[1.5px])
code = code.replace(/border border-black/g, 'border border-black print:border-[1.5px] print:border-black');

// Specifically handle the AutoReportsViewer part. It's already handled in AutoReports.tsx

fs.writeFileSync('src/components/RelatoriosModule.tsx', code);
