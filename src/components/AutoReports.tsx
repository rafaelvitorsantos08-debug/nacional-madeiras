import React, { useMemo } from 'react';
import { getCategoriaComodo, isEspecialDobraOnly } from './RelatoriosModule';

export function AutoReportsViewer({ kits, reportType }: { kits: any[], reportType: string }) {
  const content = useMemo(() => {
    switch (reportType) {
      case 'auto_aduelas': return renderAutoAduelas(kits);
      case 'auto_usinagem_aduelas': return renderAutoUsinagemAduelas(kits);
      case 'auto_portas': return renderAutoPortas(kits);
      case 'auto_usinagem_portas': return renderAutoUsinagemPortas(kits);
      case 'auto_vergas': return renderAutoVergas(kits);
      case 'auto_alizares': return renderAutoAlizares(kits);
      default: return null;
    }
  }, [kits, reportType]);

  return <div className="mt-4">{content}</div>;
}

function processAduelas(kits: any[]) {
   const agrupar = new Map();
   kits.forEach(k => {
      if (!k.aduelaLargura || !k.aduelaAltura) return;
      const key = `${k.aduelaLargura}x${k.aduelaAltura} - ${k.acabamento || 'BRANCO'}`;
      const val = agrupar.get(key) || { largura: parseInt(k.aduelaLargura, 10), altura: parseInt(k.aduelaAltura, 10), acabamento: k.acabamento || 'BRANCO', qtd: 0 };
      val.qtd += 1; // 1 aduela por kit
      agrupar.set(key, val);
   });
   return Array.from(agrupar.values()).sort((a, b) => {
       // Primeiro altura desc (2120, then 2110)
       if (b.altura !== a.altura) return b.altura - a.altura;
       // Then largura desc
       if (b.largura !== a.largura) return b.largura - a.largura;
       return a.acabamento.localeCompare(b.acabamento);
   });
}

function renderAutoAduelas(kits: any[]) {
  const data = processAduelas(kits);
  return (
    <div className="border-2 border-gray-800 dark:border-gray-600 print:border-black rounded-lg overflow-hidden shadow-sm break-inside-avoid">
      <table className="min-w-full divide-y-2 divide-gray-800 dark:divide-gray-600 print:divide-black">
        <thead className="bg-gray-100 dark:bg-gray-700 print:bg-gray-100">
          <tr>
              <th className="px-4 py-2 text-left text-xs font-bold text-gray-900 dark:text-gray-100 print:text-black uppercase border-r-2 border-gray-800 dark:border-gray-600 print:border-black">Largura x Altura (mm)</th>
              <th className="px-4 py-2 text-left text-xs font-bold text-gray-900 dark:text-gray-100 print:text-black uppercase border-r-2 border-gray-800 dark:border-gray-600 print:border-black">Acabamento</th>
              <th className="px-4 py-2 text-right text-xs font-bold text-gray-900 dark:text-gray-100 print:text-black uppercase">Qtd</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 print:bg-white divide-y-2 divide-gray-800 dark:divide-gray-600 print:divide-black">
           {data.map((row, idx) => (
             <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700 print:hover:bg-transparent border-b-2 border-gray-800 dark:border-gray-600 print:border-black">
               <td className="px-4 py-1.5 text-sm text-gray-900 dark:text-gray-100 print:text-black font-mono border-r-2 border-gray-800 dark:border-gray-600 print:border-black font-bold">{row.largura} x {row.altura}</td>
               <td className="px-4 py-1.5 text-sm text-gray-900 dark:text-gray-100 print:text-black border-r-2 border-gray-800 dark:border-gray-600 print:border-black font-bold">{row.acabamento}</td>
               <td className="px-4 py-1.5 text-sm text-gray-900 dark:text-gray-100 print:text-black text-right font-bold w-20">{row.qtd}</td>
             </tr>
           ))}
        </tbody>
      </table>
    </div>
  );
}

function processUsinagem(kits: any[], isPorta: boolean) {
   const agrupar: Record<string, {
       dobradicas: Record<string, number>,
       aberturas: Record<string, Record<string, number>>
   }> = {};
   
   kits.forEach(k => {
      const cat = getCategoriaComodo(k.comodo);
      let abertura = (k.abertura || 'N/A').toUpperCase();
      
      if (!isPorta) {
         abertura = abertura.replace(' P/FORA', '').replace(' P/ FORA', '').trim();
      }
      
      const isDobra = isEspecialDobraOnly(k.folhaLargura, cat);
      
      let dimensao = '';
      if (isPorta) {
         if (!k.folhaLargura || !k.folhaAltura) return;
         dimensao = `${k.folhaLargura}x${k.folhaAltura}`;
      } else {
         if (!k.aduelaLargura || !k.aduelaAltura) return;
         dimensao = `${k.aduelaLargura}x${k.aduelaAltura}`;
      }

      const qtde = parseInt(k.qtdeFolhasPorKit || '1', 10) || 1;
      const amountToAdd = isPorta ? qtde : 1;

      if (!agrupar[cat]) agrupar[cat] = { dobradicas: {}, aberturas: {} };

      if (isDobra) {
         agrupar[cat].dobradicas[dimensao] = (agrupar[cat].dobradicas[dimensao] || 0) + amountToAdd;
      } else {
         if (!agrupar[cat].aberturas[abertura]) agrupar[cat].aberturas[abertura] = {};
         agrupar[cat].aberturas[abertura][dimensao] = (agrupar[cat].aberturas[abertura][dimensao] || 0) + amountToAdd;
      }
   });

   return Object.keys(agrupar).sort().map(cat => ({
      categoria: cat,
      dobradicas: Object.keys(agrupar[cat].dobradicas).sort().map(d => ({ dimensao: d, qtd: agrupar[cat].dobradicas[d] })),
      aberturas: Object.keys(agrupar[cat].aberturas).sort().map(ab => ({
          abertura: ab,
          itens: Object.keys(agrupar[cat].aberturas[ab]).sort().map(d => ({ dimensao: d, qtd: agrupar[cat].aberturas[ab][d] }))
      }))
   }));
}

function renderUsinagem(kits: any[], isPorta: boolean) {
  const data = processUsinagem(kits, isPorta);
  if (data.length === 0) return <p className="text-gray-500 italic text-sm">Nenhum dado encontrado para usinagem.</p>;

  return (
    <div className="flex flex-col gap-4">
       {data.map(cat => {
         const aberturasEsq = cat.aberturas.filter(a => a.abertura.includes('ESQ'));
         const aberturasDir = cat.aberturas.filter(a => a.abertura.includes('DIR'));
         const aberturasOut = cat.aberturas.filter(a => !a.abertura.includes('ESQ') && !a.abertura.includes('DIR'));

         return (
           <div key={cat.categoria} className="border-2 border-gray-800 dark:border-gray-600 print:border-black rounded-lg overflow-hidden break-inside-avoid shadow-sm mb-2">
             <h3 className="bg-gray-200 dark:bg-gray-600 print:bg-gray-200 px-3 py-1 font-bold text-gray-900 dark:text-gray-100 print:text-black text-sm border-b-2 border-gray-800 dark:border-gray-600 print:border-black text-center uppercase">{cat.categoria}</h3>
             <div className="p-2">
                {cat.dobradicas.length > 0 && (
                   <div className="mb-3 border-2 border-gray-800 dark:border-gray-600 print:border-black rounded p-2">
                      <h4 className="font-bold text-gray-900 dark:text-gray-100 print:text-black mb-1 text-xs uppercase text-center border-b-2 border-gray-800 dark:border-gray-600 print:border-black pb-1">SÓ DOBRADIÇAS</h4>
                      <div className="flex flex-wrap gap-x-8 gap-y-2 justify-center mt-2">
                         {cat.dobradicas.map(d => {
                            const qEsqDir = isPorta ? Math.ceil(d.qtd / 2) : d.qtd;
                            return (
                               <div key={d.dimensao} className="text-sm font-bold font-mono text-gray-900 dark:text-gray-100 print:text-black">
                                  {d.dimensao}: <span className="text-gray-900 dark:text-gray-100 print:text-black">{qEsqDir} Esq / {qEsqDir} Dir</span>
                               </div>
                            );
                         })}
                      </div>
                   </div>
                )}
                
                <div className="flex flex-row gap-4">
                  {/* Left Column (ESQUERDAS) */}
                  <div className="flex-1 flex flex-col gap-2">
                     {aberturasEsq.map(ab => (
                        <UsinagemTable key={ab.abertura} abertura={ab.abertura} itens={ab.itens} />
                     ))}
                  </div>
                  {/* Right Column (DIREITAS) */}
                  <div className="flex-1 flex flex-col gap-2">
                     {aberturasDir.map(ab => (
                        <UsinagemTable key={ab.abertura} abertura={ab.abertura} itens={ab.itens} />
                     ))}
                  </div>
                </div>

                {aberturasOut.length > 0 && (
                   <div className="mt-2 grid grid-cols-2 gap-4">
                     {aberturasOut.map(ab => (
                        <UsinagemTable key={ab.abertura} abertura={ab.abertura} itens={ab.itens} />
                     ))}
                   </div>
                )}
             </div>
           </div>
         );
       })}
    </div>
  );
}

function UsinagemTable({ abertura, itens }: { abertura: string, itens: any[] }) {
  if (itens.length === 0) return null;
  return (
    <div className="border-2 border-gray-800 dark:border-gray-600 print:border-black rounded overflow-hidden shadow-sm">
       <h4 className="font-bold text-gray-900 dark:text-gray-100 print:text-black bg-gray-100 dark:bg-gray-700 print:bg-gray-100 px-2 py-0.5 text-[10px] uppercase text-center border-b-2 border-gray-800 dark:border-gray-600 print:border-black truncate">{abertura}</h4>
       <table className="min-w-full text-xs">
          <tbody>
            {itens.map((it, i) => (
               <tr key={i} className="border-b-2 border-gray-800 dark:border-gray-600 print:border-black last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 print:hover:bg-transparent">
                 <td className="px-2 py-1 text-gray-900 dark:text-gray-100 print:text-black font-mono font-bold text-center">{it.dimensao}</td>
                 <td className="px-2 py-1 text-center text-gray-900 dark:text-gray-100 print:text-black font-bold w-12 border-l-2 border-gray-800 dark:border-gray-600 print:border-black bg-gray-50 dark:bg-gray-900 print:bg-gray-50">{it.qtd}</td>
               </tr>
            ))}
          </tbody>
       </table>
    </div>
  );
}

function renderAutoUsinagemAduelas(kits: any[]) { return renderUsinagem(kits, false); }
function renderAutoUsinagemPortas(kits: any[]) { return renderUsinagem(kits, true); }

function processPortas(kits: any[]) {
   const agrupar = new Map();
   kits.forEach(k => {
      if (!k.folhaLargura || !k.folhaAltura) return;
      
      const char = (k.caracteristica || k.modelo || 'HONEY').toUpperCase();
      let charOrder = 99;
      if (char.includes('HONEY') || char.includes('COLMEIA')) charOrder = 1;
      else if (char.includes('SARRAFEADA')) charOrder = 2;
      else if (char.includes('SOLIDA') || char.includes('SÓLIDA')) charOrder = 3;

      const key = `${k.folhaLargura}x${k.folhaAltura}-${k.acabamento}-${char}`;
      const qtde = parseInt(k.qtdeFolhasPorKit || '1', 10) || 1;
      
      const val = agrupar.get(key) || { 
          largura: parseInt(k.folhaLargura, 10), 
          altura: parseInt(k.folhaAltura, 10), 
          acabamento: k.acabamento || 'BRANCO', 
          caracteristica: char,
          charOrder: charOrder,
          qtd: 0 
      };
      val.qtd += qtde;
      agrupar.set(key, val);
   });
   
   return Array.from(agrupar.values()).sort((a, b) => {
       if (a.charOrder !== b.charOrder) return a.charOrder - b.charOrder;
       if (b.altura !== a.altura) return b.altura - a.altura;
       return b.largura - a.largura;
   });
}

function renderAutoPortas(kits: any[]) {
  const data = processPortas(kits);
  
  const groupedData = data.reduce((acc, row) => {
    if (!acc[row.caracteristica]) acc[row.caracteristica] = [];
    acc[row.caracteristica].push(row);
    return acc;
  }, {} as Record<string, typeof data>);

  return (
    <div className="flex flex-col gap-6">
      {Object.entries(groupedData).map(([caracteristica, rows]) => (
        <div key={caracteristica} className="border-2 border-gray-800 dark:border-gray-600 print:border-black rounded-lg overflow-hidden shadow-sm break-inside-avoid">
          <table className="min-w-full divide-y-2 divide-gray-800 dark:divide-gray-600 print:divide-black table-fixed">
            <thead className="bg-gray-100 dark:bg-gray-700 print:bg-gray-100">
              <tr>
                  <th className="px-4 py-2 text-left text-xs font-bold text-gray-900 dark:text-gray-100 print:text-black uppercase border-r-2 border-gray-800 dark:border-gray-600 print:border-black w-1/3">Dimensão da Folha</th>
                  <th className="px-4 py-2 text-left text-xs font-bold text-gray-900 dark:text-gray-100 print:text-black uppercase border-r-2 border-gray-800 dark:border-gray-600 print:border-black">
                    <div className="flex items-center justify-between">
                      <span>Acabamento/Mod</span>
                      <span className="text-gray-900 dark:text-gray-100 print:text-black text-[10px] ml-1 uppercase bg-white dark:bg-gray-800 print:bg-white px-2 py-0.5 rounded border-2 border-gray-800 dark:border-gray-600 print:border-black">{caracteristica}</span>
                    </div>
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-bold text-gray-900 dark:text-gray-100 print:text-black uppercase w-20">Qtd</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 print:bg-white divide-y-2 divide-gray-800 dark:divide-gray-600 print:divide-black">
               {rows.map((row, idx) => (
                 <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700 print:hover:bg-transparent border-b-2 border-gray-800 dark:border-gray-600 print:border-black">
                   <td className="px-4 py-1.5 text-sm text-gray-900 dark:text-gray-100 print:text-black font-mono font-bold border-r-2 border-gray-800 dark:border-gray-600 print:border-black truncate">{row.largura} x {row.altura}</td>
                   <td className="px-4 py-1.5 text-sm text-gray-900 dark:text-gray-100 print:text-black font-bold border-r-2 border-gray-800 dark:border-gray-600 print:border-black truncate">{row.acabamento}</td>
                   <td className="px-4 py-1.5 text-sm text-gray-900 dark:text-gray-100 print:text-black text-right font-bold">{row.qtd}</td>
                 </tr>
               ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

function processVergas(kits: any[]) {
   const agrupar = new Map();
   kits.forEach(k => {
      const fl = parseInt(k.folhaLargura, 10);
      if (!k.aduelaLargura || isNaN(fl)) return;
      const vergaLength = fl + 47;
      
      const key = `${k.aduelaLargura}-${vergaLength}`;
      const val = agrupar.get(key) || { aduelaLargura: k.aduelaLargura, vergaLength: vergaLength, folhaRef: fl, qtd: 0 };
      val.qtd += 1;
      agrupar.set(key, val);
   });
   
   return Array.from(agrupar.values()).sort((a,b) => {
       if (parseInt(b.aduelaLargura) !== parseInt(a.aduelaLargura)) return parseInt(b.aduelaLargura) - parseInt(a.aduelaLargura);
       return b.vergaLength - a.vergaLength;
   });
}

function renderAutoVergas(kits: any[]) {
  const data = processVergas(kits);
  
  const groupedData = data.reduce((acc, row) => {
    const key = `${row.vergaLength} (${row.folhaRef} + 47)`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(row);
    return acc;
  }, {} as Record<string, typeof data>);

  // Sort keys numerically by verga length descending
  const sortedKeys = Object.keys(groupedData).sort((a,b) => parseInt(b) - parseInt(a));

  return (
    <div className="flex flex-col gap-6">
      {sortedKeys.map(vergaKey => (
        <div key={vergaKey} className="break-inside-avoid">
          <div className="flex w-full mb-1">
            <div className="flex-1 text-center font-bold text-emerald-700 dark:text-emerald-400 print:text-green-700 font-mono text-sm">{vergaKey}</div>
            <div className="w-32"></div>
          </div>
          <div className="border-2 border-gray-800 dark:border-gray-600 print:border-black rounded-lg overflow-hidden shadow-sm">
            <table className="min-w-full divide-y-2 divide-gray-800 dark:divide-gray-600 print:divide-black table-fixed">
              <thead className="bg-gray-100 dark:bg-gray-700 print:bg-gray-100">
                <tr>
                    <th className="px-4 py-2 text-left text-xs font-bold text-gray-900 dark:text-gray-100 print:text-black uppercase border-r-2 border-gray-800 dark:border-gray-600 print:border-black">Largura da Aduela</th>
                    <th className="px-4 py-2 text-center text-xs font-bold text-gray-900 dark:text-gray-100 print:text-black uppercase w-32">Qtd de Vergas</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 print:bg-white divide-y-2 divide-gray-800 dark:divide-gray-600 print:divide-black">
                 {groupedData[vergaKey].map((row, idx) => (
                   <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700 print:hover:bg-transparent border-b-2 border-gray-800 dark:border-gray-600 print:border-black">
                     <td className="px-4 py-1.5 text-sm text-gray-900 dark:text-gray-100 print:text-black border-r-2 border-gray-800 dark:border-gray-600 print:border-black font-mono font-bold text-center truncate">{row.aduelaLargura}</td>
                     <td className="px-4 py-1.5 text-sm text-gray-900 dark:text-gray-100 print:text-black text-center font-bold w-32 bg-gray-50 dark:bg-gray-900 print:bg-gray-50">{row.qtd}</td>
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

function processAlizares(kits: any[]) {
   const agrupar = new Map();
   kits.forEach(k => {
      // based on qtdeLadosAduela
      const numLados = parseInt(k.qtdeLadosAduela || '0', 10) || 0;
      if (numLados === 0) return;
      const key = `Padrao-${k.cor || k.acabamento || 'NM'}`;
      const val = agrupar.get(key) || { desc: `Alizar - Kit Lados: ${numLados}`, acabamento: k.acabamento, qtd: 0 };
      val.qtd += numLados; // 1 lado = 1 jogo de alizar
      agrupar.set(key, val);
   });
   return Array.from(agrupar.values());
}

function renderAutoAlizares(kits: any[]) {
  const data = processAlizares(kits);
  return (
    <div className="border-2 border-gray-800 dark:border-gray-600 print:border-black rounded-lg overflow-hidden shadow-sm break-inside-avoid">
      <table className="min-w-full divide-y-2 divide-gray-800 dark:divide-gray-600 print:divide-black">
        <thead className="bg-gray-100 dark:bg-gray-700 print:bg-gray-100">
          <tr>
              <th className="px-4 py-2 text-left text-xs font-bold text-gray-900 dark:text-gray-100 print:text-black uppercase border-r-2 border-gray-800 dark:border-gray-600 print:border-black">Descrição</th>
              <th className="px-4 py-2 text-left text-xs font-bold text-gray-900 dark:text-gray-100 print:text-black uppercase border-r-2 border-gray-800 dark:border-gray-600 print:border-black">Acabamento</th>
              <th className="px-4 py-2 text-right text-xs font-bold text-gray-900 dark:text-gray-100 print:text-black uppercase">Qtd (Jogos/Lados)</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 print:bg-white divide-y-2 divide-gray-800 dark:divide-gray-600 print:divide-black">
           {data.map((row, idx) => (
             <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700 print:hover:bg-transparent border-b-2 border-gray-800 dark:border-gray-600 print:border-black">
               <td className="px-4 py-1.5 text-sm text-gray-900 dark:text-gray-100 print:text-black border-r-2 border-gray-800 dark:border-gray-600 print:border-black font-bold">{row.desc}</td>
               <td className="px-4 py-1.5 text-sm text-gray-900 dark:text-gray-100 print:text-black border-r-2 border-gray-800 dark:border-gray-600 print:border-black font-bold">{row.acabamento}</td>
               <td className="px-4 py-1.5 text-sm text-gray-900 dark:text-gray-100 print:text-black text-right font-bold w-32 bg-gray-50 dark:bg-gray-900 print:bg-gray-50">{row.qtd}</td>
             </tr>
           ))}
        </tbody>
      </table>
    </div>
  );
}
