const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Replace the entire calculateStats function to be safe.
const oldCalculateStatsStart = `    const calculateStats = () => {`;
const oldCalculateStatsEnd = `        const mesesAbbr = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];`;

const startIndex = code.indexOf(oldCalculateStatsStart);
const endIndex = code.indexOf(oldCalculateStatsEnd);

if (startIndex !== -1 && endIndex !== -1) {
  const newCalculateStats = `    const calculateStats = () => {
      try {
        const getLs = (key: string, init: any) => {
          const item = window.localStorage.getItem(key);
          return item ? JSON.parse(item) : init;
        };

        const portasLs = getLs('nm_portas', INITIAL_PORTAS);
        const aduelasLs = getLs('nm_aduelas', INITIAL_ADUELAS);
        const alizaresLs = getLs('nm_alizares', INITIAL_ALIZARES);

        let totalEst = 0;
        let alertas = 0;
        
        [...(Array.isArray(portasLs) ? portasLs : []), ...(Array.isArray(aduelasLs) ? aduelasLs : []), ...(Array.isArray(alizaresLs) ? alizaresLs : [])].forEach((item: any) => {
           const qty = typeof item.estoque === 'number' ? item.estoque : parseInt(item.estoque) || 0;
           totalEst += qty;
           if (item.status === 'Crítico') alertas++;
        });

        const searchLower = globalSearch.trim().toLowerCase();

        const saidas = getLs('nm_controle_saidas', {});
        let countSaidas = 0;
        const currentMonthIndex = new Date().getMonth();
        const currentYearStats = new Date().getFullYear();

        Object.keys(saidas || {}).forEach(dateStr => {
          const parts = dateStr.split('-');
          if (parts.length === 3) {
            const m = parseInt(parts[1]) - 1;
            const y = parseInt(parts[0]);
            const row = saidas[dateStr];
            
            if (searchLower) {
              const matchE1 = row.e1_desc && row.e1_desc.toString().trim().toLowerCase().includes(searchLower);
              const matchE2 = row.e2_desc && row.e2_desc.toString().trim().toLowerCase().includes(searchLower);
              if (matchE1) countSaidas += (parseInt(row.e1_kits) || 0);
              if (matchE2) countSaidas += (parseInt(row.e2_kits) || 0);
            } else {
              if (m === currentMonthIndex && y === currentYearStats) {
                countSaidas += (parseInt(row.e1_kits) || 0) + (parseInt(row.e2_kits) || 0);
              }
            }
          }
        });

        const operacao = getLs('nm_operacao_producao', {});
        let countOp = 0;
        Object.keys(operacao || {}).forEach(dateStr => {
          const parts = dateStr.split('-');
          if (parts.length === 3) {
            const m = parseInt(parts[1]) - 1;
            const y = parseInt(parts[0]);
            if (m === currentMonthIndex && y === currentYearStats) {
              const row = operacao[dateStr];
              // Operation does not have specific descriptions to search by standard, but we'll sum if not searching, or keep as is.
              // Wait, operation doesn't have descriptions in the grid. We will just show current month or 0 if searching.
              if (!searchLower) {
                countOp += (parseInt(row.quantidade) || 0);
              }
            }
          }
        });

        // Use V6 data structure for Obras if available, fallback to V4
        const obrasObj = getLs('nm_entrada_obras_v6', getLs('nm_entrada_obras_v4', {}));
        let countObras = 0;
        Object.values(obrasObj || {}).forEach((o: any) => {
          const nomeMatch = o.nome && o.nome.toString().trim().toLowerCase().includes(searchLower);
          
          if (searchLower && !nomeMatch) {
            // Also check items
            let itemMatch = false;
            ['itensFolhas', 'itensAduelas', 'itensAlizares', 'itens'].forEach(k => {
               (o[k] || []).forEach((i: any) => {
                  if ((i.dimensao && i.dimensao.toLowerCase().includes(searchLower)) ||
                      (i.cor && i.cor.toLowerCase().includes(searchLower)) ||
                      (i.descricao && i.descricao.toLowerCase().includes(searchLower))) {
                      itemMatch = true;
                  }
               });
            });
            if (!itemMatch) return; // Skip if no match
          }
          
          if (o.itensFolhas || o.itensAduelas || o.itensAlizares) {
             // V6 format
             ['itensFolhas', 'itensAduelas', 'itensAlizares'].forEach(k => {
               (o[k] || []).forEach((i: any) => {
                  let saidas = 0;
                  Object.values(i.saidas || {}).forEach(v => { saidas += parseInt(v as string) || 0; });
                  countObras += saidas;
               });
             });
          } else {
             // V4 fallback
             const itens = o?.itens || [];
             itens.forEach((i: any) => {
               countObras += (parseInt(i.folhas) || 0) + (parseInt(i.aduelas) || 0) + (parseInt(i.alizares) || 0);
             });
          }
        });

        setDashboardStats({
          totalEstoque: totalEst,
          alertaBaixoEstoque: alertas,
          totalControleSaidasKits: countSaidas,
          totalOperacaoKits: countOp,
          totalEntradaObras: countObras
        });

`;
  
  code = code.substring(0, startIndex) + newCalculateStats + code.substring(endIndex);
  fs.writeFileSync('src/App.tsx', code);
}
