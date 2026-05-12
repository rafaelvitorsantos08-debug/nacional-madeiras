import React, { useState, useEffect } from 'react';
import { cn } from '../lib/utils';
import { Package, Truck, Target, Plus, Download, Home, Trash2, X, FileText, History, Info } from 'lucide-react';

const DIAS_SEMANA = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

export function ControleOperacaoModule({ initialTab = 'saidas', initialMonth, globalSearch = '' }: { initialTab?: 'saidas' | 'operacao' | 'entradas' | 'saidas_obras', initialMonth?: number, globalSearch?: string }) {
  const [activeTab, setActiveTab] = useState<'saidas' | 'operacao' | 'entradas' | 'saidas_obras'>(initialTab);

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
          <button 
            onClick={() => setActiveTab('saidas_obras')}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-md transition-colors",
              activeTab === 'saidas_obras' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            Saídas de Obras
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        {activeTab === 'saidas' && <ControleSaidas initialMonth={initialMonth} globalSearch={globalSearch} />}
        {activeTab === 'operacao' && <OperacaoProducao initialMonth={initialMonth} globalSearch={globalSearch} />}
        {activeTab === 'entradas' && <EntradaObras globalSearch={globalSearch} />}
        {activeTab === 'saidas_obras' && <SaidasObras globalSearch={globalSearch} />}
      </div>
    </div>
  );
}

// --- SUBMODULES ---
import { useLocalStorage, DIMENSOES_PORTA, CORES, MODELOS_PORTA, LARGURAS_ADUELA, FACE_ALIZAR, COMPRIMENTOS_ADUELA, COMPRIMENTOS_ALIZAR, ESPESSURA_ALIZAR, ENCHIMENTOS_PORTA } from './EstoqueModule';

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
           { id: Date.now().toString() + '_1', dimensao: '', cor: '', enchimento: '', modelo: '', folhas: '', medidaAduela: '', aduelas: '', medidaAlizar: '', alizares: '' }
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
          itens: [...(obra.itens || []), { id: Date.now().toString(), dimensao: '', cor: '', enchimento: '', modelo: '', folhas: '', medidaAduela: '', aduelas: '', medidaAlizar: '', alizares: '' }]
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
         (i.modelo || '').toLowerCase().includes(searchLower) ||
         (i.medidaAduela || '').toLowerCase().includes(searchLower) ||
         (i.medidaAlizar || '').toLowerCase().includes(searchLower)
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
                  <table className="w-full text-center text-sm border-collapse min-w-[1500px]">
                    <thead className="bg-gray-100 text-gray-700 border-b border-gray-300 sticky top-0 z-10 shadow-sm shadow-gray-200">
                    <tr>
                      <th className="p-3 border-r border-gray-300 dark:border-gray-600 font-bold text-center w-[10%]">DIMENSÃO</th>
                      <th className="p-3 border-r border-gray-300 dark:border-gray-600 font-bold text-center w-[10%]">COR</th>
                      <th className="p-3 border-r border-gray-300 dark:border-gray-600 font-bold text-center w-[12%]">ENCHIMENTO</th>
                      <th className="p-3 border-r border-gray-300 dark:border-gray-600 font-bold text-center w-[10%]">MODELO</th>
                      <th className="p-3 border-r border-gray-300 dark:border-gray-600 font-bold w-[10%] bg-blue-50 dark:bg-blue-900/60 text-blue-800 dark:text-blue-100">FOLHAS DE PORTA</th>
                      <th className="p-3 border-r border-gray-300 dark:border-gray-600 font-bold w-[22%] bg-amber-50 dark:bg-amber-900/60 text-amber-800 dark:text-amber-100">ADUELAS</th>
                      <th className="p-3 border-r border-gray-300 dark:border-gray-600 font-bold w-[24%] bg-purple-50 dark:bg-purple-900/60 text-purple-800 dark:text-purple-100">ALIZARES</th>
                      <th className="p-3 font-bold w-12 dark:border-gray-600">AÇÕES</th>
                    </tr>
                    <tr className="bg-gray-200/80 dark:bg-gray-800 font-bold text-gray-800 dark:text-white border-b border-gray-300 dark:border-gray-600 shadow-sm">
                      <td colSpan={4} className="p-2 text-right border-r border-gray-300 dark:border-gray-600 uppercase">TOTAL DA OBRA:</td>
                      <td className="p-2 border-r border-gray-300 dark:border-gray-600 bg-blue-100/50 dark:bg-blue-900/80 text-blue-900 dark:text-blue-100 text-lg">
                        {(activeObra.itens || []).reduce((acc: number, item: any) => acc + (parseInt(item.folhas) || 0), 0) || 0}
                      </td>
                      <td className="p-2 border-r border-gray-300 dark:border-gray-600 bg-amber-100/50 dark:bg-amber-900/80 text-amber-900 dark:text-amber-100 text-lg">
                        {(activeObra.itens || []).reduce((acc: number, item: any) => acc + (parseInt(item.aduelas) || 0), 0) || 0}
                      </td>
                      <td className="p-2 border-r border-gray-300 dark:border-gray-600 bg-purple-100/50 dark:bg-purple-900/80 text-purple-900 dark:text-purple-100 text-lg">
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
                        <tr key={item.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <td className="p-0 border-r border-gray-300 dark:border-gray-700 relative group">
                            <select 
                              value={item.dimensao || ''} 
                              onChange={(e) => handleChangeItem(activeObra.id, item.id, 'dimensao', e.target.value)}
                              className="w-full h-full min-h-[44px] p-3 pl-8 text-center bg-transparent border-none outline-none focus:ring-2 focus:ring-inset focus:ring-brand-green font-medium text-gray-800 dark:text-gray-100"
                            >
                              <option value="" className="text-gray-800 dark:text-white bg-white dark:bg-gray-800">Selecione...</option>
                              {DIMENSOES_PORTA.map(op => <option key={op} value={op} className="text-gray-800 dark:text-white bg-white dark:bg-gray-800">{op}</option>)}
                            </select>
                            {item.dimensao && (
                              <button onClick={() => handleChangeItem(activeObra.id, item.id, 'dimensao', '')} className="absolute left-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" title="Limpar célula">
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </td>
                          <td className="p-0 border-r border-gray-300 dark:border-gray-700 relative group">
                            <select 
                              value={item.cor || ''} 
                              onChange={(e) => handleChangeItem(activeObra.id, item.id, 'cor', e.target.value)}
                              className="w-full h-full min-h-[44px] p-3 pl-8 text-center bg-transparent border-none outline-none focus:ring-2 focus:ring-inset focus:ring-brand-green font-medium text-gray-800 dark:text-gray-100"
                            >
                              <option value="" className="text-gray-800 dark:text-white bg-white dark:bg-gray-800">Selecione...</option>
                              {CORES.map(op => <option key={op} value={op} className="text-gray-800 dark:text-white bg-white dark:bg-gray-800">{op}</option>)}
                            </select>
                            {item.cor && (
                              <button onClick={() => handleChangeItem(activeObra.id, item.id, 'cor', '')} className="absolute left-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" title="Limpar célula">
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </td>
                          <td className="p-0 border-r border-gray-300 dark:border-gray-700 relative group">
                            <select 
                              value={item.enchimento || ''} 
                              onChange={(e) => handleChangeItem(activeObra.id, item.id, 'enchimento', e.target.value)}
                              className="w-full h-full min-h-[44px] p-3 pl-8 text-center bg-transparent border-none outline-none focus:ring-2 focus:ring-inset focus:ring-brand-green font-medium text-gray-800 dark:text-gray-100"
                            >
                              <option value="" className="text-gray-800 dark:text-white bg-white dark:bg-gray-800">Selecione...</option>
                              {ENCHIMENTOS_PORTA.map(op => <option key={op} value={op} className="text-gray-800 dark:text-white bg-white dark:bg-gray-800">{op}</option>)}
                            </select>
                            {item.enchimento && (
                              <button onClick={() => handleChangeItem(activeObra.id, item.id, 'enchimento', '')} className="absolute left-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" title="Limpar célula">
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </td>
                          <td className="p-0 border-r border-gray-300 dark:border-gray-700 relative group">
                            <select 
                              value={item.modelo || ''} 
                              onChange={(e) => handleChangeItem(activeObra.id, item.id, 'modelo', e.target.value)}
                              className="w-full h-full min-h-[44px] p-3 pl-8 text-center bg-transparent border-none outline-none focus:ring-2 focus:ring-inset focus:ring-brand-green font-medium text-gray-800 dark:text-gray-100"
                            >
                              <option value="" className="text-gray-800 dark:text-white bg-white dark:bg-gray-800">Selecione...</option>
                              {MODELOS_PORTA.map(op => <option key={op} value={op} className="text-gray-800 dark:text-white bg-white dark:bg-gray-800">{op}</option>)}
                            </select>
                            {item.modelo && (
                              <button onClick={() => handleChangeItem(activeObra.id, item.id, 'modelo', '')} className="absolute left-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" title="Limpar célula">
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </td>
                          <td className="p-0 border-r border-gray-300 dark:border-gray-700 bg-blue-50/30 dark:bg-blue-900/30 relative group">
                            <input 
                              type="text" 
                              value={item.folhas || ''} 
                              onChange={(e) => handleChangeItem(activeObra.id, item.id, 'folhas', e.target.value)}
                              className="w-full h-full min-h-[44px] p-3 pr-8 text-center bg-transparent border-none outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 font-semibold text-gray-800 dark:text-blue-100"
                            />
                            {item.folhas && (
                              <button onClick={() => handleChangeItem(activeObra.id, item.id, 'folhas', '')} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" title="Limpar célula">
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </td>
                          <td className="p-0 border-r border-gray-300 dark:border-gray-700 bg-amber-50/30 dark:bg-amber-900/30">
                            <div className="flex h-full min-h-[44px]">
                              <div className="w-[75%] relative group">
                                <select 
                                  value={item.medidaAduela || ''} 
                                  onChange={(e) => handleChangeItem(activeObra.id, item.id, 'medidaAduela', e.target.value)}
                                  className="w-full p-2 pl-8 text-center bg-transparent border-none outline-none focus:ring-2 focus:ring-inset focus:ring-amber-500 font-medium text-amber-800 dark:text-amber-100 text-xs sm:text-sm"
                                >
                                  <option value="" className="text-gray-800 dark:text-white bg-white dark:bg-gray-800">Medida</option>
                                  {LARGURAS_ADUELA.flatMap(largura => 
                                    COMPRIMENTOS_ADUELA.map(comprimento => (
                                      <option key={`${largura}x${comprimento}`} value={`${largura}x${comprimento}`} className="text-gray-800 dark:text-white bg-white dark:bg-gray-800">{`${largura}x${comprimento}`}</option>
                                    ))
                                  )}
                                </select>
                                {item.medidaAduela && (
                                  <button onClick={() => handleChangeItem(activeObra.id, item.id, 'medidaAduela', '')} className="absolute left-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity z-10" title="Limpar medida">
                                    <X className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                              <div className="w-[25%] relative group border-l border-amber-200 dark:border-amber-700/50">
                                <input 
                                  type="text" 
                                  value={item.aduelas || ''} 
                                  onChange={(e) => handleChangeItem(activeObra.id, item.id, 'aduelas', e.target.value)}
                                  placeholder="Qtd"
                                  className="w-full h-full p-2 pr-6 text-center bg-transparent border-none outline-none focus:ring-2 focus:ring-inset focus:ring-amber-500 font-semibold text-amber-900 dark:text-amber-100 placeholder-amber-400/50 dark:placeholder-amber-400/30"
                                />
                                {item.aduelas && (
                                  <button onClick={() => handleChangeItem(activeObra.id, item.id, 'aduelas', '')} className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity z-10" title="Limpar quantidade">
                                    <X className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-0 border-r border-gray-300 dark:border-gray-700 bg-purple-50/30 dark:bg-purple-900/30">
                            <div className="flex h-full min-h-[44px]">
                              <div className="w-[75%] relative group">
                                <select 
                                  value={item.medidaAlizar || ''} 
                                  onChange={(e) => handleChangeItem(activeObra.id, item.id, 'medidaAlizar', e.target.value)}
                                  className="w-full p-2 pl-8 text-center bg-transparent border-none outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500 font-medium text-purple-800 dark:text-purple-100 text-xs sm:text-sm"
                                >
                                  <option value="" className="text-gray-800 dark:text-white bg-white dark:bg-gray-800">Face</option>
                                  {FACE_ALIZAR.flatMap(face => 
                                    ESPESSURA_ALIZAR.filter(esp => esp === '10' || esp === '15').flatMap(espessura => 
                                      COMPRIMENTOS_ALIZAR.map(comprimento => (
                                        <option key={`${face}x${espessura}x${comprimento}`} value={`${face}x${espessura}x${comprimento}`} className="text-gray-800 dark:text-white bg-white dark:bg-gray-800">{`${face}x${espessura}x${comprimento}`}</option>
                                      ))
                                    )
                                  )}
                                </select>
                                {item.medidaAlizar && (
                                  <button onClick={() => handleChangeItem(activeObra.id, item.id, 'medidaAlizar', '')} className="absolute left-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity z-10" title="Limpar face">
                                    <X className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                              <div className="w-[25%] relative group border-l border-purple-200 dark:border-purple-700/50">
                                <input 
                                  type="text" 
                                  value={item.alizares || ''} 
                                  onChange={(e) => handleChangeItem(activeObra.id, item.id, 'alizares', e.target.value)}
                                  placeholder="Qtd"
                                  className="w-full h-full p-2 pr-6 text-center bg-transparent border-none outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500 font-semibold text-purple-900 dark:text-purple-100 placeholder-purple-400/50 dark:placeholder-purple-400/30"
                                />
                                {item.alizares && (
                                  <button onClick={() => handleChangeItem(activeObra.id, item.id, 'alizares', '')} className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity z-10" title="Limpar quantidade">
                                    <X className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-2 text-center flex items-center justify-center gap-1 h-full min-h-[44px]">
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

function ModalSaidas({ obra, item, defaultTipo, onClose, onSaveSaida, onDeleteSaida }: any) {
  const [data, setData] = useState(() => new Date().toISOString().split('T')[0]);
  const [tipo, setTipo] = useState<'folhas' | 'aduelas' | 'alizares'>(defaultTipo || 'folhas');
  const [quantidade, setQuantidade] = useState('');
  const [observacao, setObservacao] = useState('');

  if (!item || !obra) return null;

  const saidas = item.saidas || [];
  
  const getQtdOriginal = (t: string) => parseInt(t === 'folhas' ? item.folhas : t === 'aduelas' ? item.aduelas : item.alizares) || 0;
  
  const totalSaiu = (t: string) => saidas.filter((s: any) => s.tipo === t).reduce((acc: number, s: any) => acc + (parseInt(s.quantidade) || 0), 0);

  const saldo = (t: string) => getQtdOriginal(t) - totalSaiu(t);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quantidade || parseInt(quantidade) <= 0) return;
    
    // Check if new exiting qty exceeds balance
    if (parseInt(quantidade) > saldo(tipo)) {
      if (!window.confirm(`Atenção: A quantidade de saída de ${tipo} é maior que o saldo disponível de ${saldo(tipo)}. Deseja continuar?`)) {
         return;
      }
    }

    onSaveSaida({ data, tipo, quantidade: parseInt(quantidade), observacao });
    setQuantidade('');
    setObservacao('');
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-gray-800 dark:text-gray-100">
              Registros de Saída
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              Obra: <span className="text-gray-700 dark:text-gray-300">{obra.nome}</span> | Espécie: <span className="text-gray-700 dark:text-gray-300">{item.dimensao} - {item.cor} {item.enchimento ? `- ${item.enchimento}` : ''} {item.modelo ? `- ${item.modelo}` : ''}</span>
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-auto flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-gray-700">
          {/* Esquerda: Cadastro de Saída */}
          <div className="w-full md:w-[40%] p-5 bg-gray-50/50 dark:bg-gray-800/50">
            <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center">
              <Plus className="w-4 h-4 mr-1 text-brand-green" /> Nova Saída
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data da Saída</label>
                <input 
                  type="date" 
                  value={data} 
                  onChange={e => setData(e.target.value)} 
                  required 
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Material</label>
                <select 
                  value={tipo} 
                  onChange={(e: any) => setTipo(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                >
                  <option value="folhas" className="bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100">Folhas de Porta</option>
                  <option value="aduelas" className="bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100">Aduelas</option>
                  <option value="alizares" className="bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100">Alizares</option>
                </select>
              </div>
              <div className="flex items-center gap-3">
                 <div className="flex-1">
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantidade</label>
                   <input 
                     type="number" 
                     min="1"
                     value={quantidade} 
                     onChange={e => setQuantidade(e.target.value)} 
                     required 
                     placeholder="0"
                     className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none font-semibold text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-800"
                   />
                 </div>
                 <div className="flex-1 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-center flex flex-col justify-center">
                   <div className="text-[10px] uppercase text-gray-500 dark:text-gray-400 font-bold leading-tight">Saldo Atual</div>
                   <div className={`font-bold text-lg ${saldo(tipo) <= 0 ? 'text-red-500 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`}>{saldo(tipo)}</div>
                 </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Observação (Opcional)</label>
                <textarea 
                  value={observacao} 
                  onChange={e => setObservacao(e.target.value)} 
                  rows={2}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                  placeholder="Ex: NF 1234, Recebedor Marcos"
                />
              </div>
              <button 
                type="submit"
                className="w-full py-2.5 bg-brand-green hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <History className="w-4 h-4" /> Registrar Saída
              </button>
            </form>
            
            {/* Resumo de Saldos */}
            <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
              <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">Resumo de Saldos</h4>
              <div className="space-y-2">
                {['folhas', 'aduelas', 'alizares'].map(t => (
                   <div key={t} className="flex items-center justify-between text-sm bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700 shadow-sm">
                     <span className="capitalize font-medium text-gray-600 dark:text-gray-300 flex-1">{t}</span>
                     <div className="flex items-center gap-2 text-xs">
                        <span className="text-gray-500 dark:text-gray-400" title="Entrada">Ent: <b>{getQtdOriginal(t)}</b></span>
                        <span className="text-red-500 dark:text-red-400" title="Saída">Sai: <b>{totalSaiu(t)}</b></span>
                        <span className={`w-8 text-right font-bold ${saldo(t) <= 0 ? (getQtdOriginal(t) == 0 ? 'text-gray-400 dark:text-gray-600' : 'text-red-600 dark:text-red-400') : 'text-blue-600 dark:text-blue-400'}`} title="Saldo">
                          ={saldo(t)}
                        </span>
                     </div>
                   </div>
                ))}
              </div>
            </div>
          </div>

          {/* Direita: Tabela de Histórico */}
          <div className="w-full md:w-[60%] p-5 bg-white dark:bg-gray-900 flex flex-col">
            <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center">
              <FileText className="w-4 h-4 mr-1 text-gray-500" /> Histórico de Registros
            </h3>
            
            <div className="flex-1 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800">
              {saidas.length > 0 ? (
                <div className="overflow-auto h-full max-h-[400px]">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 sticky top-0 z-10 shadow-sm">
                      <tr>
                        <th className="py-2.5 px-3 font-semibold w-24">Data</th>
                        <th className="py-2.5 px-3 font-semibold">Tipo</th>
                        <th className="py-2.5 px-3 font-semibold text-center w-20">Qtd</th>
                        <th className="py-2.5 px-3 font-semibold border-l border-gray-200 dark:border-gray-700">Observações</th>
                        <th className="py-2.5 px-3 font-semibold w-10 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {[...saidas].sort((a,b) => b.data.localeCompare(a.data)).map((s: any) => (
                        <tr key={s.id} className="hover:bg-gray-100/50 dark:hover:bg-gray-800 transition-colors bg-white dark:bg-gray-900">
                          <td className="py-2.5 px-3 text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap">
                            {new Date(`${s.data}T12:00:00`).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className={`capitalize inline-block px-2 py-0.5 rounded text-xs font-medium border
                              ${s.tipo === 'folhas' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700/50' : 
                                s.tipo === 'aduelas' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700/50' : 
                                'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700/50'}
                            `}>
                              {s.tipo}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center text-red-600 dark:text-red-400 font-bold text-base">-{s.quantidade}</td>
                          <td className="py-2.5 px-3 text-gray-500 dark:text-gray-400 text-xs border-l border-gray-100 dark:border-gray-800">
                             {s.observacao || <span className="italic text-gray-300 dark:text-gray-600">Sem observação</span>}
                          </td>
                          <td className="py-2 px-2 text-center text-red-600 dark:text-red-400 font-bold">
                            <button onClick={() => onDeleteSaida(s.id)} className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded transition-colors" title="Remover saída">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center text-gray-400 dark:text-gray-500">
                  <Package className="w-12 h-12 mb-3 text-gray-300 dark:text-gray-600" strokeWidth={1} />
                  <p className="text-base font-medium text-gray-500 dark:text-gray-400">Nenhuma saída registrada.</p>
                  <p className="text-sm mt-1 max-w-[250px]">Utilize o formulário ao lado para adicionar o primeiro registro de saída.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SaidasObras({ globalSearch = '' }: { globalSearch?: string }) {
  const [obras, setObras] = useLocalStorage<Record<string, any>>('nm_entrada_obras_v4', {});
  const [selectedObraId, setSelectedObraId] = useState<string | null>(null);
  const [selectedItemForSaidas, setSelectedItemForSaidas] = useState<{ obraId: string, itemId: string, defaultTipo?: 'folhas' | 'aduelas' | 'alizares' } | null>(null);

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
      <div className="w-64 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex flex-col h-full">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center justify-between">
          <h2 className="font-bold text-gray-700 dark:text-gray-200 text-sm tracking-wide uppercase">OBRAS (EXPEDIÇÃO)</h2>
        </div>
        <div className="flex-1 overflow-y-auto w-full max-w-full">
          {obrasList.length === 0 ? (
            <div className="p-6 text-center text-gray-500 text-sm">Nenhuma obra cadastrada.</div>
          ) : (
            obrasList.map((obra: any) => (
              <div 
                key={obra.id} 
                onClick={() => setSelectedObraId(obra.id)}
                className={cn(
                  "p-3 border-b border-gray-100 dark:border-gray-800 cursor-pointer flex justify-between items-center group transition-colors",
                  selectedObraId === obra.id 
                    ? "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500" 
                    : "hover:bg-gray-50 dark:hover:bg-gray-800 border-l-4 border-l-transparent"
                )}
              >
                <div className="flex flex-col overflow-hidden pr-2">
                  <span className={cn("font-semibold truncate sm:whitespace-normal", selectedObraId === obra.id ? "text-blue-800 dark:text-blue-200" : "text-gray-700 dark:text-gray-300")}>{obra.nome}</span>
                  <span className="text-xs text-gray-500 mt-1">{obra.itens?.length || 0} itens para expedição</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-950 h-full overflow-hidden">
        {activeObra ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-500" /> Expedição: {activeObra.nome}
              </h2>
            </div>
            
            <div className="flex-1 overflow-auto p-4 w-full">
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-x-auto w-full">
                <table className="w-full text-center text-sm border-collapse min-w-[1000px]">
                  <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-b border-gray-300 dark:border-gray-700 sticky top-0 z-10 shadow-sm">
                    <tr>
                      <th className="p-3 border-r border-gray-300 dark:border-gray-700 font-bold w-[25%] text-left pl-4">ESPECIFICAÇÕES</th>
                      <th className="p-3 border-r border-gray-300 dark:border-gray-700 font-bold bg-blue-50 dark:bg-blue-900/60 text-blue-800 dark:text-blue-100 w-[25%]">FOLHAS DE PORTA</th>
                      <th className="p-3 border-r border-gray-300 dark:border-gray-700 font-bold bg-amber-50 dark:bg-amber-900/60 text-amber-800 dark:text-amber-100 w-[25%]">ADUELAS</th>
                      <th className="p-3 font-bold bg-purple-50 dark:bg-purple-900/60 text-purple-800 dark:text-purple-100 w-[25%]">ALIZARES</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {(activeObra.itens || []).length === 0 ? (
                      <tr><td colSpan={4} className="p-8 text-gray-500">Nenhum item nesta obra.</td></tr>
                    ) : (
                      (activeObra.itens || []).map((item: any) => {
                        const totalFolhasSaida = (item.saidas || []).filter((s:any) => s.tipo === 'folhas').reduce((acc:number, s:any) => acc + (parseInt(s.quantidade)||0), 0);
                        const totalAduelasSaida = (item.saidas || []).filter((s:any) => s.tipo === 'aduelas').reduce((acc:number, s:any) => acc + (parseInt(s.quantidade)||0), 0);
                        const totalAlizarSaida = (item.saidas || []).filter((s:any) => s.tipo === 'alizares').reduce((acc:number, s:any) => acc + (parseInt(s.quantidade)||0), 0);
                        
                        const reqFolhas = parseInt(item.folhas) || 0;
                        const reqAduelas = parseInt(item.aduelas) || 0;
                        const reqAlizares = parseInt(item.alizares) || 0;

                        return (
                          <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 bg-white dark:bg-gray-900 transition-colors">
                            <td className="p-4 border-r border-gray-200 dark:border-gray-700 text-left align-top">
                              <div className="font-semibold text-gray-800 dark:text-gray-200 text-base">{item.dimensao || 'Sem dimensão'}</div>
                              <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-1">{item.cor || 'Sem cor'}</div>
                              <div className="text-xs text-gray-500 mt-1.5 flex flex-wrap gap-1">
                                {item.enchimento && <span className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700">{item.enchimento}</span>}
                                {item.modelo && <span className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700">{item.modelo}</span>}
                              </div>
                            </td>
                            {/* FOLHAS */}
                            <td className="p-0 border-r border-gray-200 dark:border-gray-700 align-top bg-blue-50/10 dark:bg-blue-900/5">
                              <div className="p-3 h-full flex flex-col">
                                <div className="flex justify-between items-center mb-1">
                                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Entrada</div>
                                  <div className="font-bold text-lg text-gray-800 dark:text-gray-200">{reqFolhas}</div>
                                </div>
                                <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Saída</div>
                                  <div className="font-bold text-base text-red-500 dark:text-red-400">{totalFolhasSaida}</div>
                                </div>
                                <div className="mt-auto">
                                  <button
                                    onClick={() => setSelectedItemForSaidas({ obraId: activeObra.id, itemId: item.id, defaultTipo: 'folhas' })}
                                    className="w-full py-2 px-3 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/40 dark:hover:bg-blue-800/60 text-blue-700 dark:text-blue-300 font-bold rounded shadow-sm border border-blue-200 dark:border-blue-800/50 transition-colors text-xs flex items-center justify-center gap-1.5"
                                  >
                                    <History className="w-3.5 h-3.5" /> Registrar Saídas
                                  </button>
                                </div>
                              </div>
                            </td>

                            {/* ADUELAS */}
                            <td className="p-0 border-r border-gray-200 dark:border-gray-700 align-top bg-amber-50/10 dark:bg-amber-900/5">
                              <div className="p-3 h-full flex flex-col">
                                <div className="mb-3 text-center bg-amber-100/50 dark:bg-amber-900/30 py-1 px-2 rounded-md text-xs font-bold text-amber-800 dark:text-amber-200 truncate border border-amber-200/50 dark:border-amber-700/30">
                                  {item.medidaAduela || 'S/ Medida'}
                                </div>
                                <div className="flex justify-between items-center mb-1">
                                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Entrada</div>
                                  <div className="font-bold text-lg text-gray-800 dark:text-gray-200">{reqAduelas}</div>
                                </div>
                                <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Saída</div>
                                  <div className="font-bold text-base text-red-500 dark:text-red-400">{totalAduelasSaida}</div>
                                </div>
                                <div className="mt-auto">
                                  <button
                                    onClick={() => setSelectedItemForSaidas({ obraId: activeObra.id, itemId: item.id, defaultTipo: 'aduelas' })}
                                    className="w-full py-2 px-3 bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/40 dark:hover:bg-amber-800/60 text-amber-700 dark:text-amber-300 font-bold rounded shadow-sm border border-amber-200 dark:border-amber-800/50 transition-colors text-xs flex items-center justify-center gap-1.5"
                                  >
                                    <History className="w-3.5 h-3.5" /> Registrar Saídas
                                  </button>
                                </div>
                              </div>
                            </td>

                            {/* ALIZARES */}
                            <td className="p-0 align-top bg-purple-50/10 dark:bg-purple-900/5">
                              <div className="p-3 h-full flex flex-col">
                                <div className="mb-3 text-center bg-purple-100/50 dark:bg-purple-900/30 py-1 px-2 rounded-md text-xs font-bold text-purple-800 dark:text-purple-200 truncate border border-purple-200/50 dark:border-purple-700/30">
                                  {item.medidaAlizar || 'S/ Face'}
                                </div>
                                <div className="flex justify-between items-center mb-1">
                                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Entrada</div>
                                  <div className="font-bold text-lg text-gray-800 dark:text-gray-200">{reqAlizares}</div>
                                </div>
                                <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Saída</div>
                                  <div className="font-bold text-base text-red-500 dark:text-red-400">{totalAlizarSaida}</div>
                                </div>
                                <div className="mt-auto">
                                  <button
                                    onClick={() => setSelectedItemForSaidas({ obraId: activeObra.id, itemId: item.id, defaultTipo: 'alizares' })}
                                    className="w-full py-2 px-3 bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/40 dark:hover:bg-purple-800/60 text-purple-700 dark:text-purple-300 font-bold rounded shadow-sm border border-purple-200 dark:border-purple-800/50 transition-colors text-xs flex items-center justify-center gap-1.5"
                                  >
                                    <History className="w-3.5 h-3.5" /> Registrar Saídas
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <Target className="w-16 h-16 text-gray-200 dark:text-gray-700 mb-4" />
            <h2 className="text-xl font-bold text-gray-400 dark:text-gray-500">Selecione uma Obra</h2>
            <p className="text-gray-400 dark:text-gray-500 mt-2 text-center max-w-sm">Para registrar expedição de itens, selecione a obra no menu esquerdo.</p>
          </div>
        )}
      </div>

      {selectedItemForSaidas && (
        <ModalSaidas 
          obra={obras[selectedItemForSaidas.obraId]} 
          item={obras[selectedItemForSaidas.obraId]?.itens?.find((i: any) => i.id === selectedItemForSaidas.itemId)}
          defaultTipo={selectedItemForSaidas.defaultTipo}
          onClose={() => setSelectedItemForSaidas(null)}
          onSaveSaida={(saida) => {
            setObras(prev => {
              const prevObra = prev[selectedItemForSaidas.obraId];
              if (!prevObra) return prev;
              const newItens = prevObra.itens.map((it: any) => {
                if (it.id === selectedItemForSaidas.itemId) {
                  return {
                    ...it,
                    saidas: [...(it.saidas || []), { ...saida, id: Date.now().toString() }]
                  };
                }
                return it;
              });
              return {
                ...prev,
                [selectedItemForSaidas.obraId]: { ...prevObra, itens: newItens }
              };
            });
          }}
          onDeleteSaida={(saidaId) => {
            setObras(prev => {
              const prevObra = prev[selectedItemForSaidas.obraId];
              if (!prevObra) return prev;
              const newItens = prevObra.itens.map((it: any) => {
                if (it.id === selectedItemForSaidas.itemId) {
                  return {
                    ...it,
                    saidas: (it.saidas || []).filter((s: any) => s.id !== saidaId)
                  };
                }
                return it;
              });
              return {
                ...prev,
                [selectedItemForSaidas.obraId]: { ...prevObra, itens: newItens }
              };
            });
          }}
        />
      )}
    </div>
  );
}
