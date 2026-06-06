import React, { useState } from 'react';
import { useLocalStorage } from './EstoqueModule';
import { Plus, Trash2, Copy, Save, FileSpreadsheet } from 'lucide-react';
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
};

export function LancamentosRelatoriosModule() {
  const [kits, setKits] = useLocalStorage<KitLancamento[]>('nacional_madeiras_kits', []);
  const [form, setForm] = useState<Omit<KitLancamento, 'id'>>(INITIAL_FORM);

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

  return (
    <div className="animate-in fade-in duration-300 pb-20">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Lançamentos de Relatórios</h1>
        <p className="text-sm text-gray-500 mt-1">Cadastro técnico de kits de portas e detalhamento para produção.</p>
      </div>

      {/* FORMULÁRIO */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="border-b border-gray-100 bg-gray-50/80 p-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center">
            <Plus className="w-5 h-5 mr-2 text-brand-green" />
            Novo Cadastro de Kit
          </h2>
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
                <select name="comodo" value={form.comodo} onChange={handleInputChange} className="w-full p-2 border border-blue-200 rounded text-sm focus:ring-1 focus:ring-blue-500 outline-none bg-white">
                  <option value="BANHEIRO">Banheiro</option>
                  <option value="ENTRADA">Entrada</option>
                  <option value="QUARTO">Quarto</option>
                  <option value="COZINHA">Cozinha</option>
                  <option value="LIXEIRA">Lixeira</option>
                  <option value="SALA">Sala</option>
                  <option value="SUITE">Suíte</option>
                  <option value="ESPECIAIS">Especiais</option>
                </select>
              </div>
            </div>

            {/* ESPECIFICAÇÕES & FOLHA DE PORTA */}
            <div className="md:col-span-2 grid grid-cols-2 gap-4 p-4 bg-emerald-50/30 rounded-lg border border-emerald-100">
              <h3 className="col-span-full text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">Especificações & Folha</h3>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Tipologia</label>
                <input type="text" name="tipologia" value={form.tipologia} onChange={handleInputChange} placeholder="ex: PM1F" className="w-full p-2 border border-emerald-200 rounded text-sm focus:ring-1 focus:ring-emerald-500 outline-none uppercase" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Abertura</label>
                <select name="abertura" value={form.abertura} onChange={handleInputChange} className="w-full p-2 border border-emerald-200 rounded text-sm focus:ring-1 focus:ring-emerald-500 outline-none bg-white">
                  <option value="ESQUERDA">Esquerda</option>
                  <option value="DIREITA">Direita</option>
                  <option value="ESQUERDA P/FORA">Esq P/Fora</option>
                  <option value="DIREITA P/FORA">Dir P/Fora</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Folha Largura</label>
                <input type="text" name="folhaLargura" value={form.folhaLargura} onChange={handleInputChange} className="w-full p-2 border border-emerald-200 rounded text-sm focus:ring-1 focus:ring-emerald-500 outline-none" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Folha Altura</label>
                <input type="text" name="folhaAltura" value={form.folhaAltura} onChange={handleInputChange} className="w-full p-2 border border-emerald-200 rounded text-sm focus:ring-1 focus:ring-emerald-500 outline-none" required />
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
                <select name="regulagem" value={form.regulagem} onChange={handleInputChange} className="w-full p-2 border border-amber-200 rounded text-sm focus:ring-1 focus:ring-amber-500 outline-none bg-white">
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
                <select name="acabamento" value={form.acabamento} onChange={handleInputChange} className="w-full p-2 border border-amber-200 rounded text-sm focus:ring-1 focus:ring-amber-500 outline-none bg-white">
                  <option value="BRANCO">Branco</option>
                  <option value="MADEIRA">Madeira</option>
                  <option value="PRETO">Preto</option>
                  <option value="OUTRO">Outro</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Característica</label>
                <select name="caracteristica" value={form.caracteristica} onChange={handleInputChange} className="w-full p-2 border border-amber-200 rounded text-sm focus:ring-1 focus:ring-amber-500 outline-none bg-white">
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
                     <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer p-1.5 hover:bg-white rounded">
                        <input type="checkbox" name="camarao" checked={form.camarao} onChange={handleInputChange} className="rounded text-brand-green focus:ring-brand-green" />
                        <span>Camarão</span>
                     </label>
                     <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer p-1.5 hover:bg-white rounded">
                        <input type="checkbox" name="correr" checked={form.correr} onChange={handleInputChange} className="rounded text-brand-green focus:ring-brand-green" />
                        <span>Correr</span>
                     </label>
                     <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer p-1.5 hover:bg-white rounded">
                        <input type="checkbox" name="pivotante" checked={form.pivotante} onChange={handleInputChange} className="rounded text-brand-green focus:ring-brand-green" />
                        <span>Pivotante</span>
                     </label>
                     <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer p-1.5 hover:bg-white rounded">
                        <input type="checkbox" name="veneziana" checked={form.veneziana} onChange={handleInputChange} className="rounded text-brand-green focus:ring-brand-green" />
                        <span>C/ Veneziana</span>
                     </label>
                     <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer p-1.5 hover:bg-white rounded">
                        <input type="checkbox" name="grelha" checked={form.grelha} onChange={handleInputChange} className="rounded text-brand-green focus:ring-brand-green" />
                        <span>C/ Grelha</span>
                     </label>
                     <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer p-1.5 hover:bg-white rounded">
                        <input type="checkbox" name="bandeira" checked={form.bandeira} onChange={handleInputChange} className="rounded text-brand-green focus:ring-brand-green" />
                        <span>C/ Bandeira</span>
                     </label>
                     <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer p-1.5 hover:bg-white rounded">
                        <input type="checkbox" name="chapa" checked={form.chapa} onChange={handleInputChange} className="rounded text-brand-green focus:ring-brand-green" />
                        <span>C/ Chapa</span>
                     </label>
                     <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer p-1.5 hover:bg-white rounded">
                        <input type="checkbox" name="vidro" checked={form.vidro} onChange={handleInputChange} className="rounded text-brand-green focus:ring-brand-green" />
                        <span>C/ Vidro</span>
                     </label>
                     <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer p-1.5 hover:bg-white rounded">
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

      {/* TABELA DE VISUALIZAÇÃO */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
         <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <FileSpreadsheet className="w-5 h-5 mr-2 text-gray-500" />
              Kits Cadastrados
            </h2>
            <div className="text-sm text-gray-500">
               {kits.length} registro(s)
            </div>
         </div>
         <div className="overflow-x-auto print:overflow-visible">
            <table className="w-full text-left text-sm border-collapse whitespace-nowrap">
               <thead className="bg-[#e2efda] text-xs uppercase text-gray-800 sticky top-0 border-b border-gray-300">
                  <tr>
                     <th className="p-2 border-r border-[#c2d6b3] font-bold text-center">Ações</th>
                     <th className="p-2 border-r border-[#c2d6b3] font-bold text-center">Apto</th>
                     <th className="p-2 border-r border-[#c2d6b3] font-bold text-center">Pav.</th>
                     <th className="p-2 border-r border-[#c2d6b3] font-bold text-center">Coluna</th>
                     <th className="p-2 border-r border-[#c2d6b3] font-bold">Cômodo</th>
                     
                     {/* Folha */}
                     <th className="p-2 border-r border-[#c2d6b3] font-bold text-center" colSpan={2}>Folha de Porta<br/><span className="font-normal text-[10px]">Largura | Altura</span></th>
                     
                     <th className="p-2 border-r border-[#c2d6b3] font-bold text-center">Tipologia</th>
                     <th className="p-2 border-r border-[#c2d6b3] font-bold text-center">Abertura</th>
                     
                     {/* Aduela */}
                     <th className="p-2 border-r border-[#c2d6b3] font-bold text-center" colSpan={2}>Aduela<br/><span className="font-normal text-[10px]">Largura | Altura</span></th>
                     
                     <th className="p-2 border-r border-[#c2d6b3] font-bold text-center">Regulagem</th>
                     <th className="p-2 border-r border-[#c2d6b3] font-bold text-center">Qtd Folha<br/>Kit</th>
                     <th className="p-2 border-r border-[#c2d6b3] font-bold text-center">Acabamento</th>
                     <th className="p-2 border-r border-[#c2d6b3] font-bold text-center">Característica</th>
                     
                     <th className="p-2 border-r border-[#c2d6b3] font-bold text-center">Qtd Lados<br/>Aduela</th>
                     <th className="p-2 border-r border-[#c2d6b3] font-bold text-center">Montantes</th>
                     
                     <th className="p-2 border-r border-[#c2d6b3] font-bold text-center" colSpan={2}>Bits Folha<br/><span className="font-normal text-[10px]">Qtde | Faces</span></th>
                     
                     {/* Specs */}
                     <th className="p-2 border-r border-[#c2d6b3] font-bold text-center">Camarão</th>
                     <th className="p-2 border-r border-[#c2d6b3] font-bold text-center">Correr</th>
                     <th className="p-2 border-r border-[#c2d6b3] font-bold text-center">Pivotante</th>
                     <th className="p-2 border-r border-[#c2d6b3] font-bold text-center">C/ Venez.</th>
                     <th className="p-2 border-r border-[#c2d6b3] font-bold text-center">C/ Grelha</th>
                     <th className="p-2 border-r border-[#c2d6b3] font-bold text-center">C/ Band.</th>
                     <th className="p-2 border-r border-[#c2d6b3] font-bold text-center">C/ Chapa</th>
                     <th className="p-2 border-r border-[#c2d6b3] font-bold text-center">C/ Vidro</th>
                     <th className="p-2 font-bold text-center">Fecha Fresta</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-200">
                  {kits.map(kit => (
                     <tr key={kit.id} className="hover:bg-gray-50 bg-white">
                        <td className="p-2 border-r border-gray-200 text-center">
                           <div className="flex justify-center space-x-2">
                             <button onClick={() => handleDuplicate(kit)} title="Duplicar para o formulário" className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors">
                               <Copy className="w-4 h-4" />
                             </button>
                             <button onClick={() => handleDelete(kit.id)} title="Excluir" className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors">
                               <Trash2 className="w-4 h-4" />
                             </button>
                           </div>
                        </td>
                        <td className="p-2 border-r border-gray-200 font-bold text-center">{kit.apto}</td>
                        <td className="p-2 border-r border-gray-200 text-center">{kit.pavimento}</td>
                        <td className="p-2 border-r border-gray-200 text-center">{kit.coluna}</td>
                        <td className="p-2 border-r border-gray-200 font-medium">{kit.comodo}</td>
                        
                        {/* Folha */}
                        <td className="p-2 border-r border-gray-200 text-center font-mono text-xs">{kit.folhaLargura}</td>
                        <td className="p-2 border-r border-gray-200 text-center font-mono text-xs">{kit.folhaAltura}</td>
                        
                        <td className="p-2 border-r border-gray-200 font-bold text-center text-xs">{kit.tipologia}</td>
                        <td className="p-2 border-r border-gray-200 text-center text-xs">{kit.abertura}</td>
                        
                        {/* Aduela */}
                        <td className="p-2 border-r border-gray-200 text-center font-mono text-xs">{kit.aduelaLargura}</td>
                        <td className="p-2 border-r border-gray-200 text-center font-mono text-xs">{kit.aduelaAltura}</td>
                        
                        <td className="p-2 border-r border-gray-200 text-center text-xs">{kit.regulagem}</td>
                        <td className="p-2 border-r border-gray-200 text-center font-bold">{kit.qtdeFolhasPorKit}</td>
                        <td className="p-2 border-r border-gray-200 text-center">{kit.acabamento}</td>
                        <td className="p-2 border-r border-gray-200 text-center font-medium">{kit.caracteristica}</td>
                        
                        <td className="p-2 border-r border-gray-200 text-center">{kit.qtdeLadosAduela}</td>
                        <td className="p-2 border-r border-gray-200 text-center">{kit.qtdeMontantes}</td>
                        
                        {/* Bits */}
                        <td className="p-2 border-r border-gray-200 text-center">{kit.bitsQtde}</td>
                        <td className="p-2 border-r border-gray-200 text-center">{kit.bitsFaces}</td>
                        
                        {/* Checkboxes em formato X ou V */}
                        <td className="p-2 border-r border-gray-200 text-center font-bold text-gray-500">{kit.camarao ? 'X' : ''}</td>
                        <td className="p-2 border-r border-gray-200 text-center font-bold text-gray-500">{kit.correr ? 'X' : ''}</td>
                        <td className="p-2 border-r border-gray-200 text-center font-bold text-gray-500">{kit.pivotante ? 'X' : ''}</td>
                        <td className="p-2 border-r border-gray-200 text-center font-bold text-gray-500">{kit.veneziana ? 'X' : ''}</td>
                        <td className="p-2 border-r border-gray-200 text-center font-bold text-gray-500">{kit.grelha ? 'X' : ''}</td>
                        <td className="p-2 border-r border-gray-200 text-center font-bold text-gray-500">{kit.bandeira ? 'X' : ''}</td>
                        <td className="p-2 border-r border-gray-200 text-center font-bold text-gray-500">{kit.chapa ? 'X' : ''}</td>
                        <td className="p-2 border-r border-gray-200 text-center font-bold text-gray-500">{kit.vidro ? 'X' : ''}</td>
                        <td className="p-2 text-center font-bold text-gray-500">{kit.fechaFresta ? 'X' : ''}</td>
                     </tr>
                  ))}
                  {kits.length === 0 && (
                     <tr>
                        <td colSpan={26} className="p-8 text-center text-gray-500">
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
