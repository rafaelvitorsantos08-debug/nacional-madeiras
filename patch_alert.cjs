const fs = require('fs');
const file = 'src/components/RelatoriosModule.tsx';
let code = fs.readFileSync(file, 'utf8');

const alertHtml = `
      <div className="flex-1 overflow-y-auto p-4 md:p-6 print:p-0 print:bg-white print:overflow-visible">
        {/* ALERTA */}
        <div className="max-w-5xl mx-auto mb-6 bg-amber-50 border-l-4 border-amber-500 p-4 rounded shadow-sm print:hidden">
          <div className="text-amber-800 text-sm font-medium whitespace-pre-wrap">
            ⚠️ <strong>Atenção:</strong> kits com montantes e kits camarão com quantidade de folhas ímpares, adicionar a abertura manualmente.
          </div>
        </div>
`;

code = code.replace(
  '<div className="flex-1 overflow-y-auto p-4 md:p-6 print:p-0 print:bg-white print:overflow-visible">',
  alertHtml
);

fs.writeFileSync(file, code);
