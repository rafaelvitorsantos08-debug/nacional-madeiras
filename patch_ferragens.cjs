const fs = require('fs');
let code = fs.readFileSync('src/components/FerragensModule.tsx', 'utf8');

const regexFerragens = /<div className="hidden print:block mb-8 p-6 pb-0">\s*<h2 className="text-2xl font-bold mb-2">Relatório de Lançamentos - \{selectedObra\}<\/h2>\s*<p className="text-gray-500">Tipo: \{historyFilter === 'entrada' \? 'Entradas' : historyFilter === 'saida' \? 'Saídas' : 'Todos'\} \| Data: \{new Date\(\)\.toLocaleDateString\('pt-BR'\)\}<\/p>\s*<\/div>/;

const replacementFerragens = `<div className="hidden print:block mb-4 p-6 pb-0" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
           <div className="flex flex-col mb-4">
             <span className="font-bold text-[#166534] text-2xl leading-tight uppercase print:text-[#166534]">Nacional Madeiras</span>
             <span className="font-bold text-[#475569] text-sm tracking-widest uppercase mt-1 print:text-[#475569]">Kit Porta</span>
           </div>
           <h2 className="text-2xl font-bold mb-1">Relatório de Lançamentos - {selectedObra}</h2>
           <p className="text-gray-500 font-medium">Tipo: {historyFilter === 'entrada' ? 'Entradas' : historyFilter === 'saida' ? 'Saídas' : 'Todos'} | Data: {new Date().toLocaleDateString('pt-BR')}</p>
        </div>`;

code = code.replace(regexFerragens, replacementFerragens);
fs.writeFileSync('src/components/FerragensModule.tsx', code);
