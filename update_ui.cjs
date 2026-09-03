const fs = require('fs');
let code = fs.readFileSync('src/components/RelatoriosModule.tsx', 'utf8');

// Find where reportType select is rendered, and add the bloco filter below it if it's an auto report
const searchStr = `</select>
              </div>`;

const newUI = `</select>
              </div>
              {isAutoReport(reportType) && (
                <div className="print:hidden">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Filtrar por Bloco
                  </label>
                  <select
                    value={selectedBloco}
                    onChange={(e) => setSelectedBloco(e.target.value)}
                    className="w-full rounded-md border-gray-300 bg-white text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="TODOS">Todos os Blocos</option>
                    {availableBlocos.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              )}`;

code = code.replace(searchStr, newUI);

// Now add the "Finalizar Entrega" button near the AutoReportsViewer
const searchStr2 = `{isAutoReport(reportType) && (
              <AutoReportsViewer`;

const newUI2 = `{isAutoReport(reportType) && reportType === "auto_entrega" && (
              <div className="mb-4 flex justify-end print:hidden">
                <button
                  onClick={handleFinalizarEntrega}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium shadow-sm transition-colors"
                >
                  <FileText className="w-5 h-5" />
                  Finalizar Entrega e Salvar no Histórico
                </button>
              </div>
            )}
            {isAutoReport(reportType) && (
              <AutoReportsViewer`;

code = code.replace(searchStr2, newUI2);

fs.writeFileSync('src/components/RelatoriosModule.tsx', code);
