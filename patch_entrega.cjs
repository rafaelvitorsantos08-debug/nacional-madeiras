const fs = require('fs');
const filePath = 'src/components/AutoReports.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

const oldClienteInfo = `              {/* CLIENTE INFO */}
              <div className="grid grid-cols-2 gap-x-12 gap-y-4 mb-10 print:mb-16 text-sm print:text-[16px] border-b-2 border-gray-300 print:border-black pb-6">
                <div className="flex border-b border-gray-300 print:border-black pb-1">
                  <span className="font-bold w-24 text-gray-700 print:text-black uppercase">CLIENTE:</span>
                  <span className="flex-1 text-gray-800 print:text-black uppercase"><EditableText>{cliente || '-'}</EditableText></span>
                </div>
                <div className="flex border-b border-gray-300 print:border-black pb-1">
                  <span className="font-bold w-24 text-gray-700 print:text-black uppercase">CÓDIGO:</span>
                  <span className="flex-1 text-gray-800 print:text-black text-right"><EditableText>{'____/____'}</EditableText></span>
                </div>
                <div className="flex border-b border-gray-300 print:border-black pb-1">
                  <span className="font-bold w-24 text-gray-700 print:text-black uppercase">OBRA:</span>
                  <span className="flex-1 text-gray-800 print:text-black uppercase"><EditableText>{obra || '-'}</EditableText></span>
                </div>
                <div className="flex border-b border-gray-300 print:border-black pb-1">
                  <span className="font-bold w-24 text-gray-700 print:text-black uppercase">PREVISÃO:</span>
                  <span className="flex-1 text-gray-800 print:text-black text-right"><EditableText>{'__/__/____'}</EditableText></span>
                </div>
                <div className="col-span-2 text-xs print:text-[14px] text-gray-500 mt-2">
                  <EditableText>{simpleDate}</EditableText>
                </div>
              </div>

              {/* BLOCO HIGHLIGHT */}
              <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                 <h2 className="text-5xl print:text-6xl font-black uppercase text-gray-800 print:text-black border-4 border-gray-800 print:border-black p-8 shadow-lg print:shadow-none bg-white print:bg-transparent">
                   {blocoName}
                 </h2>
                 <p className="text-2xl print:text-3xl font-bold text-gray-700 print:text-black mt-8">
                   QUANTIDADE TOTAL: {totalBloco} KITS
                 </p>
              </div>`;

const newClienteInfo = `              {/* CLIENTE INFO */}
              <div className="grid grid-cols-2 gap-x-12 gap-y-4 mb-10 print:mb-16 text-sm print:text-[16px] border-b-2 border-gray-300 print:border-black pb-6">
                <div className="flex pb-1">
                  <span className="font-bold w-24 text-gray-700 print:text-black uppercase">CLIENTE:</span>
                  <span className="flex-1 text-gray-800 print:text-black uppercase"><EditableText>{cliente || '-'}</EditableText></span>
                </div>
                <div className="flex pb-1">
                  <span className="font-bold w-24 text-gray-700 print:text-black uppercase">CÓDIGO:</span>
                  <span className="flex-1 text-gray-800 print:text-black text-right"><EditableText>{'____/____'}</EditableText></span>
                </div>
                <div className="flex flex-col gap-1 pb-1">
                  <div className="flex">
                    <span className="font-bold w-24 text-gray-700 print:text-black uppercase">OBRA:</span>
                    <span className="flex-1 text-gray-800 print:text-black uppercase"><EditableText>{obra || '-'}</EditableText></span>
                  </div>
                  <div className="font-bold text-gray-800 print:text-black mt-2 uppercase">
                    QUANTIDADE TOTAL: {totalBloco} KITS
                  </div>
                  <div className="text-xs print:text-[14px] text-gray-500 mt-1">
                    <EditableText>{simpleDate}</EditableText>
                  </div>
                </div>
                <div className="flex pb-1">
                  <span className="font-bold w-24 text-gray-700 print:text-black uppercase">PREVISÃO:</span>
                  <span className="flex-1 text-gray-800 print:text-black text-right"><EditableText>{'__/__/____'}</EditableText></span>
                </div>
              </div>

              {/* BLOCO HIGHLIGHT */}
              <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                 <h2 className="text-5xl print:text-6xl font-black uppercase text-gray-800 print:text-black border-[3px] border-gray-600 print:border-black px-12 py-8 shadow-sm print:shadow-none bg-[#1e293b] print:bg-transparent text-white print:text-black min-w-[200px] text-center">
                   <EditableText>{blocoName}</EditableText>
                 </h2>
              </div>`;

if (content.includes('CLIENTE INFO')) {
  content = content.replace(oldClienteInfo, newClienteInfo);
  fs.writeFileSync(filePath, content);
  console.log("Patched successfully");
} else {
  console.log("Could not find the target block");
}
