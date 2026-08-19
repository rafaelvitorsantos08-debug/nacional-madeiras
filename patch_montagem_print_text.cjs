const fs = require('fs');
const filePath = 'src/components/AutoReports.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// The issue is print:text-white is missing or overriden by text-white against a light background, or the print:text-black is there but overridden by text-white. 
// Looking at the previous patch: className="bg-[#0f172a] text-white print:bg-gray-100 print:border-y print:border-black print:text-black font-semibold uppercase break-inside-avoid shadow-[0_1px_0_1px_#cbd5e1] print:shadow-none"

// We will change the row text color to strictly be black on print, and also explicitly set color: black in style just to be absolutely certain.

const targetStr = `                      {/* CABEÇALHO DAS COLUNAS */}
                      <tr className="bg-[#0f172a] text-white print:bg-gray-100 print:border-y print:border-black print:text-black font-semibold uppercase break-inside-avoid shadow-[0_1px_0_1px_#cbd5e1] print:shadow-none" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>`;

const newStr = `                      {/* CABEÇALHO DAS COLUNAS */}
                      <tr className="bg-[#0f172a] text-white print:bg-gray-200 print:border-y print:border-black font-semibold uppercase break-inside-avoid print:shadow-none text-black-print-important">`;

// Also need to add the css class to the style block:
const cssTarget = `            table, th, td, tr {
              border-color: #000000 !important;
            }`;

const cssNew = `            table, th, td, tr {
              border-color: #000000 !important;
            }
            .text-black-print-important, .text-black-print-important th {
              color: #000000 !important;
            }`;


if (content.includes(targetStr) && content.includes(cssTarget)) {
  content = content.replace(targetStr, newStr);
  content = content.replace(cssTarget, cssNew);
  fs.writeFileSync(filePath, content);
  console.log("Patched table headers color for print to force black text");
} else {
  console.log("Could not find table headers");
}

