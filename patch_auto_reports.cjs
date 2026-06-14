const fs = require('fs');
const file = 'src/components/AutoReports.tsx';
let code = fs.readFileSync(file, 'utf8');

const detailedTableCode = `
const COLUMN_HEADERS: Record<string, string> = {
  bloco: "Bloco", apto: "Apto", pavimento: "Pav", coluna: "Col", comodo: "Cômodo", tipologia: "Tipologia", folhaLargura: "F. Larg", folhaAltura: "F. Alt", qtdeFolhasPorKit: "Qtd/Kit", acabamentoPorta: "Acab. Porta", caracteristicaPorta: "Caract. Porta", abertura: "Abertura", aduelaLargura: "Ad. Larg", aduelaAltura: "Ad. Alt", regulagem: "Regulagem", acabamentoAduela: "Acab. Ad.", fechaduraMarca: "F. Marca", fechaduraGrid: "F. Grid", fechaduraTipo: "F. Tipo", dobradicaMarca: "Dob. Marca", dobradicaMedida: "Dob. Medida", qtdeLadosAduela: "Q. Lados", montantesMedida: "Mont. Med.", montantesFolgas: "Mont. Folgas", bitsQtde: "B. Qtd", bitsFaces: "B. Faces", camarao: "Cam.", correr: "Correr", pivotante: "Piv.", veneziana: "Venez.", grelha: "Grelha", bandeira: "Band.", chapa: "Chapa", vidro: "Vidro", fechaFresta: "Fresta", kitDuplo: "K. Duplo", observacao: "Obs"
};

const REPORT_COLS: Record<string, string[]> = {
  auto_portas: ['bloco', 'apto', 'comodo', 'tipologia', 'folhaLargura', 'folhaAltura', 'qtdeFolhasPorKit', 'acabamentoPorta', 'caracteristicaPorta', 'abertura', 'veneziana', 'grelha', 'bandeira', 'chapa', 'vidro', 'fechaFresta', 'observacao'],
  auto_usinagem_portas: ['bloco', 'apto', 'comodo', 'tipologia', 'folhaLargura', 'folhaAltura', 'qtdeFolhasPorKit', 'abertura', 'fechaduraMarca', 'fechaduraGrid', 'fechaduraTipo', 'dobradicaMarca', 'dobradicaMedida', 'camarao', 'correr', 'pivotante', 'observacao'],
  auto_aduelas: ['bloco', 'apto', 'comodo', 'tipologia', 'aduelaLargura', 'aduelaAltura', 'qtdeFolhasPorKit', 'regulagem', 'acabamentoAduela', 'abertura', 'qtdeLadosAduela', 'bandeira', 'observacao'],
  auto_usinagem_aduelas: ['bloco', 'apto', 'comodo', 'tipologia', 'aduelaLargura', 'aduelaAltura', 'qtdeFolhasPorKit', 'abertura', 'fechaduraTipo', 'dobradicaMarca', 'dobradicaMedida', 'qtdeLadosAduela', 'montantesMedida', 'montantesFolgas', 'bitsQtde', 'bitsFaces', 'observacao'],
  auto_alizares: ['bloco', 'apto', 'comodo', 'tipologia', 'qtdeFolhasPorKit', 'qtdeLadosAduela', 'acabamentoAduela', 'observacao'],
  auto_vergas: ['bloco', 'apto', 'comodo', 'tipologia', 'aduelaLargura', 'aduelaAltura', 'folhaLargura', 'qtdeFolhasPorKit', 'observacao']
};

function renderDetailedTable(kits: any[], reportKey: string) {
    const cols = REPORT_COLS[reportKey];
    if (!cols) return null;

    // Remove empty rows where essential fields might be missing entirely, or just return all? We'll return all
    return (
        <div className="mt-12 border-2 border-emerald-900 dark:border-emerald-700 print:border-black rounded-lg overflow-x-auto shadow-sm break-inside-avoid">
           <h4 className="font-bold text-white bg-emerald-900 dark:bg-emerald-800 print:bg-gray-200 print:text-black px-4 py-2 border-b-2 border-emerald-900 dark:border-emerald-700 print:border-black uppercase flex items-center justify-between">
               <span>Lista Detalhada ({kits.length} Lançamentos)</span>
               <span className="text-xs font-normal opacity-80">Linkado com Kits Cadastrados</span>
           </h4>
           <table className="min-w-full text-[10px] sm:text-xs">
              <thead className="bg-emerald-800 dark:bg-emerald-700 text-white print:bg-gray-100 print:text-black">
                <tr>
                   {cols.map(c => (
                       <th key={c} className="px-2 py-2 text-center border-r border-emerald-700 dark:border-emerald-600 print:border-black last:border-r-0 whitespace-nowrap uppercase">
                           {COLUMN_HEADERS[c] || c}
                       </th>
                   ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 print:bg-transparent text-gray-900 dark:text-gray-100 print:text-black">
                 {kits.map((k, i) => (
                    <tr key={i} className="border-b border-gray-200 dark:border-gray-700 print:border-black last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 print:hover:bg-transparent">
                       {cols.map(c => {
                           let val = k[c];
                           if (typeof val === 'boolean') val = val ? '✓' : '';
                           return (
                               <td key={c} className="px-2 py-1.5 text-center border-r border-gray-200 dark:border-gray-700 print:border-black last:border-r-0 font-medium">
                                   {val || '-'}
                               </td>
                           );
                       })}
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>
    );
}
`;

code = code.replace(
  /return <div className="mt-4">\{content\}<\/div>;/,
  'return <div className="mt-4">{content}{renderDetailedTable(kits, reportType)}</div>;'
);

code = code.replace(
  /function processAduelas/,
  detailedTableCode + '\nfunction processAduelas'
);

fs.writeFileSync(file, code);
