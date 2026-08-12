const fs = require('fs');
let code = fs.readFileSync('src/components/AutoReports.tsx', 'utf8');

const oldHeader = /<EditableText>Relatório de Montagem - \{tipo\}<\/EditableText>/;
const newHeader = "<EditableText>Relatório de Montagem - {tipo} {fech && fech !== 'SEM FECHADURA' ? `(${fech})` : ''}</EditableText>";

code = code.replace(oldHeader, newHeader);

// We need to make sure `fech` is defined in the scope where `tipo` is.
// Right now we have: `const [tipo] = key.split('|||');`
const oldSplit = /const \[tipo\] = key\.split\('\|\|\|'\);/;
const newSplit = "const [tipo, fech] = key.split('|||');";

code = code.replace(oldSplit, newSplit);

fs.writeFileSync('src/components/AutoReports.tsx', code);
