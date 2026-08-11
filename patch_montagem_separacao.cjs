const fs = require('fs');
let code = fs.readFileSync('src/components/AutoReports.tsx', 'utf8');

const regexMap = /const rows = Array\.from\(grouped\.values\(\)\);\s*return \(\s*<React\.Fragment key=\{abIdx\}>\s*\{\/\* Abertura Header \*\/\}[\s\S]*?<\/React\.Fragment>\s*\);\s*\}\)\}/;

const newMap = `const rows = Array.from(grouped.values());
                  
                  // Separa as linhas por fechadura para criar blocos distintos
                  const rowsByFechadura = new Map();
                  rows.forEach(r => {
                    if (!rowsByFechadura.has(r.fechadura)) rowsByFechadura.set(r.fechadura, []);
                    rowsByFechadura.get(r.fechadura).push(r);
                  });
                  
                  const fechaduraGroups = Array.from(rowsByFechadura.values());

                  return (
                    <React.Fragment key={abIdx}>
                      {fechaduraGroups.map((groupRows, gIdx) => (
                        <React.Fragment key={gIdx}>
                          {(abIdx > 0 || gIdx > 0) && (
                            <tr className="border-0 bg-transparent h-6 break-inside-avoid">
                               <td colSpan={totalCols} className="border-0"></td>
                            </tr>
                          )}
                          {/* Abertura Header */}
                          <tr className="bg-gray-50 dark:bg-gray-700 print:bg-transparent border-t border-gray-300 w-full break-inside-avoid">
                            <td colSpan={totalCols} className="px-3 py-2 text-center font-bold text-sm uppercase text-black dark:text-white print:text-black border-transparent print:border-transparent">
                              <EditableText>{abertura}</EditableText>
                            </td>
                          </tr>
                          {/* Títulos do Bloco */}
                          <tr className="bg-[#0f172a] text-white print:bg-transparent print:border-y print:border-gray-300 print:text-black font-semibold uppercase break-inside-avoid shadow-[0_1px_0_1px_#cbd5e1] print:shadow-none">
                            <th className="px-3 py-2 text-center whitespace-nowrap border-x border-[#1e293b] print:border-gray-300">QTD</th>
                            <th className="px-3 py-2 text-center whitespace-nowrap border-x border-[#1e293b] print:border-gray-300">FOLHA DE PORTA</th>
                            <th className="px-3 py-2 text-center whitespace-nowrap border-x border-[#1e293b] print:border-gray-300">CARACTERÍSTICAS</th>
                            <th className="px-3 py-2 text-center whitespace-nowrap border-x border-[#1e293b] print:border-gray-300">ACABAMENTO</th>
                            <th className="px-3 py-2 text-center whitespace-nowrap border-x border-[#1e293b] print:border-gray-300">INFO. ADUELA</th>
                            <th className="px-3 py-2 text-center whitespace-nowrap border-x border-[#1e293b] print:border-gray-300">FECH. GRID</th>
                            <th className="px-3 py-2 text-center whitespace-nowrap border-x border-[#1e293b] print:border-gray-300">DOBRADIÇAS</th>
                            {showBits && <th className="px-3 py-2 text-center whitespace-nowrap border-x border-[#1e293b] print:border-gray-300">BITS</th>}
                            {showCorrer && <th className="px-3 py-2 text-center whitespace-nowrap border-x border-[#1e293b] print:border-gray-300">CORRER</th>}
                            {showVen && <th className="px-3 py-2 text-center whitespace-nowrap border-x border-[#1e293b] print:border-gray-300">VENEZIANA</th>}
                            {showGre && <th className="px-3 py-2 text-center whitespace-nowrap border-x border-[#1e293b] print:border-gray-300">GRELHA</th>}
                            {showBand && <th className="px-3 py-2 text-center whitespace-nowrap border-x border-[#1e293b] print:border-gray-300">BANDEIRA</th>}
                            {showPiv && <th className="px-3 py-2 text-center whitespace-nowrap border-x border-[#1e293b] print:border-gray-300">PIVOTANTE</th>}
                            {showFf && <th className="px-3 py-2 text-center whitespace-nowrap border-x border-[#1e293b] print:border-gray-300">FECHA FRESTA</th>}
                            {showVid && <th className="px-3 py-2 text-center whitespace-nowrap border-x border-[#1e293b] print:border-gray-300">COM VIDRO</th>}
                            <th className="px-3 py-2 text-center whitespace-nowrap border-x border-[#1e293b] print:border-gray-300">CONCLUÍDO</th>
                          </tr>
                          {/* Linhas de Dados */}
                          {groupRows.map((g, rIdx) => (
                            <tr key={rIdx} className="hover:bg-gray-50 dark:hover:bg-gray-700 print:hover:bg-transparent text-gray-900 dark:text-gray-100 print:text-black border-b border-gray-300 break-inside-avoid">
                              <td className="px-3 py-2 text-center border-x border-gray-200 print:border-gray-300 font-medium"><EditableText>{g.qtd}</EditableText></td>
                              <td className="px-3 py-2 text-center border-x border-gray-200 print:border-gray-300 font-medium"><EditableText>{g.folha}</EditableText></td>
                              <td className="px-3 py-2 text-center border-x border-gray-200 print:border-gray-300 font-medium"><EditableText>{g.caracteristicas}</EditableText></td>
                              <td className="px-3 py-2 text-center border-x border-gray-200 print:border-gray-300 font-medium"><EditableText>{g.acabamento}</EditableText></td>
                              <td className="px-3 py-2 text-center border-x border-gray-200 print:border-gray-300 font-medium"><EditableText>{g.aduela}</EditableText></td>
                              <td className="px-3 py-2 text-center border-x border-gray-200 print:border-gray-300 font-medium"><EditableText>{g.fechadura}</EditableText></td>
                              <td className="px-3 py-2 text-center border-x border-gray-200 print:border-gray-300 font-medium"><EditableText>{g.dobradica}</EditableText></td>
                              {showBits && <td className="px-3 py-2 text-center border-x border-gray-200 print:border-gray-300 font-medium"><EditableText>{g.bitsQtde}</EditableText></td>}
                              {showCorrer && <td className="px-3 py-2 text-center border-x border-gray-200 print:border-gray-300 font-medium"><EditableText>{g.correr}</EditableText></td>}
                              {showVen && <td className="px-3 py-2 text-center border-x border-gray-200 print:border-gray-300 font-medium"><EditableText>{g.veneziana}</EditableText></td>}
                              {showGre && <td className="px-3 py-2 text-center border-x border-gray-200 print:border-gray-300 font-medium"><EditableText>{g.grelha}</EditableText></td>}
                              {showBand && <td className="px-3 py-2 text-center border-x border-gray-200 print:border-gray-300 font-medium"><EditableText>{g.bandeira}</EditableText></td>}
                              {showPiv && <td className="px-3 py-2 text-center border-x border-gray-200 print:border-gray-300 font-medium"><EditableText>{g.pivotante}</EditableText></td>}
                              {showFf && <td className="px-3 py-2 text-center border-x border-gray-200 print:border-gray-300 font-medium"><EditableText>{g.fechaFresta}</EditableText></td>}
                              {showVid && <td className="px-3 py-2 text-center border-x border-gray-200 print:border-gray-300 font-medium"><EditableText>{g.vidro}</EditableText></td>}
                              <td className="px-3 py-2 text-center border-x border-gray-200 print:border-gray-300 font-medium"> </td>
                            </tr>
                          ))}
                        </React.Fragment>
                      ))}
                    </React.Fragment>
                  );
                })}`;

code = code.replace(/const rows = Array\.from\(grouped\.values\(\)\);[\s\S]*?\{\/\* Abertura Header \*\/\}[\s\S]*?<\/React\.Fragment>\s*\);\s*\}\)/, newMap);

fs.writeFileSync('src/components/AutoReports.tsx', code);
