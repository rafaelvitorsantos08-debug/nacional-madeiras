const fs = require('fs');
let code = fs.readFileSync('src/components/ControleOperacaoModule.tsx', 'utf8');

const regexModal = /\{modalEfetivoOpen && \([\s\S]*?<\/div>\n\s*<\/div>\n\s*\)\}/;

const replacementModal = `{modalEfetivoOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm shadow-2xl">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {isEditColaboradoresOpen ? (
              <>
                <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                  <div className="flex flex-col">
                    <h3 className="font-bold text-gray-800">
                      Editar Efetivo
                    </h3>
                  </div>
                  <button onClick={() => setIsEditColaboradoresOpen(false)} className="text-gray-500 hover:text-gray-800 rounded p-1 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-4 flex-1 overflow-y-auto max-h-[60vh] space-y-3">
                  <div className="flex items-center gap-2 mb-4">
                    <input 
                      type="text" 
                      placeholder="Novo nome..." 
                      className="flex-1 p-2 border border-gray-300 rounded outline-none focus:ring-2 focus:ring-blue-500" 
                      value={newColaboradorName} 
                      onChange={(e) => setNewColaboradorName(e.target.value)} 
                      onKeyDown={(e) => {
                        if(e.key === 'Enter' && newColaboradorName.trim()) {
                           const name = newColaboradorName.trim();
                           if (!colaboradoresState.includes(name)) {
                             setColaboradoresState([...colaboradoresState, name]);
                           }
                           setNewColaboradorName('');
                        }
                      }}
                    />
                    <button 
                      onClick={() => {
                         const name = newColaboradorName.trim();
                         if (name && !colaboradoresState.includes(name)) {
                           setColaboradoresState([...colaboradoresState, name]);
                         }
                         setNewColaboradorName('');
                      }} 
                      className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  {COLABORADORES.map(c => (
                    <div key={c} className="flex items-center justify-between border-b border-gray-100 pb-2">
                      <span className="text-sm font-medium text-gray-700 line-clamp-1">{c}</span>
                      <button 
                        onClick={() => {
                           if (confirm("Deseja realmente excluir " + c + "?")) {
                             setColaboradoresState(colaboradoresState.filter(x => x !== c));
                           }
                        }} 
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-800">
                        Efetivo em {modalEfetivoOpen.dateStr}
                      </h3>
                      <button onClick={() => setIsEditColaboradoresOpen(true)} className="text-gray-400 hover:text-gray-800 transition-colors" title="Editar Lista de Efetivo">
                        <Settings className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        const updates = {};
                        COLABORADORES.forEach(c => {
                          updates["efetivo_colab_" + c] = 'Outros Serviços';
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
                  </div>
                  <button onClick={() => setModalEfetivoOpen(null)} className="text-gray-500 hover:text-red-500 rounded p-1 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-4 flex-1 overflow-y-auto max-h-[60vh] space-y-3">
                  {COLABORADORES.map(c => (
                    <div key={c} className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700 w-1/3 line-clamp-1">{c}</label>
                      <select
                        value={operacaoData[modalEfetivoOpen.dateStrKey]?.[("efetivo_colab_" + c)] || ''}
                        onChange={e => handleInputChange(modalEfetivoOpen.dateStrKey, ("efetivo_colab_" + c), e.target.value)}
                        className="w-2/3 p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                      >
                        <option value="">Não trabalhou</option>
                        {SETORES_EFETIVO.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                        <option value="Falta">Falta</option>
                        <option value="Atestado">Atestado</option>
                        <option value="Férias">Férias</option>
                        <option value="Folga">Folga</option>
                      </select>
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center shrink-0">
                  <span className="font-bold text-gray-500 uppercase text-xs">Total Diário:</span>
                  <span className="font-bold text-lg text-blue-600 bg-blue-100 px-3 py-1 rounded-lg">
                    {getDayEfetivoTotal(modalEfetivoOpen.dateStrKey) || 0}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      )}`;

code = code.replace(regexModal, replacementModal);
fs.writeFileSync('src/components/ControleOperacaoModule.tsx', code);
