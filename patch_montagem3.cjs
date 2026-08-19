const fs = require('fs');
const filePath = 'src/components/AutoReports.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

const startIndex = content.indexOf('export function renderAutoMontagem(kits: any[], responsavel?: string, obra?: string, cliente?: string) {');
const endIndex = content.indexOf('export function renderAutoEntrega(kits: any[], responsavel?: string, obra?: string, cliente?: string) {');

if (startIndex !== -1 && endIndex !== -1) {
  const newFunction = `export function renderAutoMontagem(kits: any[], responsavel?: string, obra?: string, cliente?: string) {
  // Group by absolutely every distinguishing feature except apto, pavto, coluna, comodo, and abertura
  const byUniqueFeature = new Map<string, any[]>();
  
  kits.forEach(k => {
    const tipo = k.tipologia || 'SEM TIPOLOGIA';
    
    // NOT INCLUDED in key: k.abertura, k.apto, k.pavimento, k.coluna, k.comodo
    const key = [
      tipo, k.aduelaLargura, k.aduelaAltura, k.acabamentoAduela,
      k.folhaLargura, k.folhaAltura, k.acabamentoPorta, k.caracteristicaPorta, k.corFolha,
      k.fechaduraTipo, k.fechaduraMarca, k.fechaduraGrid,
      k.dobradicaMarca, k.dobradicaMedida, k.qtdeDobradicas,
      k.qtdeLadosAduela, k.montantesMedida, k.montantesFolgas,
      k.bitsQtde, !!k.correr, !!k.veneziana, !!k.grelha, !!k.bandeira, !!k.pivotante, !!k.fechaFresta, !!k.vidro
    ].join('|||');
    
    if (!byUniqueFeature.has(key)) byUniqueFeature.set(key, []);
    byUniqueFeature.get(key).push(k);
  });

  const uniqueGroups = Array.from(byUniqueFeature.entries());

  return (
    <div className="space-y-8 print:space-y-0 print:block">
      <style type="text/css">
        {\`
          @media print {
            * {
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            table, th, td, tr {
              border-color: #000000 !important;
            }
            @page { size: landscape; }
            .montagem-page-break {
              page-break-after: always;
            }
            .montagem-page-break:last-child {
              page-break-after: auto;
            }
          }
        \`}
      </style>
      
      {uniqueGroups.map(([key, groupKits], idx) => {
        const firstKit = groupKits[0];
        const tipo = firstKit.tipologia || 'SEM TIPOLOGIA';
        const fech = [firstKit.fechaduraTipo, firstKit.fechaduraMarca, firstKit.fechaduraGrid && \`GRID \${firstKit.fechaduraGrid}\`].filter(Boolean).join(' / ') || 'SEM FECHADURA';
        
        let showBits = false, showCorrer = false, showVen = false, showGre = false, showBand = false, showPiv = false, showFf = false, showVid = false;
        if (firstKit.bitsQtde && firstKit.bitsQtde !== '-' && firstKit.bitsQtde !== '0') showBits = true;
        if (firstKit.correr) showCorrer = true;
        if (firstKit.veneziana) showVen = true;
        if (firstKit.grelha) showGre = true;
        if (firstKit.bandeira) showBand = true;
        if (firstKit.pivotante) showPiv = true;
        if (firstKit.fechaFresta) showFf = true;
        if (firstKit.vidro) showVid = true;

        const totalCols = 8 + (showBits ? 1 : 0) + (showCorrer ? 1 : 0) + (showVen ? 1 : 0) + (showGre ? 1 : 0) + (showBand ? 1 : 0) + (showPiv ? 1 : 0) + (showFf ? 1 : 0) + (showVid ? 1 : 0);

        // Group internally by Abertura
        const byAbertura = new Map<string, any[]>();
        groupKits.forEach(k => {
          const ab = k.abertura || 'SEM ABERTURA';
          if (!byAbertura.has(ab)) byAbertura.set(ab, []);
          byAbertura.get(ab).push(k);
        });
        
        const sortedAberturas = Array.from(byAbertura.entries()).sort((a, b) => a[0].localeCompare(b[0]));

        return (
          <div key={idx} className="montagem-page-break print:w-full print:py-4 flex flex-col gap-6 bg-white p-6 shadow-sm rounded-md print:shadow-none print:p-0 print:bg-transparent">
            
            {/* CABEÇALHO DO RELATÓRIO (SEMPRE VISÍVEL AGORA) */}
            <div className="flex justify-between items-start border-b-[2px] border-black pb-4 mb-2 print:border-black">
               <div>
                 <div className="flex flex-col items-start mb-2" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                   <h2 className="text-2xl font-black tracking-tighter leading-none text-[#166534] print:text-[#166534] uppercase">Nacional Madeiras</h2>
                   <span className="text-xl font-bold uppercase tracking-widest mt-1 text-[#475569] print:text-[#475569]">Kit Porta</span>
                 </div>
                 <h1 className="text-3xl font-bold uppercase tracking-tight text-black print:text-black mt-4">RELATÓRIO DE MONTAGEM</h1>
               </div>
               <div className="text-right text-[12px] print:text-[14px] text-black print:text-black flex flex-row items-end gap-6 border-b-2 border-transparent">
                 <div className="flex items-end mt-2">
                   <span className="font-bold mr-2 uppercase whitespace-nowrap">Data de Liberação:</span>
                   <span className="font-medium text-sm text-black print:text-black border-b border-black min-w-[80px] text-center inline-block">
                     {new Date().toLocaleDateString('pt-BR')}
                   </span>
                 </div>
                 <div className="flex items-end mt-2 whitespace-nowrap">
                   <span className="font-bold mr-1 uppercase">Previsão de Entrega:</span>
                   <div className="border-b border-black w-24 h-4"></div>
                 </div>
               </div>
            </div>
            
            {(obra || responsavel || cliente) && (
              <div className="grid grid-cols-3 gap-4 mb-2">
                <div className="border border-gray-300 p-2">
                  <p className="text-[12px] print:text-[14px] uppercase text-gray-600 font-bold print:text-black">Cliente</p>
                  <p className="font-medium text-lg print:text-[20px] print:text-black uppercase text-black">{cliente || "Não informado"}</p>
                </div>
                <div className="border border-gray-300 p-2">
                  <p className="text-[12px] print:text-[14px] uppercase text-gray-600 font-bold print:text-black">Obra</p>
                  <p className="font-medium text-lg print:text-[20px] print:text-black text-black">{obra || "Não informado"}</p>
                </div>
                <div className="border border-gray-300 p-2">
                  <p className="text-[12px] print:text-[14px] uppercase text-gray-600 font-bold print:text-black">Responsável</p>
                  <p className="font-medium text-lg print:text-[20px] print:text-black uppercase text-black">{responsavel || "Não informado"}</p>
                </div>
              </div>
            )}

            <table className="min-w-full border-collapse mt-2">
              <thead className="print:table-header-group">
                <tr>
                   <td colSpan={totalCols} className="p-0 border-0">
                      <div className="bg-gray-200 dark:bg-slate-800 border-[2px] border-black print:border-black py-2 text-center font-bold text-sm print:text-[18px] uppercase mb-4 print:bg-transparent print:text-black">
                        <EditableText>Relatório de Montagem - {tipo} {fech !== 'SEM FECHADURA' ? \`(\${fech})\` : ''}</EditableText>
                      </div>
                   </td>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 print:bg-transparent text-[11px] sm:text-sm print:text-[16px]">
                {sortedAberturas.map(([abertura, abKits], abIdx) => {
                  let totalQtd = 0;
                  abKits.forEach(k => {
                    let stringQtdStr = String(k.qtdeFolhasPorKit || '1');
                    if (k.quantidade) stringQtdStr = String(k.quantidade);
                    if (k.qtde) stringQtdStr = String(k.qtde);
                    const q = parseInt(stringQtdStr, 10);
                    totalQtd += isNaN(q) ? 1 : q;
                  });

                  const aduelaInfo = [
                    firstKit.aduelaLargura && firstKit.aduelaAltura ? \`\${firstKit.aduelaLargura}x\${firstKit.aduelaAltura}\` : null,
                    firstKit.montantesMedida ? \`D\${firstKit.montantesMedida}\` : null,
                    firstKit.montantesFolgas ? \`F\${firstKit.montantesFolgas}\` : null,
                    firstKit.qtdeLadosAduela ? \`\${firstKit.qtdeLadosAduela} lados\` : null
                  ].filter(Boolean).join(' - ') || '-';

                  const dob = [firstKit.dobradicaMarca, firstKit.dobradicaMedida, firstKit.qtdeDobradicas && \`\${firstKit.qtdeDobradicas}un\`].filter(Boolean).join(' / ') || '-';
                  const acabPorta = firstKit.acabamentoPorta || firstKit.corFolha || '-';
                  const caracteristicas = firstKit.caracteristicaPorta || '-';

                  let leafSizeStr = \`\${firstKit.folhaLargura || '-'} x \${firstKit.folhaAltura || '-'}\`;
                  const folhaQtd = parseInt(String(firstKit.qtdeFolhasPorKit || '1'), 10);
                  if (!isNaN(folhaQtd) && folhaQtd > 1 && firstKit.folhaLargura && !isNaN(parseInt(firstKit.folhaLargura, 10))) {
                      const dividedWidth = parseInt(firstKit.folhaLargura, 10) / folhaQtd;
                      leafSizeStr = \`\${firstKit.folhaLargura} x \${firstKit.folhaAltura || '-'} (\${folhaQtd}x \${dividedWidth} x \${firstKit.folhaAltura || '-'})\`;
                  }

                  return (
                    <React.Fragment key={abertura}>
                      {/* TITULO DA ABERTURA (ESQUERDA / DIREITA) */}
                      <tr className="bg-gray-50 dark:bg-gray-700 print:bg-transparent border-t border-gray-300 print:border-black w-full break-inside-avoid">
                        <td colSpan={totalCols} className="px-3 py-2 text-center font-bold text-[14px] sm:text-[16px] print:text-[18px] uppercase text-black dark:text-white print:text-black print:border-black border-y">
                          <EditableText>{abertura}</EditableText>
                        </td>
                      </tr>
                      {/* CABEÇALHO DAS COLUNAS */}
                      <tr className="bg-[#0f172a] text-white print:bg-transparent print:border-y print:border-black print:text-black font-semibold uppercase break-inside-avoid shadow-[0_1px_0_1px_#cbd5e1] print:shadow-none">
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
                      </tr>
                      {/* DADOS (UMA LINHA POR ABERTURA) */}
                      <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 print:hover:bg-transparent text-gray-900 dark:text-gray-100 print:text-black border-b border-gray-300 print:border-black break-inside-avoid">
                        <td className="px-3 py-2 text-center border-x border-gray-200 print:border-black font-medium"><EditableText>{totalQtd}</EditableText></td>
                        <td className="px-3 py-2 text-center border-x border-gray-200 print:border-black font-medium"><EditableText>{leafSizeStr}</EditableText></td>
                        <td className="px-3 py-2 text-center border-x border-gray-200 print:border-black font-medium"><EditableText>{caracteristicas}</EditableText></td>
                        <td className="px-3 py-2 text-center border-x border-gray-200 print:border-black font-medium"><EditableText>{acabPorta}</EditableText></td>
                        <td className="px-3 py-2 text-center border-x border-gray-200 print:border-black font-medium"><EditableText>{aduelaInfo}</EditableText></td>
                        <td className="px-3 py-2 text-center border-x border-gray-200 print:border-black font-medium"><EditableText>{fech || '-'}</EditableText></td>
                        <td className="px-3 py-2 text-center border-x border-gray-200 print:border-black font-medium"><EditableText>{dob}</EditableText></td>
                        {showBits && <td className="px-3 py-2 text-center border-x border-gray-200 print:border-black font-medium"><EditableText>{firstKit.bitsQtde}</EditableText></td>}
                        {showCorrer && <td className="px-3 py-2 text-center border-x border-gray-200 print:border-black font-medium"><EditableText>CORRER</EditableText></td>}
                        {showVen && <td className="px-3 py-2 text-center border-x border-gray-200 print:border-black font-medium"><EditableText>VENEZIANA</EditableText></td>}
                        {showGre && <td className="px-3 py-2 text-center border-x border-gray-200 print:border-black font-medium"><EditableText>GRELHA</EditableText></td>}
                        {showBand && <td className="px-3 py-2 text-center border-x border-gray-200 print:border-black font-medium"><EditableText>BANDEIRA</EditableText></td>}
                        {showPiv && <td className="px-3 py-2 text-center border-x border-gray-200 print:border-black font-medium"><EditableText>PIVOTANTE</EditableText></td>}
                        {showFf && <td className="px-3 py-2 text-center border-x border-gray-200 print:border-black font-medium"><EditableText>FECHA FRESTA</EditableText></td>}
                        {showVid && <td className="px-3 py-2 text-center border-x border-gray-200 print:border-black font-medium"><EditableText>COM VIDRO</EditableText></td>}
                        <td className="px-3 py-2 text-center border-x border-gray-200 print:border-black font-medium"></td>
                      </tr>
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
            
            <div className="mt-4 print:mt-6 break-inside-avoid w-full">
              <h3 className="text-sm print:text-sm font-bold text-gray-800 dark:text-gray-200 print:text-black mb-2 uppercase">Observações Gerais:</h3>
              <div className="border border-gray-300 dark:border-gray-700 print:border-black rounded-sm h-32 w-full"></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
`;
  
  const contentBefore = content.substring(0, startIndex);
  const contentAfter = content.substring(endIndex);
  
  fs.writeFileSync(filePath, contentBefore + newFunction + '\n' + contentAfter);
  console.log("Patched renderAutoMontagem with custom groups");
} else {
  console.log("Could not find boundaries");
}
