import React, { useState } from 'react';
import { Search, Filter, Plus, Pencil, Trash2, Shield, Settings2, PackagePlus, PackageMinus, History } from 'lucide-react';
import { cn } from '../lib/utils';
import { useLocalStorage } from './EstoqueModule';

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
  const [items, setItems] = useLocalStorage('nm_ferragens', INITIAL_FERRAGENS);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [movementType, setMovementType] = useState<'entrada' | 'saida'>('entrada');
  const [movementAmount, setMovementAmount] = useState<number | ''>('');

  const handleMovement = (item: any, type: 'entrada' | 'saida') => {
    setEditingItem(item);
    setMovementType(type);
    setMovementAmount('');
    setIsModalOpen(true);
  };

  const handleSaveMovement = () => {
    if (!editingItem || !movementAmount) return;
    const amount = Number(movementAmount);
    
    setItems((prev: any) => prev.map((i: any) => {
      if (i.id === editingItem.id) {
        let newEstoque = i.estoque;
        if (movementType === 'entrada') newEstoque += amount;
        if (movementType === 'saida') newEstoque = Math.max(0, newEstoque - amount);
        return { ...i, estoque: newEstoque };
      }
      return i;
    }));
    
    setIsModalOpen(false);
  };

  const filteredList = items.filter((item: any) => {
    const combinedSearchTerm = searchTerm || globalSearch;
    const searchLower = combinedSearchTerm.toLowerCase();
    const searchString = Object.values(item).join(' ').toLowerCase();
    return combinedSearchTerm === '' || searchString.includes(searchLower);
  });

  return (
    <div className="animate-in fade-in duration-300">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Recebimento de Ferragens</h1>
          <p className="text-sm text-gray-500 mt-1">Gerencie a entrada e saída de ferragens e dobradiças.</p>
        </div>
      </div>

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
                disabled={!movementAmount || movementAmount <= 0 || (movementType === 'saida' && movementAmount > editingItem.estoque)}
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
    </div>
  );
}
