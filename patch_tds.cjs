const fs = require('fs');

const codeFile = 'src/components/LancamentosRelatoriosModule.tsx';
let code = fs.readFileSync(codeFile, 'utf8');

const replacements = [
  ['<td className="p-2 border-r border-gray-200 dark:border-gray-700 font-bold text-center">{kit.apto}</td>', '<td className="p-2 border-r border-gray-200 dark:border-gray-700 font-bold text-center"><EditableCell value={kit.apto} onChange={v => updateKit(kit.id, "apto", v)} className="w-16 font-bold" /></td>'],
  ['<td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center">{kit.pavimento}</td>', '<td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center"><EditableCell value={kit.pavimento} onChange={v => updateKit(kit.id, "pavimento", v)} className="w-12" /></td>'],
  ['<td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center">{kit.coluna}</td>', '<td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center"><EditableCell value={kit.coluna} onChange={v => updateKit(kit.id, "coluna", v)} className="w-12" /></td>'],
  ['<td className="p-2 border-r border-gray-200 dark:border-gray-700 font-medium">{kit.comodo}</td>', '<td className="p-2 border-r border-gray-200 dark:border-gray-700 font-medium"><EditableCell value={kit.comodo} onChange={v => updateKit(kit.id, "comodo", v)} className="w-32 text-left font-medium" /></td>'],
  
// folhas
  ['<td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center font-mono text-xs">{kit.folhaLargura}</td>', '<td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center font-mono text-xs"><EditableCell value={kit.folhaLargura} onChange={v => updateKit(kit.id, "folhaLargura", v)} className="w-16 font-mono" /></td>'],
  ['<td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center font-mono text-xs">{kit.folhaAltura}</td>', '<td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center font-mono text-xs"><EditableCell value={kit.folhaAltura} onChange={v => updateKit(kit.id, "folhaAltura", v)} className="w-16 font-mono" /></td>'],
  
  ['<td className="p-2 border-r border-gray-200 dark:border-gray-700 font-bold text-center text-xs">{kit.tipologia}</td>', '<td className="p-2 border-r border-gray-200 dark:border-gray-700 font-bold text-center text-xs"><EditableCell value={kit.tipologia} onChange={v => updateKit(kit.id, "tipologia", v)} className="w-20 font-bold" /></td>'],
  ['<td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center text-xs">{kit.abertura}</td>', '<td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center text-xs"><EditableCell type="select" options={["DIREITA", "ESQUERDA", "DIREITA P/FORA", "ESQUERDA P/FORA", "CORRER", "PIVOTANTE", "CAMARÃO"]} value={kit.abertura} onChange={v => updateKit(kit.id, "abertura", v)} className="w-36 text-xs" /></td>'],
  
// aduela
  ['<td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center font-mono text-xs">{kit.aduelaLargura}</td>', '<td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center font-mono text-xs"><EditableCell value={kit.aduelaLargura} onChange={v => updateKit(kit.id, "aduelaLargura", v)} className="w-16 font-mono" /></td>'],
  ['<td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center font-mono text-xs">{kit.aduelaAltura}</td>', '<td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center font-mono text-xs"><EditableCell value={kit.aduelaAltura} onChange={v => updateKit(kit.id, "aduelaAltura", v)} className="w-16 font-mono" /></td>'],
  
  ['<td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center text-xs">{kit.regulagem}</td>', '<td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center text-xs"><EditableCell value={kit.regulagem} onChange={v => updateKit(kit.id, "regulagem", v)} className="w-24 text-xs" /></td>'],
  ['<td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center font-bold">{kit.qtdeFolhasPorKit}</td>', '<td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center font-bold"><EditableCell type="number" value={kit.qtdeFolhasPorKit} onChange={v => updateKit(kit.id, "qtdeFolhasPorKit", parseInt(v) || 0)} className="w-16 font-bold" /></td>'],
  ['<td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center">{kit.acabamento}</td>', '<td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center"><EditableCell value={kit.acabamento} onChange={v => updateKit(kit.id, "acabamento", v)} className="w-24" /></td>'],
  ['<td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center font-medium">{kit.caracteristica}</td>', '<td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center font-medium"><EditableCell value={kit.caracteristica} onChange={v => updateKit(kit.id, "caracteristica", v)} className="w-32 font-medium" /></td>'],
  
  ['<td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center">{kit.qtdeLadosAduela}</td>', '<td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center"><EditableCell type="number" value={kit.qtdeLadosAduela} onChange={v => updateKit(kit.id, "qtdeLadosAduela", parseInt(v) || 0)} className="w-16" /></td>'],
  ['<td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center">{kit.qtdeMontantes}</td>', '<td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center"><EditableCell type="number" value={kit.qtdeMontantes} onChange={v => updateKit(kit.id, "qtdeMontantes", parseInt(v) || 0)} className="w-16" /></td>'],
  
// bits
  ['<td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center">{kit.bitsQtde}</td>', '<td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center"><EditableCell type="number" value={kit.bitsQtde} onChange={v => updateKit(kit.id, "bitsQtde", parseInt(v) || 0)} className="w-16" /></td>'],
  ['<td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center">{kit.bitsFaces}</td>', '<td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center"><EditableCell type="number" value={kit.bitsFaces} onChange={v => updateKit(kit.id, "bitsFaces", parseInt(v) || 0)} className="w-16" /></td>'],
  
// booleans
  ['<td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center font-bold text-gray-500">{kit.camarao ? \'X\' : \'\'}</td>', '<td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center"><EditableCell type="boolean" value={kit.camarao} onChange={v => updateKit(kit.id, "camarao", v)} /></td>'],
  ['<td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center font-bold text-gray-500">{kit.correr ? \'X\' : \'\'}</td>', '<td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center"><EditableCell type="boolean" value={kit.correr} onChange={v => updateKit(kit.id, "correr", v)} /></td>'],
  ['<td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center font-bold text-gray-500">{kit.pivotante ? \'X\' : \'\'}</td>', '<td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center"><EditableCell type="boolean" value={kit.pivotante} onChange={v => updateKit(kit.id, "pivotante", v)} /></td>'],
  ['<td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center font-bold text-gray-500">{kit.veneziana ? \'X\' : \'\'}</td>', '<td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center"><EditableCell type="boolean" value={kit.veneziana} onChange={v => updateKit(kit.id, "veneziana", v)} /></td>'],
  ['<td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center font-bold text-gray-500">{kit.grelha ? \'X\' : \'\'}</td>', '<td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center"><EditableCell type="boolean" value={kit.grelha} onChange={v => updateKit(kit.id, "grelha", v)} /></td>'],
  ['<td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center font-bold text-gray-500">{kit.bandeira ? \'X\' : \'\'}</td>', '<td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center"><EditableCell type="boolean" value={kit.bandeira} onChange={v => updateKit(kit.id, "bandeira", v)} /></td>'],
  ['<td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center font-bold text-gray-500">{kit.chapa ? \'X\' : \'\'}</td>', '<td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center"><EditableCell type="boolean" value={kit.chapa} onChange={v => updateKit(kit.id, "chapa", v)} /></td>'],
  ['<td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center font-bold text-gray-500">{kit.vidro ? \'X\' : \'\'}</td>', '<td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center"><EditableCell type="boolean" value={kit.vidro} onChange={v => updateKit(kit.id, "vidro", v)} /></td>'],
  ['<td className="p-2 text-center font-bold text-gray-500">{kit.fechaFresta ? \'X\' : \'\'}</td>', '<td className="p-2 text-center"><EditableCell type="boolean" value={kit.fechaFresta} onChange={v => updateKit(kit.id, "fechaFresta", v)} /></td>']
];

let replacedCode = code;
for (const [target, replacement] of replacements) {
  if (replacedCode.includes(target)) {
     replacedCode = replacedCode.replace(target, replacement);
  } else {
     console.log("Not found:", target.substring(0, 50));
  }
}

fs.writeFileSync(codeFile, replacedCode);
