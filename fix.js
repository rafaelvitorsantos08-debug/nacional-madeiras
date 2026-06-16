import fs from 'fs';
let text = fs.readFileSync('src/components/AutoReports.tsx', 'utf-8');
text = text.replace(/{item\.qtd}/g, '<EditableText>{item.qtd}</EditableText>');
text = text.replace(/{mode === 'portas' && item\.itemMeta}/g, "<EditableText>{mode === 'portas' && item.itemMeta ? String(item.itemMeta).replace(/INTERNA/gi, '') : ''}</EditableText>");
fs.writeFileSync('src/components/AutoReports.tsx', text);
