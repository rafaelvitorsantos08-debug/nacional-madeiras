const fs = require('fs');
const filePath = 'src/components/AutoReports.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Needs Header
content = content.replace(
  `  const needsHeader = !['auto_portas', 'auto_montagem', 'auto_entrega'].includes(reportType);`,
  `  const needsHeader = !['auto_portas', 'auto_montagem'].includes(reportType);`
);

// 2. Signatures swap
const targetSignatures = `              {/* ASSINATURAS INVERTIDAS E NA CAPA */}
              <div className="mt-auto pt-8 pb-8 flex flex-col space-y-12">
                <div className="grid grid-cols-2 gap-16 text-center">
                  {/* Nacional Madeiras primeiro (esquerda) */}
                  <div className="flex flex-col items-center">
                    <div className="w-full border-b-[2px] border-black print:border-black mb-2"></div>
                    <span className="font-bold text-gray-800 print:text-black text-lg print:text-xl uppercase">NACIONAL MADEIRAS</span>
                  </div>
                  {/* Obra segundo (direita) */}
                  <div className="flex flex-col items-center">
                    <div className="w-full border-b-[2px] border-black print:border-black mb-2"></div>
                    <span className="font-bold text-gray-800 print:text-black text-lg print:text-xl uppercase"><EditableText>{obra || 'Nome da Obra'}</EditableText></span>
                  </div>
                </div>
                
                {/* DATA DE RECEBIMENTO */}
                <div className="flex justify-center items-end text-xl print:text-2xl font-bold text-black pt-8">
                  <span>RECEBIDO EM</span>
                  <div className="border-b-[2px] border-black w-24 mx-4"></div>
                  <span>DE</span>
                  <div className="border-b-[2px] border-black w-64 mx-4"></div>
                  <span>2026</span>
                </div>
              </div>`;

const replacementSignatures = `              {/* DATA E ASSINATURAS (INVERTIDAS) */}
              <div className="mt-auto pt-8 pb-8 flex flex-col space-y-20">
                {/* DATA DE RECEBIMENTO */}
                <div className="flex justify-center items-end text-xl print:text-2xl font-bold text-black">
                  <span>RECEBIDO EM</span>
                  <div className="border-b-[2px] border-black w-24 mx-4"></div>
                  <span>DE</span>
                  <div className="border-b-[2px] border-black w-64 mx-4"></div>
                  <span>2026</span>
                </div>

                <div className="grid grid-cols-2 gap-16 text-center pt-8">
                  {/* Nacional Madeiras primeiro (esquerda) */}
                  <div className="flex flex-col items-center">
                    <div className="w-full border-b-[2px] border-black print:border-black mb-2"></div>
                    <span className="font-bold text-gray-800 print:text-black text-lg print:text-xl uppercase">NACIONAL MADEIRAS</span>
                  </div>
                  {/* Obra segundo (direita) */}
                  <div className="flex flex-col items-center">
                    <div className="w-full border-b-[2px] border-black print:border-black mb-2"></div>
                    <span className="font-bold text-gray-800 print:text-black text-lg print:text-xl uppercase"><EditableText>{obra || 'Nome da Obra'}</EditableText></span>
                  </div>
                </div>
              </div>`;
content = content.replace(targetSignatures, replacementSignatures);

// 3. Logic: Acabamento
const targetTable = `                dimKits.forEach(k => {
                  const key = [
                    k.apto, k.comodo, k.abertura,
                    k.aduelaLargura, k.aduelaAltura, k.fechaduraTipo, k.fechaduraMarca,
                    k.modelo, k.tipologia
                  ].join('||');
                  
                  let stringQtdStr = String(k.qtdeFolhasPorKit || '1');
                  if (k.quantidade) stringQtdStr = String(k.quantidade);
                  if (k.qtde) stringQtdStr = String(k.qtde);
                  const qty = parseInt(stringQtdStr, 10);
                  const validQty = isNaN(qty) ? 1 : qty;
                  
                  if (subGrouped.has(key)) {
                    subGrouped.get(key).qtd += validQty;
                  } else {
                    subGrouped.set(key, {
                      apto: k.apto || '-',
                      comodo: k.comodo || '-',
                      abertura: k.abertura || '-',
                      aduela: \`\${k.aduelaLargura || '-'} x \${k.aduelaAltura || '-'}\`,
                      fechadura: (k.fechaduraTipo || k.fechaduraMarca) ? \`\${k.fechaduraTipo || ''} \${k.fechaduraMarca || ''}\`.trim() : '-',
                      modelo: k.modelo || k.tipologia || '-',
                      qtd: validQty
                    });
                  }
                });`;

const replacementTable = `                dimKits.forEach(k => {
                  const acabamento = k.acabamentoPorta || k.corFolha || '-';
                  const key = [
                    k.apto, k.comodo, k.abertura,
                    k.aduelaLargura, k.aduelaAltura, k.fechaduraTipo, k.fechaduraMarca,
                    k.modelo, k.tipologia, acabamento
                  ].join('||');
                  
                  let stringQtdStr = String(k.qtdeFolhasPorKit || '1');
                  if (k.quantidade) stringQtdStr = String(k.quantidade);
                  if (k.qtde) stringQtdStr = String(k.qtde);
                  const qty = parseInt(stringQtdStr, 10);
                  const validQty = isNaN(qty) ? 1 : qty;
                  
                  if (subGrouped.has(key)) {
                    subGrouped.get(key).qtd += validQty;
                  } else {
                    subGrouped.set(key, {
                      apto: k.apto || '-',
                      comodo: k.comodo || '-',
                      abertura: k.abertura || '-',
                      aduela: \`\${k.aduelaLargura || '-'} x \${k.aduelaAltura || '-'}\`,
                      fechadura: (k.fechaduraTipo || k.fechaduraMarca) ? \`\${k.fechaduraTipo || ''} \${k.fechaduraMarca || ''}\`.trim() : '-',
                      modelo: k.modelo || k.tipologia || '-',
                      acabamento: acabamento,
                      qtd: validQty
                    });
                  }
                });`;
content = content.replace(targetTable, replacementTable);

// 4. Thead
const targetThead = `                        <tr>
                          <th className="border-r border-gray-400 print:border-black py-2 px-3 text-left font-bold text-gray-800 print:text-black">APTO.</th>
                          <th className="border-r border-gray-400 print:border-black py-2 px-3 text-left font-bold text-gray-800 print:text-black">CÔMODO</th>
                          <th className="border-r border-gray-400 print:border-black py-2 px-3 text-left font-bold text-gray-800 print:text-black">ABERTURA</th>
                          <th className="border-r border-gray-400 print:border-black py-2 px-3 text-left font-bold text-gray-800 print:text-black">ADUELA</th>
                          <th className="border-r border-gray-400 print:border-black py-2 px-3 text-left font-bold text-gray-800 print:text-black">FECHADURA</th>
                          <th className="py-2 px-3 text-left font-bold text-gray-800 print:text-black">MODELO</th>
                        </tr>`;
const replacementThead = `                        <tr>
                          <th className="border-r border-gray-400 print:border-black py-2 px-3 text-left font-bold text-gray-800 print:text-black">APTO.</th>
                          <th className="border-r border-gray-400 print:border-black py-2 px-3 text-left font-bold text-gray-800 print:text-black">CÔMODO</th>
                          <th className="border-r border-gray-400 print:border-black py-2 px-3 text-left font-bold text-gray-800 print:text-black">ABERTURA</th>
                          <th className="border-r border-gray-400 print:border-black py-2 px-3 text-left font-bold text-gray-800 print:text-black">ADUELA</th>
                          <th className="border-r border-gray-400 print:border-black py-2 px-3 text-left font-bold text-gray-800 print:text-black">FECHADURA</th>
                          <th className="border-r border-gray-400 print:border-black py-2 px-3 text-left font-bold text-gray-800 print:text-black">MODELO</th>
                          <th className="py-2 px-3 text-left font-bold text-gray-800 print:text-black">ACABAMENTO</th>
                        </tr>`;
content = content.replace(targetThead, replacementThead);

// 5. Tbody
const targetTbody = `                        {rows.map((r, i) => (
                          <tr key={i} className="border-b border-gray-300 print:border-black hover:bg-gray-50 print:hover:bg-transparent">
                            <td className="py-2 px-3 text-gray-700 print:text-black">{r.apto}</td>
                            <td className="py-2 px-3 text-gray-700 print:text-black">{r.comodo}</td>
                            <td className="py-2 px-3 text-gray-700 print:text-black">{r.abertura}</td>
                            <td className="py-2 px-3 text-gray-700 print:text-black">{r.aduela}</td>
                            <td className="py-2 px-3 text-gray-700 print:text-black">{r.fechadura}</td>
                            <td className="py-2 px-3 text-gray-700 print:text-black">{r.modelo}</td>
                          </tr>
                        ))}
                      </tbody>`;
const replacementTbody = `                        {rows.map((r, i) => (
                          <tr key={i} className="border-b border-gray-300 print:border-black hover:bg-gray-50 print:hover:bg-transparent">
                            <td className="py-2 px-3 text-gray-700 print:text-black border-r border-gray-300 print:border-black">{r.apto}</td>
                            <td className="py-2 px-3 text-gray-700 print:text-black border-r border-gray-300 print:border-black">{r.comodo}</td>
                            <td className="py-2 px-3 text-gray-700 print:text-black border-r border-gray-300 print:border-black">{r.abertura}</td>
                            <td className="py-2 px-3 text-gray-700 print:text-black border-r border-gray-300 print:border-black">{r.aduela}</td>
                            <td className="py-2 px-3 text-gray-700 print:text-black border-r border-gray-300 print:border-black">{r.fechadura}</td>
                            <td className="py-2 px-3 text-gray-700 print:text-black border-r border-gray-300 print:border-black">{r.modelo}</td>
                            <td className="py-2 px-3 text-gray-700 print:text-black">{r.acabamento}</td>
                          </tr>
                        ))}
                      </tbody>`;
content = content.replace(targetTbody, replacementTbody);

fs.writeFileSync(filePath, content);
console.log('Patched correctly');
