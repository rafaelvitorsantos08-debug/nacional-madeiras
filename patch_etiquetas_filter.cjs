const fs = require('fs');
let code = fs.readFileSync('src/components/EtiquetasModule.tsx', 'utf8');

const filterState = `
  const [selectedRelatorio, setSelectedRelatorio] = useState<string>('');

  const relatorios = useMemo(() => {
    const byTipologiaFech = new Map<string, any[]>();
    const safeKits = Array.isArray(kits) ? kits : [];
    safeKits.forEach(k => {
      const tipo = k.tipologia || 'SEM TIPOLOGIA';
      const fech = [k.fechaduraTipo, k.fechaduraMarca, k.fechaduraGrid && \`GRID \${k.fechaduraGrid}\`].filter(Boolean).join(' / ') || 'SEM FECHADURA';
      const key = \`\${tipo}|||\${fech}\`;
      if (!byTipologiaFech.has(key)) byTipologiaFech.set(key, []);
      byTipologiaFech.get(key).push(k);
    });
    return Array.from(byTipologiaFech.keys()).sort((a, b) => {
      const [tipoA] = a.split('|||');
      const [tipoB] = b.split('|||');
      return tipoA.localeCompare(tipoB);
    });
  }, [kits]);

  const filteredKits = useMemo(() => {
    const safeKits = Array.isArray(kits) ? kits : [];
    let result = safeKits;

    if (selectedRelatorio) {
      result = result.filter(k => {
        const tipo = k.tipologia || 'SEM TIPOLOGIA';
        const fech = [k.fechaduraTipo, k.fechaduraMarca, k.fechaduraGrid && \`GRID \${k.fechaduraGrid}\`].filter(Boolean).join(' / ') || 'SEM FECHADURA';
        const key = \`\${tipo}|||\${fech}\`;
        return key === selectedRelatorio;
      });
    }

    if (!globalSearch.trim()) return result;
    const lbd = globalSearch.toLowerCase();
    return result.filter((k: any) => 
      k.bloco?.toLowerCase().includes(lbd) ||
      k.apto?.toLowerCase().includes(lbd) ||
      k.comodo?.toLowerCase().includes(lbd) ||
      k.tipologia?.toLowerCase().includes(lbd) ||
      k.caracteristicaPorta?.toLowerCase().includes(lbd)
    );
  }, [kits, globalSearch, selectedRelatorio]);
`;

code = code.replace(/const filteredKits = useMemo\(\(\) => \{[\s\S]*?\}, \[kits, globalSearch\]\);/, filterState);


const uiFilter = `</div>
          </div>
          <div className="px-4 py-3 bg-white border-b border-gray-200">
             <label className="text-[11px] font-bold text-gray-500 uppercase mb-1 block">Filtrar por Relatório (Tipologia + Fechadura)</label>
             <select 
               value={selectedRelatorio} 
               onChange={e => setSelectedRelatorio(e.target.value)}
               className="w-full border border-gray-300 rounded p-1.5 text-sm outline-none focus:border-brand-green bg-white text-gray-800"
             >
               <option value="">Todos os Kits</option>
               {relatorios.map(key => {
                 const [tipo, fech] = key.split('|||');
                 return (
                   <option key={key} value={key}>
                     {tipo} {fech && fech !== 'SEM FECHADURA' ? \`(\${fech})\` : ''}
                   </option>
                 )
               })}
             </select>
          </div>
          <div className="flex-1 overflow-y-auto p-2">`;

code = code.replace(/<\/div>\s*<\/div>\s*<div className="flex-1 overflow-y-auto p-2">/, uiFilter);

fs.writeFileSync('src/components/EtiquetasModule.tsx', code);
