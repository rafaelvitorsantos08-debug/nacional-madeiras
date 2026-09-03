import React, { useState } from 'react';
import { useLocalStorage } from './EstoqueModule';
import { FileText, Trash2, RotateCcw, Calendar, User, MapPin } from 'lucide-react';

export interface HistoricoEntrega {
  id: string;
  dataEntrega: string;
  responsavel: string;
  obra: string;
  blocos: string[];
  kits: any[];
}

export function HistoricoModule() {
  const [historico, setHistorico] = useLocalStorage<HistoricoEntrega[]>('nm_historico_entregas_v1', []);
  const [kitsAtuais, setKitsAtuais] = useLocalStorage<any[]>('nacional_madeiras_kits_v6', []);

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este histórico permanentemente?')) {
      setHistorico(prev => prev.filter(h => h.id !== id));
    }
  };

  const handleRestore = (entrega: HistoricoEntrega) => {
    if (window.confirm('Deseja restaurar estes kits para a planilha ativa? Isso os removerá do histórico.')) {
      setKitsAtuais(prev => [...prev, ...entrega.kits]);
      setHistorico(prev => prev.filter(h => h.id !== entrega.id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Histórico de Entregas</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Aqui ficam registradas as entregas já finalizadas. Estes itens não pesam mais na planilha principal.
        </p>

        {historico.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            Nenhum histórico de entrega registrado ainda.
          </div>
        ) : (
          <div className="space-y-4">
            {historico.sort((a, b) => new Date(b.dataEntrega).getTime() - new Date(a.dataEntrega).getTime()).map(entrega => (
              <div key={entrega.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-gray-900 dark:text-white font-bold">
                      <Calendar className="w-4 h-4 text-indigo-500" />
                      {new Date(entrega.dataEntrega).toLocaleString('pt-BR')}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                      <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {entrega.obra || 'Obra não informada'}</span>
                      <span className="flex items-center gap-1"><User className="w-4 h-4" /> {entrega.responsavel || 'Responsável não informado'}</span>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">Blocos: </span> 
                      {entrega.blocos.join(', ') || 'Sem bloco'}
                    </div>
                    <div className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                      {entrega.kits.length} Kits Entregues
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRestore(entrega)}
                      className="p-2 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-md transition-colors"
                      title="Restaurar para a planilha ativa"
                    >
                      <RotateCcw className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(entrega.id)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                      title="Excluir Histórico"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
