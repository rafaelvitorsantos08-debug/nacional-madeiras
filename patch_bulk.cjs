const fs = require('fs');
const file = 'src/components/LancamentosRelatoriosModule.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Add state variables
code = code.replace(
  "const [form, setForm] = useState<Omit<KitLancamento, 'id'>>(INITIAL_FORM);",
  `const [form, setForm] = useState<Omit<KitLancamento, 'id'>>(INITIAL_FORM);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkText, setBulkText] = useState('');`
);

// 2. Add handleMassImport function
const handleMassImportStr = `
  const handleMassImport = () => {
    if (!bulkText.trim()) return;
    
    // Parse TSV
    const lines = bulkText.split('\\n');
    const newKits: KitLancamento[] = [];
    
    for (const line of lines) {
      const parts = line.split('\\t');
      if (parts.length < 4) continue; // Skip empty or invalid lines
      
      const [apto, pav, col, comodo, fLarg, fAlt, tipo, aberto, aLarg, aAlt, reg] = parts.map(p => p?.trim() || '');
      
      newKits.push({
        ...INITIAL_FORM,
        id: Math.random().toString(36).substr(2, 9),
        apto: apto || '',
        pavimento: pav || '',
        coluna: col || '',
        comodo: comodo || '',
        folhaLargura: fLarg || '',
        folhaAltura: fAlt || INITIAL_FORM.folhaAltura,
        tipologia: tipo || '',
        abertura: aberto || INITIAL_FORM.abertura,
        aduelaLargura: aLarg || '',
        aduelaAltura: aAlt || INITIAL_FORM.aduelaAltura,
        regulagem: reg || INITIAL_FORM.regulagem,
      });
    }
    
    if (newKits.length > 0) {
      setKits(prev => [...newKits, ...prev]);
      setShowBulkModal(false);
      setBulkText('');
    }
  };
`;

code = code.replace(
  "const handleInputChange =",
  handleMassImportStr + "\n  const handleInputChange ="
);

// 3. Add button next to "Novo Cadastro de Kit"
code = code.replace(
  /<div className="border-b border-gray-100 bg-gray-50 dark:bg-gray-900\/80 p-4">\s*<h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center">\s*<Plus className="w-5 h-5 mr-2 text-brand-green" \/>\s*Novo Cadastro de Kit\s*<\/h2>\s*<\/div>/,
  `<div className="border-b border-gray-100 bg-gray-50 dark:bg-gray-900/80 p-4">
    <div className="flex justify-between items-center w-full">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center">
              <Plus className="w-5 h-5 mr-2 text-brand-green" />
              Novo Cadastro de Kit
            </h2>
            <button 
              type="button" 
              onClick={() => setShowBulkModal(true)} 
              className="flex items-center text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-800/50 px-3 py-1.5 rounded-lg transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Lançamento em Massa
            </button>
          </div>
  </div>`
);

// 4. Add modal
const modalStr = `
      {/* BULK MODAL */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-4xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                <FileSpreadsheet className="w-5 h-5 mr-2 text-emerald-600" />
                Lançamento em Massa
              </h2>
              <button onClick={() => setShowBulkModal(false)} className="text-gray-500 hover:text-red-500 font-bold px-2 py-1">X</button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Copie os dados da planilha e cole na caixa abaixo. A ordem esperada das colunas é:
                <br />
                <span className="font-mono text-xs bg-gray-100 dark:bg-gray-900 p-1 rounded mt-2 inline-block">APTO | PAV. | COLUNA | CÔMODO | FOLHA LARGURA | FOLHA ALTURA | TIPOLOGIA | ABERTURA | ADUELA LARGURA | ADUELA ALTURA | REGULAGEM</span>
              </p>
              <textarea
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder="Cole os dados aqui (separados por tabulação/copiados do Excel)..."
                className="w-full h-96 p-3 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-900 text-sm font-mono whitespace-pre dark:text-gray-200 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="border-t border-gray-100 dark:border-gray-700 p-4 flex justify-end space-x-3 bg-gray-50 dark:bg-gray-900 rounded-b-xl">
              <button 
                onClick={() => setShowBulkModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-white dark:hover:bg-gray-800"
              >
                Cancelar
              </button>
              <button 
                onClick={handleMassImport}
                className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 font-medium"
              >
                Importar Dados
              </button>
            </div>
          </div>
        </div>
      )}
`;

code = code.replace(
  /<\/form>\s*<\/div>\s*<div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-6 flex flex-col md:flex-row items-center justify-between p-4 gap-4">/,
  `</form>\n      </div>\n` + modalStr + `\n      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-6 flex flex-col md:flex-row items-center justify-between p-4 gap-4">`
);

fs.writeFileSync(file, code);
