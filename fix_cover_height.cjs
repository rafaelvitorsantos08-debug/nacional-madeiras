const fs = require('fs');
let code = fs.readFileSync('src/components/AutoReports.tsx', 'utf8');

code = code.replace(
  `min-h-[85vh] print:min-h-[90vh]`,
  `min-h-[70vh] print:min-h-[70vh]`
);

fs.writeFileSync('src/components/AutoReports.tsx', code);
