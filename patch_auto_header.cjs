const fs = require('fs');
const filePath = 'src/components/AutoReports.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

const target = `  return <div className="mt-4">{content}</div>;
}`;

const replacement = `  const needsHeader = !['auto_portas', 'auto_montagem', 'auto_entrega'].includes(reportType);

  return (
    <div className="mt-4">
      {needsHeader && (
        <div className="hidden print:flex justify-between items-start border-b-2 border-black pb-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold uppercase tracking-tight">
              Relatório de {reportType.replace("auto_", "").replace(/_/g, " ")}
            </h1>
            <p className="text-sm print:text-[16px] mt-1">
              Documento Gerado Via Sistema - Nacional Madeiras
            </p>
            <p className="text-sm print:text-[16px] mt-1 font-bold">
              Data: {new Date().toLocaleDateString('pt-BR')}
            </p>
          </div>
          <div className="flex flex-col items-end text-right" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
            <h2 className="text-2xl font-black tracking-tighter leading-none text-[#166534] print:text-[#166534] uppercase">Nacional Madeiras</h2>
            <span className="text-xl font-bold uppercase tracking-widest mt-1 text-[#475569] print:text-[#475569]">Kit Porta</span>
          </div>
        </div>
      )}
      {content}
    </div>
  );
}`;
content = content.replace(target, replacement);
fs.writeFileSync(filePath, content);
console.log("Patched AutoReports");
