const fs = require('fs');
let code = fs.readFileSync('src/components/RelatoriosModule.tsx', 'utf8');

const regexHeader = /\{reportType === "avarias" && \(\n\s*<div className="flex flex-col items-end text-right">\n\s*<h2 className="text-2xl font-black text-gray-800 tracking-tighter leading-none">Nacional Madeiras<\/h2>\n\s*<span className="text-xl font-bold text-gray-500 uppercase tracking-widest mt-1">Kit Porta<\/span>\n\s*<\/div>\n\s*\)\}/;

const replacementHeader = `{reportType === "avarias" && (
                  <div className="flex flex-col items-end text-right" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                    <h2 className="text-2xl font-black tracking-tighter leading-none text-[#166534] print:text-[#166534]">Nacional Madeiras</h2>
                    <span className="text-xl font-bold uppercase tracking-widest mt-1 text-[#475569] print:text-[#475569]">Kit Porta</span>
                  </div>
                )}`;

code = code.replace(regexHeader, replacementHeader);

fs.writeFileSync('src/components/RelatoriosModule.tsx', code);
