import React, { useState, useEffect } from 'react';
import { Search, Plus, PackagePlus, PackageMinus, MapPin, Calendar, CheckCircle2, History, Trash2, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { useLocalStorage } from './EstoqueModule';

interface Movement {
  id: string;
  obraId: string;
  itemId: string;
  itemModelo: string;
  type: 'entrada' | 'saida';
  amount: number;
  date: string;
  responsible?: string;
  destination?: string;
}

const INITIAL_FERRAGENS = [
  { id: 'FER-01', categoria: 'Ferragem', modelo: 'Ferragens de 40mm', estoque: 120 },
  { id: 'FER-02', categoria: 'Ferragem', modelo: 'Ferragens de 55mm', estoque: 85 },
  { id: 'FER-03', categoria: 'Ferragem', modelo: 'Meio cilindro', estoque: 40 },
  { id: 'FER-04', categoria: 'Ferragem', modelo: '378', estoque: 65 },
  { id: 'FER-05', categoria: 'Ferragem', modelo: '278', estoque: 90 },
  { id: 'FER-06', categoria: 'Ferragem', modelo: 'Eletrônica', estoque: 15 },
  { id: 'DOB-01', categoria: 'Dobradiça', modelo: '3X2²/5', estoque: 300 },
  { id: 'DOB-02', categoria: 'Dobradiça', modelo: '3X3²/5', estoque: 250 },
];

function getStatusBadge(estoque: number) {
  if (estoque <= 20) return <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-red-50 text-red-700 border border-red-200">Crítico</span>;
  if (estoque <= 50) return <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200">Atenção</span>;
  return <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-200">OK</span>;
}

export function FerragensModule({ globalSearch }: { globalSearch: string }) {
  const [obrasList, setObrasList] = useLocalStorage<string[]>('nm_ferragens_obras_list_v5', []);
  const [selectedObra, setSelectedObra] = useState<string>(obrasList[0] || '');
  
  // Keep selectedObra valid if list changes
  useEffect(() => {
    if (!selectedObra && obrasList.length > 0) {
      setSelectedObra(obrasList[0]);
    } else if (selectedObra && !obrasList.includes(selectedObra)) {
      setSelectedObra(obrasList[0] || '');
    }
  }, [obrasList, selectedObra]);

  const [obrasData, setObrasData] = useLocalStorage<Record<string, any[]>>('nm_ferragens_obras_data_v5', {});

  const [movementsHistory, setMovementsHistory] = useLocalStorage<Movement[]>('nm_ferragens_history_v5', []);

  const [newObraName, setNewObraName] = useState('');
  const [isAddingObra, setIsAddingObra] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItemId, setNewItemId] = useState('');
  const [newItemCategoria, setNewItemCategoria] = useState<string>('Ferragem');
  const [newItemModelo, setNewItemModelo] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [movementType, setMovementType] = useState<'entrada' | 'saida'>('entrada');
  const [movementAmount, setMovementAmount] = useState<number | ''>('');
  const [movementDate, setMovementDate] = useState(new Date().toISOString().split('T')[0]);

  const [movementResponsible, setMovementResponsible] = useState('');
  const [movementDestination, setMovementDestination] = useState('');
  const [movementSubType, setMovementSubType] = useState('');

  const [historyFilter, setHistoryFilter] = useState<'all' | 'entrada' | 'saida'>('all');

  const isFerragemWithSubTypes = (modelo: string) => {
    if (!modelo) return false;
    const m = modelo.toLowerCase();
    // Check if it's a type of ferragem that needs subtype specification
    return m.includes('40mm') || m.includes('50mm') || m.includes('55mm');
  };

  // Ensure current obra exists
  useEffect(() => {
    if (selectedObra && !obrasData[selectedObra]) {
      setObrasData((prev: any) => ({
        ...prev,
        [selectedObra]: INITIAL_FERRAGENS.map(i => ({ ...i, estoque: 0 }))
      }));
    }
  }, [selectedObra, obrasData, setObrasData]);

  const handleCreateObra = () => {
    if (!newObraName.trim()) return;
    const name = newObraName.trim().toUpperCase();
    if (!obrasList.includes(name)) {
      setObrasList(prev => [...prev, name]);
    }
    setSelectedObra(name);
    setNewObraName('');
    setIsAddingObra(false);
  };

  const handleMovement = (item: any, type: 'entrada' | 'saida') => {
    setEditingItem(item);
    setMovementType(type);
    setMovementAmount('');
    setMovementDate(new Date().toISOString().split('T')[0]);
    setMovementResponsible('');
    setMovementDestination('');
    setMovementSubType('');
    setIsModalOpen(true);
  };

  const handleDeleteItem = (itemId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este modelo? Todo o estoque dele nesta obra será perdido.')) {
      setObrasData((prev: any) => {
        const currentObraItems = prev[selectedObra] || [];
        const updatedItems = currentObraItems.filter((i: any) => i.id !== itemId);
        return { ...prev, [selectedObra]: updatedItems };
      });
    }
  };

  const handleDeleteObra = () => {
    if (!selectedObra) return;
    if (window.confirm(`Tem certeza que deseja excluir a obra ${selectedObra}? Todos os estoques e histórico associados a ela serão perdidos.`)) {
      setObrasList(prev => prev.filter(o => o !== selectedObra));
      setObrasData(prev => {
        const newData = { ...prev };
        delete newData[selectedObra];
        return newData;
      });
      setMovementsHistory(prev => prev.filter(m => m.obraId !== selectedObra));
    }
  };

  const handleCreateItem = () => {
    if (!newItemModelo) return;
    
    setObrasData((prev: any) => {
      const currentObraItems = prev[selectedObra] || [];
      const actualId = newItemId.trim() !== '' ? newItemId.toUpperCase() : `FER-${Math.floor(Math.random() * 100000)}`;

      if (newItemId.trim() !== '' && currentObraItems.find((i: any) => i.id === actualId)) {
        alert('Já existe um item com este código nesta obra.');
        return prev;
      }
      
      const newItem = {
        id: actualId,
        categoria: newItemCategoria,
        modelo: newItemModelo,
        estoque: 0,
      };
      
      return { ...prev, [selectedObra]: [...currentObraItems, newItem] };
    });
    
    setIsAddingItem(false);
    setNewItemId('');
    setNewItemModelo('');
    setNewItemCategoria('Ferragem');
  };

  const handleSaveMovement = () => {
    if (!editingItem || !movementAmount) return;
    const amount = Number(movementAmount);
    
    const requiresSubType = isFerragemWithSubTypes(editingItem.modelo);
    if (requiresSubType && !movementSubType) {
      alert('Selecione o tipo de ferragem (Banheiro, Interna, Externa ou Rolete).');
      return;
    }
    
    if (movementType === 'saida') {
       const availableGlobal = editingItem.estoque;
       const availableSub = requiresSubType ? (editingItem.subEstoques?.[movementSubType] || 0) : availableGlobal;
       
       if (amount > availableGlobal) {
          alert(`ESTOQUE INSUFICIENTE: Saldo global de ${availableGlobal} inferior à solicitação de ${amount}.`);
          return;
       }
       if (requiresSubType && amount > availableSub) {
          alert(`ESTOQUE INSUFICIENTE P/ O TIPO: Saldo de ${movementSubType} é de apenas ${availableSub}.`);
          return;
       }
    }

    let updatedEstoque = editingItem.estoque;

    setObrasData((prev: any) => {
      const currentObraItems = prev[selectedObra] || [];
      const updatedItems = currentObraItems.map((i: any) => {
        if (i.id === editingItem.id) {
          let newEstoque = i.estoque;
          let newSubEstoques = { ...(i.subEstoques || {}) };

          if (movementType === 'entrada') {
            newEstoque += amount;
            if (requiresSubType) {
               newSubEstoques[movementSubType] = (newSubEstoques[movementSubType] || 0) + amount;
            }
          }
          if (movementType === 'saida') {
            newEstoque = Math.max(0, newEstoque - amount);
            if (requiresSubType) {
               newSubEstoques[movementSubType] = Math.max(0, (newSubEstoques[movementSubType] || 0) - amount);
            }
          }
          
          updatedEstoque = newEstoque;
          return { ...i, estoque: newEstoque, subEstoques: newSubEstoques };
        }
        return i;
      });
      return { ...prev, [selectedObra]: updatedItems };
    });

    const newMovement: Movement = {
      id: Math.random().toString(36).substring(2, 11),
      obraId: selectedObra,
      itemId: editingItem.id,
      itemModelo: requiresSubType ? `${editingItem.modelo} (${movementSubType})` : editingItem.modelo,
      type: movementType,
      amount,
      date: movementDate,
      responsible: movementType === 'saida' ? movementResponsible : undefined,
      destination: movementType === 'saida' ? movementDestination : undefined,
    };

    setMovementsHistory(prev => [newMovement, ...prev]);
    
    if (movementType === 'saida') {
        alert(`SAÍDA REGISTRADA: ${editingItem.id} - ${amount} unidades para ${selectedObra}. Saldo atualizado: ${updatedEstoque}.`);
    } else {
        alert(`ENTRADA REGISTRADA: ${editingItem.id} - ${amount} unidades para ${selectedObra}. Saldo atualizado: ${updatedEstoque}.`);
    }
    
    setIsModalOpen(false);
  };

  const handleDeleteMovement = (movement: Movement) => {
    if (!window.confirm("Deseja realmente excluir este registro e reverter o saldo?")) return;
    
    setObrasData((prev: any) => {
      const currentObraItems = prev[movement.obraId] || [];
      const updatedItems = currentObraItems.map((i: any) => {
        if (i.id === movement.itemId) {
          let newEstoque = i.estoque;
          if (movement.type === 'entrada') newEstoque = Math.max(0, i.estoque - movement.amount);
          if (movement.type === 'saida') newEstoque = i.estoque + movement.amount;
          return { ...i, estoque: newEstoque };
        }
        return i;
      });
      return { ...prev, [movement.obraId]: updatedItems };
    });

    setMovementsHistory(prev => prev.filter(m => m.id !== movement.id));
  };

  const [isPrintingHistory, setIsPrintingHistory] = useState(false);

  const handlePrintHistory = (type: 'entrada' | 'saida') => {
    setHistoryFilter(type);
    setIsPrintingHistory(true);
    setTimeout(() => {
      window.print();
      setIsPrintingHistory(false);
      setHistoryFilter('all');
    }, 150);
  };

  const handleUpdateHistoryDate = (id: string, newDate: string) => {
    if (!newDate) return;
    setMovementsHistory(prev => prev.map(m => m.id === id ? { ...m, date: newDate } : m));
  };

  const currentItems = obrasData[selectedObra] || [];
  const filteredList = currentItems.filter((item: any) => {
    const combinedSearchTerm = (searchTerm || globalSearch || "").trim();
    const searchTerms = combinedSearchTerm.toLowerCase().split(' ').filter(t => t.length > 0);
    
    const searchableFields = ['id', 'categoria', 'modelo'];
    const searchString = searchableFields
      .map(key => item[key])
      .filter(val => val !== undefined && val !== null)
      .join(' ')
      .toLowerCase();
      
    return searchTerms.length === 0 || searchTerms.every(term => searchString.includes(term));
  });

  const currentObraHistory = movementsHistory.filter(m => m.obraId === selectedObra);
  const visibleHistory = historyFilter === 'all' ? currentObraHistory : currentObraHistory.filter(m => m.type === historyFilter);

  return (
    <div className="animate-in fade-in duration-300">
      <div className={cn("mb-6 flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0", isPrintingHistory && "print:hidden")}>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Recebimento de Ferragens</h1>
          <p className="text-sm text-gray-500 mt-1">Gerencie a entrada e saída de ferragens e dobradiças separadas por obra.</p>
        </div>
        <div className="flex items-center space-x-2">
          {isAddingObra ? (
            <div className="flex items-center space-x-2 bg-white px-2 py-1.5 rounded-xl border border-brand-green/30 shadow-sm animate-in fade-in zoom-in-95 duration-200">
              <input 
                type="text" 
                placeholder="Nome da Obra..."
                value={newObraName}
                onChange={(e) => setNewObraName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateObra()}
                autoFocus
                className="px-3 py-1.5 text-sm bg-transparent border-none focus:ring-0 w-48 text-gray-700 outline-none"
              />
              <button 
                onClick={handleCreateObra}
                className="p-1.5 bg-brand-green text-white rounded-lg hover:bg-green-700 transition"
              >
                <CheckCircle2 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => { setIsAddingObra(false); setNewObraName(''); }}
                className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <MapPin className="w-4 h-4 text-brand-green" />
                </div>
                <select
                  value={selectedObra}
                  onChange={(e) => setSelectedObra(e.target.value)}
                  className="pl-9 pr-8 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 focus:border-brand-green focus:ring-1 focus:ring-brand-green appearance-none shadow-sm cursor-pointer hover:border-gray-300 transition-colors"
                >
                  {obrasList.map(obra => (
                    <option key={obra} value={obra}>{obra}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleDeleteObra}
                title="Excluir Obra Selecionada"
                className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl border border-gray-200 hover:border-red-200 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsAddingObra(true)}
                className="flex items-center px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 hover:text-brand-green shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Nova Obra
              </button>
            </div>
          )}
        </div>
      </div>

      {obrasList.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 flex flex-col items-center justify-center text-center">
           <MapPin className="w-12 h-12 text-gray-300 mb-4" />
           <h3 className="text-lg font-semibold text-gray-800">Nenhuma obra cadastrada</h3>
           <p className="text-gray-500 mt-2 mb-6">Cadastre uma nova obra para iniciar o controle de entrada e saída de ferragens.</p>
           <button
             onClick={() => setIsAddingObra(true)}
             className="px-6 py-2.5 bg-brand-green text-white font-medium rounded-lg shadow-sm hover:bg-green-700 transition"
           >
             Cadastrar Primeira Obra
           </button>
        </div>
      ) : (
        <div className={cn("bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col", isPrintingHistory && "print:hidden")}>
          {/* TOOLBAR */}
          <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0 print:hidden">
            <div className="flex items-center space-x-3 w-full sm:w-auto relative">
              <div className="relative flex-1 sm:w-64">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="w-4 h-4 text-gray-400" />
                </span>
                <input
                  type="text"
                  placeholder="Buscar modelo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-brand-green focus:ring-1 focus:ring-brand-green outline-none transition-all"
                />
              </div>
              <button
                onClick={() => setIsAddingItem(true)}
                className="flex items-center px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 hover:text-brand-green shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Novo Modelo
              </button>
            </div>
          </div>

          {/* DATA TABLE */}
          <div className="overflow-x-auto print:overflow-visible min-h-[400px] print:min-h-0">
            <table className="w-full text-left text-sm whitespace-nowrap print:whitespace-normal">
              <thead>
                <tr className="bg-gray-50/80 text-gray-500 border-b border-gray-200">
                  <th className="px-6 py-3 font-medium">Código</th>
                  <th className="px-6 py-3 font-medium">Categoria</th>
                  <th className="px-6 py-3 font-medium">Modelo / Especificação</th>
                  <th className="px-6 py-3 font-medium text-right">Estoque Atual</th>
                  <th className="px-6 py-3 font-medium text-center">Status</th>
                  <th className="px-6 py-3 font-medium text-center print:hidden">Lançamentos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredList.map((item: any) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">{item.id}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center px-2 py-1 rounded-md text-xs font-medium",
                        item.categoria === 'Ferragem' ? "bg-blue-50 text-blue-700 border border-blue-200" : "bg-purple-50 text-purple-700 border border-purple-200"
                      )}>
                        {item.categoria}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-800">{item.modelo}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="font-bold text-gray-900 text-lg">
                        {Number(item.estoque).toLocaleString('pt-BR')}
                      </div>
                      {item.subEstoques && Object.keys(item.subEstoques).length > 0 && (
                        <div className="text-[10px] text-gray-500 mt-1 flex flex-col items-end gap-0.5 uppercase tracking-wider font-semibold">
                          {Object.entries(item.subEstoques).map(([k, v]) => (
                            <span key={k} className="bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                              {k}: {v as number}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getStatusBadge(item.estoque)}
                    </td>
                    <td className="px-6 py-4 text-center print:hidden">
                      <div className="flex items-center justify-center space-x-2">
                         <button
                           onClick={() => handleMovement(item, 'entrada')}
                           title="Registrar Entrada"
                           className="p-1.5 text-brand-green hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors border border-transparent hover:border-green-200"
                         >
                           <PackagePlus className="w-4 h-4" />
                         </button>
                         <button
                           onClick={() => handleMovement(item, 'saida')}
                           title="Registrar Saída"
                           className="p-1.5 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors border border-transparent hover:border-red-200"
                         >
                           <PackageMinus className="w-4 h-4" />
                         </button>
                         <button
                           onClick={() => handleDeleteItem(item.id)}
                           title="Excluir Modelo"
                           className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-2"
                         >
                           <Trash2 className="w-4 h-4" />
                         </button>
                      </div>
                    </td>
                  </tr>
                ))}
                
                {filteredList.length === 0 && (
                   <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                         Nenhum registro encontrado.
                      </td>
                   </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD ITEM MODAL */}
      {isAddingItem && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden ring-1 ring-black/5 animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-white shadow-sm shadow-blue-100 text-brand-green">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 tracking-tight">Novo Modelo</h2>
                  <p className="text-sm text-gray-500">Adicione uma nova ferragem para esta obra.</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddingItem(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Código (Opcional)</label>
                  <input
                    type="text"
                    value={newItemId}
                    onChange={(e) => setNewItemId(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:border-brand-green focus:ring-1 focus:ring-brand-green outline-none transition-all uppercase"
                    placeholder="Ex: FER-10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Categoria</label>
                  <select
                    value={newItemCategoria}
                    onChange={(e) => setNewItemCategoria(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:border-brand-green focus:ring-1 focus:ring-brand-green outline-none transition-all"
                  >
                    <option value="Ferragem">Ferragem</option>
                    <option value="Ferragem de 40mm">Ferragem de 40mm</option>
                    <option value="Ferragem de 55mm">Ferragem de 55mm</option>
                    <option value="Dobradiça">Dobradiça</option>
                    <option value="Dobradiças de 3/1¹/5">Dobradiças de 3/1¹/5</option>
                    <option value="Dobradiças de 3/2²/5">Dobradiças de 3/2²/5</option>
                    <option value="Dobradiças de 3/3²/5">Dobradiças de 3/3²/5</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Modelo / Especificação</label>
                  <input
                    type="text"
                    list="especificacoes-list"
                    value={newItemModelo}
                    onChange={(e) => setNewItemModelo(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:border-brand-green focus:ring-1 focus:ring-brand-green outline-none transition-all"
                    placeholder="Ex: Fechadura Digital"
                  />
                  <datalist id="especificacoes-list">
                    <option value="Banheiro" />
                    <option value="Interna" />
                    <option value="Externa" />
                  </datalist>
                  <div className="flex gap-2 mt-2">
                    {['Banheiro', 'Interna', 'Externa'].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setNewItemModelo(opt)}
                        className="px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3">
              <button
                onClick={() => setIsAddingItem(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 bg-gray-100 rounded-lg transition-colors border border-transparent"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateItem}
                disabled={!newItemModelo}
                className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors shadow-sm focus:ring-2 focus:ring-offset-2 focus:outline-none flex items-center bg-brand-green hover:bg-green-700 focus:ring-brand-green disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MOVEMENT MODAL */}
      {isModalOpen && editingItem && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden ring-1 ring-black/5 animate-in zoom-in-95 duration-200">
            <div className={cn(
              "p-6 border-b border-gray-100 flex justify-between items-start",
              movementType === 'entrada' ? "bg-green-50/50" : "bg-red-50/50"
            )}>
              <div className="flex items-center space-x-3">
                <div className={cn(
                  "p-2 rounded-xl",
                  movementType === 'entrada' ? "bg-white shadow-sm shadow-green-100 text-brand-green" : "bg-white shadow-sm shadow-red-100 text-red-500"
                )}>
                  {movementType === 'entrada' ? <PackagePlus className="w-5 h-5" /> : <PackageMinus className="w-5 h-5" />}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                    Registrar {movementType === 'entrada' ? 'Entrada' : 'Saída'}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {editingItem.modelo} (Atual: {editingItem.estoque})
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Quantidade</label>
                    <input
                      type="number"
                      min="1"
                      value={movementAmount}
                      onChange={(e) => setMovementAmount(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-brand-green focus:ring-1 focus:ring-brand-green outline-none transition-all"
                      placeholder="0"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Data do Registro</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Calendar className="w-4 h-4 text-gray-400" />
                      </div>
                      <input
                        type="date"
                        value={movementDate}
                        onChange={(e) => setMovementDate(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-brand-green focus:ring-1 focus:ring-brand-green outline-none transition-all text-gray-700"
                        required
                      />
                    </div>
                  </div>
                </div>

                {isFerragemWithSubTypes(editingItem.modelo) && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tipo de Ferragem</label>
                    <select
                      value={movementSubType}
                      onChange={(e) => setMovementSubType(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-brand-green focus:ring-1 focus:ring-brand-green outline-none transition-all text-gray-700"
                    >
                      <option value="">Selecione um tipo...</option>
                      <option value="Banheiro">Banheiro</option>
                      <option value="Interna">Interna</option>
                      <option value="Externa">Externa</option>
                      <option value="Rolete">Rolete</option>
                    </select>
                  </div>
                )}

                {movementType === 'saida' && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Responsável pela Retirada</label>
                      <input
                        type="text"
                        value={movementResponsible}
                        onChange={(e) => setMovementResponsible(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-brand-green focus:ring-1 focus:ring-brand-green outline-none transition-all"
                        placeholder="Nome completo do colaborador"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Destino/Uso</label>
                      <input
                        type="text"
                        value={movementDestination}
                        onChange={(e) => setMovementDestination(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-brand-green focus:ring-1 focus:ring-brand-green outline-none transition-all"
                        placeholder="Ex: Instalação das portas do 4º andar"
                        required
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50/80 flex justify-end space-x-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-200/50 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveMovement}
                disabled={!movementAmount || movementAmount <= 0 || (movementType === 'saida' && (!movementResponsible || !movementDestination))}
                className={cn(
                  "px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors shadow-sm focus:ring-2 focus:ring-offset-2 focus:outline-none flex items-center",
                  movementType === 'entrada' 
                    ? "bg-brand-green hover:bg-green-700 focus:ring-brand-green disabled:bg-green-300"
                    : "bg-red-600 hover:bg-red-700 focus:ring-red-600 disabled:bg-red-300"
                )}
              >
                Confirmar {movementType === 'entrada' ? 'Entrada' : 'Saída'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INLINE HISTORY (Always visible) */}
      <div className={cn("mt-8 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col", isPrintingHistory && "print:m-0 print:border-none print:shadow-none")}>
        <div className="p-6 border-b border-gray-100 flex flex-col xl:flex-row justify-between items-start xl:items-center bg-gray-50/50 print:hidden space-y-4 xl:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-white shadow-sm shadow-indigo-100 text-indigo-600">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">Histórico da Obra</h2>
              <p className="text-sm text-gray-500">Acompanhe as entradas e saídas da obra selecionada.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex p-1 bg-gray-200/50 rounded-lg">
              <button onClick={() => setHistoryFilter('all')} className={cn("px-3 py-1.5 text-sm font-medium rounded-md transition-colors", historyFilter === 'all' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700")}>Todas</button>
              <button onClick={() => setHistoryFilter('entrada')} className={cn("px-3 py-1.5 text-sm font-medium rounded-md transition-colors", historyFilter === 'entrada' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700")}>Entradas</button>
              <button onClick={() => setHistoryFilter('saida')} className={cn("px-3 py-1.5 text-sm font-medium rounded-md transition-colors", historyFilter === 'saida' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700")}>Saídas</button>
            </div>
            <div className="hidden sm:block h-6 border-r border-gray-300 mx-1"></div>
            <button onClick={() => handlePrintHistory('entrada')} className="px-3 py-2 text-sm font-semibold text-brand-green bg-green-50 rounded-xl hover:bg-green-100 transition-colors shadow-sm border border-brand-green/20">Imprimir Entradas</button>
            <button onClick={() => handlePrintHistory('saida')} className="px-3 py-2 text-sm font-semibold text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors shadow-sm border border-red-600/20">Imprimir Saídas</button>
          </div>
        </div>

        {/* Print-only Header */}
        <div className="hidden print:block mb-8 p-6 pb-0">
           <h2 className="text-2xl font-bold mb-2">Relatório de Lançamentos - {selectedObra}</h2>
           <p className="text-gray-500">Tipo: {historyFilter === 'entrada' ? 'Entradas' : historyFilter === 'saida' ? 'Saídas' : 'Todos'} | Data: {new Date().toLocaleDateString('pt-BR')}</p>
        </div>
        
        <div className={cn("flex-1 overflow-y-auto p-0 max-h-[500px]", isPrintingHistory && "print:max-h-none print:overflow-visible")}>
          {visibleHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <History className="w-12 h-12 text-gray-200 mb-4" />
              <p className="text-gray-500">Nenhum lançamento registrado até o momento.</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap print:whitespace-normal">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 sticky top-0 shadow-sm z-10 print:static print:shadow-none">
                  <th className="px-6 py-3 font-medium">Data</th>
                  <th className="px-6 py-3 font-medium">Obra</th>
                  <th className="px-6 py-3 font-medium">Modelo</th>
                  <th className="px-6 py-3 font-medium">Tipo</th>
                  <th className="px-6 py-3 font-medium text-right">Qtde</th>
                  <th className="px-6 py-3 font-medium">Responsável / Destino</th>
                  <th className="px-6 py-3 font-medium text-center print:hidden">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {visibleHistory.map(mov => (
                  <tr key={mov.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-3 text-gray-600">
                      <div className="flex items-center space-x-2">
                        <input 
                          type="date"
                          value={mov.date}
                          onChange={(e) => handleUpdateHistoryDate(mov.id, e.target.value)}
                          className="px-2 py-1 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-brand-green focus:bg-white outline-none rounded-md transition-all cursor-pointer text-sm"
                          title="Clique para alterar a data"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-3 font-medium text-gray-800">
                      {mov.obraId}
                    </td>
                    <td className="px-6 py-3 text-gray-600">
                      {mov.itemModelo} <span className="text-gray-400 text-xs ml-1">({mov.itemId})</span>
                    </td>
                    <td className="px-6 py-3">
                      {mov.type === 'entrada' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700">
                          Entrada
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-700">
                          Saída
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-right font-bold text-gray-900">
                      {mov.amount}
                    </td>
                    <td className="px-6 py-3 text-gray-500 text-xs truncate max-w-[200px] print:max-w-none print:whitespace-normal" title={mov.type === 'saida' ? `${mov.responsible || ''} - ${mov.destination || ''}` : '-'}>
                      {mov.type === 'saida' && (
                          <div className="flex flex-col">
                            <span className="font-semibold text-gray-700">{mov.responsible || 'NT'}</span>
                            <span>{mov.destination || 'N/A'}</span>
                          </div>
                      )}
                      {mov.type === 'entrada' && '-'}
                    </td>
                    <td className="px-6 py-3 text-center print:hidden">
                      <button
                        onClick={() => handleDeleteMovement(mov)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                        title="Desfazer Lançamento (reverte estoque)"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
