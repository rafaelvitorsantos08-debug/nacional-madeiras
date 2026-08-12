const fs = require('fs');
let code = fs.readFileSync('src/components/RelatoriosModule.tsx', 'utf8');

code = code.replace(/<tr key=\{item\.id\} className="border-b border-black">/g, 
'<tr key={item.id} className="border-b border-black print:border-b-[1.5px]">');

code = code.replace(/text-lg">\{item\.quantidade\}<\/td>/g, 'text-lg print:text-[24px]">{item.quantidade}</td>');

// Some other text sizes in RelatoriosModule.tsx
code = code.replace(/text-xs uppercase text-gray-600 font-bold/g, 'text-xs print:text-[14px] uppercase text-gray-600 print:text-black font-bold');
code = code.replace(/text-lg uppercase text-black/g, 'text-lg print:text-[20px] uppercase text-black print:text-black');
code = code.replace(/text-sm/g, 'text-sm print:text-[16px]');

fs.writeFileSync('src/components/RelatoriosModule.tsx', code);
