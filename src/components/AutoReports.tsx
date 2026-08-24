
import React, { useMemo } from 'react';


function useLocalState(key: string, initialValue: string) {
  const [val, setVal] = React.useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });
  const setValue = (value: string) => {
    setVal(value);
    window.localStorage.setItem(key, JSON.stringify(value));
  };
  return [val, setValue] as const;
}

const PersistentObservation = ({ id }: { id: string }) => {
  const [val, setVal] = useLocalState(`nm_obs_${id}`, '');
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (ref.current && ref.current.innerHTML !== val) {
      ref.current.innerHTML = val;
    }
  }, []);

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onBlur={(e) => setVal(e.currentTarget.innerHTML)}
      className="min-h-[100px] w-full border-[1.5px] border-gray-300 dark:border-gray-600 print:border-black p-2 outline-none rounded text-sm print:text-[16px] text-black dark:text-white print:text-black bg-white dark:bg-gray-800 print:bg-transparent focus:ring-1 focus:ring-gray-500"
    />
  );
};

const EditableText = ({ children }: { children: React.ReactNode }) => {
  const initialString = React.useMemo(() => {
    return Array.isArray(children) ? children.join('') : String(children);
  }, [children]);

  const spanRef = React.useRef<HTMLSpanElement>(null);
  
  // Create a ref to store the text so we don't lose it on re-render
  const textRef = React.useRef(initialString);
  const isEdited = React.useRef(false);

  React.useEffect(() => {
    if (spanRef.current && !isEdited.current) {
      if (spanRef.current.innerHTML !== initialString) {
        spanRef.current.innerHTML = initialString;
        textRef.current = initialString;
      }
    }
  }, [initialString]);

  const handleInput = (e: React.FormEvent<HTMLSpanElement>) => {
    isEdited.current = true;
    textRef.current = e.currentTarget.innerHTML;
  };

  return (
    <span 
      ref={spanRef}
      contentEditable 
      suppressContentEditableWarning 
      onInput={handleInput}
      onBlur={handleInput}
      className="outline-none inline-block w-full focus:bg-black/5 dark:focus:bg-white/5 rounded px-1 transition-colors min-h-[1em]"
      style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
      dangerouslySetInnerHTML={{ __html: textRef.current }}
    />
  );
};


export function AutoReportsViewer({ 
  kits, 
  reportType, 
  responsavel, 
  obra, 
  cliente,
  observacoes,
  onObservacoesChange
}: { 
  kits: any[], 
  reportType: string, 
  responsavel?: string, 
  obra?: string, 
  cliente?: string,
  observacoes?: string,
  onObservacoesChange?: (val: string) => void
}) {
  const content = useMemo(() => {
    switch (reportType) {
      case 'auto_portas': return renderAutoPortas(kits, responsavel, obra);
      case 'auto_aduelas': return renderAutoAduelas(kits, responsavel, obra);
      case 'auto_alizares': return renderAutoAlizares(kits); // Alizares may need it too if it takes it, but currently it doesn't.
      case 'auto_usinagem_portas': return renderUsinagem(kits, 'portas', responsavel, obra);
      case 'auto_usinagem_aduelas': return renderUsinagem(kits, 'aduelas', responsavel, obra);
      case 'auto_vergas': return renderAutoVergas(kits); // Same here
      case 'auto_montagem': return renderAutoMontagem(kits, responsavel, obra, cliente, observacoes, onObservacoesChange);
      case 'auto_entrega': return renderAutoEntrega(kits, responsavel, obra, cliente);
      default: return null;
    }
  }, [kits, reportType, responsavel, obra, cliente, observacoes, onObservacoesChange]);

  const needsHeader = reportType !== 'auto_montagem';

  return (
    <div className="mt-4">
      {needsHeader && (
        <div className="hidden print:flex flex-col border-b-2 border-black pb-4 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold uppercase tracking-tight text-black">
                Relatório de {reportType.replace("auto_", "").replace(/_/g, " ")}
              </h1>
              <p className="text-sm print:text-[16px] mt-1 text-black">
                Documento Gerado Via Sistema - Nacional Madeiras
              </p>
              <p className="text-sm print:text-[16px] mt-1 font-bold text-black">
                Data: {new Date().toLocaleDateString('pt-BR')}
              </p>
            </div>
            <div className="flex flex-col items-end text-right" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
              <h2 className="text-2xl font-black tracking-tighter leading-none text-[#166534] print:text-[#166534] uppercase">Nacional Madeiras</h2>
              <span className="text-xl font-bold uppercase tracking-widest mt-1 text-[#475569] print:text-[#475569]">Kit Porta</span>
            </div>
          </div>
          {(obra || responsavel || cliente) && (
            <div className="grid grid-cols-3 gap-4 w-full">
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
        </div>
      )}
      {content}
    </div>
  );
}

function TableLayout({ headers, rows }: { headers: string[], rows: (string | number)[][] }) {
  return (
    <div className="border border-gray-300 dark:border-gray-600 print:border-black print:border rounded overflow-x-auto shadow-sm print:shadow-none break-inside-avoid print:mt-4">
      <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-600 print:divide-black text-[11px] sm:text-sm print:text-[16px] print:border-y print:border-black">
        <thead className="bg-[#0f172a] text-white print:bg-transparent print:text-black">
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="px-3 py-2 text-center font-semibold uppercase whitespace-nowrap border-x border-[#1e293b] print:border-black print:text-[14px]">
                <EditableText>{h}</EditableText>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 print:bg-transparent divide-y divide-gray-200 dark:divide-gray-700 print:divide-black">
          {rows.map((row, idx) => (
            <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700 print:hover:bg-transparent">
              {row.map((cell, cIdx) => (
                <td key={cIdx} className="px-3 py-2 text-center border-x border-gray-200 print:border-black font-medium text-gray-900 dark:text-gray-100 print:text-black">
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
    dobMarcas: Set<string>,
    dobMedidas: Set<string>,
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
        caracteristicas: new Set(), acabamentos: new Set(), fechMarcas: new Set(), fechGrids: new Set(), dobMarcas: new Set(), dobMedidas: new Set()
      });
    }
    const groupItems = grouped.get(groupKey)!;

    if (carac && carac !== '-') groupItems.caracteristicas.add(String(carac).toUpperCase());
    if (acab && acab !== '-') groupItems.acabamentos.add(String(acab).toUpperCase());
    if (k.fechaduraMarca && k.fechaduraMarca !== '-') groupItems.fechMarcas.add(String(k.fechaduraMarca).toUpperCase());
    if (k.fechaduraGrid && k.fechaduraGrid !== '-') groupItems.fechGrids.add(String(k.fechaduraGrid).toUpperCase());
    if (k.dobradicaMarca && k.dobradicaMarca !== '-') groupItems.dobMarcas.add(String(k.dobradicaMarca).toUpperCase());
    if (k.dobradicaMedida && k.dobradicaMedida !== '-') groupItems.dobMedidas.add(String(k.dobradicaMedida).toUpperCase());

    let itemMeta = fTipo.replace(' P/FORA', '');

    if (!k.fechaduraTipo && itemMeta === 'SEM FECHADURA') {
      itemMeta = 'DESEJA ASSOCIAR COM ALGUMA COLUNA?';
    }

    if (mode === 'portas') {
      const extras = [];
      if (k.bitsQtde && k.bitsQtde !== '-' && k.bitsQtde !== '0') extras.push(`com ${k.bitsQtde} bits`);
      if (k.correr) extras.push('correr');
      if (k.veneziana) extras.push('veneziana');
      if (k.grelha) extras.push('com grelha');
      if (k.bandeira) extras.push('bandeira');
      if (k.pivotante) extras.push('Pivotante');
      if (k.fechaFresta) extras.push('Com Fecha Fresta');
      if (k.vidro) extras.push('Com Vidro');
      
      if (extras.length > 0) {
        itemMeta = `${itemMeta} (${extras.join(', ')})`;
      }
    }

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
    let bestMatchIdx = 999;
    let longestMatchLen = 0;
    typeOrder.forEach((t, idx) => {
      if (meta.startsWith(t) && t.length > longestMatchLen) {
        bestMatchIdx = idx;
        longestMatchLen = t.length;
      }
    });
    return bestMatchIdx;
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
              <table className="w-full border-collapse border border-black print:border-black print:border-solid text-[11px] sm:text-[14px] print:text-[16px] bg-white print:bg-white overflow-hidden" style={{ pageBreakInside: 'avoid' }}>
                <thead>
                  {mode === 'portas' && (
                    <tr>
                      <th colSpan={2} className="bg-gray-200 dark:bg-[#0f172a] print:bg-gray-200 border-b border-black print:border-black print:border-solid py-1 text-center font-bold uppercase text-[12px] print:text-[16px] text-gray-900 dark:text-gray-100 print:text-black">
                        <EditableText>{Array.from(groupData.caracteristicas).join(" / ") || "CARACTERÍSTICA PADRÃO"}</EditableText>
                      </th>
                    </tr>
                  )}
                  <tr>
                    <th className="bg-gray-100 dark:bg-gray-800/50 print:bg-gray-100 border-b border-r border-black print:border-black print:border-solid py-1 px-2 text-left uppercase font-bold text-[9px] print:text-[14px] w-1/2 text-gray-800 dark:text-gray-200 print:text-black">
                      <span className="font-semibold text-gray-500 uppercase mr-1">ACABAMENTO:</span>
                      <EditableText>{Array.from(groupData.acabamentos).join(" / ") || "-"}</EditableText>
                    </th>
                    <th className="bg-gray-100 dark:bg-gray-800/50 print:bg-gray-100 border-b border-black print:border-black print:border-solid py-1 px-2 text-left uppercase font-bold text-[9px] print:text-[14px] w-1/2 text-gray-800 dark:text-gray-200 print:text-black">
                      <div className="flex flex-col gap-1">
                        <div>
                          <span className="font-semibold text-gray-500 uppercase mr-1">FECHADURA:</span>
                          <EditableText>{Array.from(groupData.fechMarcas).join(" / ")} {groupData.fechGrids.size > 0 && Array.from(groupData.fechGrids).filter(Boolean).length > 0 ? `- GRID ${Array.from(groupData.fechGrids).filter(Boolean).join(" / ")}` : ""}</EditableText>
                        </div>
                        {(groupData.dobMarcas.size > 0 || groupData.dobMedidas.size > 0) && (
                          <div>
                            <span className="font-semibold text-gray-500 uppercase mr-1">{mode === 'aduelas' ? 'DOBRADIÇA:' : 'DOBRADIÇAS:'}</span>
                            <EditableText>
                              {[
                                Array.from(groupData.dobMarcas).join(" / "),
                                Array.from(groupData.dobMedidas).join(" / ")
                              ].filter(Boolean).join(" ")}
                            </EditableText>
                          </div>
                        )}
                      </div>
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
                                      <div className="flex-1 text-center font-bold text-[9px] print:text-[13px] uppercase px-2 py-1.5 flex items-center justify-center text-gray-700 dark:text-gray-300 print:text-black">
                                         <EditableText>{l.label}</EditableText>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-center w-full h-full py-1">
                                      {mode === 'aduelas' ? (
                                        <div className="flex justify-center items-center w-full">
                                          <div className="flex justify-between items-center w-32 px-1">
                                            <div className="font-mono font-semibold print:text-black text-gray-900 dark:text-gray-100 text-right leading-none whitespace-nowrap">
                                              <EditableText>{l.item.dimensao}</EditableText>
                                            </div>
                                            <div className="font-bold print:text-black text-gray-900 dark:text-gray-100 text-left shrink-0">
                                              <EditableText>{l.item.qtd}</EditableText>
                                            </div>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="flex items-center justify-center gap-2 sm:gap-4 w-full px-1">
                                          <div className="font-mono font-semibold print:text-black text-gray-900 dark:text-gray-100 flex-1 text-right max-w-[85px] leading-none whitespace-nowrap">
                                            <EditableText>{l.item.dimensao}</EditableText>
                                          </div>
                                          <div className="font-bold print:text-black text-gray-900 dark:text-gray-100 w-6 text-center shrink-0">
                                            <EditableText>{l.item.qtd}</EditableText>
                                          </div>
                                          <div className="font-bold text-[8.5px] print:text-[12px] uppercase print:text-black text-gray-600 dark:text-gray-400 flex-1 text-left whitespace-normal break-words leading-tight max-w-[140px]">
                                            <EditableText>{l.item.itemMeta ? String(l.item.itemMeta) : ''}</EditableText>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )
                               ) : <div className="h-full min-h-[24px]"></div>}
                             </td>
                             
                             {/* COLUNA DIREITA */}
                             <td className="w-1/2 p-0 align-top">
                               {r ? (
                                  r.type === 'header' ? (
                                    <div className="flex bg-gray-50 dark:bg-gray-800/30 print:bg-gray-50 items-stretch w-full h-full">
                                      <div className="flex-1 text-center font-bold text-[9px] print:text-[13px] uppercase px-2 py-1.5 flex items-center justify-center text-gray-700 dark:text-gray-300 print:text-black">
                                         <EditableText>{r.label}</EditableText>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-center w-full h-full py-1">
                                      {mode === 'aduelas' ? (
                                        <div className="flex justify-center items-center w-full">
                                          <div className="flex justify-between items-center w-32 px-1">
                                            <div className="font-mono font-semibold print:text-black text-gray-900 dark:text-gray-100 text-right leading-none whitespace-nowrap">
                                              <EditableText>{r.item.dimensao}</EditableText>
                                            </div>
                                            <div className="font-bold print:text-black text-gray-900 dark:text-gray-100 text-left shrink-0">
                                              <EditableText>{r.item.qtd}</EditableText>
                                            </div>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="flex items-center justify-center gap-2 sm:gap-4 w-full px-1">
                                          <div className="font-mono font-semibold print:text-black text-gray-900 dark:text-gray-100 flex-1 text-right max-w-[85px] leading-none whitespace-nowrap">
                                            <EditableText>{r.item.dimensao}</EditableText>
                                          </div>
                                          <div className="font-bold print:text-black text-gray-900 dark:text-gray-100 w-6 text-center shrink-0">
                                            <EditableText>{r.item.qtd}</EditableText>
                                          </div>
                                          <div className="font-bold text-[8.5px] print:text-[12px] uppercase print:text-black text-gray-600 dark:text-gray-400 flex-1 text-left whitespace-normal break-words leading-tight max-w-[140px]">
                                            <EditableText>{r.item.itemMeta ? String(r.item.itemMeta) : ''}</EditableText>
                                          </div>
                                        </div>
                                      )}
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
    bandeira: boolean,
    pivotante: boolean,
    fechaFresta: boolean,
    vidro: boolean
  }>>();
  
  let showBits = false;
  let showCorrer = false;
  let showVen = false;
  let showGre = false;
  let showBand = false;
  let showPiv = false;
  let showFf = false;
  let showVid = false;

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
    const pivotante = !!k.pivotante;
    const fechaFresta = !!k.fechaFresta;
    const vidro = !!k.vidro;

    if (bitsQtde && bitsQtde !== '-' && bitsQtde !== '0') showBits = true;
    if (correr) showCorrer = true;
    if (veneziana) showVen = true;
    if (grelha) showGre = true;
    if (bandeira) showBand = true;
    if (pivotante) showPiv = true;
    if (fechaFresta) showFf = true;
    if (vidro) showVid = true;

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
      i.bandeira === bandeira &&
      i.pivotante === pivotante &&
      i.fechaFresta === fechaFresta &&
      i.vidro === vidro
    );
    if (existing) {
      existing.qtdTotal += kitCount;
    } else {
      items.push({ dimensao, acabamento, qtdTotal: kitCount, bitsQtde, correr, veneziana, grelha, bandeira, pivotante, fechaFresta, vidro });
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
            <table className="min-w-full divide-y divide-gray-300 dark:divide-slate-800 print:divide-black text-[11px] sm:text-[14px] print:text-[16px] print:border-y print:border-black" style={{ pageBreakInside: 'avoid' }}>
              <thead className="bg-[#f8fafc] dark:bg-[#0f172a] print:bg-transparent">
                <tr>
                  <th className="px-4 py-3 text-center font-bold uppercase whitespace-nowrap border-x border-gray-300 dark:border-slate-800 print:border-transparent text-gray-800 dark:text-emerald-400 print:text-black w-1/3">
                    Medidas
                  </th>
                  <th className="px-4 py-3 text-center font-bold uppercase whitespace-nowrap border-x border-gray-300 dark:border-slate-800 print:border-transparent text-gray-800 dark:text-emerald-400 print:text-black w-1/3">
                    Acabamento da Porta
                  </th>
                  <th className="px-4 py-3 text-center font-bold uppercase whitespace-nowrap border-x border-gray-300 dark:border-slate-800 print:border-transparent text-gray-800 dark:text-emerald-400 print:text-black w-1/3">
                    Quantidade
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-800 print:divide-black">
                {items.map((k, idx2) => (
                  <tr key={idx2} className="bg-white dark:bg-[#151f32] print:bg-transparent hover:bg-gray-50 print:hover:bg-transparent">
                    <td className="px-4 py-3 text-center border-x border-gray-200 dark:border-slate-800 print:border-transparent text-gray-900 dark:text-white print:text-black font-bold w-1/3">
                      <EditableText>{k.dimensao}</EditableText>
                    </td>
                    <td className="px-4 py-3 text-center border-x border-gray-200 dark:border-slate-800 print:border-transparent text-gray-900 dark:text-white print:text-black font-semibold w-1/3">
                      <EditableText>
                        {(() => {
                          const extras = [];
                          if (k.bitsQtde && k.bitsQtde !== '-' && k.bitsQtde !== '0') extras.push(`${k.bitsQtde} bits`);
                          if (k.correr) extras.push('Correr');
                          if (k.veneziana) extras.push('veneziana');
                          if (k.grelha) extras.push('grelha');
                          if (k.bandeira) extras.push('bandeira');
                          if (k.pivotante) extras.push('Pivotante');
                          if (k.fechaFresta) extras.push('Com Fecha Fresta');
                          if (k.vidro) extras.push('Com Vidro');
                          
                          if (extras.length > 0) {
                            return `${k.acabamento} (${extras.join(', ')})`;
                          }
                          return k.acabamento;
                        })()}
                      </EditableText>
                    </td>
                    <td className="px-4 py-3 text-center border-x border-gray-200 dark:border-slate-800 print:border-transparent text-gray-900 dark:text-white print:text-black font-bold w-1/3">
                      <EditableText>{k.qtdTotal}</EditableText>
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
  const grouped = new Map<string, Map<string, Array<{dimensao: string, aLargura: string, qtdTotal: number, montantesMedida: string, vergas1000: number, vergas2000: number}>>>();

  kits.forEach(k => {
    const aLargura = k.aduelaLargura;
    const aAltura = k.aduelaAltura;
    if (!aLargura || !aAltura || aLargura === '-' || aAltura === '-') return;

    const acadamento = (k.acabamentoAduela || '-').toUpperCase();
    const altura = aAltura;
    const dimensao = `${aLargura}x${aAltura}`;
    const montantesMedida = k.montantesMedida || '';
    
    let baseCount = 1;
    if ((k as any).quantidade) baseCount = parseInt((k as any).quantidade, 10) || 1;
    if ((k as any).qtde) baseCount = parseInt((k as any).qtde, 10) || 1;
    
    // Multiplica a quantidade por 2 no relatorio de aduelas para obter as pernas/montantes
    const pernasCount = baseCount * 2;

    const folhaLargura = parseFloat(k.folhaLargura) || 0;
    const isVerga1000 = folhaLargura <= 920;
    const vergas1000Count = isVerga1000 ? baseCount : 0;
    const vergas2000Count = !isVerga1000 ? baseCount : 0;

    if (!grouped.has(acadamento)) {
      grouped.set(acadamento, new Map());
    }

    const alturasMap = grouped.get(acadamento)!;
    if (!alturasMap.has(altura)) {
      alturasMap.set(altura, []);
    }

    const items = alturasMap.get(altura)!;
    const existing = items.find(i => i.dimensao === dimensao && i.montantesMedida === montantesMedida);
    if (existing) {
      existing.qtdTotal += pernasCount;
      existing.vergas1000 += vergas1000Count;
      existing.vergas2000 += vergas2000Count;
    } else {
      items.push({ dimensao, aLargura, qtdTotal: pernasCount, montantesMedida, vergas1000: vergas1000Count, vergas2000: vergas2000Count });
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
                  const hasMontantes = items.some(i => i.montantesMedida && i.montantesMedida !== '-');
                  return (
                    <div key={altura} className="rounded border border-gray-300 dark:border-slate-700 print:border-transparent overflow-hidden bg-white dark:bg-[#0f172a] shadow-sm print:shadow-none">
                       <table className="min-w-full divide-y divide-gray-300 dark:divide-slate-800 print:divide-black text-[11px] sm:text-[14px] print:text-[16px] print:border-y print:border-black">
                          <thead className="bg-[#f8fafc] dark:bg-slate-800/50 print:bg-transparent">
                            <tr>
                              <th className={`px-4 py-3 text-center font-bold uppercase whitespace-nowrap border-x border-gray-300 dark:border-slate-700 print:border-transparent text-gray-800 dark:text-emerald-400 print:text-black ${hasMontantes ? 'w-1/3' : 'w-1/2'}`}>
                                Medidas
                              </th>
                              {hasMontantes && (
                                <th className="px-4 py-3 text-center font-bold uppercase whitespace-nowrap border-x border-gray-300 dark:border-slate-700 print:border-transparent text-gray-800 dark:text-emerald-400 print:text-black w-1/3">
                                  Montantes Medidas
                                </th>
                              )}
                              <th className={`px-4 py-3 text-center font-bold uppercase whitespace-nowrap border-x border-gray-300 dark:border-slate-700 print:border-transparent text-gray-800 dark:text-emerald-400 print:text-black ${hasMontantes ? 'w-1/3' : 'w-1/2'}`}>
                                Quantidade
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-slate-800 print:divide-black">
                            {items.map((k, idx2) => (
                              <tr key={idx2} className="hover:bg-gray-50 print:hover:bg-transparent">
                                <td className="px-4 py-3 text-center border-x border-gray-200 dark:border-slate-800 print:border-transparent text-gray-900 dark:text-white print:text-black font-bold">
                                  <div className="flex flex-col gap-1 items-center">
                                    <EditableText>{k.dimensao}</EditableText>
                                    {k.vergas1000 > 0 && <span className="text-gray-500 text-[11px] print:text-[14px] font-medium print:text-black"><EditableText>{k.aLargura}x1000</EditableText></span>}
                                    {k.vergas2000 > 0 && <span className="text-gray-500 text-[11px] print:text-[14px] font-medium print:text-black"><EditableText>{k.aLargura}x2000</EditableText></span>}
                                  </div>
                                </td>
                                {hasMontantes && (
                                  <td className="px-4 py-3 text-center border-x border-gray-200 dark:border-slate-800 print:border-transparent text-gray-900 dark:text-white print:text-black font-bold">
                                    <div className="flex flex-col gap-1 items-center">
                                      <EditableText>{k.montantesMedida || '-'}</EditableText>
                                      {k.vergas1000 > 0 && <span className="text-transparent text-[11px] print:text-[14px]">-</span>}
                                      {k.vergas2000 > 0 && <span className="text-transparent text-[11px] print:text-[14px]">-</span>}
                                    </div>
                                  </td>
                                )}
                                <td className="px-4 py-3 text-center border-x border-gray-200 dark:border-slate-800 print:border-transparent text-gray-900 dark:text-white print:text-black font-bold">
                                  <div className="flex flex-col gap-1 items-center">
                                    <EditableText>{k.qtdTotal}</EditableText>
                                    {k.vergas1000 > 0 && <span className="text-gray-500 text-[11px] print:text-[14px] font-medium print:text-black"><EditableText>{k.vergas1000}</EditableText></span>}
                                    {k.vergas2000 > 0 && <span className="text-gray-500 text-[11px] print:text-[14px] font-medium print:text-black"><EditableText>{k.vergas2000}</EditableText></span>}
                                  </div>
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
               <table className="min-w-full divide-y divide-gray-300 dark:divide-slate-800 print:divide-black text-[11px] sm:text-[14px] print:text-[16px] print:border-y print:border-black" style={{ pageBreakInside: 'avoid' }}>
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
                  <tbody className="divide-y divide-gray-200 dark:divide-slate-800 print:divide-black">
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

export function renderAutoMontagem(kits: any[], responsavel?: string, obra?: string, cliente?: string, observacoes?: string, onObservacoesChange?: (val: string) => void) {
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
        {`
          @media print {
            * {
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            table, th, td, tr {
              border-color: #000000 !important;
            }
            .text-black-print-important, .text-black-print-important th {
              color: #000000 !important;
            }
            @page { 
              size: landscape; 
              margin: 1cm;
            }
            .montagem-page-break {
              page-break-after: always;
            }
            .montagem-page-break:last-child {
              page-break-after: auto;
            }
          }
        `}
      </style>
      
      {uniqueGroups.map(([key, groupKits], idx) => {
        const firstKit = groupKits[0];
        const tipo = firstKit.tipologia || 'SEM TIPOLOGIA';
        const fech = [firstKit.fechaduraTipo, firstKit.fechaduraMarca, firstKit.fechaduraGrid && `GRID ${firstKit.fechaduraGrid}`].filter(Boolean).join(' / ') || 'SEM FECHADURA';
        
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
          <div key={idx} className="montagem-page-break print:w-full print:py-4 flex flex-col gap-6 bg-white p-6 shadow-sm rounded-md print:shadow-none print:p-0 print:bg-transparent print:mx-0">
            
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
                        <EditableText>Relatório de Montagem - {tipo} {fech !== 'SEM FECHADURA' ? `(${fech})` : ''}</EditableText>
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
                    firstKit.aduelaLargura && firstKit.aduelaAltura ? `${firstKit.aduelaLargura}x${firstKit.aduelaAltura}` : null,
                    firstKit.acabamentoAduela ? firstKit.acabamentoAduela : null,
                    firstKit.montantesMedida ? `D${firstKit.montantesMedida}` : null,
                    firstKit.montantesFolgas ? `F${firstKit.montantesFolgas}` : null,
                    firstKit.qtdeLadosAduela ? `${firstKit.qtdeLadosAduela} lados` : null
                  ].filter(Boolean).join(' - ') || '-';

                  const dob = [firstKit.dobradicaMarca, firstKit.dobradicaMedida, firstKit.qtdeDobradicas && `${firstKit.qtdeDobradicas}un`].filter(Boolean).join(' / ') || '-';
                  const acabPorta = firstKit.acabamentoPorta || firstKit.corFolha || '-';
                  const caracteristicas = firstKit.caracteristicaPorta || '-';

                  let leafSizeStr = `${firstKit.folhaLargura || '-'} x ${firstKit.folhaAltura || '-'}`;
                  const folhaQtd = parseInt(String(firstKit.qtdeFolhasPorKit || '1'), 10);
                  if (!isNaN(folhaQtd) && folhaQtd > 1 && firstKit.folhaLargura && !isNaN(parseInt(firstKit.folhaLargura, 10))) {
                      const dividedWidth = parseInt(firstKit.folhaLargura, 10) / folhaQtd;
                      leafSizeStr = `${firstKit.folhaLargura} x ${firstKit.folhaAltura || '-'} (${folhaQtd}x ${dividedWidth} x ${firstKit.folhaAltura || '-'})`;
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
                      <tr className="bg-[#0f172a] text-white print:bg-gray-200 print:border-y print:border-black font-semibold uppercase break-inside-avoid print:shadow-none text-black-print-important">
                        <th className="px-3 py-2 text-center align-middle whitespace-nowrap border-x border-[#1e293b] print:border-black print:text-[14px]">QTD</th>
                        <th className="px-3 py-2 text-center align-middle whitespace-nowrap border-x border-[#1e293b] print:border-black print:text-[14px]">FOLHA DE PORTA</th>
                        <th className="px-3 py-2 text-center align-middle whitespace-nowrap border-x border-[#1e293b] print:border-black print:text-[14px]">CARACTERÍSTICAS</th>
                        <th className="px-3 py-2 text-center align-middle whitespace-nowrap border-x border-[#1e293b] print:border-black print:text-[14px]">ACABAMENTO</th>
                        <th className="px-3 py-2 text-center align-middle whitespace-nowrap border-x border-[#1e293b] print:border-black print:text-[14px]">INFO. ADUELA</th>
                        <th className="px-3 py-2 text-center align-middle whitespace-nowrap border-x border-[#1e293b] print:border-black print:text-[14px]">FECH. GRID</th>
                        <th className="px-3 py-2 text-center align-middle whitespace-nowrap border-x border-[#1e293b] print:border-black print:text-[14px]">DOBRADIÇAS</th>
                        {showBits && <th className="px-3 py-2 text-center align-middle whitespace-nowrap border-x border-[#1e293b] print:border-black print:text-[14px]">BITS</th>}
                        {showCorrer && <th className="px-3 py-2 text-center align-middle whitespace-nowrap border-x border-[#1e293b] print:border-black print:text-[14px]">CORRER</th>}
                        {showVen && <th className="px-3 py-2 text-center align-middle whitespace-nowrap border-x border-[#1e293b] print:border-black print:text-[14px]">VENEZIANA</th>}
                        {showGre && <th className="px-3 py-2 text-center align-middle whitespace-nowrap border-x border-[#1e293b] print:border-black print:text-[14px]">GRELHA</th>}
                        {showBand && <th className="px-3 py-2 text-center align-middle whitespace-nowrap border-x border-[#1e293b] print:border-black print:text-[14px]">BANDEIRA</th>}
                        {showPiv && <th className="px-3 py-2 text-center align-middle whitespace-nowrap border-x border-[#1e293b] print:border-black print:text-[14px]">PIVOTANTE</th>}
                        {showFf && <th className="px-3 py-2 text-center align-middle whitespace-nowrap border-x border-[#1e293b] print:border-black print:text-[14px]">FECHA FRESTA</th>}
                        {showVid && <th className="px-3 py-2 text-center align-middle whitespace-nowrap border-x border-[#1e293b] print:border-black print:text-[14px]">COM VIDRO</th>}
                        <th className="px-3 py-2 text-center align-middle whitespace-nowrap border-x border-[#1e293b] print:border-black print:text-[14px]">CONCLUÍDO</th>
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
              <textarea 
                className="border border-gray-300 dark:border-gray-700 print:border-black print:border-[2px] rounded-sm h-32 w-full p-3 text-red-600 print:text-red-600 font-bold print:font-bold resize-none bg-transparent"
                value={observacoes || ''}
                onChange={(e) => onObservacoesChange && onObservacoesChange(e.target.value)}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function renderAutoEntrega(kits: any[], responsavel?: string, obra?: string, cliente?: string) {
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
          // Robust Enchimento check
          let rawEnc = k.caracteristicaPorta || k.caracteristica_da_porta || k.enchimento || k['CARACTERISTICA DA PORTA'] || k['caracteristica da porta'];
          if(!rawEnc) {
             const encKey = Object.keys(k).find(key => key.toLowerCase().includes('caracteristica'));
             if (encKey) rawEnc = k[encKey];
          }
          const enc = rawEnc ? String(rawEnc).trim().toUpperCase() : 'S/ ENCHIMENTO';
          
          // Robust Dimensao check
          let rawLarg = k.folhaLargura || k.folhaLarg || k.folha_larg || k.largura || k['FOLHA LARG'] || k['folha larg'];
          let rawAlt = k.folhaAltura || k.folhaAlt || k.folha_alt || k.altura || k['FOLHA ALT'] || k['folha alt'];
          
          if (!rawLarg) {
             const largKey = Object.keys(k).find(key => key.toLowerCase().includes('folha larg'));
             if (largKey) rawLarg = k[largKey];
          }
          if (!rawAlt) {
             const altKey = Object.keys(k).find(key => key.toLowerCase().includes('folha alt'));
             if (altKey) rawAlt = k[altKey];
          }
          
          let rawDim = k.dimensao; // fallback
          
          let dim = 'S/ DIMENSÃO';
          if (rawLarg && rawAlt) {
             dim = `${rawLarg}x${rawAlt}`;
          } else if (rawDim) {
             dim = rawDim;
          }
          
          const dimKey = `${enc} || ${dim}`;
          if (!dims.has(dimKey)) dims.set(dimKey, []);
          dims.get(dimKey).push(k);
        });

        const dimEntries = Array.from(dims.entries()).sort((a, b) => a[0].localeCompare(b[0]));

        return (
          <div key={blocoName} style={blockIndex > 0 ? { pageBreakBefore: 'always' } : {}}>
                        {/* COVER PAGE */}
            <div className="flex flex-col h-[60vh] print:h-[60vh] pt-4" style={{ pageBreakAfter: 'always', pageBreakInside: 'avoid' }}>


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
                     <EditableText>{blocoName.toUpperCase().includes('BLOCO') ? blocoName : `BLOCO ${blocoName}`}</EditableText>
                   </h2>
                 )}
              </div>

              {/* DATA E ASSINATURAS (INVERTIDAS) */}
              <div className="mt-auto pt-8 pb-8 flex flex-col space-y-20">
                {/* DATA DE RECEBIMENTO */}
                <div className="flex justify-center items-end text-xl print:text-2xl font-bold text-black">
                  <span>RECEBIDO EM</span>
                  <div className="border-b-[2px] border-black w-24 mx-4"></div>
                  <span>DE</span>
                  <div className="border-b-[2px] border-black w-64 mx-4"></div>
                  <span>2026</span>
                </div>

                <div className="grid grid-cols-2 gap-16 text-center pt-8">
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
              </div>
            </div>
            {/* PAGES FOR DIMENSIONS */}
            <div style={{ pageBreakBefore: 'always' }}>
              {dimEntries.map(([dimKey, dimKits], dimIdx) => {
                const [enc, dim] = dimKey.split(' || ');
                
                // Group by Apto/Comodo within this dimension to sum quantities if identical
                const subGrouped = new Map<string, any>();
                dimKits.forEach(k => {
                  const acabamento = k.acabamentoPorta || k.corFolha || '-';
                  const key = [
                    k.apto, k.comodo, k.abertura,
                    k.aduelaLargura, k.aduelaAltura, k.fechaduraTipo, k.fechaduraMarca,
                    k.modelo, k.tipologia, acabamento
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
                      aduela: `${k.aduelaLargura || '-'} x ${k.aduelaAltura || '-'}`,
                      fechadura: (k.fechaduraTipo || k.fechaduraMarca) ? `${k.fechaduraTipo || ''} ${k.fechaduraMarca || ''}`.trim() : '-',
                      modelo: k.modelo || k.tipologia || '-',
                      acabamento: acabamento,
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
                      <div className="border border-gray-400 print:border-black px-4 py-1 font-bold text-gray-800 print:text-black uppercase text-sm print:text-[16px]">
                        {dim}
                      </div>
                    </div>
                    
                    {(blocoName !== '0' && blocoName !== 'SEM BLOCO' && blocoName.trim() !== '') && (
                      <div className="text-xl print:text-2xl font-bold uppercase text-gray-500 print:text-gray-700 italic mb-2 ml-2">
                        <EditableText>{blocoName}</EditableText>
                      </div>
                    )}

                    <table className="min-w-full border-collapse border border-gray-400 print:border-black text-[12px] sm:text-sm print:text-[16px] print:border-black">
                      <thead className="bg-gray-200 print:bg-transparent border-b-2 border-gray-400 print:border-black">
                        <tr>
                          <th className="border-r border-gray-400 print:border-black py-2 px-3 text-left font-bold text-gray-800 print:text-black">APTO.</th>
                          <th className="border-r border-gray-400 print:border-black py-2 px-3 text-left font-bold text-gray-800 print:text-black">CÔMODO</th>
                          <th className="border-r border-gray-400 print:border-black py-2 px-3 text-left font-bold text-gray-800 print:text-black">ABERTURA</th>
                          <th className="border-r border-gray-400 print:border-black py-2 px-3 text-left font-bold text-gray-800 print:text-black">ADUELA</th>
                          <th className="border-r border-gray-400 print:border-black py-2 px-3 text-left font-bold text-gray-800 print:text-black">FECHADURA</th>
                          <th className="border-r border-gray-400 print:border-black py-2 px-3 text-left font-bold text-gray-800 print:text-black">MODELO</th>
                          <th className="py-2 px-3 text-left font-bold text-gray-800 print:text-black">ACABAMENTO</th>
                        </tr>
                      </thead>
                      <tbody className="print:bg-transparent">
                        {rows.map((r, i) => (
                          <tr key={i} className="border-b border-gray-300 print:border-black hover:bg-gray-50 print:hover:bg-transparent">
                            <td className="py-2 px-3 text-gray-700 print:text-black border-r border-gray-300 print:border-black">{r.apto}</td>
                            <td className="py-2 px-3 text-gray-700 print:text-black border-r border-gray-300 print:border-black">{r.comodo}</td>
                            <td className="py-2 px-3 text-gray-700 print:text-black border-r border-gray-300 print:border-black">{r.abertura}</td>
                            <td className="py-2 px-3 text-gray-700 print:text-black border-r border-gray-300 print:border-black">{r.aduela}</td>
                            <td className="py-2 px-3 text-gray-700 print:text-black border-r border-gray-300 print:border-black">{r.fechadura}</td>
                            <td className="py-2 px-3 text-gray-700 print:text-black border-r border-gray-300 print:border-black">{r.modelo}</td>
                            <td className="py-2 px-3 text-gray-700 print:text-black">{r.acabamento}</td>
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
}