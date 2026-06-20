import React, { useState, useMemo } from 'react';
import { useLocalStorage } from './EstoqueModule';
import { Printer, Search, Plus, Minus, X, Trash2, Settings } from 'lucide-react';
import { cn } from '../lib/utils';

// Constantes de formatos Pimaco
const FORMATOS_PIMACO = [
  {
    id: '6182',
    name: 'Pimaco 6182 / 6282 / 6082 (14 / folha)',
    desc: '101.6mm x 33.9mm',
    labelsPerPage: 14,
    cols: 2,
    rows: 7,
    marginTop: 21.2, // mm
    marginLeft: 4.0, // mm
    labelWidth: 101.6, // mm
    labelHeight: 33.9, // mm
    gapX: 0,
    gapY: 0
  },
  {
    id: '6183',
    name: 'Pimaco 6183 / 6283 / 6083 (10 / folha)',
    desc: '101.6mm x 50.8mm',
    labelsPerPage: 10,
    cols: 2,
    rows: 5,
    marginTop: 21.5, // mm
    marginLeft: 4.0, // mm
    labelWidth: 101.6, // mm
    labelHeight: 50.8, // mm
    gapX: 0,
    gapY: 0
  },
  {
    id: '6180',
    name: 'Pimaco 6180 / 6280 / 6080 (30 / folha)',
    desc: '66.7mm x 25.4mm',
    labelsPerPage: 30,
    cols: 3,
    rows: 10,
    marginTop: 21.2, // mm
    marginLeft: 4.0, // mm (aproximado)
    labelWidth: 66.7, // mm
    labelHeight: 25.4, // mm
    gapX: 0,
    gapY: 0
  }
];

export function EtiquetasModule({ globalSearch = '' }: { globalSearch?: string }) {
  const [kits] = useLocalStorage<any[]>('nacional_madeiras_kits_v6', []);
  const [fila, setFila] = useState<{kit: any; qtd: number; id: string}[]>([]);
  const [formato, setFormato] = useState(FORMATOS_PIMACO[0]);
  
  const filteredKits = useMemo(() => {
    if (!globalSearch.trim()) return kits;
    const lbd = globalSearch.toLowerCase();
    return kits.filter((k: any) => 
      k.bloco?.toLowerCase().includes(lbd) ||
      k.apto?.toLowerCase().includes(lbd) ||
      k.comodo?.toLowerCase().includes(lbd) ||
      k.tipologia?.toLowerCase().includes(lbd) ||
      k.caracteristicaPorta?.toLowerCase().includes(lbd)
    );
  }, [kits, globalSearch]);

  const addKit = (kit: any) => {
    setFila(prev => {
      const exists = prev.find(i => i.kit.id === kit.id);
      if (exists) {
        return prev.map(i => i.kit.id === kit.id ? { ...i, qtd: i.qtd + 1 } : i);
      }
      return [...prev, { kit, qtd: 1, id: Math.random().toString(36).substr(2, 9) }];
    });
  };

  const removeFila = (id: string) => {
    setFila(prev => prev.filter(i => i.id !== id));
  };
  
  const clearFila = () => {
    if (confirm("Limpar toda a fila?")) setFila([]);
  }

  const updateQtd = (id: string, delta: number) => {
    setFila(prev => prev.map(i => {
      if (i.id === id) {
        const nq = i.qtd + delta;
        return { ...i, qtd: nq > 0 ? nq : 1 };
      }
      return i;
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  // Gerar o array final de etiquetas a serem impressas
  const labelsToPrint = useMemo(() => {
    const arr: any[] = [];
    fila.forEach(item => {
      for (let i = 0; i < item.qtd; i++) {
        arr.push(item.kit);
      }
    });
    return arr;
  }, [fila]);

  // Dividir as etiquetas em páginas baseadas no formato selecionado
  const pages = useMemo(() => {
    const list = [...labelsToPrint];
    const paginated = [];
    while (list.length > 0) {
      paginated.push(list.splice(0, formato.labelsPerPage));
    }
    return paginated;
  }, [labelsToPrint, formato]);

  return (
    <div className="flex flex-col h-full print:block bg-gray-50">
      {/* UI DE CONTROLE (Não visível na impressão) */}
      <div className="print:hidden flex flex-col md:flex-row h-[calc(100vh-4rem)] p-4 md:p-6 lg:p-8 gap-6 animate-in fade-in max-h-screen">
        
        {/* LADO ESQUERDO: Escolher Kits */}
        <div className="flex-1 overflow-hidden flex flex-col bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <Search className="w-5 h-5 text-gray-500" /> 
              Buscar Kits Cadastrados
            </h2>
            <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded text-xs font-bold">{filteredKits.length} reg</span>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {filteredKits.length === 0 ? (
              <div className="p-8 text-center text-gray-400">Nenhum kit encontrado.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2">
                {filteredKits.map(kit => (
                  <div key={kit.id} className="border border-gray-200 rounded-lg p-3 hover:border-brand-green/50 hover:shadow-md transition-all bg-white cursor-pointer group" onClick={() => addKit(kit)}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-bold text-sm text-gray-800">
                        {kit.bloco} - {kit.apto} <span className="text-gray-400 font-normal">({kit.comodo})</span>
                      </div>
                      <button className="bg-gray-100 hover:bg-brand-green hover:text-white p-1 rounded-md text-gray-500 transition-colors">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-xs text-gray-600 space-y-0.5">
                      <p><span className="font-semibold text-gray-500 w-16 inline-block">Porta:</span> {kit.folhaLargura}x{kit.folhaAltura} {kit.caracteristicaPorta}</p>
                      <p><span className="font-semibold text-gray-500 w-16 inline-block">Aduela:</span> {kit.aduelaLargura}x{kit.aduelaAltura}</p>
                      <p><span className="font-semibold text-gray-500 w-16 inline-block">Lado:</span> {kit.abertura}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* LADO DIREITO: Fila de Impressão e Configs */}
        <div className="w-full md:w-96 lg:w-[400px] flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h2 className="font-bold text-gray-800 flex items-center justify-between">
              Fila de Impressão
              <span className="bg-brand-green text-white px-2 py-0.5 rounded text-xs">{labelsToPrint.length} etq</span>
            </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {fila.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                <Printer className="w-12 h-12 opacity-20" />
                <p className="text-sm text-center">Fila vazia.<br/>Clique nos kits para adicionar.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {fila.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded flex items-center justify-between p-2">
                    <div className="flex-1 truncate pr-2">
                      <div className="text-sm font-bold text-gray-800 truncate">{item.kit.bloco} - {item.kit.apto}</div>
                      <div className="text-xs text-gray-500 truncate">{item.kit.comodo} | {item.kit.folhaLargura}x{item.kit.folhaAltura}</div>
                    </div>
                    <div className="flex items-center space-x-1 border border-gray-200 rounded-md p-0.5 bg-gray-50">
                      <button onClick={() => updateQtd(item.id, -1)} className="p-1 hover:bg-gray-200 rounded text-gray-600"><Minus className="w-3 h-3" /></button>
                      <span className="w-6 text-center font-bold text-sm text-gray-800">{item.qtd}</span>
                      <button onClick={() => updateQtd(item.id, 1)} className="p-1 hover:bg-gray-200 rounded text-gray-600"><Plus className="w-3 h-3" /></button>
                    </div>
                    <button onClick={() => removeFila(item.id)} className="ml-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"><X className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600 flex items-center gap-1"><Settings className="w-3 h-3" /> Formato Pimaco</label>
              <select 
                className="w-full text-sm border-gray-300 rounded-md focus:ring-brand-green focus:border-brand-green"
                value={formato.id}
                onChange={e => setFormato(FORMATOS_PIMACO.find(f => f.id === e.target.value) || FORMATOS_PIMACO[0])}
              >
                {FORMATOS_PIMACO.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>
            
            <div className="flex space-x-2">
              <button 
                onClick={clearFila}
                disabled={fila.length === 0}
                className="px-3 py-2 border border-gray-300 rounded text-gray-600 font-medium text-sm hover:bg-gray-100 disabled:opacity-50 transition-colors flex items-center justify-center" title="Limpar Fila"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button 
                onClick={handlePrint}
                disabled={labelsToPrint.length === 0}
                className="flex-1 px-4 py-2 bg-brand-green text-white font-bold rounded shadow-sm hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center space-x-2"
              >
                <Printer className="w-4 h-4" /> <span>Imprimir Etiquetas</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ÁREA DE IMPRESSÃO - Apenas Visível na Impressão */}
      <div className="hidden print:block font-sans text-black" style={{ backgroundColor: 'white' }}>
        <style dangerouslySetInnerHTML={{__html: `
          @page {
            size: A4 portrait;
            margin: 0;
          }
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            background: white !important;
          }
        `}} />
        
        {pages.map((pageLabels, pageIndex) => (
          <div 
            key={pageIndex} 
            className="box-border"
            style={{ 
              width: '210mm', 
              height: '296.5mm', // using 296.5 to avoid extra blank pages sometimes
              paddingTop: `${formato.marginTop}mm`, 
              paddingLeft: `${formato.marginLeft}mm`,
              pageBreakAfter: pageIndex < pages.length - 1 ? 'always' : 'auto',
              display: 'flex',
              flexWrap: 'wrap',
              alignContent: 'flex-start',
              position: 'relative'
            }}
          >
            {pageLabels.map((kit, i) => (
              <div 
                key={i}
                className="box-border border border-dashed border-gray-300 print:border-transparent overflow-hidden"
                style={{
                  width: `${formato.labelWidth}mm`,
                  height: `${formato.labelHeight}mm`,
                  marginRight: `${formato.gapX}mm`,
                  marginBottom: `${formato.gapY}mm`,
                }}
              >
                <LabelInnerContent kit={kit} formato={formato} />
              </div>
            ))}
          </div>
        ))}
        {pages.length === 0 && (
          <div className="p-10 text-center font-bold">Nenhuma etiqueta na fila (este texto só aparece se você tentar imprimir com a fila vazia).</div>
        )}
      </div>
    </div>
  );
}

function LabelInnerContent({ kit, formato }: { kit: any; formato: any }) {
  // Ajustar o layout interno com base no tamanho da etiqueta.
  // Etiquetas menores (6180) precisam de fonte menor e menos informações.
  
  const isSmall = formato.id === '6180';

  if (isSmall) {
    return (
      <div className="w-full h-full p-2 flex flex-col justify-center">
        <div className="font-bold text-[10px] leading-tight text-center border-b border-black pb-0.5 mb-1 truncate uppercase">
          {kit.bloco} - {kit.apto} <span className="font-normal">({kit.comodo})</span>
        </div>
        <div className="flex justify-between text-[8px] font-mono leading-tight px-1">
          <div><span className="font-bold">Pta:</span> {kit.folhaLargura}x{kit.folhaAltura}</div>
          <div className="text-right"><span className="font-bold">{kit.abertura}</span></div>
        </div>
        <div className="flex justify-between text-[8px] font-mono leading-tight px-1 mt-0.5">
          <div className="truncate"><span className="font-bold">Ad:</span> {kit.aduelaLargura}x{kit.aduelaAltura}</div>
          <div className="text-right truncate ml-1">{kit.caracteristicaPorta?.substring(0, 8)}</div>
        </div>
      </div>
    );
  }

  // Padrão Médio/Grande (6182, 6183)
  return (
    <div className="w-full h-full p-3 pl-4 flex flex-col justify-center">
      <div className="flex justify-between items-start border-b-2 border-black pb-1 mb-1.5">
        <div className="flex flex-col">
          <div className="font-black text-xs tracking-widest uppercase">Bloco: {kit.bloco} | Apto: {kit.apto}</div>
          <div className="font-bold text-[10px] text-gray-700 mt-0.5 uppercase">CÔMODO: {kit.comodo}</div>
        </div>
        <div className="text-right ml-2 flex flex-col items-end">
          <span className="font-black text-[10px] px-1.5 py-0.5 border border-black rounded uppercase whitespace-nowrap">{kit.abertura}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[9px] font-mono leading-tight uppercase font-semibold">
        <div>
          <span className="text-gray-500 font-bold block text-[7px] mb-[-2px]">Folha Porta:</span>
          <span className="text-[11px]">{kit.folhaLargura}x{kit.folhaAltura} {kit.acabamentoPorta}</span>
        </div>
        <div>
          <span className="text-gray-500 font-bold block text-[7px] mb-[-2px]">Aduela:</span>
          <span className="text-[11px]">{kit.aduelaLargura}x{kit.aduelaAltura} ({kit.regulagem})</span>
        </div>
        <div className="mt-0.5">
          <span className="text-gray-500 font-bold block text-[7px] mb-[-2px]">Características:</span>
          {kit.caracteristicaPorta.substring(0,25)} {kit.caracteristicaPorta.length > 25 ? '...' : ''}
        </div>
        <div className="mt-0.5">
          <span className="text-gray-500 font-bold block text-[7px] mb-[-2px]">Fech./Dobradiça:</span>
          {kit.fechaduraMarca} - {kit.fechaduraTipo} | {kit.dobradicaMedida}
        </div>
      </div>
    </div>
  );
}
