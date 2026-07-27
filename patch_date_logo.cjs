const fs = require('fs');
let code = fs.readFileSync('src/components/RelatoriosModule.tsx', 'utf8');

// 1. Fix useEffect dependencies so user can still edit it if they really want to, or at least avoid infinite loop if anything else changes
const regexState = /useEffect\(\(\) => \{\n\s*if \(reportType === "avarias"\) \{\n\s*const today = new Date\(Date\.now\(\) - new Date\(\)\.getTimezoneOffset\(\) \* 60000\)\.toISOString\(\)\.split\("T"\)\[0\];\n\s*if \(header\.data !== today\) \{\n\s*setHeader\(\(prev\) => \(\{ \.\.\.prev, data: today \}\)\);\n\s*\}\n\s*\}\n\s*\}, \[reportType, header\.data\]\);/;

const replacementState = `useEffect(() => {
    if (reportType === "avarias") {
      const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().split("T")[0];
      if (!header.data) {
         setHeader((prev) => ({ ...prev, data: today }));
      }
    }
  }, [reportType, header.data]);`;

code = code.replace(regexState, replacementState);

// 2. Fix the print header
const regexHeader = /<div className="flex justify-between items-start border-b-2 border-black pb-4 mb-6">\n\s*<div>\n\s*<h1 className="text-3xl font-bold uppercase tracking-tight">\n\s*Relatório de \{reportType\.replace\("auto_", ""\)\.replace\(\/_\/g, " "\)\}\n\s*<\/h1>\n\s*<p className="text-sm mt-1">\n\s*Documento Gerado Via Sistema - Nacional Madeiras\n\s*<\/p>\n\s*<\/div>\n\s*\{reportType === "avarias" && \(\n\s*<div>\n\s*<img src="\/logo\.svg" alt="Nacional Madeiras Logo" className="h-16 object-contain" \/>\n\s*<\/div>\n\s*\)\}\n\s*<\/div>/;

const replacementHeader = `<div className="flex justify-between items-start border-b-2 border-black pb-4 mb-6">
                <div>
                  <h1 className="text-3xl font-bold uppercase tracking-tight">
                    Relatório de {reportType.replace("auto_", "").replace(/_/g, " ")}
                  </h1>
                  <p className="text-sm mt-1">
                    Documento Gerado Via Sistema - Nacional Madeiras
                  </p>
                  <p className="text-sm mt-1 font-bold">
                    Data: {header.data ? header.data.split("-").reverse().join("/") : ""}
                  </p>
                </div>
                {reportType === "avarias" && (
                  <div className="flex flex-col items-end text-right">
                    <h2 className="text-2xl font-black text-gray-800 tracking-tighter leading-none">Nacional Madeiras</h2>
                    <span className="text-xl font-bold text-gray-500 uppercase tracking-widest mt-1">Kit Porta</span>
                  </div>
                )}
              </div>`;

code = code.replace(regexHeader, replacementHeader);

fs.writeFileSync('src/components/RelatoriosModule.tsx', code);
