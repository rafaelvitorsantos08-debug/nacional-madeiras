const fs = require('fs');
let code = fs.readFileSync('src/components/ControleOperacaoModule.tsx', 'utf8');

const oldSumColSearch = `    if (globalSearch && descField) {
      const searchLower = globalSearch.trim().toLowerCase();
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

const newSumColSearch = `    if (globalSearch && descField) {
      const searchLower = globalSearch.trim().toLowerCase();
      // When searching globally, sum everything up to the selected month's end date
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

code = code.replace(oldSumColSearch, newSumColSearch);

const oldIsMatched = `const isMatched = globalSearch && val && val.toString().trim().toLowerCase() === globalSearch.trim().toLowerCase();`;
const newIsMatched = `const isMatched = globalSearch && val && val.toString().toLowerCase().includes(globalSearch.trim().toLowerCase());`;
code = code.replace(oldIsMatched, newIsMatched);

fs.writeFileSync('src/components/ControleOperacaoModule.tsx', code);
