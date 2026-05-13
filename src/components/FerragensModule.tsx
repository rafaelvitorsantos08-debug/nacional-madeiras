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
  const [obrasList, setObrasList] = useLocalStorage<string[]>('nm_ferragens_obras_list_v2', []);
  const [selectedObra, setSelectedObra] = useState<string>(obrasList[0] || '');
  
  // Keep selectedObra valid if list changes
  useEffect(() => {
    if (!selectedObra && obrasList.length > 0) {
      setSelectedObra(obrasList[0]);
    }
  }, [obrasList, selectedObra]);

  const [obrasData, setObrasData] = useLocalStorage<Record<string, any[]>>('nm_ferragens_obras_data_v2', () => {
    return {};
  });

  const [movementsHistory, setMovementsHistory] = useLocalStorage<Movement[]>('nm_ferragens_history_v2', []);

  const [newObraName, setNewObraName] = useState('');
  const [isAddingObra, setIsAddingObra] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [movementType, setMovementType] = useState<'entrada' | 'saida'>('entrada');
  const [movementAmount, setMovementAmount] = useState<number | ''>('');
  const [movementDate, setMovementDate] = useState(new Date().toISOString().split('T')[0]);

  const [movementResponsible, setMovementResponsible] = useState('');
  const [movementDestination, setMovementDestination] = useState('');

  // Ensure current obra exists
  useEffect(() => {
    if (selectedObra && !obrasData[selectedObra]) {
      setObrasData((prev: any) => ({
        ...prev,
        [selectedObra]: INITIAL_FERRAGENS.map(i => ({ ...i }))
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
    setIsModalOpen(true);
  };

  const handleSaveMovement = () => {
    if (!editingItem || !movementAmount) return;
    const amount = Number(movementAmount);
    
    if (movementType === 'saida' && amount > editingItem.estoque) {
       alert(`ESTOQUE INSUFICIENTE: Saldo de ${editingItem.estoque} inferior à solicitação de ${amount}.`);
       return;
    }

    let newEstoque = editingItem.estoque;

    setObrasData((prev: any) => {
      const currentObraItems = prev[selectedObra] || [];
      const updatedItems = currentObraItems.map((i: any) => {
        if (i.id === editingItem.id) {
          if (movementType === 'entrada') newEstoque = i.estoque + amount;
          if (movementType === 'saida') newEstoque = Math.max(0, i.estoque - amount);
          
          return { ...i, estoque: newEstoque };
        }
        return i;
      });
      return { ...prev, [selectedObra]: updatedItems };
    });

    const newMovement: Movement = {
      id: Math.random().toString(36).substring(2, 11),
      obraId: selectedObra,
      itemId: editingItem.id,
      itemModelo: editingItem.modelo,
      type: movementType,
      amount,
      date: movementDate,
      responsible: movementType === 'saida' ? movementResponsible : undefined,
      destination: movementType === 'saida' ? movementDestination : undefined,
    };

    setMovementsHistory(prev => [newMovement, ...prev]);
    
    if (movementType === 'saida') {
        alert(`SAÍDA REGISTRADA: ${editingItem.id} - ${amount} unidades para ${selectedObra}. Saldo atualizado: ${newEstoque}.`);
    } else {
        alert(`ENTRADA REGISTRADA: ${editingItem.id} - ${amount} unidades para ${selectedObra}. Saldo atualizado: ${newEstoque}.`);
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

  const currentItems = obrasData[selectedObra] || [];
  const filteredList = currentItems.filter((item: any) => {
    const combinedSearchTerm = searchTerm || globalSearch;
    const searchLower = combinedSearchTerm.toLowerCase();
    const searchString = Object.values(item).join(' ').toLowerCase();
    return combinedSearchTerm === '' || searchString.includes(searchLower);
  });

  return (
    <div className="animate-in fade-in duration-300">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
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
                onClick={() => setIsAddingObra(true)}
                className="flex items-center px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 hover:text-brand-green shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Nova Obra
              </button>
              <button
                onClick={() => setIsHistoryOpen(true)}
                className="flex items-center px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 text-indigo-600 shadow-sm transition-colors"
              >
                <History className="w-4 h-4 mr-1.5" />
                Ver Lançamentos
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
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
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
                    <td className="px-6 py-4 text-right font-bold text-gray-900 text-lg">
                      {Number(item.estoque).toLocaleString('pt-BR')}
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

      {/* MOVEMENT MODAL */}
      {isModalOpen && editingItem && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden ring-1 ring-black/5 animate-in zoom-in-95 duration-200">
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

      {/* HISTORY MODAL */}
      {isHistoryOpen && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[85vh] overflow-hidden ring-1 ring-black/5 animate-in zoom-in-95 duration-200 flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-white shadow-sm shadow-indigo-100 text-indigo-600">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 tracking-tight">Histórico de Lançamentos</h2>
                  <p className="text-sm text-gray-500">Acompanhe as entradas e saídas de todas as obras.</p>
                </div>
              </div>
              <button
                onClick={() => setIsHistoryOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-0">
              {movementsHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <History className="w-12 h-12 text-gray-200 mb-4" />
                  <p className="text-gray-500">Nenhum lançamento registrado até o momento.</p>
                </div>
              ) : (
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 sticky top-0 shadow-sm z-10">
                      <th className="px-6 py-3 font-medium">Data</th>
                      <th className="px-6 py-3 font-medium">Obra</th>
                      <th className="px-6 py-3 font-medium">Modelo</th>
                      <th className="px-6 py-3 font-medium">Tipo</th>
                      <th className="px-6 py-3 font-medium text-right">Qtde</th>
                      <th className="px-6 py-3 font-medium">Responsável / Destino</th>
                      <th className="px-6 py-3 font-medium text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {movementsHistory.map(mov => (
                      <tr key={mov.id} className="hover:bg-gray-50/50">
                        <td className="px-6 py-3 text-gray-600">
                          {new Date(mov.date).toLocaleDateString('pt-BR')}
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
                        <td className="px-6 py-3 text-gray-500 text-xs truncate max-w-[200px]" title={mov.type === 'saida' ? `${mov.responsible || ''} - ${mov.destination || ''}` : '-'}>
                          {mov.type === 'saida' && (
                             <div className="flex flex-col">
                               <span className="font-semibold text-gray-700">{mov.responsible || 'NT'}</span>
                               <span>{mov.destination || 'N/A'}</span>
                             </div>
                          )}
                          {mov.type === 'entrada' && '-'}
                        </td>
                        <td className="px-6 py-3 text-center">
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
            
            <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-end">
              <button
                onClick={() => setIsHistoryOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
