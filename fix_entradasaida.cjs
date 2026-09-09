const fs = require('fs');
let code = fs.readFileSync('src/components/EntradaSaidaObras.tsx', 'utf8');

const oldFilter = `       const inNome = (obra.nome || '').trim().toLowerCase() === searchLower;
       const inItens = ['itensFolhas', 'itensAduelas', 'itensAlizares'].some(k => 
         (obra[k] || []).some((i: any) => 
           (i.dimensao || '').trim().toLowerCase() === searchLower ||
           (i.cor || '').trim().toLowerCase() === searchLower ||
           (i.medidaAduela || '').trim().toLowerCase() === searchLower ||
           (i.medidaAlizar || '').trim().toLowerCase() === searchLower
         )
       );`;

const newFilter = `       const inNome = (obra.nome || '').toLowerCase().includes(searchLower);
       const inItens = ['itensFolhas', 'itensAduelas', 'itensAlizares'].some(k => 
         (obra[k] || []).some((i: any) => 
           (i.dimensao || '').toLowerCase().includes(searchLower) ||
           (i.cor || '').toLowerCase().includes(searchLower) ||
           (i.medidaAduela || '').toLowerCase().includes(searchLower) ||
           (i.medidaAlizar || '').toLowerCase().includes(searchLower) ||
           (i.descricao && i.descricao.toLowerCase().includes(searchLower))
         )
       );`;

code = code.replace(oldFilter, newFilter);
fs.writeFileSync('src/components/EntradaSaidaObras.tsx', code);
