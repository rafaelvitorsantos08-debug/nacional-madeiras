import React, { useState } from 'react';
import { useLocalStorage } from './EstoqueModule';
import { Plus, Trash2, Search, Edit2, Save, X, FileSpreadsheet } from 'lucide-react';
import { cn } from '../lib/utils';

interface ConferenciaItem {
  id: string;
  pm: string;
  quantidade: string;
  qtdFolhas: string;
  ladosAduela: string;
  frestaAdd: string;
  pivotante: boolean;
  bandeira: boolean;
  vidro: boolean;
  fechaFresta: boolean;
  veneziana: boolean;
  grelha: boolean;
  chapa: boolean;
  camarao: boolean;
  correr: boolean;
  enchimento: string;
  largura: string;
  altura: string;
}

export function ConferenciaModule() {
  const [items, setItems] = useLocalStorage<ConferenciaItem[]>('nm_conferencia_items', []);
  const [searchTerm, setSearchTerm] = useState('');

  const addNewRow = () => {
    const newItem: ConferenciaItem = {
      id: Math.random().toString(36).substring(2, 9),
      pm: '',
      quantidade: '',
      qtdFolhas: '1',
      ladosAduela: '3',
      frestaAdd: '',
      pivotante: false,
      bandeira: false,
      vidro: false,
      fechaFresta: false,
      veneziana: false,
      grelha: false,
      chapa: false,
      camarao: false,
      correr: false,
      enchimento: 'SOLIDA',
      largura: '',
      altura: '',
    };
    setItems(prev => [...prev, newItem]);
  };

  const updateItem = (id: string, field: keyof ConferenciaItem, value: any) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const filteredItems = items.filter(item => 
    item.pm.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.largura.includes(searchTerm) || 
    item.altura.includes(searchTerm)
  );

  return (
    <div className="animate-in fade-in duration-300">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Conferência e Cadastro</h1>
          <p className="text-sm text-gray-500 mt-1">Detalhamento de Folhas de Portas e Aduelas para Obras.</p>
        </div>
        <div className="flex space-x-3 w-full md:w-auto">
           <button onClick={addNewRow} className="flex-1 md:flex-none flex items-center justify-center space-x-2 px-4 py-2 bg-brand-green rounded-lg text-white text-sm font-medium hover:bg-brand-green-dark transition-colors shadow-sm">
             <Plus className="w-4 h-4" />
             <span>Nova Linha</span>
           </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[calc(100vh-220px)]">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <div className="relative w-64">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="w-4 h-4 text-gray-400" />
            </span>
            <input
              type="text"
              placeholder="Buscar por PM..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:border-brand-green focus:ring-1 focus:ring-brand-green outline-none transition-all"
            />
          </div>
          <div className="flex items-center text-sm text-gray-500">
             <FileSpreadsheet className="w-4 h-4 mr-2" />
             {filteredItems.length} registros
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50/50">
          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
            <FileSpreadsheet className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Tabela Removida</h3>
          <p className="text-gray-500 max-w-sm">
            A tabela anterior foi removida. Aguardando as instruções para implementar o novo conceito da tabela de conferência e cadastro.
          </p>
        </div>
      </div>
    </div>
  );
}
