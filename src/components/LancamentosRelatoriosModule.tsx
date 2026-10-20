import React, { useState } from 'react';
import { useLocalStorage } from './EstoqueModule';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Plus, Trash2, Copy, Save, FileSpreadsheet, Download, FileText, MessageSquareQuote, Settings, Edit2, Check, X, ArrowUp, ArrowDown, RotateCcw } from 'lucide-react';

import { cn } from '../lib/utils';

interface KitLancamento {
  id: string;
  bloco: string;
  apto: string;
  pavimento: string;
  coluna: string;
  comodo: string;
  tipologia: string;
  folhaLargura: string;
  folhaAltura: string;
  qtdeFolhasPorKit: string;
  acabamentoPorta: string;
  caracteristicaPorta: string;
  abertura: string;
  aduelaLargura: string;
  aduelaAltura: string;
  regulagem: string;
  acabamentoAduela: string;
  fechaduraMarca: string;
  fechaduraGrid: string;
  fechaduraTipo: string;
  dobradicaMarca: string;
  dobradicaMedida: string;
  qtdeLadosAduela: string;
  montantesMedida: string;
  montantesFolgas: string;
  bitsQtde: string;
  bitsFaces: string;
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
  observacao: string;
}

const INITIAL_FORM: Omit<KitLancamento, 'id'> = {
  bloco: '', apto: '', pavimento: '', coluna: '', comodo: '', tipologia: '',
  folhaLargura: '', folhaAltura: '', qtdeFolhasPorKit: '',
  acabamentoPorta: '', caracteristicaPorta: '', abertura: '',
  aduelaLargura: '', aduelaAltura: '', regulagem: '',
  acabamentoAduela: '', fechaduraMarca: '', fechaduraGrid: '', fechaduraTipo: '',
  dobradicaMarca: '', dobradicaMedida: '', qtdeLadosAduela: '',
  montantesMedida: '', montantesFolgas: '', bitsQtde: '', bitsFaces: '',
  camarao: false, correr: false, pivotante: false, veneziana: false, grelha: false, bandeira: false, chapa: false, vidro: false, fechaFresta: false, kitDuplo: false, observacao: ''
};

const INITIAL_KITS: KitLancamento[] = [
  {"bloco":"1","apto":"102","pavimento":"1","coluna":"2","comodo":"BANHEIRO","tipologia":"PM1F","folhaLargura":"620","folhaAltura":"2070","qtdeFolhasPorKit":"1","acabamentoPorta":"BRANCO","caracteristicaPorta":"HONEY","abertura":"ESQUERDA","aduelaLargura":"90","aduelaAltura":"2120","regulagem":"REG 50","acabamentoAduela":"PET MDF BRA+BOR+REG","fechaduraMarca":"LA FONTE","fechaduraGrid":"55","fechaduraTipo":"WC","dobradicaMarca":"LA FONTE","dobradicaMedida":"3 x 2,5","qtdeLadosAduela":"3","montantesMedida":"","montantesFolgas":"","bitsQtde":"","bitsFaces":"","camarao":false,"correr":false,"pivotante":false,"veneziana":false,"grelha":false,"bandeira":false,"chapa":false,"vidro":false,"fechaFresta":false,"kitDuplo":false,"observacao":"","id":"kit-0"},
  {"bloco":"1","apto":"104","pavimento":"1","coluna":"4","comodo":"ENTRADA","tipologia":"PM3","folhaLargura":"820","folhaAltura":"2100","qtdeFolhasPorKit":"1","acabamentoPorta":"BRANCO","caracteristicaPorta":"SOLIDA","abertura":"ESQUERDA P/FORA","aduelaLargura":"170","aduelaAltura":"2110","regulagem":"REG 50","acabamentoAduela":"PET MDF BRA+BOR+REG","fechaduraMarca":"PAPAIZ","fechaduraGrid":"40","fechaduraTipo":"EXT","dobradicaMarca":"LA FONTE","dobradicaMedida":"3 x 2,5","qtdeLadosAduela":"3","montantesMedida":"","montantesFolgas":"","bitsQtde":"4","bitsFaces":"2","camarao":false,"correr":false,"pivotante":false,"veneziana":false,"grelha":false,"bandeira":false,"chapa":false,"vidro":false,"fechaFresta":true,"kitDuplo":false,"observacao":"","id":"kit-1"},
  {"bloco":"1","apto":"106","pavimento":"1","coluna":"6","comodo":"QUARTO","tipologia":"PM2","folhaLargura":"720","folhaAltura":"2100","qtdeFolhasPorKit":"1","acabamentoPorta":"BRANCO","caracteristicaPorta":"HONEY","abertura":"DIREITA","aduelaLargura":"90","aduelaAltura":"2110","regulagem":"REG 70","acabamentoAduela":"PET MDF BRA+BOR+REG","fechaduraMarca":"LA FONTE","fechaduraGrid":"55","fechaduraTipo":"INT","dobradicaMarca":"LA FONTE","dobradicaMedida":"3 x 2,5","qtdeLadosAduela":"3","montantesMedida":"","montantesFolgas":"","bitsQtde":"","bitsFaces":"","camarao":false,"correr":false,"pivotante":false,"veneziana":false,"grelha":false,"bandeira":false,"chapa":false,"vidro":false,"fechaFresta":false,"kitDuplo":false,"observacao":"","id":"kit-2"},
  {"bloco":"1","apto":"202","pavimento":"2","coluna":"2","comodo":"ENTRADA","tipologia":"PM3","folhaLargura":"820","folhaAltura":"2100","qtdeFolhasPorKit":"1","acabamentoPorta":"BRANCO","caracteristicaPorta":"SOLIDA","abertura":"DIREITA","aduelaLargura":"170","aduelaAltura":"2110","regulagem":"REG 70","acabamentoAduela":"PET MDF BRA+BOR+REG","fechaduraMarca":"PAPAIZ","fechaduraGrid":"40","fechaduraTipo":"EXT","dobradicaMarca":"LA FONTE","dobradicaMedida":"3 x 2,5","qtdeLadosAduela":"3","montantesMedida":"","montantesFolgas":"","bitsQtde":"4","bitsFaces":"2","camarao":false,"correr":false,"pivotante":false,"veneziana":false,"grelha":false,"bandeira":false,"chapa":false,"vidro":false,"fechaFresta":true,"kitDuplo":false,"observacao":"","id":"kit-3"},
  {"bloco":"1","apto":"206","pavimento":"2","coluna":"6","comodo":"COZINHA","tipologia":"PM3F","folhaLargura":"820","folhaAltura":"2070","qtdeFolhasPorKit":"1","acabamentoPorta":"BRANCO","caracteristicaPorta":"SARRAFEADA","abertura":"DIREITA P/FORA","aduelaLargura":"150","aduelaAltura":"2120","regulagem":"REG 50","acabamentoAduela":"PET MDF BRA+BOR+REG","fechaduraMarca":"LA FONTE","fechaduraGrid":"55","fechaduraTipo":"INT","dobradicaMarca":"LA FONTE","dobradicaMedida":"3 x 2,5","qtdeLadosAduela":"3","montantesMedida":"","montantesFolgas":"","bitsQtde":"","bitsFaces":"","camarao":false,"correr":true,"pivotante":false,"veneziana":true,"grelha":true,"bandeira":false,"chapa":false,"vidro":false,"fechaFresta":false,"kitDuplo":false,"observacao":"","id":"kit-4"},
  {"bloco":"1","apto":"309","pavimento":"3","coluna":"9","comodo":"COZINHA","tipologia":"PM3F","folhaLargura":"820","folhaAltura":"2070","qtdeFolhasPorKit":"1","acabamentoPorta":"BRANCO","caracteristicaPorta":"SARRAFEADA","abertura":"DIREITA","aduelaLargura":"150","aduelaAltura":"2120","regulagem":"REG 50","acabamentoAduela":"PET MDF BRA+BOR+REG","fechaduraMarca":"LA FONTE","fechaduraGrid":"55","fechaduraTipo":"INT","dobradicaMarca":"LA FONTE","dobradicaMedida":"3 x 2,5","qtdeLadosAduela":"3","montantesMedida":"","montantesFolgas":"","bitsQtde":"","bitsFaces":"","camarao":false,"correr":true,"pivotante":false,"veneziana":false,"grelha":false,"bandeira":false,"chapa":false,"vidro":true,"fechaFresta":false,"kitDuplo":false,"observacao":"","id":"kit-5"},
  {"bloco":"1","apto":"509","pavimento":"5","coluna":"9","comodo":"COZINHA","tipologia":"PM3F","folhaLargura":"820","folhaAltura":"2070","qtdeFolhasPorKit":"1","acabamentoPorta":"BRANCO","caracteristicaPorta":"SARRAFEADA","abertura":"ESQUERDA","aduelaLargura":"150","aduelaAltura":"2120","regulagem":"REG 50","acabamentoAduela":"PET MDF BRA+BOR+REG","fechaduraMarca":"LA FONTE","fechaduraGrid":"55","fechaduraTipo":"INT","dobradicaMarca":"LA FONTE","dobradicaMedida":"3 x 2,5","qtdeLadosAduela":"3","montantesMedida":"","montantesFolgas":"","bitsQtde":"","bitsFaces":"","camarao":false,"correr":false,"pivotante":false,"veneziana":false,"grelha":false,"bandeira":false,"chapa":false,"vidro":true,"fechaFresta":false,"kitDuplo":false,"observacao":"","id":"kit-6"},
  {"bloco":"1","apto":"709","pavimento":"7","coluna":"9","comodo":"COZINHA","tipologia":"PM3F","folhaLargura":"820","folhaAltura":"2070","qtdeFolhasPorKit":"1","acabamentoPorta":"BRANCO","caracteristicaPorta":"SARRAFEADA","abertura":"ESQUERDA","aduelaLargura":"150","aduelaAltura":"2120","regulagem":"REG 50","acabamentoAduela":"PET MDF BRA+BOR+REG","fechaduraMarca":"LA FONTE","fechaduraGrid":"55","fechaduraTipo":"INT","dobradicaMarca":"PAPAIZ","dobradicaMedida":"3 x 2,5","qtdeLadosAduela":"3","montantesMedida":"","montantesFolgas":"","bitsQtde":"","bitsFaces":"","camarao":false,"correr":true,"pivotante":false,"veneziana":true,"grelha":true,"bandeira":false,"chapa":false,"vidro":true,"fechaFresta":false,"kitDuplo":false,"observacao":"","id":"kit-7"},
  {"bloco":"1","apto":"703","pavimento":"7","coluna":"3","comodo":"COZINHA","tipologia":"PM3F","folhaLargura":"820","folhaAltura":"2070","qtdeFolhasPorKit":"1","acabamentoPorta":"BRANCO","caracteristicaPorta":"SARRAFEADA","abertura":"DIREITA","aduelaLargura":"150","aduelaAltura":"2120","regulagem":"REG 50","acabamentoAduela":"PET MDF BRA+BOR+REG","fechaduraMarca":"LA FONTE","fechaduraGrid":"55","fechaduraTipo":"INT","dobradicaMarca":"PAPAIZ","dobradicaMedida":"3 x 2,5","qtdeLadosAduela":"3","montantesMedida":"","montantesFolgas":"","bitsQtde":"","bitsFaces":"","camarao":false,"correr":true,"pivotante":false,"veneziana":false,"grelha":true,"bandeira":false,"chapa":false,"vidro":true,"fechaFresta":false,"kitDuplo":false,"observacao":"","id":"kit-8"},
  {"bloco":"1","apto":"302","pavimento":"3","coluna":"2","comodo":"LIXEIRA","tipologia":"PM7","folhaLargura":"1440","folhaAltura":"2100","qtdeFolhasPorKit":"2","acabamentoPorta":"BRANCO","caracteristicaPorta":"SARRAFEADA","abertura":"ESQUERDA P/FORA","aduelaLargura":"130","aduelaAltura":"2110","regulagem":"REG 50","acabamentoAduela":"PET MDF BRA+BOR+REG","fechaduraMarca":"LA FONTE","fechaduraGrid":"45,1","fechaduraTipo":"SÓ MAÇ.","dobradicaMarca":"LA FONTE","dobradicaMedida":"3 x 2,5","qtdeLadosAduela":"3","montantesMedida":"","montantesFolgas":"","bitsQtde":"","bitsFaces":"","camarao":false,"correr":false,"pivotante":false,"veneziana":false,"grelha":false,"bandeira":false,"chapa":false,"vidro":false,"fechaFresta":false,"kitDuplo":false,"observacao":"","id":"kit-9"},
  {"bloco":"1","apto":"306","pavimento":"3","coluna":"6","comodo":"ELETRICA","tipologia":"PM12","folhaLargura":"1020","folhaAltura":"1800","qtdeFolhasPorKit":"2","acabamentoPorta":"BRANCO","caracteristicaPorta":"HONEY","abertura":"ESQUERDA P/FORA","aduelaLargura":"70","aduelaAltura":"2110","regulagem":"FIXO","acabamentoAduela":"PET MDF BRA+BOR+REG","fechaduraMarca":"LA FONTE","fechaduraGrid":"45","fechaduraTipo":"MEIO CIL.","dobradicaMarca":"LA FONTE","dobradicaMedida":"3 x 2,5","qtdeLadosAduela":"4","montantesMedida":"","montantesFolgas":"","bitsQtde":"","bitsFaces":"","camarao":false,"correr":false,"pivotante":false,"veneziana":false,"grelha":false,"bandeira":false,"chapa":false,"vidro":false,"fechaFresta":false,"kitDuplo":false,"observacao":"","id":"kit-10"},
  {"bloco":"1","apto":"308","pavimento":"3","coluna":"8","comodo":"SUITE 2","tipologia":"PM2","folhaLargura":"720","folhaAltura":"2100","qtdeFolhasPorKit":"1","acabamentoPorta":"BRANCO","caracteristicaPorta":"SARRAFEADA","abertura":"DIREITA","aduelaLargura":"150","aduelaAltura":"2110","regulagem":"REG 70","acabamentoAduela":"PET MDF BRA+BOR+REG","fechaduraMarca":"LA FONTE","fechaduraGrid":"55","fechaduraTipo":"INT","dobradicaMarca":"LA FONTE","dobradicaMedida":"3 x 2,5","qtdeLadosAduela":"3","montantesMedida":"","montantesFolgas":"","bitsQtde":"","bitsFaces":"","camarao":false,"correr":false,"pivotante":false,"veneziana":false,"grelha":false,"bandeira":false,"chapa":false,"vidro":false,"fechaFresta":false,"kitDuplo":false,"observacao":"","id":"kit-11"}
];

export const DEFAULT_COMODOS = [
  "BANHEIRO",
  "BANH. SOCIAL",
  "BANH. SUITE",
  "ENTRADA",
  "QUARTO",
  "COZINHA",
  "ELETRICA",
  "LIXEIRA",
  "SALA",
  "SUITE",
  "SUITE 2",
  "ESPECIAIS"
];

const EditableCell = ({ value, onChange, className = "", type = "text", options = [], list }: { value: any, onChange: (v: any) => void, className?: string, type?: "text" | "number" | "boolean" | "select", options?: string[], list?: string }) => {
  const safeClassName = className.replace(/\bw-\S+/g, '');
  
  if (type === "boolean") {
    return (
      <input type="checkbox" checked={!!value} onChange={e => onChange(e.target.checked)} className="cursor-pointer" />
    );
  }
  if (type === "select") {
    return (
      <select value={value} onChange={e => onChange(e.target.value)} className={`bg-transparent outline-none focus:ring-1 focus:ring-emerald-500 rounded px-1 ${safeClassName}`}>
        <option value="">-</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    );
  }
  return (
    <div className={`relative inline-flex items-center justify-center min-w-[4rem] max-w-[20rem] ${safeClassName}`}>
      <span className="invisible whitespace-pre px-2">{value || ' '}</span>
      <input 
        type={type === "number" ? "number" : "text"}
        value={value || ''} 
        onChange={e => onChange(e.target.value)}
        list={list}
        className="absolute inset-0 w-full h-full bg-transparent text-center outline-none focus:ring-1 focus:ring-emerald-500 rounded px-1"
      />
    </div>
  );
};

const EditableObsCell = ({ value, onChange, className = "" }: { value: string, onChange: (v: string) => void, className?: string }) => {
  return (
    <textarea 
      value={value || ''} 
      onChange={e => onChange(e.target.value)}
      className={"w-full min-w-[150px] bg-transparent text-left outline-none focus:ring-1 focus:ring-emerald-500 rounded px-1 resize-y " + className}
      rows={1}
    />
  );
};

export function LancamentosRelatoriosModule() {
  const [kits, setKits] = useLocalStorage<KitLancamento[]>('nacional_madeiras_kits_v6', INITIAL_KITS);
  const [form, setForm] = useState<Omit<KitLancamento, 'id'>>(INITIAL_FORM);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkText, setBulkText] = useState('');

  const [comodoOptions, setComodoOptions] = useLocalStorage<string[]>('nacional_madeiras_comodo_options_v1', DEFAULT_COMODOS);
  const [showComodoModal, setShowComodoModal] = useState(false);
  const [newComodoInput, setNewComodoInput] = useState('');
  const [editingComodoIndex, setEditingComodoIndex] = useState<number | null>(null);
  const [editingComodoValue, setEditingComodoValue] = useState('');

  const handleAddNewComodo = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newComodoInput.trim().toUpperCase();
    if (!trimmed) return;
    if (comodoOptions.includes(trimmed)) {
      alert('Este cômodo já está na lista!');
      return;
    }
    const updated = [...comodoOptions, trimmed];
    setComodoOptions(updated);
    setNewComodoInput('');
    setForm(prev => ({ ...prev, comodo: trimmed }));
  };

  const handleStartEditComodo = (index: number) => {
    setEditingComodoIndex(index);
    setEditingComodoValue(comodoOptions[index]);
  };

  const handleSaveEditComodo = (index: number) => {
    const trimmed = editingComodoValue.trim().toUpperCase();
    if (!trimmed) return;
    const oldVal = comodoOptions[index];
    const updated = [...comodoOptions];
    updated[index] = trimmed;
    setComodoOptions(updated);
    setEditingComodoIndex(null);
    setEditingComodoValue('');

    if (form.comodo === oldVal) {
      setForm(prev => ({ ...prev, comodo: trimmed }));
    }
  };

  const handleDeleteComodo = (index: number) => {
    const itemToDelete = comodoOptions[index];
    if (window.confirm(`Deseja remover "${itemToDelete}" da lista pré-definida?`)) {
      const updated = comodoOptions.filter((_, i) => i !== index);
      setComodoOptions(updated);
      if (form.comodo === itemToDelete) {
        setForm(prev => ({ ...prev, comodo: '' }));
      }
    }
  };

  const handleMoveComodo = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= comodoOptions.length) return;
    const updated = [...comodoOptions];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setComodoOptions(updated);
  };

  const handleResetComodos = () => {
    if (window.confirm('Deseja restaurar a lista padrão original de cômodos?')) {
      setComodoOptions(DEFAULT_COMODOS);
    }
  };

  const clearAllKits = () => {
    if (window.confirm('Tem certeza que deseja excluir todos os kits? Esta ação não pode ser desfeita.')) {
      setKits([]);
    }
  };

  const exportToExcel = () => {
    if (kits.length === 0) return;
    const headers = [
      ['BLOCO', 'APTO', 'PAVIMENTO', 'COLUNA', 'CÔMODO', 'TIPOLOGIA', 'FOLHA DE PORTA LARGURA', 'FOLHA DE PORTA ALTURA', 'QUANTIDADE DE FOLHA POR KIT', 'ACABAMENTO DA PORTA', 'CARACTERISTICA DA PORTA', 'ABERTURA', 'ADUELA LARGURA', 'ADUELA ALTURA', 'REGULAGEM', 'ACABAMENTO DA ADUELA', 'FECHADURA MARCA', 'FECHADURA GRID', 'FECHADURA TIPO', 'DOBRADIÇA MARCA', 'DOBRADIÇA MEDIDA', 'QTDE DE LADOS DA ADUELA', 'MONTANTES MEDIDA', 'MONTANTES FOLGAS', 'BITS POR FOLHA QTDE', 'BITS POR FOLHA FACES', 'CAMARÃO', 'CORRER', 'PIVOTANTE', 'C/VENEZIANA', 'C/GRELHA', 'C/BANDEIRA', 'C/CHAPA', 'C/VIDRO', 'C/FECHA FRESTA', 'OBSERVAÇÃO']
    ];

    const dataToExport = kits.map(k => [
      k.bloco || '', k.apto || '', k.pavimento || '', k.coluna || '', k.comodo || '', k.tipologia || '',
      k.folhaLargura || '', k.folhaAltura || '', k.qtdeFolhasPorKit || '', k.acabamentoPorta || '', k.caracteristicaPorta || '', k.abertura || '',
      k.aduelaLargura || '', k.aduelaAltura || '', k.regulagem || '', k.acabamentoAduela || '',
      k.fechaduraMarca || '', k.fechaduraGrid || '', k.fechaduraTipo || '', k.dobradicaMarca || '', k.dobradicaMedida || '',
      k.qtdeLadosAduela || '', k.montantesMedida || '', k.montantesFolgas || '', k.bitsQtde || '', k.bitsFaces || '',
      k.camarao ? 'X' : '', k.correr ? 'X' : '', k.pivotante ? 'X' : '', k.veneziana ? 'X' : '', k.grelha ? 'X' : '', k.bandeira ? 'X' : '', k.chapa ? 'X' : '', k.vidro ? 'X' : '', k.fechaFresta ? 'X' : '', k.observacao || ''
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet([...headers, ...dataToExport]);
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

    const headers = [['Bloco', 'Apto', 'Pav.', 'Col', 'Comodo', 'Tipo', 'FL', 'FA', 'AL', 'AA', 'Qtd']];
    const data = kits.map(k => [
      k.bloco, k.apto, k.pavimento, k.coluna, k.comodo, 
      k.tipologia, k.folhaLargura, k.folhaAltura, 
      k.aduelaLargura, k.aduelaAltura, k.qtdeFolhasPorKit
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
      const cols = line.split('\t').map(c => c?.trim() || '');
      if (cols.length < 5) continue; // Skip invalid lines
      
      newKits.push({
        id: 'k' + Date.now() + Math.random().toString(36).substring(7),
        bloco: cols[0] || '',
        apto: cols[1] || '',
        pavimento: cols[2] || '',
        coluna: cols[3] || '',
        comodo: cols[4] || '',
        tipologia: cols[5] || '',
        folhaLargura: cols[6] || '',
        folhaAltura: cols[7] || '',
        qtdeFolhasPorKit: cols[8] || '',
        acabamentoPorta: cols[9] || '',
        caracteristicaPorta: cols[10] || '',
        abertura: cols[11] || '',
        aduelaLargura: cols[12] || '',
        aduelaAltura: cols[13] || '',
        regulagem: cols[14] || '',
        acabamentoAduela: cols[15] || '',
        fechaduraMarca: cols[16] || '',
        fechaduraGrid: cols[17] || '',
        fechaduraTipo: cols[18] || '',
        dobradicaMarca: cols[19] || '',
        dobradicaMedida: cols[20] || '',
        qtdeLadosAduela: cols[21] || '',
        montantesMedida: cols[22] || '',
        montantesFolgas: cols[23] || '',
        bitsQtde: cols[24] || '',
        bitsFaces: cols[25] || '',
        camarao: cols[26] === 'X' || cols[26] === 'x',
        correr: cols[27] === 'X' || cols[27] === 'x',
        pivotante: cols[28] === 'X' || cols[28] === 'x',
        veneziana: cols[29] === 'X' || cols[29] === 'x',
        grelha: cols[30] === 'X' || cols[30] === 'x',
        bandeira: cols[31] === 'X' || cols[31] === 'x',
        chapa: cols[32] === 'X' || cols[32] === 'x',
        vidro: cols[33] === 'X' || cols[33] === 'x',
        fechaFresta: cols[34] === 'X' || cols[34] === 'x',
        kitDuplo: false,
        observacao: ''
      });
    }

    if (newKits.length > 0) {
      setKits(prev => [...prev, ...newKits]);
      setBulkText('');
      setShowBulkModal(false);
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
      id: Math.random().toString(36).substring(2, 9),
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
                <label className="block text-xs font-medium text-gray-600 mb-1">Bloco</label>
                  <input
                    type="text"
                    className="w-full text-sm border-gray-300 rounded focus:ring-emerald-500 focus:border-emerald-500"
                    value={form.bloco}
                    onChange={e => setForm({...form, bloco: e.target.value})}
                  />
                </div>
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
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-300">
                    Cômodo
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowComodoModal(true)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                    title="Editar lista pré-definida de cômodos"
                  >
                    <Settings className="w-3 h-3" />
                    <span>Editar Lista</span>
                  </button>
                </div>
                <div className="flex gap-1.5">
                  <select 
                    name="comodo" 
                    value={form.comodo} 
                    onChange={(e) => {
                      if (e.target.value === '__MANAGE__') {
                        setShowComodoModal(true);
                      } else {
                        handleInputChange(e);
                      }
                    }} 
                    className="flex-1 p-2 border border-blue-200 rounded text-sm focus:ring-1 focus:ring-blue-500 outline-none bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 font-medium"
                  >
                    <option value="">Selecione o cômodo...</option>
                    {comodoOptions.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                    {form.comodo && !comodoOptions.includes(form.comodo) && (
                      <option value={form.comodo}>{form.comodo} (Atual)</option>
                    )}
                    <option disabled value="">──────────────</option>
                    <option value="__MANAGE__" className="font-semibold text-blue-600">
                      ⚙️ Gerenciar / Editar Lista...
                    </option>
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowComodoModal(true)}
                    className="px-2.5 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-800/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 rounded transition-colors flex items-center justify-center shrink-0"
                    title="Adicionar ou editar cômodos pré-definidos"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
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
                <select name="acabamento" value={form.acabamentoPorta} onChange={handleInputChange} className="w-full p-2 border border-amber-200 rounded text-sm focus:ring-1 focus:ring-amber-500 outline-none bg-white dark:bg-gray-800">
                  <option value="BASIC">Basic</option>
                  <option value="BRANCO">Branco</option>
                  <option value="MADEIRA">Madeira</option>
                  <option value="PRETO">Preto</option>
                  <option value="OUTRO">Outro</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Característica</label>
                <select name="caracteristica" value={form.caracteristicaPorta} onChange={handleInputChange} className="w-full p-2 border border-amber-200 rounded text-sm focus:ring-1 focus:ring-amber-500 outline-none bg-white dark:bg-gray-800">
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
                        <input type="text" name="qtdeMontantes" value={form.montantesMedida} onChange={handleInputChange} className="w-full p-2 border border-purple-200 rounded text-sm focus:ring-1 focus:ring-purple-500 outline-none" />
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

      {/* DATALIST PARA AUTOCOMPLETE DE CÔMODOS NA TABELA */}
      <datalist id="comodos-datalist">
        {comodoOptions.map(c => (
          <option key={c} value={c} />
        ))}
      </datalist>

      {/* MODAL GERENCIAR LISTA DE CÔMODOS */}
      {showComodoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-lg flex flex-col max-h-[90vh]">
            {/* Cabeçalho do Modal */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50 rounded-t-xl">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-lg">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900 dark:text-white">
                    Editar Lista de Cômodos
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Gerencie os cômodos pré-definidos para preenchimento rápido
                  </p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => {
                  setShowComodoModal(false);
                  setEditingComodoIndex(null);
                }} 
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Corpo do Modal */}
            <div className="p-4 overflow-y-auto flex-1 space-y-4">
              {/* Adicionar novo cômodo */}
              <div className="p-3 bg-blue-50/40 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-900/30">
                <label className="block text-xs font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wider mb-1.5">
                  Adicionar Novo Cômodo
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newComodoInput}
                    onChange={(e) => setNewComodoInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddNewComodo();
                      }
                    }}
                    placeholder="Ex: VARANDA, LAVABO, DEPÓSITO..."
                    className="flex-1 p-2 text-sm uppercase border border-blue-200 dark:border-blue-800 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddNewComodo()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg flex items-center gap-1.5 shadow-sm transition-colors shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Adicionar</span>
                  </button>
                </div>
              </div>

              {/* Lista dos cômodos cadastrados */}
              <div>
                <div className="flex items-center justify-between mb-2 px-1">
                  <span className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Cômodos na Lista ({comodoOptions.length})
                  </span>
                  <span className="text-[11px] text-gray-400">
                    Use as setas para ordenar ou o lápis para renomear
                  </span>
                </div>

                <div className="border border-gray-200 dark:border-gray-700 rounded-lg divide-y divide-gray-100 dark:divide-gray-700 max-h-72 overflow-y-auto bg-white dark:bg-gray-800">
                  {comodoOptions.length === 0 ? (
                    <div className="p-6 text-center text-sm text-gray-500">
                      Nenhum cômodo cadastrado. Digite um nome acima para adicionar.
                    </div>
                  ) : (
                    comodoOptions.map((opt, index) => {
                      const isEditing = editingComodoIndex === index;
                      return (
                        <div 
                          key={`${opt}-${index}`}
                          className="flex items-center justify-between p-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        >
                          {isEditing ? (
                            <div className="flex items-center gap-2 flex-1 mr-2">
                              <input
                                type="text"
                                value={editingComodoValue}
                                onChange={(e) => setEditingComodoValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleSaveEditComodo(index);
                                  } else if (e.key === 'Escape') {
                                    setEditingComodoIndex(null);
                                  }
                                }}
                                className="flex-1 p-1.5 text-sm uppercase border border-blue-500 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 outline-none font-bold"
                                autoFocus
                              />
                              <button
                                type="button"
                                onClick={() => handleSaveEditComodo(index)}
                                className="p-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors"
                                title="Confirmar alteração"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingComodoIndex(null)}
                                className="p-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 transition-colors"
                                title="Cancelar"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center gap-2.5">
                                <span className="text-xs font-mono text-gray-400 w-6 text-right font-medium">
                                  {index + 1}.
                                </span>
                                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                  {opt}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleMoveComodo(index, 'up')}
                                  disabled={index === 0}
                                  className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-25 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                  title="Mover para cima"
                                >
                                  <ArrowUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMoveComodo(index, 'down')}
                                  disabled={index === comodoOptions.length - 1}
                                  className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-25 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                  title="Mover para baixo"
                                >
                                  <ArrowDown className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleStartEditComodo(index)}
                                  className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors ml-1"
                                  title="Editar este cômodo"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteComodo(index)}
                                  className="p-1 text-red-500 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                                  title="Excluir este cômodo"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Rodapé do Modal */}
            <div className="border-t border-gray-100 dark:border-gray-700 p-4 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50 rounded-b-xl">
              <button
                type="button"
                onClick={handleResetComodos}
                className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                title="Restaurar a lista padrão de fábrica"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restaurar Padrão</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowComodoModal(false);
                  setEditingComodoIndex(null);
                }}
                className="px-5 py-2 bg-gray-900 hover:bg-black dark:bg-gray-700 dark:hover:bg-gray-600 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
              >
                Concluir
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
              <button
                type="button"
                onClick={clearAllKits}
                className="flex items-center text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-800/50 px-3 py-1.5 rounded-lg transition-colors"
                title="Excluir todos os kits"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Limpar Tudo
              </button>
              <div className="text-sm text-gray-500 ml-2">
                 {kits.length} registro(s)
              </div>
            </div>
         </div>
         <div className="overflow-x-auto print:overflow-visible">
            <table className="w-full text-left text-sm border-collapse whitespace-nowrap">
               <thead className="bg-[#e2efda] dark:bg-emerald-900/40 text-[10px] uppercase text-gray-800 dark:text-emerald-100 sticky top-0 border-b border-gray-300 dark:border-gray-600">
                  <tr>
                     {['AÇÕES', 'BLOCO', 'APTO', 'PAVIMENTO', 'COLUNA', 'CÔMODO', 'TIPOLOGIA', 'FOLHA LARG', 'FOLHA ALT', 'QTD FOLHA/KIT', 'ACABAMENTO DA PORTA', 'CARACTERISTICA DA PORTA', 'ABERTURA', 'ADUELA LARG', 'ADUELA ALT', 'REGULAGEM', 'ACABAMENTO DA ADUELA', 'FECH. MARCA', 'FECH. GRID', 'FECH. TIPO', 'DOBRADIÇA MARCA', 'DOBRADIÇA MEDIDA', 'QTD LADOS ADUELA', 'MONTANTES MEDIDA', 'MONTANTES FOLGAS', 'B. QTD', 'B. FACES', 'CAM', 'CORRER', 'PIV', 'C/VEN', 'C/GRE', 'C/BAND', 'C/CHAPA', 'C/VID', 'C/FF', 'OBSERVAÇÃO'].map((h, i) => (
                         <th key={i} className="p-2 border-r border-[#c2d6b3] dark:border-emerald-800/40 font-bold text-center whitespace-pre">{h}</th>
                     ))}
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
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center font-bold text-emerald-700 dark:text-emerald-400"><EditableCell value={kit.bloco} onChange={v => updateKit(kit.id, "bloco", v)} className="w-16 font-bold" /></td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 font-bold text-center"><EditableCell value={kit.apto} onChange={v => updateKit(kit.id, "apto", v)} className="w-16 font-bold" /></td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center"><EditableCell value={kit.pavimento} onChange={v => updateKit(kit.id, "pavimento", v)} className="w-12" /></td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center"><EditableCell value={kit.coluna} onChange={v => updateKit(kit.id, "coluna", v)} className="w-12" /></td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 font-medium"><EditableCell value={kit.comodo} onChange={v => updateKit(kit.id, "comodo", v)} list="comodos-datalist" className="w-32 text-left font-medium" /></td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 font-bold text-center text-xs"><EditableCell value={kit.tipologia} onChange={v => updateKit(kit.id, "tipologia", v)} className="w-20 font-bold" /></td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center font-mono text-xs"><EditableCell value={kit.folhaLargura} onChange={v => updateKit(kit.id, "folhaLargura", v)} className="w-16 font-mono" /></td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center font-mono text-xs"><EditableCell value={kit.folhaAltura} onChange={v => updateKit(kit.id, "folhaAltura", v)} className="w-16 font-mono" /></td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center font-bold"><EditableCell type="number" value={String(kit.qtdeFolhasPorKit)} onChange={v => updateKit(kit.id, "qtdeFolhasPorKit", v)} className="w-16 font-bold text-center" /></td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center"><EditableCell value={kit.acabamentoPorta} onChange={v => updateKit(kit.id, "acabamentoPorta", v)} className="w-24" /></td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center font-medium"><EditableCell value={kit.caracteristicaPorta} onChange={v => updateKit(kit.id, "caracteristicaPorta", v)} className="w-32 font-medium" /></td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center text-xs"><EditableCell type="select" options={["DIREITA", "ESQUERDA", "DIREITA P/FORA", "ESQUERDA P/FORA", "CORRER", "PIVOTANTE", "CAMARÃO"]} value={kit.abertura} onChange={v => updateKit(kit.id, "abertura", v)} className="w-36 text-xs" /></td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center font-mono text-xs"><EditableCell value={kit.aduelaLargura} onChange={v => updateKit(kit.id, "aduelaLargura", v)} className="w-16 font-mono" /></td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center font-mono text-xs"><EditableCell value={kit.aduelaAltura} onChange={v => updateKit(kit.id, "aduelaAltura", v)} className="w-16 font-mono" /></td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center text-xs"><EditableCell value={kit.regulagem} onChange={v => updateKit(kit.id, "regulagem", v)} className="w-24 text-xs" /></td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center"><EditableCell value={kit.acabamentoAduela} onChange={v => updateKit(kit.id, "acabamentoAduela", v)} className="w-36" /></td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center"><EditableCell value={kit.fechaduraMarca} onChange={v => updateKit(kit.id, "fechaduraMarca", v)} className="w-20" /></td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center"><EditableCell value={kit.fechaduraGrid} onChange={v => updateKit(kit.id, "fechaduraGrid", v)} className="w-16" /></td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center"><EditableCell value={kit.fechaduraTipo} onChange={v => updateKit(kit.id, "fechaduraTipo", v)} className="w-20" /></td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center"><EditableCell value={kit.dobradicaMarca} onChange={v => updateKit(kit.id, "dobradicaMarca", v)} className="w-20" /></td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center"><EditableCell value={kit.dobradicaMedida} onChange={v => updateKit(kit.id, "dobradicaMedida", v)} className="w-20" /></td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center"><EditableCell type="number" value={String(kit.qtdeLadosAduela)} onChange={v => updateKit(kit.id, "qtdeLadosAduela", v)} className="w-16 text-center" /></td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center"><EditableCell value={kit.montantesMedida} onChange={v => updateKit(kit.id, "montantesMedida", v)} className="w-16 text-center" /></td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center"><EditableCell value={kit.montantesFolgas} onChange={v => updateKit(kit.id, "montantesFolgas", v)} className="w-16 text-center" /></td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center"><EditableCell value={kit.bitsQtde} onChange={v => updateKit(kit.id, "bitsQtde", v)} className="w-16 text-center" /></td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center"><EditableCell value={kit.bitsFaces} onChange={v => updateKit(kit.id, "bitsFaces", v)} className="w-16 text-center" /></td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center"><EditableCell type="boolean" value={kit.camarao} onChange={v => updateKit(kit.id, "camarao", v)} /></td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center"><EditableCell type="boolean" value={kit.correr} onChange={v => updateKit(kit.id, "correr", v)} /></td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center"><EditableCell type="boolean" value={kit.pivotante} onChange={v => updateKit(kit.id, "pivotante", v)} /></td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center"><EditableCell type="boolean" value={kit.veneziana} onChange={v => updateKit(kit.id, "veneziana", v)} /></td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center"><EditableCell type="boolean" value={kit.grelha} onChange={v => updateKit(kit.id, "grelha", v)} /></td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center"><EditableCell type="boolean" value={kit.bandeira} onChange={v => updateKit(kit.id, "bandeira", v)} /></td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center"><EditableCell type="boolean" value={kit.chapa} onChange={v => updateKit(kit.id, "chapa", v)} /></td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center"><EditableCell type="boolean" value={kit.vidro} onChange={v => updateKit(kit.id, "vidro", v)} /></td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center"><EditableCell type="boolean" value={kit.fechaFresta} onChange={v => updateKit(kit.id, "fechaFresta", v)} /></td>
                        <td className="p-2 text-center border-r border-gray-200 dark:border-gray-700"><EditableObsCell value={kit.observacao || ""} onChange={v => updateKit(kit.id, "observacao", v)} /></td>
                     </tr>
                  ))}
                  {kits.length === 0 && (
                     <tr>
                        <td colSpan={38} className="p-8 text-center text-gray-500">
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
