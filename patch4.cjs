const fs = require('fs');
let code = fs.readFileSync('src/components/ControleOperacaoModule.tsx', 'utf8');

const regex = /<h3 className="font-bold text-gray-800">\s*Efetivo em \{modalEfetivoOpen\.dateStr\}\s*<\/h3>/;

const replacement = `<div className="flex flex-col">
                <h3 className="font-bold text-gray-800">
                  Efetivo em {modalEfetivoOpen.dateStr}
                </h3>
                <button
                  onClick={() => {
                    const updates = {};
                    COLABORADORES.forEach(c => {
                      updates[\`efetivo_colab_\${c}\`] = 'Outros Serviços';
                    });
                    setOperacaoData(prev => ({
                      ...prev,
                      [modalEfetivoOpen.dateStrKey]: {
                        ...(prev[modalEfetivoOpen.dateStrKey] || {}),
                        ...updates
                      }
                    }));
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800 text-left mt-1 underline"
                >
                  Aplicar "Outros Serviços" a todos
                </button>
              </div>`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/components/ControleOperacaoModule.tsx', code);
