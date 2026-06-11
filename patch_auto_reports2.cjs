const fs = require('fs');
const file = 'src/components/AutoReports.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/\{\s*Object\.entries\(groupedData\)\.map\(\(\[caracteristica, rows\]\)/, "{Object.entries(groupedData).map(([caracteristica, rows]: [string, any])");

fs.writeFileSync(file, code);
