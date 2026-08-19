const fs = require('fs');
const filePath = 'src/components/EntradaSaidaObras.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

const target = `{obrasList.map(o => <option key={o.id} value={o.id}>{o.nome || 'Sem Nome'}</option>)}`;
const replacement = `{obrasList.map((o: any) => <option key={o.id} value={o.id}>{o.nome || 'Sem Nome'}</option>)}`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(filePath, content);
  console.log("Patched correctly");
} else {
  console.log("Not found");
}
