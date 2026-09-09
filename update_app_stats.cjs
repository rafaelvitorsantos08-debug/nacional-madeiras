const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldCalculateStats = `        const saidas = getLs('nm_controle_saidas', {});
        let countSaidas = 0;
        const currentMonthIndex = new Date().getMonth();
        const currentYearStats = new Date().getFullYear();
        Object.keys(saidas || {}).forEach(dateStr => {
          const parts = dateStr.split('-');
          if (parts.length === 3) {
            const m = parseInt(parts[1]) - 1;
            const y = parseInt(parts[0]);
            if (m === currentMonthIndex && y === currentYearStats) {
              const row = saidas[dateStr];
              countSaidas += (parseInt(row.e1_kits) || 0) + (parseInt(row.e2_kits) || 0);
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
              countOp += (parseInt(row.quantidade) || 0);
            }
          }
        });

        const obrasObj = getLs('nm_entrada_obras_v4', {});
        let countObras = 0;
        Object.values(obrasObj || {}).forEach((o: any) => {
          const itens = o?.itens || [];
          itens.forEach((i: any) => {
            countObras += (parseInt(i.folhas) || 0) + (parseInt(i.aduelas) || 0) + (parseInt(i.alizares) || 0);
          });
        });`;

const newCalculateStats = `        const saidas = getLs('nm_controle_saidas', {});
        let countSaidas = 0;
        const currentMonthIndex = new Date().getMonth();
        const currentYearStats = new Date().getFullYear();
        const searchLower = globalSearch.trim().toLowerCase();

        Object.keys(saidas || {}).forEach(dateStr => {
          const parts = dateStr.split('-');
          if (parts.length === 3) {
            const m = parseInt(parts[1]) - 1;
            const y = parseInt(parts[0]);
            const row = saidas[dateStr];
            
            if (searchLower) {
              const matchE1 = row.e1_desc && row.e1_desc.toString().trim().toLowerCase() === searchLower;
              const matchE2 = row.e2_desc && row.e2_desc.toString().trim().toLowerCase() === searchLower;
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
              countOp += (parseInt(row.quantidade) || 0);
            }
          }
        });

        const obrasObj = getLs('nm_entrada_obras_v6', {});
        let countObras = 0;
        Object.values(obrasObj || {}).forEach((o: any) => {
          const nomeMatch = o.nome && o.nome.toString().trim().toLowerCase() === searchLower;
          if (searchLower && !nomeMatch) return; // if searching, skip if obra doesn't match exactly
          
          ['itensFolhas', 'itensAduelas', 'itensAlizares'].forEach(k => {
             (o[k] || []).forEach((i: any) => {
                let entradas = 0;
                let saidas = 0;
                Object.values(i.entradas || {}).forEach(v => { entradas += parseInt(v as string) || 0; });
                Object.values(i.saidas || {}).forEach(v => { saidas += parseInt(v as string) || 0; });
                // Dashboard could show total balance or just total entradas or saidas. 
                // Let's sum something meaningful. The old logic summed folhas + aduelas + alizares strings, which is not V6 compliant.
                // In v6 we will sum all 'saidas' as countObras.
                countObras += saidas;
             });
          });
        });`;

code = code.replace(oldCalculateStats, newCalculateStats);
fs.writeFileSync('src/App.tsx', code);
