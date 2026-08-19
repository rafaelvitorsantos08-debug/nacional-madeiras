const fs = require('fs');
const filePath = 'src/components/AutoReports.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

const targetToRemove = `              {/* HEADER NATIVO DO SISTEMA INCLUÍDO NA CAPA */}
              <div className="flex justify-between items-start mb-6 print:mb-8 border-b-2 border-gray-300 print:border-black pb-4">
                <div className="flex flex-col">
                  <h2 className="text-2xl font-black tracking-tighter leading-none text-[#166534] print:text-[#166534] uppercase">RELATÓRIO DE ENTREGA</h2>
                  <span className="text-sm font-semibold tracking-wide mt-1 text-[#475569] print:text-black">Documento Gerado Via Sistema - Nacional Madeiras</span>
                  <span className="text-sm font-semibold tracking-wide text-[#475569] print:text-black">Data: {simpleDate}</span>
                </div>
                <div className="text-right flex flex-col items-end">
                   <h2 className="text-xl font-bold tracking-tighter leading-none text-[#166534] print:text-[#166534] uppercase">NACIONAL MADEIRAS</h2>
                   <span className="text-sm font-semibold tracking-wide mt-1 text-[#475569] print:text-[#475569] uppercase">KIT PORTA</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="border border-gray-300 print:border-black p-2">
                  <div className="text-[10px] text-gray-500 uppercase font-bold">CLIENTE</div>
                  <div className="text-sm font-bold uppercase"><EditableText>{cliente || '-'}</EditableText></div>
                </div>
                <div className="border border-gray-300 print:border-black p-2">
                  <div className="text-[10px] text-gray-500 uppercase font-bold">OBRA</div>
                  <div className="text-sm font-bold uppercase"><EditableText>{obra || '-'}</EditableText></div>
                </div>
                <div className="border border-gray-300 print:border-black p-2">
                  <div className="text-[10px] text-gray-500 uppercase font-bold">RESPONSÁVEL</div>
                  <div className="text-sm font-bold"><EditableText>Não informado</EditableText></div>
                </div>
              </div>`;

if (content.includes('HEADER NATIVO DO SISTEMA INCLUÍDO NA CAPA')) {
  content = content.replace(targetToRemove, '');
  fs.writeFileSync(filePath, content);
  console.log("Header removed successfully.");
} else {
  console.log("Header target not found.");
}
