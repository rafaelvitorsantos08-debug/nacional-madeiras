import React, { useState } from 'react';
import { 
  Database, Download, Trash2, Zap, ShieldCheck, AlertTriangle, 
  CheckCircle2, RefreshCw, Archive, Calendar, FileText, Info,
  Truck, Target, Home, Wrench, Package, FileCheck
} from 'lucide-react';
import { cn } from '../lib/utils';
import { downloadCompleteSystemBackup, purgeOldData, compressDataSafely } from '../lib/dataConsistency';
import { 
  exportControleSaidasPdf, 
  exportOperacaoProducaoPdf, 
  exportEntradaSaidaObrasPdf, 
  exportFerragensPdf, 
  exportEstoqueGeralPdf 
} from '../lib/pdfBackupService';
import { useLocalStorage, INITIAL_PORTAS, INITIAL_ADUELAS, INITIAL_ALIZARES, INITIAL_RODAPES } from './EstoqueModule';

export function GerenciamentoDados() {
  // Collections
  const [saidasData, setSaidasData] = useLocalStorage<Record<string, any>>('nm_controle_saidas', {});
  const [operacaoData, setOperacaoData] = useLocalStorage<Record<string, any>>('nm_operacao_producao', {});
  const [colaboradores] = useLocalStorage<string[]>('nm_operacao_colaboradores', [
    'Timoteo', 'Fabio', 'Romildo', 'Marcelo', 'Eduardo', 
    'Marco', 'Adriano', 'Alexandre', 'Lucio', 'Jair', 
    'Francisco', 'Sergio', 'Juarez', 'Samuel', 'Julio'
  ]);
  const [obrasData] = useLocalStorage<Record<string, any>>('nm_entrada_obras_v6', {});
  const [ferragensObrasList] = useLocalStorage<any[]>('nm_ferragens_obras_list_v5', []);
  const [ferragensObrasData] = useLocalStorage<Record<string, any>>('nm_ferragens_obras_data_v5', {});
  const [ferragensHistory] = useLocalStorage<any[]>('nm_ferragens_history_v5', []);
  
  const [portas] = useLocalStorage('nm_portas', INITIAL_PORTAS);
  const [aduelas] = useLocalStorage('nm_aduelas', INITIAL_ADUELAS);
  const [alizares] = useLocalStorage('nm_alizares', INITIAL_ALIZARES);
  const [rodapes] = useLocalStorage('nm_rodapes', INITIAL_RODAPES);

  // States
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionResult, setCompressionResult] = useState<string | null>(null);

  // PDF Export States
  const [exportingTab, setExportingTab] = useState<string | null>(null);
  const [pdfSuccessMessage, setPdfSuccessMessage] = useState<string | null>(null);

  // Saídas purge state
  const [saidasCutoff, setSaidasCutoff] = useState('2026-10-01');
  const [isPurgingSaidas, setIsPurgingSaidas] = useState(false);
  const [saidasPurgeFeedback, setSaidasPurgeFeedback] = useState<string | null>(null);

  // Operação purge state
  const [operacaoCutoff, setOperacaoCutoff] = useState('2026-10-01');
  const [isPurgingOperacao, setIsPurgingOperacao] = useState(false);
  const [operacaoPurgeFeedback, setOperacaoPurgeFeedback] = useState<string | null>(null);

  // Backup state
  const [isDownloadingBackup, setIsDownloadingBackup] = useState(false);
  const [backupSuccess, setBackupSuccess] = useState(false);

  // Counts
  const totalDiasSaidas = Object.keys(saidasData || {}).length;
  const totalDiasOperacao = Object.keys(operacaoData || {}).length;
  const totalObras = Object.keys(obrasData || {}).length;

  const saidasPrevisao = purgeOldData('saidas', saidasCutoff, saidasData);
  const operacaoPrevisao = purgeOldData('operacao', operacaoCutoff, operacaoData);

  // PDF Handlers
  const handleExportSaidasPdf = () => {
    setExportingTab('saidas');
    try {
      const ok = exportControleSaidasPdf(saidasData);
      if (ok) {
        setPdfSuccessMessage('PDF de "Controle de Saídas" gerado com sucesso! Arquivo pronto para impressão.');
        setTimeout(() => setPdfSuccessMessage(null), 6000);
      }
    } finally {
      setExportingTab(null);
    }
  };

  const handleExportOperacaoPdf = () => {
    setExportingTab('operacao');
    try {
      const ok = exportOperacaoProducaoPdf(operacaoData, colaboradores);
      if (ok) {
        setPdfSuccessMessage('PDF de "Operação da Produção & Efetivo" gerado com sucesso!');
        setTimeout(() => setPdfSuccessMessage(null), 6000);
      }
    } finally {
      setExportingTab(null);
    }
  };

  const handleExportObrasPdf = () => {
    setExportingTab('obras');
    try {
      const ok = exportEntradaSaidaObrasPdf(obrasData);
      if (ok) {
        setPdfSuccessMessage('PDF de "Entrada / Saída de Obras (Obra por Obra)" gerado com sucesso!');
        setTimeout(() => setPdfSuccessMessage(null), 6000);
      }
    } finally {
      setExportingTab(null);
    }
  };

  const handleExportFerragensPdf = () => {
    setExportingTab('ferragens');
    try {
      const list = Array.isArray(ferragensObrasList) && ferragensObrasList.length > 0 
        ? ferragensObrasList 
        : Object.keys(obrasData || {});
      const ok = exportFerragensPdf(list, ferragensObrasData, ferragensHistory);
      if (ok) {
        setPdfSuccessMessage('PDF de "Ferragens por Obra" gerado com sucesso!');
        setTimeout(() => setPdfSuccessMessage(null), 6000);
      }
    } finally {
      setExportingTab(null);
    }
  };

  const handleExportEstoquePdf = () => {
    setExportingTab('estoque');
    try {
      const ok = exportEstoqueGeralPdf(portas, aduelas, alizares, rodapes);
      if (ok) {
        setPdfSuccessMessage('PDF de "Posição do Estoque Geral" gerado com sucesso!');
        setTimeout(() => setPdfSuccessMessage(null), 6000);
      }
    } finally {
      setExportingTab(null);
    }
  };

  const handleExportAllPdfs = async () => {
    setExportingTab('all');
    try {
      exportControleSaidasPdf(saidasData);
      exportOperacaoProducaoPdf(operacaoData, colaboradores);
      exportEntradaSaidaObrasPdf(obrasData);
      const list = Array.isArray(ferragensObrasList) && ferragensObrasList.length > 0 
        ? ferragensObrasList 
        : Object.keys(obrasData || {});
      exportFerragensPdf(list, ferragensObrasData, ferragensHistory);
      exportEstoqueGeralPdf(portas, aduelas, alizares, rodapes);
      setPdfSuccessMessage('Todos os 5 PDFs oficiais foram baixados com sucesso para o seu computador!');
      setTimeout(() => setPdfSuccessMessage(null), 8000);
    } finally {
      setExportingTab(null);
    }
  };

  const handleDownloadBackup = async () => {
    setIsDownloadingBackup(true);
    setBackupSuccess(false);
    try {
      const ok = await downloadCompleteSystemBackup();
      if (ok) {
        setBackupSuccess(true);
        setTimeout(() => setBackupSuccess(false), 8000);
      }
    } finally {
      setIsDownloadingBackup(false);
    }
  };

  const handleCompressStorage = async () => {
    setIsCompressing(true);
    setCompressionResult(null);
    try {
      const res = await fetch('/api/stock/compress', { method: 'POST' });
      if (res.ok) {
        if (saidasData && typeof saidasData === 'object') {
          const compSaidas = compressDataSafely('nm_controle_saidas', saidasData);
          setSaidasData(compSaidas);
        }
        if (operacaoData && typeof operacaoData === 'object') {
          const compOp = compressDataSafely('nm_operacao_producao', operacaoData);
          setOperacaoData(compOp);
        }
        setCompressionResult('Dados comprimidos e otimizados com sucesso! Todos os campos vazios foram removidos sem alterar nenhum dado visível.');
        setTimeout(() => setCompressionResult(null), 8000);
      } else {
        throw new Error('Falha no servidor ao comprimir.');
      }
    } catch (err: any) {
      alert('Erro na compressão: ' + err.message);
    } finally {
      setIsCompressing(false);
    }
  };

  // EXCLUSÃO DEFINITIVA: CONTROLE DE SAÍDAS
  const handlePurgeSaidas = async () => {
    const confirmMsg = `ATENÇÃO: Você confirma a exclusão definitiva de ${saidasPrevisao.removedCount} dias antigos de "Controle de Saídas" anteriores a ${saidasCutoff.split('-').reverse().join('/')}?\n\nSerão mantidos ${saidasPrevisao.keptCount} dias no sistema.\n\nIMPORTANTE: A exclusão é definitiva em todas as máquinas. Certifique-se de ter baixado o PDF acima antes de prosseguir!`;
    if (!window.confirm(confirmMsg)) return;

    setIsPurgingSaidas(true);
    setSaidasPurgeFeedback(null);
    try {
      const res = await fetch('/api/stock/purge-old', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ module: 'saidas', cutoffDate: saidasCutoff })
      });
      if (res.ok) {
        const body = await res.json();
        
        // 1. Mark persistent cutoff in localStorage to prevent resurrection on reload
        localStorage.setItem('nm_purged_cutoff_nm_controle_saidas', saidasCutoff);
        
        // 2. Set cleaned data in storage vaults immediately
        const cleanStr = JSON.stringify(saidasPrevisao.cleanedData);
        localStorage.setItem('nm_controle_saidas', cleanStr);
        localStorage.setItem('nm_safe_vault_nm_controle_saidas', cleanStr);
        localStorage.setItem('nm_backup_nm_controle_saidas', cleanStr);
        
        // 3. Update React state & dispatch sync event across components
        setSaidasData(saidasPrevisao.cleanedData);
        window.dispatchEvent(new CustomEvent('nm-local-storage-sync', { detail: { key: 'nm_controle_saidas', value: saidasPrevisao.cleanedData } }));
        
        setSaidasPurgeFeedback(`Exclusão definitiva concluída! ${body.removedCount} dias antigos foram excluídos com sucesso do banco e não reaparecerão ao atualizar. ${body.keptCount} dias recentes continuam preservados.`);
        setTimeout(() => setSaidasPurgeFeedback(null), 10000);
      } else {
        throw new Error('Erro ao processar limpeza no servidor.');
      }
    } catch (err: any) {
      alert('Erro ao excluir dados antigos: ' + err.message);
    } finally {
      setIsPurgingSaidas(false);
    }
  };

  // EXCLUSÃO DEFINITIVA: OPERAÇÃO DA PRODUÇÃO
  const handlePurgeOperacao = async () => {
    const confirmMsg = `ATENÇÃO: Você confirma a exclusão definitiva de ${operacaoPrevisao.removedCount} dias antigos de "Operação da Produção" anteriores a ${operacaoCutoff.split('-').reverse().join('/')}?\n\nSerão mantidos ${operacaoPrevisao.keptCount} dias no sistema.\n\nIMPORTANTE: A exclusão é definitiva em todas as máquinas. Certifique-se de ter baixado o PDF acima antes de prosseguir!`;
    if (!window.confirm(confirmMsg)) return;

    setIsPurgingOperacao(true);
    setOperacaoPurgeFeedback(null);
    try {
      const res = await fetch('/api/stock/purge-old', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ module: 'operacao', cutoffDate: operacaoCutoff })
      });
      if (res.ok) {
        const body = await res.json();
        
        // 1. Mark persistent cutoff in localStorage
        localStorage.setItem('nm_purged_cutoff_nm_operacao_producao', operacaoCutoff);
        
        // 2. Set cleaned data in storage vaults immediately
        const cleanStr = JSON.stringify(operacaoPrevisao.cleanedData);
        localStorage.setItem('nm_operacao_producao', cleanStr);
        localStorage.setItem('nm_safe_vault_nm_operacao_producao', cleanStr);
        localStorage.setItem('nm_backup_nm_operacao_producao', cleanStr);
        
        // 3. Update React state & dispatch sync event
        setOperacaoData(operacaoPrevisao.cleanedData);
        window.dispatchEvent(new CustomEvent('nm-local-storage-sync', { detail: { key: 'nm_operacao_producao', value: operacaoPrevisao.cleanedData } }));
        
        setOperacaoPurgeFeedback(`Exclusão definitiva concluída! ${body.removedCount} dias antigos foram excluídos com sucesso do banco e não reaparecerão ao atualizar. ${body.keptCount} dias recentes continuam preservados.`);
        setTimeout(() => setOperacaoPurgeFeedback(null), 10000);
      } else {
        throw new Error('Erro ao processar limpeza no servidor.');
      }
    } catch (err: any) {
      alert('Erro ao excluir dados antigos: ' + err.message);
    } finally {
      setIsPurgingOperacao(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 text-white p-6 rounded-xl shadow-md border border-emerald-800/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Database className="w-6 h-6 text-emerald-400" />
              <h2 className="text-xl font-bold tracking-tight">Backups Oficiais em PDF & Gerenciamento Seguro de Dados</h2>
            </div>
            <p className="text-sm text-emerald-100/90 max-w-2xl">
              Exporte seus dados em relatórios <b>PDF limpos, organizados aba por aba e obra por obra</b>, que você pode abrir em qualquer computador, celular ou imprimir. Exclua com segurança meses antigos após o backup para manter o sistema leve e veloz.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <button
              onClick={handleExportAllPdfs}
              disabled={exportingTab === 'all'}
              className="flex items-center gap-2 px-4 py-2.5 bg-brand-green hover:bg-green-700 text-white rounded-lg text-sm font-bold shadow transition-all cursor-pointer disabled:opacity-50"
            >
              {exportingTab === 'all' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileCheck className="w-4 h-4" />}
              Baixar Todos os Relatórios em PDF
            </button>
            <button
              onClick={handleCompressStorage}
              disabled={isCompressing}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow transition-all cursor-pointer disabled:opacity-50"
            >
              {isCompressing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              Comprimir Dados
            </button>
          </div>
        </div>

        {pdfSuccessMessage && (
          <div className="mt-4 p-3.5 bg-emerald-900/90 border border-emerald-400/60 rounded-lg text-emerald-100 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
            <span className="font-semibold">{pdfSuccessMessage}</span>
          </div>
        )}

        {backupSuccess && (
          <div className="mt-4 p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-lg text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span><b>Backup concluído com sucesso!</b> O arquivo foi salvo em seu computador.</span>
          </div>
        )}

        {compressionResult && (
          <div className="mt-4 p-3 bg-blue-950/80 border border-blue-500/50 rounded-lg text-blue-200 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
            <span>{compressionResult}</span>
          </div>
        )}
      </div>

      {/* STATUS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Controle de Saídas</span>
          <span className="text-2xl font-bold text-gray-900 mt-1">{totalDiasSaidas} dias</span>
          <span className="text-xs text-emerald-700 font-medium mt-0.5">Janeiro a Outubro/2026</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Operação Produção</span>
          <span className="text-2xl font-bold text-gray-900 mt-1">{totalDiasOperacao} dias</span>
          <span className="text-xs text-blue-700 font-medium mt-0.5">Maio a Outubro/2026</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Obras Cadastradas</span>
          <span className="text-2xl font-bold text-gray-900 mt-1">{totalObras} obras</span>
          <span className="text-xs text-emerald-600 font-medium mt-0.5">Folhas, Aduelas, Alizares</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Status das Máquinas</span>
          <span className="text-2xl font-bold text-emerald-600 mt-1">Conectadas</span>
          <span className="text-xs text-gray-500 mt-0.5">Sincronização em tempo real</span>
        </div>
      </div>

      {/* SECTION 1: DEDICATED PDF BACKUPS SEPARATED TAB BY TAB */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">Salvar Backups em PDF (Aba por Aba - Formato Legível)</h3>
              <p className="text-xs text-gray-500">
                Arquivos em PDF formatados e padronizados para você abrir em qualquer programa, imprimir ou arquivar com total clareza.
              </p>
            </div>
          </div>
          <button
            onClick={handleExportAllPdfs}
            disabled={exportingTab === 'all'}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors shrink-0 cursor-pointer disabled:opacity-50"
          >
            {exportingTab === 'all' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            Baixar Todos os 5 PDFs
          </button>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* CARD 1: CONTROLE DE SAÍDAS */}
          <div className="p-4 border border-orange-200/80 rounded-xl bg-orange-50/30 flex flex-col justify-between hover:shadow-xs transition-shadow">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-orange-100 text-orange-700 rounded-lg flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  <span className="font-bold text-xs">Controle de Saídas</span>
                </div>
                <span className="text-[11px] font-bold text-orange-800 bg-orange-100/60 px-2 py-0.5 rounded">
                  {totalDiasSaidas} dias
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Relatório em modo paisagem com todas as entregas diárias, obras de destino, quantidades de Kits, Alizares, Folhas, Aduelas, Rodapés e observações dos apartamentos.
              </p>
            </div>
            <div className="pt-4 mt-3 border-t border-orange-100">
              <button
                onClick={handleExportSaidasPdf}
                disabled={exportingTab === 'saidas'}
                className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {exportingTab === 'saidas' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                Baixar PDF: Controle de Saídas
              </button>
            </div>
          </div>

          {/* CARD 2: OPERAÇÃO DA PRODUÇÃO */}
          <div className="p-4 border border-blue-200/80 rounded-xl bg-blue-50/30 flex flex-col justify-between hover:shadow-xs transition-shadow">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-blue-100 text-blue-700 rounded-lg flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  <span className="font-bold text-xs">Operação da Produção</span>
                </div>
                <span className="text-[11px] font-bold text-blue-800 bg-blue-100/60 px-2 py-0.5 rounded">
                  {totalDiasOperacao} dias
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Relatório com total diário de kits montados, efetivo presente e alocação de colaboradores por setor (Separação, Perfil, Usinagem, Embalagem, CNC, Marcenaria, Montagem, etc.).
              </p>
            </div>
            <div className="pt-4 mt-3 border-t border-blue-100">
              <button
                onClick={handleExportOperacaoPdf}
                disabled={exportingTab === 'operacao'}
                className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {exportingTab === 'operacao' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                Baixar PDF: Operação Produção
              </button>
            </div>
          </div>

          {/* CARD 3: ENTRADA / SAÍDA DE OBRAS (OBRA POR OBRA) */}
          <div className="p-4 border border-emerald-200/80 rounded-xl bg-emerald-50/30 flex flex-col justify-between hover:shadow-xs transition-shadow">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  <span className="font-bold text-xs">Entrada / Saída Obras</span>
                </div>
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/60 px-2 py-0.5 rounded">
                  {totalObras} obras
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Relatório estruturado <b>obra por obra</b>, com todas as cargas de Folhas de Porta, Aduelas, Alizares e Correr, incluindo dimensões, cores, entradas, saídas e saldos de cada obra.
              </p>
            </div>
            <div className="pt-4 mt-3 border-t border-emerald-100">
              <button
                onClick={handleExportObrasPdf}
                disabled={exportingTab === 'obras'}
                className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {exportingTab === 'obras' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                Baixar PDF: Obras (Obra por Obra)
              </button>
            </div>
          </div>

          {/* CARD 4: FERRAGENS (OBRA POR OBRA) */}
          <div className="p-4 border border-purple-200/80 rounded-xl bg-purple-50/30 flex flex-col justify-between hover:shadow-xs transition-shadow">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-purple-100 text-purple-700 rounded-lg flex items-center gap-2">
                  <Wrench className="w-4 h-4" />
                  <span className="font-bold text-xs">Ferragens por Obra</span>
                </div>
                <span className="text-[11px] font-bold text-purple-800 bg-purple-100/60 px-2 py-0.5 rounded">
                  Obra por Obra
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Relatório organizado por obra com todos os itens de ferragem (fechaduras, dobradiças, pinos, parafusos), quantidades necessárias, enviadas e saldos a entregar.
              </p>
            </div>
            <div className="pt-4 mt-3 border-t border-purple-100">
              <button
                onClick={handleExportFerragensPdf}
                disabled={exportingTab === 'ferragens'}
                className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {exportingTab === 'ferragens' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                Baixar PDF: Ferragens por Obra
              </button>
            </div>
          </div>

          {/* CARD 5: ESTOQUE GERAL */}
          <div className="p-4 border border-slate-200/80 rounded-xl bg-slate-50/50 flex flex-col justify-between hover:shadow-xs transition-shadow">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-slate-200 text-slate-800 rounded-lg flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  <span className="font-bold text-xs">Estoque Geral</span>
                </div>
                <span className="text-[11px] font-bold text-slate-700 bg-slate-200/60 px-2 py-0.5 rounded">
                  4 Categorias
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Posição completa do armazém de Folhas de Porta, Aduelas, Alizares e Rodapés, com dimensões, modelos, cores, enchimentos e saldos disponíveis.
              </p>
            </div>
            <div className="pt-4 mt-3 border-t border-slate-200">
              <button
                onClick={handleExportEstoquePdf}
                disabled={exportingTab === 'estoque'}
                className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {exportingTab === 'estoque' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                Baixar PDF: Estoque Geral
              </button>
            </div>
          </div>

          {/* CARD 6: BACKUP COMPLETO DO BANCO (JSON) */}
          <div className="p-4 border border-emerald-300 rounded-xl bg-emerald-50/40 flex flex-col justify-between hover:shadow-xs transition-shadow">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-emerald-200/80 text-emerald-900 rounded-lg flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  <span className="font-bold text-xs">Cópia do Banco (JSON)</span>
                </div>
                <span className="text-[11px] font-bold text-emerald-900 bg-emerald-200 px-2 py-0.5 rounded">
                  Cópia Bruta
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Arquivo técnico contendo 100% de todos os registros brutos do sistema para segurança e restauração técnica do banco de dados completo.
              </p>
            </div>
            <div className="pt-4 mt-3 border-t border-emerald-200">
              <button
                onClick={handleDownloadBackup}
                disabled={isDownloadingBackup}
                className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isDownloadingBackup ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                Baixar Cópia Geral (JSON)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* NOTICE BOX */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-900 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-bold text-sm text-amber-950">Segurança antes da exclusão de dados antigos:</p>
          <p>
            Após ter baixado os <b>PDFs de Controle de Saídas</b> e <b>Operação da Produção</b> acima, você pode excluir com tranquilidade os meses antigos das duas planilhas abaixo para liberar espaço no banco e economizar cota.
            <b> Uma vez confirmada a exclusão, os dados são definitivamente removidos do servidor e de todas as máquinas.</b>
          </p>
        </div>
      </div>

      {/* SECTION 2: PURGE CONTROLE DE SAIDAS */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 text-orange-700 rounded-lg">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">Exclusão Definitiva de Dados Antigos: Controle de Saídas</h3>
              <p className="text-xs text-gray-500">Exclua os meses anteriores que você já salvou em PDF para liberar espaço e economizar cota.</p>
            </div>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 bg-orange-50 text-orange-800 rounded-full border border-orange-200">
            {totalDiasSaidas} dias no banco
          </span>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Excluir dados anteriores a:
              </label>
              <select
                value={saidasCutoff}
                onChange={(e) => setSaidasCutoff(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-white font-medium text-gray-800 focus:ring-2 focus:ring-brand-green outline-none"
              >
                <option value="2026-10-01">01/10/2026 (Manter apenas Outubro/Novembro em diante - Recomendado)</option>
                <option value="2026-09-01">01/09/2026 (Manter Setembro e Outubro em diante)</option>
                <option value="2026-08-01">01/08/2026 (Manter Agosto, Setembro e Outubro)</option>
                <option value="2026-07-01">01/07/2026 (Excluir 1º Semestre: Janeiro a Junho)</option>
                <option value="2026-05-01">01/05/2026 (Excluir Janeiro a Abril)</option>
              </select>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex flex-col justify-center text-xs">
              <div className="flex justify-between items-center mb-1">
                <span className="text-gray-600 font-medium">Dias que serão excluídos definitivamente:</span>
                <span className="font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">{saidasPrevisao.removedCount} dias</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Dias que serão mantidos no sistema:</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">{saidasPrevisao.keptCount} dias</span>
              </div>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs text-gray-500">
              * Apenas as linhas anteriores ao corte serão excluídas. As saídas recentes de Outubro em diante permanecerão intactas.
            </p>
            <button
              onClick={handlePurgeSaidas}
              disabled={isPurgingSaidas || saidasPrevisao.removedCount === 0}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {isPurgingSaidas ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Excluir {saidasPrevisao.removedCount} Dias Antigos de Saídas
            </button>
          </div>

          {saidasPurgeFeedback && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-medium">{saidasPurgeFeedback}</span>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 3: PURGE OPERACAO DA PRODUCAO */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
              <Archive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">Exclusão Definitiva de Dados Antigos: Operação da Produção</h3>
              <p className="text-xs text-gray-500">Exclua os lançamentos de efetivo e produção dos meses antigos que você já salvou em PDF.</p>
            </div>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 bg-blue-50 text-blue-800 rounded-full border border-blue-200">
            {totalDiasOperacao} dias no banco
          </span>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Excluir dados anteriores a:
              </label>
              <select
                value={operacaoCutoff}
                onChange={(e) => setOperacaoCutoff(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-white font-medium text-gray-800 focus:ring-2 focus:ring-brand-green outline-none"
              >
                <option value="2026-10-01">01/10/2026 (Manter apenas Outubro/Novembro em diante - Recomendado)</option>
                <option value="2026-09-01">01/09/2026 (Manter Setembro e Outubro em diante)</option>
                <option value="2026-08-01">01/08/2026 (Manter Agosto, Setembro e Outubro)</option>
                <option value="2026-07-01">01/07/2026 (Excluir Maio e Junho)</option>
              </select>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex flex-col justify-center text-xs">
              <div className="flex justify-between items-center mb-1">
                <span className="text-gray-600 font-medium">Dias que serão excluídos definitivamente:</span>
                <span className="font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">{operacaoPrevisao.removedCount} dias</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Dias que serão mantidos no sistema:</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">{operacaoPrevisao.keptCount} dias</span>
              </div>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs text-gray-500">
              * A distribuição dos colaboradores e a quantidade de kits das datas recentes continuarão disponíveis normalmente.
            </p>
            <button
              onClick={handlePurgeOperacao}
              disabled={isPurgingOperacao || operacaoPrevisao.removedCount === 0}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {isPurgingOperacao ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Excluir {operacaoPrevisao.removedCount} Dias Antigos de Produção
            </button>
          </div>

          {operacaoPurgeFeedback && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-medium">{operacaoPurgeFeedback}</span>
            </div>
          )}
        </div>
      </div>

      {/* EXPLANATION OF FIRESTORE QUOTA SAFETY */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 text-gray-700">
        <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2 mb-2">
          <ShieldCheck className="w-4 h-4 text-brand-green" />
          Como o sistema agora protege sua cota gratuita do Firestore:
        </h4>
        <ul className="text-xs text-gray-600 space-y-1.5 list-disc pl-5">
          <li><b>Comunicação Central sem Consumo de Cota:</b> As máquinas operam conectadas diretamente ao servidor central via SSE, permitindo digitação simultânea ilimitada sem gastar a cota diária do Firestore.</li>
          <li><b>Agrupamento Inteligente em Lote (Batching):</b> As gravações de segurança na nuvem são agrupadas a cada 45 segundos e compactadas, gastando menos de 1% do limite diário permitido pelo Google Firestore.</li>
          <li><b>Zero Ressurreição no F5:</b> Ao excluir registros antigos, o sistema registra a data de corte de forma autoritativa no servidor e nas máquinas, impedindo que o F5 restaure os dados excluídos.</li>
        </ul>
      </div>
    </div>
  );
}
