const fs = require('fs');
let code = fs.readFileSync('src/components/ControleOperacaoModule.tsx', 'utf8');

// Revert localSearch back to globalSearch in ControleSaidas
code = code.replace(
  `function ControleSaidas({ initialMonth }: { initialMonth?: number }) {
  const [localSearch, setLocalSearch] = useState('');`,
  `function ControleSaidas({ initialMonth, globalSearch = '' }: { initialMonth?: number, globalSearch?: string }) {`
);

code = code.replace(
  `if (localSearch && descField) {
      const searchLower = localSearch.trim().toLowerCase();`,
  `if (globalSearch && descField) {
      const searchLower = globalSearch.trim().toLowerCase();`
);

code = code.replace(
  `const isMatched = localSearch && val && val.toString().trim().toLowerCase() === localSearch.trim().toLowerCase();`,
  `const isMatched = globalSearch && val && val.toString().trim().toLowerCase() === globalSearch.trim().toLowerCase();`
);

// Remove the local search input from ControleSaidas UI
const localSearchUI = `<input
               type="text"
               placeholder="Pesquisa exata..."
               value={localSearch}
               onChange={(e) => setLocalSearch(e.target.value)}
               className="p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-green/20 outline-none print:hidden w-48"
             />`;
code = code.replace(localSearchUI, '');

// Restore globalSearch prop to the sub-components
code = code.replace(
  `{activeTab === 'saidas' && <ControleSaidas initialMonth={initialMonth} />}`,
  `{activeTab === 'saidas' && <ControleSaidas initialMonth={initialMonth} globalSearch={globalSearch} />}`
);
code = code.replace(
  `{activeTab === 'operacao' && <OperacaoProducao initialMonth={initialMonth} />}`,
  `{activeTab === 'operacao' && <OperacaoProducao initialMonth={initialMonth} globalSearch={globalSearch} />}`
);
code = code.replace(
  `{(activeTab === 'entradas' || activeTab === 'saidas_obras') && <EntradaSaidaObras />}`,
  `{(activeTab === 'entradas' || activeTab === 'saidas_obras') && <EntradaSaidaObras globalSearch={globalSearch} />}`
);
code = code.replace(
  `function OperacaoProducao({ initialMonth }: { initialMonth?: number }) {`,
  `function OperacaoProducao({ initialMonth, globalSearch = '' }: { initialMonth?: number, globalSearch?: string }) {`
);

fs.writeFileSync('src/components/ControleOperacaoModule.tsx', code);

// Now for EntradaSaidaObras.tsx
let codeE = fs.readFileSync('src/components/EntradaSaidaObras.tsx', 'utf8');

codeE = codeE.replace(
  `export function EntradaSaidaObras() {
  const [localSearch, setLocalSearch] = React.useState('');`,
  `export function EntradaSaidaObras({ globalSearch = '' }: { globalSearch?: string }) {`
);

codeE = codeE.replace(
  `if (!localSearch) return true;
       const searchLower = localSearch.trim().toLowerCase();`,
  `if (!globalSearch) return true;
       const searchLower = globalSearch.trim().toLowerCase();`
);

const localSearchUIE = `<div className="flex flex-col gap-1 w-48 shrink-0">
              <label className="text-[11px] font-bold text-gray-500 uppercase">Busca Exata:</label>
              <input
                type="text"
                placeholder="Pesquisar..."
                value={localSearch}
                onChange={e => setLocalSearch(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-brand-green outline-none transition-shadow"
              />
            </div>`;
codeE = codeE.replace(localSearchUIE, '');

fs.writeFileSync('src/components/EntradaSaidaObras.tsx', codeE);
