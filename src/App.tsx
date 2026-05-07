import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { 
  Search, Bell, Menu, 
  Package, ArrowDownToLine, ArrowUpFromLine, AlertTriangle,
  LayoutDashboard, Box, FileText, Settings, LogOut, ChevronRight, X, Home, HardHat
} from 'lucide-react';
import { cn } from './lib/utils';
import { EstoqueModule, INITIAL_PORTAS, INITIAL_ADUELAS, INITIAL_ALIZARES } from './components/EstoqueModule';
import { ControleOperacaoModule } from './components/ControleOperacaoModule';

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

const INVENTARIO = [
  { id: '1001', desc: 'Kit Porta Interna Média', dimensoes: '80x210', material: 'Pinho', espessura: '35', estoque: 450, status: 'OK' },
  { id: '1002', desc: 'Kit Porta Estreita', dimensoes: '70x210', material: 'MDF / Primer', espessura: '35', estoque: 12, status: 'Crítico' },
  { id: '1003', desc: 'Kit Porta Larga', dimensoes: '90x210', material: 'Angelim', espessura: '40', estoque: 50, status: 'Baixo' },
  { id: '1004', desc: 'Porta Lisa', dimensoes: '80x210', material: 'Jequitibá', espessura: '35', estoque: 280, status: 'OK' },
  { id: '1005', desc: 'Porta Pivotante', dimensoes: '120x210', material: 'Itaúba', espessura: '45', estoque: 5, status: 'Crítico' },
];

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isEntradaModalOpen, setIsEntradaModalOpen] = useState(false);
  const [isSaidaModalOpen, setIsSaidaModalOpen] = useState(false);
  
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nm_dark_mode');
      if (saved) return saved === 'true';
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('nm_dark_mode', isDarkMode.toString());
  }, [isDarkMode]);

  const [dashboardStats, setDashboardStats] = useState({
    totalEstoque: 0,
    alertaBaixoEstoque: 0,
    totalControleSaidasKits: 0,
    totalOperacaoKits: 0,
    totalEntradaObras: 0,
  });

  const [chartData, setChartData] = useState(CHART_DATA);

  useEffect(() => {
    try {
      const getLs = (key: string, init: any) => {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : init;
      };

      const portas = getLs('nm_portas', INITIAL_PORTAS);
      const aduelas = getLs('nm_aduelas', INITIAL_ADUELAS);
      const alizares = getLs('nm_alizares', INITIAL_ALIZARES);

      let totalEst = 0;
      let alertas = 0;
      
      [...portas, ...aduelas, ...alizares].forEach((item: any) => {
         const qty = typeof item.estoque === 'number' ? item.estoque : parseInt(item.estoque) || 0;
         totalEst += qty;
         if (item.status === 'Crítico') alertas++;
      });

      const saidas = getLs('nm_controle_saidas', {});
      let countSaidas = 0;
      const currentMonthIndex = new Date().getMonth();
      const currentYearStats = new Date().getFullYear();

      Object.keys(saidas).forEach(dateStr => {
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
      Object.keys(operacao).forEach(dateStr => {
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

      const obras = getLs('nm_entrada_obras_v4', {});
      let countObras = 0;
      Object.values(obras).forEach((o: any) => {
        const itens = o.itens || [];
        itens.forEach((i: any) => {
          // As per user request: ENTRADA DE OBRA X SAIDA SOMENTE DE KITS
          // Kits means folhas
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

      // CALCULATE CHART DATA: Entrada de Obras (Folhas/Kits) vs Saídas de Kits per Month
      const mesesAbbr = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const currentYear = new Date().getFullYear();
      
      const newChartData = mesesAbbr.map(mes => ({ name: mes, entradas: 0, saidas: 0 }));

      // Entradas (Folhas em Obras)
      Object.values(obras).forEach((o: any) => {
         if (!o.data) return;
         const d = new Date(o.data);
         if (d.getFullYear() === currentYear) {
           let folhasTotal = 0;
           (o.itens || []).forEach((i: any) => {
             folhasTotal += (parseInt(i.folhas) || 0);
           });
           newChartData[d.getMonth()].entradas += folhasTotal;
         }
      });

      // Saídas (Kits Enviados)
      Object.keys(saidas).forEach(dateStr => { // YYYY-MM-DD
         const parts = dateStr.split('-');
         if (parts.length === 3) {
            const m = parseInt(parts[1]) - 1;
            const y = parseInt(parts[0]);
            if (y === currentYear && m >= 0 && m < 12) {
               const row = saidas[dateStr];
               const total = (parseInt(row.e1_kits) || 0) + (parseInt(row.e2_kits) || 0);
               newChartData[m].saidas += total;
            }
         }
      });

      // Filter down to months up to current month to avoid weird empty bars in the future
      const currentMonth = new Date().getMonth();
      setChartData(newChartData.slice(0, currentMonth + 1));

    } catch (e) {
      console.error(e);
    }
  }, [activeTab]); // re-calculate when switching tabs


  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">
      
      {/* SIDEBAR */}
      <aside className={cn(
        "bg-white border-r border-gray-200 transition-all duration-300 flex-shrink-0 z-20",
        sidebarOpen ? "w-64" : "w-20"
      )}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
           {sidebarOpen ? (
              <div className="flex flex-col">
                <span className="font-bold text-brand-green text-sm leading-tight uppercase">Nacional Madeiras</span>
                <span className="font-bold text-gray-500 text-xs tracking-widest uppercase">Kit Porta</span>
              </div>
           ) : (
             <div className="w-10 h-10 bg-brand-green text-white rounded font-bold flex items-center justify-center text-xl">NM</div>
           )}
           <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-gray-600 focus:outline-none hidden md:block">
             <Menu className="w-5 h-5" />
           </button>
        </div>
        <nav className="p-4 space-y-1">
          <NavItem icon={<LayoutDashboard />} label="Dashboard" active={activeTab === 'dashboard'} isOpen={sidebarOpen} onClick={() => setActiveTab('dashboard')} />
          <NavItem icon={<Package />} label="Estoque" active={activeTab === 'estoque'} isOpen={sidebarOpen} onClick={() => setActiveTab('estoque')} />
          <NavItem icon={<Box />} label="Controle x Operação" active={activeTab === 'controle_operacao'} isOpen={sidebarOpen} onClick={() => setActiveTab('controle_operacao')} />
          <NavItem icon={<FileText />} label="Relatórios" active={activeTab === 'relatorios'} isOpen={sidebarOpen} onClick={() => setActiveTab('relatorios')} />
          
          <div className="pt-4 mt-2 mb-2 border-t border-gray-100"></div>
          <NavItem icon={<Settings />} label="Configurações" active={activeTab === 'configuracoes'} isOpen={sidebarOpen} onClick={() => setActiveTab('configuracoes')} />
          <NavItem icon={<LogOut />} label="Sair" isOpen={sidebarOpen} className="text-red-500 hover:bg-red-50 hover:text-red-600" />
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* HEADER */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-10">
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
                className="w-full pl-10 pr-4 py-2 bg-gray-100 border-transparent rounded-lg text-sm focus:border-brand-green focus:bg-white focus:ring-2 focus:ring-brand-green/20 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
            </button>
            <div className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <div className="w-8 h-8 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green font-semibold border border-brand-green/20">
                RV
              </div>
              <div className="hidden md:block text-sm text-left">
                <p className="font-medium text-gray-700 leading-none">Rafael Vitor</p>
                <p className="text-xs text-gray-500 mt-1">Administrador</p>
              </div>
            </div>
          </div>
        </header>

        {/* DASHBOARD CONTENT */}
        <div className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          
          {activeTab === 'dashboard' && (
            <div className="animate-in fade-in duration-300">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Visão Geral do Estoque</h1>
              <p className="text-sm text-gray-500 mt-1">Acompanhe as movimentações e o saldo atual.</p>
            </div>
            <div className="flex space-x-3 w-full md:w-auto">
               <button onClick={() => setIsSaidaModalOpen(true)} className="flex-1 md:flex-none flex items-center justify-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">
                 <ArrowUpFromLine className="w-4 h-4 text-red-500" />
                 <span>Registrar Saída</span>
               </button>
               <button onClick={() => setIsEntradaModalOpen(true)} className="flex-1 md:flex-none flex items-center justify-center space-x-2 px-4 py-2 bg-brand-green rounded-lg text-white text-sm font-medium hover:bg-brand-green-dark transition-colors shadow-sm shadow-brand-green/30">
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
                    <button className="flex-1 py-3 text-sm font-medium text-brand-green border-b-2 border-brand-green uppercase tracking-wide">Últimas Entradas</button>
                    <button className="flex-1 py-3 text-sm font-medium text-gray-400 hover:text-gray-600 uppercase tracking-wide">Últimas Saídas</button>
                  </div>
               </div>
               <div className="flex-1 overflow-auto p-2">
                 <ul className="divide-y divide-gray-50">
                    {ULTIMAS_ENTRADAS.map((log) => (
                      <li key={log.id} className="p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer group">
                        <div className="flex justify-between items-start mb-1">
                           <span className="font-medium text-sm text-gray-800 line-clamp-1 pr-2">{log.item}</span>
                           <span className="text-xs font-semibold text-brand-green bg-brand-green/10 px-2 py-0.5 rounded-full whitespace-nowrap">+{log.qtd}</span>
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
                 <a href="#" className="text-sm font-medium text-brand-green hover:underline">Ver todo o histórico</a>
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
                  {INVENTARIO.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                           <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                              {/* Placeholder for real image */}
                              <Box className="w-5 h-5 text-gray-400" />
                           </div>
                           <div>
                             <p className="font-medium text-gray-800">{item.desc}</p>
                             <p className="text-xs text-gray-400">cód: {item.id}</p>
                           </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-gray-600 bg-gray-50/30">{item.dimensoes}</td>
                      <td className="px-6 py-4 text-gray-600">{item.material}</td>
                      <td className="px-6 py-4 text-center text-gray-600">{item.espessura}mm</td>
                      <td className="px-6 py-4 text-right font-medium text-gray-900">{item.estoque.toLocaleString()}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={cn(
                          "inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border",
                          item.status === 'OK' && "bg-green-50 text-brand-green border-green-200",
                          item.status === 'Baixo' && "bg-yellow-50 text-yellow-700 border-yellow-200",
                          item.status === 'Crítico' && "bg-red-50 text-red-700 border-red-200"
                        )}>
                          {item.status === 'OK' && <span className="w-1.5 h-1.5 rounded-full bg-brand-green mr-1.5"></span>}
                          {item.status === 'Baixo' && <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 mr-1.5"></span>}
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
            <EstoqueModule />
          )}
          {activeTab === 'controle_operacao' && (
            <ControleOperacaoModule />
          )}
          {activeTab === 'relatorios' && (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 animate-in fade-in duration-300 min-h-[400px]">
               <FileText className="w-16 h-16 mb-4 text-gray-300" />
               <h2 className="text-xl font-semibold text-gray-700">Relatórios Gerenciais</h2>
               <p className="mt-2 text-sm text-gray-500">Módulo em desenvolvimento. Gere resumos em PDF e planilhas sobre o consumo, previsões de compra e valor em estoque.</p>
            </div>
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
            </div>
          )}
          
          
        </div>

        {/* MODALS */}
        <Modal isOpen={isEntradaModalOpen} onClose={() => setIsEntradaModalOpen(false)} title="Registrar Entrada">
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert("Entrada registrada com sucesso!"); setIsEntradaModalOpen(false); }}>
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Produto / Kit</label>
               <select className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none h-10">
                 <option>Kit Porta Interna Pinho 80x210</option>
                 <option>Porta Lisa Jequitibá 80x210</option>
                 <option>Aduela Eucalipto 15cm</option>
               </select>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade</label>
                   <input type="number" min="1" defaultValue="1" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none h-10" />
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                   <input type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none h-10" />
                </div>
             </div>
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Fornecedor / Nota Fiscal</label>
               <input type="text" placeholder="Nome do fornecedor ou nº NF" required className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none h-10" />
             </div>
             <div className="pt-4 flex justify-end space-x-3">
               <button type="button" onClick={() => setIsEntradaModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">Cancelar</button>
               <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-brand-green hover:bg-brand-green-dark rounded-lg transition-colors">Confirmar Entrada</button>
             </div>
          </form>
        </Modal>

        <Modal isOpen={isSaidaModalOpen} onClose={() => setIsSaidaModalOpen(false)} title="Registrar Saída">
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert("Saída registrada com sucesso!"); setIsSaidaModalOpen(false); }}>
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Produto / Kit</label>
               <select className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none h-10">
                 <option>Kit Porta Interna Pinho 80x210</option>
                 <option>Porta Lisa Jequitibá 80x210</option>
                 <option>Aduela Eucalipto 15cm</option>
               </select>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade</label>
                   <input type="number" min="1" defaultValue="1" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none h-10" />
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                   <input type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none h-10" />
                </div>
             </div>
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Destino / Ordem de Serviço</label>
               <input type="text" placeholder="Nome do cliente ou nº OS" required className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none h-10" />
             </div>
             <div className="pt-4 flex justify-end space-x-3">
               <button type="button" onClick={() => setIsSaidaModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">Cancelar</button>
               <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors">Confirmar Saída</button>
             </div>
          </form>
        </Modal>

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

function KpiCard({ title, value, subtitle, icon, bgColor, trend, alert }: any) {
  return (
    <div className={cn(
      "bg-white p-5 rounded-xl border transition-all",
      alert ? "border-yellow-300 shadow-sm shadow-yellow-100" : "border-gray-200 shadow-sm"
    )}>
      <div className="flex justify-between items-start">
         <div className={cn("p-2 rounded-lg", bgColor)}>
           {icon}
         </div>
         {trend === 'up' && <span className="flex items-center text-xs font-semibold text-brand-green bg-green-50 px-2 py-0.5 rounded-full"><ArrowUpFromLine className="w-3 h-3 mr-1 opacity-50"/> +12%</span>}
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
  )
}

