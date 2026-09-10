const fs = require('fs');
let code = fs.readFileSync('src/components/AutoReports.tsx', 'utf8');

const oldHeader = `    <div className="mt-4">
      <style type="text/css">
        {\`
          @media print {`;
const newHeader = `    <div className="mt-4 relative">
      <div className="hidden print:block fixed bottom-0 right-0 text-sm font-bold text-gray-700 pb-2 pr-4">
        Página <span className="page-number"></span> de <span className="page-total"></span>
      </div>
      <style type="text/css">
        {\`
          @media print {`;

code = code.replace(oldHeader, newHeader);
fs.writeFileSync('src/components/AutoReports.tsx', code);
