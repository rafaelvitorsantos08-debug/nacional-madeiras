const fs = require('fs');
let code = fs.readFileSync('src/components/ControleOperacaoModule.tsx', 'utf8');

// 1. Remove globalSearch from ControleSaidas props and add localSearch
code = code.replace(
  `function ControleSaidas({ initialMonth, globalSearch = '' }: { initialMonth?: number, globalSearch?: string }) {`,
  `function ControleSaidas({ initialMonth }: { initialMonth?: number }) {
  const [localSearch, setLocalSearch] = useState('');
  const [historicoDescricoes, setHistoricoDescricoes] = useState<string[]>([]);`
);

// 2. Populate historicoDescricoes
const populateLogic = `const [monthlyData, setMonthlyData] = useLocalStorage<Record<string, any>>('nm_controle_saidas', {});
  
  useEffect(() => {
    const descriptions = new Set<string>();
    Object.values(monthlyData).forEach((row: any) => {
      if (row.e1_desc) descriptions.add(row.e1_desc);
      if (row.e2_desc) descriptions.add(row.e2_desc);
    });
    setHistoricoDescricoes(Array.from(descriptions).sort());
  }, [monthlyData]);`;
code = code.replace(`const [monthlyData, setMonthlyData] = useLocalStorage<Record<string, any>>('nm_controle_saidas', {});`, populateLogic);

// 3. Update sumCol search logic to use exact match and localSearch
const oldSumColSearch = `if (globalSearch && descField) {
      const searchLower = globalSearch.toLowerCase();
      const maxDate = new Date(selecionadoAno, selecionadoMes + 1, 0);
      const maxDateStr = \`\${selecionadoAno}-\${String(selecionadoMes + 1).padStart(2, '0')}-\${String(maxDate.getDate()).padStart(2, '0')}\`;
      
      let total = 0;
      for (const [dateStr, rowData] of Object.entries(monthlyData)) {
        if (dateStr > maxDateStr) continue;
        
        const descVal = (rowData as any)?.[descField] || '';
        if (descVal.toString().toLowerCase().includes(searchLower)) {
          const val = parseInt((rowData as any)?.[field] || '0', 10);
          total += (isNaN(val) ? 0 : val);
        }
      }
      return total;
    }`;
const newSumColSearch = `if (localSearch && descField) {
      const searchLower = localSearch.trim().toLowerCase();
      const maxDate = new Date(selecionadoAno, selecionadoMes + 1, 0);
      const maxDateStr = \`\${selecionadoAno}-\${String(selecionadoMes + 1).padStart(2, '0')}-\${String(maxDate.getDate()).padStart(2, '0')}\`;
      
      let total = 0;
      for (const [dateStr, rowData] of Object.entries(monthlyData)) {
        if (dateStr > maxDateStr) continue;
        
        const descVal = (rowData as any)?.[descField] || '';
        if (descVal.toString().trim().toLowerCase() === searchLower) {
          const val = parseInt((rowData as any)?.[field] || '0', 10);
          total += (isNaN(val) ? 0 : val);
        }
      }
      return total;
    }`;
code = code.replace(oldSumColSearch, newSumColSearch);

// 4. Update isMatched in renderInput
code = code.replace(
  `const isMatched = globalSearch && val && val.toString().toLowerCase().includes(globalSearch.toLowerCase());`,
  `const isMatched = localSearch && val && val.toString().trim().toLowerCase() === localSearch.trim().toLowerCase();`
);

// 5. Add list attribute to input in renderInput
code = code.replace(
  `data-col={colIdx}`,
  `data-col={colIdx}\n        list={(field === 'e1_desc' || field === 'e2_desc') ? 'saidas_desc_list' : undefined}`
);

// 6. Add search bar to UI and datalist
const oldUIHeader = `<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
           <h2 className="font-semibold text-gray-800 flex items-center text-lg">
             <Truck className="w-5 h-5 mr-2 text-brand-green" /> Materiais Enviados (Saídas)
           </h2>
           <div className="flex items-center gap-2">`;
const newUIHeader = `<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
           <h2 className="font-semibold text-gray-800 flex items-center text-lg">
             <Truck className="w-5 h-5 mr-2 text-brand-green" /> Materiais Enviados (Saídas)
           </h2>
           <div className="flex items-center gap-2">
             <input
               type="text"
               placeholder="Pesquisa exata..."
               value={localSearch}
               onChange={(e) => setLocalSearch(e.target.value)}
               className="p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-green/20 outline-none print:hidden w-48"
             />`;
code = code.replace(oldUIHeader, newUIHeader);

const returnEnd = `</div>
      </div>
    </div>
  )`;
const returnEndNew = `</div>
      </div>
      <datalist id="saidas_desc_list">
        {historicoDescricoes.map(desc => <option key={desc} value={desc} />)}
      </datalist>
    </div>
  )`;
code = code.replace(returnEnd, returnEndNew);

fs.writeFileSync('src/components/ControleOperacaoModule.tsx', code);
