const fs = require('fs');
let code = fs.readFileSync('src/components/AutoReports.tsx', 'utf8');

// 1. Change 2026 to dynamic year
code = code.replace(
  `<span>DE</span>
                  <div className="border-b-[2px] border-black w-64 mx-4"></div>
                  <span>2026</span>`,
  `<span>DE</span>
                  <div className="border-b-[2px] border-black w-64 mx-4"></div>
                  <span>{new Date().getFullYear()}</span>`
);

// 2. Change h-[60vh] to min-h-[90vh] so mt-auto pushes the signature to the bottom
code = code.replace(
  `{/* COVER PAGE */}
            <div className="flex flex-col h-[60vh] print:h-[60vh] pt-4" style={{ pageBreakAfter: 'always', pageBreakInside: 'avoid' }}>`,
  `{/* COVER PAGE */}
            <div className="flex flex-col min-h-[85vh] print:min-h-[90vh] pt-4" style={{ pageBreakAfter: 'always', pageBreakInside: 'avoid' }}>`
);

// 3. Add pagination CSS
const oldStyle = `          @media print {
            .font-bold, .font-black, h1, h2, h3, h4, th, strong, b {
              font-weight: 700 !important;
              -webkit-text-stroke: 0.5px currentColor !important;
            }`;
const newStyle = `          @media print {
            @page {
              margin-bottom: 1.5cm;
            }
            .page-number::after {
              content: counter(page);
            }
            .page-total::after {
              content: counter(pages);
            }
            .font-bold, .font-black, h1, h2, h3, h4, th, strong, b {
              font-weight: 700 !important;
              -webkit-text-stroke: 0.5px currentColor !important;
            }`;

code = code.replace(oldStyle, newStyle);

fs.writeFileSync('src/components/AutoReports.tsx', code);
