const fs = require('fs');
const filePath = 'src/components/AutoReports.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// The block highlight code is:
// <h2 className="text-5xl print:text-6xl font-black uppercase text-gray-800 print:text-black border-[3px] border-gray-600 print:border-black px-12 py-8 shadow-sm print:shadow-none bg-[#1e293b] print:bg-transparent text-white print:text-black min-w-[200px] text-center">
//   <EditableText>{blocoName.toUpperCase().includes('BLOCO') ? blocoName : \`BLOCO \${blocoName}\`}</EditableText>
// </h2>

const oldH2 = 'text-5xl print:text-6xl font-black uppercase text-gray-800 print:text-black border-[3px] border-gray-600 print:border-black px-12 py-8 shadow-sm print:shadow-none bg-[#1e293b] print:bg-transparent text-white print:text-black min-w-[200px] text-center';
const newH2 = 'text-4xl print:text-5xl font-black uppercase text-gray-800 print:text-black border-[3px] border-gray-600 print:border-black px-10 py-6 shadow-sm print:shadow-none bg-[#1e293b] print:bg-transparent text-white print:text-black min-w-[180px] text-center';

const oldFlex = 'className="flex-1 flex flex-col items-center justify-center space-y-6"';
const newFlex = 'className="flex-1 flex flex-col items-center justify-center space-y-4 mb-4"';

if (content.includes(oldH2)) {
  content = content.replace(oldH2, newH2);
  content = content.replace(oldFlex, newFlex);
  
  // also reduce min-h of cover page to ensure it fits comfortably
  const oldMinH = 'className="flex flex-col min-h-[90vh] print:min-h-[100vh] print:h-[100vh] pt-12"';
  const newMinH = 'className="flex flex-col h-full min-h-[85vh] print:h-full print:min-h-[95vh] pt-12"';
  content = content.replace(oldMinH, newMinH);
  
  fs.writeFileSync(filePath, content);
  console.log("Patched successfully");
} else {
  console.log("Could not find the target block");
}
