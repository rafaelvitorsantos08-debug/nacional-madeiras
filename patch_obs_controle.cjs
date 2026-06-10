const fs = require('fs');
const file = 'src/components/ControleOperacaoModule.tsx';
let code = fs.readFileSync(file, 'utf8');

const importStr = "import { Package, Truck, Target, Plus, Download, Home, Trash2, X, FileText, History, Info, MessageSquareQuote } from 'lucide-react';";
code = code.replace("import { Package, Truck, Target, Plus, Download, Home, Trash2, X, FileText, History, Info } from 'lucide-react';", importStr);

// In handleChangeItem, it already supports generic updates (field, value).
// Just add the button in the Actions column.

const rowActions = `                          <td className="p-2 text-center flex items-center justify-center gap-1 h-full min-h-[44px] print:hidden">
                            <button
                              onClick={() => {
                                const newVal = window.prompt("Comentário / Observação:", item.observacao || "");
                                if (newVal !== null) {
                                  handleChangeItem(activeObra.id, item.id, 'observacao', newVal);
                                }
                              }}
                              className={"p-2 rounded-md transition-colors " + (item.observacao ? "text-amber-500 bg-amber-50 hover:bg-amber-100" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100")}
                              title={item.observacao || "Adicionar Comentário"}
                            >
                              <MessageSquareQuote className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => deletarItem(activeObra.id, item.id)}
                              className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                              title="Remover linha"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </td>`;

code = code.replace(/<td className="p-2 text-center flex items-center justify-center gap-1 h-full min-h-\[44px\] print:hidden">[\s\S]*?<\/td>/, rowActions);

fs.writeFileSync(file, code);
