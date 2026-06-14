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

// ============== 1. RELATORIO DE PORTAS ==============
function processPortas(kits: any[]) {
   const agrupar = new Map();
   kits.forEach(k => {
      if (!k.folhaLargura || !k.folhaAltura) return;

      const tipologia = k.tipologia || '-';
      const fLargura = k.folhaLargura;
      const fAltura = k.folhaAltura;
      const fQtd = parseInt(k.qtdeFolhasPorKit || '1', 10) || 1;
      const acabamento = k.acabamentoPorta || '-';
      const caracteristica = k.caracteristicaPorta || k.modelo || 'HONEY';
      const isDuplo = !!k.kitDuplo;
      const qtdFolhaKitStr = k.qtdeFolhasPorKit || '1'; 

      const key = `\${tipologia}-\${fLargura}x\${fAltura}-\${qtdFolhaKitStr}-\${acabamento}-\${caracteristica}-\${isDuplo}`;

      const val = agrupar.get(key) || { 
          tipologia, largura: fLargura, altura: fAltura, qtdFolhaKit: qtdFolhaKitStr,
          acabamento, caracteristica, qtdTotal: 0 
      };
      
      const qtde = isDuplo ? fQtd * 2 : fQtd;
      val.qtdTotal += qtde;
      agrupar.set(key, val);
   });
   
   return Array.from(agrupar.values()).sort((a, b) => a.tipologia.localeCompare(b.tipologia));
}

function renderAutoPortas(kits: any[]) {
  const data = processPortas(kits);
  return (
    <div className="border border-gray-300 dark:border-gray-600 print:border-black rounded overflow-hidden shadow-sm break-inside-avoid">
      <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-600 print:divide-black text-[11px] sm:text-sm">
        <thead className="bg-[#0f172a] text-white print:bg-gray-100 print:text-black">
          <tr>
            <th className="px-3 py-2 text-left font-semibold uppercase whitespace-nowrap border-x border-[#1e293b] print:border-black">Tipologia</th>
            <th className="px-3 py-2 text-center font-semibold uppercase whitespace-nowrap border-x border-[#1e293b] print:border-black">Folha Larg</th>
            <th className="px-3 py-2 text-center font-semibold uppercase whitespace-nowrap border-x border-[#1e293b] print:border-black">Folha Alt</th>
            <th className="px-3 py-2 text-center font-semibold uppercase whitespace-nowrap border-x border-[#1e293b] print:border-black">Qtd Folha/Kit</th>
            <th className="px-3 py-2 text-left font-semibold uppercase whitespace-nowrap border-x border-[#1e293b] print:border-black">Acabamento da Porta</th>
            <th className="px-3 py-2 text-left font-semibold uppercase whitespace-nowrap border-x border-[#1e293b] print:border-black">Caracteristica da Porta</th>
            <th className="px-3 py-2 text-center font-semibold uppercase whitespace-nowrap border-x border-[#1e293b] print:border-black">Qtd Total (Unid)</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 print:bg-white divide-y divide-gray-200 dark:divide-gray-700 print:divide-black">
          {data.map((row, idx) => (
            <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700 print:hover:bg-transparent">
              <td className="px-3 py-2 font-medium border-x border-gray-200 print:border-black">{row.tipologia}</td>
              <td className="px-3 py-2 text-center border-x border-gray-200 print:border-black">{row.largura}</td>
              <td className="px-3 py-2 text-center border-x border-gray-200 print:border-black">{row.altura}</td>
              <td className="px-3 py-2 text-center border-x border-gray-200 print:border-black">{row.qtdFolhaKit}</td>
              <td className="px-3 py-2 border-x border-gray-200 print:border-black">{row.acabamento}</td>
              <td className="px-3 py-2 border-x border-gray-200 print:border-black">{row.caracteristica}</td>
              <td className="px-3 py-2 text-center font-bold bg-gray-50 dark:bg-gray-900 print:bg-transparent border-x border-gray-200 print:border-black">{row.qtdTotal}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


// ============== 2. RELATORIO DE ADUELAS ==============
function processAduelas(kits: any[]) {
   const agrupar = new Map();
   kits.forEach(k => {
      if (!k.aduelaLargura || !k.aduelaAltura) return;

      const tipologia = k.tipologia || '-';
      const adLargura = k.aduelaLargura;
      const adAltura = k.aduelaAltura;
      const fQtdStr = k.qtdeFolhasPorKit || '1';
      const fQtd = parseInt(fQtdStr, 10) || 1;
      const regulagem = k.regulagem || '-';
      const acabamento = k.acabamentoAduela || '-';
      const qtdLadosAduela = k.qtdeLadosAduela || '-';
      const isDuplo = !!k.kitDuplo;

      const key = `\${tipologia}-\${adLargura}x\${adAltura}-\${fQtdStr}-\${regulagem}-\${acabamento}-\${qtdLadosAduela}-\${isDuplo}`;

      const val = agrupar.get(key) || { 
          tipologia, adLargura, adAltura, fQtdStr, regulagem, acabamento, qtdLadosAduela, qtdTotalKits: 0 
      };
      
      const qtde = isDuplo ? fQtd * 2 : fQtd; 
      // For aduelas, total means how many "conjuntos de aduelas" are there. Usually 1 set per kit (or 2 sets for kitDuplo? Let's say it's just 'count of kits' essentially because 1 kit = 1 aduela set, unless duplo). Let's use qtde to scale proportional.
      val.qtdTotalKits += isDuplo ? 2 : 1; 
      agrupar.set(key, val);
   });
   
   return Array.from(agrupar.values()).sort((a, b) => a.tipologia.localeCompare(b.tipologia));
}

function renderAutoAduelas(kits: any[]) {
  const data = processAduelas(kits);
  return (
    <div className="border border-gray-300 dark:border-gray-600 print:border-black rounded overflow-hidden shadow-sm break-inside-avoid">
      <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-600 print:divide-black text-[11px] sm:text-sm">
        <thead className="bg-[#0f172a] text-white print:bg-gray-100 print:text-black">
          <tr>
            <th className="px-3 py-2 text-left font-semibold uppercase whitespace-nowrap border-x border-[#1e293b] print:border-black">Tipologia</th>
            <th className="px-3 py-2 text-center font-semibold uppercase whitespace-nowrap border-x border-[#1e293b] print:border-black">Aduela Larg</th>
            <th className="px-3 py-2 text-center font-semibold uppercase whitespace-nowrap border-x border-[#1e293b] print:border-black">Aduela Alt</th>
            <th className="px-3 py-2 text-center font-semibold uppercase whitespace-nowrap border-x border-[#1e293b] print:border-black">Qtd Lados</th>
            <th className="px-3 py-2 text-left font-semibold uppercase whitespace-nowrap border-x border-[#1e293b] print:border-black">Regulagem</th>
            <th className="px-3 py-2 text-left font-semibold uppercase whitespace-nowrap border-x border-[#1e293b] print:border-black">Acabamento da Aduela</th>
            <th className="px-3 py-2 text-center font-semibold uppercase whitespace-nowrap border-x border-[#1e293b] print:border-black">Total (Jogos)</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 print:bg-white divide-y divide-gray-200 dark:divide-gray-700 print:divide-black">
          {data.map((row, idx) => (
            <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700 print:hover:bg-transparent">
              <td className="px-3 py-2 font-medium border-x border-gray-200 print:border-black">{row.tipologia}</td>
              <td className="px-3 py-2 text-center border-x border-gray-200 print:border-black">{row.adLargura}</td>
              <td className="px-3 py-2 text-center border-x border-gray-200 print:border-black">{row.adAltura}</td>
              <td className="px-3 py-2 text-center border-x border-gray-200 print:border-black">{row.qtdLadosAduela}</td>
              <td className="px-3 py-2 border-x border-gray-200 print:border-black">{row.regulagem}</td>
              <td className="px-3 py-2 border-x border-gray-200 print:border-black">{row.acabamento}</td>
              <td className="px-3 py-2 text-center font-bold bg-gray-50 dark:bg-gray-900 print:bg-transparent border-x border-gray-200 print:border-black">{row.qtdTotalKits}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


// ============== 3. RELATORIO DE ALIZARES ==============
function processAlizares(kits: any[]) {
   const agrupar = new Map();
   kits.forEach(k => {
      if (!k.qtdeLadosAduela) return;

      const tipologia = k.tipologia || '-';
      const qtdLadosAduela = k.qtdeLadosAduela || '-';
      const fQtdStr = k.qtdeFolhasPorKit || '1';
      const acabamento = k.acabamentoAduela || '-';
      const isDuplo = !!k.kitDuplo;

      const key = `\${tipologia}-\${qtdLadosAduela}-\${fQtdStr}-\${acabamento}-\${isDuplo}`;

      const val = agrupar.get(key) || { 
          tipologia, qtdLadosAduela, fQtdStr, acabamento, qtdTotalJogos: 0 
      };
      
      val.qtdTotalJogos += isDuplo ? 2 : 1;
      agrupar.set(key, val);
   });
   
   return Array.from(agrupar.values()).sort((a, b) => a.tipologia.localeCompare(b.tipologia));
}

function renderAutoAlizares(kits: any[]) {
  const data = processAlizares(kits);
  return (
    <div className="border border-gray-300 dark:border-gray-600 print:border-black rounded overflow-hidden shadow-sm break-inside-avoid">
      <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-600 print:divide-black text-[11px] sm:text-sm">
        <thead className="bg-[#0f172a] text-white print:bg-gray-100 print:text-black">
          <tr>
            <th className="px-3 py-2 text-left font-semibold uppercase whitespace-nowrap border-x border-[#1e293b] print:border-black">Tipologia</th>
            <th className="px-3 py-2 text-center font-semibold uppercase whitespace-nowrap border-x border-[#1e293b] print:border-black">Qtd Lados Aduela</th>
            <th className="px-3 py-2 text-center font-semibold uppercase whitespace-nowrap border-x border-[#1e293b] print:border-black">Qtd Folha/Kit</th>
            <th className="px-3 py-2 text-left font-semibold uppercase whitespace-nowrap border-x border-[#1e293b] print:border-black">Acabamento da Aduela (Alizar)</th>
            <th className="px-3 py-2 text-center font-semibold uppercase whitespace-nowrap border-x border-[#1e293b] print:border-black">Total (Jogos de Alizar)</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 print:bg-white divide-y divide-gray-200 dark:divide-gray-700 print:divide-black">
          {data.map((row, idx) => (
             <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700 print:hover:bg-transparent">
              <td className="px-3 py-2 font-medium border-x border-gray-200 print:border-black">{row.tipologia}</td>
              <td className="px-3 py-2 text-center border-x border-gray-200 print:border-black">{row.qtdLadosAduela}</td>
              <td className="px-3 py-2 text-center border-x border-gray-200 print:border-black">{row.fQtdStr}</td>
              <td className="px-3 py-2 border-x border-gray-200 print:border-black">{row.acabamento}</td>
              <td className="px-3 py-2 text-center font-bold bg-gray-50 dark:bg-gray-900 print:bg-transparent border-x border-gray-200 print:border-black">{row.qtdTotalJogos}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


// ============== 4. RELATORIO DE USINAGEM DE PORTAS ==============
function processUsinagemPortas(kits: any[]) {
   const agrupar = new Map();
   kits.forEach(k => {
      // Usinagem portas depende da abertura e fechadura/dobradica
      if (!k.folhaLargura || !k.folhaAltura) return;

      const tipologia = k.tipologia || '-';
      const fLargura = k.folhaLargura;
      const fAltura = k.folhaAltura;
      const isDuplo = !!k.kitDuplo;
      const abertura = k.abertura || '-';
      const fMarca = k.fechaduraMarca || '-';
      const fTipo = k.fechaduraTipo || '-';
      const fGrid = k.fechaduraGrid || '-';
      const dobMarca = k.dobradicaMarca || '-';
      const dobMedida = k.dobradicaMedida || '-';

      const key = `\${tipologia}-\${fLargura}x\${fAltura}-\${abertura}-\${fMarca}-\${fTipo}-\${fGrid}-\${dobMarca}-\${dobMedida}-\${isDuplo}`;

      const val = agrupar.get(key) || { 
          tipologia, largura: fLargura, altura: fAltura, abertura,
          fMarca, fTipo, fGrid, dobMarca, dobMedida, qtdTotal: 0 
      };
      
      const fQtd = parseInt(k.qtdeFolhasPorKit || '1', 10) || 1;
      const qtde = isDuplo ? fQtd * 2 : fQtd; 
      val.qtdTotal += qtde;
      agrupar.set(key, val);
   });
   
   return Array.from(agrupar.values()).sort((a, b) => a.tipologia.localeCompare(b.tipologia));
}

function renderAutoUsinagemPortas(kits: any[]) {
  const data = processUsinagemPortas(kits);
  return (
    <div className="border border-gray-300 dark:border-gray-600 print:border-black rounded overflow-hidden shadow-sm break-inside-avoid">
       <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-600 print:divide-black text-[11px] sm:text-sm">
        <thead className="bg-[#0f172a] text-white print:bg-gray-100 print:text-black">
          <tr>
            <th className="px-3 py-2 text-left font-semibold uppercase whitespace-nowrap border-x border-[#1e293b] print:border-black">Tipologia</th>
            <th className="px-3 py-2 text-center font-semibold uppercase whitespace-nowrap border-x border-[#1e293b] print:border-black">Folha</th>
            <th className="px-3 py-2 text-left font-semibold uppercase whitespace-nowrap border-x border-[#1e293b] print:border-black">Abertura</th>
            <th className="px-3 py-2 text-left font-semibold uppercase whitespace-nowrap border-x border-[#1e293b] print:border-black">Fech. Tipo</th>
            <th className="px-3 py-2 text-left font-semibold uppercase whitespace-nowrap border-x border-[#1e293b] print:border-black">Fech. Marca</th>
            <th className="px-3 py-2 text-left font-semibold uppercase whitespace-nowrap border-x border-[#1e293b] print:border-black">Fech. Grid</th>
            <th className="px-3 py-2 text-left font-semibold uppercase whitespace-nowrap border-x border-[#1e293b] print:border-black">Dob. Marca</th>
            <th className="px-3 py-2 text-center font-semibold uppercase whitespace-nowrap border-x border-[#1e293b] print:border-black">Dob. Medida</th>
            <th className="px-3 py-2 text-center font-semibold uppercase whitespace-nowrap border-x border-[#1e293b] print:border-black">Qtd (Folhas)</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 print:bg-white divide-y divide-gray-200 dark:divide-gray-700 print:divide-black">
          {data.map((row, idx) => (
             <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700 print:hover:bg-transparent">
              <td className="px-3 py-2 font-medium border-x border-gray-200 print:border-black">{row.tipologia}</td>
              <td className="px-3 py-2 text-center border-x border-gray-200 print:border-black">{row.largura}x{row.altura}</td>
              <td className="px-3 py-2 border-x border-gray-200 print:border-black">{row.abertura}</td>
              <td className="px-3 py-2 border-x border-gray-200 print:border-black">{row.fTipo}</td>
              <td className="px-3 py-2 border-x border-gray-200 print:border-black">{row.fMarca}</td>
              <td className="px-3 py-2 border-x border-gray-200 print:border-black">{row.fGrid}</td>
              <td className="px-3 py-2 border-x border-gray-200 print:border-black">{row.dobMarca}</td>
              <td className="px-3 py-2 text-center border-x border-gray-200 print:border-black">{row.dobMedida}</td>
              <td className="px-3 py-2 text-center font-bold bg-gray-50 dark:bg-gray-900 print:bg-transparent border-x border-gray-200 print:border-black">{row.qtdTotal}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


// ============== 5. RELATORIO DE USINAGEM DE ADUELAS ==============
function processUsinagemAduelas(kits: any[]) {
   const agrupar = new Map();
   kits.forEach(k => {
      // Usinagem aduelas depende de aduelaLarg/Alt, abertura, e ferragens e montantes
      if (!k.aduelaLargura || !k.aduelaAltura) return;

      const tipologia = k.tipologia || '-';
      const adLargura = k.aduelaLargura;
      const adAltura = k.aduelaAltura;
      const isDuplo = !!k.kitDuplo;
      const abertura = k.abertura || '-';
      const fTipo = k.fechaduraTipo || '-';
      const dobMarca = k.dobradicaMarca || '-';
      const dobMedida = k.dobradicaMedida || '-';
      
      const qtdLadosAduela = k.qtdeLadosAduela || '-';
      const montantesMedida = k.montantesMedida || '-';
      const montantesFolgas = k.montantesFolgas || '-';
      const bitsQtde = k.bitsQtde || '-';
      const bitsFaces = k.bitsFaces || '-';

      const key = `\${tipologia}-\${adLargura}x\${adAltura}-\${abertura}-\${fTipo}-\${dobMarca}-\${dobMedida}-\${qtdLadosAduela}-\${montantesMedida}-\${montantesFolgas}-\${bitsQtde}-\${bitsFaces}-\${isDuplo}`;

      const val = agrupar.get(key) || { 
          tipologia, adLargura, adAltura, abertura,
          fTipo, dobMarca, dobMedida, qtdLadosAduela, montantesMedida, montantesFolgas, bitsQtde, bitsFaces, qtdTotalJogos: 0 
      };
      
      val.qtdTotalJogos += isDuplo ? 2 : 1; 
      agrupar.set(key, val);
   });
   
   return Array.from(agrupar.values()).sort((a, b) => a.tipologia.localeCompare(b.tipologia));
}

function renderAutoUsinagemAduelas(kits: any[]) {
  const data = processUsinagemAduelas(kits);
  return (
    <div className="border border-gray-300 dark:border-gray-600 print:border-black rounded overflow-hidden shadow-sm break-inside-avoid">
      <div className="overflow-x-auto w-full">
       <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-600 print:divide-black text-[11px] sm:text-xs">
        <thead className="bg-[#0f172a] text-white print:bg-gray-100 print:text-black">
          <tr>
            <th className="px-2 py-2 text-left font-semibold uppercase whitespace-nowrap border-x border-[#1e293b] print:border-black">Tipologia</th>
            <th className="px-2 py-2 text-center font-semibold uppercase whitespace-nowrap border-x border-[#1e293b] print:border-black">Aduela</th>
            <th className="px-2 py-2 text-left font-semibold uppercase whitespace-nowrap border-x border-[#1e293b] print:border-black">Abertura</th>
            <th className="px-2 py-2 text-left font-semibold uppercase whitespace-nowrap border-x border-[#1e293b] print:border-black">Fech. Tipo</th>
            <th className="px-2 py-2 text-left font-semibold uppercase whitespace-nowrap border-x border-[#1e293b] print:border-black">Dob. Marca</th>
            <th className="px-2 py-2 text-center font-semibold uppercase whitespace-nowrap border-x border-[#1e293b] print:border-black">Dob. Medida</th>
            <th className="px-2 py-2 text-center font-semibold uppercase whitespace-nowrap border-x border-[#1e293b] print:border-black">Qtd Lados</th>
            <th className="px-2 py-2 text-center font-semibold uppercase whitespace-nowrap border-x border-[#1e293b] print:border-black">Montantes Medida</th>
            <th className="px-2 py-2 text-center font-semibold uppercase whitespace-nowrap border-x border-[#1e293b] print:border-black">Montantes Folgas</th>
            <th className="px-2 py-2 text-center font-semibold uppercase whitespace-nowrap border-x border-[#1e293b] print:border-black">B. Qtd / Faces</th>
            <th className="px-2 py-2 text-center font-semibold uppercase whitespace-nowrap border-x border-[#1e293b] print:border-black">Qtd (Jogos)</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 print:bg-white divide-y divide-gray-200 dark:divide-gray-700 print:divide-black">
          {data.map((row, idx) => (
             <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700 print:hover:bg-transparent break-inside-avoid">
              <td className="px-2 py-2 font-medium border-x border-gray-200 print:border-black">{row.tipologia}</td>
              <td className="px-2 py-2 text-center border-x border-gray-200 print:border-black">{row.adLargura}x{row.adAltura}</td>
              <td className="px-2 py-2 border-x border-gray-200 print:border-black">{row.abertura}</td>
              <td className="px-2 py-2 border-x border-gray-200 print:border-black">{row.fTipo}</td>
              <td className="px-2 py-2 border-x border-gray-200 print:border-black">{row.dobMarca}</td>
              <td className="px-2 py-2 text-center border-x border-gray-200 print:border-black">{row.dobMedida}</td>
              <td className="px-2 py-2 text-center border-x border-gray-200 print:border-black">{row.qtdLadosAduela}</td>
              <td className="px-2 py-2 text-center border-x border-gray-200 print:border-black">{row.montantesMedida}</td>
              <td className="px-2 py-2 text-center border-x border-gray-200 print:border-black">{row.montantesFolgas}</td>
              <td className="px-2 py-2 text-center border-x border-gray-200 print:border-black">{row.bitsQtde !== '-' ? `\${row.bitsQtde} / \${row.bitsFaces}` : '-'}</td>
              <td className="px-2 py-2 text-center font-bold bg-gray-50 dark:bg-gray-900 print:bg-transparent border-x border-gray-200 print:border-black">{row.qtdTotalJogos}</td>
            </tr>
          ))}
        </tbody>
       </table>
      </div>
    </div>
  );
}


// ============== 6. RELATORIO DE VERGAS ==============
function processVergas(kits: any[]) {
   const agrupar = new Map();
   kits.forEach(k => {
      const fl = parseInt(k.folhaLargura, 10);
      if (!k.aduelaLargura || isNaN(fl)) return;
      const fAltura = k.folhaAltura || '-';
      const vergaLength = fl + 47;
      
      const tipologia = k.tipologia || '-';
      const adLargura = k.aduelaLargura;
      const adAltura = k.aduelaAltura;

      const key = `\${tipologia}-\${adLargura}-\${vergaLength}-\${fl}`;
      const val = agrupar.get(key) || { 
          tipologia, adLargura, adAltura, vergaLength, folhaRef: `\${fl}x\${fAltura}`, qtd: 0 
      };
      
      const isDuplo = !!k.kitDuplo;
      val.qtd += isDuplo ? 2 : 1; 
      agrupar.set(key, val);
   });
   
   return Array.from(agrupar.values()).sort((a,b) => {
       if (a.tipologia !== b.tipologia) return a.tipologia.localeCompare(b.tipologia);
       if (parseInt(b.adLargura) !== parseInt(a.adLargura)) return parseInt(b.adLargura) - parseInt(a.adLargura);
       return b.vergaLength - a.vergaLength;
   });
}

function renderAutoVergas(kits: any[]) {
  const data = processVergas(kits);
  return (
    <div className="border border-gray-300 dark:border-gray-600 print:border-black rounded overflow-hidden shadow-sm break-inside-avoid w-full sm:w-3/4 mx-auto">
      <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-600 print:divide-black text-[11px] sm:text-sm">
        <thead className="bg-[#0f172a] text-white print:bg-gray-100 print:text-black">
          <tr>
            <th className="px-3 py-2 text-left font-semibold uppercase border-x border-[#1e293b] print:border-black">Tipologia</th>
            <th className="px-3 py-2 text-center font-semibold uppercase border-x border-[#1e293b] print:border-black">Aduela Larg</th>
            <th className="px-3 py-2 text-center font-semibold uppercase border-x border-[#1e293b] print:border-black">Verga (Folha L + 47mm)</th>
            <th className="px-3 py-2 text-center font-semibold uppercase border-x border-[#1e293b] print:border-black">Ref Folha</th>
            <th className="px-3 py-2 text-center font-semibold uppercase border-x border-[#1e293b] print:border-black">Qtd Total</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 print:bg-white divide-y divide-gray-200 dark:divide-gray-700 print:divide-black">
           {data.map((row, idx) => (
             <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700 print:hover:bg-transparent">
               <td className="px-3 py-2 font-medium border-x border-gray-200 print:border-black">{row.tipologia}</td>
               <td className="px-3 py-2 text-center border-x border-gray-200 print:border-black">{row.adLargura}</td>
               <td className="px-3 py-2 text-center font-bold font-mono border-x border-gray-200 print:border-black">{row.vergaLength}</td>
               <td className="px-3 py-2 text-center text-gray-500 print:text-gray-700 border-x border-gray-200 print:border-black">({row.folhaRef})</td>
               <td className="px-3 py-2 text-center font-bold bg-gray-50 dark:bg-gray-900 print:bg-transparent border-x border-gray-200 print:border-black">{row.qtd}</td>
             </tr>
           ))}
        </tbody>
      </table>
    </div>
  );
}

