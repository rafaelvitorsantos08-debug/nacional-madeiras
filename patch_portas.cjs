const fs = require('fs');
const file = 'src/components/AutoReports.tsx';
let code = fs.readFileSync(file, 'utf8');

const regex = /function processPortas\(kits.*?(?=function processVergas)/s;
const newProcessAndRender = `function processPortas(kits: any[]) {
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
      
      const qtdFolhaKitStr = k.qtdeFolhasPorKit || '1'; // keep original string or parsed

      const key = \`\${tipologia}-\${fLargura}x\${fAltura}-\${qtdFolhaKitStr}-\${acabamento}-\${caracteristica}-\${isDuplo}\`;

      const val = agrupar.get(key) || { 
          tipologia,
          largura: parseInt(fLargura, 10), 
          altura: parseInt(fAltura, 10), 
          qtdFolhaKit: qtdFolhaKitStr,
          acabamento, 
          caracteristica,
          qtdTotal: 0 
      };
      
      const qtde = isDuplo ? fQtd * 2 : fQtd;
      val.qtdTotal += qtde;
      agrupar.set(key, val);
   });
   
   return Array.from(agrupar.values()).sort((a, b) => {
       if (a.tipologia !== b.tipologia) return a.tipologia.localeCompare(b.tipologia);
       if (b.altura !== a.altura) return b.altura - a.altura;
       return b.largura - a.largura;
   });
}

function renderAutoPortas(kits: any[]) {
  const data = processPortas(kits);
  return (
    <div className="border border-gray-300 dark:border-gray-600 print:border-black rounded overflow-hidden shadow-sm break-inside-avoid">
      <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-600 print:divide-black text-sm">
        <thead className="bg-[#0f172a] text-white print:bg-gray-100 print:text-black">
          <tr>
            <th className="px-3 py-2 text-left font-semibold uppercase whitespace-nowrap">Tipologia</th>
            <th className="px-3 py-2 text-center font-semibold uppercase whitespace-nowrap">Folha Larg</th>
            <th className="px-3 py-2 text-center font-semibold uppercase whitespace-nowrap">Folha Alt</th>
            <th className="px-3 py-2 text-center font-semibold uppercase whitespace-nowrap">Qtd Folha/Kit</th>
            <th className="px-3 py-2 text-left font-semibold uppercase whitespace-nowrap">Acabamento da Porta</th>
            <th className="px-3 py-2 text-left font-semibold uppercase whitespace-nowrap">Caracteristica da Porta</th>
            <th className="px-3 py-2 text-center font-semibold uppercase whitespace-nowrap">Qtd Total</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 print:bg-white divide-y divide-gray-200 dark:divide-gray-700 print:divide-black">
          {data.map((row, idx) => (
            <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700 print:hover:bg-transparent">
              <td className="px-3 py-2 font-medium">{row.tipologia}</td>
              <td className="px-3 py-2 text-center">{row.largura}</td>
              <td className="px-3 py-2 text-center">{row.altura}</td>
              <td className="px-3 py-2 text-center">{row.qtdFolhaKit}</td>
              <td className="px-3 py-2">{row.acabamento}</td>
              <td className="px-3 py-2">{row.caracteristica}</td>
              <td className="px-3 py-2 text-center font-bold bg-gray-50 dark:bg-gray-900 print:bg-transparent">{row.qtdTotal}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

`;

code = code.replace(regex, newProcessAndRender);
fs.writeFileSync(file, code);
