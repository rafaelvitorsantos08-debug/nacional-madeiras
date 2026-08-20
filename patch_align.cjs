const fs = require('fs');
const filePath = 'src/components/AutoReports.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// The problematic code is:
/*
<tr className="bg-[#0f172a] text-white print:bg-gray-200 print:border-y print:border-black font-semibold uppercase break-inside-avoid print:shadow-none text-black-print-important">
                        <th className="px-3 py-2 text-center whitespace-nowrap border-x border-[#1e293b] print:border-black print:text-[14px]">QTD</th>
                        <th className="px-3 py-2 text-center whitespace-nowrap border-x border-[#1e293b] print:border-black print:text-[14px]">FOLHA DE PORTA</th>
                        ...
*/

// We need to add align-middle to the THs. Wait, text-center is already there. Why is it not vertically aligned?
// Vertical align middle: align-middle
const targetStr = `<tr className="bg-[#0f172a] text-white print:bg-gray-200 print:border-y print:border-black font-semibold uppercase break-inside-avoid print:shadow-none text-black-print-important">
                        <th className="px-3 py-2 text-center whitespace-nowrap border-x border-[#1e293b] print:border-black print:text-[14px]">QTD</th>
                        <th className="px-3 py-2 text-center whitespace-nowrap border-x border-[#1e293b] print:border-black print:text-[14px]">FOLHA DE PORTA</th>
                        <th className="px-3 py-2 text-center whitespace-nowrap border-x border-[#1e293b] print:border-black print:text-[14px]">CARACTERÍSTICAS</th>
                        <th className="px-3 py-2 text-center whitespace-nowrap border-x border-[#1e293b] print:border-black print:text-[14px]">ACABAMENTO</th>
                        <th className="px-3 py-2 text-center whitespace-nowrap border-x border-[#1e293b] print:border-black print:text-[14px]">INFO. ADUELA</th>
                        <th className="px-3 py-2 text-center whitespace-nowrap border-x border-[#1e293b] print:border-black print:text-[14px]">FECH. GRID</th>
                        <th className="px-3 py-2 text-center whitespace-nowrap border-x border-[#1e293b] print:border-black print:text-[14px]">DOBRADIÇAS</th>
                        {showBits && <th className="px-3 py-2 text-center whitespace-nowrap border-x border-[#1e293b] print:border-black print:text-[14px]">BITS</th>}
                        {showCorrer && <th className="px-3 py-2 text-center whitespace-nowrap border-x border-[#1e293b] print:border-black print:text-[14px]">CORRER</th>}
                        {showVen && <th className="px-3 py-2 text-center whitespace-nowrap border-x border-[#1e293b] print:border-black print:text-[14px]">VENEZIANA</th>}
                        {showGre && <th className="px-3 py-2 text-center whitespace-nowrap border-x border-[#1e293b] print:border-black print:text-[14px]">GRELHA</th>}
                        {showBand && <th className="px-3 py-2 text-center whitespace-nowrap border-x border-[#1e293b] print:border-black print:text-[14px]">BANDEIRA</th>}
                        {showPiv && <th className="px-3 py-2 text-center whitespace-nowrap border-x border-[#1e293b] print:border-black print:text-[14px]">PIVOTANTE</th>}
                        {showFf && <th className="px-3 py-2 text-center whitespace-nowrap border-x border-[#1e293b] print:border-black print:text-[14px]">FECHA FRESTA</th>}
                        {showVid && <th className="px-3 py-2 text-center whitespace-nowrap border-x border-[#1e293b] print:border-black print:text-[14px]">COM VIDRO</th>}
                        <th className="px-3 py-2 text-center whitespace-nowrap border-x border-[#1e293b] print:border-black print:text-[14px]">CONCLUÍDO</th>
                      </tr>`;

const newStr = `<tr className="bg-[#0f172a] text-white print:bg-gray-200 print:border-y print:border-black font-semibold uppercase break-inside-avoid print:shadow-none text-black-print-important">
                        <th className="px-3 py-2 text-center align-middle whitespace-nowrap border-x border-[#1e293b] print:border-black print:text-[14px]">QTD</th>
                        <th className="px-3 py-2 text-center align-middle whitespace-nowrap border-x border-[#1e293b] print:border-black print:text-[14px]">FOLHA DE PORTA</th>
                        <th className="px-3 py-2 text-center align-middle whitespace-nowrap border-x border-[#1e293b] print:border-black print:text-[14px]">CARACTERÍSTICAS</th>
                        <th className="px-3 py-2 text-center align-middle whitespace-nowrap border-x border-[#1e293b] print:border-black print:text-[14px]">ACABAMENTO</th>
                        <th className="px-3 py-2 text-center align-middle whitespace-nowrap border-x border-[#1e293b] print:border-black print:text-[14px]">INFO. ADUELA</th>
                        <th className="px-3 py-2 text-center align-middle whitespace-nowrap border-x border-[#1e293b] print:border-black print:text-[14px]">FECH. GRID</th>
                        <th className="px-3 py-2 text-center align-middle whitespace-nowrap border-x border-[#1e293b] print:border-black print:text-[14px]">DOBRADIÇAS</th>
                        {showBits && <th className="px-3 py-2 text-center align-middle whitespace-nowrap border-x border-[#1e293b] print:border-black print:text-[14px]">BITS</th>}
                        {showCorrer && <th className="px-3 py-2 text-center align-middle whitespace-nowrap border-x border-[#1e293b] print:border-black print:text-[14px]">CORRER</th>}
                        {showVen && <th className="px-3 py-2 text-center align-middle whitespace-nowrap border-x border-[#1e293b] print:border-black print:text-[14px]">VENEZIANA</th>}
                        {showGre && <th className="px-3 py-2 text-center align-middle whitespace-nowrap border-x border-[#1e293b] print:border-black print:text-[14px]">GRELHA</th>}
                        {showBand && <th className="px-3 py-2 text-center align-middle whitespace-nowrap border-x border-[#1e293b] print:border-black print:text-[14px]">BANDEIRA</th>}
                        {showPiv && <th className="px-3 py-2 text-center align-middle whitespace-nowrap border-x border-[#1e293b] print:border-black print:text-[14px]">PIVOTANTE</th>}
                        {showFf && <th className="px-3 py-2 text-center align-middle whitespace-nowrap border-x border-[#1e293b] print:border-black print:text-[14px]">FECHA FRESTA</th>}
                        {showVid && <th className="px-3 py-2 text-center align-middle whitespace-nowrap border-x border-[#1e293b] print:border-black print:text-[14px]">COM VIDRO</th>}
                        <th className="px-3 py-2 text-center align-middle whitespace-nowrap border-x border-[#1e293b] print:border-black print:text-[14px]">CONCLUÍDO</th>
                      </tr>`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, newStr);
  fs.writeFileSync(filePath, content);
  console.log("Patched align");
} else {
  console.log("Could not find target string");
}

