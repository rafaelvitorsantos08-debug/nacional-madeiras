const fs = require('fs');
const filePath = 'src/components/AutoReports.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

const oldBlock = `              {/* CLIENTE INFO (Simplified) */}
              <div className="flex flex-col gap-y-4 mb-10 print:mb-16 text-sm print:text-[16px] border-b-2 border-gray-300 print:border-black pb-6 max-w-lg">
                <div className="flex pb-1">
                  <span className="font-bold w-24 text-gray-700 print:text-black uppercase">CLIENTE:</span>
                  <span className="flex-1 text-gray-800 print:text-black uppercase"><EditableText>{cliente || '-'}</EditableText></span>
                </div>
                <div className="flex pb-1">
                  <span className="font-bold w-24 text-gray-700 print:text-black uppercase">OBRA:</span>
                  <span className="flex-1 text-gray-800 print:text-black uppercase"><EditableText>{obra || '-'}</EditableText></span>
                </div>
                <div className="font-bold text-gray-800 print:text-black mt-2 uppercase">
                  QUANTIDADE TOTAL: {totalBloco} KITS
                </div>
              </div>`;

const newBlock = `              {/* QUANTIDADE TOTAL HIGHLIGHT */}
              <div className="flex flex-col items-center mb-10 print:mb-16 border-b-2 border-gray-300 print:border-black pb-6">
                <div className="text-3xl print:text-4xl font-bold text-gray-800 print:text-black uppercase tracking-wider">
                  QUANTIDADE TOTAL: {totalBloco} KITS
                </div>
              </div>`;

if (content.includes('CLIENTE INFO (Simplified)')) {
  content = content.replace(oldBlock, newBlock);
  fs.writeFileSync(filePath, content);
  console.log("Patched successfully");
} else {
  console.log("Could not find the target block");
}
