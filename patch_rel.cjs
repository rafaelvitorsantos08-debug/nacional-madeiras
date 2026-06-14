const fs = require('fs');
const file = 'src/components/RelatoriosModule.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/type ReportType = "portas"(.*?);/, 'type ReportType = "avarias" | "auto_aduelas" | "auto_usinagem_aduelas" | "auto_portas" | "auto_usinagem_portas" | "auto_vergas" | "auto_alizares";');
code = code.replace(/useLocalStorage<ReportType>\("nm_active_relatorio_tipo", "portas"\)/, 'useLocalStorage<ReportType>("nm_active_relatorio_tipo", "auto_portas")');

fs.writeFileSync(file, code);
