const fs = require('fs');
const filePath = 'src/components/AutoReports.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

const oldBlock = `              {/* QUANTIDADE TOTAL HIGHLIGHT */}
              <div className="flex flex-col items-center mb-10 print:mb-16 border-b-2 border-gray-300 print:border-black pb-6">
                <div className="text-3xl print:text-4xl font-bold text-gray-800 print:text-black uppercase tracking-wider">
                  QUANTIDADE TOTAL: {totalBloco} KITS
                </div>
              </div>`;

const newBlock = `              {/* QUANTIDADE TOTAL HIGHLIGHT */}
              <div className="flex flex-col mb-10 print:mb-16 border-b-2 border-gray-300 print:border-black pb-6">
                <div className="text-xl print:text-2xl font-bold text-gray-800 print:text-black uppercase tracking-wide">
                  QUANTIDADE TOTAL: {totalBloco} KITS
                </div>
              </div>`;

if (content.includes('QUANTIDADE TOTAL HIGHLIGHT')) {
  content = content.replace(oldBlock, newBlock);
  fs.writeFileSync(filePath, content);
  console.log("Patched successfully");
} else {
  console.log("Could not find the target block");
}
