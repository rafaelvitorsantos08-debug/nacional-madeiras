import React, { useState, useEffect } from 'react';
import { cn } from '../lib/utils';
import { Target, Plus, Trash2, X, Info, MessageSquare } from 'lucide-react';
import { useLocalStorage, DIMENSOES_PORTA, CORES, MODELOS_PORTA, ENCHIMENTOS_PORTA, LARGURAS_ADUELA, COMPRIMENTOS_ADUELA, FACE_ALIZAR, ESPESSURA_ALIZAR, COMPRIMENTOS_ALIZAR, ABA_ALIZAR } from './EstoqueModule';

export function EntradaSaidaObras({ globalSearch = '' }: { globalSearch?: string }) {
  const [obrasV6, setObrasV6] = useLocalStorage<Record<string, any>>('nm_entrada_obras_v6', {});
  const [selectedObraId, setSelectedObraId] = useLocalStorage<string>('nm_selected_obra_id', '');
  const [activeTab, setActiveTab] = useLocalStorage<'folhas' | 'aduelas' | 'alizares' | 'correr'>('nm_active_tab_obras', 'folhas');

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
            cargasEntradaCorrer: [{ id: 'ce_c_1', nome: '1ª Carga', data: today }],
            cargasSaidaCorrer: [{ id: 'cs_c_1', nome: '1ª Saída', data: today }],
            itensFolhas,
            itensAduelas,
            itensAlizares,
            itensCorrer: []
          };
        }
        setObrasV6(migrated);
      } catch (e) {
        console.error("Erro ao migrar dados da v4 para v6", e);
      }
    }
  }, []);

  const safeObrasV6 = (obrasV6 && typeof obrasV6 === 'object' && !Array.isArray(obrasV6)) ? obrasV6 : {};

  const obrasList = Object.values(safeObrasV6)
    .filter((obra: any) => {
       if (!obra || typeof obra !== 'object') return false;
       if (!globalSearch) return true;
       const searchLower = globalSearch.trim().toLowerCase();
       const inNome = (obra.nome || '').toLowerCase().includes(searchLower);
       const inItens = ['itensFolhas', 'itensAduelas', 'itensAlizares', 'itensCorrer'].some(k => 
         (obra[k] || []).some((i: any) => 
           (i.dimensao || '').toLowerCase().includes(searchLower) ||
           (i.cor || '').toLowerCase().includes(searchLower) ||
           (i.medidaAduela || '').toLowerCase().includes(searchLower) ||
           (i.medidaAlizar || '').toLowerCase().includes(searchLower) ||
           (i.descricao && i.descricao.toLowerCase().includes(searchLower))
         )
       );
       return inNome || inItens;
    })
    .sort((a: any, b: any) => (a.nome || '').localeCompare(b.nome || ''));

  useEffect(() => {
    if (obrasList.length > 0) {
      if (!selectedObraId || !safeObrasV6[selectedObraId]) {
        setSelectedObraId((obrasList[0] as any).id);
      }
    }
  }, [obrasList.length, selectedObraId]);

  const activeObra = (selectedObraId && safeObrasV6[selectedObraId]) ? safeObrasV6[selectedObraId] : null;

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
         cargasEntradaCorrer: [{ id: 'ce_c_1', nome: '1ª Carga', data: today }],
         cargasSaidaCorrer: [{ id: 'cs_c_1', nome: '1ª Saída', data: today }],
         itensFolhas: [{ id: 'f_'+Date.now(), dimensao: '', cor: '', enchimento: '', modelo: '', entradas: {}, saidas: {} }],
         itensAduelas: [{ id: 'ad_'+Date.now(), medidaAduela: '', cor: '', entradas: {}, saidas: {} }],
         itensAlizares: [{ id: 'al_'+Date.now(), medidaAlizar: '', cor: '', entradas: {}, saidas: {} }],
         itensCorrer: [{ id: 'c_'+Date.now(), dimensao: '', cor: '', enchimento: '', modelo: '', entradas: {}, saidas: {} }]
      }
    }));
    setSelectedObraId(id);
  };

  const deletarObra = (id: string) => {
    if(!window.confirm('Tem certeza que deseja excluir esta obra?')) return;
    setObrasV6(prev => {
      const novas = { ...(prev || {}) };
      delete novas[id];
      return novas;
    });
    if (selectedObraId === id) setSelectedObraId('');
  };

  const updateObra = (fn: (obra: any) => any) => {
    if (!selectedObraId) return;
    setObrasV6(prev => {
      const safePrev = (prev && typeof prev === 'object') ? prev : {};
      const obra = safePrev[selectedObraId];
      if (!obra) return safePrev;
      return { ...safePrev, [selectedObraId]: fn(obra) };
    });
  };

  const adicionarColuna = (tipo: 'Entrada' | 'Saida', aba: 'Folhas' | 'Aduelas' | 'Alizares' | 'Correr') => {
    const today = new Date().toISOString().split('T')[0];
    const targetField = `cargas${tipo}${aba}`;
    
    updateObra(obra => {
       const rawCargas = obra[targetField];
       const cargas = (Array.isArray(rawCargas) && rawCargas.length > 0)
         ? rawCargas
         : [{ id: `c_${tipo.charAt(0).toLowerCase()}_${aba.charAt(0).toLowerCase()}_1`, nome: `1ª ${tipo === 'Entrada' ? 'Carga' : 'Saída'}`, data: today }];
       const count = cargas.length + 1;
       const nova = {
         id: `c_${tipo.charAt(0).toLowerCase()}_${aba.charAt(0).toLowerCase()}_${Date.now()}`,
         nome: `${count}ª ${tipo === 'Entrada' ? 'Carga' : 'Saída'}`,
         data: today
       };
       return { ...obra, [targetField]: [...cargas, nova] };
    });
  };

  const removerColuna = (tipo: 'Entrada' | 'Saida', aba: 'Folhas' | 'Aduelas' | 'Alizares' | 'Correr', cargaId: string) => {
    if(!window.confirm('Excluir esta coluna e todos os seus dados?')) return;
    
    const targetField = `cargas${tipo}${aba}`;
    const propMap = tipo === 'Entrada' ? 'entradas' : 'saidas';
    const listField = `itens${aba}`;

    updateObra(obra => {
       const rawCargas = Array.isArray(obra[targetField]) ? obra[targetField] : [];
       const novasCargas = rawCargas.filter((c:any) => c && c.id !== cargaId);
       
       const rawItens = Array.isArray(obra[listField]) ? obra[listField] : [];
       const novosItens = rawItens.map((it:any) => {
          if (!it) return it;
          const currentMap = (it[propMap] && typeof it[propMap] === 'object') ? it[propMap] : {};
          const newMap = { ...currentMap };
          delete newMap[cargaId];
          return { ...it, [propMap]: newMap };
       });

       return { ...obra, [targetField]: novasCargas, [listField]: novosItens };
    });
  };

  const handleChangeItemField = (itemId: string, field: string, value: string) => {
    const abaCapitalized = (activeTab.charAt(0).toUpperCase() + activeTab.slice(1)) as 'Folhas' | 'Aduelas' | 'Alizares' | 'Correr';
    const listField = `itens${abaCapitalized}`;
    updateObra(obra => {
      const items = Array.isArray(obra[listField]) ? obra[listField] : [];
      return {
        ...obra,
        [listField]: items.map((it: any) => (!it || it.id !== itemId) ? it : { ...it, [field]: value })
      };
    });
  };

  const handleChangeQty = (itemId: string, propMap: string, cargaId: string, value: string) => {
    const abaCapitalized = (activeTab.charAt(0).toUpperCase() + activeTab.slice(1)) as 'Folhas' | 'Aduelas' | 'Alizares' | 'Correr';
    const listField = `itens${abaCapitalized}`;
    updateObra(obra => {
      const items = Array.isArray(obra[listField]) ? obra[listField] : [];
      return {
        ...obra,
        [listField]: items.map((it: any) => {
          if (!it || it.id !== itemId) return it;
          const currentMap = (it[propMap] && typeof it[propMap] === 'object') ? it[propMap] : {};
          return {
            ...it,
            [propMap]: {
               ...currentMap,
               [cargaId]: value
            }
          };
        })
      };
    });
  };

  const handleChangeComment = (itemId: string, type: 'entradas'|'saidas', cargaId: string, comment: string) => {
    const abaCapitalized = (activeTab.charAt(0).toUpperCase() + activeTab.slice(1)) as 'Folhas' | 'Aduelas' | 'Alizares' | 'Correr';
    const listField = `itens${abaCapitalized}`;
    updateObra(obra => {
      const items = Array.isArray(obra[listField]) ? obra[listField] : [];
      return {
        ...obra,
        [listField]: items.map((it: any) => {
          if (!it || it.id !== itemId) return it;
          const commentKey = `${type}_${cargaId}`;
          const currentComentarios = (it.comentarios && typeof it.comentarios === 'object') ? it.comentarios : {};
          const newComentarios = { ...currentComentarios };
          if (comment) {
            newComentarios[commentKey] = comment;
          } else {
            delete newComentarios[commentKey];
          }
          return { ...it, comentarios: newComentarios };
        })
      };
    });
  };

  const handleCommentClick = (itemId: string, type: 'entradas'|'saidas', cargaId: string, currentComment: string) => {
    const comment = window.prompt("Comentário da célula (deixe em branco para remover):", currentComment || '');
    if (comment !== null) {
      handleChangeComment(itemId, type, cargaId, comment);
    }
  };

  const adicionarLinha = () => {
    const abaCapitalized = (activeTab.charAt(0).toUpperCase() + activeTab.slice(1)) as 'Folhas' | 'Aduelas' | 'Alizares' | 'Correr';
    const listField = `itens${abaCapitalized}`;
    const uniqueId = `${activeTab.charAt(0)}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    
    updateObra(obra => {
      let newItem: any = { id: uniqueId, entradas: {}, saidas: {} };
      if (activeTab === 'folhas' || activeTab === 'correr') {
        newItem = { ...newItem, dimensao: '', cor: '', enchimento: '', modelo: '' };
      } else if (activeTab === 'aduelas') {
        newItem = { ...newItem, medidaAduela: '', cor: '' };
      } else {
        newItem = { ...newItem, medidaAlizar: '', cor: '' };
      }
      
      const existingList = Array.isArray(obra[listField]) ? obra[listField] : [];
      return {
        ...obra,
        [listField]: [...existingList, newItem]
      };
    });
  };

  const deletarLinha = (itemId: string) => {
    if(!window.confirm('Excluir esta linha?')) return;
    const abaCapitalized = (activeTab.charAt(0).toUpperCase() + activeTab.slice(1)) as 'Folhas' | 'Aduelas' | 'Alizares' | 'Correr';
    const listField = `itens${abaCapitalized}`;
    
    updateObra(obra => {
      const existingList = Array.isArray(obra[listField]) ? obra[listField] : [];
      return {
        ...obra,
        [listField]: existingList.filter((it: any) => it && it.id !== itemId)
      };
    });
  };

  const formatCargaDate = (dStr: any) => {
    if (!dStr) return '-';
    try {
      const s = String(dStr);
      const parts = s.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      const d = new Date(s);
      return isNaN(d.getTime()) ? s : d.toLocaleDateString('pt-BR');
    } catch {
      return String(dStr || '-');
    }
  };

  const renderTable = () => {
    if (!activeObra) return null;
    
    const abaCapitalized = (activeTab.charAt(0).toUpperCase() + activeTab.slice(1)) as 'Folhas' | 'Aduelas' | 'Alizares' | 'Correr';
    const listField = `itens${abaCapitalized}`;
    const rawItens = Array.isArray(activeObra[listField]) ? activeObra[listField] : [];
    const validItens = rawItens.filter((it: any) => it && typeof it === 'object');

    const currentItens = [...validItens].sort((a, b) => {
      let valA = '';
      let valB = '';
      if (activeTab === 'folhas' || activeTab === 'correr') {
        valA = a?.dimensao || '';
        valB = b?.dimensao || '';
      } else if (activeTab === 'aduelas') {
        valA = a?.medidaAduela || '';
        valB = b?.medidaAduela || '';
      } else if (activeTab === 'alizares') {
        valA = a?.medidaAlizar || '';
        valB = b?.medidaAlizar || '';
      }
      
      if (!valA && valB) return 1;
      if (valA && !valB) return -1;
      if (!valA && !valB) return 0;

      const parseDim = (str: string) => (str || '').split(/[xX]/).map(n => parseInt(n) || 0);
      const numsA = parseDim(valA);
      const numsB = parseDim(valB);
      
      for (let i = 0; i < Math.max(numsA.length, numsB.length); i++) {
        const nA = numsA[i] || 0;
        const nB = numsB[i] || 0;
        if (nA !== nB) return nA - nB;
      }
      return valA.localeCompare(valB);
    });
    
    const today = new Date().toISOString().split('T')[0];
    const rawCargasEntrada = activeObra[`cargasEntrada${abaCapitalized}`];
    const cargasEntrada = (Array.isArray(rawCargasEntrada) && rawCargasEntrada.length > 0)
      ? rawCargasEntrada
      : [{ id: `ce_${activeTab.charAt(0)}_1`, nome: '1ª Carga', data: today }];

    const rawCargasSaida = activeObra[`cargasSaida${abaCapitalized}`];
    const cargasSaida = (Array.isArray(rawCargasSaida) && rawCargasSaida.length > 0)
      ? rawCargasSaida
      : [{ id: `cs_${activeTab.charAt(0)}_1`, nome: '1ª Saída', data: today }];
    
    let specHeaders = [];
    if (activeTab === 'folhas' || activeTab === 'correr') specHeaders = ['DIMENSÃO', 'COR', 'ENCHIMENTO', 'MODELO'];
    else if (activeTab === 'aduelas') specHeaders = ['MEDIDA ADUELA', 'COR'];
    else specHeaders = ['FACE/MEDIDA ALIZAR', 'COR'];

    const getTotalForColumn = (items: any[], type: 'entradas' | 'saidas', cargaId: string) => {
      return (items || []).reduce((acc, item) => {
        if (!item || !item[type]) return acc;
        return acc + (parseInt(item[type][cargaId]) || 0);
      }, 0);
    };

    const getTotalSaldo = (items: any[]) => {
       return (items || []).reduce((acc: number, item: any) => {
         if (!item) return acc;
         const mapEntradas = (item.entradas && typeof item.entradas === 'object') ? item.entradas : {};
         const mapSaidas = (item.saidas && typeof item.saidas === 'object') ? item.saidas : {};
         const totalEntradas = Object.values(mapEntradas).reduce((sum: number, v: any) => sum + (parseInt(v) || 0), 0) as number;
         const totalSaidas = Object.values(mapSaidas).reduce((sum: number, v: any) => sum + (parseInt(v) || 0), 0) as number;
         return acc + (totalEntradas - totalSaidas);
       }, 0);
    };

    return (
      <div className="flex-1 overflow-auto bg-gray-50 p-4 w-full">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-x-auto w-full">
          <table className="w-full text-center text-sm border-separate border-spacing-0 min-w-max">
            <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-b border-gray-300 dark:border-gray-700 sticky top-0 z-20 shadow-sm">
              <tr>
                {/* Frozen Specification Header: Dimensao / Medida Aduela / Face Medida Alizar */}
                <th 
                  rowSpan={2} 
                  className={cn(
                    "sticky left-0 top-0 z-30 p-2.5 border-r border-b border-gray-300 dark:border-gray-700 font-bold bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 text-xs shadow-[2px_0_5px_-2px_rgba(0,0,0,0.12)] align-middle",
                    (activeTab === 'folhas' || activeTab === 'correr') ? "w-[180px] min-w-[180px]" : "w-[240px] min-w-[240px]"
                  )}
                >
                  <div className="flex flex-col items-center justify-center">
                    <span>{specHeaders[0]}</span>
                    <span className="text-[10px] font-normal text-gray-500 dark:text-gray-400 mt-0.5">(Fixado)</span>
                  </div>
                </th>
                {specHeaders.length > 1 && (
                  <th colSpan={specHeaders.length - 1} className="p-3 border-r border-b border-gray-300 dark:border-gray-700 font-bold bg-gray-100 dark:bg-gray-800">
                    ESPECIFICAÇÕES
                  </th>
                )}
                <th colSpan={cargasEntrada.length + 1} className="p-3 border-r border-b border-gray-300 dark:border-gray-700 font-bold bg-blue-50 text-blue-800 dark:bg-blue-900/60 dark:text-blue-100">
                  ENTRADAS (CARGAS)
                </th>
                <th colSpan={cargasSaida.length + 1} className="p-3 border-r border-b border-gray-300 dark:border-gray-700 font-bold bg-purple-50 text-purple-800 dark:bg-purple-900/60 dark:text-purple-100">
                  SAÍDAS (PRODUÇÃO)
                </th>
                <th rowSpan={2} className="p-3 border-r border-b border-gray-300 dark:border-gray-700 font-bold bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100 align-middle">
                  <div className="flex flex-col items-center justify-center">
                    <span>RESTOU</span>
                    <span className="mt-1 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100 text-[10px] px-1.5 py-0.5 rounded-full font-bold">Total: {getTotalSaldo(currentItens)}</span>
                  </div>
                </th>
                <th rowSpan={2} className="p-3 border-b border-gray-300 dark:border-gray-700 font-bold bg-gray-100 dark:bg-gray-800 w-12 align-middle">
                  AÇÕES
                </th>
              </tr>
              <tr className="border-t border-gray-200 dark:border-gray-700">
                {specHeaders.slice(1).map(h => <th key={h} className="p-2 border-r border-b border-gray-300 dark:border-gray-700 font-bold text-xs bg-gray-100 dark:bg-gray-800">{h}</th>)}
                
                {/* Entradas */}
                {cargasEntrada.map((c: any) => {
                  const total = getTotalForColumn(currentItens, 'entradas', c.id);
                  return (
                  <th key={c.id} className="p-2 border-r border-b border-gray-300 dark:border-gray-700 font-bold text-xs bg-blue-50/50 dark:bg-blue-900/40 w-[100px] relative group">
                    <button onClick={() => removerColuna('Entrada', abaCapitalized, c.id)} className="absolute top-1 right-1 text-red-500 bg-white dark:bg-gray-800 rounded-full shadow-sm hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 z-10" title="Excluir Coluna">
                       <X className="w-3 h-3"/>
                    </button>
                    <div className="flex flex-col items-center justify-center">
                      <span>{c.nome || 'Carga'}</span>
                      <span className="text-[10px] font-normal text-gray-500">{formatCargaDate(c.data)}</span>
                      <span className="mt-1 bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100 text-[10px] px-1.5 py-0.5 rounded-full font-bold">Total: {total}</span>
                    </div>
                  </th>
                )})}
                <th className="p-2 border-r border-b border-gray-300 dark:border-gray-700 bg-blue-50/50 dark:bg-blue-900/40">
                  <button onClick={() => adicionarColuna('Entrada', abaCapitalized)} className="flex flex-col items-center justify-center w-full h-full text-blue-600 hover:text-blue-800 transition-colors" title="Adicionar nova carga">
                    <Plus className="w-4 h-4"/>
                    <span className="text-[10px]">Carga</span>
                  </button>
                </th>

                {/* Saídas */}
                {cargasSaida.map((c: any) => {
                  const total = getTotalForColumn(currentItens, 'saidas', c.id);
                  return (
                  <th key={c.id} className="p-2 border-r border-b border-gray-300 dark:border-gray-700 font-bold text-xs bg-purple-50/50 dark:bg-purple-900/40 w-[100px] relative group">
                    <button onClick={() => removerColuna('Saida', abaCapitalized, c.id)} className="absolute top-1 right-1 text-red-500 bg-white dark:bg-gray-800 rounded-full shadow-sm hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 z-10" title="Excluir Coluna">
                       <X className="w-3 h-3"/>
                    </button>
                    <div className="flex flex-col items-center justify-center">
                      <span>{c.nome || 'Saída'}</span>
                      <span className="text-[10px] font-normal text-gray-500">{formatCargaDate(c.data)}</span>
                      <span className="mt-1 bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100 text-[10px] px-1.5 py-0.5 rounded-full font-bold">Total: {total}</span>
                    </div>
                  </th>
                )})}
                <th className="p-2 border-r border-b border-gray-300 dark:border-gray-700 bg-purple-50/50 dark:bg-purple-900/40">
                  <button onClick={() => adicionarColuna('Saida', abaCapitalized)} className="flex flex-col items-center justify-center w-full h-full text-purple-600 hover:text-purple-800 transition-colors" title="Adicionar nova saída">
                    <Plus className="w-4 h-4"/>
                    <span className="text-[10px]">Saída</span>
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {currentItens.length === 0 ? (
                <tr>
                  <td colSpan={specHeaders.length + cargasEntrada.length + cargasSaida.length + 4} className="p-8 text-center text-gray-500 border-b border-gray-300 dark:border-gray-700">
                    Nenhum item cadastrado.
                  </td>
                </tr>
              ) : (
                currentItens.map((item: any) => {
                  
                  const mapEntradas = (item.entradas && typeof item.entradas === 'object') ? item.entradas : {};
                  const mapSaidas = (item.saidas && typeof item.saidas === 'object') ? item.saidas : {};
                  
                  const totalEntradas = Object.values(mapEntradas).reduce((acc: number, v: any) => acc + (parseInt(v) || 0), 0) as number;
                  const totalSaidas = Object.values(mapSaidas).reduce((acc: number, v: any) => acc + (parseInt(v) || 0), 0) as number;
                  const saldo = totalEntradas - totalSaidas;

                  return (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group h-[48px]">
                      {(activeTab === 'folhas' || activeTab === 'correr') && (
                        <>
                          <td className="p-0 border-r border-b border-gray-300 dark:border-gray-700 sticky left-0 z-10 bg-white dark:bg-gray-900 group-hover:bg-gray-50 dark:group-hover:bg-gray-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.12)] w-[180px] min-w-[180px]">
                            <input type="text" list="dimensoes_porta_list" value={item.dimensao || ''} onChange={e => handleChangeItemField(item.id, 'dimensao', e.target.value)} placeholder="Dimensão" className="w-full h-full min-h-[44px] p-2 text-center bg-transparent border-none outline-none focus:ring-2 focus:ring-inset focus:ring-brand-green font-bold text-gray-900 dark:text-gray-100 text-sm" />
                          </td>
                          <td className="p-0 border-r border-b border-gray-300 dark:border-gray-700 relative">
                            <select value={item.cor || ''} onChange={e => handleChangeItemField(item.id, 'cor', e.target.value)} className="w-full h-full min-h-[44px] p-2 text-center bg-transparent border-none outline-none focus:ring-2 focus:ring-inset focus:ring-brand-green text-sm text-gray-800 dark:text-gray-100 appearance-none text-center-select">
                              <option value="">Selecione...</option>
                              {CORES.map(op => <option key={op} value={op}>{op}</option>)}
                            </select>
                          </td>
                          <td className="p-0 border-r border-b border-gray-300 dark:border-gray-700 relative">
                            <select value={item.enchimento || ''} onChange={e => handleChangeItemField(item.id, 'enchimento', e.target.value)} className="w-full h-full min-h-[44px] p-2 text-center bg-transparent border-none outline-none focus:ring-2 focus:ring-inset focus:ring-brand-green text-sm text-gray-800 dark:text-gray-100 appearance-none text-center-select">
                              <option value="">Selecione...</option>
                              {ENCHIMENTOS_PORTA.map(op => <option key={op} value={op}>{op}</option>)}
                            </select>
                          </td>
                          <td className="p-0 border-r border-b border-gray-300 dark:border-gray-700 relative">
                            <select value={item.modelo || ''} onChange={e => handleChangeItemField(item.id, 'modelo', e.target.value)} className="w-full h-full min-h-[44px] p-2 text-center bg-transparent border-none outline-none focus:ring-2 focus:ring-inset focus:ring-brand-green text-sm text-gray-800 dark:text-gray-100 appearance-none text-center-select">
                              <option value="">Selecione...</option>
                              {MODELOS_PORTA.map(op => <option key={op} value={op}>{op}</option>)}
                            </select>
                          </td>
                        </>
                      )}
                      
                      {activeTab === 'aduelas' && (
                        <>
                          <td className="p-0 border-r border-b border-gray-300 dark:border-gray-700 sticky left-0 z-10 bg-white dark:bg-gray-900 group-hover:bg-gray-50 dark:group-hover:bg-gray-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.12)] w-[240px] min-w-[240px]">
                            <input type="text" list="medida_aduela_list" value={item.medidaAduela || ''} onChange={e => handleChangeItemField(item.id, 'medidaAduela', e.target.value)} placeholder="Medida Aduela" className="w-full h-full min-h-[44px] p-2 text-center bg-transparent border-none outline-none focus:ring-2 focus:ring-inset focus:ring-amber-500 font-bold text-gray-900 dark:text-gray-100 text-sm" />
                          </td>
                          <td className="p-0 border-r border-b border-gray-300 dark:border-gray-700 relative">
                            <select value={item.cor || ''} onChange={e => handleChangeItemField(item.id, 'cor', e.target.value)} className="w-full h-full min-h-[44px] p-2 text-center bg-transparent border-none outline-none focus:ring-2 focus:ring-inset focus:ring-amber-500 text-sm text-gray-800 dark:text-gray-100 appearance-none text-center-select">
                              <option value="">Selecione...</option>
                              {CORES.map(op => <option key={op} value={op}>{op}</option>)}
                            </select>
                          </td>
                        </>
                      )}
                      
                      {activeTab === 'alizares' && (
                        <>
                          <td className="p-0 border-r border-b border-gray-300 dark:border-gray-700 sticky left-0 z-10 bg-white dark:bg-gray-900 group-hover:bg-gray-50 dark:group-hover:bg-gray-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.12)] w-[240px] min-w-[240px]">
                            <input type="text" list="medida_alizar_list" value={item.medidaAlizar || ''} onChange={e => handleChangeItemField(item.id, 'medidaAlizar', e.target.value)} placeholder="Face/Medida" className="w-full h-full min-h-[44px] p-2 text-center bg-transparent border-none outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500 font-bold text-gray-900 dark:text-gray-100 text-sm" />
                          </td>
                          <td className="p-0 border-r border-b border-gray-300 dark:border-gray-700 relative">
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
                        const comentariosMap = (item.comentarios && typeof item.comentarios === 'object') ? item.comentarios : {};
                        const comment = comentariosMap[commentKey] || '';
                        const hasComment = !!comment;
                        return (
                          <td key={c.id} className={cn("p-0 border-r border-b border-gray-300 dark:border-gray-700 relative group", hasComment ? "bg-red-600 hover:bg-red-700" : "bg-blue-50/30 dark:bg-blue-900/20 hover:bg-blue-100/50 dark:hover:bg-blue-900/50")}>
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
                      <td className="p-0 border-r border-b border-gray-300 dark:border-gray-700 bg-gray-100/30"></td>

                      {/* Saídas */}
                      {cargasSaida.map((c: any) => {
                        const commentKey = `saidas_${c.id}`;
                        const comentariosMap = (item.comentarios && typeof item.comentarios === 'object') ? item.comentarios : {};
                        const comment = comentariosMap[commentKey] || '';
                        const hasComment = !!comment;
                        return (
                          <td key={c.id} className={cn("p-0 border-r border-b border-gray-300 dark:border-gray-700 relative group", hasComment ? "bg-red-600 hover:bg-red-700" : "bg-purple-50/30 dark:bg-purple-900/20 hover:bg-purple-100/50 dark:hover:bg-purple-900/50")}>
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
                      <td className="p-0 border-r border-b border-gray-300 dark:border-gray-700 bg-gray-100/30"></td>

                      {/* Saldo */}
                      <td className={cn("p-2 border-r border-b border-gray-300 dark:border-gray-700 font-bold text-base text-center", saldo < 0 ? "text-red-500 bg-red-50 dark:bg-red-900/20" : "text-gray-900 dark:text-gray-100")}>
                        {saldo}
                      </td>

                      <td className="p-2 border-b border-gray-300 dark:border-gray-700 text-center">
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
                {obrasList.map((o: any) => <option key={o.id} value={o.id}>{o.nome || 'Sem Nome'}</option>)}
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
                value={activeObra.nome || ''}
                onChange={(e) => {
                   setObrasV6(prev => {
                      const safePrev = (prev && typeof prev === 'object') ? prev : {};
                      const o = safePrev[activeObra.id];
                      if (!o) return safePrev;
                      return { ...safePrev, [activeObra.id]: { ...o, nome: e.target.value } };
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
            <div className="px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex space-x-2 shrink-0 overflow-x-auto">
              <button 
                onClick={() => setActiveTab('folhas')}
                className={cn("px-5 py-2 rounded-md text-sm font-bold transition-colors cursor-pointer", activeTab === 'folhas' ? "bg-brand-green text-white shadow-sm" : "text-gray-600 hover:bg-gray-100 bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700")}
              >
                Folhas de Porta
              </button>
              <button 
                onClick={() => setActiveTab('aduelas')}
                className={cn("px-5 py-2 rounded-md text-sm font-bold transition-colors cursor-pointer", activeTab === 'aduelas' ? "bg-brand-green text-white shadow-sm" : "text-gray-600 hover:bg-gray-100 bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700")}
              >
                Aduelas
              </button>
              <button 
                onClick={() => setActiveTab('alizares')}
                className={cn("px-5 py-2 rounded-md text-sm font-bold transition-colors cursor-pointer", activeTab === 'alizares' ? "bg-brand-green text-white shadow-sm" : "text-gray-600 hover:bg-gray-100 bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700")}
              >
                Alizares
              </button>
              <button 
                onClick={() => setActiveTab('correr')}
                className={cn("px-5 py-2 rounded-md text-sm font-bold transition-colors cursor-pointer", activeTab === 'correr' ? "bg-brand-green text-white shadow-sm" : "text-gray-600 hover:bg-gray-100 bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700")}
              >
                Correr
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
        {FACE_ALIZAR.flatMap(face => ABA_ALIZAR.flatMap(aba => 
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
