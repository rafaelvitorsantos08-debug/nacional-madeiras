const fs = require('fs');
let code = fs.readFileSync('src/components/EntradaSaidaObras.tsx', 'utf8');

// 1. Add localSearch to the component
code = code.replace(
  `export function EntradaSaidaObras({ globalSearch = '' }: { globalSearch?: string }) {`,
  `export function EntradaSaidaObras() {
  const [localSearch, setLocalSearch] = React.useState('');`
);

// 2. Change the filter logic to use localSearch and exact match
const oldFilter = `.filter((obra: any) => {
       if (!globalSearch) return true;
       const searchLower = globalSearch.toLowerCase();
       const inNome = (obra.nome || '').toLowerCase().includes(searchLower);
       const inItens = ['itensFolhas', 'itensAduelas', 'itensAlizares'].some(k => 
         (obra[k] || []).some((i: any) => 
           (i.dimensao || '').toLowerCase().includes(searchLower) ||
           (i.cor || '').toLowerCase().includes(searchLower) ||
           (i.medidaAduela || '').toLowerCase().includes(searchLower) ||
           (i.medidaAlizar || '').toLowerCase().includes(searchLower)
         )
       );
       return inNome || inItens;
    })`;
const newFilter = `.filter((obra: any) => {
       if (!localSearch) return true;
       const searchLower = localSearch.trim().toLowerCase();
       const inNome = (obra.nome || '').trim().toLowerCase() === searchLower;
       const inItens = ['itensFolhas', 'itensAduelas', 'itensAlizares'].some(k => 
         (obra[k] || []).some((i: any) => 
           (i.dimensao || '').trim().toLowerCase() === searchLower ||
           (i.cor || '').trim().toLowerCase() === searchLower ||
           (i.medidaAduela || '').trim().toLowerCase() === searchLower ||
           (i.medidaAlizar || '').trim().toLowerCase() === searchLower
         )
       );
       return inNome || inItens;
    })`;
code = code.replace(oldFilter, newFilter);

// 3. Add search input in the header
const oldUIHeader = `<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 w-full sm:w-auto">
            <div className="flex flex-col gap-1 flex-1 max-w-sm">`;
const newUIHeader = `<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 w-full sm:w-auto">
            <div className="flex flex-col gap-1 w-48 shrink-0">
              <label className="text-[11px] font-bold text-gray-500 uppercase">Busca Exata:</label>
              <input
                type="text"
                placeholder="Pesquisar..."
                value={localSearch}
                onChange={e => setLocalSearch(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-brand-green outline-none transition-shadow"
              />
            </div>
            <div className="flex flex-col gap-1 flex-1 max-w-sm">`;
code = code.replace(oldUIHeader, newUIHeader);

fs.writeFileSync('src/components/EntradaSaidaObras.tsx', code);
