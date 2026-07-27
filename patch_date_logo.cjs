const fs = require('fs');
let code = fs.readFileSync('src/components/RelatoriosModule.tsx', 'utf8');

// 1. Add useEffect for date
const regexState = /const fileInputRef = useRef<HTMLInputElement>\(null\);/;
const replacementState = `const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (reportType === "avarias") {
      const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().split("T")[0];
      if (header.data !== today) {
        setHeader((prev) => ({ ...prev, data: today }));
      }
    }
  }, [reportType, header.data]);`;

code = code.replace(regexState, replacementState);

// 2. Add Logo to Print Header
const regexHeader = /<div className="flex justify-between items-start border-b-2 border-black pb-4 mb-6">\n\s*<div>\n\s*<h1 className="text-3xl font-bold uppercase tracking-tight">\n\s*Relatório de \{reportType\.replace\("auto_", ""\)\.replace\(\/_\/g, " "\)\}\n\s*<\/h1>\n\s*<p className="text-sm mt-1">\n\s*Documento Gerado Via Sistema - Nacional Madeiras\n\s*<\/p>\n\s*<\/div>\n\s*<\/div>/;

const replacementHeader = `<div className="flex justify-between items-start border-b-2 border-black pb-4 mb-6">
                <div>
                  <h1 className="text-3xl font-bold uppercase tracking-tight">
                    Relatório de {reportType.replace("auto_", "").replace(/_/g, " ")}
                  </h1>
                  <p className="text-sm mt-1">
                    Documento Gerado Via Sistema - Nacional Madeiras
                  </p>
                </div>
                {reportType === "avarias" && (
                  <div>
                    <img src="/logo.svg" alt="Nacional Madeiras Logo" className="h-16 object-contain" />
                  </div>
                )}
              </div>`;

code = code.replace(regexHeader, replacementHeader);

fs.writeFileSync('src/components/RelatoriosModule.tsx', code);
