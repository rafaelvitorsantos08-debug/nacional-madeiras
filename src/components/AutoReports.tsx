
import React, { useMemo } from 'react';

const EditableText = ({ children }: { children: React.ReactNode }) => (
  <span 
    contentEditable 
    suppressContentEditableWarning 
    className="outline-none inline-block w-full focus:bg-black/5 dark:focus:bg-white/5 rounded px-1 transition-colors min-h-[1em]"
  >
    {children}
  </span>
);

export function AutoReportsViewer({ kits, reportType, responsavel, obra, cliente }: { kits: any[], reportType: string, responsavel?: string, obra?: string, cliente?: string }) {
  const content = useMemo(() => {
    switch (reportType) {
      case 'auto_portas': return renderAutoPortas(kits, responsavel, obra);
      case 'auto_aduelas': return renderAutoAduelas(kits, responsavel, obra);
      case 'auto_alizares': return renderAutoAlizares(kits); // Alizares may need it too if it takes it, but currently it doesn't.
      case 'auto_usinagem_portas': return renderUsinagem(kits, 'portas', responsavel, obra);
      case 'auto_usinagem_aduelas': return renderUsinagem(kits, 'aduelas', responsavel, obra);
      case 'auto_vergas': return renderAutoVergas(kits); // Same here
      case 'auto_montagem': return renderAutoMontagem(kits, responsavel, obra, cliente);
      case 'auto_entrega': return renderAutoEntrega(kits, responsavel, obra, cliente);
      default: return null;
    }
  }, [kits, reportType, responsavel, obra, cliente]);

  return <div className="mt-4">{content}</div>;
}

function TableLayout({ headers, rows }: { headers: string[], rows: (string | number)[][] }) {
  return (
    <div className="border border-gray-300 dark:border-gray-600 print:border-transparent rounded overflow-x-auto shadow-sm print:shadow-none break-inside-avoid print:mt-4">
      <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-600 print:divide-gray-300 text-[11px] sm:text-sm print:border-y print:border-gray-300">
        <thead className="bg-[#0f172a] text-white print:bg-transparent print:text-black">
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="px-3 py-2 text-center font-semibold uppercase whitespace-nowrap border-x border-[#1e293b] print:border-transparent">
                <EditableText>{h}</EditableText>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 print:bg-transparent divide-y divide-gray-200 dark:divide-gray-700 print:divide-gray-300">
          {rows.map((row, idx) => (
            <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700 print:hover:bg-transparent">
              {row.map((cell, cIdx) => (
                <td key={cIdx} className="px-3 py-2 text-center border-x border-gray-200 print:border-transparent font-medium text-gray-900 dark:text-gray-100 print:text-black">
                  <EditableText>{cell || '-'}</EditableText>
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
    caracteristicas: Set<string>,
    acabamentos: Set<string>,
    fechMarcas: Set<string>,
    fechGrids: Set<string>,
    singles: Array<{abertura: string, dimensao: string, qtd: number, itemMeta: string}>,
    doubles: Array<{dimensao: string, qtd: number, itemMeta: string}>
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

    if (abertura.includes('P/FORA') || abertura.includes('P/ FORA')) {
      fTipo += ' P/FORA';
    }

    let isDuplo = !!k.kitDuplo || parseInt(k.qtdeFolhasPorKit || '1', 10) > 1;

    const carac = mode === 'portas' ? (k.caracteristicaPorta || k.modelo || k.tipologia) : (k.modelo || k.tipologia);
    const acab = mode === 'portas' ? k.acabamentoPorta : k.acabamentoAduela;

    const charStr = String(carac || '-').toUpperCase().trim();
    const acabStr = String(acab || '-').toUpperCase().trim();
    const fechMarca = String(k.fechaduraMarca || '-').toUpperCase().trim();
    const fechGrid = String(k.fechaduraGrid || '-').toUpperCase().trim();
    const dobMarca = String(k.dobradicaMarca || '-').toUpperCase().trim();
    const dobMedida = String(k.dobradicaMedida || '-').toUpperCase().trim();

    let groupKey = `${mode}_${charStr}_${acabStr}_${fechMarca}_${fechGrid}_${dobMarca}_${dobMedida}`;

    if (!grouped.has(groupKey)) {
      grouped.set(groupKey, { 
        singles: [], doubles: [],
        caracteristicas: new Set(), acabamentos: new Set(), fechMarcas: new Set(), fechGrids: new Set()
      });
    }
    const groupItems = grouped.get(groupKey)!;

    if (carac && carac !== '-') groupItems.caracteristicas.add(String(carac).toUpperCase());
    if (acab && acab !== '-') groupItems.acabamentos.add(String(acab).toUpperCase());
    if (k.fechaduraMarca && k.fechaduraMarca !== '-') groupItems.fechMarcas.add(String(k.fechaduraMarca).toUpperCase());
    if (k.fechaduraGrid && k.fechaduraGrid !== '-') groupItems.fechGrids.add(String(k.fechaduraGrid).toUpperCase());

    const itemMeta = fTipo.replace(' P/FORA', '');

    if (isDuplo) {
      let dimensao = `${fLargura}x${fAltura}`;
      if (mode === 'portas' && fLargura.match(/^\d+$/)) {
        let metade = parseInt(fLargura, 10) / 2;
        dimensao = `${fLargura}x${fAltura} (2x ${metade}x${fAltura})`;
      } else if (mode === 'portas') {
         dimensao = `${fLargura}x${fAltura} (Duplo)`;
      }

      const existing = groupItems.doubles.find(i => i.dimensao === dimensao && i.itemMeta === itemMeta);
      if (existing) {
        existing.qtd += 1;
      } else {
        groupItems.doubles.push({ dimensao, qtd: 1, itemMeta });
      }
    } else {
      let dimensao = `${fLargura}x${fAltura}`;
      const existing = groupItems.singles.find(i => i.abertura === abertura && i.dimensao === dimensao && i.itemMeta === itemMeta);
      if (existing) {
        existing.qtd += 1;
      } else {
        groupItems.singles.push({ abertura, dimensao, qtd: 1, itemMeta });
      }
    }
  });

  if (grouped.size === 0) {
    return <div className="text-center p-4 text-gray-500">Nenhum dado com dimensões para exibir.</div>;
  }

  // Define the required order
  const typeOrder = [
    "ADUELAS_PADRAO",
    "WC",
    "WC P/FORA",
    "INTERNA",
    "INTERNA P/FORA",
    "EXTERNA",
    "EXTERNA P/FORA",
    "EXTERNA MEIO CILINDRO",
    "EXTERNA MEIO CILINDRO P/FORA",
    "SÓ MAÇANETA",
    "SÓ MAÇANETA P/FORA",
    "SÓ DOBRADIÇAS",
    "SÓ DOBRADIÇAS P/FORA"
  ];

  const sortedEntries = Array.from(grouped.entries()).sort((a, b) => {
    return a[0].localeCompare(b[0]);
  });

  const getSortIndex = (meta: string) => {
    const idx = typeOrder.findIndex(t => t.startsWith(meta));
    return idx === -1 ? 999 : idx;
  };

  const sortItems = (items: Array<{dimensao: string, qtd: number, itemMeta: string}>) => {
    return items.sort((a, b) => {
      const sortA = getSortIndex(a.itemMeta);
      const sortB = getSortIndex(b.itemMeta);
      if (sortA !== sortB) return sortA - sortB;
      return a.dimensao.localeCompare(b.dimensao);
    });
  };

  return (
    <div className="block">
      {sortedEntries.map(([groupKey, groupData]) => {
         const { singles, doubles } = groupData;
         
         const esquerdas = singles.filter(i => i.abertura.includes('ESQUERDA'));
         const direitas = singles.filter(i => i.abertura.includes('DIREITA'));
         const outros = singles.filter(i => !i.abertura.includes('ESQUERDA') && !i.abertura.includes('DIREITA'));

         const esqAberturas = Array.from(new Set(esquerdas.map(i => i.abertura)));
         const dirAberturas = Array.from(new Set(direitas.map(i => i.abertura)));

         type RowElement = { type: 'header', label: string } | { type: 'item', item: { dimensao: string, qtd: number, itemMeta: string } };
         const leftElements: RowElement[] = [];
         esqAberturas.forEach(ab => {
             leftElements.push({ type: 'header', label: ab });
             sortItems(esquerdas.filter(x => x.abertura === ab)).forEach(item => leftElements.push({ type: 'item', item }));
         });
         const rightElements: RowElement[] = [];
         dirAberturas.forEach(ab => {
             rightElements.push({ type: 'header', label: ab });
             sortItems(direitas.filter(x => x.abertura === ab)).forEach(item => rightElements.push({ type: 'item', item }));
         });

         const maxRows = Math.max(leftElements.length, rightElements.length);

         return (
            <div key={groupKey} className="break-inside-avoid mb-6 print:mb-6 shadow-sm print:shadow-none bg-white" style={{ pageBreakInside: 'avoid' }}>
              <table className="w-full border-collapse border border-black print:border-black print:border-solid text-[11px] sm:text-xs bg-white print:bg-white overflow-hidden" style={{ pageBreakInside: 'avoid' }}>
                <thead>
                  {mode === 'portas' && (
                    <tr>
                      <th colSpan={2} className="bg-gray-200 dark:bg-[#0f172a] print:bg-gray-200 border-b border-black print:border-black print:border-solid py-1 text-center font-bold uppercase text-[12px] text-gray-900 dark:text-gray-100 print:text-black">
                        <EditableText>{Array.from(groupData.caracteristicas).join(" / ") || "CARACTERÍSTICA PADRÃO"}</EditableText>
                      </th>
                    </tr>
                  )}
                  <tr>
                    <th className="bg-gray-100 dark:bg-gray-800/50 print:bg-gray-100 border-b border-r border-black print:border-black print:border-solid py-1 px-2 text-left uppercase font-bold text-[9px] w-1/2 text-gray-800 dark:text-gray-200 print:text-black">
                      <span className="font-semibold text-gray-500 uppercase mr-1">ACABAMENTO:</span>
                      <EditableText>{Array.from(groupData.acabamentos).join(" / ") || "-"}</EditableText>
                    </th>
                    <th className="bg-gray-100 dark:bg-gray-800/50 print:bg-gray-100 border-b border-black print:border-black print:border-solid py-1 px-2 text-left uppercase font-bold text-[9px] w-1/2 text-gray-800 dark:text-gray-200 print:text-black">
                      <span className="font-semibold text-gray-500 uppercase mr-1">FECHADURA:</span>
                      <EditableText>{Array.from(groupData.fechMarcas).join(" / ")} {groupData.fechGrids.size > 0 && Array.from(groupData.fechGrids).filter(Boolean).length > 0 ? `- GRID ${Array.from(groupData.fechGrids).filter(Boolean).join(" / ")}` : ""}</EditableText>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(maxRows > 0 || doubles.length === 0) && (
                    <>
                      {Array.from({ length: maxRows }).map((_, idx) => {
                         const l = leftElements[idx];
                         const r = rightElements[idx];
                         return (
                           <tr key={idx} className="border-b border-black print:border-black print:border-solid last:border-b-0">
                             {/* COLUNA ESQUERDA */}
                             <td className="w-1/2 p-0 border-r border-black print:border-black print:border-solid align-top">
                               {l ? (
                                  l.type === 'header' ? (
                                    <div className="flex bg-gray-50 dark:bg-gray-800/30 print:bg-gray-50 items-stretch w-full h-full">
                                      <div className="flex-1 text-center font-bold text-[9px] uppercase px-2 py-1.5 flex items-center justify-center text-gray-700 dark:text-gray-300 print:text-black">
                                         <EditableText>{l.label}</EditableText>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-center w-full h-full py-1">
                                      <div className="flex items-center justify-center gap-4 sm:gap-8">
                                        <div className="font-mono font-semibold print:text-black text-gray-900 dark:text-gray-100 w-24 text-right">
                                          <EditableText>{l.item.dimensao}</EditableText>
                                        </div>
                                        <div className="font-bold print:text-black text-gray-900 dark:text-gray-100 w-8 text-center shrink-0">
                                          <EditableText>{l.item.qtd}</EditableText>
                                        </div>
                                        <div className="font-bold text-[10px] uppercase print:text-black text-gray-600 dark:text-gray-400 w-24 text-left">
                                          <EditableText>{mode === 'portas' && l.item.itemMeta ? String(l.item.itemMeta) : ''}</EditableText>
                                        </div>
                                      </div>
                                    </div>
                                  )
                               ) : <div className="h-full min-h-[24px]"></div>}
                             </td>
                             
                             {/* COLUNA DIREITA */}
                             <td className="w-1/2 p-0 align-top">
                               {r ? (
                                  r.type === 'header' ? (
                                    <div className="flex bg-gray-50 dark:bg-gray-800/30 print:bg-gray-50 items-stretch w-full h-full">
                                      <div className="flex-1 text-center font-bold text-[9px] uppercase px-2 py-1.5 flex items-center justify-center text-gray-700 dark:text-gray-300 print:text-black">
                                         <EditableText>{r.label}</EditableText>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-center w-full h-full py-1">
                                      <div className="flex items-center justify-center gap-4 sm:gap-8">
                                        <div className="font-mono font-semibold print:text-black text-gray-900 dark:text-gray-100 w-24 text-right">
                                          <EditableText>{r.item.dimensao}</EditableText>
                                        </div>
                                        <div className="font-bold print:text-black text-gray-900 dark:text-gray-100 w-8 text-center shrink-0">
                                          <EditableText>{r.item.qtd}</EditableText>
                                        </div>
                                        <div className="font-bold text-[10px] uppercase print:text-black text-gray-600 dark:text-gray-400 w-24 text-left">
                                          <EditableText>{mode === 'portas' && r.item.itemMeta ? String(r.item.itemMeta) : ''}</EditableText>
                                        </div>
                                      </div>
                                    </div>
                                  )
                               ) : <div className="h-full min-h-[24px]"></div>}
                             </td>
                           </tr>
                         );
                      })}
                    </>
                  )}
                   {/* OUTROS / ESPECIAIS */}
                  {outros.length > 0 && (
                     <tr>
                       <td colSpan={2} className="border-t border-black print:border-black print:border-solid p-0">
                         <div className="text-center font-bold text-[9px] uppercase border-b border-black print:border-black print:border-solid bg-gray-50 dark:bg-gray-800/30 text-gray-700 dark:text-gray-300 py-1 print:bg-gray-50 print:text-black">
                           OUTROS / ESPECIAIS
                         </div>
                         {outros.map((item, idxx) => (
                           <div key={idxx} className="flex items-center justify-center w-full border-b border-black print:border-black last:border-b-0 print:border-solid py-1">
                             <div className="flex items-center justify-center gap-4 sm:gap-8">
                               <div className="font-mono font-semibold print:text-black flex items-center justify-end text-gray-900 dark:text-gray-100 gap-2 w-32 text-right">
                                 <span className="text-[9px] font-bold text-brand-green uppercase leading-tight">{item.abertura}</span>
                                 <span>{item.dimensao}</span>
                               </div>
                               <div className="font-bold print:text-black text-gray-900 dark:text-gray-100 w-8 text-center shrink-0">
                                 <EditableText>{item.qtd}</EditableText>
                               </div>
                               <div className="font-bold text-[10px] uppercase print:text-black text-gray-600 dark:text-gray-400 w-32 text-left">
                                 <EditableText>{mode === 'portas' && item.itemMeta ? String(item.itemMeta) : ''}</EditableText>
                               </div>
                             </div>
                           </div>
                         ))}
                       </td>
                     </tr>
                  )}

                  {/* SÓ DOBRADIÇAS BOX */}
                  {doubles.length > 0 && (
                    <tr>
                      <td colSpan={2} className="border-t border-black print:border-black print:border-solid p-2">
                        <div className="text-center">
                          <div className="font-bold uppercase text-gray-800 dark:text-gray-200 print:text-black mb-2 text-[10px]">
                            SÓ DOBRADIÇAS
                          </div>
                          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2">
                            {doubles.map((item, idxx) => (
                              <div key={idxx} className="flex items-center gap-2 font-mono font-semibold text-gray-800 dark:text-gray-300 print:text-black">
                                <span>{item.dimensao}:</span>
                                <span className="font-black text-gray-900 dark:text-gray-100 print:text-black"><EditableText>{item.qtd}</EditableText> Esq / <EditableText>{item.qtd}</EditableText> Dir</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
         );
      })}
    </div>
  );
}

function renderAutoPortas(kits: any[], responsavel?: string, obra?: string) {
  // Group by (1) Caracteristica -> (2) Medida + Acabamento + the 5 new columns
  const grouped = new Map<string, Array<{
    dimensao: string, 
    acabamento: string, 
    qtdTotal: number,
    bitsQtde: string,
    correr: boolean,
    veneziana: boolean,
    grelha: boolean,
    bandeira: boolean
  }>>();
  
  let showBits = false;
  let showCorrer = false;
  let showVen = false;
  let showGre = false;
  let showBand = false;

  kits.forEach(k => {
    const fLargura = k.folhaLargura;
    const fAltura = k.folhaAltura;
    // Ignorar kits que não são do tipo porta (ex: PM-Aduela) ou que não possuem dimensão
    if (!fLargura || !fAltura || fLargura === '-' || fAltura === '-') return;

    const fQtd = parseInt(k.qtdeFolhasPorKit || '1', 10) || 1;
    const acabamento = k.acabamentoPorta || '-';
    // Mapeamento correto para a característica da porta
    const caracteristica = (k.caracteristicaPorta || k.modelo || 'HONEY').toUpperCase();
    const isMultiFolhas = fQtd > 1;
    
    const bitsQtde = k.bitsQtde || '';
    const correr = !!k.correr;
    const veneziana = !!k.veneziana;
    const grelha = !!k.grelha;
    const bandeira = !!k.bandeira;

    if (bitsQtde && bitsQtde !== '-' && bitsQtde !== '0') showBits = true;
    if (correr) showCorrer = true;
    if (veneziana) showVen = true;
    if (grelha) showGre = true;
    if (bandeira) showBand = true;

    let dimensao = `${fLargura}x${fAltura}`;
    if (isMultiFolhas && String(fLargura).match(/^\d+$/)) {
      let divisor = parseInt(fLargura, 10) / fQtd;
      dimensao = `${fLargura}x${fAltura} (${fQtd}x ${divisor}x${fAltura})`;
    } else if (isMultiFolhas) {
      dimensao = `${fLargura}x${fAltura} (${fQtd} folhas)`;
    }

    if (!grouped.has(caracteristica)) {
      grouped.set(caracteristica, []);
    }

    const items = grouped.get(caracteristica)!;
    let kitCount = 1;
    if ((k as any).quantidade) kitCount = parseInt((k as any).quantidade, 10) || 1;
    if ((k as any).qtde) kitCount = parseInt((k as any).qtde, 10) || 1;
    
    // Qtde na view "Relatório: Portas".
    // Quantidade = número de KITS (não multiplicar por qtde de folhas do kit de novo, a dimensão já diz)
    const existing = items.find(i => 
      i.dimensao === dimensao && 
      i.acabamento === acabamento &&
      i.bitsQtde === bitsQtde &&
      i.correr === correr &&
      i.veneziana === veneziana &&
      i.grelha === grelha &&
      i.bandeira === bandeira
    );
    if (existing) {
      existing.qtdTotal += kitCount;
    } else {
      items.push({ dimensao, acabamento, qtdTotal: kitCount, bitsQtde, correr, veneziana, grelha, bandeira });
    }
  });

  if (grouped.size === 0) {
    return <div className="text-center p-4 text-gray-500">Nenhum dado de porta com dimensões para exibir.</div>;
  }

  return (
    <div className="block">
      {Array.from(grouped.entries()).map(([caracteristica, items], idx) => (
        <div key={idx} className="rounded border border-gray-300 dark:border-gray-800 print:border-transparent overflow-hidden shadow-sm print:shadow-none break-inside-avoid bg-white dark:bg-[#0f172a] print:bg-white mb-6 print:mb-6" style={{ pageBreakInside: 'avoid' }}>
          <div className="bg-gray-100 dark:bg-slate-800 border-b border-gray-300 dark:border-slate-700 py-1.5 text-center font-bold text-sm uppercase print:bg-transparent print:border-transparent print:text-black">
             <EditableText>{caracteristica}</EditableText>
          </div>
          <div className="print:mt-2">
            <table className="min-w-full divide-y divide-gray-300 dark:divide-slate-800 print:divide-gray-300 text-[11px] sm:text-sm print:border-y print:border-gray-300" style={{ pageBreakInside: 'avoid' }}>
              <thead className="bg-[#f8fafc] dark:bg-[#0f172a] print:bg-transparent">
                <tr>
                  <th className="px-4 py-3 text-center font-bold uppercase whitespace-nowrap border-x border-gray-300 dark:border-slate-800 print:border-transparent text-gray-800 dark:text-emerald-400 print:text-black">
                    Medidas
                  </th>
                  <th className="px-4 py-3 text-center font-bold uppercase whitespace-nowrap border-x border-gray-300 dark:border-slate-800 print:border-transparent text-gray-800 dark:text-emerald-400 print:text-black">
                    Quantidade
                  </th>
                  <th className="px-4 py-3 text-center font-bold uppercase whitespace-nowrap border-x border-gray-300 dark:border-slate-800 print:border-transparent text-gray-800 dark:text-emerald-400 print:text-black">
                    Acabamento da Porta
                  </th>
                  {showBits && <th className="px-4 py-3 text-center font-bold uppercase whitespace-nowrap border-x border-gray-300 dark:border-slate-800 print:border-transparent text-gray-800 dark:text-emerald-400 print:text-black">B. Qtd</th>}
                  {showCorrer && <th className="px-4 py-3 text-center font-bold uppercase whitespace-nowrap border-x border-gray-300 dark:border-slate-800 print:border-transparent text-gray-800 dark:text-emerald-400 print:text-black">Correr</th>}
                  {showVen && <th className="px-4 py-3 text-center font-bold uppercase whitespace-nowrap border-x border-gray-300 dark:border-slate-800 print:border-transparent text-gray-800 dark:text-emerald-400 print:text-black">C. Ven</th>}
                  {showGre && <th className="px-4 py-3 text-center font-bold uppercase whitespace-nowrap border-x border-gray-300 dark:border-slate-800 print:border-transparent text-gray-800 dark:text-emerald-400 print:text-black">C. Gre</th>}
                  {showBand && <th className="px-4 py-3 text-center font-bold uppercase whitespace-nowrap border-x border-gray-300 dark:border-slate-800 print:border-transparent text-gray-800 dark:text-emerald-400 print:text-black">C. Band</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-800 print:divide-gray-300">
                {items.map((k, idx2) => (
                  <tr key={idx2} className="bg-white dark:bg-[#151f32] print:bg-transparent hover:bg-gray-50 print:hover:bg-transparent">
                    <td className="px-4 py-3 text-center border-x border-gray-200 dark:border-slate-800 print:border-transparent text-gray-900 dark:text-white print:text-black font-bold">
                      <EditableText>{k.dimensao}</EditableText>
                    </td>
                    <td className="px-4 py-3 text-center border-x border-gray-200 dark:border-slate-800 print:border-transparent text-gray-900 dark:text-white print:text-black font-bold">
                      <EditableText>{k.qtdTotal}</EditableText>
                    </td>
                    <td className="px-4 py-3 text-center border-x border-gray-200 dark:border-slate-800 print:border-transparent text-gray-900 dark:text-white print:text-black font-semibold">
                      <EditableText>{k.acabamento}</EditableText>
                    </td>
                    {showBits && (
                      <td className="px-4 py-3 text-center border-x border-gray-200 dark:border-slate-800 print:border-transparent text-gray-900 dark:text-white print:text-black font-semibold">
                        <EditableText>{k.bitsQtde || '-'}</EditableText>
                      </td>
                    )}
                    {showCorrer && (
                      <td className="px-4 py-3 text-center border-x border-gray-200 dark:border-slate-800 print:border-transparent text-gray-900 dark:text-white print:text-black font-semibold">
                        <EditableText>{k.correr ? 'X' : ''}</EditableText>
                      </td>
                    )}
                    {showVen && (
                      <td className="px-4 py-3 text-center border-x border-gray-200 dark:border-slate-800 print:border-transparent text-gray-900 dark:text-white print:text-black font-semibold">
                        <EditableText>{k.veneziana ? 'X' : ''}</EditableText>
                      </td>
                    )}
                    {showGre && (
                      <td className="px-4 py-3 text-center border-x border-gray-200 dark:border-slate-800 print:border-transparent text-gray-900 dark:text-white print:text-black font-semibold">
                        <EditableText>{k.grelha ? 'X' : ''}</EditableText>
                      </td>
                    )}
                    {showBand && (
                      <td className="px-4 py-3 text-center border-x border-gray-200 dark:border-slate-800 print:border-transparent text-gray-900 dark:text-white print:text-black font-semibold">
                        <EditableText>{k.bandeira ? 'X' : ''}</EditableText>
                      </td>
                    )}
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
    
    let kitCount = 1;
    if ((k as any).quantidade) kitCount = parseInt((k as any).quantidade, 10) || 1;
    if ((k as any).qtde) kitCount = parseInt((k as any).qtde, 10) || 1;

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
      existing.qtdTotal += kitCount;
    } else {
      items.push({ dimensao, qtdTotal: kitCount });
    }
  });

  if (grouped.size === 0) {
    return <div className="text-center p-4 text-gray-500">Nenhum dado de aduela com dimensões para exibir.</div>;
  }

  // Sort Alturas string array
  return (
    <div className="block">
      {Array.from(grouped.entries()).map(([acabamento, alturasMap], idx) => {
         const alturas = Array.from(alturasMap.keys()).sort();
         return (
           <div key={idx} className="rounded border border-gray-300 dark:border-gray-800 print:border-transparent overflow-hidden shadow-sm print:shadow-none break-inside-avoid bg-gray-50 dark:bg-slate-900 print:bg-white mb-8 print:mb-8" style={{ pageBreakInside: 'avoid' }}>
             <div className="bg-gray-200 dark:bg-slate-800 border-b border-gray-300 dark:border-slate-700 py-2 text-center font-bold text-sm uppercase print:bg-transparent print:border-transparent print:text-black">
                <EditableText>{acabamento}</EditableText>
             </div>
             
             <div className="p-4 print:p-0 flex flex-col gap-6 print:gap-4 print:mt-2">
               {alturas.map((altura, aIdx) => {
                  const items = alturasMap.get(altura)!;
                  return (
                    <div key={altura} className="rounded border border-gray-300 dark:border-slate-700 print:border-transparent overflow-hidden bg-white dark:bg-[#0f172a] shadow-sm print:shadow-none">
                       <table className="min-w-full divide-y divide-gray-300 dark:divide-slate-800 print:divide-gray-300 text-[11px] sm:text-sm print:border-y print:border-gray-300">
                          <thead className="bg-[#f8fafc] dark:bg-slate-800/50 print:bg-transparent">
                            <tr>
                              <th className="px-4 py-3 text-center font-bold uppercase whitespace-nowrap border-x border-gray-300 dark:border-slate-700 print:border-transparent text-gray-800 dark:text-emerald-400 print:text-black w-1/2">
                                Medidas
                              </th>
                              <th className="px-4 py-3 text-center font-bold uppercase whitespace-nowrap border-x border-gray-300 dark:border-slate-700 print:border-transparent text-gray-800 dark:text-emerald-400 print:text-black w-1/2">
                                Quantidade
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-slate-800 print:divide-gray-300">
                            {items.map((k, idx2) => (
                              <tr key={idx2} className="hover:bg-gray-50 print:hover:bg-transparent">
                                <td className="px-4 py-3 text-center border-x border-gray-200 dark:border-slate-800 print:border-transparent text-gray-900 dark:text-white print:text-black font-bold">
                                  <EditableText>{k.dimensao}</EditableText>
                                </td>
                                <td className="px-4 py-3 text-center border-x border-gray-200 dark:border-slate-800 print:border-transparent text-gray-900 dark:text-white print:text-black font-bold">
                                  <EditableText>{k.qtdTotal}</EditableText>
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
  const grouped = new Map<string, Map<string, number>>();

  kits.forEach(k => {
    let aLarg = k.aduelaLargura;
    const fLarg = k.folhaLargura;
    
    if (!aLarg || !fLarg || aLarg === '-' || fLarg === '-') return;

    aLarg = String(aLarg).replace(' cm', '').replace('cm', '').trim();
    const parsedFolha = parseInt(String(fLarg), 10);
    if (isNaN(parsedFolha)) return;

    const verga = `${parsedFolha + 47}`;
    
    let kitCount = 1;
    if ((k as any).quantidade) kitCount = parseInt((k as any).quantidade, 10) || 1;
    if ((k as any).qtde) kitCount = parseInt((k as any).qtde, 10) || 1;

    if (!grouped.has(verga)) {
      grouped.set(verga, new Map());
    }

    const aduelasMap = grouped.get(verga)!;
    aduelasMap.set(aLarg, (aduelasMap.get(aLarg) || 0) + kitCount);
  });

  if (grouped.size === 0) {
    return <div className="text-center p-4 text-gray-500">Nenhum dado de verga para exibir.</div>;
  }

  const sortedVergas = Array.from(grouped.entries()).sort((a, b) => parseInt(a[0]) - parseInt(b[0]));

  return (
    <div className="block">
      {sortedVergas.map(([verga, aduelasMap], idx) => {
         const aduelasList = Array.from(aduelasMap.entries()).sort((a, b) => parseInt(a[0]) - parseInt(b[0]));
         
         return (
           <div key={idx} className="rounded border border-gray-300 dark:border-gray-800 print:border-transparent overflow-hidden shadow-sm print:shadow-none break-inside-avoid bg-gray-50 dark:bg-slate-900 print:bg-white mb-6 print:mb-6" style={{ pageBreakInside: 'avoid' }}>
             <div className="bg-gray-200 dark:bg-slate-800 border-b border-gray-300 dark:border-slate-700 py-2 text-center font-bold text-sm uppercase print:bg-transparent print:border-transparent print:text-black">
                <EditableText>{`Verga (Folha + 47mm): ${verga}`}</EditableText>
             </div>
             <div className="print:mt-0">
               <table className="min-w-full divide-y divide-gray-300 dark:divide-slate-800 print:divide-gray-300 text-[11px] sm:text-sm print:border-y print:border-gray-300" style={{ pageBreakInside: 'avoid' }}>
                  <thead className="bg-[#f8fafc] dark:bg-[#0f172a] print:bg-transparent">
                    <tr>
                      <th className="px-4 py-2 text-center font-bold uppercase whitespace-nowrap border-x border-gray-300 dark:border-slate-800 print:border-transparent text-gray-800 dark:text-emerald-400 print:text-black w-1/2">
                        <EditableText>Aduela</EditableText>
                      </th>
                      <th className="px-4 py-2 text-center font-bold uppercase whitespace-nowrap border-x border-gray-300 dark:border-slate-800 print:border-transparent text-gray-800 dark:text-emerald-400 print:text-black w-1/2">
                        <EditableText>Quantidade</EditableText>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-slate-800 print:divide-gray-300">
                    {aduelasList.map(([aLarg, qtd], idx2) => (
                      <tr key={idx2} className="bg-white dark:bg-[#151f32] print:bg-transparent hover:bg-gray-50 print:hover:bg-transparent">
                        <td className="px-4 py-3 text-center border-x border-gray-200 dark:border-slate-800 print:border-transparent text-gray-900 dark:text-white print:text-black font-bold w-1/2">
                          <EditableText>{aLarg}</EditableText>
                        </td>
                        <td className="px-4 py-3 text-center border-x border-gray-200 dark:border-slate-800 print:border-transparent text-gray-900 dark:text-white print:text-black font-bold w-1/2">
                          <EditableText>{qtd}</EditableText>
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
             </div>
           </div>
         );
      })}
    </div>
  );
}

export function renderAutoMontagem(kits: any[], responsavel?: string, obra?: string, cliente?: string) {
  // Group by Tipologia first
  const byTipologia = new Map<string, any[]>();
  kits.forEach(k => {
    const tipo = k.tipologia || 'SEM TIPOLOGIA';
    if (!byTipologia.has(tipo)) byTipologia.set(tipo, []);
    byTipologia.get(tipo).push(k);
  });

  const tipologias = Array.from(byTipologia.keys()).sort();

  return (
    <div className="space-y-8 print:space-y-0 print:block">
      <style type="text/css">
        {`
          @media print {
            @page { size: landscape; }
            .montagem-page-break {
              page-break-after: always;
            }
            .montagem-page-break:last-child {
              page-break-after: auto;
            }
          }
        `}
      </style>

      {tipologias.map((tipo, idx) => {
        const tipoKits = byTipologia.get(tipo) || [];
        
        // Group by Abertura
        const byAbertura = new Map<string, any[]>();
        tipoKits.forEach(k => {
          const ab = k.abertura || 'SEM ABERTURA';
          if (!byAbertura.has(ab)) byAbertura.set(ab, []);
          byAbertura.get(ab).push(k);
        });

        const aberturas = Array.from(byAbertura.keys()).sort();

        return (
          <div key={idx} className="montagem-page-break print:w-full print:py-4 flex flex-col gap-6">
            <table className="min-w-full border-collapse">
              <thead className="print:table-header-group">
                {/* Print Header */}
                <tr className="hidden print:table-row">
                  <td colSpan={8} className="p-0 border-0">
                    <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-4 mt-2 print:border-black">
                       <div>
                         <h1 className="text-3xl font-bold uppercase tracking-tight text-black print:text-black mt-4">RELATÓRIO DE MONTAGEM</h1>
                       </div>
                       <div className="text-right text-xs text-black print:text-black flex flex-row items-end gap-6 border-b-2 border-transparent">
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
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="border border-gray-300 p-2">
                          <p className="text-xs uppercase text-gray-600 font-bold print:text-gray-600">Cliente</p>
                          <p className="font-medium text-lg print:text-black uppercase text-black">{cliente || "Não informado"}</p>
                        </div>
                        <div className="border border-gray-300 p-2">
                          <p className="text-xs uppercase text-gray-600 font-bold print:text-gray-600">Obra</p>
                          <p className="font-medium text-lg print:text-black text-black">{obra || "Não informado"}</p>
                        </div>
                        <div className="border border-gray-300 p-2">
                          <p className="text-xs uppercase text-gray-600 font-bold print:text-gray-600">Responsável</p>
                          <p className="font-medium text-lg print:text-black uppercase text-black">{responsavel || "Não informado"}</p>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>

                {/* Sub-Header / Tipo */}
                <tr>
                   <td colSpan={8} className="p-0 border-0">
                      <div className="bg-gray-200 dark:bg-slate-800 border-[1.5px] border-black print:border-black py-2 text-center font-bold text-sm uppercase mb-4 print:bg-transparent print:text-black">
                        <EditableText>Relatório de Montagem - {tipo}</EditableText>
                      </div>
                   </td>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 print:bg-transparent text-[11px] sm:text-sm print:text-sm">
                {aberturas.map((abertura, abIdx) => {
                  const abKits = byAbertura.get(abertura) || [];
                  
                  const grouped = new Map<string, any>();
                  abKits.forEach(k => {
                    const key = [
                      k.comodo, k.aduelaLargura, k.aduelaAltura, k.acabamentoAduela,
                      k.folhaLargura, k.folhaAltura, k.acabamentoPorta, k.caracteristicaPorta, k.corFolha,
                      k.fechaduraTipo, k.fechaduraMarca, k.fechaduraGrid,
                      k.dobradicaMarca, k.dobradicaMedida, k.qtdeDobradicas,
                      k.qtdeLadosAduela
                    ].join('||');

                    let stringQtdStr = '1';
                    if ((k as any).quantidade) stringQtdStr = String((k as any).quantidade);
                    if ((k as any).qtde) stringQtdStr = String((k as any).qtde);

                    const qty = parseInt(stringQtdStr, 10);
                    const validQty = isNaN(qty) ? 1 : qty;

                    if (grouped.has(key)) {
                      grouped.get(key).qtd += validQty;
                    } else {
                      const fech = [k.fechaduraTipo, k.fechaduraMarca, k.fechaduraGrid && `GRID ${k.fechaduraGrid}`].filter(Boolean).join(' / ');
                      const aduelaInfo = [
                        `${k.aduelaLargura || '-'}x${k.aduelaAltura || '-'}`, 
                        k.acabamentoAduela, 
                        k.qtdeLadosAduela && `${k.qtdeLadosAduela} lados`
                      ].filter(Boolean).join(' - ');
                      const dob = [k.dobradicaMarca, k.dobradicaMedida, k.qtdeDobradicas && `${k.qtdeDobradicas}un`].filter(Boolean).join(' / ');
                      
                      let acabPorta = k.acabamentoPorta || k.corFolha || '-';
                      let caracteristicas = k.caracteristicaPorta || '-';
                      
                      let leafSizeStr = `${k.folhaLargura || '-'} x ${k.folhaAltura || '-'}`;
                      const folhaQtd = parseInt(String(k.qtdeFolhasPorKit || '1'), 10);
                      if (!isNaN(folhaQtd) && folhaQtd > 1 && k.folhaLargura && !isNaN(parseInt(k.folhaLargura, 10))) {
                          const dividedWidth = parseInt(k.folhaLargura, 10) / folhaQtd;
                          leafSizeStr = `${k.folhaLargura} x ${k.folhaAltura || '-'} (${folhaQtd}x ${dividedWidth} x ${k.folhaAltura || '-'})`;
                      }

                      grouped.set(key, {
                        qtd: validQty,
                        folha: leafSizeStr,
                        caracteristicas,
                        acabamento: acabPorta,
                        aduela: aduelaInfo,
                        fechadura: fech || '-',
                        dobradica: dob || '-',
                      });
                    }
                  });

                  const rows = Array.from(grouped.values());

                  return (
                    <React.Fragment key={abIdx}>
                      {abIdx > 0 && (
                        <tr className="border-0 bg-transparent h-6 break-inside-avoid">
                           <td colSpan={8} className="border-0"></td>
                        </tr>
                      )}
                      {/* Abertura Header */}
                      <tr className="bg-gray-50 dark:bg-gray-700 print:bg-transparent border-t border-gray-300 w-full break-inside-avoid">
                        <td colSpan={8} className="px-3 py-2 text-center font-bold text-sm uppercase text-black dark:text-white print:text-black border-transparent print:border-transparent">
                          <EditableText>{abertura}</EditableText>
                        </td>
                      </tr>
                      {/* Títulos do Bloco */}
                      <tr className="bg-[#0f172a] text-white print:bg-transparent print:border-y print:border-gray-300 print:text-black font-semibold uppercase break-inside-avoid shadow-[0_1px_0_1px_#cbd5e1] print:shadow-none">
                        <th className="px-3 py-2 text-center whitespace-nowrap border-x border-[#1e293b] print:border-gray-300">QTD</th>
                        <th className="px-3 py-2 text-center whitespace-nowrap border-x border-[#1e293b] print:border-gray-300">FOLHA DE PORTA</th>
                        <th className="px-3 py-2 text-center whitespace-nowrap border-x border-[#1e293b] print:border-gray-300">CARACTERÍSTICAS</th>
                        <th className="px-3 py-2 text-center whitespace-nowrap border-x border-[#1e293b] print:border-gray-300">ACABAMENTO</th>
                        <th className="px-3 py-2 text-center whitespace-nowrap border-x border-[#1e293b] print:border-gray-300">INFO. ADUELA</th>
                        <th className="px-3 py-2 text-center whitespace-nowrap border-x border-[#1e293b] print:border-gray-300">FECH. GRID</th>
                        <th className="px-3 py-2 text-center whitespace-nowrap border-x border-[#1e293b] print:border-gray-300">DOBRADIÇAS</th>
                        <th className="px-3 py-2 text-center whitespace-nowrap border-x border-[#1e293b] print:border-gray-300">CONCLUÍDO</th>
                      </tr>
                      {/* Linhas de Dados */}
                      {rows.map((g, rIdx) => (
                        <tr key={rIdx} className="hover:bg-gray-50 dark:hover:bg-gray-700 print:hover:bg-transparent text-gray-900 dark:text-gray-100 print:text-black border-b border-gray-300 break-inside-avoid">
                          <td className="px-3 py-2 text-center border-x border-gray-200 print:border-gray-300 font-medium"><EditableText>{g.qtd}</EditableText></td>
                          <td className="px-3 py-2 text-center border-x border-gray-200 print:border-gray-300 font-medium"><EditableText>{g.folha}</EditableText></td>
                          <td className="px-3 py-2 text-center border-x border-gray-200 print:border-gray-300 font-medium"><EditableText>{g.caracteristicas}</EditableText></td>
                          <td className="px-3 py-2 text-center border-x border-gray-200 print:border-gray-300 font-medium"><EditableText>{g.acabamento}</EditableText></td>
                          <td className="px-3 py-2 text-center border-x border-gray-200 print:border-gray-300 font-medium"><EditableText>{g.aduela}</EditableText></td>
                          <td className="px-3 py-2 text-center border-x border-gray-200 print:border-gray-300 font-medium"><EditableText>{g.fechadura}</EditableText></td>
                          <td className="px-3 py-2 text-center border-x border-gray-200 print:border-gray-300 font-medium"><EditableText>{g.dobradica}</EditableText></td>
                          <td className="px-3 py-2 text-center border-x border-gray-200 print:border-gray-300 font-medium"> </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
            
            <div className="mt-8 mb-2 break-inside-avoid w-full">
              <p className="text-xs font-bold uppercase text-gray-800 dark:text-gray-200 print:text-black mb-1">Observações Gerais:</p>
              <div 
                contentEditable 
                suppressContentEditableWarning 
                className="min-h-[100px] w-full border-[1.5px] border-gray-300 dark:border-gray-600 print:border-black p-2 outline-none rounded text-sm text-black dark:text-white print:text-black bg-white dark:bg-gray-800 print:bg-transparent focus:ring-1 focus:ring-gray-500"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function renderAutoEntrega(kits: any[], responsavel?: string, obra?: string, cliente?: string) {
  const grouped = new Map<string, any>();

  kits.forEach(k => {
    const key = [
      k.apto, k.comodo, k.abertura,
      k.aduelaLargura, k.aduelaAltura, k.acabamentoAduela,
      k.tipologia
    ].join('||');

    let stringQtdStr = String((k as any).qtdeFolhasPorKit || '1');
    if ((k as any).quantidade) stringQtdStr = String((k as any).quantidade);
    if ((k as any).qtde) stringQtdStr = String((k as any).qtde);

    const qty = parseInt(stringQtdStr, 10);
    const validQty = isNaN(qty) ? 1 : qty;

    if (grouped.has(key)) {
      grouped.get(key).qtd += validQty;
    } else {
      grouped.set(key, {
        apto: k.apto || '-',
        comodo: k.comodo || '-',
        abertura: k.abertura || '-',
        aduela: `${k.aduelaLargura || '-'} x ${k.aduelaAltura || '-'}`,
        acabAduela: k.acabamentoAduela || '-',
        tipologia: k.tipologia || '-',
        qtd: validQty
      });
    }
  });

  const headers = ["Apto", "Cômodo", "Sentido de Abertura", "Aduela", "Acabamento Aduela", "Tipologia", "Qtd", "Conferido por"];

  // Sort by Apto, then Comodo
  const rows = Array.from(grouped.values())
    .sort((a, b) => {
        const aptoA = String(a.apto);
        const aptoB = String(b.apto);
        if (aptoA !== aptoB) return aptoA.localeCompare(aptoB, undefined, {numeric: true});
        return String(a.comodo).localeCompare(String(b.comodo));
    })
    .map(g => [
     g.apto, g.comodo, g.abertura, g.aduela, g.acabAduela, g.tipologia, g.qtd, ''
  ]);

  return (
    <div className="space-y-4 print:space-y-6">
      <div className="bg-gray-200 dark:bg-slate-800 border-[1.5px] border-black print:border-black py-2 text-center font-bold text-sm uppercase print:bg-transparent print:text-black">
        <EditableText>Relatório de Entrega</EditableText>
      </div>
      {(obra || responsavel || cliente) && (
        <div className="flex justify-between items-end mb-4 print:mb-6 px-2 text-sm text-gray-800 dark:text-gray-200 print:text-black">
          {cliente && <div><span className="font-semibold text-gray-500">Cliente:</span> <EditableText><span className="font-bold uppercase text-black dark:text-white print:text-black">{cliente}</span></EditableText></div>}
          {obra && <div><span className="font-semibold text-gray-500">Obra:</span> <EditableText><span className="font-bold uppercase text-black dark:text-white print:text-black">{obra}</span></EditableText></div>}
          {responsavel && <div><span className="font-semibold text-gray-500">Resp:</span> <EditableText><span className="font-bold uppercase text-black dark:text-white print:text-black">{responsavel}</span></EditableText></div>}
        </div>
      )}
      <TableLayout headers={headers} rows={rows} />
    </div>
  );
}