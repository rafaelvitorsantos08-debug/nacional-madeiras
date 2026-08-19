const fs = require('fs');
const filePath = 'src/components/AutoReports.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

const targetToRemove1 = `<div className="flex justify-between items-center px-16 mt-20 print:mt-16 w-full max-w-5xl mx-auto break-inside-avoid">
                  <div className="flex flex-col items-center flex-1">
                    <div className="w-64 border-b-[2px] border-black print:border-black mb-2"></div>
                    <span className="font-bold text-gray-800 print:text-black uppercase"><EditableText>{obra || 'Nome da Obra'}</EditableText></span>
                  </div>
                  <div className="w-16"></div> {/* Spacer */}
                  <div className="flex flex-col items-center flex-1">
                    <div className="w-64 border-b-[2px] border-black print:border-black mb-2"></div>
                    <span className="font-bold text-gray-800 print:text-black uppercase">NACIONAL MADEIRAS</span>
                  </div>
                </div>`;
                
const targetToRemove2 = `<div className="flex justify-between items-center px-16 mt-16 print:mt-16 pb-12 w-full max-w-5xl mx-auto break-inside-avoid">
        <div className="flex flex-col items-center flex-1">
          <div className="w-64 border-b-[2px] border-black print:border-black mb-2"></div>
          <span className="font-bold text-gray-800 print:text-black uppercase"><EditableText>{obra || 'Nome da Obra'}</EditableText></span>
        </div>
        <div className="w-16"></div> {/* Spacer */}
        <div className="flex flex-col items-center flex-1">
          <div className="w-64 border-b-[2px] border-black print:border-black mb-2"></div>
          <span className="font-bold text-gray-800 print:text-black uppercase">NACIONAL MADEIRAS</span>
        </div>
      </div>`;
      
// Remove any trailing signatures from tables, since they are now on the cover
if (content.includes('ASSINATURAS (ANCHORED AT BOTTOM)')) {
  // It's possible there are signatures floating at the end of the report block or the end of the file.
}

content = content.replace(targetToRemove1, '');
content = content.replace(targetToRemove2, '');

fs.writeFileSync(filePath, content);
console.log("Patched signatures out of table bottoms");

