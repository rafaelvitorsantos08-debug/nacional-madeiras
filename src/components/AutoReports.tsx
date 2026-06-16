
import React, { useMemo } from 'react';

export function AutoReportsViewer({ kits, reportType, responsavel, obra }: { kits: any[], reportType: string, responsavel?: string, obra?: string }) {
  const content = useMemo(() => {
    switch (reportType) {
      case 'auto_portas': return renderAutoPortas(kits, responsavel, obra);
      case 'auto_aduelas': return renderAutoAduelas(kits, responsavel, obra);
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
  // Grouping structure: fTipo -> { singles: [], doubles: [] }
  const grouped = new Map<string, {
    singles: Array<{abertura: string, dimensao: string, qtd: number}>,
    doubles: Array<{dimensao: string, qtd: number}>
  }>();

  kits.forEach(k => {
    let fTipo = mapFechaduraTipo(k.fechaduraTipo || '');
    let abertura = k.abertura?.trim().toUpperCase() || 'INDEFINIDA';
    
    let fLargura = mode === 'portas' ? k.folhaLargura : k.aduelaLargura;
    let fAltura = mode === 'portas' ? k.folhaAltura : k.aduelaAltura;

    if (!fLargura || !fAltura || fLargura === '-' || fAltura === '-') return;

    if ((fTipo === 'SEM FECHADURA' || !k.fechaduraTipo) && (k.dobradicaMarca || k.dobradicaMedida)) {
      fTipo = 'SÓ DOBRADIÇAS';
    }

    let isDuplo = !!k.kitDuplo || parseInt(k.qtdeFolhasPorKit || '1', 10) > 1;

    if (!grouped.has(fTipo)) {
      grouped.set(fTipo, { singles: [], doubles: [] });
    }
    const groupItems = grouped.get(fTipo)!;

    if (isDuplo) {
      let dimensao = `${fLargura}x${fAltura}`;
      if (mode === 'portas' && fLargura.match(/^\d+$/)) {
        let metade = parseInt(fLargura, 10) / 2;
        dimensao = `${fLargura}x${fAltura} (2x ${metade}x${fAltura})`;
      } else if (mode === 'portas') {
         dimensao = `${fLargura}x${fAltura} (Duplo)`;
      }

      const existing = groupItems.doubles.find(i => i.dimensao === dimensao);
      if (existing) {
        existing.qtd += 1;
      } else {
        groupItems.doubles.push({ dimensao, qtd: 1 });
      }
    } else {
      let dimensao = `${fLargura}x${fAltura}`;
      const existing = groupItems.singles.find(i => i.abertura === abertura && i.dimensao === dimensao);
      if (existing) {
        existing.qtd += 1;
      } else {
        groupItems.singles.push({ abertura, dimensao, qtd: 1 });
      }
    }
  });

  if (grouped.size === 0) {
    return <div className="text-center p-4 text-gray-500">Nenhum dado com dimensões para exibir.</div>;
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="bg-gray-100 p-4 border border-gray-300 print:bg-transparent print:border-t print:border-b print:border-black flex justify-between uppercase font-semibold text-gray-800 print:text-black text-[11px] mb-6 shadow-sm print:shadow-none">
        <div>
           <div className="text-[9px] text-gray-500 print:text-gray-600 mb-0.5">RESPONSÁVEL</div>
           <div className="text-sm font-bold tracking-tight">{responsavel || ''}</div>
        </div>
        <div className="text-right">
           <div className="text-[9px] text-gray-500 print:text-gray-600 mb-0.5">OBRA / DESTINO</div>
           <div className="text-sm font-bold tracking-tight">{obra || ''}</div>
        </div>
      </div>

      {Array.from(grouped.entries()).map(([fTipo, groupData]) => {
         const { singles, doubles } = groupData;
         
         const esquerdas = singles.filter(i => i.abertura.includes('ESQUERDA'));
         const direitas = singles.filter(i => i.abertura.includes('DIREITA'));
         const outros = singles.filter(i => !i.abertura.includes('ESQUERDA') && !i.abertura.includes('DIREITA'));

         const esqAberturas = Array.from(new Set(esquerdas.map(i => i.abertura)));
         const dirAberturas = Array.from(new Set(direitas.map(i => i.abertura)));
         const maxAberturas = Math.max(esqAberturas.length, dirAberturas.length, outros.length > 0 ? 1 : 0);

         return (
            <div key={fTipo} className="border border-gray-400 rounded-sm overflow-hidden mb-6 break-inside-avoid shadow-sm print:shadow-none print:border-black">
               <div className="bg-gray-100 border-b border-gray-400 py-1.5 text-center font-bold text-xs uppercase print:bg-gray-100 print:border-black">
                  {fTipo}
               </div>

               {/* SINGLES: ESQUERDA | DIREITA | OUTROS */}
               {(singles.length > 0 || doubles.length === 0) && (
                 <div className="flex flex-col md:flex-row min-h-[40px] divide-y md:divide-y-0 md:divide-x divide-gray-400 print:divide-black">
                    {/* ESQUERDA */}
                    {(esquerdas.length > 0 || maxAberturas > 0) && (
                      <div className="flex-1 flex flex-col p-0">
                         {esqAberturas.length > 0 ? esqAberturas.map(abLabel => (
                           <div key={abLabel} className="w-full border-b border-gray-200 last:border-b-0 print:border-black/50">
                             <div className="text-center font-bold text-[9px] uppercase border-b border-gray-200 bg-gray-50 py-0.5 print:border-black/50 print:bg-transparent">
                               {abLabel}
                             </div>
                             <div className="p-2 flex flex-col gap-1">
                               {esquerdas.filter(x => x.abertura === abLabel).map((item, idxx) => (
                                 <div key={idxx} className="flex justify-between items-center text-xs">
                                   <span className="font-mono text-gray-800 font-semibold print:text-black">{item.dimensao}</span>
                                   <span className="font-bold text-gray-900 print:text-black">{item.qtd}</span>
                                 </div>
                               ))}
                             </div>
                           </div>
                         )) : null}
                      </div>
                    )}

                    {/* DIREITA */}
                    {(direitas.length > 0 || maxAberturas > 0) && (
                      <div className="flex-1 flex flex-col p-0">
                         {dirAberturas.length > 0 ? dirAberturas.map(abLabel => (
                           <div key={abLabel} className="w-full border-b border-gray-200 last:border-b-0 print:border-black/50">
                             <div className="text-center font-bold text-[9px] uppercase border-b border-gray-200 bg-gray-50 py-0.5 print:border-black/50 print:bg-transparent">
                               {abLabel}
                             </div>
                             <div className="p-2 flex flex-col gap-1">
                               {direitas.filter(x => x.abertura === abLabel).map((item, idxx) => (
                                 <div key={idxx} className="flex justify-between items-center text-xs">
                                   <span className="font-mono text-gray-800 font-semibold print:text-black">{item.dimensao}</span>
                                   <span className="font-bold text-gray-900 print:text-black">{item.qtd}</span>
                                 </div>
                               ))}
                             </div>
                           </div>
                         )) : null}
                      </div>
                    )}

                    {/* OUTROS */}
                    {outros.length > 0 && (
                       <div className="flex-1 flex flex-col p-0 border-b border-gray-200 last:border-b-0 print:border-black/50">
                         <div className="text-center font-bold text-[9px] uppercase border-b border-gray-200 bg-gray-50 py-0.5 print:border-black/50 print:bg-transparent">
                           OUTROS / ESPECIAIS
                         </div>
                         <div className="p-2 flex flex-col gap-1">
                           {outros.map((item, idxx) => (
                             <div key={idxx} className="flex justify-between items-center text-xs">
                               <div className="flex flex-col">
                                 <span className="text-[8px] font-bold text-brand-green uppercase leading-tight">{item.abertura}</span>
                                 <span className="font-mono text-gray-800 font-semibold print:text-black">{item.dimensao}</span>
                               </div>
                               <span className="font-bold text-gray-900 print:text-black">{item.qtd}</span>
                             </div>
                           ))}
                         </div>
                       </div>
                    )}
                 </div>
               )}

               {/* DOUBLES (SÓ DOBRADIÇAS BOX) */}
               {doubles.length > 0 && (
                 <div className="bg-amber-50/50 print:bg-transparent border-t border-gray-400 print:border-black p-2">
                    <div className="border border-[#eab308]/40 print:border-black rounded-sm bg-[#fefce8] print:bg-transparent p-2 text-center text-xs">
                      <div className="font-bold uppercase text-[#ca8a04] print:text-black mb-2 text-[10px]">
                        SÓ DOBRADIÇAS
                      </div>
                      <div className="flex flex-wrap justify-center gap-x-8 gap-y-2">
                        {doubles.map((item, idxx) => (
                          <div key={idxx} className="flex items-center gap-2 font-mono text-gray-800 font-semibold print:text-black">
                            <span>{item.dimensao}:</span>
                            <span>{item.qtd} Esq / {item.qtd} Dir</span>
                          </div>
                        ))}
                      </div>
                    </div>
                 </div>
               )}

            </div>
         );
      })}
    </div>
  );
}

function renderAutoPortas(kits: any[], responsavel?: string, obra?: string) {
  // Group by (1) Caracteristica -> (2) Medida + Acabamento
  const grouped = new Map<string, Array<{dimensao: string, acabamento: string, qtdTotal: number}>>();
  
  kits.forEach(k => {
    const fLargura = k.folhaLargura;
    const fAltura = k.folhaAltura;
    // Ignorar kits que não são do tipo porta (ex: PM-Aduela) ou que não possuem dimensão
    if (!fLargura || !fAltura || fLargura === '-' || fAltura === '-') return;

    const fQtd = parseInt(k.qtdeFolhasPorKit || '1', 10) || 1;
    const acabamento = k.acabamentoPorta || '-';
    // Mapeamento correto para a característica da porta
    const caracteristica = (k.caracteristicaPorta || k.modelo || 'HONEY').toUpperCase();
    const isDuplo = !!k.kitDuplo || parseInt(k.qtdeFolhasPorKit || '1', 10) > 1;
    
    // Qtde real de folhas = quantidade no kit
    // Em relatórios de portas a qtde mostrada costuma ser a de conjuntos ou folhas dependendo, mas se o kit for duplo, o usuário disse: '2 folhas', qtde: 2 ?
    // "1 KIT DE LARGURA DE 1020 ... SENDO 2 FOLHAS DE 510", então a qtde deve ser multiplicada ou apenas indicamos a QTD do kit?
    // "Qtde real de folhas = quantidade no kit * (se duplo x 2)" - was there already, let's keep it.
    const qtde = isDuplo ? fQtd * 2 : fQtd;

    let dimensao = `${fLargura}x${fAltura}`;
    if (isDuplo && fLargura.match(/^\d+$/)) {
      let metade = parseInt(fLargura, 10) / 2;
      dimensao = `${fLargura}x${fAltura} (2x ${metade}x${fAltura})`;
    } else if (isDuplo) {
      dimensao = `${fLargura}x${fAltura} (Duplo)`;
    }

    if (!grouped.has(caracteristica)) {
      grouped.set(caracteristica, []);
    }

    const items = grouped.get(caracteristica)!;
    const existing = items.find(i => i.dimensao === dimensao && i.acabamento === acabamento);
    if (existing) {
      existing.qtdTotal += qtde;
    } else {
      items.push({ dimensao, acabamento, qtdTotal: qtde });
    }
  });

  if (grouped.size === 0) {
    return <div className="text-center p-4 text-gray-500">Nenhum dado de porta com dimensões para exibir.</div>;
  }

  return (
    <div className="space-y-6">
      {Array.from(grouped.entries()).map(([caracteristica, items], idx) => (
        <div key={idx} className="rounded border border-gray-300 dark:border-gray-800 print:border-transparent overflow-hidden shadow-sm print:shadow-none break-inside-avoid bg-white dark:bg-[#0f172a] print:bg-white mb-6">
          <div className="bg-gray-100 dark:bg-slate-800 border-b border-gray-300 dark:border-slate-700 py-1.5 text-center font-bold text-sm uppercase print:bg-transparent print:border-transparent print:text-black">
             {caracteristica}
          </div>
          <div className="print:mt-2">
            <table className="min-w-full divide-y divide-gray-300 dark:divide-slate-800 print:divide-black text-[11px] sm:text-sm print:border print:border-black">
              <thead className="bg-[#f8fafc] dark:bg-[#0f172a] print:bg-transparent">
                <tr>
                  <th className="px-4 py-3 text-center font-bold uppercase whitespace-nowrap border-x border-gray-300 dark:border-slate-800 print:border-black text-gray-800 dark:text-emerald-400 print:text-black">
                    Medidas
                  </th>
                  <th className="px-4 py-3 text-center font-bold uppercase whitespace-nowrap border-x border-gray-300 dark:border-slate-800 print:border-black text-gray-800 dark:text-emerald-400 print:text-black w-24">
                    Quantidade
                  </th>
                  <th className="px-4 py-3 text-center font-bold uppercase whitespace-nowrap border-x border-gray-300 dark:border-slate-800 print:border-black text-gray-800 dark:text-emerald-400 print:text-black">
                    Acabamento da Porta
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-800 print:divide-black">
                {items.map((k, idx2) => (
                  <tr key={idx2} className="bg-white dark:bg-[#151f32] print:bg-transparent hover:bg-gray-50 print:hover:bg-transparent">
                    <td className="px-4 py-3 text-center border-x border-gray-200 dark:border-slate-800 print:border-black text-gray-900 dark:text-white print:text-black font-bold">
                      {k.dimensao}
                    </td>
                    <td className="px-4 py-3 text-center border-x border-gray-200 dark:border-slate-800 print:border-black text-gray-900 dark:text-white print:text-black font-bold w-24">
                      {k.qtdTotal}
                    </td>
                    <td className="px-4 py-3 text-center border-x border-gray-200 dark:border-slate-800 print:border-black text-gray-900 dark:text-white print:text-black font-semibold">
                      {k.acabamento}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

function renderAutoAduelas(kits: any[], responsavel?: string, obra?: string) {
  // Group by (1) Acabamento -> (2) Altura
  const grouped = new Map<string, Map<string, Array<{dimensao: string, qtdTotal: number}>>>();

  kits.forEach(k => {
    const aLargura = k.aduelaLargura;
    const aAltura = k.aduelaAltura;
    if (!aLargura || !aAltura || aLargura === '-' || aAltura === '-') return;

    const acadamento = (k.acabamentoAduela || '-').toUpperCase();
    const altura = aAltura;
    const dimensao = `${aLargura}x${aAltura}`;
    const fQtd = parseInt(k.qtdeFolhasPorKit || '1', 10) || 1;

    if (!grouped.has(acadamento)) {
      grouped.set(acadamento, new Map());
    }

    const alturasMap = grouped.get(acadamento)!;
    if (!alturasMap.has(altura)) {
      alturasMap.set(altura, []);
    }

    const items = alturasMap.get(altura)!;
    const existing = items.find(i => i.dimensao === dimensao);
    if (existing) {
      existing.qtdTotal += fQtd;
    } else {
      items.push({ dimensao, qtdTotal: fQtd });
    }
  });

  if (grouped.size === 0) {
    return <div className="text-center p-4 text-gray-500">Nenhum dado de aduela com dimensões para exibir.</div>;
  }

  // Sort Alturas string array
  return (
    <div className="space-y-6">
      {Array.from(grouped.entries()).map(([acabamento, alturasMap], idx) => {
         const alturas = Array.from(alturasMap.keys()).sort();
         return (
           <div key={idx} className="rounded border border-gray-300 dark:border-gray-800 print:border-transparent overflow-hidden shadow-sm print:shadow-none break-inside-avoid bg-gray-50 dark:bg-slate-900 print:bg-white mb-8">
             <div className="bg-gray-200 dark:bg-slate-800 border-b border-gray-300 dark:border-slate-700 py-2 text-center font-bold text-sm uppercase print:bg-transparent print:border-transparent print:text-black">
                {acabamento}
             </div>
             
             <div className="p-4 print:p-0 flex flex-col gap-6 print:gap-4 print:mt-2">
               {alturas.map((altura, aIdx) => {
                  const items = alturasMap.get(altura)!;
                  return (
                    <div key={altura} className="rounded border border-gray-300 dark:border-slate-700 print:border-transparent overflow-hidden bg-white dark:bg-[#0f172a] shadow-sm print:shadow-none">
                       <table className="min-w-full divide-y divide-gray-300 dark:divide-slate-800 print:divide-black text-[11px] sm:text-sm print:border print:border-black">
                          <thead className="bg-[#f8fafc] dark:bg-slate-800/50 print:bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-center font-bold uppercase whitespace-nowrap border-x border-gray-300 dark:border-slate-700 print:border-black text-gray-800 dark:text-emerald-400 print:text-black w-1/2">
                                Medidas
                              </th>
                              <th className="px-4 py-3 text-center font-bold uppercase whitespace-nowrap border-x border-gray-300 dark:border-slate-700 print:border-black text-gray-800 dark:text-emerald-400 print:text-black w-1/2">
                                Quantidade
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-slate-800 print:divide-black">
                            {items.map((k, idx2) => (
                              <tr key={idx2} className="hover:bg-gray-50 print:hover:bg-transparent">
                                <td className="px-4 py-3 text-center border-x border-gray-200 dark:border-slate-800 print:border-black text-gray-900 dark:text-white print:text-black font-bold">
                                  {k.dimensao}
                                </td>
                                <td className="px-4 py-3 text-center border-x border-gray-200 dark:border-slate-800 print:border-black text-gray-900 dark:text-white print:text-black font-bold">
                                  {k.qtdTotal}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                       </table>
                    </div>
                  );
               })}
             </div>
           </div>
         );
      })}
    </div>
  );
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

