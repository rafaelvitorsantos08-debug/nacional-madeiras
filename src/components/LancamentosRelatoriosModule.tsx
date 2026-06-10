import React, { useState } from 'react';
import { useLocalStorage } from './EstoqueModule';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Plus, Trash2, Copy, Save, FileSpreadsheet, Download, FileText, MessageSquareQuote } from 'lucide-react';

import { cn } from '../lib/utils';

interface KitLancamento {
  id: string;
  // Localização
  apto: string;
  pavimento: string;
  coluna: string;
  comodo: string;
  // Folha de Porta
  folhaLargura: string;
  folhaAltura: string;
  // Especificações
  tipologia: string;
  abertura: string;
  // Aduela
  aduelaLargura: string;
  aduelaAltura: string;
  regulagem: string;
  // Detalhes Kits
  qtdeFolhasPorKit: string;
  acabamento: string;
  caracteristica: string;
  // Complementos
  qtdeLadosAduela: string;
  qtdeMontantes: string;
  bitsQtde: string;
  bitsFaces: string;
  // Características
  camarao: boolean;
  correr: boolean;
  pivotante: boolean;
  veneziana: boolean;
  grelha: boolean;
  bandeira: boolean;
  chapa: boolean;
  vidro: boolean;
  fechaFresta: boolean;
  kitDuplo: boolean;
  observacao?: string;
}

const INITIAL_FORM: Omit<KitLancamento, 'id'> = {
  apto: '',
  pavimento: '',
  coluna: '',
  comodo: 'BANHEIRO',
  folhaLargura: '',
  folhaAltura: '2100',
  tipologia: '',
  abertura: 'ESQUERDA',
  aduelaLargura: '',
  aduelaAltura: '2110',
  regulagem: 'REG 50',
  qtdeFolhasPorKit: '1',
  acabamento: 'BRANCO',
  caracteristica: 'HONEY',
  qtdeLadosAduela: '3',
  qtdeMontantes: '',
  bitsQtde: '',
  bitsFaces: '',
  camarao: false,
  correr: false,
  pivotante: false,
  veneziana: false,
  grelha: false,
  bandeira: false,
  chapa: false,
  vidro: false,
  fechaFresta: false,
  kitDuplo: false,
  observacao: '',
};

const INITIAL_KITS: KitLancamento[] = [
  {
    id: "mock1", apto: "102", pavimento: "1", coluna: "2", comodo: "BANHEIRO", 
    folhaLargura: "620", folhaAltura: "2070", tipologia: "PM1F", abertura: "ESQUERDA",
    aduelaLargura: "90", aduelaAltura: "2120", regulagem: "REG 50", qtdeFolhasPorKit: "1",
    acabamento: "BRANCO", caracteristica: "HONEY", qtdeLadosAduela: "", qtdeMontantes: "",
    bitsQtde: "", bitsFaces: "", camarao: false, correr: false, pivotante: false,
    veneziana: false, grelha: false, bandeira: false, chapa: false, vidro: false, fechaFresta: false, kitDuplo: false, observacao: ''
  },
  {
    id: "mock2", apto: "104", pavimento: "1", coluna: "4", comodo: "ENTRADA", 
    folhaLargura: "820", folhaAltura: "2100", tipologia: "PM3", abertura: "ESQUERDA P/FORA",
    aduelaLargura: "170", aduelaAltura: "2110", regulagem: "REG 50", qtdeFolhasPorKit: "1",
    acabamento: "BRANCO", caracteristica: "SOLIDA", qtdeLadosAduela: "", qtdeMontantes: "",
    bitsQtde: "", bitsFaces: "", camarao: false, correr: false, pivotante: false,
    veneziana: false, grelha: false, bandeira: false, chapa: false, vidro: false, fechaFresta: false, kitDuplo: false, observacao: ''
  },
  {
    id: "mock3", apto: "106", pavimento: "1", coluna: "6", comodo: "QUARTO", 
    folhaLargura: "720", folhaAltura: "2100", tipologia: "PM2", abertura: "DIREITA",
    aduelaLargura: "90", aduelaAltura: "2110", regulagem: "REG 70", qtdeFolhasPorKit: "1",
    acabamento: "BRANCO", caracteristica: "HONEY", qtdeLadosAduela: "", qtdeMontantes: "",
    bitsQtde: "", bitsFaces: "", camarao: false, correr: false, pivotante: false,
    veneziana: false, grelha: false, bandeira: false, chapa: false, vidro: false, fechaFresta: false, kitDuplo: false, observacao: ''
  },
  {
    id: "mock4", apto: "202", pavimento: "2", coluna: "2", comodo: "ENTRADA", 
    folhaLargura: "820", folhaAltura: "2100", tipologia: "PM3", abertura: "DIREITA",
    aduelaLargura: "170", aduelaAltura: "2110", regulagem: "REG 70", qtdeFolhasPorKit: "1",
    acabamento: "BRANCO", caracteristica: "SOLIDA", qtdeLadosAduela: "", qtdeMontantes: "",
    bitsQtde: "", bitsFaces: "", camarao: false, correr: false, pivotante: false,
    veneziana: false, grelha: false, bandeira: false, chapa: false, vidro: false, fechaFresta: false, kitDuplo: false, observacao: ''
  },
  {
    id: "mock5", apto: "206", pavimento: "2", coluna: "6", comodo: "COZINHA", 
    folhaLargura: "820", folhaAltura: "2070", tipologia: "PM3F", abertura: "DIREITA P/FORA",
    aduelaLargura: "150", aduelaAltura: "2120", regulagem: "REG 50", qtdeFolhasPorKit: "1",
    acabamento: "BRANCO", caracteristica: "SARRAFEADA", qtdeLadosAduela: "", qtdeMontantes: "",
    bitsQtde: "", bitsFaces: "", camarao: false, correr: false, pivotante: false,
    veneziana: false, grelha: false, bandeira: false, chapa: false, vidro: false, fechaFresta: false, kitDuplo: false, observacao: ''
  },
  {
    id: "mock6", apto: "302", pavimento: "3", coluna: "2", comodo: "LIXEIRA", 
    folhaLargura: "1440", folhaAltura: "2100", tipologia: "PM7", abertura: "ESQUERDA P/FORA",
    aduelaLargura: "130", aduelaAltura: "2110", regulagem: "REG 50", qtdeFolhasPorKit: "2",
    acabamento: "BRANCO", caracteristica: "SARRAFEADA", qtdeLadosAduela: "", qtdeMontantes: "",
    bitsQtde: "", bitsFaces: "", camarao: false, correr: false, pivotante: false,
    veneziana: false, grelha: false, bandeira: false, chapa: false, vidro: false, fechaFresta: false, kitDuplo: false, observacao: ''
  },
  {
    id: "mock7", apto: "306", pavimento: "3", coluna: "6", comodo: "ELETRICA", 
    folhaLargura: "1020", folhaAltura: "2100", tipologia: "PM12", abertura: "ESQUERDA P/FORA",
    aduelaLargura: "70", aduelaAltura: "2110", regulagem: "FIXO", qtdeFolhasPorKit: "2",
    acabamento: "BRANCO", caracteristica: "HONEY", qtdeLadosAduela: "", qtdeMontantes: "",
    bitsQtde: "", bitsFaces: "", camarao: false, correr: false, pivotante: false,
    veneziana: false, grelha: false, bandeira: false, chapa: false, vidro: false, fechaFresta: false, kitDuplo: false, observacao: ''
  },
  {
    id: "mock8", apto: "308", pavimento: "3", coluna: "8", comodo: "SUITE 2", 
    folhaLargura: "720", folhaAltura: "2100", tipologia: "PM2", abertura: "DIREITA",
    aduelaLargura: "150", aduelaAltura: "2110", regulagem: "REG 70", qtdeFolhasPorKit: "1",
    acabamento: "BRANCO", caracteristica: "SARRAFEADA", qtdeLadosAduela: "", qtdeMontantes: "",
    bitsQtde: "", bitsFaces: "", camarao: false, correr: false, pivotante: false,
    veneziana: false, grelha: false, bandeira: false, chapa: false, vidro: false, fechaFresta: false, kitDuplo: false, observacao: ''
  },
  {
    id: "mock9", apto: "309", pavimento: "3", coluna: "9", comodo: "COZINHA", 
    folhaLargura: "820", folhaAltura: "2070", tipologia: "PM3F", abertura: "ESQUERDA",
    aduelaLargura: "150", aduelaAltura: "2120", regulagem: "REG 50", qtdeFolhasPorKit: "1",
    acabamento: "BRANCO", caracteristica: "SARRAFEADA", qtdeLadosAduela: "", qtdeMontantes: "",
    bitsQtde: "", bitsFaces: "", camarao: false, correr: false, pivotante: false,
    veneziana: false, grelha: false, bandeira: false, chapa: false, vidro: false, fechaFresta: false, kitDuplo: false, observacao: ''
  },
  {
    id: "mock10", apto: "405", pavimento: "4", coluna: "5", comodo: "BANH. SOCIAL", 
    folhaLargura: "620", folhaAltura: "2100", tipologia: "PM1", abertura: "DIREITA",
    aduelaLargura: "110", aduelaAltura: "2120", regulagem: "REG 50", qtdeFolhasPorKit: "1",
    acabamento: "BRANCO", caracteristica: "HONEY", qtdeLadosAduela: "", qtdeMontantes: "",
    bitsQtde: "", bitsFaces: "", camarao: false, correr: false, pivotante: false,
    veneziana: false, grelha: false, bandeira: false, chapa: false, vidro: false, fechaFresta: false, kitDuplo: false, observacao: ''
  },
  {
    id: "mock11", apto: "501", pavimento: "5", coluna: "1", comodo: "SUITE", 
    folhaLargura: "720", folhaAltura: "2100", tipologia: "PM2", abertura: "DIREITA",
    aduelaLargura: "110", aduelaAltura: "2110", regulagem: "REG 50", qtdeFolhasPorKit: "1",
    acabamento: "BRANCO", caracteristica: "SARRAFEADA", qtdeLadosAduela: "", qtdeMontantes: "",
    bitsQtde: "", bitsFaces: "", camarao: false, correr: false, pivotante: false,
    veneziana: false, grelha: false, bandeira: false, chapa: false, vidro: false, fechaFresta: false, kitDuplo: false, observacao: ''
  },
  {
    id: "mock12", apto: "503", pavimento: "5", coluna: "3", comodo: "BANH. SUITE", 
    folhaLargura: "620", folhaAltura: "2070", tipologia: "PM1F", abertura: "ESQUERDA",
    aduelaLargura: "90", aduelaAltura: "2120", regulagem: "REG 70", qtdeFolhasPorKit: "1",
    acabamento: "BRANCO", caracteristica: "HONEY", qtdeLadosAduela: "", qtdeMontantes: "",
    bitsQtde: "", bitsFaces: "", camarao: false, correr: false, pivotante: false,
    veneziana: false, grelha: false, bandeira: false, chapa: false, vidro: false, fechaFresta: false, kitDuplo: false, observacao: ''
  },
  {
    id: "mock13", apto: "604", pavimento: "6", coluna: "4", comodo: "QUARTO", 
    folhaLargura: "720", folhaAltura: "2100", tipologia: "PM2", abertura: "ESQUERDA",
    aduelaLargura: "130", aduelaAltura: "2110", regulagem: "REG 50", qtdeFolhasPorKit: "2",
    acabamento: "BRANCO", caracteristica: "SARRAFEADA", qtdeLadosAduela: "", qtdeMontantes: "",
    bitsQtde: "", bitsFaces: "", camarao: false, correr: false, pivotante: false,
    veneziana: false, grelha: false, bandeira: false, chapa: false, vidro: false, fechaFresta: false, kitDuplo: false, observacao: ''
  },
  {
    id: "mock14", apto: "601", pavimento: "6", coluna: "1", comodo: "ESPECIAIS", 
    folhaLargura: "2000", folhaAltura: "2100", tipologia: "PM18", abertura: "ESQUERDA P/FORA",
    aduelaLargura: "70", aduelaAltura: "2110", regulagem: "FIXO", qtdeFolhasPorKit: "4",
    acabamento: "BRANCO", caracteristica: "HONEY", qtdeLadosAduela: "", qtdeMontantes: "",
    bitsQtde: "", bitsFaces: "", camarao: false, correr: false, pivotante: false,
    veneziana: false, grelha: false, bandeira: false, chapa: false, vidro: false, fechaFresta: false, kitDuplo: false, observacao: ''
  }
];


function EditableCell({ value, onChange, type = "text", className = "", options = [] }: { value: any, onChange: (val: any) => void, type?: string, className?: string, options?: {label: string, value: string}[] | string[] }) {
  if (type === "boolean") {
    return (
      <div className="flex justify-center">
        <input type="checkbox" checked={!!value} onChange={e => onChange(e.target.checked)} className="cursor-pointer" />
      </div>
    );
  }
  if (type === "select") {
    return (
      <select value={value} onChange={e => onChange(e.target.value)} className={"bg-transparent text-center outline-none focus:ring-1 focus:ring-emerald-500 rounded px-1 " + className.replace(/\bw-\S+/g, '')}>
        {options.map(opt => {
          if (typeof opt === 'string') return <option key={opt} value={opt} className="bg-white dark:bg-gray-800 text-black dark:text-white">{opt}</option>;
          return <option key={opt.value} value={opt.value} className="bg-white dark:bg-gray-800 text-black dark:text-white">{opt.label}</option>;
        })}
      </select>
    );
  }
  return (
    <input
      type={type}
      value={value}
      size={Math.max(String(value || '').length, 3)}
      onChange={e => onChange(e.target.value)}
      className={"bg-transparent text-center outline-none focus:ring-1 focus:ring-emerald-500 rounded px-1 " + className.replace(/\bw-\S+/g, '')}
      style={{ minWidth: `${Math.max(String(value || '').length + 2, 5)}ch` }}
    />
  );
}


function EditableObsCell({ value, onChange }: { value: string, onChange: (val: string) => void }) {
  const handleEdit = () => {
    const newValue = window.prompt("Comentário / Observação:", value || "");
    if (newValue !== null) {
      onChange(newValue);
    }
  };
  
  return (
    <div 
      onClick={handleEdit}
      className={"cursor-pointer p-1 rounded transition-colors flex justify-center items-center " + (value ? "bg-amber-100 text-amber-700 hover:bg-amber-200" : "text-gray-300 hover:text-gray-500 hover:bg-gray-100")}
      title={value || "Adicionar comentário"}
    >
      <MessageSquareQuote className="w-5 h-5" />
    </div>
  );
}

export function LancamentosRelatoriosModule() {
  const [kits, setKits] = useLocalStorage<KitLancamento[]>('nacional_madeiras_kits_v2', INITIAL_KITS);
  const [form, setForm] = useState<Omit<KitLancamento, 'id'>>(INITIAL_FORM);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkText, setBulkText] = useState('');

  
  
  const exportToExcel = () => {
    if (kits.length === 0) return;
    const worksheet = XLSX.utils.json_to_sheet(kits.map(({ id, ...kit }) => kit));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Kits');
    XLSX.writeFile(workbook, 'kits_lancados.xlsx');
  };

  const exportToPDF = () => {
    if (kits.length === 0) return;
    const doc = new jsPDF('landscape');
    
    // Add title
    doc.setFontSize(16);
    doc.text('Relatorio de Kits Lancados', 14, 15);
    doc.setFontSize(10);
    doc.text('Gerado em: ' + new Date().toLocaleString(), 14, 22);

    const headers = [['Apto', 'Pav.', 'Col', 'Comodo', 'Folha L', 'Folha A', 'Tipo', 'Abertura', 'Aduela L', 'Aduela A', 'Acabamento', 'Qtd']];
    const data = kits.map(k => [
      k.apto, k.pavimento, k.coluna, k.comodo, 
      k.folhaLargura, k.folhaAltura, k.tipologia, k.abertura,
      k.aduelaLargura, k.aduelaAltura, k.acabamento, k.qtdeFolhasPorKit
    ]);

    autoTable(doc, {
      head: headers,
      body: data,
      startY: 28,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [16, 185, 129] } // emerald-500
    });

    doc.save('kits_lancados.pdf');
  };

  const handleMassImport = () => {
    if (!bulkText.trim()) return;
    
    // Parse TSV
    const lines = bulkText.split('\n');
    const newKits: KitLancamento[] = [];
    
    for (const line of lines) {
      const parts = line.split('\t');
      if (parts.length < 4) continue; // Skip empty or invalid lines
      
      const [apto, pav, col, comodo, fLarg, fAlt, tipo, aberto, aLarg, aAlt, reg, qtde] = parts.map(p => p?.trim() || '');
      
      newKits.push({
        ...INITIAL_FORM,
        id: Math.random().toString(36).substr(2, 9),
        apto: apto || '',
        pavimento: pav || '',
        coluna: col || '',
        comodo: comodo || '',
        folhaLargura: fLarg || '',
        folhaAltura: fAlt || INITIAL_FORM.folhaAltura,
        tipologia: tipo || '',
        abertura: aberto || INITIAL_FORM.abertura,
        aduelaLargura: aLarg || '',
        aduelaAltura: aAlt || INITIAL_FORM.aduelaAltura,
        regulagem: reg || INITIAL_FORM.regulagem,
        qtdeFolhasPorKit: qtde || INITIAL_FORM.qtdeFolhasPorKit,
      });
    }
    
    if (newKits.length > 0) {
      setKits(prev => [...newKits, ...prev]);
      setShowBulkModal(false);
      setBulkText('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Type narrow safely
    if (type === 'checkbox') {
        const checked = (e.target as HTMLInputElement).checked;
        setForm(prev => ({ ...prev, [name]: checked }));
    } else {
        setForm(prev => ({ ...prev, [name]: value as string }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newKit: KitLancamento = {
      id: Math.random().toString(36).substr(2, 9),
      ...form,
    };
    setKits(prev => [newKit, ...prev]);
    // Reset but keep some defaults
    setForm(INITIAL_FORM);
  };

  const handleDuplicate = (kit: KitLancamento) => {
    // Carregar para o formulário
    const { id, ...rest } = kit;
    setForm(rest);
    // Rolagem suave para o topo se necessário
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este kit?')) {
      setKits(prev => prev.filter(k => k.id !== id));
    }
  };

  const updateKit = (id: string, field: keyof KitLancamento, value: string | number | boolean) => {
    setKits(prev => prev.map(kit => kit.id === id ? { ...kit, [field]: value } : kit));
  };

  return (
    <div className="animate-in fade-in duration-300 pb-20">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Lançamentos de Relatórios</h1>
        <p className="text-sm text-gray-500 mt-1">Cadastro técnico de kits de portas e detalhamento para produção.</p>
      </div>

      {/* FORMULÁRIO */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
        <div className="border-b border-gray-100 bg-gray-50 dark:bg-gray-900/80 p-4">
    <div className="flex justify-between items-center w-full">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center">
              <Plus className="w-5 h-5 mr-2 text-brand-green" />
              Novo Cadastro de Kit
            </h2>
            <button 
              type="button" 
              onClick={() => setShowBulkModal(true)} 
              className="flex items-center text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-800/50 px-3 py-1.5 rounded-lg transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Lançamento em Massa
            </button>
          </div>
  </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* LOCALIZAÇÃO */}
            <div className="md:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-blue-50/30 rounded-lg border border-blue-100">
              <h3 className="col-span-full text-xs font-bold text-blue-800 uppercase tracking-wider mb-2">Localização</h3>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Apto</label>
                <input type="text" name="apto" value={form.apto} onChange={handleInputChange} className="w-full p-2 border border-blue-200 rounded text-sm focus:ring-1 focus:ring-blue-500 outline-none" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Pavimento</label>
                <input type="text" name="pavimento" value={form.pavimento} onChange={handleInputChange} className="w-full p-2 border border-blue-200 rounded text-sm focus:ring-1 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Coluna</label>
                <input type="text" name="coluna" value={form.coluna} onChange={handleInputChange} className="w-full p-2 border border-blue-200 rounded text-sm focus:ring-1 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Cômodo</label>
                <select name="comodo" value={form.comodo} onChange={handleInputChange} className="w-full p-2 border border-blue-200 rounded text-sm focus:ring-1 focus:ring-blue-500 outline-none bg-white dark:bg-gray-800">
                  <option value="BANHEIRO">Banheiro</option>
                  <option value="BANH. SOCIAL">Banh. Social</option>
                  <option value="BANH. SUITE">Banh. Suíte</option>
                  <option value="ENTRADA">Entrada</option>
                  <option value="QUARTO">Quarto</option>
                  <option value="COZINHA">Cozinha</option>
                  <option value="ELETRICA">Elétrica</option>
                  <option value="LIXEIRA">Lixeira</option>
                  <option value="SALA">Sala</option>
                  <option value="SUITE">Suíte</option>
                  <option value="SUITE 2">Suíte 2</option>
                  <option value="ESPECIAIS">Especiais</option>
                </select>
              </div>
            </div>

            {/* ESPECIFICAÇÕES & FOLHA DE PORTA */}
            <div className="md:col-span-2 grid grid-cols-2 gap-4 p-4 bg-emerald-50/30 dark:bg-emerald-900/10 rounded-lg border border-emerald-100 dark:border-emerald-800/30">
              <h3 className="col-span-full text-xs font-bold text-emerald-800 dark:text-emerald-500 uppercase tracking-wider mb-2">Especificações & Folha</h3>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Tipologia</label>
                <input type="text" name="tipologia" value={form.tipologia} onChange={handleInputChange} placeholder="ex: PM1F" className="w-full p-2 border border-emerald-200 dark:border-emerald-700/50 rounded text-sm focus:ring-1 focus:ring-emerald-500 outline-none uppercase" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Abertura</label>
                <select name="abertura" value={form.abertura} onChange={handleInputChange} className="w-full p-2 border border-emerald-200 dark:border-emerald-700/50 rounded text-sm focus:ring-1 focus:ring-emerald-500 outline-none bg-white dark:bg-gray-800">
                  <option value="ESQUERDA">Esquerda</option>
                  <option value="DIREITA">Direita</option>
                  <option value="ESQUERDA P/FORA">Esq P/Fora</option>
                  <option value="DIREITA P/FORA">Dir P/Fora</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Folha Largura</label>
                <input type="text" name="folhaLargura" value={form.folhaLargura} onChange={handleInputChange} className="w-full p-2 border border-emerald-200 dark:border-emerald-700/50 rounded text-sm focus:ring-1 focus:ring-emerald-500 outline-none" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Folha Altura</label>
                <input type="text" name="folhaAltura" value={form.folhaAltura} onChange={handleInputChange} className="w-full p-2 border border-emerald-200 dark:border-emerald-700/50 rounded text-sm focus:ring-1 focus:ring-emerald-500 outline-none" required />
              </div>
            </div>

            {/* ADUELA & KITS */}
            <div className="md:col-span-2 grid grid-cols-2 gap-4 p-4 bg-amber-50/30 rounded-lg border border-amber-100">
               <h3 className="col-span-full text-xs font-bold text-amber-800 uppercase tracking-wider mb-2">Aduela & Kit</h3>
               <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Aduela Largura</label>
                <input type="text" name="aduelaLargura" value={form.aduelaLargura} onChange={handleInputChange} className="w-full p-2 border border-amber-200 rounded text-sm focus:ring-1 focus:ring-amber-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Aduela Altura</label>
                <input type="text" name="aduelaAltura" value={form.aduelaAltura} onChange={handleInputChange} className="w-full p-2 border border-amber-200 rounded text-sm focus:ring-1 focus:ring-amber-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Regulagem</label>
                <select name="regulagem" value={form.regulagem} onChange={handleInputChange} className="w-full p-2 border border-amber-200 rounded text-sm focus:ring-1 focus:ring-amber-500 outline-none bg-white dark:bg-gray-800">
                  <option value="REG 50">REG 50</option>
                  <option value="REG 70">REG 70</option>
                  <option value="FIXO">FIXO</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Qtd Folhas por Kit</label>
                <input type="text" name="qtdeFolhasPorKit" value={form.qtdeFolhasPorKit} onChange={handleInputChange} className="w-full p-2 border border-amber-200 rounded text-sm focus:ring-1 focus:ring-amber-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Acabamento</label>
                <select name="acabamento" value={form.acabamento} onChange={handleInputChange} className="w-full p-2 border border-amber-200 rounded text-sm focus:ring-1 focus:ring-amber-500 outline-none bg-white dark:bg-gray-800">
                  <option value="BRANCO">Branco</option>
                  <option value="MADEIRA">Madeira</option>
                  <option value="PRETO">Preto</option>
                  <option value="OUTRO">Outro</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Característica</label>
                <select name="caracteristica" value={form.caracteristica} onChange={handleInputChange} className="w-full p-2 border border-amber-200 rounded text-sm focus:ring-1 focus:ring-amber-500 outline-none bg-white dark:bg-gray-800">
                  <option value="HONEY">Honey (Colmeia)</option>
                  <option value="SOLIDA">Sólida</option>
                  <option value="SARRAFEADA">Sarrafeada</option>
                </select>
              </div>
            </div>

            {/* COMPLEMENTOS & CARACTERÍSTICAS */}
            <div className="md:col-span-4 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-purple-50/30 rounded-lg border border-purple-100">
               <div>
                  <h3 className="text-xs font-bold text-purple-800 uppercase tracking-wider mb-4">Complementos</h3>
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Lados da Aduela</label>
                        <input type="text" name="qtdeLadosAduela" value={form.qtdeLadosAduela} onChange={handleInputChange} className="w-full p-2 border border-purple-200 rounded text-sm focus:ring-1 focus:ring-purple-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Qtd de Montantes</label>
                        <input type="text" name="qtdeMontantes" value={form.qtdeMontantes} onChange={handleInputChange} className="w-full p-2 border border-purple-200 rounded text-sm focus:ring-1 focus:ring-purple-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Bits (Qtde)</label>
                        <input type="text" name="bitsQtde" value={form.bitsQtde} onChange={handleInputChange} className="w-full p-2 border border-purple-200 rounded text-sm focus:ring-1 focus:ring-purple-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Bits (Faces)</label>
                        <input type="text" name="bitsFaces" value={form.bitsFaces} onChange={handleInputChange} className="w-full p-2 border border-purple-200 rounded text-sm focus:ring-1 focus:ring-purple-500 outline-none" />
                      </div>
                  </div>
               </div>
               
               <div>
                  <h3 className="text-xs font-bold text-purple-800 uppercase tracking-wider mb-4">Características Especiais</h3>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                     <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer p-1.5 hover:bg-white dark:bg-gray-800 rounded">
                        <input type="checkbox" name="camarao" checked={form.camarao} onChange={handleInputChange} className="rounded text-brand-green focus:ring-brand-green" />
                        <span>Camarão</span>
                     </label>
                     <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer p-1.5 hover:bg-white dark:bg-gray-800 rounded">
                        <input type="checkbox" name="correr" checked={form.correr} onChange={handleInputChange} className="rounded text-brand-green focus:ring-brand-green" />
                        <span>Correr</span>
                     </label>
                     <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer p-1.5 hover:bg-white dark:bg-gray-800 rounded">
                        <input type="checkbox" name="pivotante" checked={form.pivotante} onChange={handleInputChange} className="rounded text-brand-green focus:ring-brand-green" />
                        <span>Pivotante</span>
                     </label>
                     <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer p-1.5 hover:bg-white dark:bg-gray-800 rounded">
                        <input type="checkbox" name="veneziana" checked={form.veneziana} onChange={handleInputChange} className="rounded text-brand-green focus:ring-brand-green" />
                        <span>C/ Veneziana</span>
                     </label>
                     <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer p-1.5 hover:bg-white dark:bg-gray-800 rounded">
                        <input type="checkbox" name="grelha" checked={form.grelha} onChange={handleInputChange} className="rounded text-brand-green focus:ring-brand-green" />
                        <span>C/ Grelha</span>
                     </label>
                     <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer p-1.5 hover:bg-white dark:bg-gray-800 rounded">
                        <input type="checkbox" name="bandeira" checked={form.bandeira} onChange={handleInputChange} className="rounded text-brand-green focus:ring-brand-green" />
                        <span>C/ Bandeira</span>
                     </label>
                     <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer p-1.5 hover:bg-white dark:bg-gray-800 rounded">
                        <input type="checkbox" name="chapa" checked={form.chapa} onChange={handleInputChange} className="rounded text-brand-green focus:ring-brand-green" />
                        <span>C/ Chapa</span>
                     </label>
                     <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer p-1.5 hover:bg-white dark:bg-gray-800 rounded">
                        <input type="checkbox" name="vidro" checked={form.vidro} onChange={handleInputChange} className="rounded text-brand-green focus:ring-brand-green" />
                        <span>C/ Vidro</span>
                     </label>
                     <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer p-1.5 hover:bg-white dark:bg-gray-800 rounded">
                        <input type="checkbox" name="kitDuplo" checked={form.kitDuplo} onChange={handleInputChange} className="rounded text-brand-green focus:ring-brand-green" />
                        <span>Kit Duplo</span>
                     </label>
                     <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer p-1.5 hover:bg-white dark:bg-gray-800 rounded">
                        <input type="checkbox" name="fechaFresta" checked={form.fechaFresta} onChange={handleInputChange} className="rounded text-brand-green focus:ring-brand-green" />
                        <span>Fecha Fresta</span>
                     </label>
                  </div>
               </div>
            </div>

            <div className="md:col-span-4 flex justify-end mt-2">
               <button type="submit" className="flex items-center justify-center space-x-2 px-6 py-2.5 bg-brand-green text-white font-medium rounded-lg hover:bg-brand-green-dark transition-colors shadow-sm w-full md:w-auto">
                 <Save className="w-5 h-5" />
                 <span>Salvar Kit</span>
               </button>
            </div>
            
          </div>
        </form>
      </div>

      {/* BULK MODAL */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-4xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                <FileSpreadsheet className="w-5 h-5 mr-2 text-emerald-600" />
                Lançamento em Massa
              </h2>
              <button type="button" onClick={() => setShowBulkModal(false)} className="text-gray-500 hover:text-red-500 font-bold px-2 py-1">X</button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Copie os dados da planilha e cole na caixa abaixo. A ordem esperada das colunas é:
                <br />
                <span className="font-mono text-xs bg-gray-100 dark:bg-gray-900 p-1 rounded mt-2 inline-block">APTO | PAV. | COLUNA | CÔMODO | FOLHA LARGURA | FOLHA ALTURA | TIPOLOGIA | ABERTURA | ADUELA LARGURA | ADUELA ALTURA | REGULAGEM | QTD KITS</span>
              </p>
              <textarea
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder="Cole os dados aqui (separados por tabulação/copiados do Excel)..."
                className="w-full h-80 p-3 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-900 text-sm font-mono whitespace-pre dark:text-gray-200 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="border-t border-gray-100 dark:border-gray-700 p-4 flex justify-end space-x-3 bg-gray-50 dark:bg-gray-900 rounded-b-xl">
              <button 
                type="button"
                onClick={() => setShowBulkModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-white dark:hover:bg-gray-800"
              >
                Cancelar
              </button>
              <button 
                type="button"
                onClick={handleMassImport}
                className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 font-medium"
              >
                Importar Dados
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TABELA DE VISUALIZAÇÃO */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
         <div className="p-4 border-b border-gray-100 bg-gray-50 dark:bg-gray-900 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center">
              <FileSpreadsheet className="w-5 h-5 mr-2 text-gray-500" />
              Kits Cadastrados
            </h2>
                       <div className="flex items-center space-x-2">
              <button 
                type="button"
                onClick={exportToPDF}
                className="flex items-center text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-800/50 px-3 py-1.5 rounded-lg transition-colors"
                title="Exportar como PDF"
              >
                <FileText className="w-4 h-4 mr-2" />
                PDF
              </button>
              <button 
                type="button"
                onClick={exportToExcel}
                className="flex items-center text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-800/50 px-3 py-1.5 rounded-lg transition-colors"
                title="Exportar como Excel (XLSX)"
              >
                <Download className="w-4 h-4 mr-2" />
                Excel / XLS
              </button>
              <div className="text-sm text-gray-500 ml-2">
                 {kits.length} registro(s)
              </div>
            </div>
         </div>
         <div className="overflow-x-auto print:overflow-visible">
            <table className="w-full text-left text-sm border-collapse whitespace-nowrap">
               <thead className="bg-[#e2efda] dark:bg-emerald-900/40 text-xs uppercase text-gray-800 dark:text-emerald-100 sticky top-0 border-b border-gray-300 dark:border-gray-600">
                  <tr>
                     <th className="p-2 border-r border-[#c2d6b3] dark:border-emerald-800/40 font-bold text-center">Ações</th>
                     <th className="p-2 border-r border-[#c2d6b3] dark:border-emerald-800/40 font-bold text-center">Apto</th>
                     <th className="p-2 border-r border-[#c2d6b3] dark:border-emerald-800/40 font-bold text-center">Pav.</th>
                     <th className="p-2 border-r border-[#c2d6b3] dark:border-emerald-800/40 font-bold text-center">Coluna</th>
                     <th className="p-2 border-r border-[#c2d6b3] dark:border-emerald-800/40 font-bold">Cômodo</th>
                     
                     {/* Folha */}
                     <th className="p-2 border-r border-[#c2d6b3] dark:border-emerald-800/40 font-bold text-center" colSpan={2}>Folha de Porta<br/><span className="font-normal text-[10px]">Largura | Altura</span></th>
                     
                     <th className="p-2 border-r border-[#c2d6b3] dark:border-emerald-800/40 font-bold text-center">Tipologia</th>
                     <th className="p-2 border-r border-[#c2d6b3] dark:border-emerald-800/40 font-bold text-center">Abertura</th>
                     
                     {/* Aduela */}
                     <th className="p-2 border-r border-[#c2d6b3] dark:border-emerald-800/40 font-bold text-center" colSpan={2}>Aduela<br/><span className="font-normal text-[10px]">Largura | Altura</span></th>
                     
                     <th className="p-2 border-r border-[#c2d6b3] dark:border-emerald-800/40 font-bold text-center">Regulagem</th>
                     <th className="p-2 border-r border-[#c2d6b3] dark:border-emerald-800/40 font-bold text-center">Qtd Folha<br/>Kit</th>
                     <th className="p-2 border-r border-[#c2d6b3] dark:border-emerald-800/40 font-bold text-center">Acabamento</th>
                     <th className="p-2 border-r border-[#c2d6b3] dark:border-emerald-800/40 font-bold text-center">Característica</th>
                     
                     <th className="p-2 border-r border-[#c2d6b3] dark:border-emerald-800/40 font-bold text-center">Qtd Lados<br/>Aduela</th>
                     <th className="p-2 border-r border-[#c2d6b3] dark:border-emerald-800/40 font-bold text-center">Montantes</th>
                     
                     <th className="p-2 border-r border-[#c2d6b3] dark:border-emerald-800/40 font-bold text-center" colSpan={2}>Bits Folha<br/><span className="font-normal text-[10px]">Qtde | Faces</span></th>
                     
                     {/* Specs */}
                     <th className="p-2 border-r border-[#c2d6b3] dark:border-emerald-800/40 font-bold text-center">Camarão</th>
                     <th className="p-2 border-r border-[#c2d6b3] dark:border-emerald-800/40 font-bold text-center">Correr</th>
                     <th className="p-2 border-r border-[#c2d6b3] dark:border-emerald-800/40 font-bold text-center">Pivotante</th>
                     <th className="p-2 border-r border-[#c2d6b3] dark:border-emerald-800/40 font-bold text-center">C/ Venez.</th>
                     <th className="p-2 border-r border-[#c2d6b3] dark:border-emerald-800/40 font-bold text-center">C/ Grelha</th>
                     <th className="p-2 border-r border-[#c2d6b3] dark:border-emerald-800/40 font-bold text-center">C/ Band.</th>
                     <th className="p-2 border-r border-[#c2d6b3] dark:border-emerald-800/40 font-bold text-center">C/ Chapa</th>
                     <th className="p-2 border-r border-[#c2d6b3] dark:border-emerald-800/40 font-bold text-center">C/ Vidro</th>
                     <th className="p-2 font-bold text-center border-r border-[#c2d6b3] dark:border-emerald-800/40">Fecha Fresta</th>
                     <th className="p-2 font-bold text-center">Kit Duplo</th>
<th className="p-2 font-bold text-center">Obs.</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {kits.map(kit => (
                     <tr key={kit.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800">
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center">
                           <div className="flex justify-center space-x-2">
                             <button onClick={() => handleDuplicate(kit)} title="Duplicar para o formulário" className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors">
                               <Copy className="w-4 h-4" />
                             </button>
                             <button onClick={() => handleDelete(kit.id)} title="Excluir" className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors">
                               <Trash2 className="w-4 h-4" />
                             </button>
                           </div>
                        </td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 font-bold text-center"><EditableCell value={kit.apto} onChange={v => updateKit(kit.id, "apto", v)} className="w-16 font-bold" /></td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center"><EditableCell value={kit.pavimento} onChange={v => updateKit(kit.id, "pavimento", v)} className="w-12" /></td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center"><EditableCell value={kit.coluna} onChange={v => updateKit(kit.id, "coluna", v)} className="w-12" /></td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 font-medium"><EditableCell value={kit.comodo} onChange={v => updateKit(kit.id, "comodo", v)} className="w-32 text-left font-medium" /></td>
                        
                        {/* Folha */}
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center font-mono text-xs"><EditableCell value={kit.folhaLargura} onChange={v => updateKit(kit.id, "folhaLargura", v)} className="w-16 font-mono" /></td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center font-mono text-xs"><EditableCell value={kit.folhaAltura} onChange={v => updateKit(kit.id, "folhaAltura", v)} className="w-16 font-mono" /></td>
                        
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 font-bold text-center text-xs"><EditableCell value={kit.tipologia} onChange={v => updateKit(kit.id, "tipologia", v)} className="w-20 font-bold" /></td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center text-xs"><EditableCell type="select" options={["DIREITA", "ESQUERDA", "DIREITA P/FORA", "ESQUERDA P/FORA", "CORRER", "PIVOTANTE", "CAMARÃO"]} value={kit.abertura} onChange={v => updateKit(kit.id, "abertura", v)} className="w-36 text-xs" /></td>
                        
                        {/* Aduela */}
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center font-mono text-xs"><EditableCell value={kit.aduelaLargura} onChange={v => updateKit(kit.id, "aduelaLargura", v)} className="w-16 font-mono" /></td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center font-mono text-xs"><EditableCell value={kit.aduelaAltura} onChange={v => updateKit(kit.id, "aduelaAltura", v)} className="w-16 font-mono" /></td>
                        
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center text-xs"><EditableCell value={kit.regulagem} onChange={v => updateKit(kit.id, "regulagem", v)} className="w-24 text-xs" /></td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center font-bold"><EditableCell type="number" value={kit.qtdeFolhasPorKit} onChange={v => updateKit(kit.id, "qtdeFolhasPorKit", parseInt(v) || 0)} className="w-16 font-bold" /></td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center"><EditableCell value={kit.acabamento} onChange={v => updateKit(kit.id, "acabamento", v)} className="w-24" /></td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center font-medium"><EditableCell value={kit.caracteristica} onChange={v => updateKit(kit.id, "caracteristica", v)} className="w-32 font-medium" /></td>
                        
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center"><EditableCell type="number" value={kit.qtdeLadosAduela} onChange={v => updateKit(kit.id, "qtdeLadosAduela", parseInt(v) || 0)} className="w-16" /></td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center"><EditableCell type="number" value={kit.qtdeMontantes} onChange={v => updateKit(kit.id, "qtdeMontantes", parseInt(v) || 0)} className="w-16" /></td>
                        
                        {/* Bits */}
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center"><EditableCell type="number" value={kit.bitsQtde} onChange={v => updateKit(kit.id, "bitsQtde", parseInt(v) || 0)} className="w-16" /></td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center"><EditableCell type="number" value={kit.bitsFaces} onChange={v => updateKit(kit.id, "bitsFaces", parseInt(v) || 0)} className="w-16" /></td>
                        
                        {/* Checkboxes em formato X ou V */}
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center"><EditableCell type="boolean" value={kit.camarao} onChange={v => updateKit(kit.id, "camarao", v)} /></td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center"><EditableCell type="boolean" value={kit.correr} onChange={v => updateKit(kit.id, "correr", v)} /></td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center"><EditableCell type="boolean" value={kit.pivotante} onChange={v => updateKit(kit.id, "pivotante", v)} /></td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center"><EditableCell type="boolean" value={kit.veneziana} onChange={v => updateKit(kit.id, "veneziana", v)} /></td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center"><EditableCell type="boolean" value={kit.grelha} onChange={v => updateKit(kit.id, "grelha", v)} /></td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center"><EditableCell type="boolean" value={kit.bandeira} onChange={v => updateKit(kit.id, "bandeira", v)} /></td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center"><EditableCell type="boolean" value={kit.chapa} onChange={v => updateKit(kit.id, "chapa", v)} /></td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center"><EditableCell type="boolean" value={kit.vidro} onChange={v => updateKit(kit.id, "vidro", v)} /></td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center"><EditableCell type="boolean" value={kit.fechaFresta} onChange={v => updateKit(kit.id, "fechaFresta", v)} /></td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center"><EditableCell type="boolean" value={kit.kitDuplo} onChange={v => updateKit(kit.id, "kitDuplo", v)} /></td>
<td className="p-2 text-center"><EditableObsCell value={kit.observacao || ""} onChange={v => updateKit(kit.id, "observacao", v)} /></td>
                     </tr>
                  ))}
                  {kits.length === 0 && (
                     <tr>
                        <td colSpan={27} className="p-8 text-center text-gray-500">
                           Nenhum lançamento efetuado. Utilize o formulário acima para registrar um kit.
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
