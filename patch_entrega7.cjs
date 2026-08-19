const fs = require('fs');
const filePath = 'src/components/AutoReports.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

const coverPageOld = `            {/* COVER PAGE */}
            <div className="flex flex-col h-full min-h-[85vh] print:h-full print:min-h-[95vh] pt-12" style={{ pageBreakAfter: 'always' }}>
              
              {/* QUANTIDADE TOTAL HIGHLIGHT */}
              <div className="flex flex-col mt-4 mb-6 print:mt-8 print:mb-10">
                <div className="text-xl print:text-2xl font-bold text-gray-800 print:text-black uppercase tracking-wide">
                  QUANTIDADE TOTAL: {totalBloco} KITS
                </div>
              </div>

              {/* BLOCO HIGHLIGHT */}
              <div className="flex-1 flex flex-col items-center justify-center space-y-4 mb-4">
                 {(blocoName !== '0' && blocoName !== 'SEM BLOCO' && blocoName.trim() !== '') && (
                   <h2 className="text-4xl print:text-5xl font-black uppercase text-gray-800 print:text-black border-[3px] border-gray-600 print:border-black px-10 py-6 shadow-sm print:shadow-none bg-[#1e293b] print:bg-transparent text-white print:text-black min-w-[180px] text-center">
                     <EditableText>{blocoName.toUpperCase().includes('BLOCO') ? blocoName : \`BLOCO \${blocoName}\`}</EditableText>
                   </h2>
                 )}
              </div>

              {/* ASSINATURAS (ANCHORED AT BOTTOM) */}
              <div className="mt-auto pt-16 pb-8 grid grid-cols-2 gap-16 text-center">
                <div className="flex flex-col items-center">
                  <div className="w-full border-b-[2px] border-black print:border-black mb-2"></div>
                  <span className="font-bold text-gray-800 print:text-black text-lg print:text-xl uppercase"><EditableText>{obra || 'Nome da Obra'}</EditableText></span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-full border-b-[2px] border-black print:border-black mb-2"></div>
                  <span className="font-bold text-gray-800 print:text-black text-lg print:text-xl uppercase">NACIONAL MADEIRAS</span>
                </div>
              </div>
            </div>`;

const coverPageNew = `            {/* COVER PAGE */}
            <div className="flex flex-col h-full min-h-[85vh] print:h-full print:min-h-[95vh] pt-4" style={{ pageBreakAfter: 'always' }}>
              {/* HEADER NATIVO DO SISTEMA INCLUÍDO NA CAPA */}
              <div className="flex justify-between items-start mb-6 print:mb-8 border-b-2 border-gray-300 print:border-black pb-4">
                <div className="flex flex-col">
                  <h2 className="text-2xl font-black tracking-tighter leading-none text-[#166534] print:text-[#166534] uppercase">RELATÓRIO DE ENTREGA</h2>
                  <span className="text-sm font-semibold tracking-wide mt-1 text-[#475569] print:text-black">Documento Gerado Via Sistema - Nacional Madeiras</span>
                  <span className="text-sm font-semibold tracking-wide text-[#475569] print:text-black">Data: {simpleDate}</span>
                </div>
                <div className="text-right flex flex-col items-end">
                   <h2 className="text-xl font-bold tracking-tighter leading-none text-[#166534] print:text-[#166534] uppercase">NACIONAL MADEIRAS</h2>
                   <span className="text-sm font-semibold tracking-wide mt-1 text-[#475569] print:text-[#475569] uppercase">KIT PORTA</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="border border-gray-300 print:border-black p-2">
                  <div className="text-[10px] text-gray-500 uppercase font-bold">CLIENTE</div>
                  <div className="text-sm font-bold uppercase"><EditableText>{cliente || '-'}</EditableText></div>
                </div>
                <div className="border border-gray-300 print:border-black p-2">
                  <div className="text-[10px] text-gray-500 uppercase font-bold">OBRA</div>
                  <div className="text-sm font-bold uppercase"><EditableText>{obra || '-'}</EditableText></div>
                </div>
                <div className="border border-gray-300 print:border-black p-2">
                  <div className="text-[10px] text-gray-500 uppercase font-bold">RESPONSÁVEL</div>
                  <div className="text-sm font-bold"><EditableText>Não informado</EditableText></div>
                </div>
              </div>

              {/* QUANTIDADE TOTAL HIGHLIGHT */}
              <div className="flex flex-col mt-2 mb-6 print:mt-4 print:mb-8">
                <div className="text-xl print:text-2xl font-bold text-gray-800 print:text-black uppercase tracking-wide">
                  QUANTIDADE TOTAL: {totalBloco} KITS
                </div>
              </div>

              {/* BLOCO HIGHLIGHT */}
              <div className="flex-1 flex flex-col items-center justify-center space-y-4 mb-4">
                 {(blocoName !== '0' && blocoName !== 'SEM BLOCO' && blocoName.trim() !== '') && (
                   <h2 className="text-5xl print:text-6xl font-black uppercase text-gray-800 print:text-black border-[3px] border-gray-600 print:border-black px-12 py-8 shadow-sm print:shadow-none bg-white print:bg-transparent text-black print:text-black min-w-[200px] text-center">
                     <EditableText>{blocoName.toUpperCase().includes('BLOCO') ? blocoName : \`BLOCO \${blocoName}\`}</EditableText>
                   </h2>
                 )}
              </div>

              {/* ASSINATURAS INVERTIDAS E NA CAPA */}
              <div className="mt-auto pt-16 pb-8 grid grid-cols-2 gap-16 text-center">
                {/* Nacional Madeiras primeiro (esquerda) */}
                <div className="flex flex-col items-center">
                  <div className="w-full border-b-[2px] border-black print:border-black mb-2"></div>
                  <span className="font-bold text-gray-800 print:text-black text-lg print:text-xl uppercase">NACIONAL MADEIRAS</span>
                </div>
                {/* Obra segundo (direita) */}
                <div className="flex flex-col items-center">
                  <div className="w-full border-b-[2px] border-black print:border-black mb-2"></div>
                  <span className="font-bold text-gray-800 print:text-black text-lg print:text-xl uppercase"><EditableText>{obra || 'Nome da Obra'}</EditableText></span>
                </div>
              </div>
            </div>`;

if (content.includes('QUANTIDADE TOTAL HIGHLIGHT')) {
  // Try to replace the whole cover page block
  const startIdx = content.indexOf('{/* COVER PAGE */}');
  const endIdx = content.indexOf('{/* PAGES FOR DIMENSIONS */}');
  if(startIdx !== -1 && endIdx !== -1) {
    const oldSlice = content.slice(startIdx, endIdx);
    content = content.replace(oldSlice, coverPageNew + '\n            ');
    fs.writeFileSync(filePath, content);
    console.log("Patched cover page successfully");
  } else {
    console.log("Could not find start/end indices for cover page");
  }
} else {
  console.log("Could not find the target block");
}
