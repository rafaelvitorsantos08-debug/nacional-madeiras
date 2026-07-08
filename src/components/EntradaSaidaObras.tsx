import React, { useState, useEffect } from 'react';
import { cn } from '../lib/utils';
import { Target, Plus, Trash2, X, Info, MessageSquare } from 'lucide-react';
import { useLocalStorage, DIMENSOES_PORTA, CORES, MODELOS_PORTA, ENCHIMENTOS_PORTA, LARGURAS_ADUELA, COMPRIMENTOS_ADUELA, FACE_ALIZAR, ESPESSURA_ALIZAR, COMPRIMENTOS_ALIZAR } from './EstoqueModule';

export function EntradaSaidaObras({ globalSearch = '' }: { globalSearch?: string }) {
  const [obrasV6, setObrasV6] = useLocalStorage<Record<string, any>>('nm_entrada_obras_v6', {});
  const [selectedObraId, setSelectedObraId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'folhas' | 'aduelas' | 'alizares'>('folhas');

  // Migration from v4 to v6
  useEffect(() => {
    const v4Data = localStorage.getItem('nm_entrada_obras_v4');
    const v6Data = localStorage.getItem('nm_entrada_obras_v6');
    
    if (v4Data && (!v6Data || Object.keys(JSON.parse(v6Data)).length === 0)) {
      try {
        const parsedV4 = JSON.parse(v4Data);
        const migrated: Record<string, any> = {};
        
        for (const obraId in parsedV4) {
          const o = parsedV4[obraId];
          const today = new Date().toISOString().split('T')[0];
          
          const baseItems = o.itens || [];
          
          const itensFolhas = baseItems.filter((i:any) => i.folhas || i.dimensao).map((item:any) => {
             const sf = (item.saidas || []).filter((s:any) => s.tipo === 'folhas').reduce((acc:number, s:any) => acc + (parseInt(s.quantidade)||0), 0);
             return {
                 id: 'f_' + item.id,
                 dimensao: item.dimensao || '',
                 cor: item.cor || '',
                 enchimento: item.enchimento || '',
                 modelo: item.modelo || '',
                 entradas: { 'ce_f_1': item.folhas || '' },
                 saidas: { 'cs_f_1': sf > 0 ? String(sf) : '' },
             };
          });

          const itensAduelas = baseItems.filter((i:any) => i.aduelas || i.medidaAduela).map((item:any) => {
             const sad = (item.saidas || []).filter((s:any) => s.tipo === 'aduelas').reduce((acc:number, s:any) => acc + (parseInt(s.quantidade)||0), 0);
             return {
                 id: 'ad_' + item.id,
                 medidaAduela: item.medidaAduela || '',
                 cor: item.cor || '',
                 entradas: { 'ce_ad_1': item.aduelas || '' },
                 saidas: { 'cs_ad_1': sad > 0 ? String(sad) : '' },
             };
          });

          const itensAlizares = baseItems.filter((i:any) => i.alizares || i.medidaAlizar).map((item:any) => {
             const sal = (item.saidas || []).filter((s:any) => s.tipo === 'alizares').reduce((acc:number, s:any) => acc + (parseInt(s.quantidade)||0), 0);
             return {
                 id: 'al_' + item.id,
                 medidaAlizar: item.medidaAlizar || '',
                 cor: item.cor || '',
                 entradas: { 'ce_al_1': item.alizares || '' },
                 saidas: { 'cs_al_1': sal > 0 ? String(sal) : '' },
             };
          });

          migrated[obraId] = {
            id: o.id,
            nome: o.nome,
            cargasEntradaFolhas: [{ id: 'ce_f_1', nome: '1ª Carga', data: today }],
            cargasSaidaFolhas: [{ id: 'cs_f_1', nome: '1ª Saída', data: today }],
            cargasEntradaAduelas: [{ id: 'ce_ad_1', nome: '1ª Carga', data: today }],
            cargasSaidaAduelas: [{ id: 'cs_ad_1', nome: '1ª Saída', data: today }],
            cargasEntradaAlizares: [{ id: 'ce_al_1', nome: '1ª Carga', data: today }],
            cargasSaidaAlizares: [{ id: 'cs_al_1', nome: '1ª Saída', data: today }],
            itensFolhas,
            itensAduelas,
            itensAlizares
          };
        }
        setObrasV6(migrated);
      } catch (e) {
        console.error("Erro ao migrar dados da v4 para v6", e);
      }
    }
  }, []);

  const obrasList = Object.values(obrasV6 || {})
    .filter((obra: any) => {
       if (!globalSearch) return true;
       const searchLower = globalSearch.toLowerCase();
       const inNome = (obra.nome || '').toLowerCase().includes(searchLower);
       const inItens = ['itensFolhas', 'itensAduelas', 'itensAlizares'].some(k => 
         (obra[k] || []).some((i: any) => 
           (i.dimensao || '').toLowerCase().includes(searchLower) ||
           (i.cor || '').toLowerCase().includes(searchLower) ||
           (i.medidaAduela || '').toLowerCase().includes(searchLower) ||
           (i.medidaAlizar || '').toLowerCase().includes(searchLower)
         )
       );
       return inNome || inItens;
    })
    .sort((a: any, b: any) => (a.nome || '').localeCompare(b.nome || ''));

  useEffect(() => {
    if (!selectedObraId && obrasList.length > 0) {
      setSelectedObraId((obrasList[0] as any).id);
    }
  }, [obrasList.length, selectedObraId]);

  const activeObra = selectedObraId ? obrasV6[selectedObraId] : null;

  const adicionarObra = () => {
    const nome = window.prompt('Digite o nome da nova obra:');
    if (!nome) return;
    const id = Date.now().toString();
    const today = new Date().toISOString().split('T')[0];
    
    setObrasV6(prev => ({
      ...prev,
      [id]: {
         id,
         nome,
         cargasEntradaFolhas: [{ id: 'ce_f_1', nome: '1ª Carga', data: today }],
         cargasSaidaFolhas: [{ id: 'cs_f_1', nome: '1ª Saída', data: today }],
         cargasEntradaAduelas: [{ id: 'ce_ad_1', nome: '1ª Carga', data: today }],
         cargasSaidaAduelas: [{ id: 'cs_ad_1', nome: '1ª Saída', data: today }],
         cargasEntradaAlizares: [{ id: 'ce_al_1', nome: '1ª Carga', data: today }],
         cargasSaidaAlizares: [{ id: 'cs_al_1', nome: '1ª Saída', data: today }],
         itensFolhas: [{ id: 'f_'+Date.now(), dimensao: '', cor: '', enchimento: '', modelo: '', entradas: {}, saidas: {} }],
         itensAduelas: [{ id: 'ad_'+Date.now(), medidaAduela: '', cor: '', entradas: {}, saidas: {} }],
         itensAlizares: [{ id: 'al_'+Date.now(), medidaAlizar: '', cor: '', entradas: {}, saidas: {} }]
      }
    }));
    setSelectedObraId(id);
  };

  const deletarObra = (id: string) => {
    if(!window.confirm('Tem certeza que deseja excluir esta obra?')) return;
    setObrasV6(prev => {
      const novas = { ...prev };
      delete novas[id];
      return novas;
    });
    if (selectedObraId === id) setSelectedObraId(null);
  };

  const updateObra = (fn: (obra: any) => any) => {
    if (!selectedObraId) return;
    setObrasV6(prev => {
      const obra = prev[selectedObraId];
      if (!obra) return prev;
      return { ...prev, [selectedObraId]: fn(obra) };
    });
  };

  const adicionarColuna = (tipo: 'Entrada' | 'Saida', aba: 'Folhas' | 'Aduelas' | 'Alizares') => {
    const today = new Date().toISOString().split('T')[0];
    const targetField = `cargas${tipo}${aba}`;
    
    updateObra(obra => {
       const cargas = obra[targetField] || [];
       const count = cargas.length + 1;
       const nova = {
         id: `c_${tipo.charAt(0).toLowerCase()}_${aba.charAt(0).toLowerCase()}_${Date.now()}`,
         nome: `${count}ª ${tipo === 'Entrada' ? 'Carga' : 'Saída'}`,
         data: today
       };
       return { ...obra, [targetField]: [...cargas, nova] };
    });
  };

  const removerColuna = (tipo: 'Entrada' | 'Saida', aba: 'Folhas' | 'Aduelas' | 'Alizares', cargaId: string) => {
    if(!window.confirm('Excluir esta coluna e todos os seus dados?')) return;
    
    const targetField = `cargas${tipo}${aba}`;
    const propMap = tipo === 'Entrada' ? 'entradas' : 'saidas';
    const listField = `itens${aba}`;

    updateObra(obra => {
       const novasCargas = (obra[targetField] || []).filter((c:any) => c.id !== cargaId);
       
       const novosItens = (obra[listField] || []).map((it:any) => {
          const newMap = { ...(it[propMap] || {}) };
          delete newMap[cargaId];
          return { ...it, [propMap]: newMap };
       });

       return { ...obra, [targetField]: novasCargas, [listField]: novosItens };
    });
  };

  const handleChangeItemField = (itemId: string, field: string, value: string) => {
    const abaCapitalized = activeTab.charAt(0).toUpperCase() + activeTab.slice(1);
    const listField = `itens${abaCapitalized}`;
    updateObra(obra => ({
      ...obra,
      [listField]: (obra[listField] || []).map((it: any) => it.id === itemId ? { ...it, [field]: value } : it)
    }));
  };

  const handleChangeQty = (itemId: string, propMap: string, cargaId: string, value: string) => {
    const abaCapitalized = activeTab.charAt(0).toUpperCase() + activeTab.slice(1);
    const listField = `itens${abaCapitalized}`;
    updateObra(obra => ({
      ...obra,
      [listField]: (obra[listField] || []).map((it: any) => {
        if (it.id === itemId) {
          return {
            ...it,
            [propMap]: {
               ...(it[propMap] || {}),
               [cargaId]: value
            }
          };
        }
        return it;
      })
    }));
  };

  const handleChangeComment = (itemId: string, type: 'entradas'|'saidas', cargaId: string, comment: string) => {
    const abaCapitalized = activeTab.charAt(0).toUpperCase() + activeTab.slice(1);
    const listField = `itens${abaCapitalized}`;
    updateObra(obra => ({
      ...obra,
      [listField]: (obra[listField] || []).map((it: any) => {
        if (it.id === itemId) {
           const commentKey = `${type}_${cargaId}`;
           const newComentarios = { ...(it.comentarios || {}) };
           if (comment) {
             newComentarios[commentKey] = comment;
           } else {
             delete newComentarios[commentKey];
           }
           return { ...it, comentarios: newComentarios };
        }
        return it;
      })
    }));
  };

  const handleCommentClick = (itemId: string, type: 'entradas'|'saidas', cargaId: string, currentComment: string) => {
    const comment = window.prompt("Comentário da célula (deixe em branco para remover):", currentComment || '');
    if (comment !== null) {
      handleChangeComment(itemId, type, cargaId, comment);
    }
  };

  const adicionarLinha = () => {
    const abaCapitalized = activeTab.charAt(0).toUpperCase() + activeTab.slice(1);
    const listField = `itens${abaCapitalized}`;
    
    updateObra(obra => {
      let newItem: any = { id: Date.now().toString(), entradas: {}, saidas: {} };
      if (activeTab === 'folhas') {
        newItem = { ...newItem, dimensao: '', cor: '', enchimento: '', modelo: '' };
      } else if (activeTab === 'aduelas') {
        newItem = { ...newItem, medidaAduela: '', cor: '' };
      } else {
        newItem = { ...newItem, medidaAlizar: '', cor: '' };
      }
      
      return {
        ...obra,
        [listField]: [...(obra[listField] || []), newItem]
      };
    });
  };

  const deletarLinha = (itemId: string) => {
    if(!window.confirm('Excluir esta linha?')) return;
    const abaCapitalized = activeTab.charAt(0).toUpperCase() + activeTab.slice(1);
    const listField = `itens${abaCapitalized}`;
    
    updateObra(obra => ({
      ...obra,
      [listField]: (obra[listField] || []).filter((it: any) => it.id !== itemId)
    }));
  };

  const renderTable = () => {
    if (!activeObra) return null;
    
    const abaCapitalized = activeTab.charAt(0).toUpperCase() + activeTab.slice(1) as 'Folhas' | 'Aduelas' | 'Alizares';
    const listField = `itens${abaCapitalized}`;
    const currentItens = [...(activeObra[listField] || [])].sort((a, b) => {
      let valA = '';
      let valB = '';
      if (activeTab === 'folhas') {
        valA = a.dimensao || '';
        valB = b.dimensao || '';
      } else if (activeTab === 'aduelas') {
        valA = a.medidaAduela || '';
        valB = b.medidaAduela || '';
      } else if (activeTab === 'alizares') {
        valA = a.medidaAlizar || '';
        valB = b.medidaAlizar || '';
      }
      
      const parseDim = (str: string) => str.split(/[xX]/).map(n => parseInt(n) || 0);
      const numsA = parseDim(valA);
      const numsB = parseDim(valB);
      
      for (let i = 0; i < Math.max(numsA.length, numsB.length); i++) {
        const nA = numsA[i] || 0;
        const nB = numsB[i] || 0;
        if (nA !== nB) return nA - nB;
      }
      return valA.localeCompare(valB);
    });
    
    const cargasEntrada = activeObra[`cargasEntrada${abaCapitalized}`] || [];
    const cargasSaida = activeObra[`cargasSaida${abaCapitalized}`] || [];
    
    let specHeaders = [];
    if (activeTab === 'folhas') specHeaders = ['DIMENSÃO', 'COR', 'ENCHIMENTO', 'MODELO'];
    else if (activeTab === 'aduelas') specHeaders = ['MEDIDA ADUELA', 'COR'];
    else specHeaders = ['FACE/MEDIDA ALIZAR', 'COR'];

    const getTotalForColumn = (items: any[], type: 'entradas' | 'saidas', cargaId: string) => {
      return items.reduce((acc, item) => acc + (parseInt(item[type]?.[cargaId]) || 0), 0);
    };

    const getTotalSaldo = (items: any[]) => {
       return items.reduce((acc: number, item: any) => {
         const totalEntradas = Object.values(item.entradas || {}).reduce((sum: number, v: any) => sum + (parseInt(v) || 0), 0) as number;
         const totalSaidas = Object.values(item.saidas || {}).reduce((sum: number, v: any) => sum + (parseInt(v) || 0), 0) as number;
         return acc + (totalEntradas - totalSaidas);
       }, 0);
    };

    return (
      <div className="flex-1 overflow-auto bg-gray-50 p-4 w-full">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-x-auto w-full">
          <table className="w-full text-center text-sm border-collapse min-w-max">
            <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-b border-gray-300 dark:border-gray-700 sticky top-0 z-10 shadow-sm">
              <tr>
                <th colSpan={specHeaders.length} className="p-3 border-r border-gray-300 dark:border-gray-700 font-bold bg-gray-100 dark:bg-gray-800">
                  ESPECIFICAÇÕES
                </th>
                <th colSpan={cargasEntrada.length + 1} className="p-3 border-r border-gray-300 dark:border-gray-700 font-bold bg-blue-50 text-blue-800 dark:bg-blue-900/60 dark:text-blue-100">
                  ENTRADAS (CARGAS)
                </th>
                <th colSpan={cargasSaida.length + 1} className="p-3 border-r border-gray-300 dark:border-gray-700 font-bold bg-purple-50 text-purple-800 dark:bg-purple-900/60 dark:text-purple-100">
                  SAÍDAS (PRODUÇÃO)
                </th>
                <th className="p-3 font-bold bg-gray-100 border-r border-gray-300 dark:bg-gray-800 dark:border-gray-700 text-gray-800 dark:text-gray-100">
                  SALDO
                </th>
                <th className="p-3 font-bold bg-gray-100 dark:bg-gray-800 w-12">
                  AÇÕES
                </th>
              </tr>
              <tr className="border-t border-gray-200 dark:border-gray-700">
                {specHeaders.map(h => <th key={h} className="p-2 border-r border-gray-300 dark:border-gray-700 font-bold text-xs">{h}</th>)}
                
                {/* Entradas */}
                {cargasEntrada.map((c: any) => {
                  const total = getTotalForColumn(currentItens, 'entradas', c.id);
                  return (
                  <th key={c.id} className="p-2 border-r border-gray-300 dark:border-gray-700 font-bold text-xs bg-blue-50/50 dark:bg-blue-900/40 w-[100px] relative group">
                    <button onClick={() => removerColuna('Entrada', abaCapitalized, c.id)} className="absolute top-1 right-1 text-red-500 bg-white dark:bg-gray-800 rounded-full shadow-sm hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 z-10" title="Excluir Coluna">
                       <X className="w-3 h-3"/>
                    </button>
                    <div className="flex flex-col items-center justify-center">
                      <span>{c.nome}</span>
                      <span className="text-[10px] font-normal text-gray-500">{new Date(`${c.data}T12:00:00`).toLocaleDateString('pt-BR')}</span>
                      <span className="mt-1 bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100 text-[10px] px-1.5 py-0.5 rounded-full font-bold">Total: {total}</span>
                    </div>
                  </th>
                )})}
                <th className="p-2 border-r border-gray-300 dark:border-gray-700 bg-blue-50/50 dark:bg-blue-900/40">
                  <button onClick={() => adicionarColuna('Entrada', abaCapitalized)} className="flex flex-col items-center justify-center w-full h-full text-blue-600 hover:text-blue-800 transition-colors" title="Adicionar nova carga">
                    <Plus className="w-4 h-4"/>
                    <span className="text-[10px]">Carga</span>
                  </button>
                </th>

                {/* Saídas */}
                {cargasSaida.map((c: any) => {
                  const total = getTotalForColumn(currentItens, 'saidas', c.id);
                  return (
                  <th key={c.id} className="p-2 border-r border-gray-300 dark:border-gray-700 font-bold text-xs bg-purple-50/50 dark:bg-purple-900/40 w-[100px] relative group">
                    <button onClick={() => removerColuna('Saida', abaCapitalized, c.id)} className="absolute top-1 right-1 text-red-500 bg-white dark:bg-gray-800 rounded-full shadow-sm hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 z-10" title="Excluir Coluna">
                       <X className="w-3 h-3"/>
                    </button>
                    <div className="flex flex-col items-center justify-center">
                      <span>{c.nome}</span>
                      <span className="text-[10px] font-normal text-gray-500">{new Date(`${c.data}T12:00:00`).toLocaleDateString('pt-BR')}</span>
                      <span className="mt-1 bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100 text-[10px] px-1.5 py-0.5 rounded-full font-bold">Total: {total}</span>
                    </div>
                  </th>
                )})}
                <th className="p-2 border-r border-gray-300 dark:border-gray-700 bg-purple-50/50 dark:bg-purple-900/40">
                  <button onClick={() => adicionarColuna('Saida', abaCapitalized)} className="flex flex-col items-center justify-center w-full h-full text-purple-600 hover:text-purple-800 transition-colors" title="Adicionar nova saída">
                    <Plus className="w-4 h-4"/>
                    <span className="text-[10px]">Saída</span>
                  </button>
                </th>

                <th className="p-2 border-r border-gray-300 dark:border-gray-700 font-bold text-xs">
                  <div className="flex flex-col items-center justify-center">
                    <span>RESTOU</span>
                    <span className="mt-1 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100 text-[10px] px-1.5 py-0.5 rounded-full font-bold">Total: {getTotalSaldo(currentItens)}</span>
                  </div>
                </th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {currentItens.length === 0 ? (
                <tr>
                  <td colSpan={specHeaders.length + cargasEntrada.length + cargasSaida.length + 4} className="p-8 text-center text-gray-500">
                    Nenhum item cadastrado.
                  </td>
                </tr>
              ) : (
                currentItens.map((item: any) => {
                  
                  const mapEntradas = item.entradas || {};
                  const mapSaidas = item.saidas || {};
                  
                  const totalEntradas = Object.values(mapEntradas).reduce((acc: number, v: any) => acc + (parseInt(v) || 0), 0) as number;
                  const totalSaidas = Object.values(mapSaidas).reduce((acc: number, v: any) => acc + (parseInt(v) || 0), 0) as number;
                  const saldo = totalEntradas - totalSaidas;

                  return (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group h-[48px]">
                      {activeTab === 'folhas' && (
                        <>
                          <td className="p-0 border-r border-gray-300 dark:border-gray-700 relative">
                            <input type="text" list="dimensoes_porta_list" value={item.dimensao || ''} onChange={e => handleChangeItemField(item.id, 'dimensao', e.target.value)} placeholder="Dimensão" className="w-full h-full min-h-[44px] p-2 text-center bg-transparent border-none outline-none focus:ring-2 focus:ring-inset focus:ring-brand-green font-medium text-gray-800 dark:text-gray-100 text-sm" />
                          </td>
                          <td className="p-0 border-r border-gray-300 dark:border-gray-700 relative">
                            <select value={item.cor || ''} onChange={e => handleChangeItemField(item.id, 'cor', e.target.value)} className="w-full h-full min-h-[44px] p-2 text-center bg-transparent border-none outline-none focus:ring-2 focus:ring-inset focus:ring-brand-green text-sm text-gray-800 dark:text-gray-100 appearance-none text-center-select">
                              <option value="">Selecione...</option>
                              {CORES.map(op => <option key={op} value={op}>{op}</option>)}
                            </select>
                          </td>
                          <td className="p-0 border-r border-gray-300 dark:border-gray-700 relative">
                            <select value={item.enchimento || ''} onChange={e => handleChangeItemField(item.id, 'enchimento', e.target.value)} className="w-full h-full min-h-[44px] p-2 text-center bg-transparent border-none outline-none focus:ring-2 focus:ring-inset focus:ring-brand-green text-sm text-gray-800 dark:text-gray-100 appearance-none text-center-select">
                              <option value="">Selecione...</option>
                              {ENCHIMENTOS_PORTA.map(op => <option key={op} value={op}>{op}</option>)}
                            </select>
                          </td>
                          <td className="p-0 border-r border-gray-300 dark:border-gray-700 relative">
                            <select value={item.modelo || ''} onChange={e => handleChangeItemField(item.id, 'modelo', e.target.value)} className="w-full h-full min-h-[44px] p-2 text-center bg-transparent border-none outline-none focus:ring-2 focus:ring-inset focus:ring-brand-green text-sm text-gray-800 dark:text-gray-100 appearance-none text-center-select">
                              <option value="">Selecione...</option>
                              {MODELOS_PORTA.map(op => <option key={op} value={op}>{op}</option>)}
                            </select>
                          </td>
                        </>
                      )}
                      
                      {activeTab === 'aduelas' && (
                        <>
                          <td className="p-0 border-r border-gray-300 dark:border-gray-700 relative w-[250px]">
                            <input type="text" list="medida_aduela_list" value={item.medidaAduela || ''} onChange={e => handleChangeItemField(item.id, 'medidaAduela', e.target.value)} placeholder="Medida Aduela" className="w-full h-full min-h-[44px] p-2 text-center bg-transparent border-none outline-none focus:ring-2 focus:ring-inset focus:ring-amber-500 font-medium text-gray-800 dark:text-gray-100 text-sm" />
                          </td>
                          <td className="p-0 border-r border-gray-300 dark:border-gray-700 relative">
                            <select value={item.cor || ''} onChange={e => handleChangeItemField(item.id, 'cor', e.target.value)} className="w-full h-full min-h-[44px] p-2 text-center bg-transparent border-none outline-none focus:ring-2 focus:ring-inset focus:ring-amber-500 text-sm text-gray-800 dark:text-gray-100 appearance-none text-center-select">
                              <option value="">Selecione...</option>
                              {CORES.map(op => <option key={op} value={op}>{op}</option>)}
                            </select>
                          </td>
                        </>
                      )}
                      
                      {activeTab === 'alizares' && (
                        <>
                          <td className="p-0 border-r border-gray-300 dark:border-gray-700 relative w-[250px]">
                            <input type="text" list="medida_alizar_list" value={item.medidaAlizar || ''} onChange={e => handleChangeItemField(item.id, 'medidaAlizar', e.target.value)} placeholder="Face/Medida" className="w-full h-full min-h-[44px] p-2 text-center bg-transparent border-none outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500 font-medium text-gray-800 dark:text-gray-100 text-sm" />
                          </td>
                          <td className="p-0 border-r border-gray-300 dark:border-gray-700 relative">
                            <select value={item.cor || ''} onChange={e => handleChangeItemField(item.id, 'cor', e.target.value)} className="w-full h-full min-h-[44px] p-2 text-center bg-transparent border-none outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500 text-sm text-gray-800 dark:text-gray-100 appearance-none text-center-select">
                              <option value="">Selecione...</option>
                              {CORES.map(op => <option key={op} value={op}>{op}</option>)}
                            </select>
                          </td>
                        </>
                      )}

                      {/* Entradas */}
                      {cargasEntrada.map((c: any) => {
                        const commentKey = `entradas_${c.id}`;
                        const comment = item.comentarios?.[commentKey] || '';
                        const hasComment = !!comment;
                        return (
                          <td key={c.id} className={cn("p-0 border-r border-gray-300 dark:border-gray-700 relative group", hasComment ? "bg-red-600 hover:bg-red-700" : "bg-blue-50/30 dark:bg-blue-900/20 hover:bg-blue-100/50 dark:hover:bg-blue-900/50")}>
                            <input 
                              type="number"
                              min="0"
                              value={mapEntradas[c.id] || ''}
                              onChange={e => handleChangeQty(item.id, 'entradas', c.id, e.target.value)}
                              className={cn("w-full h-full min-h-[44px] p-2 text-center bg-transparent border-none outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 font-bold", hasComment ? "text-white placeholder-red-200" : "text-blue-900 dark:text-blue-100")}
                              placeholder="-"
                            />
                            <button 
                              onClick={() => handleCommentClick(item.id, 'entradas', c.id, comment)}
                              className={cn("absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity", hasComment ? "text-white opacity-100" : "text-gray-400 hover:text-blue-600")}
                              title={hasComment ? `Comentário: ${comment}` : "Adicionar Comentário"}
                            >
                              <MessageSquare className="w-3 h-3" />
                            </button>
                          </td>
                        );
                      })}
                      <td className="p-0 border-r border-gray-300 dark:border-gray-700 bg-gray-100/30"></td>

                      {/* Saídas */}
                      {cargasSaida.map((c: any) => {
                        const commentKey = `saidas_${c.id}`;
                        const comment = item.comentarios?.[commentKey] || '';
                        const hasComment = !!comment;
                        return (
                          <td key={c.id} className={cn("p-0 border-r border-gray-300 dark:border-gray-700 relative group", hasComment ? "bg-red-600 hover:bg-red-700" : "bg-purple-50/30 dark:bg-purple-900/20 hover:bg-purple-100/50 dark:hover:bg-purple-900/50")}>
                            <input 
                              type="number"
                              min="0"
                              value={mapSaidas[c.id] || ''}
                              onChange={e => handleChangeQty(item.id, 'saidas', c.id, e.target.value)}
                              className={cn("w-full h-full min-h-[44px] p-2 text-center bg-transparent border-none outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500 font-bold", hasComment ? "text-white placeholder-red-200" : "text-purple-900 dark:text-purple-100")}
                              placeholder="-"
                            />
                            <button 
                              onClick={() => handleCommentClick(item.id, 'saidas', c.id, comment)}
                              className={cn("absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity", hasComment ? "text-white opacity-100" : "text-gray-400 hover:text-purple-600")}
                              title={hasComment ? `Comentário: ${comment}` : "Adicionar Comentário"}
                            >
                              <MessageSquare className="w-3 h-3" />
                            </button>
                          </td>
                        );
                      })}
                      <td className="p-0 border-r border-gray-300 dark:border-gray-700 bg-gray-100/30"></td>

                      {/* Saldo */}
                      <td className={cn("p-2 border-r border-gray-300 dark:border-gray-700 font-bold text-base text-center", saldo < 0 ? "text-red-500 bg-red-50 dark:bg-red-900/20" : "text-gray-900 dark:text-gray-100")}>
                        {saldo}
                      </td>

                      <td className="p-2 text-center">
                        <button onClick={() => deletarLinha(item.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Remover linha">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex gap-2">
          <button onClick={adicionarLinha} className="flex items-center px-4 py-2 text-sm font-medium text-brand-green bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors shadow-sm">
            <Plus className="w-4 h-4 mr-2"/> Adicionar Linha ({abaCapitalized})
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex max-h-[850px] overflow-hidden rounded-bl-xl rounded-br-xl">
      {/* Sidebar de Obras */}
      <div className="w-64 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex flex-col h-full shrink-0">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex flex-col gap-2">
          <h2 className="font-bold text-gray-700 dark:text-gray-200 text-sm tracking-wide uppercase">OBRAS</h2>
          <button onClick={adicionarObra} className="flex justify-center items-center px-3 py-1.5 text-sm font-medium text-white bg-brand-green rounded-lg hover:bg-green-700 transition-colors shadow-sm">
            <Plus className="w-4 h-4 mr-1"/> Nova Obra
          </button>
        </div>
        <div className="flex-1 overflow-y-auto w-full max-w-full">
          {obrasList.length === 0 ? (
            <div className="p-6 text-center text-gray-500 text-sm">Nenhuma obra cadastrada.</div>
          ) : (
            obrasList.map((obra: any) => (
              <div 
                key={obra.id} 
                className={cn(
                  "border-b border-gray-100 dark:border-gray-800 group transition-colors flex justify-between",
                  selectedObraId === obra.id 
                    ? "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500" 
                    : "hover:bg-gray-50 dark:hover:bg-gray-800 border-l-4 border-l-transparent"
                )}
              >
                <div onClick={() => setSelectedObraId(obra.id)} className="flex-1 p-3 flex flex-col overflow-hidden cursor-pointer">
                  <span className={cn("font-semibold truncate sm:whitespace-normal", selectedObraId === obra.id ? "text-blue-800 dark:text-blue-200" : "text-gray-700 dark:text-gray-300")}>{obra.nome}</span>
                </div>
                <button onClick={() => deletarObra(obra.id)} className="p-3 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Conteúdo da Obra Selecionada */}
      <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-950 h-full overflow-hidden">
        {activeObra ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center shrink-0">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                 {activeObra.nome}
              </h2>
            </div>
            
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
            <h3 className="text-xl font-medium text-gray-600">Selecione uma Obra</h3>
            <p className="mt-2 text-center max-w-sm">Para gerenciar entradas e saídas de materiais, selecione uma obra na lista lateral ou crie uma nova.</p>
          </div>
        )}
      </div>

      <style>{`
        .text-center-select {
          text-align-last: center;
        }
      `}</style>

      <datalist id="dimensoes_porta_list">
        {DIMENSOES_PORTA.map(op => <option key={op} value={op} />)}
      </datalist>
      <datalist id="medida_aduela_list">
        {LARGURAS_ADUELA.flatMap(largura => COMPRIMENTOS_ADUELA.map(comprimento => (
          <option key={`${largura}x${comprimento}`} value={`${largura}x${comprimento}`} />
        )))}
      </datalist>
      <datalist id="medida_alizar_list">
        {FACE_ALIZAR.flatMap(face => ['40', '50', '60', '70', '80'].flatMap(aba => 
            ESPESSURA_ALIZAR.filter(esp => esp === '10' || esp === '15').flatMap(espessura => 
              COMPRIMENTOS_ALIZAR.map(comprimento => (
                <option key={`${face}x${aba}x${espessura}x${comprimento}`} value={`${face}x${aba}x${espessura}x${comprimento}`} />
              ))
            )
          )
        )}
      </datalist>
    </div>
  );
}
