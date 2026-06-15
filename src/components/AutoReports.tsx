
import React, { useMemo } from 'react';

export function AutoReportsViewer({ kits, reportType, responsavel, obra }: { kits: any[], reportType: string, responsavel?: string, obra?: string }) {
  const content = useMemo(() => {
    switch (reportType) {
      case 'auto_portas': return renderAutoPortas(kits);
      case 'auto_aduelas': return renderAutoAduelas(kits);
      case 'auto_alizares': return renderAutoAlizares(kits);
      case 'auto_usinagem_portas': return renderUsinagem(kits, 'portas', responsavel, obra);
      case 'auto_usinagem_aduelas': return renderUsinagem(kits, 'aduelas', responsavel, obra);
      case 'auto_vergas': return renderAutoVergas(kits);
      default: return null;
    }
  }, [kits, reportType, responsavel, obra]);

  return <div className="mt-4">{content}</div>;
}

function TableLayout({ headers, rows }: { headers: string[], rows: (string | number)[][] }) {
  return (
    <div className="border border-gray-300 dark:border-gray-600 print:border-black rounded overflow-x-auto shadow-sm break-inside-avoid">
      <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-600 print:divide-black text-[11px] sm:text-sm">
        <thead className="bg-[#0f172a] text-white print:bg-gray-100 print:text-black">
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="px-3 py-2 text-center font-semibold uppercase whitespace-nowrap border-x border-[#1e293b] print:border-black">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 print:bg-white divide-y divide-gray-200 dark:divide-gray-700 print:divide-black">
          {rows.map((row, idx) => (
            <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700 print:hover:bg-transparent">
              {row.map((cell, cIdx) => (
                <td key={cIdx} className="px-3 py-2 text-center border-x border-gray-200 print:border-black font-medium text-gray-900 dark:text-gray-100 print:text-black">
                  {cell || '-'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function mapFechaduraTipo(codigo: string) {
  if (!codigo) return 'SEM FECHADURA';
  const c = codigo.toUpperCase();
  if (c.includes('EXT')) return 'EXTERNA';
  if (c.includes('INT')) return 'INTERNA';
  if (c.includes('WC')) return 'WC';
  if (c.includes('MEIO CIL') || c.includes('MEIO CILINDRO')) return 'EXTERNA MEIO CILINDRO';
  if (c.includes('SÓ MAÇ') || c.includes('SO MAC') || c.includes('MAÇANETA')) return 'SÓ MAÇANETA';
  if (c.includes('SÓ DOBR') || c.includes('DOBRADIÇA')) return 'SÓ DOBRADIÇAS';
  return c;
}

function renderUsinagem(kits: any[], mode: 'portas' | 'aduelas', responsavel?: string, obra?: string) {
  // Step 1: Agrupar por Fechadura Tipo -> Abertura -> Dimensao -> Quantidade
  const grouped = new Map<string, Array<{abertura: string, dimensao: string, qtd: number}>>();

  kits.forEach(k => {
    let fTipo = mapFechaduraTipo(k.fechaduraTipo || '');
    // Some specific cases may override group based on combinations if needed.
    
    let abertura = k.abertura?.trim().toUpperCase() || 'INDEFINIDA';
    let fLargura = mode === 'portas' ? k.folhaLargura : k.aduelaLargura;
    let fAltura = mode === 'portas' ? k.folhaAltura : k.aduelaAltura;

    // Handle "SÓ DOBRADIÇAS" logic if fechaduraTipo is missing or explicitly Só Dobradiças.
    if(fTipo === 'SEM FECHADURA' || !k.fechaduraTipo) {
       // If it has hinges but no lock, we group as SÓ DOBRADIÇAS
       if (k.dobradicaMarca || k.dobradicaMedida) {
         fTipo = 'SÓ DOBRADIÇAS';
       }
    }

    if (!fLargura || !fAltura || fLargura === '-' || fAltura === '-') return;

    let dimensao = `${fLargura}x${fAltura}`;
    
    let isDuplo = !!k.kitDuplo;
    let baseQtd = parseInt(k.qtdeFolhasPorKit || '1', 10) || 1;
    // se for usinagem de ADUELA, um "kit duplo" (2 folhas) usa 1 aduela usinada como duplo? A folha usa 2.
    // the user image says for "EXTERNA MEIO CILINDRO" -> 1440x2100 (2x 720x2100).
    // Let's assume quantity is literal to the lines. We just aggregate by dimensions right now.
    
    // In Portas report, image shows 1440x2100 (2x 720x2100) -> meaning for double kits!
    if (isDuplo) {
        let metade = parseInt(fLargura) / 2;
        dimensao = `${fLargura}x${fAltura} (2x ${metade}x${fAltura})`;
    }

    // Qtde calculation
    let qtdTotal = isDuplo && mode === 'portas' ? baseQtd * 2 : baseQtd;
    // Wait, the image says "2 Esq / 2 Dir" for a double kit? Let's just use 1 kit = 1 unless specified.
    // Actually the image says: 1440x2100 (2x 720x2100): 2 Esq / 2 Dir
    // Let's stick with 1 item = 1 row in the launch sheet. We just increment by 1 conceptually or parse qtdeFolhasPorKit correctly.
    // In LancamentosRelatorios: each row is 1 Kit? Wait, is there a QTY column? Not globally. It has qtdeFolhasPorKit.
    // So 1 row = 1 kit. If kit has 2 folhas, should we add 2 to Portas? The image for 1440 shows "2 Esq / 2 Dir".
    let qtd = isDuplo && mode === 'portas' ? 2 : 1; 

    if (!grouped.has(fTipo)) {
      grouped.set(fTipo, []);
    }
    
    // look for existing
    const groupItems = grouped.get(fTipo)!;
    const existing = groupItems.find(i => i.abertura === abertura && i.dimensao === dimensao);
    if(existing) {
       existing.qtd += 1;
    } else {
       groupItems.push({abertura, dimensao, qtd: 1});
    }
  });

  if (grouped.size === 0) {
    return <div className="text-center p-4 text-gray-500">Nenhum dado com dimensões para exibir.</div>;
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="bg-gray-100 p-4 border border-gray-300 print:bg-transparent print:border-t print:border-b print:border-black flex justify-between uppercase font-semibold text-gray-800 print:text-black text-sm mb-6">
        <div>
           <div className="text-[10px] text-gray-500 print:text-gray-600 mb-1">RESPONSÁVEL</div>
           <div>{responsavel || 'Não informado'}</div>
        </div>
        <div>
           <div className="text-[10px] text-gray-500 print:text-gray-600 mb-1">OBRA / DESTINO</div>
           <div>{obra || 'Não informado'}</div>
        </div>
      </div>

      {Array.from(grouped.entries()).map(([fTipo, items]) => {
         // Separate into ESQUERDA and DIREITA logic
         // For things like CORRER / CAMARÃO / PIVOTANTE we might put them on the left or center.
         const esquerdas = items.filter(i => i.abertura.includes('ESQUERDA'));
         const direitas = items.filter(i => i.abertura.includes('DIREITA'));
         const outros = items.filter(i => !i.abertura.includes('ESQUERDA') && !i.abertura.includes('DIREITA'));

         // Get all unique aberturas for left and right
         const esqAberturas = Array.from(new Set(esquerdas.map(i => i.abertura)));
         const dirAberturas = Array.from(new Set(direitas.map(i => i.abertura)));
         
         const maxAberturas = Math.max(esqAberturas.length, dirAberturas.length, outros.length > 0 ? 1 : 0);
         // Build rows for the side-by-side table
         
         // In the images, they just put ESQUERDA on left and DIREITA on right. If there are multiple (like ESQUERDA P/FORA), they just label the column specifically.
         
         return (
            <div key={fTipo} className="border border-gray-400 rounded-sm overflow-hidden mb-6 break-inside-avoid shadow-sm print:shadow-none print:border-black">
               <div className="bg-gray-100 border-b border-gray-400 py-1 text-center font-bold uppercase print:bg-gray-200 print:border-black">
                  {fTipo}
               </div>

               <div className="flex flex-col md:flex-row min-h-[60px] divide-y md:divide-y-0 md:divide-x divide-gray-400 print:divide-black">
                  {/* ESQUERDA SIDE */}
                  {(esquerdas.length > 0 || maxAberturas > 0) && (
                    <div className="flex-1 flex flex-col p-0">
                       {esqAberturas.length > 0 ? esqAberturas.map(abLabel => (
                         <div key={abLabel} className="w-full h-full flex flex-col">
                           <div className="text-center font-bold text-[10px] uppercase border-b border-gray-200 bg-gray-50 py-0.5 print:border-black print:bg-transparent">
                             {abLabel}
                           </div>
                           <div className="flex-1 p-2 flex flex-col justify-start">
                             {esquerdas.filter(x => x.abertura === abLabel).map((item, idxx) => (
                               <div key={idxx} className="flex justify-between items-center text-sm py-0.5 border-b border-gray-100 last:border-0 print:border-black/20">
                                 <span className="font-mono text-gray-700 font-semibold print:text-black">{item.dimensao}</span>
                                 <span className="font-bold">{item.qtd}</span>
                               </div>
                             ))}
                           </div>
                         </div>
                       )) : (
                         <div className="w-full flex-1 flex flex-col">
                           <div className="text-center font-bold text-[10px] uppercase border-b border-gray-200 bg-gray-50 py-0.5 print:border-black print:bg-transparent">
                             ESQUERDA
                           </div>
                           <div className="flex-1"></div>
                         </div>
                       )}
                    </div>
                  )}

                  {/* DIREITA SIDE */}
                  {(direitas.length > 0 || maxAberturas > 0) && (
                    <div className="flex-1 flex flex-col p-0">
                       {dirAberturas.length > 0 ? dirAberturas.map(abLabel => (
                         <div key={abLabel} className="w-full h-full flex flex-col">
                           <div className="text-center font-bold text-[10px] uppercase border-b border-gray-200 bg-gray-50 py-0.5 print:border-black print:bg-transparent">
                             {abLabel}
                           </div>
                           <div className="flex-1 p-2 flex flex-col justify-start">
                             {direitas.filter(x => x.abertura === abLabel).map((item, idxx) => (
                               <div key={idxx} className="flex justify-between items-center text-sm py-0.5 border-b border-gray-100 last:border-0 print:border-black/20">
                                 <span className="font-mono text-gray-700 font-semibold print:text-black">{item.dimensao}</span>
                                 <span className="font-bold">{item.qtd}</span>
                               </div>
                             ))}
                           </div>
                         </div>
                       )) : (
                         <div className="w-full flex-1 flex flex-col">
                           <div className="text-center font-bold text-[10px] uppercase border-b border-gray-200 bg-gray-50 py-0.5 print:border-black print:bg-transparent">
                             DIREITA
                           </div>
                           <div className="flex-1"></div>
                         </div>
                       )}
                    </div>
                  )}

                  {/* OUTRAS ABERTURAS (e.g. CORRER, CAMARÃO) */}
                  {outros.length > 0 && (
                     <div className="flex-1 flex flex-col p-0">
                       <div className="text-center font-bold text-[10px] uppercase border-b border-gray-200 bg-gray-50 py-0.5 print:border-black print:bg-transparent">
                         OUTROS / ESPECIAIS
                       </div>
                       <div className="flex-1 p-2 flex flex-col justify-start">
                         {outros.map((item, idxx) => (
                           <div key={idxx} className="flex justify-between items-center text-sm py-0.5 border-b border-gray-100 last:border-0 print:border-black/20">
                             <div className="flex flex-col">
                               <span className="text-[10px] font-bold text-brand-green uppercase">{item.abertura}</span>
                               <span className="font-mono text-gray-700 font-semibold print:text-black">{item.dimensao}</span>
                             </div>
                             <span className="font-bold">{item.qtd}</span>
                           </div>
                         ))}
                       </div>
                     </div>
                  )}
               </div>
            </div>
         );
      })}
    </div>
  );
}

function renderAutoPortas(kits: any[]) {
  const agrupar = new Map<string, any>();
  
  kits.forEach(k => {
    const fLargura = k.folhaLargura;
    const fAltura = k.folhaAltura;
    // Ignorar kits que não são do tipo porta (ex: PM-Aduela) ou que não possuem dimensão
    if (!fLargura || !fAltura || fLargura === '-' || fAltura === '-') return;

    const fQtd = parseInt(k.qtdeFolhasPorKit || '1', 10) || 1;
    const acabamento = k.acabamentoPorta || '-';
    // Mapeamento correto para a característica da porta
    const caracteristica = k.caracteristicaPorta || k.modelo || 'HONEY';
    const isDuplo = !!k.kitDuplo;
    
    // Qtde real de folhas = quantidade no kit * (se duplo x 2)
    const qtde = isDuplo ? fQtd * 2 : fQtd;

    const key = `${fLargura}-${fAltura}-${acabamento}-${caracteristica}`;

    const val = agrupar.get(key) || { 
        largura: fLargura, altura: fAltura,
        acabamento, caracteristica, qtdTotal: 0 
    };
    
    val.qtdTotal += qtde;
    agrupar.set(key, val);
  });

  const rows = Array.from(agrupar.values());

  return (
    <div className="rounded border border-slate-800 overflow-x-auto shadow-sm break-inside-avoid bg-[#0f172a]">
      <table className="min-w-full divide-y divide-slate-800 text-[11px] sm:text-sm">
        <thead>
          <tr>
            <th className="px-4 py-3 text-center font-bold uppercase whitespace-nowrap border-x border-slate-800 text-emerald-400">
              Folha Larg
            </th>
            <th className="px-4 py-3 text-center font-bold uppercase whitespace-nowrap border-x border-slate-800 text-emerald-400">
              Folha Alt
            </th>
            <th className="px-4 py-3 text-center font-bold uppercase whitespace-nowrap border-x border-slate-800 text-emerald-400">
              Qtd Folha/Kit
            </th>
            <th className="px-4 py-3 text-center font-bold uppercase whitespace-nowrap border-x border-slate-800 text-emerald-400">
              Acabamento da Porta
            </th>
            <th className="px-4 py-3 text-center font-bold uppercase whitespace-nowrap border-x border-slate-800 text-emerald-400">
              Caracteristica da Porta
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {rows.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-6 text-center text-slate-400 font-medium">
                Nenhum kit de porta com dimensões foi preenchido na planilha.
              </td>
            </tr>
          )}
          {rows.map((k, idx) => (
            <tr key={idx} className="bg-[#151f32]">
              <td className="px-4 py-3 text-center border-x border-slate-800 text-white font-bold">
                {k.largura}
              </td>
              <td className="px-4 py-3 text-center border-x border-slate-800 text-white font-bold">
                {k.altura}
              </td>
              <td className="px-4 py-3 text-center border-x border-slate-800">
                <span className="inline-block min-w-[80px] bg-[#0f172a] rounded px-4 py-1.5 text-white font-bold shadow-inner border border-slate-700/50">
                  {k.qtdTotal}
                </span>
              </td>
              <td className="px-4 py-3 text-center border-x border-slate-800">
                 <span className="inline-block min-w-[120px] bg-[#0f172a] rounded px-4 py-1.5 text-white font-bold shadow-inner border border-slate-700/50">
                  {k.acabamento}
                 </span>
              </td>
              <td className="px-4 py-3 text-center border-x border-slate-800">
                 <span className="inline-block min-w-[120px] bg-[#0f172a] rounded px-4 py-1.5 text-gray-300 font-semibold shadow-inner border border-slate-700/50">
                  {k.caracteristica}
                 </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function renderAutoAduelas(kits: any[]) {
  const headers = [
    "Tipologia", "Aduela Larg", "Aduela Alt", "Qtd Folha/Kit",
    "Regulagem", "Acabamento da Aduela"
  ];
  const rows = kits.map(k => [
    k.tipologia || '-',
    k.aduelaLargura || '-',
    k.aduelaAltura || '-',
    k.qtdeFolhasPorKit || '1',
    k.regulagem || '-',
    k.acabamentoAduela || '-'
  ]);
  return <TableLayout headers={headers} rows={rows} />;
}

function renderAutoAlizares(kits: any[]) {
  const headers = [
    "Tipologia", "Qtd Lados Aduela", "Qtd Folha/Kit", "Acabamento da Aduela"
  ];
  const rows = kits.map(k => [
    k.tipologia || '-',
    k.qtdeLadosAduela || '-',
    k.qtdeFolhasPorKit || '1',
    k.acabamentoAduela || '-'
  ]);
  return <TableLayout headers={headers} rows={rows} />;
}

function renderAutoUsinagemPortas(kits: any[]) {
  const headers = [
    "Tipologia", "Folha Larg", "Folha Alt", "Abertura",
    "Fech. Tipo", "Fech. Marca", "Dob. Marca", "Dob. Medida", "Qtd Folha/Kit"
  ];
  const rows = kits.map(k => [
    k.tipologia || '-',
    k.folhaLargura || '-',
    k.folhaAltura || '-',
    k.abertura || '-',
    k.fechaduraTipo || '-',
    k.fechaduraMarca || '-',
    k.dobradicaMarca || '-',
    k.dobradicaMedida || '-',
    k.qtdeFolhasPorKit || '1'
  ]);
  return <TableLayout headers={headers} rows={rows} />;
}

function renderAutoUsinagemAduelas(kits: any[]) {
  const headers = [
    "Tipologia", "Aduela Larg", "Aduela Alt", "Abertura", "Fech. Tipo", 
    "Dob. Marca", "Dob. Medida", "Qtd Lados", "Montantes Medida", 
    "Montantes Folgas", "B. Qtd", "B. Faces", "Qtd Folha/Kit"
  ];
  const rows = kits.map(k => [
    k.tipologia || '-',
    k.aduelaLargura || '-',
    k.aduelaAltura || '-',
    k.abertura || '-',
    k.fechaduraTipo || '-',
    k.dobradicaMarca || '-',
    k.dobradicaMedida || '-',
    k.qtdeLadosAduela || '-',
    k.montantesMedida || '-',
    k.montantesFolgas || '-',
    k.bitsQtde || '-',
    k.bitsFaces || '-',
    k.qtdeFolhasPorKit || '1'
  ]);
  return <TableLayout headers={headers} rows={rows} />;
}

function renderAutoVergas(kits: any[]) {
  const headers = [
    "Tipologia", "Folha Larg", "Aduela Larg", "Verga (Folha + 47mm)", "Qtd Folha/Kit"
  ];
  const rows = kits.map(k => {
    const fLarg = parseInt(k.folhaLargura, 10);
    const verga = !isNaN(fLarg) ? fLarg + 47 : '-';
    return [
      k.tipologia || '-',
      k.folhaLargura || '-',
      k.aduelaLargura || '-',
      verga,
      k.qtdeFolhasPorKit || '1'
    ];
  });
  return <TableLayout headers={headers} rows={rows} />;
}

