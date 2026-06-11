const fs = require('fs');
const file = 'src/components/LancamentosRelatoriosModule.tsx';
let code = fs.readFileSync(file, 'utf8');

const theadOld = /<thead className="bg-\[#e2efda\] dark:bg-emerald-900\/40 text-\[10px\] uppercase text-gray-800 dark:text-emerald-100 sticky top-0 border-b border-gray-300 dark:border-gray-600">[\s\S]*?<\/thead>/;
const theadNew = `<thead className="bg-[#e2efda] dark:bg-emerald-900/40 text-[10px] uppercase text-gray-800 dark:text-emerald-100 sticky top-0 border-b border-gray-300 dark:border-gray-600">
                  <tr>
                     {['AÇÕES', 'BLOCO', 'APTO', 'PAVIMENTO', 'COLUNA', 'CÔMODO', 'TIPOLOGIA', 'FOLHA LARG', 'FOLHA ALT', 'QTD FOLHA/KIT', 'ACABAMENTO DA PORTA', 'CARACTERISTICA DA PORTA', 'ABERTURA', 'ADUELA LARG', 'ADUELA ALT', 'REGULAGEM', 'ACABAMENTO DA ADUELA', 'FECH. MARCA', 'FECH. GRID', 'FECH. TIPO', 'DOBRADIÇA MARCA', 'DOBRADIÇA MEDIDA', 'QTD LADOS ADUELA', 'MONTANTES MEDIDA', 'MONTANTES FOLGAS', 'B. QTD', 'B. FACES', 'CAM', 'CORRER', 'PIV', 'C/VEN', 'C/GRE', 'C/BAND', 'C/CHAPA', 'C/VID', 'C/FF', 'KIT DUPLO', 'OBSERVAÇÃO'].map((h, i) => (
                         <th key={i} className="p-2 border-r border-[#c2d6b3] dark:border-emerald-800/40 font-bold text-center whitespace-pre">{h}</th>
                     ))}
                  </tr>
               </thead>`;
code = code.replace(theadOld, theadNew);

const tbodyOld = /<tbody className="divide-y divide-gray-200 dark:divide-gray-700">[\s\S]*?<\/tbody>/;

const tbodyNew = `<tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {kits.map(kit => (
                     <tr key={kit.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800">
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center">
                           <div className="flex justify-center space-x-2">
                             <button onClick={() => handleDuplicate(kit)} title="Duplicar para o formulário" className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors">
                               <Copy className="w-4 h-4" />
                             </button>
                             <button onClick={() => handleDelete(kit.id)} title="Excluir" className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors">
                               <Trash2 className="w-4 h-4" />
                             </button>
                           </div>
                        </td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center font-bold text-emerald-700 dark:text-emerald-400"><EditableCell value={kit.bloco} onChange={v => updateKit(kit.id, "bloco", v)} className="w-16 font-bold" /></td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 font-bold text-center"><EditableCell value={kit.apto} onChange={v => updateKit(kit.id, "apto", v)} className="w-16 font-bold" /></td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center"><EditableCell value={kit.pavimento} onChange={v => updateKit(kit.id, "pavimento", v)} className="w-12" /></td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center"><EditableCell value={kit.coluna} onChange={v => updateKit(kit.id, "coluna", v)} className="w-12" /></td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 font-medium"><EditableCell value={kit.comodo} onChange={v => updateKit(kit.id, "comodo", v)} className="w-32 text-left font-medium" /></td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 font-bold text-center text-xs"><EditableCell value={kit.tipologia} onChange={v => updateKit(kit.id, "tipologia", v)} className="w-20 font-bold" /></td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center font-mono text-xs"><EditableCell value={kit.folhaLargura} onChange={v => updateKit(kit.id, "folhaLargura", v)} className="w-16 font-mono" /></td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center font-mono text-xs"><EditableCell value={kit.folhaAltura} onChange={v => updateKit(kit.id, "folhaAltura", v)} className="w-16 font-mono" /></td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center font-bold"><EditableCell type="number" value={String(kit.qtdeFolhasPorKit)} onChange={v => updateKit(kit.id, "qtdeFolhasPorKit", v)} className="w-16 font-bold text-center" /></td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center"><EditableCell value={kit.acabamentoPorta} onChange={v => updateKit(kit.id, "acabamentoPorta", v)} className="w-24" /></td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center font-medium"><EditableCell value={kit.caracteristicaPorta} onChange={v => updateKit(kit.id, "caracteristicaPorta", v)} className="w-32 font-medium" /></td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center text-xs"><EditableCell type="select" options={["DIREITA", "ESQUERDA", "DIREITA P/FORA", "ESQUERDA P/FORA", "CORRER", "PIVOTANTE", "CAMARÃO"]} value={kit.abertura} onChange={v => updateKit(kit.id, "abertura", v)} className="w-36 text-xs" /></td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center font-mono text-xs"><EditableCell value={kit.aduelaLargura} onChange={v => updateKit(kit.id, "aduelaLargura", v)} className="w-16 font-mono" /></td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center font-mono text-xs"><EditableCell value={kit.aduelaAltura} onChange={v => updateKit(kit.id, "aduelaAltura", v)} className="w-16 font-mono" /></td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center text-xs"><EditableCell value={kit.regulagem} onChange={v => updateKit(kit.id, "regulagem", v)} className="w-24 text-xs" /></td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center"><EditableCell value={kit.acabamentoAduela} onChange={v => updateKit(kit.id, "acabamentoAduela", v)} className="w-36" /></td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center"><EditableCell value={kit.fechaduraMarca} onChange={v => updateKit(kit.id, "fechaduraMarca", v)} className="w-20" /></td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center"><EditableCell value={kit.fechaduraGrid} onChange={v => updateKit(kit.id, "fechaduraGrid", v)} className="w-16" /></td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center"><EditableCell value={kit.fechaduraTipo} onChange={v => updateKit(kit.id, "fechaduraTipo", v)} className="w-20" /></td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center"><EditableCell value={kit.dobradicaMarca} onChange={v => updateKit(kit.id, "dobradicaMarca", v)} className="w-20" /></td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center"><EditableCell value={kit.dobradicaMedida} onChange={v => updateKit(kit.id, "dobradicaMedida", v)} className="w-20" /></td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center"><EditableCell type="number" value={String(kit.qtdeLadosAduela)} onChange={v => updateKit(kit.id, "qtdeLadosAduela", v)} className="w-16 text-center" /></td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center"><EditableCell value={kit.montantesMedida} onChange={v => updateKit(kit.id, "montantesMedida", v)} className="w-16 text-center" /></td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center"><EditableCell value={kit.montantesFolgas} onChange={v => updateKit(kit.id, "montantesFolgas", v)} className="w-16 text-center" /></td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center"><EditableCell value={kit.bitsQtde} onChange={v => updateKit(kit.id, "bitsQtde", v)} className="w-16 text-center" /></td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center"><EditableCell value={kit.bitsFaces} onChange={v => updateKit(kit.id, "bitsFaces", v)} className="w-16 text-center" /></td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center"><EditableCell type="boolean" value={kit.camarao} onChange={v => updateKit(kit.id, "camarao", v)} /></td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center"><EditableCell type="boolean" value={kit.correr} onChange={v => updateKit(kit.id, "correr", v)} /></td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center"><EditableCell type="boolean" value={kit.pivotante} onChange={v => updateKit(kit.id, "pivotante", v)} /></td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center"><EditableCell type="boolean" value={kit.veneziana} onChange={v => updateKit(kit.id, "veneziana", v)} /></td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center"><EditableCell type="boolean" value={kit.grelha} onChange={v => updateKit(kit.id, "grelha", v)} /></td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center"><EditableCell type="boolean" value={kit.bandeira} onChange={v => updateKit(kit.id, "bandeira", v)} /></td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center"><EditableCell type="boolean" value={kit.chapa} onChange={v => updateKit(kit.id, "chapa", v)} /></td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center"><EditableCell type="boolean" value={kit.vidro} onChange={v => updateKit(kit.id, "vidro", v)} /></td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center"><EditableCell type="boolean" value={kit.fechaFresta} onChange={v => updateKit(kit.id, "fechaFresta", v)} /></td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center"><EditableCell type="boolean" value={kit.kitDuplo} onChange={v => updateKit(kit.id, "kitDuplo", v)} /></td>
                        <td className="p-2 text-center border-r border-gray-200 dark:border-gray-700"><EditableObsCell value={kit.observacao || ""} onChange={v => updateKit(kit.id, "observacao", v)} /></td>
                     </tr>
                  ))}
                  {kits.length === 0 && (
                     <tr>
                        <td colSpan={38} className="p-8 text-center text-gray-500">
                           Nenhum lançamento efetuado. Utilize o formulário acima para registrar um kit.
                        </td>
                     </tr>
                  )}
               </tbody>`;
code = code.replace(tbodyOld, tbodyNew);
fs.writeFileSync(file, code);
