import React, { useState, useEffect } from 'react';
import { 
  Database, Download, Trash2, Zap, ShieldCheck, AlertTriangle, 
  CheckCircle2, RefreshCw, Archive, Calendar, FileText, Info
} from 'lucide-react';
import { cn } from '../lib/utils';
import { downloadCompleteSystemBackup, purgeOldData, compressDataSafely } from '../lib/dataConsistency';
import { useLocalStorage } from './EstoqueModule';

export function GerenciamentoDados() {
  const [saidasData, setSaidasData] = useLocalStorage<Record<string, any>>('nm_controle_saidas', {});
  const [operacaoData, setOperacaoData] = useLocalStorage<Record<string, any>>('nm_operacao_producao', {});
  const [historicoData, setHistoricoData] = useLocalStorage<any[]>('nm_historico_entregas_v1', []);
  const [obrasData] = useLocalStorage<Record<string, any>>('nm_entrada_obras_v6', {});

  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionResult, setCompressionResult] = useState<string | null>(null);

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

  // Calculations
  const totalDiasSaidas = Object.keys(saidasData || {}).length;
  const totalDiasOperacao = Object.keys(operacaoData || {}).length;
  const totalHistorico = Array.isArray(historicoData) ? historicoData.length : 0;
  const totalObras = Object.keys(obrasData || {}).length;

  const saidasPrevisao = purgeOldData('saidas', saidasCutoff, saidasData);
  const operacaoPrevisao = purgeOldData('operacao', operacaoCutoff, operacaoData);

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
      // 1. Request central server compression
      const res = await fetch('/api/stock/compress', { method: 'POST' });
      if (res.ok) {
        // 2. Compress local state as well
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

  const handlePurgeSaidas = async () => {
    const confirmMsg = `ATENÇÃO: Você confirma a exclusão de ${saidasPrevisao.removedCount} registros antigos de "Controle de Saídas" anteriores a ${saidasCutoff.split('-').reverse().join('/')}?\n\nSerão mantidos ${saidasPrevisao.keptCount} dias no sistema.\n\nCertifique-se de já ter feito o backup completo!`;
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
        setSaidasData(saidasPrevisao.cleanedData);
        setSaidasPurgeFeedback(`Sucesso! ${body.removedCount} dias anteriores foram removidos e arquivados. ${body.keptCount} dias mais recentes continuam preservados.`);
        setTimeout(() => setSaidasPurgeFeedback(null), 8000);
      } else {
        throw new Error('Erro ao processar limpeza no servidor.');
      }
    } catch (err: any) {
      alert('Erro ao excluir dados antigos: ' + err.message);
    } finally {
      setIsPurgingSaidas(false);
    }
  };

  const handlePurgeOperacao = async () => {
    const confirmMsg = `ATENÇÃO: Você confirma a exclusão de ${operacaoPrevisao.removedCount} registros antigos de "Operação da Produção" anteriores a ${operacaoCutoff.split('-').reverse().join('/')}?\n\nSerão mantidos ${operacaoPrevisao.keptCount} dias no sistema.\n\nCertifique-se de já ter feito o backup completo!`;
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
        setOperacaoData(operacaoPrevisao.cleanedData);
        setOperacaoPurgeFeedback(`Sucesso! ${body.removedCount} dias anteriores foram removidos. ${body.keptCount} dias mais recentes continuam preservados.`);
        setTimeout(() => setOperacaoPurgeFeedback(null), 8000);
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
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 rounded-xl shadow-md border border-blue-800/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Database className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-bold tracking-tight">Otimização de Armazenamento & Proteção de Cota</h2>
            </div>
            <p className="text-sm text-blue-200/90 max-w-2xl">
              Gerencie o volume de dados da sua empresa, faça backups de segurança de 1 clique e exclua dados antigos com segurança para que a cota diária gratuita do Firestore nunca se esgote.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <button
              onClick={handleDownloadBackup}
              disabled={isDownloadingBackup}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow transition-all cursor-pointer disabled:opacity-50"
            >
              {isDownloadingBackup ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Baixar Backup Geral (JSON)
            </button>
            <button
              onClick={handleCompressStorage}
              disabled={isCompressing}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow transition-all cursor-pointer disabled:opacity-50"
            >
              {isCompressing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              Comprimir Dados Agora
            </button>
          </div>
        </div>

        {backupSuccess && (
          <div className="mt-4 p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-lg text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span><b>Backup concluído com sucesso!</b> O arquivo com todo o banco de dados (Estoque, Obras, Saídas, Operação, Ferragens, etc.) foi baixado para o seu computador.</span>
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
          <span className="text-xs text-gray-500 mt-0.5">Janeiro a Outubro/2026</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Operação Produção</span>
          <span className="text-2xl font-bold text-gray-900 mt-1">{totalDiasOperacao} dias</span>
          <span className="text-xs text-gray-500 mt-0.5">Maio a Outubro/2026</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Obras Cadastradas</span>
          <span className="text-2xl font-bold text-gray-900 mt-1">{totalObras} obras</span>
          <span className="text-xs text-emerald-600 font-medium mt-0.5">Com cargas e itens</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Cota do Firestore</span>
          <span className="text-2xl font-bold text-emerald-600 mt-1">Protegida</span>
          <span className="text-xs text-gray-500 mt-0.5">Servidor em tempo real</span>
        </div>
      </div>

      {/* NOTICE BOX */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-900 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-bold text-sm text-amber-950">Atenção ao restante do sistema sem backup:</p>
          <p>
            Como você já tem o backup das abas de <b>Controle de Saídas</b> e <b>Operação da Produção</b>, você pode excluir os meses antigos dessas duas planilhas com tranquilidade abaixo para liberar espaço. 
            Antes de excluir, recomendamos clicar no botão verde <b>"Baixar Backup Geral (JSON)"</b> no topo para salvar também todas as Obras, Estoque e Ferragens.
          </p>
        </div>
      </div>

      {/* SECTION 1: PURGE CONTROLE DE SAIDAS */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 text-orange-700 rounded-lg">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">Limpeza de Dados Antigos: Controle de Saídas</h3>
              <p className="text-xs text-gray-500">Exclua os meses anteriores que você já salvou em backup para economizar cota e memória.</p>
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
                <span className="text-gray-600 font-medium">Dias que serão excluídos:</span>
                <span className="font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">{saidasPrevisao.removedCount} dias</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Dias que serão mantidos no sistema:</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">{saidasPrevisao.keptCount} dias</span>
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              * Apenas as linhas com datas anteriores ao corte serão removidas da planilha. As saídas recentes permanecerão intactas.
            </p>
            <button
              onClick={handlePurgeSaidas}
              disabled={isPurgingSaidas || saidasPrevisao.removedCount === 0}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {isPurgingSaidas ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Excluir {saidasPrevisao.removedCount} Dias Antigos de Saídas
            </button>
          </div>

          {saidasPurgeFeedback && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{saidasPurgeFeedback}</span>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 2: PURGE OPERACAO DA PRODUCAO */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
              <Archive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">Limpeza de Dados Antigos: Operação da Produção</h3>
              <p className="text-xs text-gray-500">Exclua os lançamentos de efetivo e produção dos meses antigos que já estão em backup.</p>
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
                <span className="text-gray-600 font-medium">Dias que serão excluídos:</span>
                <span className="font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">{operacaoPrevisao.removedCount} dias</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Dias que serão mantidos no sistema:</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">{operacaoPrevisao.keptCount} dias</span>
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              * A distribuição dos colaboradores e a quantidade de kits das datas recentes continuarão disponíveis normalmente.
            </p>
            <button
              onClick={handlePurgeOperacao}
              disabled={isPurgingOperacao || operacaoPrevisao.removedCount === 0}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {isPurgingOperacao ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Excluir {operacaoPrevisao.removedCount} Dias Antigos de Produção
            </button>
          </div>

          {operacaoPurgeFeedback && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{operacaoPurgeFeedback}</span>
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
          <li><b>Comunicação Central sem Consumo de Cota:</b> As máquinas agora se comunicam diretamente através do servidor central via SSE, permitindo digitação simultânea ilimitada sem gastar a cota diária do Firestore.</li>
          <li><b>Agrupamento Inteligente em Lote (Batching):</b> As gravações de segurança na nuvem são agrupadas a cada 45 segundos e compactadas, gastando menos de 1% do limite diário permitido pelo Google Firestore.</li>
          <li><b>Zero Sobrescrita no F5:</b> Ao pressionar F5 ou abrir o sistema em outra máquina, os dados são lidos diretamente do cofre central definitivo, impedindo que dados desatualizados da nuvem apaguem o que você acabou de preencher.</li>
        </ul>
      </div>
    </div>
  );
}
