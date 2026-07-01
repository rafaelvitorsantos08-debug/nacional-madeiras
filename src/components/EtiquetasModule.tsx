import React, { useState, useMemo } from 'react';
import { useLocalStorage } from './EstoqueModule';
import { Printer, Search, Plus, Minus, X, Trash2, Settings, Instagram } from 'lucide-react';
import { cn } from '../lib/utils';
import { QRCodeSVG } from 'qrcode.react';

// Constantes de formatos Pimaco
const FORMATOS_PIMACO = [
  {
    id: '6183',
    name: 'Pimaco 6183 (Carta - 10/folha)',
    desc: '101.6mm x 50.8mm',
    labelsPerPage: 10,
    cols: 2,
    rows: 5,
    marginTop: 12.7, // mm
    marginLeft: 4.0, // mm
    labelWidth: 101.6, // mm
    labelHeight: 50.8, // mm
    gapX: 4.6, // mm
    gapY: 0,
    pageWidth: 215.9,
    pageHeight: 279.4
  },
  {
    id: '6187',
    name: 'Pimaco 6187 / 6287 (10 / folha) - 99x55.8mm',
    desc: '99.0mm x 55.8mm',
    labelsPerPage: 10,
    cols: 2,
    rows: 5,
    marginTop: 8.8, // mm (aproximado)
    marginLeft: 4.8, // mm (aproximado)
    labelWidth: 99.0, // mm
    labelHeight: 55.88, // mm
    gapX: 2.6, // (210 - 2*99)/2 = 6, but typical gap is 2.6 for pitch 101.6
    gapY: 0,
    pageWidth: 210,
    pageHeight: 297
  },
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
    gapY: 0,
    pageWidth: 215.9,
    pageHeight: 279.4
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
    gapY: 0,
    pageWidth: 215.9,
    pageHeight: 279.4
  }
];

// Helper for dimension
const getPortaDimensao = (kit: any) => {
  const qtdeFolhas = parseInt(String(kit.qtdeFolhasPorKit || '1'), 10);
  const w = kit.folhaLargura;
  const h = kit.folhaAltura;
  if (!isNaN(qtdeFolhas) && qtdeFolhas > 1 && w && !isNaN(parseInt(w, 10))) {
    const met = parseInt(w, 10) / qtdeFolhas;
    return `${w}x${h} (${qtdeFolhas}x ${met}x${h})`;
  }
  return `${w}x${h}`;
};

export function EtiquetasModule({ globalSearch = '' }: { globalSearch?: string }) {
  const [kits] = useLocalStorage<any[]>('nacional_madeiras_kits_v6', []);
  const [fila, setFila] = useState<{kit: any; qtd: number; id: string}[]>([]);
  const [formato, setFormato] = useState(FORMATOS_PIMACO[0]);
  const [header] = useLocalStorage<any>("nm_active_relatorio_header", {
    cliente: "",
    obra: "",
  });
  
  const filteredKits = useMemo(() => {
    const safeKits = Array.isArray(kits) ? kits : [];
    if (!globalSearch.trim()) return safeKits;
    const lbd = globalSearch.toLowerCase();
    return safeKits.filter((k: any) => 
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
      return [...prev, { kit, qtd: 1, id: Math.random().toString(36).substring(2, 9) }];
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

  const addAllFiltered = () => {
    setFila(prev => {
      const newFila = [...prev];
      filteredKits.forEach(kit => {
        if (!kit) return;
        const existsIndex = newFila.findIndex(i => i.kit?.id === kit.id);
        if (existsIndex >= 0) {
          newFila[existsIndex] = { ...newFila[existsIndex], qtd: newFila[existsIndex].qtd + 1 };
        } else {
          newFila.push({ kit, qtd: 1, id: Math.random().toString(36).substring(2, 9) });
        }
      });
      return newFila;
    });
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
            <div className="flex items-center gap-3">
              <button 
                onClick={addAllFiltered}
                className="text-xs font-bold bg-brand-green/10 text-brand-green hover:bg-brand-green/20 px-3 py-1 rounded transition-colors flex items-center gap-1"
                title="Adicionar todos os filtrados à fila"
              >
                <Plus className="w-3 h-3" />
                Selecionar Todas
              </button>
              <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded text-xs font-bold">{filteredKits.length} reg</span>
            </div>
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
                      <p><span className="font-semibold text-gray-500 w-16 inline-block">Porta:</span> {getPortaDimensao(kit)} {kit.caracteristicaPorta}</p>
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
                      <div className="text-xs text-gray-500 truncate">{item.kit.comodo} | {getPortaDimensao(item.kit)}</div>
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
            
            <div className="bg-yellow-50 text-yellow-800 text-xs p-3 rounded-md border border-yellow-200 mt-2">
              <strong>Atenção para impressão:</strong> Na tela de opções do navegador, mude as <strong>Margens para "Nenhuma"</strong> (ou Nenhuma / Customizada com 0) e <strong>Escala (Scale) para "Padrão" ou "100%"</strong>, e desmarque Cabeçalhos e Rodapés.
            </div>
          </div>
        </div>
      </div>

      {/* ÁREA DE IMPRESSÃO - Apenas Visível na Impressão */}
      <div className="hidden print:block font-sans text-black" style={{ backgroundColor: 'white' }}>
        <style dangerouslySetInnerHTML={{__html: `
          @page {
            size: ${formato.pageWidth}mm ${formato.pageHeight}mm;
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
              width: `${formato.pageWidth}mm`, 
              height: `${formato.pageHeight}mm`, 
              pageBreakAfter: pageIndex < pages.length - 1 ? 'always' : 'auto',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {pageLabels.map((kit, i) => {
              const row = Math.floor(i / formato.cols);
              const col = i % formato.cols;
              const top = formato.marginTop + (row * (formato.labelHeight + formato.gapY));
              const left = formato.marginLeft + (col * (formato.labelWidth + formato.gapX));
              
              return (
                <div 
                  key={i}
                  className="box-border border border-dashed border-gray-300 print:border-transparent overflow-hidden"
                  style={{
                    position: 'absolute',
                    top: `${top}mm`,
                    left: `${left}mm`,
                    width: `${formato.labelWidth}mm`,
                    height: `${formato.labelHeight}mm`,
                  }}
                >
                  <LabelInnerContent kit={kit} formato={formato} header={header} />
                </div>
              );
            })}
          </div>
        ))}
        {pages.length === 0 && (
          <div className="p-10 text-center font-bold">Nenhuma etiqueta na fila (este texto só aparece se você tentar imprimir com a fila vazia).</div>
        )}
      </div>
    </div>
  );
}

function LabelInnerContent({ kit, formato, header }: { kit: any; formato: any; header: any }) {
  // Ajustar o layout interno com base no tamanho da etiqueta.
  // Etiquetas menores (6180) precisam de fonte menor e menos informações.
  
  const isSmall = formato.id === '6180';

  if (isSmall) {
    return (
      <div className="w-full h-full p-2 flex flex-col justify-center">
        <div className="flex justify-between items-start border-b border-black pb-0.5 mb-1">
          <div className="flex flex-col flex-1 truncate pr-1">
            <div className="font-extrabold text-[8px] uppercase leading-none mb-0.5 text-brand-green">Nacional Madeiras <span className="font-medium text-gray-600">KIT PORTA</span></div>
            {(header?.cliente || header?.obra) && (
              <div className="font-bold text-[6px] uppercase leading-tight mb-0.5 text-gray-600">
                {header.cliente && `CLIENTE: ${header.cliente}`} {header.cliente && header.obra && '| '} {header.obra && `OBRA: ${header.obra}`}
              </div>
            )}
            <div className="font-bold text-[8px] uppercase leading-none truncate">
              {kit.bloco}-{kit.apto} <span className="font-normal">({kit.comodo} - {kit.tipologia})</span>
            </div>
            <div className="font-bold text-[7px] mt-0.5 truncate uppercase">{kit.abertura}</div>
          </div>
          <div className="flex-shrink-0 pt-0.5 flex flex-col items-center">
            <QRCodeSVG value="https://www.instagram.com/nacionalmadeirasltda/" size={26} level="M" includeMargin={false} />
            <div className="flex items-center gap-0.5 mt-0.5">
              <svg width="6" height="6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7.75 2h8.5c3.175 0 5.75 2.575 5.75 5.75v8.5c0 3.175-2.575 5.75-5.75 5.75h-8.5C4.575 22 2 19.425 2 16.25v-8.5C2 4.575 4.575 2 7.75 2z" fill="url(#paint0_radial_small)" />
                <path d="M12 6.8c-2.87 0-5.2 2.33-5.2 5.2s2.33 5.2 5.2 5.2 5.2-2.33 5.2-5.2-2.33-5.2-5.2-5.2zm0 8.5c-1.82 0-3.3-1.48-3.3-3.3s1.48-3.3 3.3-3.3 3.3 1.48 3.3 3.3-1.48 3.3-3.3 3.3zm5.3-7.55c-.52 0-.95-.43-.95-.95s.43-.95.95-.95.95.43.95.95-.43.95-.95.95z" fill="#fff" />
                <defs>
                  <radialGradient id="paint0_radial_small" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="matrix(0 24 -24 0 12 12)">
                    <stop stopColor="#F58529" />
                    <stop offset="0.25" stopColor="#FEDA77" />
                    <stop offset="0.5" stopColor="#DD2A7B" />
                    <stop offset="0.75" stopColor="#8134AF" />
                    <stop offset="1" stopColor="#515BD4" />
                  </radialGradient>
                </defs>
              </svg>
              <span className="text-[3.5px] font-bold uppercase whitespace-nowrap text-gray-800 tracking-tighter">Visite nossa página no Instagram</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-x-1 gap-y-0.5 text-[6.5px] font-mono leading-tight px-1 uppercase">
          <div className="truncate"><span className="font-bold">Fech:</span> {kit.fechaduraMarca}</div>
          <div className="truncate text-right"><span className="font-bold">Grid:</span> {kit.fechaduraGrid}</div>
          
          <div className="truncate"><span className="font-bold">Dob:</span> {kit.dobradicaMedida}</div>
          <div className="truncate text-right"><span className="font-bold">Ad Acab:</span> {kit.acabamentoAduela}</div>
          
          <div className="truncate"><span className="font-bold">Pta:</span> {getPortaDimensao(kit)} {kit.caracteristicaPorta}</div>
          <div className="truncate text-right"><span className="font-bold">Ad:</span> {kit.aduelaLargura}x{kit.aduelaAltura}</div>
        </div>
      </div>
    );
  }

  // Padrão Médio/Grande (6182, 6183)
  const INSTAGRAM_LOGO_DATA_URI = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' overflow='visible' fill='black'%3E%3Cpath d='M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z'/%3E%3C/svg%3E";

  return (
    <div className="w-full h-full p-2 pl-3 flex flex-col justify-start overflow-hidden font-sans tracking-tight pt-3">
      <div className="flex justify-between items-start border-b-[1.5px] border-black pb-1 mb-1 shrink-0">
        <div className="flex flex-col flex-1 pl-0.5 mt-0.5">
          <div className="font-extrabold text-[12px] uppercase leading-[0.9] mb-1 tracking-tight text-brand-green">
            Nacional Madeiras <span className="font-medium text-gray-600 tracking-normal">Kit Porta</span>
          </div>
          {(header?.cliente || header?.obra) && (
             <div className="font-bold text-[8px] uppercase mt-0.5 leading-tight text-gray-600">
               {header.cliente && `CLIENTE: ${header.cliente}`} {header.cliente && header.obra && <span className="mx-0.5">|</span>} {header.obra && `OBRA: ${header.obra}`}
             </div>
          )}
          <div className="font-bold text-[11px] uppercase mt-1 leading-none text-black flex items-center flex-wrap">
            BLOCO: {kit.bloco} <span className="mx-1 text-gray-400">|</span> APTO: {kit.apto}
          </div>
          <div className="font-bold text-[11px] uppercase mt-1 leading-none text-black">
            {kit.abertura} <span className="font-semibold text-[10px] text-gray-700 ml-1">({kit.comodo} - {kit.tipologia})</span>
          </div>
        </div>
        <div className="flex-shrink-0 pt-0 flex flex-col items-center">
          <QRCodeSVG 
            value="https://www.instagram.com/nacionalmadeirasltda/" 
            size={46} 
            level="M" 
            includeMargin={false}
          />
          <div className="flex items-center gap-1 mt-1">
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7.75 2h8.5c3.175 0 5.75 2.575 5.75 5.75v8.5c0 3.175-2.575 5.75-5.75 5.75h-8.5C4.575 22 2 19.425 2 16.25v-8.5C2 4.575 4.575 2 7.75 2z" fill="url(#paint0_radial)" />
              <path d="M12 6.8c-2.87 0-5.2 2.33-5.2 5.2s2.33 5.2 5.2 5.2 5.2-2.33 5.2-5.2-2.33-5.2-5.2-5.2zm0 8.5c-1.82 0-3.3-1.48-3.3-3.3s1.48-3.3 3.3-3.3 3.3 1.48 3.3 3.3-1.48 3.3-3.3 3.3zm5.3-7.55c-.52 0-.95-.43-.95-.95s.43-.95.95-.95.95.43.95.95-.43.95-.95.95z" fill="#fff" />
              <defs>
                <radialGradient id="paint0_radial" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="matrix(0 24 -24 0 12 12)">
                  <stop stopColor="#F58529" />
                  <stop offset="0.25" stopColor="#FEDA77" />
                  <stop offset="0.5" stopColor="#DD2A7B" />
                  <stop offset="0.75" stopColor="#8134AF" />
                  <stop offset="1" stopColor="#515BD4" />
                </radialGradient>
              </defs>
            </svg>
            <span className="text-[4.5px] font-bold uppercase whitespace-nowrap text-gray-800 tracking-tighter">Visite nossa página no Instagram</span>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col gap-y-1 text-[9px] font-mono leading-tight uppercase font-semibold pl-0.5 mt-0.5 shrink-0">
        <div className="grid grid-cols-5 gap-x-1">
          <div className="col-span-2">
            <span className="text-gray-500 font-bold block text-[7px] mb-[-1px]">Fech. Marca:</span>
            <span className="text-[10px] truncate block">{kit.fechaduraMarca} - {kit.fechaduraTipo}</span>
          </div>
          <div className="col-span-1 border-l border-gray-300 pl-1">
            <span className="text-gray-500 font-bold block text-[7px] mb-[-1px]">Fech. Grid:</span>
            <span className="text-[10px] truncate block">{kit.fechaduraGrid}</span>
          </div>
          <div className="col-span-2 border-l border-gray-300 pl-1">
            <span className="text-gray-500 font-bold block text-[7px] mb-[-1px]">Dobradiça Medida:</span>
            <span className="text-[10px] truncate block">{kit.dobradicaMedida}</span>
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-1 mt-0.5">
          <span className="text-gray-500 font-bold block text-[7px] mb-[-1px]">Acab. Aduela:</span>
          <span className="text-[9px] truncate block">{kit.acabamentoAduela}</span>
        </div>

        <div className="grid grid-cols-2 gap-x-1 border-t border-gray-200 pt-1 mt-0.5">
          <div>
            <span className="text-gray-500 font-bold block text-[7px] mb-[-1px]">Folha Porta:</span>
            <span className="text-[9px] leading-tight block">{getPortaDimensao(kit)} {kit.acabamentoPorta} {kit.caracteristicaPorta}</span>
          </div>
          <div className="border-l border-gray-300 pl-1">
            <span className="text-gray-500 font-bold block text-[7px] mb-[-1px]">Aduela:</span>
            <span className="text-[10px] truncate block">{kit.aduelaLargura}x{kit.aduelaAltura} ({kit.regulagem})</span>
          </div>
        </div>
      </div>
    </div>
  );
}
