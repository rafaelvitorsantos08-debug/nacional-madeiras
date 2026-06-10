const fs = require('fs');
const file = 'src/components/RelatoriosModule.tsx';
let code = fs.readFileSync(file, 'utf8');

const baseEditableClass = 'contentEditable suppressContentEditableWarning className="outline-none focus:bg-emerald-50 focus:ring-1 focus:ring-emerald-500 transition-colors border border-black p-2';

code = code.replace(
  '<td className="border border-black p-2 font-medium">{item.cor}</td>',
  '<td ' + baseEditableClass + ' font-medium">{item.cor}</td>'
);
code = code.replace(
  '<td className="border border-black p-2 text-center font-bold text-lg">{item.quantidade}</td>',
  '<td ' + baseEditableClass + ' text-center font-bold text-lg">{item.quantidade}</td>'
);

// We should also replace the item row details:
// <td className="border border-black p-2">
code = code.replace(
  '<td className="border border-black p-2">\n                      {reportType === "portas"',
  '<td ' + baseEditableClass + '">\n                      {reportType === "portas"'
);


fs.writeFileSync(file, code);
