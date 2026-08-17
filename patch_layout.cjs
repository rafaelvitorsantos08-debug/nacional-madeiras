const fs = require('fs');

const filePath = 'src/components/EntradaSaidaObras.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

const newLayout = `  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50 dark:bg-gray-950 overflow-hidden rounded-bl-xl rounded-br-xl">
      {/* Top Header Controls */}
      <div className="p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shrink-0 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 w-full sm:w-auto">
            <div className="flex flex-col gap-1 flex-1 max-w-sm">
              <label className="text-[11px] font-bold text-gray-500 uppercase">Selecionar Obra:</label>
              <select 
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 font-semibold focus:ring-2 focus:ring-brand-green outline-none transition-shadow"
                value={selectedObraId || ''}
                onChange={(e) => setSelectedObraId(e.target.value)}
              >
                {obrasList.length === 0 && <option value="" disabled>Nenhuma obra cadastrada</option>}
                {obrasList.map(o => <option key={o.id} value={o.id}>{o.nome || 'Sem Nome'}</option>)}
              </select>
            </div>
            <button onClick={adicionarObra} className="mt-5 flex justify-center items-center px-4 py-2 text-sm font-bold text-white bg-brand-green rounded-lg hover:bg-green-700 transition-colors shadow-sm whitespace-nowrap">
              <Plus className="w-4 h-4 mr-1"/> Nova Obra
            </button>
          </div>
          {activeObra && (
             <button onClick={() => deletarObra(activeObra.id)} className="mt-5 sm:mt-0 px-3 py-2 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-900/30 transition-colors flex items-center gap-1 whitespace-nowrap">
                <Trash2 className="w-4 h-4" /> Excluir Obra
             </button>
          )}
        </div>

        {activeObra && (
           <div className="flex items-center gap-3 bg-blue-50/50 dark:bg-blue-900/10 p-3 rounded-lg border border-blue-100 dark:border-blue-900/30">
             <Target className="w-5 h-5 text-blue-500 shrink-0" />
             <input 
                type="text" 
                value={activeObra.nome}
                onChange={(e) => {
                   setObrasV6(prev => {
                      const o = prev[activeObra.id];
                      if (!o) return prev;
                      return { ...prev, [activeObra.id]: { ...o, nome: e.target.value } };
                   });
                }}
                className="text-xl font-bold text-gray-800 dark:text-gray-100 bg-transparent border-b-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600 focus:border-blue-500 outline-none w-full px-1 py-1 transition-colors"
                placeholder="Nome da Obra"
             />
           </div>
        )}
      </div>

      {/* Conteúdo da Obra Selecionada */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeObra ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Abas dos Materiais */}
            <div className="px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex space-x-2 shrink-0">
              <button 
                onClick={() => setActiveTab('folhas')}
                className={cn("px-5 py-2 rounded-md text-sm font-bold transition-colors", activeTab === 'folhas' ? "bg-brand-green text-white shadow-sm" : "text-gray-600 hover:bg-gray-100 bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700")}
              >
                Folhas de Porta
              </button>
              <button 
                onClick={() => setActiveTab('aduelas')}
                className={cn("px-5 py-2 rounded-md text-sm font-bold transition-colors", activeTab === 'aduelas' ? "bg-brand-green text-white shadow-sm" : "text-gray-600 hover:bg-gray-100 bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700")}
              >
                Aduelas
              </button>
              <button 
                onClick={() => setActiveTab('alizares')}
                className={cn("px-5 py-2 rounded-md text-sm font-bold transition-colors", activeTab === 'alizares' ? "bg-brand-green text-white shadow-sm" : "text-gray-600 hover:bg-gray-100 bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700")}
              >
                Alizares
              </button>
            </div>
            
            {/* Tabela */}
            {renderTable()}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
            <Target className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-medium text-gray-600">Selecione ou Crie uma Obra</h3>
            <p className="mt-2 text-center max-w-sm">Utilize os controles na parte superior para gerenciar as obras.</p>
          </div>
        )}
      </div>

      <style>{\`
        .text-center-select {
          text-align-last: center;
        }
      \`}</style>
      <datalist id="dimensoes_porta_list">
        {DIMENSOES_PORTA.map(op => <option key={op} value={op} />)}
      </datalist>
      <datalist id="medida_aduela_list">
        {LARGURAS_ADUELA.flatMap(largura => COMPRIMENTOS_ADUELA.map(comprimento => (
          <option key={\`\${largura}x\${comprimento}\`} value={\`\${largura}x\${comprimento}\`} />
        )))}
      </datalist>
      <datalist id="medida_alizar_list">
        {FACE_ALIZAR.flatMap(face => ABA_ALIZAR.flatMap(aba => 
            ESPESSURA_ALIZAR.filter(esp => esp === '10' || esp === '15').flatMap(espessura => 
              COMPRIMENTOS_ALIZAR.map(comprimento => (
                <option key={\`\${face}x\${aba}x\${espessura}x\${comprimento}\`} value={\`\${face}x\${aba}x\${espessura}x\${comprimento}\`} />
              ))
            )
          )
        )}
      </datalist>
    </div>
  );
}
`;

const startIndex = content.indexOf('  return (\n    <div className="flex-1 flex max-h-[850px] overflow-hidden rounded-bl-xl rounded-br-xl">');
if (startIndex !== -1) {
    content = content.slice(0, startIndex) + newLayout;
    fs.writeFileSync(filePath, content);
    console.log('Layout patched successfully.');
} else {
    console.log('Failed to find start index.');
}
