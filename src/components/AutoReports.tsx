
import React, { useMemo } from 'react';

export function AutoReportsViewer({ kits, reportType }: { kits: any[], reportType: string }) {
  const content = useMemo(() => {
    switch (reportType) {
      case 'auto_portas': return renderAutoPortas(kits);
      case 'auto_aduelas': return renderAutoAduelas(kits);
      case 'auto_alizares': return renderAutoAlizares(kits);
      case 'auto_usinagem_portas': return renderAutoUsinagemPortas(kits);
      case 'auto_usinagem_aduelas': return renderAutoUsinagemAduelas(kits);
      case 'auto_vergas': return renderAutoVergas(kits);
      default: return null;
    }
  }, [kits, reportType]);

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

