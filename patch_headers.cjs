const fs = require('fs');
let code = fs.readFileSync('src/components/ControleOperacaoModule.tsx', 'utf8');

// 1. ControleSaidas
const headerControle = `<div className="hidden print:block mb-4" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
          <div className="flex flex-col mb-4">
            <span className="font-bold text-[#166534] text-2xl leading-tight uppercase print:text-[#166534]">Nacional Madeiras</span>
            <span className="font-bold text-[#475569] text-sm tracking-widest uppercase mt-1 print:text-[#475569]">Kit Porta</span>
          </div>
          <div className="text-xl font-bold text-gray-800 mt-2">
            Controle x Operação - {MESES[selecionadoMes]} {selecionadoAno}
          </div>
        </div>`;
code = code.replace(/<div className="hidden print:block text-xl font-bold text-gray-800 mt-2">\s*\{MESES\[selecionadoMes\]\} \{selecionadoAno\}\s*<\/div>/, headerControle);

// 2. OperacaoProducao
const headerOperacao = `<div className="hidden print:block mb-4" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
          <div className="flex flex-col mb-4">
            <span className="font-bold text-[#166534] text-2xl leading-tight uppercase print:text-[#166534]">Nacional Madeiras</span>
            <span className="font-bold text-[#475569] text-sm tracking-widest uppercase mt-1 print:text-[#475569]">Kit Porta</span>
          </div>
          <div className="text-xl font-bold text-gray-800 mt-2">
            Operação da Produção - {MESES[selecionadoMes]} {selecionadoAno}
          </div>
        </div>`;
code = code.replace(/<div className="hidden print:block text-xl font-bold text-gray-800 mt-2">\s*\{MESES\[selecionadoMes\]\} \{selecionadoAno\}\s*<\/div>/, headerOperacao);

// 3. EntradaObras
const regexEntrada = /(<div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex-1 flex flex-col min-h-0">[\s\S]*?<div className="flex-1 overflow-auto">)/;
const headerEntrada = `<div className="hidden print:block mb-4" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                 <div className="flex flex-col mb-4">
                   <span className="font-bold text-[#166534] text-2xl leading-tight uppercase print:text-[#166534]">Nacional Madeiras</span>
                   <span className="font-bold text-[#475569] text-sm tracking-widest uppercase mt-1 print:text-[#475569]">Kit Porta</span>
                 </div>
                 <div className="text-xl font-bold text-gray-800 mt-2">
                   Entrada de Obras - {activeObra.nome}
                 </div>
              </div>\n              $1`;
code = code.replace(regexEntrada, headerEntrada);

// 4. SaidasObras
const regexSaidas = /(<div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-x-auto print:overflow-visible w-full">[\s\S]*?<table)/;
const headerSaidas = `<div className="hidden print:block mb-4" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                 <div className="flex flex-col mb-4">
                   <span className="font-bold text-[#166534] text-2xl leading-tight uppercase print:text-[#166534]">Nacional Madeiras</span>
                   <span className="font-bold text-[#475569] text-sm tracking-widest uppercase mt-1 print:text-[#475569]">Kit Porta</span>
                 </div>
                 <div className="text-xl font-bold text-gray-800 mt-2">
                   Expedição - {activeObra.nome} ({activeCategoryTab.toUpperCase()})
                 </div>
              </div>\n              $1`;
code = code.replace(regexSaidas, headerSaidas);

fs.writeFileSync('src/components/ControleOperacaoModule.tsx', code);
