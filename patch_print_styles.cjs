const fs = require('fs');
let code = fs.readFileSync('src/components/AutoReports.tsx', 'utf8');

code = code.replace(/@media print \{/g, 
`@media print {
            * {
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            table, th, td, tr {
              border-color: #000000 !important;
            }`);

fs.writeFileSync('src/components/AutoReports.tsx', code);

// Same for RelatoriosModule.tsx if it has a style tag, wait, the style tag in AutoReports will be active when AutoReportsViewer renders. But what about RelatoriosModule?
// RelatoriosModule has regular tables. The style in AutoReports might not apply if it's not rendered. Let's add it to index.css or main.css.
