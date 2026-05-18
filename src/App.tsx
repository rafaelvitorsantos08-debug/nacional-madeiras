import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { 
  Search, Bell, Menu, 
  Package, ArrowDownToLine, ArrowUpFromLine, AlertTriangle,
  LayoutDashboard, Box, FileText, Settings, LogOut, ChevronRight, X, Home, HardHat, Download, Printer, Wrench
} from 'lucide-react';
import { cn } from './lib/utils';
import { EstoqueModule, INITIAL_PORTAS, INITIAL_ADUELAS, INITIAL_ALIZARES, useLocalStorage } from './components/EstoqueModule';
import { ControleOperacaoModule } from './components/ControleOperacaoModule';
import { FerragensModule } from './components/FerragensModule';
import { RelatoriosModule } from './components/RelatoriosModule';

// --- MOCK DATA ---
const CHART_DATA = [
  { name: 'Jan', entradas: 400, saidas: 240 },
  { name: 'Fev', entradas: 300, saidas: 139 },
  { name: 'Mar', entradas: 800, saidas: 980 },
  { name: 'Abr', entradas: 650, saidas: 390 },
  { name: 'Mai', entradas: 780, saidas: 640 },
];

const ULTIMAS_ENTRADAS = [
  { id: 1, item: 'Kit Porta Interna Pinho', data: '12/05/2026', qtd: 50, fornecedor: 'Madeireira ABC' },
  { id: 2, item: 'Kit Porta Lisa Jequitibá', data: '11/05/2026', qtd: 120, fornecedor: 'Sul Madeiras' },
  { id: 3, item: 'Aduela Eucalipto 15cm', data: '10/05/2026', qtd: 200, fornecedor: 'Madeireira XYZ' },
];

const ULTIMAS_SAIDAS = [
  { id: 1, item: 'Kit Porta Externa Angelim', data: '12/05/2026', qtd: 15, destino: 'Obra Central' },
  { id: 2, item: 'Kit Porta Interna Pinho', data: '10/05/2026', qtd: 30, destino: 'Revenda XPTO' },
  { id: 3, item: 'Caixa de Dobradiça', data: '09/05/2026', qtd: 250, destino: 'Loja Varejo 2' },
];



import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, loginWithGoogle, logout } from './lib/firebase';
import { forceSyncAllToCloud } from './components/EstoqueModule';

// Create a backup of local storage to prevent data loss when syncing
if (typeof window !== 'undefined') {
  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i);
    if (key && key.startsWith('nm_') && !key.startsWith('nm_backup_') && !key.startsWith('nm_active_') && key !== 'nm_dark_mode') {
       const val = window.localStorage.getItem(key);
       if (val) {
         window.localStorage.setItem('nm_backup_' + key, val);
       }
    }
  }
}

export default function App() {
  const [user] = useAuthState(auth);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useLocalStorage('nm_active_tab', 'dashboard');
  const [activeControleTab, setActiveControleTab] = useLocalStorage<'entradas' | 'saidas' | 'operacao'>('nm_active_controle_tab', 'saidas');
  const [globalSearch, setGlobalSearch] = useState('');
  const [activeControleMonth, setActiveControleMonth] = useState(new Date().getMonth());
  const [activeLogTab, setActiveLogTab] = useLocalStorage<'entradas' | 'saidas'>('nm_active_log_tab', 'entradas');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };
  
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nm_dark_mode');
      if (saved) return saved === 'true';
    }
    return false;
  });

  const [portas] = useLocalStorage('nm_portas', INITIAL_PORTAS);
  const [aduelas] = useLocalStorage('nm_aduelas', INITIAL_ADUELAS);
  const [alizares] = useLocalStorage('nm_alizares', INITIAL_ALIZARES);
  
  // Registering these hooks at the root so Firebase onSnapshot runs in the background and updates the Dashboard live
  useLocalStorage('nm_controle_saidas', {});
  useLocalStorage('nm_operacao_producao', {});
  useLocalStorage('nm_entrada_obras_v4', {});
  useLocalStorage('nm_operacao_efetivo_total', {});
  useLocalStorage('nm_ferragens_obras_list_v5', []);
  useLocalStorage('nm_ferragens_obras_data_v5', {});
  useLocalStorage('nm_ferragens_history_v5', []);

  const inventoryReal = [
    ...(Array.isArray(portas) ? portas : []).map((p: any) => ({
      id: p.id,
      item: `Folha de Porta ${p.modelo || ''}`.trim(),
      dimensoes: p.dimensao,
      material: p.cor,
      espessura: '-',
      estoque: p.estoque,
      status: p.status,
    })),
    ...(Array.isArray(aduelas) ? aduelas : []).map((a: any) => ({
      id: a.id,
      item: 'Aduela',
      dimensoes: `${a.largura}x${a.comprimento}`,
      material: a.cor,
      espessura: '-',
      estoque: a.estoque,
      status: a.status,
    })),
    ...(Array.isArray(alizares) ? alizares : []).map((a: any) => ({
      id: a.id,
      item: `Alizar (F:${a.face} A:${a.aba} C:${a.comprimento || '-'})`,
      dimensoes: '-',
      material: a.cor,
      espessura: a.espessura,
      estoque: a.estoque,
      status: a.status,
    })),
  ].sort((a, b) => {
     // Optional: Sort by critical/low stock first, then by ID. Or just keep order.
     const statusPriority: Record<string, number> = { 'Crítico': 1, 'Baixo': 2, 'Atenção': 3, 'OK': 4 };
     const statA = statusPriority[a.status] || 99;
     const statB = statusPriority[b.status] || 99;
     return statA - statB;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('nm_dark_mode', isDarkMode.toString());

    // Fix for printing in dark mode: momentarily switch to light mode
    const handleBeforePrint = () => {
      document.documentElement.classList.remove('dark');
    };
    const handleAfterPrint = () => {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      }
    };

    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);

    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, [isDarkMode]);

  const [dashboardStats, setDashboardStats] = useState({
    totalEstoque: 0,
    alertaBaixoEstoque: 0,
    totalControleSaidasKits: 0,
    totalOperacaoKits: 0,
    totalEntradaObras: 0,
  });

  const [chartData, setChartData] = useState(CHART_DATA);
  const [recentLogs, setRecentLogs] = useState<{entradas: any[], saidas: any[]}>({entradas: [], saidas: []});

  useEffect(() => {
    const calculateStats = () => {
      try {
        const getLs = (key: string, init: any) => {
          const item = window.localStorage.getItem(key);
          return item ? JSON.parse(item) : init;
        };

        const portasLs = getLs('nm_portas', INITIAL_PORTAS);
        const aduelasLs = getLs('nm_aduelas', INITIAL_ADUELAS);
        const alizaresLs = getLs('nm_alizares', INITIAL_ALIZARES);

        let totalEst = 0;
        let alertas = 0;
        
        [...(Array.isArray(portasLs) ? portasLs : []), ...(Array.isArray(aduelasLs) ? aduelasLs : []), ...(Array.isArray(alizaresLs) ? alizaresLs : [])].forEach((item: any) => {
           const qty = typeof item.estoque === 'number' ? item.estoque : parseInt(item.estoque) || 0;
           totalEst += qty;
           if (item.status === 'Crítico') alertas++;
        });

        const saidas = getLs('nm_controle_saidas', {});
        let countSaidas = 0;
        const currentMonthIndex = new Date().getMonth();
        const currentYearStats = new Date().getFullYear();

        Object.keys(saidas || {}).forEach(dateStr => {
          const parts = dateStr.split('-');
          if (parts.length === 3) {
            const m = parseInt(parts[1]) - 1;
            const y = parseInt(parts[0]);
            if (m === currentMonthIndex && y === currentYearStats) {
              const row = saidas[dateStr];
              countSaidas += (parseInt(row.e1_kits) || 0) + (parseInt(row.e2_kits) || 0);
            }
          }
        });

        const operacao = getLs('nm_operacao_producao', {});
        let countOp = 0;
        Object.keys(operacao || {}).forEach(dateStr => {
          const parts = dateStr.split('-');
          if (parts.length === 3) {
            const m = parseInt(parts[1]) - 1;
            const y = parseInt(parts[0]);
            if (m === currentMonthIndex && y === currentYearStats) {
              const row = operacao[dateStr];
              countOp += (parseInt(row.quantidade) || 0);
            }
          }
        });

        const obrasObj = getLs('nm_entrada_obras_v4', {});
        let countObras = 0;
        Object.values(obrasObj || {}).forEach((o: any) => {
          const itens = o?.itens || [];
          itens.forEach((i: any) => {
            countObras += (parseInt(i.folhas) || 0) + (parseInt(i.aduelas) || 0) + (parseInt(i.alizares) || 0);
          });
        });

        setDashboardStats({
          totalEstoque: totalEst,
          alertaBaixoEstoque: alertas,
          totalControleSaidasKits: countSaidas,
          totalOperacaoKits: countOp,
          totalEntradaObras: countObras
        });

        const mesesAbbr = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const currentYear = new Date().getFullYear();
        
        const newChartData = mesesAbbr.map(mes => ({ name: mes, entradas: 0, saidas: 0 }));

        Object.values(obrasObj || {}).forEach((o: any) => {
           if (!o?.data) return;
           const d = new Date(o.data);
           if (d.getFullYear() === currentYear) {
             let folhasTotal = 0;
             (o.itens || []).forEach((i: any) => {
               folhasTotal += (parseInt(i.folhas) || 0);
             });
             newChartData[d.getMonth()].entradas += folhasTotal;
           }
        });

        Object.keys(saidas || {}).forEach(dateStr => { 
           const parts = dateStr.split('-');
           if (parts.length === 3) {
              const m = parseInt(parts[1]) - 1;
              const y = parseInt(parts[0]);
              if (y === currentYear && m >= 0 && m < 12) {
                 const row = saidas[dateStr];
                 const total = (parseInt(row?.e1_kits) || 0) + (parseInt(row?.e2_kits) || 0);
                 newChartData[m].saidas += total;
              }
           }
        });

        const currentMonth = new Date().getMonth();
        setChartData(newChartData.slice(0, currentMonth + 1));

        const eLogs: any[] = [];
        const sLogs: any[] = [];

        Object.values(obrasObj || {}).forEach((o: any) => {
          let itemsCount = 0;
          (o?.itens || []).forEach((i: any) => {
            itemsCount += (parseInt(i.folhas) || 0) + (parseInt(i.aduelas) || 0) + (parseInt(i.alizares) || 0);
          });
          if (itemsCount > 0 && o?.data) {
            eLogs.push({
              id: o.id,
              timestamp: new Date(o.data).getTime(),
              item: `Materiais Recebidos`,
              data: new Date(o.data).toLocaleDateString('pt-BR'),
              qtd: itemsCount,
              fornecedor: o.nome
            })
          }
        });

        Object.keys(saidas || {}).forEach(dateStr => {
          const row = saidas[dateStr];
          if (!row) return;
          let total = (parseInt(row.e1_kits) || 0) + (parseInt(row.e1_alizares) || 0) + (parseInt(row.e1_folhas) || 0);
          if (total > 0) {
             sLogs.push({
               id: dateStr + '-1',
               timestamp: new Date(dateStr + 'T12:00:00Z').getTime(), 
               item: 'Materiais Enviados',
               data: dateStr.split('-').reverse().join('/'),
               qtd: total,
               fornecedor: row.e1_desc || 'Obra'
             })
          }
          let total2 = (parseInt(row.e2_kits) || 0) + (parseInt(row.e2_alizares) || 0) + (parseInt(row.e2_folhas) || 0);
          if (total2 > 0) {
             sLogs.push({
               id: dateStr + '-2',
               timestamp: new Date(dateStr + 'T12:00:00Z').getTime(),
               item: 'Materiais Enviados',
               data: dateStr.split('-').reverse().join('/'),
               qtd: total2,
               fornecedor: row.e2_desc || 'Obra'
             })
          }
        });

        setRecentLogs({
          entradas: eLogs.sort((a,b) => b.timestamp - a.timestamp).slice(0, 10),
          saidas: sLogs.sort((a,b) => b.timestamp - a.timestamp).slice(0, 10),
        });

      } catch (e) {
        console.error(e);
      }
    };
    
    calculateStats();
    window.addEventListener('local-storage-sync', calculateStats);
    return () => window.removeEventListener('local-storage-sync', calculateStats);
  }, [activeTab]); // re-calculate when switching tabs


  const exportToJSON = () => {
    const data: Record<string, any> = {};
    for (let i = 0; i < window.localStorage.length; i++) {
       const key = window.localStorage.key(i);
       if (key && key.startsWith('nm_')) {
          try {
             data[key] = JSON.parse(window.localStorage.getItem(key) || 'null');
          } catch (e) {
             data[key] = window.localStorage.getItem(key);
          }
       }
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nacional_madeiras_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importFromJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const data = JSON.parse(evt.target?.result as string);
        for (const key of Object.keys(data)) {
          if (key.startsWith('nm_')) {
            window.localStorage.setItem(key, typeof data[key] === 'string' ? data[key] : JSON.stringify(data[key]));
          }
        }
        window.dispatchEvent(new Event('local-storage-sync'));
        
        if (auth.currentUser) {
           await forceSyncAllToCloud();
        } else {
           alert('Dados importados com sucesso!');
        }
        window.location.reload();
      } catch (err) {
        alert('Erro ao importar arquivo. Verifique se o formato é válido.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">
      
      {/* SIDEBAR */}
      <aside className={cn(
        "bg-white border-r border-gray-200 transition-all duration-300 flex-shrink-0 z-20 print:hidden",
        sidebarOpen ? "w-64" : "w-20"
      )}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
           {sidebarOpen ? (
              <div className="flex flex-col">
                <span className="font-bold text-brand-green text-sm leading-tight uppercase">Nacional Madeiras</span>
                <span className="font-bold text-gray-500 text-xs tracking-widest uppercase">Kit Porta</span>
              </div>
           ) : (
             <img src="/logo.svg" className="w-8 h-8 mx-auto" alt="Logo NM" />
           )}
           <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-gray-600 focus:outline-none hidden md:block">
             <Menu className="w-5 h-5" />
           </button>
        </div>
        <nav className="p-4 space-y-1">
          <NavItem icon={<LayoutDashboard />} label="Dashboard" active={activeTab === 'dashboard'} isOpen={sidebarOpen} onClick={() => setActiveTab('dashboard')} />
          <NavItem icon={<Package />} label="Estoque" active={activeTab === 'estoque'} isOpen={sidebarOpen} onClick={() => setActiveTab('estoque')} />
          <NavItem icon={<Wrench />} label="Ferragens" active={activeTab === 'ferragens'} isOpen={sidebarOpen} onClick={() => setActiveTab('ferragens')} />
          <NavItem icon={<Box />} label="Controle x Operação" active={activeTab === 'controle_operacao'} isOpen={sidebarOpen} onClick={() => setActiveTab('controle_operacao')} />
          <NavItem icon={<FileText />} label="Relatórios" active={activeTab === 'relatorios'} isOpen={sidebarOpen} onClick={() => setActiveTab('relatorios')} />
          
          <div className="pt-4 mt-2 mb-2 border-t border-gray-100"></div>
          <NavItem icon={<Settings />} label="Configurações" active={activeTab === 'configuracoes'} isOpen={sidebarOpen} onClick={() => setActiveTab('configuracoes')} />
          {user && (
            <NavItem icon={<LogOut />} label="Sair" isOpen={sidebarOpen} onClick={logout} className="text-red-500 hover:bg-red-50 hover:text-red-600" />
          )}
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* HEADER */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-10 print:hidden">
          <div className="flex md:hidden items-center">
             <button onClick={() => setSidebarOpen(!sidebarOpen)} className="mr-4 text-gray-500">
               <Menu className="w-6 h-6" />
             </button>
             <div className="flex flex-col">
                <span className="font-bold text-brand-green text-sm leading-tight uppercase">Nacional Madeiras</span>
              </div>
          </div>

          <div className="hidden md:flex items-center flex-1 max-w-md">
            <div className="relative w-full">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="w-4 h-4 text-gray-400" />
              </span>
              <input 
                type="text" 
                placeholder="Buscar produtos, datas ou códigos..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-100 border-transparent rounded-lg text-sm focus:border-brand-green focus:bg-white focus:ring-2 focus:ring-brand-green/20 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button onClick={() => window.print()} className="flex items-center space-x-2 text-gray-500 hover:text-brand-green hover:bg-green-50 px-3 py-2 rounded-lg transition-colors font-medium">
              <Printer className="w-5 h-5" />
              <span className="hidden md:inline-block">Imprimir</span>
            </button>
            <button className="relative p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
            </button>
            {user ? (
              <div className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-gray-100 rounded-lg transition-colors">
                {user.photoURL ? (
                   <img src={user.photoURL} alt="User" className="w-8 h-8 rounded-full border border-gray-200" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green font-semibold border border-brand-green/20">
                    {user.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <div className="hidden md:block text-sm text-left">
                  <p className="font-medium text-gray-700 leading-none">{user.displayName || 'Usuário'}</p>
                  <p className="text-xs text-gray-500 mt-1">Conectado e Sincronizado</p>
                </div>
              </div>
            ) : (
              <button 
                onClick={loginWithGoogle}
                className="px-4 py-2 bg-brand-green hover:bg-green-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
                title="Faça login para sincronizar seus dados na nuvem"
              >
                Fazer Login
              </button>
            )}
          </div>
        </header>

        {/* DASHBOARD CONTENT */}
        <div className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          
          {!user && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-4 animate-in fade-in">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0 mt-0.5">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900">Sincronização em Tempo Real (Múltiplas Máquinas)</h3>
                <p className="text-sm text-blue-800 mt-1">
                  Seus dados estão salvos apenas neste dispositivo. Para acessar de <b>outra máquina ou celular</b> em tempo real:
                </p>
                <ol className="list-decimal pl-5 mt-2 text-sm text-blue-800 space-y-1">
                  <li>Nesta máquina (onde os dados estão certos), clique em <b>Fazer Login</b> e entre com a sua conta Google.</li>
                  <li>Na outra máquina, acesse o aplicativo, clique em <b>Fazer Login</b> e entre com a <b>mesma conta</b>. Todos os dados aparecerão como aqui!</li>
                </ol>
              </div>
            </div>
          )}

          {/* PRINT ONLY HEADER */}
          <div className="hidden print:flex mb-8 items-center border-b border-gray-300 pb-4">
             <div className="flex flex-col">
               <span className="font-bold text-brand-green text-2xl leading-tight uppercase">Nacional Madeiras</span>
               <span className="font-bold text-gray-500 text-sm tracking-widest uppercase mt-1">Kit Porta</span>
             </div>
          </div>

          {activeTab === 'dashboard' && (
            <div className="animate-in fade-in duration-300">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Visão Geral do Estoque</h1>
              <p className="text-sm text-gray-500 mt-1">Acompanhe as movimentações e o saldo atual.</p>
            </div>
            <div className="flex space-x-3 w-full md:w-auto">
               {deferredPrompt && (
                 <button onClick={handleInstallClick} className="flex-1 md:flex-none flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 rounded-lg text-white text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm shadow-blue-600/30">
                   <Download className="w-4 h-4" />
                   <span>Instalar App</span>
                 </button>
               )}
               <button onClick={() => { setActiveTab('controle_operacao'); setActiveControleTab('saidas'); }} className="flex-1 md:flex-none flex items-center justify-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">
                 <ArrowUpFromLine className="w-4 h-4 text-red-500" />
                 <span>Registrar Saída</span>
               </button>
               <button onClick={() => { setActiveTab('controle_operacao'); setActiveControleTab('entradas'); }} className="flex-1 md:flex-none flex items-center justify-center space-x-2 px-4 py-2 bg-brand-green rounded-lg text-white text-sm font-medium hover:bg-brand-green-dark transition-colors shadow-sm shadow-brand-green/30">
                 <ArrowDownToLine className="w-4 h-4" />
                 <span>Registrar Entrada</span>
               </button>
            </div>
          </div>

          {/* KPI CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            <KpiCard 
              title="Total em Estoque" 
              value={dashboardStats.totalEstoque.toLocaleString('pt-BR')} 
              icon={<Package className="text-blue-500" />} 
              subtitle="peças"
              bgColor="bg-blue-50"
            />
            <KpiCard 
              title="Kits em Obras" 
              value={dashboardStats.totalControleSaidasKits.toLocaleString('pt-BR')} 
              subtitle="kits no mês atual"
              icon={<Home className="text-brand-green" />} 
              bgColor="bg-green-50"
              trend="up"
              goalTarget={2000}
              goalLabel="Meta do Mês"
              goalRemainingLabel="para a meta"
            />
            <KpiCard 
              title="Produção" 
              value={dashboardStats.totalOperacaoKits.toLocaleString('pt-BR')} 
              subtitle="kits montados"
              icon={<HardHat className="text-amber-500" />} 
              bgColor="bg-amber-50"
              trend="neutral"
            />
            <KpiCard 
              title="Alertas de Baixo Estoque" 
              value={dashboardStats.alertaBaixoEstoque} 
              subtitle="itens críticos"
              icon={<AlertTriangle className="text-red-500" />} 
              bgColor="bg-red-50"
              alert
            />
          </div>

          {/* MAIN CHARTS & LISTS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* CHART */}
            <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h2 className="text-md font-semibold text-gray-800 mb-6">Tendência de Movimentação</h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
                    <Tooltip 
                      cursor={{fill: '#F3F4F6'}}
                      contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                    />
                    <Legend iconType="circle" wrapperStyle={{fontSize: '12px', paddingTop: '20px'}} />
                    <Bar dataKey="entradas" name="Entrada de Obra (Kits)" fill="var(--color-brand-green)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    <Bar dataKey="saidas" name="Saída (Kits)" fill="#9CA3AF" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* LOGS */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
               <div className="border-b border-gray-100">
                  <div className="flex">
                    <button 
                      onClick={() => setActiveLogTab('entradas')}
                      className={cn("flex-1 py-3 text-sm font-medium uppercase tracking-wide transition-colors outline-none", activeLogTab === 'entradas' ? "text-brand-green border-b-2 border-brand-green" : "text-gray-400 hover:text-gray-600")}
                    >Últimas Entradas</button>
                    <button 
                      onClick={() => setActiveLogTab('saidas')}
                      className={cn("flex-1 py-3 text-sm font-medium uppercase tracking-wide transition-colors outline-none", activeLogTab === 'saidas' ? "text-brand-green border-b-2 border-brand-green" : "text-gray-400 hover:text-gray-600")}
                    >Últimas Saídas</button>
                  </div>
               </div>
               <div className="flex-1 overflow-auto p-2">
                 <ul className="divide-y divide-gray-50">
                    {recentLogs[activeLogTab].filter(log => !globalSearch || (log.item + ' ' + log.fornecedor + ' ' + log.data).toLowerCase().includes(globalSearch.toLowerCase())).length === 0 ? (
                      <li className="p-4 text-center text-gray-400 text-sm">Nenhum registro encontrado.</li>
                    ) : recentLogs[activeLogTab].filter(log => !globalSearch || (log.item + ' ' + log.fornecedor + ' ' + log.data).toLowerCase().includes(globalSearch.toLowerCase())).map((log) => (
                      <li key={log.id} className="p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer group">
                        <div className="flex justify-between items-start mb-1">
                           <span className="font-medium text-sm text-gray-800 line-clamp-1 pr-2">{log.item}</span>
                           <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap", activeLogTab === 'entradas' ? "text-brand-green bg-brand-green/10" : "text-amber-600 bg-amber-50")}>
                             {activeLogTab === 'entradas' ? '+' : '-'}{log.qtd}
                           </span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-gray-500">
                           <span className="flex items-center"><Box className="w-3 h-3 mr-1"/> {log.fornecedor}</span>
                           <span>{log.data}</span>
                        </div>
                       </li>
                    ))}
                 </ul>
               </div>
               <div className="p-3 border-t border-gray-100 text-center">
                 <button onClick={() => { 
                   setActiveControleTab(activeLogTab === 'entradas' ? 'entradas' : 'saidas'); 
                   const topItem = recentLogs[activeLogTab]?.[0];
                   if (topItem) {
                     // Get UTC month from timestamp (since we construct YYYY-MM-DDT...Z for some)
                     // or just Date parsing. Actually topItem.data is "DD/MM/YYYY".
                     const parts = topItem.data.split('/');
                     if(parts.length === 3) setActiveControleMonth(parseInt(parts[1], 10) - 1);
                   }
                   setActiveTab('controle_operacao'); 
                 }} className="text-sm font-medium text-brand-green hover:underline">Ir para a página de registros</button>
               </div>
            </div>
          </div>

          {/* INVENTORY TABLE */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-8">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
               <div>
                  <h2 className="text-md font-semibold text-gray-800">Inventário de Kits e Detalhes de Dimensões</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Visão detalhada do estoque por especificação técnica</p>
               </div>
               <button className="text-gray-400 hover:text-gray-600"><Settings className="w-5 h-5"/></button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                  <tr className="bg-gray-50/80 text-gray-500 border-b border-gray-200">
                    <th className="px-6 py-3 font-medium rounded-tl-lg">Item</th>
                    <th className="px-6 py-3 font-medium">Dimensões (LxH cm)</th>
                    <th className="px-6 py-3 font-medium">Material</th>
                    <th className="px-6 py-3 font-medium text-center">Espessura</th>
                    <th className="px-6 py-3 font-medium text-right">Estoque Atual</th>
                    <th className="px-6 py-3 font-medium text-center">Status</th>
                    <th className="px-6 py-3 font-medium rounded-tr-lg w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {inventoryReal.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                           <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                              {/* Placeholder for real image */}
                              <Box className="w-5 h-5 text-gray-400" />
                           </div>
                           <div>
                             <p className="font-medium text-gray-800">{item.item}</p>
                             <p className="text-xs text-gray-400">cód: {item.id}</p>
                           </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-gray-600 bg-gray-50/30">{item.dimensoes}</td>
                      <td className="px-6 py-4 text-gray-600">{item.material}</td>
                      <td className="px-6 py-4 text-center text-gray-600">
                        {item.espessura !== '-' ? `${item.espessura}mm` : item.espessura}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-gray-900">{item.estoque.toLocaleString()}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={cn(
                          "inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border",
                          item.status === 'OK' && "bg-green-50 text-brand-green border-green-200",
                          item.status === 'Baixo' && "bg-yellow-50 text-yellow-700 border-yellow-200",
                          item.status === 'Atenção' && "bg-orange-50 text-orange-700 border-orange-200",
                          item.status === 'Crítico' && "bg-red-50 text-red-700 border-red-200"
                        )}>
                          {item.status === 'OK' && <span className="w-1.5 h-1.5 rounded-full bg-brand-green mr-1.5"></span>}
                          {item.status === 'Baixo' && <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 mr-1.5"></span>}
                          {item.status === 'Atenção' && <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mr-1.5"></span>}
                          {item.status === 'Crítico' && <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5"></span>}
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                         <button className="text-gray-400 hover:text-brand-green opacity-0 group-hover:opacity-100 transition-opacity">
                           <ChevronRight className="w-5 h-5" />
                         </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
            </div>
          )}

          {activeTab === 'estoque' && (
            <EstoqueModule globalSearch={globalSearch} />
          )}
          {activeTab === 'ferragens' && (
            <FerragensModule globalSearch={globalSearch} />
          )}
          {activeTab === 'controle_operacao' && (
            <ControleOperacaoModule initialTab={activeControleTab} initialMonth={activeControleMonth} globalSearch={globalSearch} />
          )}
          {activeTab === 'relatorios' && (
            <RelatoriosModule />
          )}

          {activeTab === 'configuracoes' && (
            <div className="animate-in fade-in duration-300 max-w-4xl mx-auto">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Configurações</h1>
                <p className="text-sm text-gray-500 mt-1">Gerencie preferências e configurações do sistema.</p>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                 <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800">Aparência</h2>
                    <p className="text-sm text-gray-500 mt-1">Personalize como a interface é exibida no seu dispositivo.</p>
                 </div>
                 
                 <div className="p-6">
                    <div className="flex items-center justify-between">
                       <div>
                          <h3 className="text-md font-medium text-gray-800">Modo de Tela Escura</h3>
                          <p className="text-sm text-gray-500 mt-1">Habilita um contraste mais escuro para o sistema, ideal para ambientes de baixa luminosidade.</p>
                       </div>
                       <button
                         onClick={() => setIsDarkMode(!isDarkMode)}
                         className={cn(
                           "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                           isDarkMode ? "bg-brand-green" : "bg-gray-200"
                         )}
                       >
                         <span
                           className={cn(
                             "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                             isDarkMode ? "translate-x-5" : "translate-x-0"
                           )}
                         />
                       </button>
                    </div>
                 </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mt-6">
                 <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800">Sincronização Avançada com a Nuvem</h2>
                    <p className="text-sm text-gray-500 mt-1">Gerencie a sincronização de dados desta máquina para os servidores.</p>
                 </div>
                 
                 <div className="p-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                       <div className="flex-1">
                          <h3 className="text-md font-medium text-gray-800">Forçar Envio Manual</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            Se os dados em outros dispositivos estiverem diferentes da máquina atual (com informações atrasadas), 
                            acesse o <b>computador que tem os dados corretos</b> e clique neste botão para forçar estes dados a irem para a nuvem.
                          </p>
                       </div>
                       <button
                         onClick={forceSyncAllToCloud}
                         disabled={!user}
                         className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors disabled:opacity-50 flex-shrink-0"
                       >
                         {user ? "Salvar tudo na Nuvem" : "Faça Login Primeiro"}
                       </button>
                    </div>
                 </div>
              </div>

               <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mt-6">
                 <div className="p-6 border-b border-gray-100">
                   <h2 className="text-lg font-semibold text-gray-800">Aplicativo Desktop/Mobile</h2>
                   <p className="text-sm text-gray-500 mt-1">Instale o sistema Nacional Madeiras no seu dispositivo para acesso rápido e offline.</p>
                 </div>
                 
                 <div className="p-6">
                   <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                     <div className="flex-1">
                       <h3 className="text-md font-medium text-gray-800">Baixar Aplicativo</h3>
                       <p className="text-sm text-gray-500 mt-1">Instala o aplicativo no seu celular ou computador.</p>
                     </div>
                     <button
                       onClick={() => {
                          if (deferredPrompt) {
                             handleInstallClick();
                          } else {
                             alert("O aplicativo já está instalado ou seu navegador atual não suporta a instalação.");
                          }
                       }}
                       className="px-4 py-2 bg-brand-green hover:bg-green-700 text-white font-medium rounded-lg shadow-sm transition-colors flex-shrink-0 flex items-center space-x-2"
                     >
                       <Download className="w-5 h-5 inline-block mr-1" />
                       Baixar
                     </button>
                   </div>
                 </div>
               </div>

               <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mt-6">
                 <div className="p-6 border-b border-gray-100">
                   <h2 className="text-lg font-semibold text-gray-800">Transferência e Backup de Dados</h2>
                   <p className="text-sm text-gray-500 mt-1">Exporte seus dados para usar com outra conta (mudança de administrador) ou para segurança.</p>
                 </div>
                 
                 <div className="p-6">
                   <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                     <div className="flex-1">
                       <h3 className="text-md font-medium text-gray-800">Exportar (Fazer Backup)</h3>
                       <p className="text-sm text-gray-500 mt-1">Baixa um arquivo com todos os seus lançamentos atuais. Para alterar de administrador de forma segura, use isso antes de sair.</p>
                     </div>
                     <button
                       onClick={exportToJSON}
                       className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm transition-colors flex-shrink-0"
                     >
                       Exportar Dados
                     </button>
                   </div>
                   
                   <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mt-6 pt-6 border-t border-gray-100">
                     <div className="flex-1">
                       <h3 className="text-md font-medium text-gray-800">Importar (Restaurar)</h3>
                       <p className="text-sm text-gray-500 mt-1">Restaura seus lançamentos a partir de um arquivo de backup. Cuidado: isto substituirá os dados atuais! Após restaurar, o sistema enviará para sua conta atual na nuvem.</p>
                     </div>
                     <div>
                       <input type="file" id="importFile" accept=".json" className="hidden" onChange={importFromJSON} />
                       <label
                         htmlFor="importFile"
                         className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg shadow-sm transition-colors cursor-pointer inline-block flex-shrink-0"
                       >
                         Importar Arquivo
                       </label>
                     </div>
                   </div>
                 </div>
               </div>

            </div>
          )}
          
          
        </div>

      </main>
    </div>
  );
}

// --- SUBCOMPONENTS ---

function Modal({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
       <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onClose}></div>
       <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
             <h3 className="font-semibold text-lg text-gray-800">{title}</h3>
             <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors focus:outline-none">
               <X className="w-5 h-5"/>
             </button>
          </div>
          <div className="p-6">
             {children}
          </div>
       </div>
    </div>
  )
}

function NavItem({ icon, label, isOpen, active, className, onClick }: { icon: React.ReactNode, label: string, isOpen: boolean, active?: boolean, className?: string, onClick?: () => void }) {
  return (
    <button onClick={(e) => { e.preventDefault(); onClick?.(); }} className={cn(
      "w-full text-left flex items-center px-3 py-2.5 rounded-lg transition-colors overflow-hidden group",
      active 
        ? "bg-brand-green/10 text-brand-green" 
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
      className
    )}>
      <div className={cn(
        "flex-shrink-0 w-6 h-6 flex items-center justify-center",
        active ? "text-brand-green" : "text-gray-500 group-hover:text-gray-700"
      )}>
        {React.cloneElement(icon as React.ReactElement, { className: 'w-5 h-5' })}
      </div>
      {isOpen && <span className="ml-3 font-medium text-sm whitespace-nowrap">{label}</span>}
    </button>
  )
}

function KpiCard({ title, value, subtitle, icon, bgColor, trend, alert, goalTarget, goalLabel, goalRemainingLabel }: any) {
  const numericValue = typeof value === 'string' ? parseFloat(value.replace(/\./g, '').replace(/,/g, '.')) : value;
  const showGoal = typeof goalTarget === 'number';
  const progressPercent = showGoal ? Math.min(100, Math.max(0, (numericValue / goalTarget) * 100)) : 0;
  
  return (
    <div className={cn(
      "bg-white p-5 rounded-xl border transition-all flex flex-col justify-between h-full",
      alert ? "border-yellow-300 shadow-sm shadow-yellow-100" : "border-gray-200 shadow-sm"
    )}>
      <div>
        <div className="flex justify-between items-start">
           <div className={cn("p-2 rounded-lg", bgColor)}>
             {icon}
           </div>
           {trend === 'up' && <span className="flex items-center text-xs font-semibold text-brand-green bg-green-50 px-2 py-0.5 rounded-full"><ArrowUpFromLine className="w-3 h-3 mr-1 opacity-50"/> {showGoal ? `${Math.round(progressPercent)}%` : '+12%'}</span>}
           {trend === 'down' && <span className="flex items-center text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full"><ArrowDownToLine className="w-3 h-3 mr-1 opacity-50"/> -5%</span>}
           {trend === 'neutral' && <span className="flex items-center text-xs font-semibold text-yellow-700 bg-yellow-50 px-2 py-0.5 rounded-full">Atenção</span>}
        </div>
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <div className="flex items-baseline mt-1 space-x-1">
            <p className="text-3xl font-bold text-gray-900 tracking-tight">{value}</p>
            {subtitle && <span className="text-sm font-medium text-gray-500">{subtitle}</span>}
          </div>
        </div>
      </div>
      
      {showGoal && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex justify-between text-xs mb-1">
            <span className="font-medium text-gray-500">{goalLabel || "Meta"}</span>
            <span className="font-bold text-gray-700">{goalTarget.toLocaleString('pt-BR')}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5 mb-1.5 overflow-hidden">
            <div 
              className={cn(
                "h-1.5 rounded-full",
                progressPercent >= 100 ? "bg-brand-green" : "bg-blue-500"
              )} 
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          {goalRemainingLabel && numericValue < goalTarget && (
            <div className="text-[11px] text-gray-500 font-medium">
              Faltam <span className="font-bold text-gray-700">{(goalTarget - numericValue).toLocaleString('pt-BR')}</span> {goalRemainingLabel}
            </div>
          )}
          {goalRemainingLabel && numericValue >= goalTarget && (
             <div className="text-[11px] text-brand-green font-bold">Meta atingida!</div>
          )}
        </div>
      )}
    </div>
  )
}

