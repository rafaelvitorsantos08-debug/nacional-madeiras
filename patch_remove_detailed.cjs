const fs = require('fs');
const file = 'src/components/AutoReports.tsx';
let code = fs.readFileSync(file, 'utf8');

const regexTable = /const COLUMN_HEADERS: Record.*?function renderDetailedTable.*?return <div className="mt-4">\{content\}\{renderDetailedTable\(kits, reportType\)\}<\/div>;/s;
code = code.replace(
  /\{renderDetailedTable\(kits, reportType\)\}/g,
  ''
);

const regexToRemoveDetailedCode = /const COLUMN_HEADERS: Record.*?\}\s*\nfunction processAduelas/s;
code = code.replace(regexToRemoveDetailedCode, 'function processAduelas');

fs.writeFileSync(file, code);
