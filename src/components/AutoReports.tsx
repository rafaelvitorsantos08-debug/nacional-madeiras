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

  return <div className="mt-6">{content}</div>;
}

function processAduelas(kits: any[]) {
   const agrupar = new Map();
   kits.forEach(k => {
      if (!k.aduelaLargura || !k.aduelaAltura) return;
      const key = `${k.aduelaLargura}x${k.aduelaAltura} - ${k.acabamento || 'S/A'}`;
      const qtde = parseInt(k.qtdeFolhasPorKit || '1', 10) || 1; // Or just count total kits?
      // For aduelas we count per kit. But the user said "tendo em vista que as dimensoes que se repetem podem ser unificadas para gerar um total". I will sum 1 per kit row, assuming 1 kit = 1 aduela match.
      const val = agrupar.get(key) || { largura: k.aduelaLargura, altura: k.aduelaAltura, acabamento: k.acabamento, qtd: 0 };
      val.qtd += 1; // 1 aduela por kit
      agrupar.set(key, val);
   });
   return Array.from(agrupar.values());
}

function renderAutoAduelas(kits: any[]) {
  const data = processAduelas(kits);
  return (
    <div className="overflow-hidden border border-gray-200 rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Largura x Altura (mm)</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Acabamento</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Qtd</th></tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
           {data.map((row, idx) => (
             <tr key={idx}>
               <td className="px-4 py-2 text-sm text-gray-900">{idx + 1}</td>
               <td className="px-4 py-2 text-sm text-gray-900">{row.largura} x {row.altura}</td>
               <td className="px-4 py-2 text-sm text-gray-900">{row.acabamento}</td>
               <td className="px-4 py-2 text-sm text-gray-900 text-right font-medium">{row.qtd}</td>
             </tr>
           ))}
        </tbody>
      </table>
    </div>
  );
}

function processUsinagem(kits: any[], isPorta: boolean) {
   const agrupar: Record<string, Record<string, { dimensao: string, qtd: number, dobraEspecial: boolean }[]>> = {};
   
   kits.forEach(k => {
      const cat = getCategoriaComodo(k.comodo);
      const abertura = k.abertura || 'N/A';
      
      const isDobra = isEspecialDobraOnly(k.folhaLargura, cat);
      
      let dimensao = '';
      if (isPorta) {
         if (!k.folhaLargura || !k.folhaAltura) return;
         dimensao = `${k.folhaLargura}x${k.folhaAltura} (${k.modelo || k.caracteristica || ''})`;
      } else {
         if (!k.aduelaLargura || !k.aduelaAltura) return;
         dimensao = `${k.aduelaLargura}x${k.aduelaAltura} (${k.modelo || k.caracteristica || ''})`;
      }

      if (!agrupar[cat]) agrupar[cat] = {};
      if (!agrupar[cat][abertura]) agrupar[cat][abertura] = [];

      const list = agrupar[cat][abertura];
      const existing = list.find(x => x.dimensao === dimensao && x.dobraEspecial === isDobra);
      const qtde = parseInt(k.qtdeFolhasPorKit || '1', 10) || 1;
      
      if (existing) existing.qtd += isPorta ? qtde : 1;
      else list.push({ dimensao, qtd: isPorta ? qtde : 1, dobraEspecial: isDobra });
   });

   return Object.keys(agrupar).sort().map(cat => ({
      categoria: cat,
      aberturas: Object.keys(agrupar[cat]).sort().map(ab => ({
          abertura: ab,
          itens: agrupar[cat][ab].sort((a,b) => a.dimensao.localeCompare(b.dimensao))
      }))
   }));
}

function renderUsinagem(kits: any[], isPorta: boolean) {
  const data = processUsinagem(kits, isPorta);
  if (data.length === 0) return <p className="text-gray-500 italic">Nenhum dado encontrado para usinagem.</p>;

  return (
    <div className="flex flex-col gap-6">
       {data.map(cat => (
         <div key={cat.categoria} className="border border-indigo-200 rounded-lg overflow-hidden">
           <h3 className="bg-indigo-50 px-4 py-2 font-bold text-indigo-900 border-b border-indigo-200">Cômodo: {cat.categoria}</h3>
           <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {cat.aberturas.map(ab => (
                <div key={ab.abertura} className="border border-gray-200 rounded p-2">
                   <h4 className="font-semibold text-gray-700 border-b border-gray-100 pb-1 mb-2">Abertura: {ab.abertura}</h4>
                   <table className="min-w-full text-sm">
                      <thead>
                        <tr><th className="text-left text-gray-500 font-medium">Dimensão</th><th className="text-right text-gray-500 font-medium w-16">Qtd</th></tr>
                      </thead>
                      <tbody>
                        {ab.itens.map((it, i) => (
                           <tr key={i} className="border-t border-gray-50">
                             <td className="py-1 text-gray-800">
                                {it.dimensao}
                                {it.dobraEspecial && <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-1 rounded font-medium">SÓ DOBRADIÇA</span>}
                             </td>
                             <td className="py-1 text-right font-medium">{it.qtd}</td>
                           </tr>
                        ))}
                      </tbody>
                   </table>
                </div>
              ))}
           </div>
         </div>
       ))}
    </div>
  );
}

function renderAutoUsinagemAduelas(kits: any[]) { return renderUsinagem(kits, false); }
function renderAutoUsinagemPortas(kits: any[]) { return renderUsinagem(kits, true); }

function processPortas(kits: any[]) {
   const agrupar = new Map();
   kits.forEach(k => {
      if (!k.folhaLargura || !k.folhaAltura) return;
      const key = `${k.folhaLargura}x${k.folhaAltura}-${k.acabamento}-${k.caracteristica}-${k.modelo}`;
      const qtde = parseInt(k.qtdeFolhasPorKit || '1', 10) || 1;
      const val = agrupar.get(key) || { largura: k.folhaLargura, altura: k.folhaAltura, acabamento: k.acabamento, caracteristica: k.caracteristica || k.modelo, qtd: 0 };
      val.qtd += qtde;
      agrupar.set(key, val);
   });
   return Array.from(agrupar.values());
}

function renderAutoPortas(kits: any[]) {
  const data = processPortas(kits);
  return (
    <div className="overflow-hidden border border-gray-200 rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Dimensão da Folha</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Acabamento/Mod</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Qtd</th></tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
           {data.map((row, idx) => (
             <tr key={idx}>
               <td className="px-4 py-2 text-sm text-gray-900">{idx + 1}</td>
               <td className="px-4 py-2 text-sm text-gray-900">{row.largura} x {row.altura}</td>
               <td className="px-4 py-2 text-sm text-gray-900">{row.acabamento} {row.caracteristica && `(${row.caracteristica})`}</td>
               <td className="px-4 py-2 text-sm text-gray-900 text-right font-medium">{row.qtd}</td>
             </tr>
           ))}
        </tbody>
      </table>
    </div>
  );
}

function processVergas(kits: any[]) {
   const agrupar = new Map();
   kits.forEach(k => {
      // verga = aduelaLargura + based on door, usually just reference folhaLargura for grouping
      if (!k.aduelaLargura || !k.folhaLargura) return;
      const key = `${k.aduelaLargura}-${k.folhaLargura}`;
      const val = agrupar.get(key) || { aduelaLargura: k.aduelaLargura, folhaLargura: k.folhaLargura, qtd: 0 };
      val.qtd += 1;
      agrupar.set(key, val);
   });
   return Array.from(agrupar.values());
}

function renderAutoVergas(kits: any[]) {
  const data = processVergas(kits);
  return (
    <div className="overflow-hidden border border-gray-200 rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Largura da Aduela</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ref. Folha (mm)</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Qtd de Vergas</th></tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
           {data.map((row, idx) => (
             <tr key={idx}>
               <td className="px-4 py-2 text-sm text-gray-900">{idx + 1}</td>
               <td className="px-4 py-2 text-sm text-gray-900">{row.aduelaLargura}</td>
               <td className="px-4 py-2 text-sm text-gray-900">Ref: {row.folhaLargura}</td>
               <td className="px-4 py-2 text-sm text-gray-900 text-right font-medium">{row.qtd}</td>
             </tr>
           ))}
        </tbody>
      </table>
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
      // 1 lado = 1 jogo de alizar (~2 pernas + 1 cabeceira)
      // I will just sum the lados 
      val.qtd += numLados;
      agrupar.set(key, val);
   });
   return Array.from(agrupar.values());
}

function renderAutoAlizares(kits: any[]) {
  const data = processAlizares(kits);
  return (
    <div className="overflow-hidden border border-gray-200 rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Descrição</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Acabamento</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Qtd (Jogos/Lados)</th></tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
           {data.map((row, idx) => (
             <tr key={idx}>
               <td className="px-4 py-2 text-sm text-gray-900">{idx + 1}</td>
               <td className="px-4 py-2 text-sm text-gray-900">{row.desc}</td>
               <td className="px-4 py-2 text-sm text-gray-900">{row.acabamento}</td>
               <td className="px-4 py-2 text-sm text-gray-900 text-right font-medium">{row.qtd}</td>
             </tr>
           ))}
        </tbody>
      </table>
    </div>
  );
}
