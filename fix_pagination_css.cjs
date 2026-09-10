const fs = require('fs');

function fixCSS(file) {
  let code = fs.readFileSync(file, 'utf8');
  
  // Find @media print { @page { margin-bottom: 1.5cm; } @bottom-right { ... }
  // and change to @media print { @page { margin-bottom: 1.5cm; @bottom-right { ... } }
  
  code = code.replace(
    /@page \{\s*margin-bottom: 1\.5cm;\s*\}\s*@bottom-right \{([\s\S]*?)\}/,
    `@page {
              margin-bottom: 1.5cm;
              @bottom-right {
                $1
              }
            }`
  );
  
  fs.writeFileSync(file, code);
}

fixCSS('src/components/AutoReports.tsx');
fixCSS('src/components/RelatoriosModule.tsx');
