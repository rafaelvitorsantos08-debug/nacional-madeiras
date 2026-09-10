const fs = require('fs');

function fixFile(file) {
  let code = fs.readFileSync(file, 'utf8');

  // Remove the fixed div if we are going to use margin boxes.
  // Actually, wait, let's keep the fixed div but use JavaScript to populate it? No, JS can't populate page numbers because page breaks are calculated by the browser during print rendering.
  // The ONLY way to get page numbers in Chrome without the user checking "Headers and footers" in the print dialog is currently impossible without generating a PDF client-side or doing manual pagination.
  // HOWEVER, many users of Chrome just check the "Headers and footers" box. 
  // But maybe we can use a JS polyfill? No.
  // Wait! In Chrome, if you put a `position: fixed; bottom: 0;` element, it prints on every page. But we can't increment the page number.
  // Let's use standard @page margin box. If they use Safari/Firefox or a PDF generator, it will work. In Chrome, they just have to check the box.
  
  // Actually, I can provide the @page margin box for page numbers.
  
  code = code.replace(
    /<div className="hidden print:block fixed bottom-0 right-0 text-sm font-bold text-gray-700 pb-2 pr-4">\s*Página <span className="page-number"><\/span> de <span className="page-total"><\/span>\s*<\/div>/,
    ''
  );

  code = code.replace(
    /\.page-number::after \{[\s\S]*?\}\s*\.page-total::after \{[\s\S]*?\}/,
    `@bottom-right {
              content: "Página " counter(page) " de " counter(pages);
              font-family: Arial, sans-serif;
              font-size: 10pt;
              color: #374151;
            }`
  );

  fs.writeFileSync(file, code);
}

fixFile('src/components/AutoReports.tsx');
fixFile('src/components/RelatoriosModule.tsx');
