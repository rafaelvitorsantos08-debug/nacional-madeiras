const fs = require('fs');
const file = 'src/components/ControleOperacaoModule.tsx';
let code = fs.readFileSync(file, 'utf8');

const newSumCol = `  const sumCol = (field: string) => {
    const isE1 = field.startsWith('e1_');
    const isE2 = field.startsWith('e2_');
    const descField = isE1 ? 'e1_desc' : (isE2 ? 'e2_desc' : null);

    if (globalSearch && descField) {
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
    }

    return rows.reduce((acc, row) => {
      if (row.isWeekend) return acc;
      const val = parseInt(monthlyData[row.dateStrKey]?.[field] || '0', 10);
      return acc + (isNaN(val) ? 0 : val);
    }, 0);
  };`;

code = code.replace(/const sumCol = \(field: string\) => {[\s\S]*?};\n/, newSumCol + '\n');
fs.writeFileSync(file, code);
