import React, { useState } from 'react';
import { cn } from '../lib/utils';
import { Package, Truck, Target, Plus, Download } from 'lucide-react';

const DIAS_SEMANA = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

export function ControleOperacaoModule() {
  const [activeTab, setActiveTab] = useState<'saidas' | 'operacao'>('saidas');

  return (
    <div className="animate-in fade-in duration-300 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Controle x Operação</h1>
          <p className="text-sm text-gray-500 mt-1">Gerencie a saída de materiais e acompanhe o efetivo da produção.</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button 
            onClick={() => setActiveTab('saidas')}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-md transition-colors",
              activeTab === 'saidas' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            Controle de Saídas
          </button>
          <button 
            onClick={() => setActiveTab('operacao')}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-md transition-colors",
              activeTab === 'operacao' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            Operação da Produção
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        {activeTab === 'saidas' && <ControleSaidas />}
        {activeTab === 'operacao' && <OperacaoProducao />}
      </div>
    </div>
  );
}

// --- SUBMODULES ---

function useLocalStorage<T>(key: string, initialValue: T) {
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

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      setStoredValue(prev => {
        const valueToStore = value instanceof Function ? value(prev) : value;
        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
        return valueToStore;
      });
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue] as const;
}

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

function ControleSaidas() {
  const [selecionadoAno, setSelecionadoAno] = useState(new Date().getFullYear());
  const [selecionadoMes, setSelecionadoMes] = useState(new Date().getMonth()); // 0-indexed
  
  // Data structure: { 'YYYY-MM-DD': { entrega1: '', kits1: '', ... } }
  const [monthlyData, setMonthlyData] = useLocalStorage<Record<string, any>>('nm_controle_saidas', {});

  const anos = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const daysCount = getDaysInMonth(selecionadoAno, selecionadoMes);
  const rows = Array.from({ length: daysCount }, (_, i) => {
    const day = i + 1;
    const date = new Date(selecionadoAno, selecionadoMes, day);
    const dateStrKey = `${selecionadoAno}-${String(selecionadoMes + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dateStrDisplay = `${String(day).padStart(2, '0')}/${String(selecionadoMes + 1).padStart(2, '0')}/${selecionadoAno}`;
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    
    return {
      day,
      dateStrKey,
      dateStrDisplay,
      ds: DIAS_SEMANA[date.getDay()],
      isWeekend,
      isSabado: date.getDay() === 6,
      isDomingo: date.getDay() === 0,
    };
  });

  const handleInputChange = (dateStrKey: string, field: string, value: string) => {
    setMonthlyData(prev => ({
      ...prev,
      [dateStrKey]: {
        ...(prev[dateStrKey] || {}),
        [field]: value
      }
    }));
  };

  const renderInput = (row: any, field: string, className: string = "") => {
    const val = monthlyData[row.dateStrKey]?.[field] || '';
    if (row.isWeekend) return null; // weekends handled separately in JSX
    
    return (
      <input
        type="text"
        value={val}
        onChange={(e) => handleInputChange(row.dateStrKey, field, e.target.value)}
        className={cn(
          "w-full h-full min-h-[28px] px-1 bg-transparent border-none outline-none focus:bg-white focus:ring-2 focus:ring-inset focus:ring-blue-500",
          className
        )}
      />
    );
  };

  return (
    <div className="flex-1 flex flex-col max-h-full">
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
           <h2 className="font-semibold text-gray-800 flex items-center text-lg">
             <Truck className="w-5 h-5 mr-2 text-brand-green" /> Materiais Enviados (Saídas)
           </h2>
           <div className="flex items-center gap-2">
             <select 
               value={selecionadoAno} 
               onChange={(e) => setSelecionadoAno(Number(e.target.value))}
               className="p-2 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-brand-green/20 outline-none"
             >
               {anos.map(a => <option key={a} value={a}>{a}</option>)}
             </select>
             <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
               <Download className="w-4 h-4 mr-2 text-gray-500"/> Exportar
             </button>
           </div>
        </div>

        <div className="flex flex-wrap gap-1">
          {MESES.map((mes, idx) => (
             <button
               key={mes}
               onClick={() => setSelecionadoMes(idx)}
               className={cn(
                 "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                 selecionadoMes === idx 
                  ? "bg-brand-green text-white shadow-sm" 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
               )}
             >
               {mes}
             </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-gray-50 p-4">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-center text-xs whitespace-nowrap border-collapse min-w-[1200px]">
              <thead>
                <tr className="bg-gray-100 text-gray-700 border-b-2 border-gray-300">
                  <th className="p-2 border-r border-gray-300 w-12 font-bold">D/S</th>
                  <th className="p-2 border-r border-gray-300 w-24 font-bold">DATA</th>
                  {/* ENTREGA 1 */}
                  <th className="p-2 border-r border-gray-300 bg-orange-500 text-white min-w-[150px] font-bold">ENTREGA 1</th>
                  <th className="p-2 border-r border-gray-300 bg-orange-500 text-white w-20 font-bold">KITS</th>
                  <th className="p-2 border-r border-gray-300 bg-orange-500 text-white w-20 font-bold">ALIZARES</th>
                  <th className="p-2 border-r border-gray-300 bg-orange-500 text-white w-20 font-bold">FOLHAS</th>
                  <th className="p-2 border-r border-gray-300 bg-orange-500 text-white w-20 font-bold">ADUELAS</th>
                  <th className="p-2 border-r border-gray-300 bg-orange-500 text-white w-20 font-bold">RODAPÉS</th>
                  <th className="p-2 border-r border-gray-300 bg-orange-500 text-white w-20 font-bold">PAINÉIS</th>
                  {/* ENTREGA 2 */}
                  <th className="p-2 border-r border-gray-300 bg-green-600 text-white min-w-[150px] font-bold">ENTREGA 2</th>
                  <th className="p-2 border-r border-gray-300 bg-green-600 text-white w-20 font-bold">KITS</th>
                  <th className="p-2 border-r border-gray-300 bg-green-600 text-white w-20 font-bold">ALIZARES</th>
                  <th className="p-2 border-r border-gray-300 bg-green-600 text-white w-20 font-bold">FOLHAS</th>
                  <th className="p-2 border-r border-gray-300 bg-green-600 text-white w-20 font-bold">ADUELAS</th>
                  <th className="p-2 border-r border-gray-300 bg-green-600 text-white w-20 font-bold">RODAPÉS</th>
                  <th className="p-2 border-gray-300 bg-green-600 text-white w-20 font-bold">PAINÉIS</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.dateStrKey} className="border-b border-gray-200">
                    <td className="p-1.5 border-r border-gray-300 bg-gray-600 text-white font-medium">{row.ds}</td>
                    <td className="p-1.5 border-r border-gray-300 bg-white font-medium text-gray-700">{row.dateStrDisplay}</td>
                    {row.isWeekend ? (
                      <>
                        <td colSpan={7} className="p-1.5 border-r border-gray-300 bg-red-600 text-white font-bold tracking-wider">
                           {row.isSabado ? 'SABADO' : 'DOMINGO'}
                        </td>
                        <td colSpan={7} className="p-1.5 border-r border-gray-300 bg-red-600 text-white font-bold tracking-wider">
                           {row.isSabado ? 'SABADO' : 'DOMINGO'}
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="p-0 border-r border-gray-300 bg-orange-100">{renderInput(row, 'e1_desc', 'text-left font-medium text-gray-800')}</td>
                        <td className="p-0 border-r border-gray-300 bg-orange-50">{renderInput(row, 'e1_kits')}</td>
                        <td className="p-0 border-r border-gray-300 bg-orange-50">{renderInput(row, 'e1_alizares')}</td>
                        <td className="p-0 border-r border-gray-300 bg-orange-50">{renderInput(row, 'e1_folhas')}</td>
                        <td className="p-0 border-r border-gray-300 bg-orange-50">{renderInput(row, 'e1_aduelas')}</td>
                        <td className="p-0 border-r border-gray-300 bg-orange-50">{renderInput(row, 'e1_rodapes')}</td>
                        <td className="p-0 border-r border-gray-300 bg-orange-50">{renderInput(row, 'e1_paineis')}</td>
                        
                        <td className="p-0 border-r border-gray-300 bg-green-100">{renderInput(row, 'e2_desc', 'text-left font-medium text-gray-800')}</td>
                        <td className="p-0 border-r border-gray-300 bg-green-50">{renderInput(row, 'e2_kits')}</td>
                        <td className="p-0 border-r border-gray-300 bg-green-50">{renderInput(row, 'e2_alizares')}</td>
                        <td className="p-0 border-r border-gray-300 bg-green-50">{renderInput(row, 'e2_folhas')}</td>
                        <td className="p-0 border-r border-gray-300 bg-green-50">{renderInput(row, 'e2_aduelas')}</td>
                        <td className="p-0 border-r border-gray-300 bg-green-50">{renderInput(row, 'e2_rodapes')}</td>
                        <td className="p-0 border-transparent bg-green-50">{renderInput(row, 'e2_paineis')}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

function OperacaoProducao() {
  const [selecionadoAno, setSelecionadoAno] = useState(new Date().getFullYear());
  const [selecionadoMes, setSelecionadoMes] = useState(new Date().getMonth()); // 0-indexed
  
  const anos = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  // Storage
  const [operacaoData, setOperacaoData] = useLocalStorage<Record<string, any>>('nm_operacao_producao', {});

  const getDaysArray = (year: number, month: number) => {
    const numDays = new Date(year, month + 1, 0).getDate();
    return Array.from({length: numDays}, (_, i) => {
      const date = new Date(year, month, i + 1);
      const dateStrKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`;
      return {
        dateStrKey,
        dateStr: date.toLocaleDateString('pt-BR'),
        isWeekend: date.getDay() === 0 || date.getDay() === 6
      }
    });
  };

  const daysThisMonth = getDaysArray(selecionadoAno, selecionadoMes);

  const handleInputChange = (dateStrKey: string, field: string, value: string) => {
    setOperacaoData(prev => ({
      ...prev,
      [dateStrKey]: {
        ...(prev[dateStrKey] || {}),
        [field]: value
      }
    }));
  };

  const renderInput = (day: any, field: string, className: string = "") => {
    const val = operacaoData[day.dateStrKey]?.[field] || '';
    if (day.isWeekend) return null;
    return (
      <input
        type="text"
        value={val}
        onChange={(e) => handleInputChange(day.dateStrKey, field, e.target.value)}
        className={cn(
          "w-full h-full min-h-[29px] bg-transparent text-center border-none outline-none focus:bg-white focus:ring-2 focus:ring-inset focus:ring-blue-500",
          className
        )}
      />
    );
  };

  const renderMonthSection = (days: any[], title: string) => {
    // Break days into chunks of 7 to form columns similar to excel
    const chunkSize = 7;
    const columns = [];
    for (let i = 0; i < days.length; i += chunkSize) {
      columns.push(days.slice(i, i + chunkSize));
    }

    // calculate total
    const totalMes = days.reduce((acc, day) => {
       const qty = parseInt(operacaoData[day.dateStrKey]?.quantidade || '0', 10);
       return acc + (isNaN(qty) ? 0 : qty);
    }, 0);

    return (
      <div className="mb-8">
        <div className="flex">
          <div className="bg-blue-600 text-white font-bold p-2 px-4 shadow-sm w-[350px] uppercase">
            {title}
          </div>
          <div className="bg-blue-600 text-white font-bold p-2 px-4 text-center ml-1 flex-1 shadow-sm">
            {totalMes}
          </div>
        </div>
        
        <div className="flex gap-1 mt-1 overflow-x-auto pb-4">
          {columns.map((col, idx) => (
            <table key={idx} className="text-center text-xs whitespace-nowrap min-w-[200px] border-collapse flex-none">
              <thead>
                <tr className="bg-black text-white">
                  <th className="p-1.5 border border-gray-400">DATA</th>
                  <th className="p-1.5 border border-gray-400">EFETIVO TOTAL: 15</th>
                  <th className="p-1.5 border border-gray-400">QUANTIDADE</th>
                </tr>
              </thead>
              <tbody>
                {col.map((day: any, i: number) => (
                  <tr key={i}>
                    <td className={cn(
                      "p-1.5 border border-gray-300 font-medium",
                      day.isWeekend ? "bg-red-600 text-white" : "bg-green-100"
                    )}>
                      {day.dateStr}
                    </td>
                    <td className={cn(
                      "p-0 border border-gray-300",
                      day.isWeekend ? "bg-red-600" : "bg-green-200"
                    )}>
                      {renderInput(day, 'efetivo', '')}
                    </td>
                    <td className={cn(
                      "p-0 border border-gray-300",
                      day.isWeekend ? "bg-red-600" : "bg-[#DDEBF7]" // Light blue for inputs
                    )}>
                      {renderInput(day, 'quantidade', '')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col max-h-full">
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
           <h2 className="font-semibold text-gray-800 flex items-center text-lg">
             <Target className="w-5 h-5 mr-2 text-brand-green" /> Total de Kits Montados (Operação)
           </h2>
           <div className="flex items-center gap-2">
             <select 
               value={selecionadoAno} 
               onChange={(e) => setSelecionadoAno(Number(e.target.value))}
               className="p-2 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-brand-green/20 outline-none"
             >
               {anos.map(a => <option key={a} value={a}>{a}</option>)}
             </select>
           </div>
        </div>

        <div className="flex flex-wrap gap-1">
          {MESES.map((mes, idx) => (
             <button
               key={mes}
               onClick={() => setSelecionadoMes(idx)}
               className={cn(
                 "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                 selecionadoMes === idx 
                  ? "bg-brand-green text-white shadow-sm" 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
               )}
             >
               {mes}
             </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 bg-gray-50">
        {renderMonthSection(daysThisMonth, `TOTAL EM ${MESES[selecionadoMes]}:`)}
      </div>
    </div>
  )
}
