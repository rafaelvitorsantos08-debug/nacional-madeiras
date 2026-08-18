const fs = require('fs');
const filePath = 'src/components/AutoReports.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

const renderAutoEntregaStart = content.indexOf('export function renderAutoEntrega(kits: any[], responsavel?: string, obra?: string, cliente?: string) {');
const endFunctionStr = '      <TableLayout headers={headers} rows={rows} />\n    </div>\n  );\n}';
const renderAutoEntregaEnd = content.indexOf(endFunctionStr, renderAutoEntregaStart) + endFunctionStr.length;

const newRenderAutoEntrega = `export function renderAutoEntrega(kits: any[], responsavel?: string, obra?: string, cliente?: string) {
  // Group by Bloco
  const blocks = new Map<string, any[]>();
  kits.forEach(k => {
    const bloco = k.bloco || 'SEM BLOCO';
    if (!blocks.has(bloco)) {
      blocks.set(bloco, []);
    }
    blocks.get(bloco).push(k);
  });

  const currentDate = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const simpleDate = new Date().toLocaleDateString('pt-BR');

  const blockEntries = Array.from(blocks.entries()).sort((a, b) => a[0].localeCompare(b[0], undefined, {numeric: true}));

  return (
    <div className="space-y-0">
      {blockEntries.map(([blocoName, blockKits], blockIndex) => {
        // Quantidade total do bloco
        let totalBloco = 0;
        blockKits.forEach(k => {
          let stringQtdStr = String(k.qtdeFolhasPorKit || '1');
          if (k.quantidade) stringQtdStr = String(k.quantidade);
          if (k.qtde) stringQtdStr = String(k.qtde);
          const qty = parseInt(stringQtdStr, 10);
          totalBloco += isNaN(qty) ? 1 : qty;
        });

        // Group kits inside the block by Enchimento + Dimensao
        const dims = new Map<string, any[]>();
        blockKits.forEach(k => {
          const enc = (k.enchimento || 'S/ ENCHIMENTO').toUpperCase();
          const dim = k.dimensao || (k.largura && k.altura ? \`\${k.largura} x \${k.altura}\` : 'S/ DIMENSÃO');
          const dimKey = \`\${enc} || \${dim}\`;
          if (!dims.has(dimKey)) dims.set(dimKey, []);
          dims.get(dimKey).push(k);
        });

        const dimEntries = Array.from(dims.entries()).sort((a, b) => a[0].localeCompare(b[0]));

        return (
          <div key={blocoName} className={blockIndex > 0 ? "break-before-page mt-8 print:mt-0 print:break-before-page" : ""}>
            {/* COVER PAGE */}
            <div className="flex flex-col min-h-[90vh] print:min-h-[100vh] print:h-[100vh] page-break-after">
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
                <div className="flex border-b border-gray-300 print:border-black pb-1">
                  <span className="font-bold w-24 text-gray-700 print:text-black uppercase">CLIENTE:</span>
                  <span className="flex-1 text-gray-800 print:text-black uppercase"><EditableText>{cliente || '-'}</EditableText></span>
                </div>
                <div className="flex border-b border-gray-300 print:border-black pb-1">
                  <span className="font-bold w-24 text-gray-700 print:text-black uppercase">CÓDIGO:</span>
                  <span className="flex-1 text-gray-800 print:text-black text-right"><EditableText>{'____/____'}</EditableText></span>
                </div>
                <div className="flex border-b border-gray-300 print:border-black pb-1">
                  <span className="font-bold w-24 text-gray-700 print:text-black uppercase">OBRA:</span>
                  <span className="flex-1 text-gray-800 print:text-black uppercase"><EditableText>{obra || '-'}</EditableText></span>
                </div>
                <div className="flex border-b border-gray-300 print:border-black pb-1">
                  <span className="font-bold w-24 text-gray-700 print:text-black uppercase">PREVISÃO:</span>
                  <span className="flex-1 text-gray-800 print:text-black text-right"><EditableText>{'__/__/____'}</EditableText></span>
                </div>
                <div className="col-span-2 text-xs print:text-[14px] text-gray-500 mt-2">
                  <EditableText>{simpleDate}</EditableText>
                </div>
              </div>

              {/* BLOCO HIGHLIGHT */}
              <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                 <h2 className="text-5xl print:text-6xl font-black uppercase text-gray-800 print:text-black border-4 border-gray-800 print:border-black p-8 shadow-lg print:shadow-none bg-white print:bg-transparent">
                   {blocoName}
                 </h2>
                 <p className="text-2xl print:text-3xl font-bold text-gray-700 print:text-black mt-8">
                   QUANTIDADE TOTAL: {totalBloco} KITS
                 </p>
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
            </div>

            {/* PAGES FOR DIMENSIONS */}
            <div className="break-before-page print:break-before-page">
              {dimEntries.map(([dimKey, dimKits], dimIdx) => {
                const [enc, dim] = dimKey.split(' || ');
                
                // Group by Apto/Comodo within this dimension to sum quantities if identical
                const subGrouped = new Map<string, any>();
                dimKits.forEach(k => {
                  const key = [
                    k.apto, k.comodo, k.abertura,
                    k.aduelaLargura, k.aduelaAltura, k.fechaduraTipo, k.fechaduraMarca,
                    k.modelo, k.tipologia
                  ].join('||');
                  
                  let stringQtdStr = String(k.qtdeFolhasPorKit || '1');
                  if (k.quantidade) stringQtdStr = String(k.quantidade);
                  if (k.qtde) stringQtdStr = String(k.qtde);
                  const qty = parseInt(stringQtdStr, 10);
                  const validQty = isNaN(qty) ? 1 : qty;
                  
                  if (subGrouped.has(key)) {
                    subGrouped.get(key).qtd += validQty;
                  } else {
                    subGrouped.set(key, {
                      apto: k.apto || '-',
                      comodo: k.comodo || '-',
                      abertura: k.abertura || '-',
                      aduela: \`\${k.aduelaLargura || '-'} x \${k.aduelaAltura || '-'}\`,
                      fechadura: (k.fechaduraTipo || k.fechaduraMarca) ? \`\${k.fechaduraTipo || ''} \${k.fechaduraMarca || ''}\`.trim() : '-',
                      modelo: k.modelo || k.tipologia || '-',
                      qtd: validQty
                    });
                  }
                });

                const rows = Array.from(subGrouped.values()).sort((a, b) => {
                  const aptoA = String(a.apto);
                  const aptoB = String(b.apto);
                  if (aptoA !== aptoB) return aptoA.localeCompare(aptoB, undefined, {numeric: true});
                  return String(a.comodo).localeCompare(String(b.comodo));
                });

                const totalDim = rows.reduce((acc, r) => acc + r.qtd, 0);

                return (
                  <div key={dimKey} className="mb-12 print:mb-16 break-inside-avoid print:break-inside-avoid">
                    {/* Dim Header */}
                    <div className="flex items-end mb-1">
                      <div className="border border-gray-400 print:border-black px-4 py-1 font-bold text-gray-800 print:text-black uppercase text-sm print:text-[16px] mr-8">
                        {enc}
                      </div>
                      <div className="border border-gray-400 print:border-black rounded-full px-6 py-1 font-bold text-gray-800 print:text-black uppercase text-sm print:text-[16px]">
                        {dim}
                      </div>
                    </div>
                    
                    <div className="text-xl print:text-2xl font-bold uppercase text-gray-500 print:text-gray-700 italic mb-2 ml-2">
                      <EditableText>{blocoName}</EditableText>
                    </div>

                    <table className="min-w-full border-collapse border border-gray-400 print:border-black text-[12px] sm:text-sm print:text-[16px] print:border-black">
                      <thead className="bg-gray-200 print:bg-transparent border-b-2 border-gray-400 print:border-black">
                        <tr>
                          <th className="border-r border-gray-400 print:border-black py-2 px-3 text-left font-bold text-gray-800 print:text-black">APTO.</th>
                          <th className="border-r border-gray-400 print:border-black py-2 px-3 text-left font-bold text-gray-800 print:text-black">CÔMODO</th>
                          <th className="border-r border-gray-400 print:border-black py-2 px-3 text-left font-bold text-gray-800 print:text-black">ABERTURA</th>
                          <th className="border-r border-gray-400 print:border-black py-2 px-3 text-left font-bold text-gray-800 print:text-black">ADUELA</th>
                          <th className="border-r border-gray-400 print:border-black py-2 px-3 text-left font-bold text-gray-800 print:text-black">FECHADURA</th>
                          <th className="py-2 px-3 text-left font-bold text-gray-800 print:text-black">MODELO</th>
                        </tr>
                      </thead>
                      <tbody className="print:bg-transparent">
                        {rows.map((r, i) => (
                          <tr key={i} className="border-b border-gray-300 print:border-black hover:bg-gray-50 print:hover:bg-transparent">
                            <td className="py-2 px-3 text-gray-700 print:text-black">{r.apto}</td>
                            <td className="py-2 px-3 text-gray-700 print:text-black">{r.comodo}</td>
                            <td className="py-2 px-3 text-gray-700 print:text-black">{r.abertura}</td>
                            <td className="py-2 px-3 text-gray-700 print:text-black">{r.aduela}</td>
                            <td className="py-2 px-3 text-gray-700 print:text-black">{r.fechadura}</td>
                            <td className="py-2 px-3 text-gray-700 print:text-black">{r.modelo}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    
                    <div className="flex justify-between items-center mt-2 px-2">
                      <div className="font-bold text-gray-800 print:text-black text-sm print:text-[16px] uppercase">
                        TOTAL DA DIMENSÃO: <span className="ml-2 font-black">{totalDim}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}`;

content = content.substring(0, renderAutoEntregaStart) + newRenderAutoEntrega + content.substring(renderAutoEntregaEnd);

fs.writeFileSync(filePath, content);
console.log('done');
