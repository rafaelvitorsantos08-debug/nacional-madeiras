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
      id: Math.random().toString(36).substr(2, 9),
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

        <div className="flex-1 overflow-x-auto overflow-y-auto">
          <table className="w-max min-w-full text-left text-sm border-collapse">
            <thead className="sticky top-0 bg-gray-50 z-10 shadow-sm">
              <tr>
                <th colSpan={4} className="p-2 font-bold text-gray-800 border-b border-r border-gray-200 text-center bg-gray-100/80 uppercase text-xs">Identificação</th>
                <th colSpan={5} className="p-2 font-bold text-gray-800 border-b border-r border-gray-200 text-center bg-blue-50/80 uppercase text-xs">Opcionais (Fresta/Vidro)</th>
                <th colSpan={3} className="p-2 font-bold text-gray-800 border-b border-r border-gray-200 text-center bg-amber-50/80 uppercase text-xs">Aberturas</th>
                <th colSpan={3} className="p-2 font-bold text-gray-800 border-b border-r border-gray-200 text-center bg-indigo-50/80 uppercase text-xs">Movimentação / Interno</th>
                <th colSpan={2} className="p-2 font-bold text-gray-800 border-b border-r border-gray-200 text-center bg-emerald-50/80 uppercase text-xs">Dimensões</th>
                <th className="p-2 font-bold text-gray-800 border-b border-gray-200 w-12 text-center bg-gray-50"></th>
              </tr>
              <tr>
                <th className="p-2 font-semibold text-gray-600 border-b border-r border-gray-200 min-w-[120px] bg-gray-50 text-xs">PM (Tipologia)</th>
                <th className="p-2 font-semibold text-gray-600 border-b border-r border-gray-200 min-w-[80px] text-center bg-gray-50 text-xs">Qtd</th>
                <th className="p-2 font-semibold text-gray-600 border-b border-r border-gray-200 min-w-[80px] text-center bg-gray-50 text-xs">Qtd Folhas</th>
                <th className="p-2 font-semibold text-gray-600 border-b border-r border-gray-200 min-w-[80px] text-center bg-gray-50 text-xs" title="Lados Aduela">LDS Aduela</th>
                
                <th className="p-2 font-semibold text-gray-600 border-b border-r border-gray-200 min-w-[100px] text-center bg-blue-50/30 text-xs">Fresta Add.</th>
                <th className="p-2 font-semibold text-gray-600 border-b border-r border-gray-200 min-w-[80px] text-center bg-blue-50/30 text-xs">Pivotante</th>
                <th className="p-2 font-semibold text-gray-600 border-b border-r border-gray-200 min-w-[80px] text-center bg-blue-50/30 text-xs">Bandeira</th>
                <th className="p-2 font-semibold text-gray-600 border-b border-r border-gray-200 min-w-[80px] text-center bg-blue-50/30 text-xs">Vidro</th>
                <th className="p-2 font-semibold text-gray-600 border-b border-r border-gray-200 min-w-[100px] text-center bg-blue-50/30 text-xs">Fecha Fresta</th>
                
                <th className="p-2 font-semibold text-gray-600 border-b border-r border-gray-200 min-w-[80px] text-center bg-amber-50/30 text-xs">Veneziana</th>
                <th className="p-2 font-semibold text-gray-600 border-b border-r border-gray-200 min-w-[80px] text-center bg-amber-50/30 text-xs">Grelha</th>
                <th className="p-2 font-semibold text-gray-600 border-b border-r border-gray-200 min-w-[80px] text-center bg-amber-50/30 text-xs">Chapa</th>
                
                <th className="p-2 font-semibold text-gray-600 border-b border-r border-gray-200 min-w-[80px] text-center bg-indigo-50/30 text-xs">Camarão</th>
                <th className="p-2 font-semibold text-gray-600 border-b border-r border-gray-200 min-w-[80px] text-center bg-indigo-50/30 text-xs">Correr</th>
                <th className="p-2 font-semibold text-gray-600 border-b border-r border-gray-200 min-w-[120px] bg-indigo-50/30 text-xs">Enchimento</th>
                
                <th className="p-2 font-semibold text-gray-600 border-b border-r border-gray-200 min-w-[80px] text-center bg-emerald-50/30 text-xs">Largura</th>
                <th className="p-2 font-semibold text-gray-600 border-b border-r border-gray-200 min-w-[80px] text-center bg-emerald-50/30 text-xs">Altura</th>
                <th className="p-2 font-semibold text-gray-600 border-b border-gray-200 w-12 text-center bg-gray-50 text-xs"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredItems.map(item => (
                <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="p-0 border-r border-gray-200 bg-purple-50/30">
                    <input 
                      className="w-full h-full p-2 bg-transparent outline-none focus:bg-white" 
                      value={item.pm} 
                      onChange={(e) => updateItem(item.id, 'pm', e.target.value)} 
                      placeholder="Ex: PM1"
                    />
                  </td>
                  <td className="p-0 border-r border-gray-200">
                    <input 
                      className="w-full h-full p-2 bg-transparent outline-none focus:bg-white text-center" 
                      value={item.quantidade} 
                      onChange={(e) => updateItem(item.id, 'quantidade', e.target.value)} 
                    />
                  </td>
                  <td className="p-0 border-r border-gray-200">
                    <select 
                      className="w-full h-full p-2 bg-transparent outline-none focus:bg-white cursor-pointer text-center"
                      value={item.qtdFolhas}
                      onChange={(e) => updateItem(item.id, 'qtdFolhas', e.target.value)}
                    >
                      <option value="1">1</option>
                      <option value="2">2</option>
                    </select>
                  </td>
                  <td className="p-0 border-r border-gray-200">
                    <select 
                      className="w-full h-full p-2 bg-transparent outline-none focus:bg-white cursor-pointer text-center"
                      value={item.ladosAduela}
                      onChange={(e) => updateItem(item.id, 'ladosAduela', e.target.value)}
                    >
                      <option value="3">3</option>
                      <option value="4">4</option>
                    </select>
                  </td>
                  <td className="p-0 border-r border-gray-200">
                    <input 
                      className="w-full h-full p-2 bg-transparent outline-none focus:bg-white text-center" 
                      value={item.frestaAdd} 
                      onChange={(e) => updateItem(item.id, 'frestaAdd', e.target.value)} 
                    />
                  </td>
                  <td className="p-0 border-r border-gray-200 text-center">
                    <input 
                      type="checkbox"
                      className="w-4 h-4 cursor-pointer accent-brand-green" 
                      checked={item.pivotante} 
                      onChange={(e) => updateItem(item.id, 'pivotante', e.target.checked)} 
                    />
                  </td>
                  <td className="p-0 border-r border-gray-200 text-center">
                    <input 
                      type="checkbox"
                      className="w-4 h-4 cursor-pointer accent-brand-green" 
                      checked={item.bandeira} 
                      onChange={(e) => updateItem(item.id, 'bandeira', e.target.checked)} 
                    />
                  </td>
                  <td className="p-0 border-r border-gray-200 text-center">
                    <input 
                      type="checkbox"
                      className="w-4 h-4 cursor-pointer accent-brand-green" 
                      checked={item.vidro} 
                      onChange={(e) => updateItem(item.id, 'vidro', e.target.checked)} 
                    />
                  </td>
                  <td className="p-0 border-r border-gray-200 text-center">
                    <input 
                      type="checkbox"
                      className="w-4 h-4 cursor-pointer accent-brand-green" 
                      checked={item.fechaFresta} 
                      onChange={(e) => updateItem(item.id, 'fechaFresta', e.target.checked)} 
                    />
                  </td>
                  <td className="p-0 border-r border-gray-200 text-center">
                    <input 
                      type="checkbox"
                      className="w-4 h-4 cursor-pointer accent-brand-green" 
                      checked={item.veneziana} 
                      onChange={(e) => updateItem(item.id, 'veneziana', e.target.checked)} 
                    />
                  </td>
                  <td className="p-0 border-r border-gray-200 text-center">
                    <input 
                      type="checkbox"
                      className="w-4 h-4 cursor-pointer accent-brand-green" 
                      checked={item.grelha} 
                      onChange={(e) => updateItem(item.id, 'grelha', e.target.checked)} 
                    />
                  </td>
                  <td className="p-0 border-r border-gray-200 text-center">
                    <input 
                      type="checkbox"
                      className="w-4 h-4 cursor-pointer accent-brand-green" 
                      checked={item.chapa} 
                      onChange={(e) => updateItem(item.id, 'chapa', e.target.checked)} 
                    />
                  </td>
                  <td className="p-0 border-r border-gray-200 text-center">
                    <input 
                      type="checkbox"
                      className="w-4 h-4 cursor-pointer accent-brand-green" 
                      checked={item.camarao} 
                      onChange={(e) => updateItem(item.id, 'camarao', e.target.checked)} 
                    />
                  </td>
                  <td className="p-0 border-r border-gray-200 text-center">
                    <input 
                      type="checkbox"
                      className="w-4 h-4 cursor-pointer accent-brand-green" 
                      checked={item.correr} 
                      onChange={(e) => updateItem(item.id, 'correr', e.target.checked)} 
                    />
                  </td>
                  <td className="p-0 border-r border-gray-200">
                    <select 
                      className="w-full h-full p-2 bg-transparent outline-none focus:bg-white cursor-pointer uppercase text-xs font-semibold"
                      value={item.enchimento}
                      onChange={(e) => updateItem(item.id, 'enchimento', e.target.value)}
                    >
                      <option value="SOLIDA">SOLIDA</option>
                      <option value="SARRAFEADA">SARRAFEADA</option>
                      <option value="COLMEIA">HONEY (COLMEIA)</option>
                    </select>
                  </td>
                  <td className="p-0 border-r border-gray-200 bg-green-50/30">
                    <input 
                      className="w-full h-full p-2 bg-transparent outline-none focus:bg-white text-center font-mono" 
                      value={item.largura} 
                      onChange={(e) => updateItem(item.id, 'largura', e.target.value)} 
                      placeholder="Larg"
                    />
                  </td>
                  <td className="p-0 border-r border-gray-200 bg-green-50/30">
                    <input 
                      className="w-full h-full p-2 bg-transparent outline-none focus:bg-white text-center font-mono" 
                      value={item.altura} 
                      onChange={(e) => updateItem(item.id, 'altura', e.target.value)} 
                      placeholder="Alt"
                    />
                  </td>
                  <td className="p-2 text-center group">
                    <button 
                      onClick={() => removeItem(item.id)} 
                      className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4 mx-auto" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={18} className="p-8 text-center text-gray-500">
                     Nenhuma linha cadastrada. Clique em "Nova Linha" para começar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
