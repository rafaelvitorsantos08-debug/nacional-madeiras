const fs = require('fs');
const filePath = 'src/components/AutoReports.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

const oldBlock = `            {/* COVER PAGE */}
            <div className="flex flex-col min-h-[90vh] print:min-h-[100vh] print:h-[100vh]" style={{ pageBreakAfter: 'always' }}>
              {/* HEADER */}
              <div className="flex justify-between items-start mb-8 print:mb-12 border-b-2 border-gray-300 print:border-black pb-4">
                <div className="flex flex-col">
                  <div className="text-yellow-500 text-lg tracking-widest mb-1 print:text-yellow-500">★★★★★</div>
                  <h2 className="text-2xl font-black tracking-tighter leading-none text-[#166534] print:text-[#166534] uppercase">Nacional Madeiras</h2>
                  <span className="text-xl font-bold uppercase tracking-widest mt-1 text-[#475569] print:text-[#475569]">Kit Porta</span>
                </div>
                <div className="text-right text-[12px] print:text-[14px] text-gray-700 print:text-black leading-snug">
                  <p>Rua Moréia, 39 - Inhaúma - Rio de Janeiro - RJ</p>
                  <p>Tel.: (21) 2103-7777 | Fax: (21) 2593-4086</p>
                  <p>www.nacionalmadeiras-rio.com.br</p>
                  <p>atendimento@nacionalmadeiras-rio.com.br</p>
                </div>
              </div>

              {/* TITULO */}
              <div className="mb-8 print:mb-12 flex flex-col items-center">
                <div className="border-[2px] border-gray-400 print:border-black py-4 px-12 text-center w-full max-w-4xl bg-gray-100 print:bg-transparent shadow-sm print:shadow-none">
                  <h1 className="text-3xl print:text-4xl font-bold uppercase tracking-wide text-gray-800 print:text-black">
                    RELATÓRIO DE ENTREGA DE PORTAS
                  </h1>
                </div>
                <p className="mt-2 text-sm print:text-[16px] text-gray-600 print:text-black italic">{currentDate}</p>
              </div>

              {/* CLIENTE INFO */}
              <div className="grid grid-cols-2 gap-x-12 gap-y-4 mb-10 print:mb-16 text-sm print:text-[16px] border-b-2 border-gray-300 print:border-black pb-6">
                <div className="flex pb-1">
                  <span className="font-bold w-24 text-gray-700 print:text-black uppercase">CLIENTE:</span>
                  <span className="flex-1 text-gray-800 print:text-black uppercase"><EditableText>{cliente || '-'}</EditableText></span>
                </div>
                <div className="flex pb-1">
                  <span className="font-bold w-24 text-gray-700 print:text-black uppercase">CÓDIGO:</span>
                  <span className="flex-1 text-gray-800 print:text-black text-right"><EditableText>{'____/____'}</EditableText></span>
                </div>
                <div className="flex flex-col gap-1 pb-1">
                  <div className="flex">
                    <span className="font-bold w-24 text-gray-700 print:text-black uppercase">OBRA:</span>
                    <span className="flex-1 text-gray-800 print:text-black uppercase"><EditableText>{obra || '-'}</EditableText></span>
                  </div>
                  <div className="font-bold text-gray-800 print:text-black mt-2 uppercase">
                    QUANTIDADE TOTAL: {totalBloco} KITS
                  </div>
                  <div className="text-xs print:text-[14px] text-gray-500 mt-1">
                    <EditableText>{simpleDate}</EditableText>
                  </div>
                </div>
                <div className="flex pb-1">
                  <span className="font-bold w-24 text-gray-700 print:text-black uppercase">PREVISÃO:</span>
                  <span className="flex-1 text-gray-800 print:text-black text-right"><EditableText>{'__/__/____'}</EditableText></span>
                </div>
              </div>

              {/* BLOCO HIGHLIGHT */}
              <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                 <h2 className="text-5xl print:text-6xl font-black uppercase text-gray-800 print:text-black border-[3px] border-gray-600 print:border-black px-12 py-8 shadow-sm print:shadow-none bg-[#1e293b] print:bg-transparent text-white print:text-black min-w-[200px] text-center">
                   <EditableText>{blocoName}</EditableText>
                 </h2>
              </div>`;

const newBlock = `            {/* COVER PAGE */}
            <div className="flex flex-col min-h-[90vh] print:min-h-[100vh] print:h-[100vh] pt-12" style={{ pageBreakAfter: 'always' }}>
              
              {/* CLIENTE INFO (Simplified) */}
              <div className="flex flex-col gap-y-4 mb-10 print:mb-16 text-sm print:text-[16px] border-b-2 border-gray-300 print:border-black pb-6 max-w-lg">
                <div className="flex pb-1">
                  <span className="font-bold w-24 text-gray-700 print:text-black uppercase">CLIENTE:</span>
                  <span className="flex-1 text-gray-800 print:text-black uppercase"><EditableText>{cliente || '-'}</EditableText></span>
                </div>
                <div className="flex pb-1">
                  <span className="font-bold w-24 text-gray-700 print:text-black uppercase">OBRA:</span>
                  <span className="flex-1 text-gray-800 print:text-black uppercase"><EditableText>{obra || '-'}</EditableText></span>
                </div>
                <div className="font-bold text-gray-800 print:text-black mt-2 uppercase">
                  QUANTIDADE TOTAL: {totalBloco} KITS
                </div>
              </div>

              {/* BLOCO HIGHLIGHT */}
              <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                 {(blocoName !== '0' && blocoName !== 'SEM BLOCO' && blocoName.trim() !== '') && (
                   <h2 className="text-5xl print:text-6xl font-black uppercase text-gray-800 print:text-black border-[3px] border-gray-600 print:border-black px-12 py-8 shadow-sm print:shadow-none bg-[#1e293b] print:bg-transparent text-white print:text-black min-w-[200px] text-center">
                     <EditableText>{blocoName.toUpperCase().includes('BLOCO') ? blocoName : \`BLOCO \${blocoName}\`}</EditableText>
                   </h2>
                 )}
              </div>`;

if (content.includes('RELATÓRIO DE ENTREGA DE PORTAS')) {
  content = content.replace(oldBlock, newBlock);
  fs.writeFileSync(filePath, content);
  console.log("Patched successfully");
} else {
  console.log("Could not find the target block");
}
