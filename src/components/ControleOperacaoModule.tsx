import React, { useState, useEffect } from 'react';
import { cn } from '../lib/utils';
import { Package, Truck, Target, Plus, Download, Home, Trash2, X, FileText, History, Info } from 'lucide-react';

const DIAS_SEMANA = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

export function ControleOperacaoModule({ initialTab = 'saidas', initialMonth, globalSearch = '' }: { initialTab?: 'saidas' | 'operacao' | 'entradas', initialMonth?: number, globalSearch?: string }) {
  const [activeTab, setActiveTab] = useState<'saidas' | 'operacao' | 'entradas'>(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

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
          <button 
            onClick={() => setActiveTab('entradas')}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-md transition-colors",
              activeTab === 'entradas' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            Entrada de Obras
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        {activeTab === 'saidas' && <ControleSaidas initialMonth={initialMonth} globalSearch={globalSearch} />}
        {activeTab === 'operacao' && <OperacaoProducao initialMonth={initialMonth} globalSearch={globalSearch} />}
        {activeTab === 'entradas' && <EntradaObras globalSearch={globalSearch} />}
      </div>
    </div>
  );
}

// --- SUBMODULES ---
import { useLocalStorage, DIMENSOES_PORTA, CORES, MODELOS_PORTA } from './EstoqueModule';

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const handleTableKeyDown = (
  e: React.KeyboardEvent<HTMLInputElement>,
  rowIdx: number,
  colIdx: number,
  moduleName: string,
  maxRow: number,
  maxCol: number
) => {
  const target = e.currentTarget;
  const isAtStart = target.selectionStart === 0;
  const isAtEnd = target.selectionEnd === target.value.length;

  let nextRow = rowIdx;
  let nextCol = colIdx;

  if (e.key === 'Enter' || e.key === 'ArrowDown') {
    nextRow++;
    e.preventDefault();
  } else if (e.key === 'ArrowUp') {
    nextRow--;
    e.preventDefault();
  } else if (e.key === 'ArrowRight' && isAtEnd) {
    nextCol++;
    e.preventDefault();
  } else if (e.key === 'ArrowLeft' && isAtStart) {
    nextCol--;
    e.preventDefault();
  } else {
    return;
  }

  let attempts = 0;
  while (attempts < 40) {
    const nextInput = document.querySelector(`input[data-module="${moduleName}"][data-row="${nextRow}"][data-col="${nextCol}"]`) as HTMLInputElement | null;
    if (nextInput) {
      nextInput.focus();
      setTimeout(() => nextInput.select(), 10);
      break;
    }
    
    if (e.key === 'Enter' || e.key === 'ArrowDown') {
      nextRow++;
      if (nextRow > maxRow) break;
    } else if (e.key === 'ArrowUp') {
      nextRow--;
      if (nextRow < 1) break;
    } else if (e.key === 'ArrowRight') {
      nextCol++;
      if (nextCol > maxCol) {
        nextCol = 0;
        nextRow++;
      }
      if (nextRow > maxRow) break;
    } else if (e.key === 'ArrowLeft') {
      nextCol--;
      if (nextCol < 0) {
        nextCol = maxCol;
        nextRow--;
      }
      if (nextRow < 1) break;
    }
    attempts++;
  }
};

function ControleSaidas({ initialMonth, globalSearch = '' }: { initialMonth?: number, globalSearch?: string }) {
  const [selecionadoAno, setSelecionadoAno] = useState(new Date().getFullYear());
  const [selecionadoMes, setSelecionadoMes] = useState(initialMonth ?? new Date().getMonth()); // Default to current month
  
  // Data structure: { 'YYYY-MM-DD': { entrega1: '', kits1: '', ... } }
  const [monthlyData, setMonthlyData] = useLocalStorage<Record<string, any>>('nm_controle_saidas', {});

  useEffect(() => {
    const hasMerged = localStorage.getItem('nm_merged_april_2026');
    if (!hasMerged) {
      const APRIL_DATA = {
        "2026-04-01": { "e1_desc": "ISCOURI SOUL TIJUCA", "e1_alizares": "10", "e2_desc": "HSI ROCONTEC", "e2_alizares": "50" },
        "2026-04-02": { "e1_desc": "PATRIMAR GRAND QUARTIER BL 1", "e1_kits": "132" },
        "2026-04-03": { "e1_desc": "SEXTA FEIRA SANTA", "e2_desc": "SEXTA FEIRA SANTA" },
        "2026-04-06": { "e1_desc": "PATRIMAR GRAND QUARTIER BL 1", "e1_kits": "139", "e2_desc": "RJZ CYRELA ICONYC", "e2_kits": "1", "e2_alizares": "1" },
        "2026-04-07": { "e1_desc": "PATRIMAR GRAND QUARTIER BL 1", "e1_kits": "44", "e1_alizares": "315", "e2_desc": "TEGRA CLARIS", "e2_kits": "3", "e2_alizares": "4", "e2_aduelas": "3" },
        "2026-04-08": { "e1_desc": "ISCOURI DOMUM", "e1_kits": "57", "e1_alizares": "57" },
        "2026-04-09": { "e1_desc": "ISCOURI BRICK", "e1_kits": "70", "e1_alizares": "70", "e2_desc": "FELIPE KUMSTAT", "e2_kits": "6", "e2_alizares": "6" },
        "2026-04-13": { "e1_desc": "PATRIMAR GRAND QUARTIER BL 3", "e1_kits": "123" },
        "2026-04-14": { "e1_desc": "PATRIMAR GRAND QUARTIER BL 3", "e1_kits": "124" },
        "2026-04-15": { "e1_desc": "PATRIMAR GRAND QUARTIER BL 3", "e1_kits": "109", "e1_alizares": "356", "e2_desc": "PATRIMAR ICON", "e2_kits": "10", "e2_alizares": "10" },
        "2026-04-16": { "e1_desc": "CYRELA JASMIM", "e1_kits": "2", "e1_alizares": "2", "e2_desc": "BALASSIANO ALMA", "e2_kits": "3", "e2_alizares": "3" },
        "2026-04-17": { "e1_desc": "EXAME PERIODICO DO JULINHO", "e2_desc": "EXAME PERIODICO DO JULINHO" },
        "2026-04-21": { "e1_desc": "PATRIMAR GRAND QUARTIER BL 4", "e1_kits": "125" },
        "2026-04-22": { "e1_desc": "CYRELA LA ISLA", "e1_kits": "13", "e1_alizares": "13", "e2_desc": "TEGRA GAEA", "e2_kits": "30", "e2_alizares": "30" },
        "2026-04-23": { "e1_desc": "FERIADO SÃO JORGE", "e2_desc": "FERIADO SÃO JORGE" },
        "2026-04-24": { "e1_desc": "EMENDA DE FERIADO", "e2_desc": "EMENDA DE FERIADO" },
        "2026-04-27": { "e1_desc": "ONLY BY LIVING", "e1_kits": "36", "e1_alizares": "36", "e2_desc": "SIG IPA", "e2_kits": "1", "e2_alizares": "1" },
        "2026-04-28": { "e1_desc": "PATRIMAR GRAND QUARTIER", "e1_kits": "107", "e2_desc": "ONLY BY LIVING", "e2_alizares": "6", "e2_aduelas": "5" },
        "2026-04-29": { "e1_desc": "PATRIMAR GRAND QUARTIER", "e1_kits": "84", "e1_alizares": "316", "e2_desc": "PREMIO CASA GABIZO", "e2_kits": "1", "e2_alizares": "1" },
        "2026-04-30": { "e1_desc": "TEGRA CLARIS", "e1_kits": "18", "e1_alizares": "18", "e2_desc": "PREM. PAULO BARRETO / P. O. C.A.", "e2_kits": "1", "e2_alizares": "1", "e2_paineis": "98" }
      };
      
      setMonthlyData(prev => ({
        ...prev,
        ...APRIL_DATA
      }));
      localStorage.setItem('nm_merged_april_2026', 'true');
    }

    const hasMergedJan = localStorage.getItem('nm_merged_jan_2026');
    if (!hasMergedJan) {
      const JANUARY_DATA = {
        "2026-01-05": { "e1_desc": "ONLY BY LIVE", "e1_kits": "48" },
        "2026-01-06": { "e1_desc": "ISCOURI SOUL TIJUCA", "e1_kits": "23" },
        "2026-01-07": { "e1_desc": "PIMMO TAMAN", "e1_kits": "130" },
        "2026-01-08": { "e1_desc": "CYANO", "e1_kits": "3" },
        "2026-01-09": { "e1_desc": "ATMOSFERA APTO 806 (PIER ARQUITETURA)", "e1_kits": "1" },
        "2026-01-12": { "e1_desc": "LUGAMA", "e1_kits": "20" },
        "2026-01-13": { "e1_desc": "ONLY BY LIVE", "e1_kits": "85" },
        "2026-01-14": { "e1_desc": "ONLY BY LIVE", "e1_kits": "113" },
        "2026-01-15": { "e1_desc": "ONLY BY LIVE", "e1_kits": "115" },
        "2026-01-16": { "e1_desc": "ONLY BY LIVE", "e1_kits": "53" },
        "2026-01-19": { "e1_desc": "PORTUS BC 396", "e1_kits": "12" },
        "2026-01-20": { "e1_desc": "SENPRO OBA URCA", "e1_kits": "10" },
        "2026-01-21": { "e1_desc": "SENPRO OBA URCA", "e1_kits": "8" },
        "2026-01-23": { "e1_desc": "QUEIROZ GALVAO VILAGE PRIME", "e1_kits": "9" },
        "2026-01-26": { "e1_desc": "ONLY BY LIVE", "e1_kits": "91", "e2_desc": "CASENGE", "e2_kits": "2" },
        "2026-01-27": { "e1_desc": "ONLY BY LIVE", "e1_kits": "124" },
        "2026-01-28": { "e1_desc": "PIMMO TAMAN", "e1_kits": "113" },
        "2026-01-29": { "e1_desc": "PIMMO TAMAN", "e1_kits": "48" },
        "2026-01-30": { "e1_desc": "ONLY BY LIVE", "e1_kits": "73", "e2_desc": "MOZACK ESSENCIA APTO 701", "e2_kits": "1" }
      };
      
      setMonthlyData(prev => ({
        ...prev,
        ...JANUARY_DATA
      }));
      localStorage.setItem('nm_merged_jan_2026', 'true');
    }

    const hasMergedFeb = localStorage.getItem('nm_merged_feb_2026');
    if (!hasMergedFeb) {
      const FEBRUARY_DATA = {
        "2026-02-02": { "e1_desc": "PIMO TAMAN", "e1_kits": "40" },
        "2026-02-03": { "e1_desc": "TEGRA CLARIS", "e1_kits": "16" },
        "2026-02-04": { "e1_desc": "TECTO (SÓ FOLHA DE PORTA)", "e1_folhas": "1", "e2_desc": "ONLY BY LIVING", "e2_kits": "53" },
        "2026-02-05": { "e1_desc": "SENPRO OBA URCA", "e1_kits": "7" },
        "2026-02-06": { "e1_desc": "PQ OLIMPICO CONCHA ACUSTICA", "e1_kits": "43", "e2_desc": "PQ OLIMPICO CONCHA ACUSTICA", "e2_kits": "70" },
        "2026-02-09": { "e1_desc": "SIG ICONO 1502 FOLHA DE PORTA", "e1_folhas": "11" },
        "2026-02-10": { "e1_desc": "BALASSIANO VISTA IPANEMA", "e1_kits": "119", "e2_desc": "BALASSIANO VISTA IPANEMA", "e2_kits": "113" },
        "2026-02-11": { "e1_desc": "BALASSIANO VISTA IPANEMA", "e1_kits": "72", "e2_desc": "TECTO ENGENHARIA", "e2_kits": "1" },
        "2026-02-12": { "e1_desc": "TEGRA GAEA", "e1_kits": "18", "e2_desc": "SOUL TIJUCA", "e2_kits": "3" },
        "2026-02-13": { "e1_desc": "CARNAVAL", "e2_desc": "CARNAVAL" },
        "2026-02-14": { "e1_desc": "CARNAVAL", "e2_desc": "CARNAVAL" },
        "2026-02-15": { "e1_desc": "CARNAVAL", "e2_desc": "CARNAVAL" },
        "2026-02-16": { "e1_desc": "CARNAVAL", "e2_desc": "CARNAVAL" },
        "2026-02-17": { "e1_desc": "CARNAVAL", "e2_desc": "CARNAVAL" },
        "2026-02-18": { "e1_desc": "CARNAVAL", "e2_desc": "CARNAVAL" },
        "2026-02-19": { "e1_desc": "PORTUS LM10", "e1_kits": "84" },
        "2026-02-20": { "e1_desc": "ONLY BY LIVING", "e1_kits": "22" },
        "2026-02-23": { "e1_desc": "SIG IPA (SÓ FOLHA DE PORTA)", "e1_folhas": "1" },
        "2026-02-24": { "e1_desc": "PATRIMAR GRAND QUARTIER BL 1", "e1_kits": "155" },
        "2026-02-25": { "e1_desc": "PATRIMAR GRAND QUARTIER BL 1", "e1_kits": "144" },
        "2026-02-26": { "e1_desc": "PATRIMAR GRAND QUARTIER BL 1", "e1_kits": "32" }
      };

      setMonthlyData(prev => ({
        ...prev,
        ...FEBRUARY_DATA
      }));
      localStorage.setItem('nm_merged_feb_2026', 'true');
    }

    const hasMergedMar = localStorage.getItem('nm_merged_mar_2026');
    if (!hasMergedMar) {
      const MARCH_DATA = {
        "2026-03-02": { "e1_desc": "JARDIM LIRIO", "e1_kits": "23" },
        "2026-03-03": { "e1_desc": "PORTUS BC396", "e1_kits": "83" },
        "2026-03-04": { "e1_desc": "NURRA SIX KITS DE CORRER", "e1_kits": "4" },
        "2026-03-05": { "e1_desc": "BALASSIANO VISTA IPANEMA", "e1_kits": "18" },
        "2026-03-06": { "e1_desc": "PIMO TAMAN + ALIZARES", "e1_kits": "92" },
        "2026-03-09": { "e1_desc": "BALASSIANO VISTA IPANEMA + ALIZARES", "e1_kits": "18" },
        "2026-03-10": { "e1_desc": "JOAO FORTES PALMS + ALIZARES", "e1_kits": "10", "e2_desc": "PATRIMAR GRAND QUARTIER BL 2", "e2_kits": "140" },
        "2026-03-11": { "e1_desc": "PATRIMAR GRAND QUARTIER BL 2", "e1_kits": "132" },
        "2026-03-12": { "e1_desc": "PATRIMAR GRAND QUARTIER+ALIZARES BL 2", "e1_kits": "44", "e1_alizares": "316" },
        "2026-03-13": { "e1_desc": "TERRAMARINE", "e1_kits": "6" },
        "2026-03-16": { "e1_desc": "PIMMO TAMAN", "e1_kits": "13", "e2_desc": "HSI ROCONTEC", "e2_kits": "50" },
        "2026-03-17": { "e1_desc": "SENPRO OBA", "e1_paineis": "20" },
        "2026-03-18": { "e1_desc": "PATRIMAR GRAND QUARTIER BL 4", "e1_kits": "132", "e2_desc": "CALPER", "e2_kits": "2" },
        "2026-03-19": { "e1_desc": "PATRIMAR GRAND QUARTIER BL 4", "e1_kits": "140", "e2_desc": "PERPETTUM RG 33", "e2_kits": "1" },
        "2026-03-20": { "e1_desc": "PATRIMAR GRAND QUARTIER + ALIZARES BL 4", "e1_kits": "44", "e1_alizares": "316", "e2_desc": "TERRAMARINE VENEZIANA", "e2_kits": "2" },
        "2026-03-23": { "e1_desc": "CONCHA ACUSTICA", "e1_kits": "10", "e2_desc": "PIMMO TAMAN", "e2_kits": "24" },
        "2026-03-24": { "e1_desc": "SENPRO OBA", "e1_kits": "12", "e1_alizares": "13", "e1_aduelas": "1", "e2_desc": "PATRIMAR GRAND QUARTIER BL 3", "e2_kits": "162" },
        "2026-03-25": { "e1_desc": "PATRIMAR GRAND QUARTIER BL 3", "e1_kits": "159", "e2_desc": "ONLY BY LIVE", "e2_kits": "1", "e2_alizares": "1", "e2_aduelas": "6" },
        "2026-03-26": { "e1_desc": "PATRIMAR GRAND QUARTIER BL 3", "e1_kits": "32", "e1_alizares": "353", "e2_desc": "SENPRO OBA URCA", "e2_paineis": "31" },
        "2026-03-27": { "e1_desc": "PATRIMAR GRAND QUARTIER BL 2", "e1_kits": "81", "e2_desc": "SAFIRA ENGENHARIA MARIA AMÁLIA", "e2_kits": "1" },
        "2026-03-30": { "e1_desc": "PATRIMAR GRAND QUARTIER BL 2", "e1_kits": "85", "e2_desc": "PALMS", "e2_kits": "8", "e2_aduelas": "15" },
        "2026-03-31": { "e1_desc": "PATRIMAR GRAND QUARTIER BL 2", "e1_kits": "149", "e2_desc": "PATRIMAR GRAND QUARTIER BL 2", "e2_kits": "16", "e2_alizares": "331" }
      };

      setMonthlyData(prev => ({
        ...prev,
        ...MARCH_DATA
      }));
      localStorage.setItem('nm_merged_mar_2026', 'true');
    }

  }, []);

  const sumCol = (field: string) => {
    return rows.reduce((acc, row) => {
      if (row.isWeekend) return acc;
      const val = parseInt(monthlyData[row.dateStrKey]?.[field] || '0', 10);
      return acc + (isNaN(val) ? 0 : val);
    }, 0);
  };

  const anos = Array.from({ length: 50 }, (_, i) => 2026 + i);

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

  const renderInput = (row: any, field: string, colIdx: number, className: string = "") => {
    const val = monthlyData[row.dateStrKey]?.[field] || '';
    if (row.isWeekend) return null; // weekends handled separately in JSX
    
    // Highlight if search matches description
    const isMatched = globalSearch && val && val.toString().toLowerCase().includes(globalSearch.toLowerCase());

    return (
      <input
        type="text"
        value={val}
        data-module="saidas"
        data-row={row.day}
        data-col={colIdx}
        onChange={(e) => handleInputChange(row.dateStrKey, field, e.target.value)}
        onKeyDown={(e) => handleTableKeyDown(e, row.day, colIdx, 'saidas', daysCount, 13)}
        style={{ fieldSizing: 'content', minWidth: '100%' } as any}
        className={cn(
          "w-full h-full min-h-[28px] px-1 bg-transparent text-center border-none outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500",
          className,
          isMatched ? "bg-yellow-200 text-yellow-900 font-bold" : ""
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

      <div className="flex-1 flex flex-col min-h-0 bg-gray-50 p-4">
        <div className="mb-4 grid grid-cols-2 md:grid-cols-6 gap-3 shrink-0">
          <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex flex-col items-center">
            <span className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Total Kits</span>
            <span className="text-xl sm:text-2xl font-bold text-brand-green">{sumCol('e1_kits') + sumCol('e2_kits') || 0}</span>
          </div>
          <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex flex-col items-center">
            <span className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Total Alizares</span>
            <span className="text-xl sm:text-2xl font-bold text-brand-green">{sumCol('e1_alizares') + sumCol('e2_alizares') || 0}</span>
          </div>
          <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex flex-col items-center">
            <span className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Total Folhas</span>
            <span className="text-xl sm:text-2xl font-bold text-brand-green">{sumCol('e1_folhas') + sumCol('e2_folhas') || 0}</span>
          </div>
          <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex flex-col items-center">
            <span className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Total Aduelas</span>
            <span className="text-xl sm:text-2xl font-bold text-brand-green">{sumCol('e1_aduelas') + sumCol('e2_aduelas') || 0}</span>
          </div>
          <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex flex-col items-center">
            <span className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Total Rodapés</span>
            <span className="text-xl sm:text-2xl font-bold text-brand-green">{sumCol('e1_rodapes') + sumCol('e2_rodapes') || 0}</span>
          </div>
          <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex flex-col items-center">
            <span className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Total Painéis</span>
            <span className="text-xl sm:text-2xl font-bold text-brand-green">{sumCol('e1_paineis') + sumCol('e2_paineis') || 0}</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm flex-1 flex flex-col min-h-0">
          <div className="overflow-auto flex-1">
            <table className="w-full text-center text-xs whitespace-nowrap border-collapse min-w-[1200px]">
              <thead className="sticky top-0 z-10 bg-white shadow-sm shadow-gray-300">
                <tr className="bg-gray-100 text-gray-700 border-b border-gray-300">
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
                        <td className="p-0 border-r border-gray-300 bg-orange-100">{renderInput(row, 'e1_desc', 0, 'text-center font-medium text-gray-800')}</td>
                        <td className="p-0 border-r border-gray-300 bg-orange-50">{renderInput(row, 'e1_kits', 1)}</td>
                        <td className="p-0 border-r border-gray-300 bg-orange-50">{renderInput(row, 'e1_alizares', 2)}</td>
                        <td className="p-0 border-r border-gray-300 bg-orange-50">{renderInput(row, 'e1_folhas', 3)}</td>
                        <td className="p-0 border-r border-gray-300 bg-orange-50">{renderInput(row, 'e1_aduelas', 4)}</td>
                        <td className="p-0 border-r border-gray-300 bg-orange-50">{renderInput(row, 'e1_rodapes', 5)}</td>
                        <td className="p-0 border-r border-gray-300 bg-orange-50">{renderInput(row, 'e1_paineis', 6)}</td>
                        
                        <td className="p-0 border-r border-gray-300 bg-green-100">{renderInput(row, 'e2_desc', 7, 'text-center font-medium text-gray-800')}</td>
                        <td className="p-0 border-r border-gray-300 bg-green-50">{renderInput(row, 'e2_kits', 8)}</td>
                        <td className="p-0 border-r border-gray-300 bg-green-50">{renderInput(row, 'e2_alizares', 9)}</td>
                        <td className="p-0 border-r border-gray-300 bg-green-50">{renderInput(row, 'e2_folhas', 10)}</td>
                        <td className="p-0 border-r border-gray-300 bg-green-50">{renderInput(row, 'e2_aduelas', 11)}</td>
                        <td className="p-0 border-r border-gray-300 bg-green-50">{renderInput(row, 'e2_rodapes', 12)}</td>
                        <td className="p-0 border-transparent bg-green-50">{renderInput(row, 'e2_paineis', 13)}</td>
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

function OperacaoProducao({ initialMonth, globalSearch = '' }: { initialMonth?: number, globalSearch?: string }) {
  const [selecionadoAno, setSelecionadoAno] = useState(new Date().getFullYear());
  const [selecionadoMes, setSelecionadoMes] = useState(initialMonth ?? new Date().getMonth()); // 0-indexed
  
  const anos = Array.from({ length: 50 }, (_, i) => 2026 + i);

  // Storage
  const [operacaoData, setOperacaoData] = useLocalStorage<Record<string, any>>('nm_operacao_producao', {});
  const [efetivoTotal, setEfetivoTotal] = useLocalStorage<Record<string, string>>('nm_operacao_efetivo_total', {});

  const getDaysArray = (year: number, month: number) => {
    const numDays = new Date(year, month + 1, 0).getDate();
    return Array.from({length: numDays}, (_, i) => {
      const date = new Date(year, month, i + 1);
      const dateStrKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`;
      return {
        dateStrKey,
        dayNum: i + 1,
        dateStr: date.toLocaleDateString('pt-BR'),
        isWeekend: date.getDay() === 0 || date.getDay() === 6,
        isSabado: date.getDay() === 6,
        isDomingo: date.getDay() === 0
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

  const renderInput = (day: any, field: string, colIdx: number, className: string = "") => {
    const val = operacaoData[day.dateStrKey]?.[field] || '';
    if (day.isWeekend) return null;
    return (
      <input
        type="text"
        value={val}
        data-module="operacao"
        data-row={day.dayNum}
        data-col={colIdx}
        onChange={(e) => handleInputChange(day.dateStrKey, field, e.target.value)}
        onKeyDown={(e) => handleTableKeyDown(e, day.dayNum, colIdx, 'operacao', daysThisMonth.length, 1)}
        style={{ fieldSizing: 'content', minWidth: '100%' } as any}
        className={cn(
          "w-full h-full min-h-[29px] bg-transparent text-center border-none outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500",
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
      const chunk = days.slice(i, i + chunkSize);
      while (chunk.length < 7) {
        chunk.push(null);
      }
      columns.push(chunk);
    }

    // calculate total
    const totalMes = days.reduce((acc, day) => {
       if (!day) return acc;
       const qty = parseInt(operacaoData[day.dateStrKey]?.quantidade || '0', 10);
       return acc + (isNaN(qty) ? 0 : qty);
    }, 0);

    return (
      <div className="flex-1 flex flex-col min-h-0 mb-4">
        <div className="flex shrink-0">
          <div className="bg-blue-600 text-white font-bold p-2 px-4 shadow-sm w-[350px] uppercase">
            {title}
          </div>
          <div className="bg-blue-600 text-white font-bold p-2 px-4 text-center ml-1 flex-1 shadow-sm">
            {totalMes}
          </div>
        </div>
        
        <div className="flex gap-1 mt-1 overflow-auto pb-4 flex-1">
          {columns.map((col, idx) => (
            <table key={idx} className="text-center text-xs whitespace-nowrap min-w-[200px] border-collapse flex-none">
              <thead>
                <tr className="bg-black text-white">
                  <th className="p-1.5 border border-gray-400">DATA</th>
                  <th className="p-1.5 border border-gray-400">
                    <div className="flex items-center justify-center whitespace-nowrap">
                      EFETIVO TOTAL:
                      <input 
                        type="text" 
                        value={efetivoTotal[`${selecionadoAno}-${selecionadoMes}`] || '15'}
                        onChange={(e) => setEfetivoTotal(prev => ({ ...prev, [`${selecionadoAno}-${selecionadoMes}`]: e.target.value }))}
                        className="ml-1 w-10 bg-transparent border-b border-gray-500 text-center text-white outline-none focus:border-white"
                      />
                    </div>
                  </th>
                  <th className="p-1.5 border border-gray-400">QUANTIDADE</th>
                </tr>
              </thead>
              <tbody>
                {col.map((day: any, i: number) => {
                  if (!day) {
                    return (
                      <tr key={i}>
                        <td className="p-1.5 border border-transparent bg-transparent"></td>
                        <td className="p-0 border border-transparent bg-transparent"></td>
                        <td className="p-0 border border-transparent bg-transparent"></td>
                      </tr>
                    );
                  }
                  
                  return (
                    <tr key={i}>
                      <td className={cn(
                        "p-1.5 border border-gray-300 font-medium",
                        day.isWeekend ? "bg-red-600 text-white" : "bg-green-100"
                      )}>
                        {day.dateStr}
                      </td>
                      {day.isWeekend ? (
                        <td colSpan={2} className="p-1.5 border border-gray-300 bg-red-600 text-white font-bold tracking-wider uppercase">
                          {day.isSabado ? 'SABADO' : 'DOMINGO'}
                        </td>
                      ) : (
                        <>
                          <td className="p-0 border border-gray-300 bg-green-200">
                            {renderInput(day, 'efetivo', 0, '')}
                          </td>
                          <td className="p-0 border border-gray-300 bg-[#DDEBF7]">
                            {renderInput(day, 'quantidade', 1, '')}
                          </td>
                        </>
                      )}
                    </tr>
                  )
                })}
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

      <div className="flex-1 flex flex-col p-4 bg-gray-50 min-h-0">
        {renderMonthSection(daysThisMonth, `TOTAL EM ${MESES[selecionadoMes]}:`)}
      </div>
    </div>
  )
}

function EntradaObras({ globalSearch = '' }: { globalSearch?: string }) {
  const [obras, setObras] = useLocalStorage<Record<string, any>>('nm_entrada_obras_v4', {});
  const [selectedObraId, setSelectedObraId] = useState<string | null>(null);

  const adicionarObra = () => {
    const nome = window.prompt('Digite o nome da nova obra:');
    if (!nome) return;
    const id = Date.now().toString();
    setObras(prev => ({
      ...prev,
      [id]: {
         id,
         nome,
         itens: [
           { id: Date.now().toString() + '_1', dimensao: '', cor: '', modelo: '', folhas: '', aduelas: '', alizares: '' }
         ],
         data: new Date().toISOString()
      }
    }));
    setSelectedObraId(id);
  };

  const deletarObra = (id: string) => {
    if(!window.confirm('Tem certeza que deseja excluir esta obra?')) return;
    setObras(prev => {
      const novas = { ...prev };
      delete novas[id];
      return novas;
    });
    if (selectedObraId === id) setSelectedObraId(null);
  };

  const adicionarItem = (obraId: string) => {
    setObras(prev => {
      const obra = prev[obraId];
      return {
        ...prev,
        [obraId]: {
          ...obra,
          itens: [...(obra.itens || []), { id: Date.now().toString(), dimensao: '', cor: '', modelo: '', folhas: '', aduelas: '', alizares: '' }]
        }
      }
    });
  };

  const deletarItem = (obraId: string, itemId: string) => {
    setObras(prev => {
      const obra = prev[obraId];
      return {
        ...prev,
        [obraId]: {
          ...obra,
          itens: (obra.itens || []).filter((i: any) => i.id !== itemId)
        }
      }
    });
  };

  const handleChangeItem = (obraId: string, itemId: string, field: string, value: string) => {
    setObras(prev => {
      const obra = prev[obraId];
      if (!obra) return prev;
      const itens = (Array.isArray(obra.itens) ? obra.itens : []).map((item: any) => 
        item.id === itemId ? { ...item, [field]: value } : item
      );
      return {
        ...prev,
        [obraId]: {
          ...obra,
          itens
        }
      }
    });
  };

  const obrasList: any[] = Object.values(obras || {})
    .filter((obra: any) => {
       if (!globalSearch) return true;
       const searchLower = globalSearch.toLowerCase();
       const inNome = (obra.nome || '').toLowerCase().includes(searchLower);
       const inItens = (obra.itens || []).some((i: any) => 
         (i.descricao || '').toLowerCase().includes(searchLower) ||
         (i.dimensao || '').toLowerCase().includes(searchLower) ||
         (i.cor || '').toLowerCase().includes(searchLower) ||
         (i.modelo || '').toLowerCase().includes(searchLower)
       );
       return inNome || inItens;
    })
    .sort((a: any, b: any) => new Date(a?.data || 0).getTime() - new Date(b?.data || 0).getTime());
  
  React.useEffect(() => {
    if (!selectedObraId && obrasList.length > 0) {
      setSelectedObraId(obrasList[0].id);
    }
  }, [obrasList.length, selectedObraId]);

  const activeObra = selectedObraId ? obras[selectedObraId] : null;

  return (
    <div className="flex-1 flex max-h-[800px] overflow-hidden rounded-bl-xl rounded-br-xl">
      <div className="w-64 border-r border-gray-200 bg-white flex flex-col h-full">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <h3 className="font-semibold text-gray-700 uppercase tracking-wider text-xs">Obras</h3>
          <button 
            onClick={adicionarObra}
            className="p-1.5 text-white bg-brand-green rounded-md hover:bg-green-700 transition-colors shadow-sm"
            title="Nova Obra"
          >
            <Plus className="w-4 h-4"/>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {obrasList.length === 0 ? (
            <div className="p-4 text-sm text-gray-500 text-center">Nenhuma obra cadastrada.</div>
          ) : (
            obrasList.map((obra: any) => (
              <div 
                key={obra.id} 
                onClick={() => setSelectedObraId(obra.id)}
                className={cn(
                  "p-3 border-b border-gray-100 cursor-pointer flex justify-between items-center group transition-colors",
                  selectedObraId === obra.id 
                    ? "bg-green-50 border-l-4 border-l-brand-green" 
                    : "hover:bg-gray-50 border-l-4 border-l-transparent"
                )}
              >
                <div className="flex flex-col overflow-hidden pr-2">
                  <span className="font-medium text-sm text-gray-800 truncate">{obra.nome}</span>
                  <span className="text-xs text-gray-500 mt-1">
                    {(obra.itens || []).length} itens
                  </span>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); deletarObra(obra.id); }}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                  title="Excluir obra"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-gray-50 h-full overflow-hidden">
        {activeObra ? (
          <>
            <div className="p-4 bg-white border-b border-gray-200 flex justify-between items-center shadow-sm z-10 shrink-0">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <Home className="w-5 h-5 mr-2 text-brand-green" /> 
                {activeObra.nome}
              </h2>
              <button 
                onClick={() => adicionarItem(activeObra.id)}
                className="flex items-center px-4 py-2 text-sm font-medium text-brand-green bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4 mr-2"/> Adicionar Linha
              </button>
            </div>
            
            <div className="flex-1 flex flex-col min-h-0 bg-gray-50 p-4">
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex-1 flex flex-col min-h-0">
                <div className="flex-1 overflow-auto">
                  <table className="w-full text-center text-sm border-collapse min-w-[800px]">
                    <thead className="bg-gray-100 text-gray-700 border-b border-gray-300 sticky top-0 z-10 shadow-sm shadow-gray-200">
                    <tr>
                      <th className="p-3 border-r border-gray-300 font-bold text-center w-[12%]">DIMENSÃO</th>
                      <th className="p-3 border-r border-gray-300 font-bold text-center w-[12%]">COR</th>
                      <th className="p-3 border-r border-gray-300 font-bold text-center w-[16%]">MODELO</th>
                      <th className="p-3 border-r border-gray-300 font-bold w-[16%] bg-blue-50 text-blue-800">FOLHAS DE PORTA</th>
                      <th className="p-3 border-r border-gray-300 font-bold w-[16%] bg-amber-50 text-amber-800">ADUELAS</th>
                      <th className="p-3 border-r border-gray-300 font-bold w-[16%] bg-purple-50 text-purple-800">ALIZARES</th>
                      <th className="p-3 font-bold w-12">AÇÕES</th>
                    </tr>
                    <tr className="bg-gray-200/80 font-bold text-gray-800 border-b border-gray-300 shadow-sm">
                      <td colSpan={3} className="p-2 text-right border-r border-gray-300 uppercase">TOTAL DA OBRA:</td>
                      <td className="p-2 border-r border-gray-300 bg-blue-100/50 text-blue-900 text-lg">
                        {(activeObra.itens || []).reduce((acc: number, item: any) => acc + (parseInt(item.folhas) || 0), 0) || 0}
                      </td>
                      <td className="p-2 border-r border-gray-300 bg-amber-100/50 text-amber-900 text-lg">
                        {(activeObra.itens || []).reduce((acc: number, item: any) => acc + (parseInt(item.aduelas) || 0), 0) || 0}
                      </td>
                      <td className="p-2 border-r border-gray-300 bg-purple-100/50 text-purple-900 text-lg">
                        {(activeObra.itens || []).reduce((acc: number, item: any) => acc + (parseInt(item.alizares) || 0), 0) || 0}
                      </td>
                      <td className="p-2 bg-gray-100"></td>
                    </tr>
                  </thead>
                  <tbody>
                    {(activeObra.itens || []).length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-gray-500">Nenhuma especificação adicionada a esta obra.</td>
                      </tr>
                    ) : (
                      (activeObra.itens || []).map((item: any) => (
                        <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                          <td className="p-0 border-r border-gray-300">
                            <select 
                              value={item.dimensao || ''} 
                              onChange={(e) => handleChangeItem(activeObra.id, item.id, 'dimensao', e.target.value)}
                              className="w-full h-full min-h-[44px] p-3 text-center bg-transparent border-none outline-none focus:ring-2 focus:ring-inset focus:ring-brand-green font-medium text-gray-800"
                            >
                              <option value="" className="text-gray-800 bg-white">Selecione...</option>
                              {DIMENSOES_PORTA.map(op => <option key={op} value={op} className="text-gray-800 bg-white">{op}</option>)}
                            </select>
                          </td>
                          <td className="p-0 border-r border-gray-300">
                            <select 
                              value={item.cor || ''} 
                              onChange={(e) => handleChangeItem(activeObra.id, item.id, 'cor', e.target.value)}
                              className="w-full h-full min-h-[44px] p-3 text-center bg-transparent border-none outline-none focus:ring-2 focus:ring-inset focus:ring-brand-green font-medium text-gray-800"
                            >
                              <option value="" className="text-gray-800 bg-white">Selecione...</option>
                              {CORES.map(op => <option key={op} value={op} className="text-gray-800 bg-white">{op}</option>)}
                            </select>
                          </td>
                          <td className="p-0 border-r border-gray-300">
                            <select 
                              value={item.modelo || ''} 
                              onChange={(e) => handleChangeItem(activeObra.id, item.id, 'modelo', e.target.value)}
                              className="w-full h-full min-h-[44px] p-3 text-center bg-transparent border-none outline-none focus:ring-2 focus:ring-inset focus:ring-brand-green font-medium text-gray-800"
                            >
                              <option value="" className="text-gray-800 bg-white">Selecione...</option>
                              {MODELOS_PORTA.map(op => <option key={op} value={op} className="text-gray-800 bg-white">{op}</option>)}
                            </select>
                          </td>
                          <td className="p-0 border-r border-gray-300 bg-blue-50/30">
                            <input 
                              type="text" 
                              value={item.folhas || ''} 
                              onChange={(e) => handleChangeItem(activeObra.id, item.id, 'folhas', e.target.value)}
                              className="w-full h-full min-h-[44px] p-3 text-center bg-transparent border-none outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 font-semibold"
                            />
                          </td>
                          <td className="p-0 border-r border-gray-300 bg-amber-50/30">
                            <input 
                              type="text" 
                              value={item.aduelas || ''} 
                              onChange={(e) => handleChangeItem(activeObra.id, item.id, 'aduelas', e.target.value)}
                              className="w-full h-full min-h-[44px] p-3 text-center bg-transparent border-none outline-none focus:ring-2 focus:ring-inset focus:ring-amber-500 font-semibold"
                            />
                          </td>
                          <td className="p-0 border-r border-gray-300 bg-purple-50/30">
                            <input 
                              type="text" 
                              value={item.alizares || ''} 
                              onChange={(e) => handleChangeItem(activeObra.id, item.id, 'alizares', e.target.value)}
                              className="w-full h-full min-h-[44px] p-3 text-center bg-transparent border-none outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500 font-semibold"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <button 
                              onClick={() => deletarItem(activeObra.id, item.id)}
                              className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                              title="Remover linha"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
               </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 p-8">
            <div className="text-center">
              <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <Target className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-700 mb-2">Entrada de Obras</h3>
              <p className="max-w-md text-gray-500">Selecione uma obra no menu lateral para visualizar e editar suas especificações (Folhas, Aduelas, Alizares), ou crie uma nova obra clicando no botão + Nova Obra.</p>
              <button 
                onClick={adicionarObra}
                className="mt-6 px-6 py-2.5 text-sm font-medium text-white bg-brand-green rounded-lg hover:bg-green-700 transition-colors shadow-sm"
              >
                + Criar Nova Obra
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
