import React, { useState, useMemo } from 'react';
import { useLocalStorage } from './EstoqueModule';
import { Printer, Search, Plus, Minus, X, Trash2, Settings, Instagram, Download, ChevronDown, ChevronUp } from 'lucide-react';
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
  const [showPreview, setShowPreview] = useState(true);
  
  const [selectedRelatorio, setSelectedRelatorio] = useState<string>('');

  const relatorios = useMemo(() => {
    const byTipologiaFech = new Map<string, any[]>();
    const safeKits = Array.isArray(kits) ? kits : [];
    safeKits.forEach(k => {
      const tipo = k.tipologia || 'SEM TIPOLOGIA';
      const fech = [k.fechaduraTipo, k.fechaduraMarca, k.fechaduraGrid && `GRID ${k.fechaduraGrid}`].filter(Boolean).join(' / ') || 'SEM FECHADURA';
      const key = `${tipo}|||${fech}`;
      if (!byTipologiaFech.has(key)) byTipologiaFech.set(key, []);
      byTipologiaFech.get(key).push(k);
    });
    return Array.from(byTipologiaFech.keys()).sort((a, b) => {
      const [tipoA] = a.split('|||');
      const [tipoB] = b.split('|||');
      return tipoA.localeCompare(tipoB);
    });
  }, [kits]);

  const filteredKits = useMemo(() => {
    const safeKits = Array.isArray(kits) ? kits : [];
    let result = safeKits;

    if (selectedRelatorio) {
      result = result.filter(k => {
        const tipo = k.tipologia || 'SEM TIPOLOGIA';
        const fech = [k.fechaduraTipo, k.fechaduraMarca, k.fechaduraGrid && `GRID ${k.fechaduraGrid}`].filter(Boolean).join(' / ') || 'SEM FECHADURA';
        const key = `${tipo}|||${fech}`;
        return key === selectedRelatorio;
      });
    }

    if (!globalSearch.trim()) return result;
    const lbd = globalSearch.toLowerCase();
    return result.filter((k: any) => 
      k.bloco?.toLowerCase().includes(lbd) ||
      k.apto?.toLowerCase().includes(lbd) ||
      k.comodo?.toLowerCase().includes(lbd) ||
      k.tipologia?.toLowerCase().includes(lbd) ||
      k.caracteristicaPorta?.toLowerCase().includes(lbd)
    );
  }, [kits, globalSearch, selectedRelatorio]);


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

  const exportarRelatorioEntrega = () => {
    const grouped = new Map<string, any>();
    
    fila.forEach(item => {
      const k = item.kit;
      const key = [
        k.apto, k.comodo, k.abertura,
        k.aduelaLargura, k.aduelaAltura, k.acabamentoAduela,
        k.tipologia
      ].join('||');
      
      let stringQtdStr = String((k as any).qtdeFolhasPorKit || '1');
      if ((k as any).quantidade) stringQtdStr = String((k as any).quantidade);
      if ((k as any).qtde) stringQtdStr = String((k as any).qtde);
      
      const qtyPerKit = parseInt(stringQtdStr, 10);
      const validQtyPerKit = isNaN(qtyPerKit) ? 1 : qtyPerKit;
      const totalQty = validQtyPerKit * item.qtd;

      if (grouped.has(key)) {
        grouped.get(key).qtd += totalQty;
      } else {
        grouped.set(key, {
          apto: k.apto || '-',
          comodo: k.comodo || '-',
          abertura: k.abertura || '-',
          aduela: `${k.aduelaLargura || '-'} x ${k.aduelaAltura || '-'}`,
          acabAduela: k.acabamentoAduela || '-',
          tipologia: k.tipologia || '-',
          qtd: totalQty
        });
      }
    });

    const rows = Array.from(grouped.values())
      .sort((a, b) => {
          const aptoA = String(a.apto);
          const aptoB = String(b.apto);
          if (aptoA !== aptoB) return aptoA.localeCompare(aptoB, undefined, {numeric: true});
          return String(a.comodo).localeCompare(String(b.comodo));
      });

    const cliente = fila[0]?.kit?.cliente || header?.cliente || 'CLIENTE NÃO INFORMADO';
    const obra = fila[0]?.kit?.obra || header?.obra || 'OBRA NÃO INFORMADA';

    const htmlContent = `
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
    <meta charset="utf-8">
    <title>Relatório de Entrega</title>
    <style>
        body { font-family: Arial, sans-serif; font-size: 11pt; color: #000; }
        .logo { font-size: 24pt; font-weight: bold; color: #166534; text-align: center; margin-bottom: 20px; }
        .title { text-align: center; font-size: 14pt; font-weight: bold; background-color: #1a202c; color: white; padding: 10px; margin-bottom: 10px; }
        .header-table { width: 100%; border: none; margin-bottom: 20px; }
        .header-table td { border: none; padding: 5px; font-size: 10pt; vertical-align: top; }
        .data-table { border-collapse: collapse; width: 100%; }
        .data-table th, .data-table td { border: 1px solid #000; padding: 6px; text-align: center; font-size: 10pt; }
        .data-table th { background-color: #f2f2f2; font-weight: bold; }
    </style>
</head>
<body>
    <div class="logo">NACIONAL MADEIRAS</div>
    <div class="title">RELATÓRIO DE ENTREGA</div>
    
    <table class="header-table">
        <tr>
            <td width="33%">
                <strong>Cliente:</strong><br>
                ${cliente}
            </td>
            <td width="33%" style="text-align: center;">
                <strong>Obra:</strong><br>
                ${obra}
            </td>
            <td width="33%" style="text-align: right;">
                <strong>Resp:</strong><br>
                __________________
            </td>
        </tr>
    </table>

    <table class="data-table">
        <thead>
            <tr>
                <th>APTO</th>
                <th>CÔMODO</th>
                <th>SENTIDO DE ABERTURA</th>
                <th>ADUELA</th>
                <th>ACABAMENTO ADUELA</th>
                <th>TIPOLOGIA</th>
                <th>QTD</th>
                <th>CONFERIDO</th>
            </tr>
        </thead>
        <tbody>
            ${rows.map(r => `
            <tr>
                <td>${r.apto}</td>
                <td>${r.comodo}</td>
                <td>${r.abertura}</td>
                <td>${r.aduela}</td>
                <td>${r.acabAduela}</td>
                <td>${r.tipologia}</td>
                <td>${r.qtd}</td>
                <td></td>
            </tr>
            `).join('')}
        </tbody>
    </table>
</body>
</html>
    `;

    const blob = new Blob([htmlContent], { type: 'application/msword;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Relatorio_Entregas_${new Date().toISOString().split('T')[0]}.doc`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
          <div className="px-4 py-3 bg-white border-b border-gray-200">
             <label className="text-[11px] font-bold text-gray-500 uppercase mb-1 block">Filtrar por Relatório (Tipologia + Fechadura)</label>
             <select 
               value={selectedRelatorio} 
               onChange={e => setSelectedRelatorio(e.target.value)}
               className="w-full border border-gray-300 rounded p-1.5 text-sm outline-none focus:border-brand-green bg-white text-gray-800"
             >
               <option value="">Todos os Kits</option>
               {relatorios.map(key => {
                 const [tipo, fech] = key.split('|||');
                 return (
                   <option key={key} value={key}>
                     {tipo} {fech && fech !== 'SEM FECHADURA' ? `(${fech})` : ''}
                   </option>
                 )
               })}
             </select>
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
        <div className="w-full md:w-96 lg:w-[420px] flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-0">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex-shrink-0 flex items-center justify-between">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <Printer className="w-4 h-4 text-brand-green" />
              <span>Fila de Impressão</span>
              <span className="bg-brand-green text-white px-2 py-0.5 rounded text-xs font-bold">{labelsToPrint.length} etq</span>
            </h2>
            {fila.length > 0 && (
              <button 
                onClick={clearFila} 
                className="text-xs text-red-600 hover:text-red-700 font-medium hover:underline flex items-center gap-1 transition-colors"
                title="Limpar Fila"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Limpar
              </button>
            )}
          </div>
          
          {/* Painel rolável único e contínuo para evitar sobreposição */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
            
            {/* Seção 1: Itens da Fila com rolagem própria */}
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex justify-between items-center">
                <span>Itens na Fila ({fila.length})</span>
                {fila.length > 2 && <span className="text-[10px] text-gray-400 font-normal">Role para conferir</span>}
              </div>
              
              {fila.length === 0 ? (
                <div className="py-7 flex flex-col items-center justify-center text-gray-400 space-y-2 border border-dashed border-gray-200 rounded-lg bg-gray-50/50">
                  <Printer className="w-8 h-8 opacity-25" />
                  <p className="text-xs text-center leading-relaxed">Fila vazia.<br/>Clique nos kits à esquerda para adicionar.</p>
                </div>
              ) : (
                <div className="max-h-48 overflow-y-auto space-y-2 pr-1 border border-gray-200/70 rounded-lg p-1.5 bg-gray-50/40 divide-y divide-gray-100">
                  {fila.map((item) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg flex items-center justify-between p-2 bg-white shadow-xs pt-2">
                      <div className="flex-1 truncate pr-2">
                        <div className="text-sm font-bold text-gray-800 truncate">{item.kit.bloco} - {item.kit.apto}</div>
                        <div className="text-xs text-gray-500 truncate">{item.kit.comodo} | {getPortaDimensao(item.kit)}</div>
                      </div>
                      <div className="flex items-center space-x-1 border border-gray-200 rounded-md p-0.5 bg-gray-50 flex-shrink-0">
                        <button onClick={() => updateQtd(item.id, -1)} className="p-1 hover:bg-gray-200 rounded text-gray-600 transition-colors"><Minus className="w-3 h-3" /></button>
                        <span className="w-6 text-center font-bold text-xs text-gray-800">{item.qtd}</span>
                        <button onClick={() => updateQtd(item.id, 1)} className="p-1 hover:bg-gray-200 rounded text-gray-600 transition-colors"><Plus className="w-3 h-3" /></button>
                      </div>
                      <button onClick={() => removeFila(item.id)} className="ml-1.5 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors flex-shrink-0" title="Remover item">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Seção 2: Pré-visualização com rolagem (scroll) dedicada para nunca sobrepor */}
            {fila.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="w-full px-3 py-2 bg-gray-50 hover:bg-gray-100 flex items-center justify-between border-b border-gray-200 text-left transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-gray-700 uppercase">Pré-visualização da Etiqueta</span>
                    <span className="text-[9.5px] text-green-700 font-bold bg-green-50 px-1.5 py-0.5 rounded border border-green-200">Cabeçalho -5%</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500 text-xs font-medium">
                    <span>{showPreview ? 'Recolher' : 'Expandir'}</span>
                    {showPreview ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </div>
                </button>
                
                {showPreview && (
                  <div className="p-2.5 bg-gray-50/50">
                    <div className="text-[10px] text-gray-500 mb-1.5 flex justify-between items-center">
                      <span className="font-semibold truncate">Item 1: {fila[0].kit.bloco} - {fila[0].kit.apto}</span>
                      <span className="text-gray-400 flex-shrink-0 ml-1">{formato.name.split('(')[0]}</span>
                    </div>
                    {/* Janela de preview com rolagem scroll dedicada */}
                    <div className="max-h-[195px] overflow-auto border border-dashed border-gray-300 rounded-md bg-white p-1.5 shadow-inner flex justify-center items-center">
                      <div 
                        style={{
                          width: '100%',
                          maxWidth: '340px',
                          minWidth: '240px',
                          aspectRatio: formato.id === '6180' ? '66.7/25.4' : '101.6/50.8'
                        }}
                      >
                        <LabelInnerContent kit={fila[0].kit} formato={formato} header={header} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Seção 3: Configuração do Formato */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600 flex items-center gap-1">
                <Settings className="w-3.5 h-3.5" /> Formato Pimaco
              </label>
              <select 
                className="w-full text-sm border-gray-300 rounded-md focus:ring-brand-green focus:border-brand-green bg-white p-2 border outline-none"
                value={formato.id}
                onChange={e => setFormato(FORMATOS_PIMACO.find(f => f.id === e.target.value) || FORMATOS_PIMACO[0])}
              >
                {FORMATOS_PIMACO.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>
            
            {/* Seção 4: Ações e Botões */}
            <div className="flex flex-col space-y-2 pt-1">
              <button 
                onClick={exportarRelatorioEntrega}
                disabled={fila.length === 0}
                className="w-full px-4 py-2 bg-indigo-600 text-white font-bold rounded shadow-sm hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center justify-center space-x-2 text-sm"
              >
                <Download className="w-4 h-4" /> <span>Exportar Relatório Entregas (.doc)</span>
              </button>
              
              <div className="flex space-x-2">
                <button 
                  onClick={clearFila}
                  disabled={fila.length === 0}
                  className="px-3 py-2 border border-gray-300 rounded text-gray-600 font-medium text-sm hover:bg-gray-100 disabled:opacity-50 transition-colors flex items-center justify-center" 
                  title="Limpar Fila"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={handlePrint}
                  disabled={labelsToPrint.length === 0}
                  className="flex-1 px-4 py-2.5 bg-brand-green text-white font-bold rounded shadow-sm hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center space-x-2 text-sm"
                >
                  <Printer className="w-4 h-4" /> <span>Imprimir Etiquetas</span>
                </button>
              </div>
            </div>
            
            {/* Aviso de Impressão */}
            <div className="bg-yellow-50 text-yellow-800 text-[11px] leading-tight p-2.5 rounded-md border border-yellow-200">
              <strong>Dica de impressão:</strong> Na tela do navegador, defina <strong>Margens: Nenhuma</strong> (ou 0), <strong>Escala: 100%</strong> e desmarque Cabeçalhos e Rodapés.
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
            color-adjust: exact !important;
            background: white !important;
            color: #000000 !important;
            -webkit-font-smoothing: antialiased !important;
            text-rendering: geometricPrecision !important;
          }
          @media print {
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .text-black {
              color: #000000 !important;
            }
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
      <div className="w-full h-full p-1.5 flex flex-col justify-center text-black" style={{ color: '#000000' }}>
        <div className="flex justify-between items-start border-b-[1.5px] border-black pb-0.5 mb-0.5">
          <div className="flex flex-col flex-1 truncate pr-1">
            <div className="uppercase leading-tight tracking-tight" style={{ fontSize: '10.45px', fontWeight: 900, color: '#15803d' }}>
              Nacional Madeiras
            </div>
            <div className="uppercase leading-tight mb-0.5 tracking-tight" style={{ fontSize: '8.55px', fontWeight: 900, color: '#000000' }}>
              Kit Porta
            </div>
            {(header?.cliente || header?.obra) && (
              <div className="uppercase leading-tight mb-0.5" style={{ fontSize: '8.05px', fontWeight: 800, color: '#000000' }}>
                {header.cliente && `CLIENTE: ${header.cliente}`} {header.cliente && header.obra && '| '} {header.obra && `OBRA: ${header.obra}`}
              </div>
            )}
            <div className="uppercase leading-none truncate" style={{ fontSize: '10.45px', fontWeight: 900, color: '#000000' }}>
              {kit.bloco}-{kit.apto} <span style={{ fontSize: '9.0px', fontWeight: 700, color: '#000000' }}>({kit.comodo} - {kit.tipologia})</span>
            </div>
            <div className="mt-0.5 truncate uppercase" style={{ fontSize: '9.0px', fontWeight: 900, color: '#000000' }}>{kit.abertura}</div>
          </div>
          <div className="flex-shrink-0 pt-0.5 flex flex-col items-center">
            <QRCodeSVG value="https://www.instagram.com/nacionalmadeirasltda/" size={24} level="M" includeMargin={false} />
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
              <span className="uppercase whitespace-nowrap tracking-tighter" style={{ fontSize: '4.25px', fontWeight: 900, color: '#000000' }}>Visite nossa página no Instagram</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-x-1 gap-y-0.5 font-mono leading-tight px-1 uppercase" style={{ fontSize: '8.5px', color: '#000000' }}>
          <div className="truncate"><span style={{ fontWeight: 900, color: '#000000' }}>Fech:</span> <span style={{ fontWeight: 700, color: '#000000' }}>{kit.fechaduraMarca}</span></div>
          <div className="truncate text-right"><span style={{ fontWeight: 900, color: '#000000' }}>Grid:</span> <span style={{ fontWeight: 700, color: '#000000' }}>{kit.fechaduraGrid}</span></div>
          
          <div className="truncate"><span style={{ fontWeight: 900, color: '#000000' }}>Dob:</span> <span style={{ fontWeight: 700, color: '#000000' }}>{kit.dobradicaMedida}</span></div>
          <div className="truncate text-right"><span style={{ fontWeight: 900, color: '#000000' }}>Ad Acab:</span> <span style={{ fontWeight: 700, color: '#000000' }}>{kit.acabamentoAduela}</span></div>
          
          <div className="truncate"><span style={{ fontWeight: 900, color: '#000000' }}>Pta:</span> <span style={{ fontWeight: 700, color: '#000000' }}>{getPortaDimensao(kit)} {kit.caracteristicaPorta}</span></div>
          <div className="truncate text-right"><span style={{ fontWeight: 900, color: '#000000' }}>Ad:</span> <span style={{ fontWeight: 700, color: '#000000' }}>{kit.aduelaLargura}x{kit.aduelaAltura}</span></div>
        </div>
      </div>
    );
  }

  // Padrão Médio/Grande (6182, 6183, 6187)
  return (
    <div className="w-full h-full p-1.5 pl-2.5 flex flex-col justify-start overflow-hidden font-sans tracking-tight pt-1" style={{ color: '#000000' }}>
      <div className="flex justify-between items-start border-b-[1.5px] border-black pb-0.5 mb-0.5 shrink-0">
        <div className="flex flex-col flex-1 pl-0.5 mt-0.5">
          <div className="uppercase leading-tight tracking-tight" style={{ fontSize: '15.2px', fontWeight: 900, color: '#15803d' }}>
            Nacional Madeiras
          </div>
          <div className="uppercase leading-tight mb-0.5 tracking-tight" style={{ fontSize: '12.35px', fontWeight: 900, color: '#000000' }}>
            Kit Porta
          </div>
          {(header?.cliente || header?.obra) && (
             <div className="uppercase mt-0.5 leading-tight" style={{ fontSize: '10.45px', fontWeight: 800, color: '#000000' }}>
               {header.cliente && `CLIENTE: ${header.cliente}`} {header.cliente && header.obra && <span style={{ margin: '0 3px', fontWeight: 900 }}>|</span>} {header.obra && `OBRA: ${header.obra}`}
             </div>
          )}
          <div className="uppercase mt-0.5 leading-none flex items-center flex-wrap" style={{ fontSize: '14.25px', fontWeight: 900, color: '#000000' }}>
            BLOCO: {kit.bloco} <span style={{ margin: '0 4px', fontWeight: 900, color: '#000000' }}>|</span> APTO: {kit.apto}
          </div>
          <div className="uppercase mt-0.5 leading-none" style={{ fontSize: '13.3px', fontWeight: 900, color: '#000000' }}>
            {kit.abertura} <span style={{ fontSize: '11.4px', fontWeight: 700, color: '#000000', marginLeft: '4px' }}>({kit.comodo} - {kit.tipologia})</span>
          </div>
        </div>
        <div className="flex-shrink-0 pt-0 flex flex-col items-center">
          <QRCodeSVG 
            value="https://www.instagram.com/nacionalmadeirasltda/" 
            size={42} 
            level="M" 
            includeMargin={false}
          />
          <div className="flex items-center gap-1 mt-0.5">
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
            <span className="uppercase whitespace-nowrap tracking-tighter" style={{ fontSize: '5.7px', fontWeight: 900, color: '#000000' }}>Visite nossa página no Instagram</span>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col gap-y-1 font-mono leading-tight uppercase pl-0.5 mt-0.5 shrink-0" style={{ color: '#000000' }}>
        <div className="grid grid-cols-5 gap-x-1">
          <div className="col-span-2">
            <span className="block mb-[-1px]" style={{ fontSize: '9.5px', fontWeight: 900, color: '#000000' }}>Fech. Marca:</span>
            <span className="truncate block" style={{ fontSize: '12.5px', fontWeight: 700, color: '#000000' }}>{kit.fechaduraMarca} - {kit.fechaduraTipo === 'WC' ? 'BANHEIRO' : kit.fechaduraTipo === 'INT' ? 'INTERNA' : kit.fechaduraTipo === 'EXT' ? 'EXTERNA' : kit.fechaduraTipo}</span>
          </div>
          <div className="col-span-1 border-l-[1.5px] border-black pl-1">
            <span className="block mb-[-1px]" style={{ fontSize: '9.5px', fontWeight: 900, color: '#000000' }}>Fech. Grid:</span>
            <span className="truncate block" style={{ fontSize: '12.5px', fontWeight: 700, color: '#000000' }}>{kit.fechaduraGrid}</span>
          </div>
          <div className="col-span-2 border-l-[1.5px] border-black pl-1">
            <span className="block mb-[-1px]" style={{ fontSize: '9.5px', fontWeight: 900, color: '#000000' }}>Dobradiça Medida:</span>
            <span className="truncate block" style={{ fontSize: '12.5px', fontWeight: 700, color: '#000000' }}>{kit.dobradicaMedida}</span>
          </div>
        </div>
        
        <div className="border-t-[1.5px] border-black pt-1 mt-0.5">
          <span className="block mb-[-1px]" style={{ fontSize: '9.5px', fontWeight: 900, color: '#000000' }}>Folha Porta:</span>
          <span className="leading-tight block" style={{ fontSize: '12px', fontWeight: 700, color: '#000000' }}>{getPortaDimensao(kit)} {kit.acabamentoPorta} {kit.caracteristicaPorta}</span>
        </div>

        <div className="grid grid-cols-2 gap-x-1 border-t-[1.5px] border-black pt-1 mt-0.5">
          <div>
            <span className="block mb-[-1px]" style={{ fontSize: '9.5px', fontWeight: 900, color: '#000000' }}>Aduela:</span>
            <span className="truncate block" style={{ fontSize: '12.5px', fontWeight: 700, color: '#000000' }}>{kit.aduelaLargura}x{kit.aduelaAltura} ({kit.regulagem})</span>
          </div>
          <div className="border-l-[1.5px] border-black pl-1">
            <span className="block mb-[-1px]" style={{ fontSize: '9.5px', fontWeight: 900, color: '#000000' }}>Acab. Aduela:</span>
            <span className="truncate block" style={{ fontSize: '12px', fontWeight: 700, color: '#000000' }}>{kit.acabamentoAduela}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
