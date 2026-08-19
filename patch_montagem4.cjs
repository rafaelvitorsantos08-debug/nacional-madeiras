const fs = require('fs');
const filePath = 'src/components/AutoReports.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

const targetStr = `                      {/* CABEÇALHO DAS COLUNAS */}
                      <tr className="bg-[#0f172a] text-white print:bg-transparent print:border-y print:border-black print:text-black font-semibold uppercase break-inside-avoid shadow-[0_1px_0_1px_#cbd5e1] print:shadow-none">`;

const newStr = `                      {/* CABEÇALHO DAS COLUNAS */}
                      <tr className="bg-[#0f172a] text-white print:bg-gray-100 print:border-y print:border-black print:text-black font-semibold uppercase break-inside-avoid shadow-[0_1px_0_1px_#cbd5e1] print:shadow-none" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, newStr);
  fs.writeFileSync(filePath, content);
  console.log("Patched table headers color for print");
} else {
  console.log("Could not find table headers");
}

