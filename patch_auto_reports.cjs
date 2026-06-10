const fs = require('fs');
const file = 'src/components/AutoReports.tsx';
let code = fs.readFileSync(file, 'utf8');

const EDITABLE_TD = '<td contentEditable suppressContentEditableWarning className="outline-none focus:bg-emerald-50 dark:focus:bg-emerald-900/30 focus:ring-1 focus:ring-emerald-500 rounded transition-colors ';
const EDITABLE_SPAN = '<span contentEditable suppressContentEditableWarning className="outline-none focus:bg-emerald-50 dark:focus:bg-emerald-900/30 focus:ring-1 focus:ring-emerald-500 rounded px-1 transition-colors ';

// 1. auto aduelas
code = code.replace(
  '<td className="px-4 py-1.5 text-sm text-gray-900 dark:text-gray-100 print:text-black font-mono border-r-2 border-gray-800 dark:border-gray-600 print:border-black font-bold">{row.largura} x {row.altura}</td>',
  EDITABLE_TD + 'px-4 py-1.5 text-sm text-gray-900 dark:text-gray-100 print:text-black font-mono border-r-2 border-gray-800 dark:border-gray-600 print:border-black font-bold">{row.largura} x {row.altura}</td>'
);
code = code.replace(
  '<td className="px-4 py-1.5 text-sm text-gray-900 dark:text-gray-100 print:text-black border-r-2 border-gray-800 dark:border-gray-600 print:border-black font-bold">{row.acabamento}</td>',
  EDITABLE_TD + 'px-4 py-1.5 text-sm text-gray-900 dark:text-gray-100 print:text-black border-r-2 border-gray-800 dark:border-gray-600 print:border-black font-bold">{row.acabamento}</td>'
);
code = code.replace(
  '<td className="px-4 py-1.5 text-sm text-gray-900 dark:text-gray-100 print:text-black text-right font-bold w-20">{row.qtd}</td>',
  EDITABLE_TD + 'px-4 py-1.5 text-sm text-gray-900 dark:text-gray-100 print:text-black text-center font-bold w-20">{row.qtd}</td>'
);

// 2. auto usinagem (both aduelas and portas)
code = code.replace(
  '<td className="px-2 py-1 text-gray-900 dark:text-gray-100 print:text-black font-mono font-bold text-center">{it.dimensao}</td>',
  EDITABLE_TD + 'px-2 py-1 text-gray-900 dark:text-gray-100 print:text-black font-mono font-bold text-center">{it.dimensao}</td>'
);
code = code.replace(
  '<td className="px-2 py-1 text-center text-gray-900 dark:text-gray-100 print:text-black font-bold w-12 border-l-2 border-gray-800 dark:border-gray-600 print:border-black bg-gray-50 dark:bg-gray-900 print:bg-gray-50">{it.qtd}</td>',
  EDITABLE_TD + 'px-2 py-1 text-center text-gray-900 dark:text-gray-100 print:text-black font-bold w-12 border-l-2 border-gray-800 dark:border-gray-600 print:border-black bg-gray-50 dark:bg-gray-900 print:bg-gray-50">{it.qtd}</td>'
);
code = code.replace(
  '{d.dimensao}: <span className="text-gray-900 dark:text-gray-100 print:text-black">{qEsqDir} Esq / {qEsqDir} Dir</span>',
  '{d.dimensao}: ' + EDITABLE_SPAN + 'text-gray-900 dark:text-gray-100 print:text-black">{qEsqDir} Esq / {qEsqDir} Dir</span>'
);

// 3. auto portas
code = code.replace(
  '<td className="px-4 py-1.5 text-sm text-gray-900 dark:text-gray-100 print:text-black font-mono font-bold border-r-2 border-gray-800 dark:border-gray-600 print:border-black truncate">{row.dimensaoDisplay}</td>',
  EDITABLE_TD + 'px-4 py-1.5 text-sm text-gray-900 dark:text-gray-100 print:text-black font-mono font-bold border-r-2 border-gray-800 dark:border-gray-600 print:border-black truncate">{row.dimensaoDisplay}</td>'
);
code = code.replace(
  '<td className="px-4 py-1.5 text-sm text-gray-900 dark:text-gray-100 print:text-black font-bold border-r-2 border-gray-800 dark:border-gray-600 print:border-black truncate">{row.acabamento}</td>',
  EDITABLE_TD + 'px-4 py-1.5 text-sm text-gray-900 dark:text-gray-100 print:text-black font-bold border-r-2 border-gray-800 dark:border-gray-600 print:border-black truncate">{row.acabamento}</td>'
);
code = code.replace(
  '<td className="px-4 py-1.5 text-sm text-gray-900 dark:text-gray-100 print:text-black text-right font-bold">{row.qtd}</td>',
  EDITABLE_TD + 'px-4 py-1.5 text-sm text-gray-900 dark:text-gray-100 print:text-black text-center font-bold">{row.qtd}</td>'
);

// 4. auto vergas
code = code.replace(
  '<td className="px-4 py-1.5 text-sm text-gray-900 dark:text-gray-100 print:text-black border-r-2 border-gray-800 dark:border-gray-600 print:border-black font-mono font-bold text-center truncate">{row.aduelaLargura}</td>',
  EDITABLE_TD + 'px-4 py-1.5 text-sm text-gray-900 dark:text-gray-100 print:text-black border-r-2 border-gray-800 dark:border-gray-600 print:border-black font-mono font-bold text-center truncate">{row.aduelaLargura}</td>'
);
code = code.replace(
  '<td className="px-4 py-1.5 text-sm text-gray-900 dark:text-gray-100 print:text-black text-center font-bold w-32 bg-gray-50 dark:bg-gray-900 print:bg-gray-50">{row.qtd}</td>',
  EDITABLE_TD + 'px-4 py-1.5 text-sm text-gray-900 dark:text-gray-100 print:text-black text-center font-bold w-32 bg-gray-50 dark:bg-gray-900 print:bg-gray-50">{row.qtd}</td>'
);

// 5. auto alizares
code = code.replace(
  '<td className="px-4 py-1.5 text-sm text-gray-900 dark:text-gray-100 print:text-black border-r-2 border-gray-800 dark:border-gray-600 print:border-black font-bold">{row.desc}</td>',
  EDITABLE_TD + 'px-4 py-1.5 text-sm text-gray-900 dark:text-gray-100 print:text-black border-r-2 border-gray-800 dark:border-gray-600 print:border-black font-bold">{row.desc}</td>'
);
code = code.replace( // This matches the acabamento string which is the same except the {row.acabamento} var
  '<td className="px-4 py-1.5 text-sm text-gray-900 dark:text-gray-100 print:text-black border-r-2 border-gray-800 dark:border-gray-600 print:border-black font-bold">{row.acabamento}</td>',
  EDITABLE_TD + 'px-4 py-1.5 text-sm text-gray-900 dark:text-gray-100 print:text-black border-r-2 border-gray-800 dark:border-gray-600 print:border-black font-bold">{row.acabamento}</td>'
);
code = code.replace( // Note the alizares table has {row.qtd} but we already globally ran replace earlier, wait we didn't, replace only replaces first occurrence.
  '<td className="px-4 py-1.5 text-sm text-gray-900 dark:text-gray-100 print:text-black text-right font-bold">{row.qtd}</td>',
  EDITABLE_TD + 'px-4 py-1.5 text-sm text-gray-900 dark:text-gray-100 print:text-black text-center font-bold">{row.qtd}</td>'
);

fs.writeFileSync(file, code);
