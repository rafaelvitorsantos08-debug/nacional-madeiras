const fs = require('fs');
const filePath = 'src/components/RelatoriosModule.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Remove print:hidden from the main container
content = content.replace(
  '<div className="max-w-5xl mx-auto space-y-6 print:hidden">',
  '<div className="max-w-5xl mx-auto space-y-6">'
);

// 2. Wrap the header form in a print:hidden div
content = content.replace(
  '<div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">\n            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">',
  '<div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm print:hidden">\n            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">'
);

// 3. Make the auto reports title hidden in print
content = content.replace(
  '<h3 className="text-lg font-semibold text-gray-800 mb-4 text-transform: capitalize">',
  '<h3 className="text-lg font-semibold text-gray-800 mb-4 text-transform: capitalize print:hidden">'
);

// 4. Remove the background and border of the auto reports container in print
content = content.replace(
  '<div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">\n            <h3 className="text-lg font-semibold text-gray-800 mb-4 text-transform: capitalize print:hidden">',
  '<div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm print:border-none print:shadow-none print:bg-transparent print:p-0">\n            <h3 className="text-lg font-semibold text-gray-800 mb-4 text-transform: capitalize print:hidden">'
);

// 5. Hide the avarias or items inputs in print
content = content.replace(
  '{reportType === "avarias" && (',
  '<div className="print:hidden">\n            {reportType === "avarias" && ('
);
content = content.replace(
  '{!isAutoReport(reportType) && items.length > 0 && (',
  '{!isAutoReport(reportType) && items.length > 0 && ('
); // wait, that doesn't close the div. 
