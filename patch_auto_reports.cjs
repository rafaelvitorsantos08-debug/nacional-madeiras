const fs = require('fs');
let code = fs.readFileSync('src/components/AutoReports.tsx', 'utf8');

const regexAuto = /<div>\s*<h1 className="text-3xl font-bold uppercase tracking-tight text-black print:text-black mt-4">RELATÓRIO DE MONTAGEM<\/h1>\s*<\/div>/;

const replacementAuto = `<div>
                         <div className="flex flex-col items-start mb-2" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                           <h2 className="text-2xl font-black tracking-tighter leading-none text-[#166534] print:text-[#166534] uppercase">Nacional Madeiras</h2>
                           <span className="text-xl font-bold uppercase tracking-widest mt-1 text-[#475569] print:text-[#475569]">Kit Porta</span>
                         </div>
                         <h1 className="text-3xl font-bold uppercase tracking-tight text-black print:text-black mt-4">RELATÓRIO DE MONTAGEM</h1>
                       </div>`;

code = code.replace(regexAuto, replacementAuto);
fs.writeFileSync('src/components/AutoReports.tsx', code);
