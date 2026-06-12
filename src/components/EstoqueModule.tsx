import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, ArrowUpFromLine, ArrowDownToLine, Edit2, Trash2, X } from 'lucide-react';
import { cn } from '../lib/utils';

export const CORES = ['Freijó Médio', 'Branco Pinhal', 'Branco Max', 'Preto', 'Cinza Grafite', 'Primer', 'Nogal Mel', 'Currupixá', 'Basic'];
export const ENCHIMENTOS_PORTA = ['Colmeia', 'Semi Solida', 'Bondor'];
export const MODELOS_PORTA = ['Com Bit', 'Lisa'];
export const DIMENSOES_PORTA = ['600x2100', '620x2100', '600x2070', '620x2070', '70x2110', '70x2120', '80x2110', '700x2100', '720x2100', '700x2070', '720x2070', '800x2100', '820x2100', '800x2070', '820x2070', '900x2100', '920x2100', '900x2070', '920x2070', '1000x2100'];
export const LARGURAS_ADUELA = ['70', '80', '90', '100', '110', '120', '130', '140', '150', '160', '170', '180', '190', '200', '210'];
export const COMPRIMENTOS_ADUELA = ['2110', '2120'];
export const FACE_ALIZAR = ['30', '40', '50', '60', '70', '80', '100'];
export const ABA_ALIZAR = ['08', '40', '50', '60', '70', '80'];
export const ESPESSURA_ALIZAR = ['10', '15', '18', '20'];
export const COMPRIMENTOS_ALIZAR = ['1000', '2250', '2700'];

// Mockup data
export const INITIAL_PORTAS = [
  { id: 'FP-01', cor: 'Branco Pinhal', dimensao: '800x2100', enchimento: 'Colmeia', modelo: 'Lisa', estoque: 145, status: 'OK' },
  { id: 'FP-02', cor: 'Freijó Médio', dimensao: '700x2100', enchimento: 'Semi Solida', modelo: 'Com Bit', estoque: 12, status: 'Crítico' },
  { id: 'FP-03', cor: 'Preto', dimensao: '620x2100', enchimento: 'Bondor', modelo: 'Lisa', estoque: 45, status: 'Atenção' },
  { id: 'FP-04', cor: 'Cinza Grafite', dimensao: '900x2100', enchimento: 'Colmeia', modelo: 'Lisa', estoque: 98, status: 'OK' },
  { id: 'FP-05', cor: 'Branco Max', dimensao: '820x2100', enchimento: 'Semi Solida', modelo: 'Com Bit', estoque: 15, status: 'Atenção' },
];

export const INITIAL_ADUELAS = [
  { id: 'AD-01', cor: 'Branco Pinhal', largura: '120', comprimento: '2110', estoque: 210, status: 'OK' },
  { id: 'AD-02', cor: 'Freijó Médio', largura: '140', comprimento: '2110', estoque: 5, status: 'Crítico' },
  { id: 'AD-03', cor: 'Preto', largura: '150', comprimento: '2120', estoque: 60, status: 'OK' },
];

export const INITIAL_ALIZARES = [
  { id: 'AL-01', cor: 'Branco Pinhal', face: '50', aba: '60', espessura: '15', comprimento: '2700', estoque: 450, status: 'OK' },
  { id: 'AL-02', cor: 'Freijó Médio', face: '50', aba: '40', espessura: '10', comprimento: '2250', estoque: 85, status: 'Atenção' },
  { id: 'AL-03', cor: 'Preto', face: '50', aba: '80', espessura: '20', comprimento: '2250', estoque: 12, status: 'Crítico' },
];

import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

export const forceSyncAllToCloud = async () => {
  if (!auth.currentUser) {
    alert("Você precisa estar logado para sincronizar.");
    return;
  }
  const keys = [];
  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i);
    if (key && key.startsWith('nm_') && !key.startsWith('nm_active_') && key !== 'nm_dark_mode') {
      keys.push(key);
    }
  }
  const dataToSync: Record<string, any> = { userId: auth.currentUser.uid };
  for (const key of keys) {
    try {
      const val = window.localStorage.getItem(key);
      if (val) dataToSync[key] = JSON.parse(val);
    } catch(e) {}
  }
  try {
    await setDoc(doc(db, 'user_configs', auth.currentUser.uid), dataToSync, { merge: true });
    alert("Sincronização concluída! Seus dados desta máquina agora estão na nuvem e aparecerão em seus outros dispositivos.");
  } catch (e: any) {
    console.error(e);
    alert("Erro ao sincronizar: " + e.message);
  }
};

import { subscribeToSync, pushToFirestore } from '../lib/firestoreSync';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const item = window.localStorage.getItem(key);
        if (item) {
          const parsed = JSON.parse(item);
          setStoredValue(prev => {
            if (JSON.stringify(prev) === JSON.stringify(parsed)) {
              return prev;
            }
            return parsed;
          });
        }
      } catch (err) {
        console.error(err);
      }
    };
    
    const handleNativeStorage = (e: StorageEvent) => {
      if (e.key === key) handleStorageChange();
    };

    window.addEventListener('local-storage-sync', handleStorageChange);
    window.addEventListener('storage', handleNativeStorage);
    return () => {
      window.removeEventListener('local-storage-sync', handleStorageChange);
      window.removeEventListener('storage', handleNativeStorage);
    }
  }, [key]);

  useEffect(() => {
    const unsubscribeSync = subscribeToSync(key, (val) => {
      if (typeof window !== "undefined" && window.localStorage.getItem(key + '_dirty') === 'true') {
        pushToFirestore(key, storedValue);
        window.localStorage.removeItem(key + '_dirty');
        return;
      }

      setStoredValue(prev => {
        if (JSON.stringify(prev) === JSON.stringify(val)) {
          return prev;
        }
        if (typeof window !== "undefined") {
           window.localStorage.setItem(key, JSON.stringify(val));
           window.dispatchEvent(new Event('local-storage-sync'));
        }
        return val;
      });
    });

    return () => {
      unsubscribeSync();
    };
  }, [key]);

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      setStoredValue(prev => {
        const valueToStore = value instanceof Function ? value(prev) : value;
        
        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
          if (JSON.stringify(prev) !== JSON.stringify(valueToStore)) {
            window.dispatchEvent(new Event('local-storage-sync'));
          }
        }
        
        if (auth.currentUser && !key.startsWith('nm_active_') && key !== 'nm_dark_mode') {
          if (typeof window !== "undefined") {
            window.localStorage.setItem(key + '_dirty', 'true');
          }
          pushToFirestore(key, valueToStore);
          if (typeof window !== "undefined") {
            window.localStorage.removeItem(key + '_dirty');
          }
        }

        return valueToStore;
      });
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue] as const;
}

export function EstoqueModule({ globalSearch = '' }: { globalSearch?: string }) {
  const [activeSubTab, setActiveSubTab] = useLocalStorage<'portas' | 'aduelas' | 'alizares'>('nm_active_sub_tab', 'portas');
  
  const [portas, setPortas] = useLocalStorage('nm_portas', INITIAL_PORTAS);
  const [aduelas, setAduelas] = useLocalStorage('nm_aduelas', INITIAL_ADUELAS);
  const [alizares, setAlizares] = useLocalStorage('nm_alizares', INITIAL_ALIZARES);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null); // null means adding a new item

  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('Todos');

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja apagar este registro?')) {
      if (activeSubTab === 'portas') setPortas(prev => prev.filter(item => item.id !== id));
      if (activeSubTab === 'aduelas') setAduelas(prev => prev.filter(item => item.id !== id));
      if (activeSubTab === 'alizares') setAlizares(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const baseList: any[] = activeSubTab === 'portas' ? (Array.isArray(portas) ? portas : []) : (activeSubTab === 'aduelas' ? (Array.isArray(aduelas) ? aduelas : []) : (Array.isArray(alizares) ? alizares : []));

  const filteredList = baseList.filter(item => {
    const combinedSearchTerm = (searchTerm || globalSearch || "").trim();
    const matchesStatus = statusFilter === 'Todos' || item.status === statusFilter;
    
    if (!combinedSearchTerm) {
      return matchesStatus;
    }

    const normSearch = combinedSearchTerm.toLowerCase().replace(/\s+/g, '').replace(/×/g, 'x');
    
    const normId = String(item.id || '').toLowerCase().replace(/\s+/g, '');
    const normDimensao = String(item.dimensao || '').toLowerCase().replace(/\s+/g, '').replace(/×/g, 'x');
    const normLargura = String(item.largura || '').toLowerCase().replace(/\s+/g, '');
    const normComprimento = String(item.comprimento || '').toLowerCase().replace(/\s+/g, '');
    const normLargComp = (normLargura && normComprimento) ? `${normLargura}x${normComprimento}` : '';

    let isMatch = false;

    // Match exato
    if (normId === normSearch || normDimensao === normSearch || normLargComp === normSearch) {
      isMatch = true;
    } 
    // Match parcial (se o usuário digitar apenas "800x" ou "PO-6")
    else if (normId.includes(normSearch) || normDimensao.includes(normSearch) || normLargComp.includes(normSearch)) {
      isMatch = true;
    }

    return isMatch && matchesStatus;
  });

  // If there's an exact match in the filtered results, we isolate just those exact matches
  // to avoid "PO-61" bringing "PO-611" if the user strictly typed "PO-61".
  const normCombinedSearchTerm = (searchTerm || globalSearch || "").trim().toLowerCase().replace(/\s+/g, '').replace(/×/g, 'x');
  const hasExactMatch = normCombinedSearchTerm && filteredList.some(item => {
    const id = String(item.id || '').toLowerCase().replace(/\s+/g, '');
    const dim = String(item.dimensao || '').toLowerCase().replace(/\s+/g, '').replace(/×/g, 'x');
    const lxc = (item.largura && item.comprimento) ? `${String(item.largura).trim()}x${String(item.comprimento).trim()}`.toLowerCase() : '';
    return id === normCombinedSearchTerm || dim === normCombinedSearchTerm || lxc === normCombinedSearchTerm;
  });
  
  const finalFilteredList = hasExactMatch 
    ? filteredList.filter(item => {
        const id = String(item.id || '').toLowerCase().replace(/\s+/g, '');
        const dim = String(item.dimensao || '').toLowerCase().replace(/\s+/g, '').replace(/×/g, 'x');
        const lxc = (item.largura && item.comprimento) ? `${String(item.largura).trim()}x${String(item.comprimento).trim()}`.toLowerCase() : '';
        return id === normCombinedSearchTerm || dim === normCombinedSearchTerm || lxc === normCombinedSearchTerm;
      })
    : filteredList;

  return (
    <div className="animate-in fade-in duration-300">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Componentes e Peças</h1>
        <p className="text-sm text-gray-500 mt-1">Gerencie o estoque detalhado de folhas, aduelas e alizares.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        {/* SUBTABS */}
        <div className="flex border-b border-gray-200 bg-gray-50/50 px-4 pt-2">
          <SubTabButton
            active={activeSubTab === 'portas'}
            onClick={() => setActiveSubTab('portas')}
            label="Folhas de Portas"
          />
          <SubTabButton
            active={activeSubTab === 'aduelas'}
            onClick={() => setActiveSubTab('aduelas')}
            label="Aduelas / Batentes"
          />
          <SubTabButton
            active={activeSubTab === 'alizares'}
            onClick={() => setActiveSubTab('alizares')}
            label="Alizares"
          />
        </div>

        {/* TOOLBAR */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0 print:hidden">
          <div className="flex items-center space-x-3 w-full sm:w-auto relative">
            <div className="relative flex-1 sm:w-64">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="w-4 h-4 text-gray-400" />
              </span>
              <input
                type="text"
                placeholder="Buscar por código ou especificação..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-brand-green focus:ring-1 focus:ring-brand-green outline-none transition-all"
              />
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
                className={`p-2 border rounded-lg hover:bg-gray-50 flex-shrink-0 transition-colors ${statusFilter !== 'Todos' ? 'bg-brand-green/10 border-brand-green text-brand-green' : 'border-gray-200 text-gray-600'}`}
              >
                <Filter className="w-4 h-4" />
              </button>
              
              {isFilterMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsFilterMenuOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden divide-y divide-gray-100">
                    <div className="p-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Filtrar por Status
                    </div>
                    <div className="p-1">
                      {['Todos', 'OK', 'Atenção', 'Crítico'].map((status) => (
                        <button
                          key={status}
                          onClick={() => { setStatusFilter(status); setIsFilterMenuOpen(false); }}
                          className={`w-full text-left px-3 py-2 text-sm rounded-lg flex items-center justify-between ${statusFilter === status ? 'bg-brand-green/10 text-brand-green font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
                        >
                          {status}
                          {statusFilter === status && <div className="w-1.5 h-1.5 rounded-full bg-brand-green"></div>}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          
          <button onClick={handleCreate} className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2 bg-brand-green rounded-lg text-white text-sm font-medium hover:bg-brand-green-dark transition-colors shadow-sm shadow-brand-green/30">
            <Plus className="w-4 h-4" />
            <span>Novo Registro</span>
          </button>
        </div>

        {/* DATA TABLE */}
        <div className="overflow-x-auto print:overflow-visible min-h-[400px] print:min-h-0">
          <table className="w-full text-left text-sm whitespace-nowrap print:whitespace-normal">
            <thead>
              <tr className="bg-gray-50/80 text-gray-500 border-b border-gray-200">
                <th className="px-6 py-3 font-medium">Código</th>
                
                {activeSubTab === 'portas' && (
                  <>
                    <th className="px-6 py-3 font-medium">Cor</th>
                    <th className="px-6 py-3 font-medium text-center">Modelo</th>
                    <th className="px-6 py-3 font-medium text-center">Enchimento</th>
                    <th className="px-6 py-3 font-medium text-center">Dimensões</th>
                  </>
                )}
                {activeSubTab === 'aduelas' && (
                  <>
                    <th className="px-6 py-3 font-medium">Cor</th>
                    <th className="px-6 py-3 font-medium text-center">Largura</th>
                    <th className="px-6 py-3 font-medium text-center">Comprimento</th>
                  </>
                )}
                {activeSubTab === 'alizares' && (
                  <>
                    <th className="px-6 py-3 font-medium">Cor</th>
                    <th className="px-6 py-3 font-medium text-center">Comprimento</th>
                    <th className="px-6 py-3 font-medium text-center">Face</th>
                    <th className="px-6 py-3 font-medium text-center">Aba</th>
                    <th className="px-6 py-3 font-medium text-center">Espessura</th>
                  </>
                )}

                <th className="px-6 py-3 font-medium text-right">Estoque</th>
                <th className="px-6 py-3 font-medium text-center">Status</th>
                <th className="px-6 py-3 font-medium text-center print:hidden">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {activeSubTab === 'portas' && finalFilteredList.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4 font-mono text-xs text-gray-500">{item.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                       <ColorIndicator color={item.cor} />
                       <span className="font-medium text-gray-700">{item.cor}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center text-gray-600">{item.modelo || '-'}</td>
                  <td className="px-6 py-4 text-center text-gray-600">{item.enchimento || '-'}</td>
                  <td className="px-6 py-4 text-center text-gray-600">{item.dimensao}</td>
                  <td className="px-6 py-4 text-right font-semibold text-gray-900">{Number(item.estoque || 0).toLocaleString('pt-BR')}</td>
                  <td className="px-6 py-4 text-center"><StatusBadge status={item.status} /></td>
                  <td className="px-6 py-4 text-center print:hidden">
                    <TableActions onEdit={() => handleEdit(item)} onDelete={() => handleDelete(item.id)} />
                  </td>
                </tr>
              ))}

              {activeSubTab === 'aduelas' && finalFilteredList.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4 font-mono text-xs text-gray-500">{item.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                       <ColorIndicator color={item.cor} />
                       <span className="font-medium text-gray-700">{item.cor}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center text-gray-600">{item.largura} mm</td>
                  <td className="px-6 py-4 text-center text-gray-600">{item.comprimento} mm</td>
                  <td className="px-6 py-4 text-right font-semibold text-gray-900">{Number(item.estoque || 0).toLocaleString('pt-BR')}</td>
                  <td className="px-6 py-4 text-center"><StatusBadge status={item.status} /></td>
                  <td className="px-6 py-4 text-center print:hidden">
                    <TableActions onEdit={() => handleEdit(item)} onDelete={() => handleDelete(item.id)} />
                  </td>
                </tr>
              ))}

              {activeSubTab === 'alizares' && finalFilteredList.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4 font-mono text-xs text-gray-500">{item.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                       <ColorIndicator color={item.cor} />
                       <span className="font-medium text-gray-700">{item.cor}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center text-gray-600">{item.comprimento} mm</td>
                  <td className="px-6 py-4 text-center text-gray-600">{item.face} mm</td>
                  <td className="px-6 py-4 text-center text-gray-600">{item.aba} mm</td>
                  <td className="px-6 py-4 text-center text-gray-600">{item.espessura} mm</td>
                  <td className="px-6 py-4 text-right font-semibold text-gray-900">{Number(item.estoque || 0).toLocaleString('pt-BR')}</td>
                  <td className="px-6 py-4 text-center"><StatusBadge status={item.status} /></td>
                  <td className="px-6 py-4 text-center print:hidden">
                    <TableActions onEdit={() => handleEdit(item)} onDelete={() => handleDelete(item.id)} />
                  </td>
                </tr>
              ))}
              
              {finalFilteredList.length === 0 && (
                 <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                       Nenhum registro encontrado.
                    </td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <RegistryModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          item={editingItem}
          type={activeSubTab}
          onSave={(newItem) => {
            const estoqueNum = Number(newItem.estoque || 0);
            const getStatus = (estoque: number) => estoque > 50 ? 'OK' : (estoque > 20 ? 'Atenção' : 'Crítico');
            const saveItem = { ...newItem, estoque: estoqueNum, status: getStatus(estoqueNum) };

            if (editingItem) {
              if (activeSubTab === 'portas') setPortas(prev => (Array.isArray(prev) ? prev : []).map((i: any) => i.id === editingItem.id ? saveItem : i));
              if (activeSubTab === 'aduelas') setAduelas(prev => (Array.isArray(prev) ? prev : []).map((i: any) => i.id === editingItem.id ? saveItem : i));
              if (activeSubTab === 'alizares') setAlizares(prev => (Array.isArray(prev) ? prev : []).map((i: any) => i.id === editingItem.id ? saveItem : i));
            } else {
              saveItem.id = `${activeSubTab.substring(0, 2).toUpperCase()}-${Math.floor(Math.random() * 1000)}`;
              if (activeSubTab === 'portas') setPortas(prev => [...(Array.isArray(prev) ? prev : []), saveItem]);
              if (activeSubTab === 'aduelas') setAduelas(prev => [...(Array.isArray(prev) ? prev : []), saveItem]);
              if (activeSubTab === 'alizares') setAlizares(prev => [...(Array.isArray(prev) ? prev : []), saveItem]);
            }
            setIsModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

// Helpers

function RegistryModal({ isOpen, onClose, item, type, onSave }: any) {
  if (!isOpen) return null;

  const [formData, setFormData] = useState<any>(item || { estoque: 0 });
  const [isCustomDim, setIsCustomDim] = useState<boolean>(() => {
    if (item && type === 'portas' && item.dimensao) {
      return !DIMENSOES_PORTA.includes(item.dimensao);
    }
    return false;
  });
  const [isCustomCor, setIsCustomCor] = useState<boolean>(() => {
    if (item && item.cor && !CORES.includes(item.cor)) {
      return true;
    }
    return false;
  });

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDimensaoSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === 'Outra') {
      setIsCustomDim(true);
      setFormData({ ...formData, dimensao: '' });
    } else {
      setIsCustomDim(false);
      setFormData({ ...formData, dimensao: e.target.value });
    }
  };

  const handleCorSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === 'Outra') {
      setIsCustomCor(true);
      setFormData({ ...formData, cor: '' });
    } else {
      setIsCustomCor(false);
      setFormData({ ...formData, cor: e.target.value });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-semibold text-lg text-gray-800">
            {item ? 'Editar Registro' : 'Novo Registro'}
          </h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors focus:outline-none">
            <X className="w-5 h-5"/>
          </button>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Campos Específicos por Tipo */}
            {(type === 'portas' || type === 'aduelas' || type === 'alizares') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cor</label>
                <select value={isCustomCor ? 'Outra' : (formData.cor || '')} onChange={handleCorSelectChange} required={!isCustomCor} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none h-10 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                  <option value="" disabled>Selecione uma cor...</option>
                  {CORES.map(c => <option key={c} value={c}>{c}</option>)}
                  <option value="Outra">Outra (Personalizada)</option>
                </select>
                {isCustomCor && (
                  <input type="text" name="cor" value={formData.cor || ''} onChange={handleChange} required placeholder="Ex: Azul Real" className="w-full p-2 mt-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none h-10 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
                )}
              </div>
            )}

            {type === 'portas' && (
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Modelo</label>
                    <select name="modelo" value={formData.modelo || ''} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none h-10 bg-white">
                      <option value="" disabled>Selecione...</option>
                      {MODELOS_PORTA.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Enchimento</label>
                    <select name="enchimento" value={formData.enchimento || ''} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none h-10 bg-white">
                      <option value="" disabled>Selecione...</option>
                      {ENCHIMENTOS_PORTA.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dimensão</label>
                    <select value={isCustomDim ? 'Outra' : (formData.dimensao || '')} onChange={handleDimensaoSelectChange} required={!isCustomDim} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none h-10 bg-white">
                      <option value="" disabled>Selecione...</option>
                      {DIMENSOES_PORTA.map(d => <option key={d} value={d}>{d}</option>)}
                      <option value="Outra">Outra (Personalizada)</option>
                    </select>
                    {isCustomDim && (
                      <input type="text" name="dimensao" value={formData.dimensao || ''} onChange={handleChange} required placeholder="Ex: 850x2100" className="w-full p-2 mt-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none h-10" />
                    )}
                  </div>
               </div>
            )}

            {type === 'aduelas' && (
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Largura</label>
                    <select name="largura" value={formData.largura || ''} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none h-10 bg-white">
                      <option value="" disabled>Selecione...</option>
                      {LARGURAS_ADUELA.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Comprimento</label>
                    <select name="comprimento" value={formData.comprimento || ''} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none h-10 bg-white">
                      <option value="" disabled>Selecione...</option>
                      {COMPRIMENTOS_ADUELA.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
               </div>
            )}

            {type === 'alizares' && (
               <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Comprimento</label>
                    <select name="comprimento" value={formData.comprimento || ''} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none h-10 bg-white">
                      <option value="" disabled>Selecione...</option>
                      {COMPRIMENTOS_ALIZAR.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Face</label>
                      <select name="face" value={formData.face || ''} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none h-10 bg-white">
                        <option value="" disabled>Selecione...</option>
                        {FACE_ALIZAR.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Aba</label>
                      <select name="aba" value={formData.aba || ''} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none h-10 bg-white">
                        <option value="" disabled>Selecione...</option>
                        {ABA_ALIZAR.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Espessura</label>
                      <select name="espessura" value={formData.espessura || ''} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none h-10 bg-white">
                        <option value="" disabled>Selecione...</option>
                        {ESPESSURA_ALIZAR.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                  </div>
               </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estoque</label>
              <input type="number" name="estoque" value={formData.estoque} onChange={handleChange} min="0" required className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none h-10" />
            </div>

            <div className="pt-4 flex justify-end space-x-3">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">Cancelar</button>
              <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-brand-green hover:bg-brand-green-dark rounded-lg transition-colors">Salvar Registro</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function SubTabButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-3 text-sm font-medium border-b-2 transition-colors",
        active
          ? "border-brand-green text-brand-green"
          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
      )}
    >
      {label}
    </button>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn(
      "inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border",
      status === 'OK' && "bg-green-50 text-brand-green border-green-200",
      status === 'Atenção' && "bg-yellow-50 text-yellow-700 border-yellow-200",
      status === 'Crítico' && "bg-red-50 text-red-700 border-red-200"
    )}>
      {status === 'OK' && <span className="w-1.5 h-1.5 rounded-full bg-brand-green mr-1.5"></span>}
      {status === 'Atenção' && <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 mr-1.5"></span>}
      {status === 'Crítico' && <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5"></span>}
      {status}
    </span>
  );
}

function ColorIndicator({ color }: { color: string }) {
  const colorMap: Record<string, string> = {
    'Freijó Médio': 'bg-[#B08D5B]',
    'Branco Pinhal': 'bg-[#F2F4F3]',
    'Branco Max': 'bg-[#FFFFFF] border border-gray-200',
    'Preto': 'bg-[#222222]',
    'Cinza Grafite': 'bg-[#555555]',
    'Primer': 'bg-[#D3D3D3]',
    'Nogal Mel': 'bg-[#8B5A2B]',
    'Currupixá': 'bg-[#D2B48C]',
    'Basic': 'bg-[#E5E0D8]',
  };
  return <div className={cn("w-4 h-4 rounded-full shadow-inner", colorMap[color] || 'bg-gray-300')} />;
}

function TableActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <button onClick={onEdit} className="p-1.5 rounded-md text-blue-600 hover:bg-blue-50" title="Editar">
        <Edit2 className="w-4 h-4" />
      </button>
      <button onClick={onDelete} className="p-1.5 rounded-md text-red-600 hover:bg-red-50" title="Apagar">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )
}

