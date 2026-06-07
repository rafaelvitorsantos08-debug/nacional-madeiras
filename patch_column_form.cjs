const fs = require('fs');
const codeFile = 'src/components/LancamentosRelatoriosModule.tsx';
let code = fs.readFileSync(codeFile, 'utf8');

const checkboxField = `                     <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer p-1.5 hover:bg-white dark:bg-gray-800 rounded">
                        <input type="checkbox" name="kitDuplo" checked={form.kitDuplo} onChange={handleInputChange} className="rounded text-brand-green focus:ring-brand-green" />
                        <span>Kit Duplo</span>
                     </label>`;

const replacement1 = `<span>C/ Vidro</span>
                     </label>
` + checkboxField + `
                     <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer p-1.5 hover:bg-white dark:bg-gray-800 rounded">`;

code = code.replace(
  /<span>C\/ Vidro<\/span>\n\s*<\/label>\n\s*<label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer p-1\.5 hover:bg-white dark:bg-gray-800 rounded">/,
  replacement1
);

// Insert the th in the table
code = code.replace(
  /<th className="p-2 font-bold text-center">Fecha Fresta<\/th>/,
  `<th className="p-2 font-bold text-center border-r border-[#c2d6b3] dark:border-emerald-800/40">Fecha Fresta</th>
                     <th className="p-2 font-bold text-center">Kit Duplo</th>`
);

// Insert the td in the table
code = code.replace(
  /<td className="p-2 text-center"><EditableCell type="boolean" value=\{kit\.fechaFresta\} onChange=\{v => updateKit\(kit\.id, "fechaFresta", v\)\} \/><\/td>/,
  `<td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center"><EditableCell type="boolean" value={kit.fechaFresta} onChange={v => updateKit(kit.id, "fechaFresta", v)} /></td>
                        <td className="p-2 text-center"><EditableCell type="boolean" value={kit.kitDuplo} onChange={v => updateKit(kit.id, "kitDuplo", v)} /></td>`
);

fs.writeFileSync(codeFile, code);
