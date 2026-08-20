const fs = require('fs');
const filePath = 'src/components/RelatoriosModule.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// Find everything from "{/* Relatório Impresso (Apenas visível via CSS de Print) */}" to the end of the file.
const startIdx = content.indexOf('{/* Relatório Impresso');
if (startIdx !== -1) {
  content = content.substring(0, startIdx) + 
`{/* Relatório Impresso (Apenas visível via CSS de Print) */}
        {!isAutoReport(reportType) && (
          <div className="hidden print:block w-full text-black font-sans bg-white pt-2">
            {reportType !== "auto_montagem" && (
              <>
                <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-6">
                  <div>
                    <h1 className="text-3xl font-bold uppercase tracking-tight">
                      Relatório de {reportType.replace("auto_", "").replace(/_/g, " ")}
                    </h1>
                    <p className="text-sm print:text-[16px] mt-1">
                      Documento Gerado Via Sistema - Nacional Madeiras
                    </p>
                    <p className="text-sm print:text-[16px] mt-1 font-bold">
                      Data: {header.data ? header.data.split("-").reverse().join("/") : ""}
                    </p>
                  </div>
                  <div className="flex flex-col items-end text-right" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                    <h2 className="text-2xl font-black tracking-tighter leading-none text-[#166534] print:text-[#166534] uppercase">Nacional Madeiras</h2>
                    <span className="text-xl font-bold uppercase tracking-widest mt-1 text-[#475569] print:text-[#475569]">Kit Porta</span>
                  </div>
                </div>

                {!reportType.includes("usinagem") && (
                  <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="border border-gray-300 p-3">
                      <p className="text-xs print:text-[14px] uppercase text-gray-600 print:text-black font-bold mb-1">Cliente</p>
                      <p className="font-medium text-lg">{header.cliente || "Não informado"}</p>
                    </div>
                    <div className="border border-gray-300 p-3">
                      <p className="text-xs print:text-[14px] uppercase text-gray-600 print:text-black font-bold mb-1">Obra</p>
                      <p className="font-medium text-lg">{header.obra || "Não informado"}</p>
                    </div>
                    <div className="border border-gray-300 p-3">
                      <p className="text-xs print:text-[14px] uppercase text-gray-600 print:text-black font-bold mb-1">Responsável</p>
                      <p className="font-medium text-lg">{header.responsavel || "Não informado"}</p>
                    </div>
                    {header.observacoes && (
                      <div className="border border-gray-300 p-3 col-span-3">
                        <p className="text-xs print:text-[14px] uppercase text-gray-600 print:text-black font-bold mb-1">Observações Gerais</p>
                        <p className="font-medium whitespace-pre-wrap">{header.observacoes}</p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            <table className="w-full border-collapse border-[2px] border-black text-left mb-8 print:text-[16px]">
              <thead>
                <tr className="bg-gray-100 print:border-b-2 print:border-black">
                  <th className="border border-black print:border-[1.5px] print:border-black p-2 w-12 text-center">Item</th>
                  {reportType !== "avarias" && <th className="border border-black print:border-[1.5px] print:border-black p-2">Cor/Acabamento</th>}
                  <th className="border border-black print:border-[1.5px] print:border-black p-2">Detalhes / Especificações</th>
                  <th className="border border-black print:border-[1.5px] print:border-black p-2 w-24 text-center">Qtd</th>
                  <th className="border border-black print:border-[1.5px] print:border-black p-2 w-32 text-center">Conferência</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={item.id} className="border-b border-black print:border-b-[1.5px]">
                    <td className="border border-black print:border-[1.5px] print:border-black p-2 text-center">{idx + 1}</td>
                    {reportType !== "avarias" && (
                      <td contentEditable suppressContentEditableWarning className="outline-none focus:bg-emerald-50 focus:ring-1 focus:ring-emerald-500 transition-colors border border-black print:border-[1.5px] print:border-black p-2 font-medium">{item.cor}</td>
                    )}
                    <td contentEditable suppressContentEditableWarning className="outline-none focus:bg-emerald-50 focus:ring-1 focus:ring-emerald-500 transition-colors border border-black print:border-[1.5px] print:border-black p-2">
                      {reportType === "portas" && <>{item.dimensao} - Enc: {item.enchimento} - Mod: {item.modelo}</>}
                      {reportType === "avarias" && (
                        <div className="flex flex-col items-start gap-1 py-1 max-w-[280px]">
                          <span className="italic text-base whitespace-normal break-words w-full border-l-[3px] border-gray-400 pl-2 text-gray-800">"{item.descricao}"</span>
                          {item.imagemBase64 && (
                            <img src={item.imagemBase64} alt="Avaria" className="max-h-[250px] w-auto border border-black print:border-[1.5px] print:border-black mt-2" />
                          )}
                        </div>
                      )}
                    </td>
                    <td contentEditable suppressContentEditableWarning className="outline-none focus:bg-emerald-50 focus:ring-1 focus:ring-emerald-500 transition-colors border border-black print:border-[1.5px] print:border-black p-2 text-center font-bold text-lg">{item.quantidade || 1}</td>
                    <td className="border border-black print:border-[1.5px] print:border-black p-2"></td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={reportType === "avarias" ? 4 : 5} className="border border-black print:border-[1.5px] print:border-black p-4 text-center italic text-gray-500">
                      Nenhum item inserido no relatório.
                    </td>
                  </tr>
                )}
              </tbody>
              {items.length > 0 && reportType !== "avarias" && (
                <tfoot>
                  <tr className="bg-gray-100 font-bold">
                    <td colSpan={3} className="border border-black print:border-[1.5px] print:border-black p-2 text-right uppercase">Total Geral de Peças:</td>
                    <td className="border border-black print:border-[1.5px] print:border-black p-2 text-center text-xl">
                      {items.reduce((sum, item) => sum + (item.quantidade || 0), 0)}
                    </td>
                    <td className="border border-black print:border-[1.5px] print:border-black p-2"></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}
      </div>
    </div>
  );
}`;
  fs.writeFileSync(filePath, content);
}
