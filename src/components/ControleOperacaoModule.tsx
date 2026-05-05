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

function ControleSaidas() {
  // Mock data to match "MATERIAIS ENVIADOS" Excel
  // Dates from 01/05/2026 to 13/05/2026
  const data = Array.from({length: 13}, (_, i) => {
    const day = i + 1;
    const date = new Date(2026, 4, day); // month 4 = May
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    let entrega1 = '';
    let entrega2 = '';
    let kits1 = 0, alizares1 = 0;
    let kits2 = 0, alizares2 = 0;

    if (!isWeekend) {
      if (day === 4) { entrega1 = 'TEGRA CLARIS'; alizares1 = 452; entrega2 = 'TEGRA GAE'; kits2 = 22; alizares2 = 22; }
      if (day === 5) { entrega1 = 'TEGRA CLARIS'; kits1 = 116; entrega2 = 'ISCOURI DOMUM'; kits2 = 5; alizares2 = 5; }
      if (day === 6) { entrega1 = 'TEGRA CLARIS'; kits1 = 111; }
    } else {
      entrega1 = date.getDay() === 6 ? 'SABADO' : 'DOMINGO';
      entrega2 = entrega1;
    }

    return {
      date: date.toLocaleDateString('pt-BR'),
      ds: DIAS_SEMANA[date.getDay()],
      isWeekend,
      entrega1, kits1, alizares1,
      entrega2, kits2, alizares2
    }
  });

  return (
    <div className="flex-1 flex flex-col max-h-full">
      <div className="p-4 border-b border-gray-200 bg-gray-50 lg:flex items-center justify-between">
        <h2 className="font-semibold text-gray-700 flex items-center">
          <Truck className="w-5 h-5 mr-2 text-brand-green" /> Materiais Enviados (Saídas)
        </h2>
        <div className="mt-3 lg:mt-0 flex gap-2">
           <button className="flex items-center px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50">
             <Download className="w-4 h-4 mr-1"/> Exportar
           </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        <table className="w-full text-center text-xs whitespace-nowrap border-collapse">
          <thead>
            <tr>
              <th rowSpan={2} colSpan={2} className="p-2 border border-blue-400 bg-blue-400 text-white font-bold text-sm">TOTAL</th>
              <th className="p-2 border border-blue-400 bg-blue-300 text-blue-900 font-bold">KITS</th>
              <th className="p-2 border border-blue-400 bg-blue-300 text-blue-900 font-bold">ALIZARES</th>
              <th className="p-2 border border-blue-400 bg-blue-300 text-blue-900 font-bold">FOLHAS</th>
              <th className="p-2 border border-blue-400 bg-blue-300 text-blue-900 font-bold">ADUELAS</th>
              <th className="p-2 border border-blue-400 bg-blue-300 text-blue-900 font-bold">RODAPÉS</th>
              <th className="p-2 border border-blue-400 bg-blue-300 text-blue-900 font-bold">PAINÉIS</th>
              <th colSpan={7} className="border-none bg-white"></th>
            </tr>
            <tr>
              <th className="p-2 border border-blue-400 bg-blue-100 font-semibold">254</th>
              <th className="p-2 border border-blue-400 bg-blue-100 font-semibold">479</th>
              <th className="p-2 border border-blue-400 bg-blue-100 font-semibold">0</th>
              <th className="p-2 border border-blue-400 bg-blue-100 font-semibold">0</th>
              <th className="p-2 border border-blue-400 bg-blue-100 font-semibold">0</th>
              <th className="p-2 border border-blue-400 bg-blue-100 font-semibold">0</th>
              <th colSpan={7} className="border-none bg-white"></th>
            </tr>
            <tr className="bg-gray-100 text-gray-700">
              <th className="p-2 border border-gray-300 w-12">D/S</th>
              <th className="p-2 border border-gray-300 w-24">DATA</th>
              <th className="p-2 border border-gray-300 bg-orange-400 text-white min-w-[150px]">ENTREGA 1</th>
              <th className="p-2 border border-gray-300 bg-orange-400 text-white">KITS</th>
              <th className="p-2 border border-gray-300 bg-orange-400 text-white">ALIZARES</th>
              <th className="p-2 border border-gray-300 bg-orange-400 text-white">FOLHAS</th>
              <th className="p-2 border border-gray-300 bg-orange-400 text-white">ADUELAS</th>
              <th className="p-2 border border-gray-300 bg-orange-400 text-white">RODAPÉS</th>
              <th className="p-2 border border-gray-300 bg-orange-400 text-white">PAINÉIS</th>
              <th className="p-2 border border-gray-300 bg-green-500 text-white min-w-[150px]">ENTREGA 2</th>
              <th className="p-2 border border-gray-300 bg-green-500 text-white">KITS</th>
              <th className="p-2 border border-gray-300 bg-green-500 text-white">ALIZARES</th>
              <th className="p-2 border border-gray-300 bg-green-500 text-white">FOLHAS</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} className="hover:opacity-90">
                <td className="p-2 border border-gray-300 bg-gray-500 text-white font-medium">{row.ds}</td>
                <td className="p-2 border border-gray-300 bg-white">{row.date}</td>
                {row.isWeekend ? (
                  <>
                    <td colSpan={7} className="p-2 border border-gray-300 bg-red-600 text-white font-bold tracking-wider">{row.entrega1}</td>
                    <td colSpan={4} className="p-2 border border-gray-300 bg-red-600 text-white font-bold tracking-wider">{row.entrega2}</td>
                  </>
                ) : (
                  <>
                    <td className="p-2 border border-gray-300 bg-orange-200 font-medium">{row.entrega1}</td>
                    <td className="p-2 border border-gray-300 bg-orange-100">{row.kits1 || ''}</td>
                    <td className="p-2 border border-gray-300 bg-orange-100">{row.alizares1 || ''}</td>
                    <td className="p-2 border border-gray-300 bg-orange-100"></td>
                    <td className="p-2 border border-gray-300 bg-orange-100"></td>
                    <td className="p-2 border border-gray-300 bg-orange-100"></td>
                    <td className="p-2 border border-gray-300 bg-orange-100"></td>
                    <td className="p-2 border border-gray-300 bg-green-200 font-medium">{row.entrega2}</td>
                    <td className="p-2 border border-gray-300 bg-green-100">{row.kits2 || ''}</td>
                    <td className="p-2 border border-gray-300 bg-green-100">{row.alizares2 || ''}</td>
                    <td className="p-2 border border-gray-300 bg-green-100"></td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function OperacaoProducao() {
  const getDaysArray = (year: number, month: number) => {
    const numDays = new Date(year, month + 1, 0).getDate();
    return Array.from({length: numDays}, (_, i) => {
      const date = new Date(year, month, i + 1);
      return {
        dateStr: date.toLocaleDateString('pt-BR'),
        isWeekend: date.getDay() === 0 || date.getDay() === 6
      }
    });
  };

  const daysJunho = getDaysArray(2026, 5); // 5 = june
  const daysAgosto = getDaysArray(2026, 7); // 7 = august

  const renderMonthSection = (days: any[], title: string) => {
    // Break days into chunks of 7 to form columns similar to excel
    const chunkSize = 7;
    const columns = [];
    for (let i = 0; i < days.length; i += chunkSize) {
      columns.push(days.slice(i, i + chunkSize));
    }

    return (
      <div className="mb-8">
        <div className="flex">
          <div className="bg-blue-600 text-white font-bold p-2 px-4 shadow-sm w-[350px]">
            {title}
          </div>
          <div className="bg-blue-600 text-white font-bold p-2 px-4 text-center ml-1 flex-1 shadow-sm">
            0
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
                      "p-1.5 border border-gray-300",
                      day.isWeekend ? "bg-red-600" : "bg-green-200"
                    )}></td>
                    <td className={cn(
                      "p-1.5 border border-gray-300",
                      day.isWeekend ? "bg-red-600" : "bg-[#DDEBF7]" // Light blue for inputs
                    )}></td>
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
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
        <h2 className="font-semibold text-gray-700 flex items-center">
          <Target className="w-5 h-5 mr-2 text-brand-green" /> Total de Kits Montados (Operação)
        </h2>
      </div>
      <div className="flex-1 overflow-auto p-4 bg-gray-50">
        {renderMonthSection(daysJunho, 'TOTAL EM JUNHO:')}
        {renderMonthSection(daysAgosto, 'TOTAL EM AGOSTO:')}
      </div>
    </div>
  )
}
