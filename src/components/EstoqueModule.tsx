import React, { useState } from 'react';
import { Search, Plus, Filter, ArrowUpFromLine, ArrowDownToLine, MoreHorizontal, Settings } from 'lucide-react';
import { cn } from '../lib/utils';

const CORES = ['Freijó Médio', 'Branco Pinhal', 'Branco Max', 'Preto', 'Cinza Grafite'];
const DIMENSOES_PORTA = ['600x2100', '620x2100', '600x2070', '620x2070', '700x2100', '720x2100', '800x2100', '820x2100', '900x2100', '920x2100', '1000x2100'];
const LARGURAS_ADUELA = ['90', '100', '110', '120', '130', '140', '150', '160', '170', '180', '190', '200', '210'];
const COMPRIMENTOS_ADUELA = ['2110', '2120'];
const ABA_ALIZAR = ['40', '50', '60', '70', '80'];
const ESPESSURA_ALIZAR = ['10', '15', '18', '20'];

// Mockup data
const MOCK_PORTAS = [
  { id: 'FP-01', cor: 'Branco Pinhal', dimensao: '800x2100', estoque: 145, status: 'OK' },
  { id: 'FP-02', cor: 'Freijó Médio', dimensao: '700x2100', estoque: 12, status: 'Crítico' },
  { id: 'FP-03', cor: 'Preto', dimensao: '620x2100', estoque: 45, status: 'Atenção' },
  { id: 'FP-04', cor: 'Cinza Grafite', dimensao: '900x2100', estoque: 98, status: 'OK' },
  { id: 'FP-05', cor: 'Branco Max', dimensao: '820x2100', estoque: 15, status: 'Atenção' },
];

const MOCK_ADUELAS = [
  { id: 'AD-01', cor: 'Branco Pinhal', largura: '120', comprimento: '2110', estoque: 210, status: 'OK' },
  { id: 'AD-02', cor: 'Freijó Médio', largura: '140', comprimento: '2110', estoque: 5, status: 'Crítico' },
  { id: 'AD-03', cor: 'Preto', largura: '150', comprimento: '2120', estoque: 60, status: 'OK' },
];

const MOCK_ALIZARES = [
  { id: 'AL-01', face: '50', aba: '60', espessura: '15', estoque: 450, status: 'OK' },
  { id: 'AL-02', face: '50', aba: '40', espessura: '10', estoque: 85, status: 'Atenção' },
  { id: 'AL-03', face: '50', aba: '80', espessura: '20', estoque: 12, status: 'Crítico' },
];

export function EstoqueModule() {
  const [activeSubTab, setActiveSubTab] = useState<'portas' | 'aduelas' | 'alizares'>('portas');

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
            label="Folhas de Porta Lisas"
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
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="w-4 h-4 text-gray-400" />
              </span>
              <input
                type="text"
                placeholder="Buscar por código ou especificação..."
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-brand-green focus:bg-white focus:ring-1 focus:ring-brand-green outline-none transition-all"
              />
            </div>
            <button className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 flex-shrink-0">
              <Filter className="w-4 h-4" />
            </button>
          </div>
          
          <button className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2 bg-brand-green rounded-lg text-white text-sm font-medium hover:bg-brand-green-dark transition-colors shadow-sm shadow-brand-green/30">
            <Plus className="w-4 h-4" />
            <span>Novo Registro</span>
          </button>
        </div>

        {/* DATA TABLE */}
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50/80 text-gray-500 border-b border-gray-200">
                <th className="px-6 py-3 font-medium">Código</th>
                
                {activeSubTab === 'portas' && (
                  <>
                    <th className="px-6 py-3 font-medium">Cor</th>
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
                    <th className="px-6 py-3 font-medium text-center">Face</th>
                    <th className="px-6 py-3 font-medium text-center">Aba</th>
                    <th className="px-6 py-3 font-medium text-center">Espessura</th>
                  </>
                )}

                <th className="px-6 py-3 font-medium text-right">Estoque</th>
                <th className="px-6 py-3 font-medium text-center">Status</th>
                <th className="px-6 py-3 font-medium text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {activeSubTab === 'portas' && MOCK_PORTAS.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4 font-mono text-xs text-gray-500">{item.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                       <ColorIndicator color={item.cor} />
                       <span className="font-medium text-gray-700">{item.cor}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center text-gray-600">{item.dimensao}</td>
                  <td className="px-6 py-4 text-right font-semibold text-gray-900">{item.estoque.toLocaleString()}</td>
                  <td className="px-6 py-4 text-center"><StatusBadge status={item.status} /></td>
                  <td className="px-6 py-4 text-center"><TableActions /></td>
                </tr>
              ))}

              {activeSubTab === 'aduelas' && MOCK_ADUELAS.map((item) => (
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
                  <td className="px-6 py-4 text-right font-semibold text-gray-900">{item.estoque.toLocaleString()}</td>
                  <td className="px-6 py-4 text-center"><StatusBadge status={item.status} /></td>
                  <td className="px-6 py-4 text-center"><TableActions /></td>
                </tr>
              ))}

              {activeSubTab === 'alizares' && MOCK_ALIZARES.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4 font-mono text-xs text-gray-500">{item.id}</td>
                   <td className="px-6 py-4 text-center text-gray-600">{item.face} mm</td>
                  <td className="px-6 py-4 text-center text-gray-600">{item.aba} mm</td>
                  <td className="px-6 py-4 text-center text-gray-600">{item.espessura} mm</td>
                  <td className="px-6 py-4 text-right font-semibold text-gray-900">{item.estoque.toLocaleString()}</td>
                  <td className="px-6 py-4 text-center"><StatusBadge status={item.status} /></td>
                  <td className="px-6 py-4 text-center"><TableActions /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Helpers

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
  };
  return <div className={cn("w-4 h-4 rounded-full shadow-inner", colorMap[color] || 'bg-gray-300')} />;
}

function TableActions() {
  return (
    <div className="flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <button className="p-1 rounded-md text-brand-green hover:bg-green-50" title="Entrada">
        <ArrowDownToLine className="w-4 h-4" />
      </button>
      <button className="p-1 rounded-md text-red-600 hover:bg-red-50" title="Saída">
        <ArrowUpFromLine className="w-4 h-4" />
      </button>
      <button className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100" title="Mais Opções">
        <MoreHorizontal className="w-4 h-4" />
      </button>
    </div>
  )
}
