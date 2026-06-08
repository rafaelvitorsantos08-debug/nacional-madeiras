const fs = require('fs');
const file = 'src/components/LancamentosRelatoriosModule.tsx';
let code = fs.readFileSync(file, 'utf8');

const importStr = `import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Plus, Trash2, Copy, Save, FileSpreadsheet, Download, FileText } from 'lucide-react';
`;

code = code.replace(
  "import { Plus, Trash2, Copy, Save, FileSpreadsheet } from 'lucide-react';",
  importStr
);

const exportFunctions = `
  const exportToExcel = () => {
    if (kits.length === 0) return;
    const worksheet = XLSX.utils.json_to_sheet(kits.map(({ id, ...kit }) => kit));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Kits');
    XLSX.writeFile(workbook, 'kits_lancados.xlsx');
  };

  const exportToPDF = () => {
    if (kits.length === 0) return;
    const doc = new jsPDF('landscape');
    
    // Add title
    doc.setFontSize(16);
    doc.text('Relatorio de Kits Lancados', 14, 15);
    doc.setFontSize(10);
    doc.text('Gerado em: ' + new Date().toLocaleString(), 14, 22);

    const headers = [['Apto', 'Pav.', 'Col', 'Comodo', 'Folha L', 'Folha A', 'Tipo', 'Abertura', 'Aduela L', 'Aduela A', 'Acabamento', 'Qtd']];
    const data = kits.map(k => [
      k.apto, k.pavimento, k.coluna, k.comodo, 
      k.folhaLargura, k.folhaAltura, k.tipologia, k.abertura,
      k.aduelaLargura, k.aduelaAltura, k.acabamento, k.qtdeFolhasPorKit
    ]);

    autoTable(doc, {
      head: headers,
      body: data,
      startY: 28,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [16, 185, 129] } // emerald-500
    });

    doc.save('kits_lancados.pdf');
  };
`;

code = code.replace(
  "const handleMassImport = () => {",
  exportFunctions + "\n  const handleMassImport = () => {"
);

const buttonsStr = `           <div className="flex items-center space-x-2">
              <button 
                type="button"
                onClick={exportToPDF}
                className="flex items-center text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-800/50 px-3 py-1.5 rounded-lg transition-colors"
                title="Exportar como PDF"
              >
                <FileText className="w-4 h-4 mr-2" />
                PDF
              </button>
              <button 
                type="button"
                onClick={exportToExcel}
                className="flex items-center text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-800/50 px-3 py-1.5 rounded-lg transition-colors"
                title="Exportar como Excel (XLSX)"
              >
                <Download className="w-4 h-4 mr-2" />
                Excel / XLS
              </button>
              <div className="text-sm text-gray-500 ml-2">
                 {kits.length} registro(s)
              </div>
            </div>`;

code = code.replace(
  /<div className="text-sm text-gray-500">\s*\{kits\.length\} registro\(s\)\s*<\/div>/,
  buttonsStr
);

fs.writeFileSync(file, code);
