const fs = require('fs');

const file = 'src/components/LancamentosRelatoriosModule.tsx';
let code = fs.readFileSync(file, 'utf8');

// The exported excel columns must match 1:1 with the original image EXACTLY
const exportLogicOld = /const dataToExport = kits\.map\((.|\n)*?\];\n\n    const workbook = XLSX\.utils\.book_new\(\);/;

const exportLogicNew = `
    const headers = [
      ['BLOCO', 'APTO', 'PAVIMENTO', 'COLUNA', 'CÔMODO', 'TIPOLOGIA', 'FOLHA DE PORTA LARGURA', 'FOLHA DE PORTA ALTURA', 'QUANTIDADE DE FOLHA POR KIT', 'ACABAMENTO DA PORTA', 'CARACTERISTICA DA PORTA', 'ABERTURA', 'ADUELA LARGURA', 'ADUELA ALTURA', 'REGULAGEM', 'ACABAMENTO DA ADUELA', 'FECHADURA MARCA', 'FECHADURA GRID', 'FECHADURA TIPO', 'DOBRADIÇA MARCA', 'DOBRADIÇA MEDIDA', 'QTDE DE LADOS DA ADUELA', 'MONTANTES MEDIDA', 'MONTANTES FOLGAS', 'BITS POR FOLHA QTDE', 'BITS POR FOLHA FACES', 'CAMARÃO', 'CORRER', 'PIVOTANTE', 'C/VENEZIANA', 'C/GRELHA', 'C/BANDEIRA', 'C/CHAPA', 'C/VIDRO', 'C/FECHA FRESTA']
    ];

    const dataToExport = kits.map(k => [
      k.bloco || '',
      k.apto || '',
      k.pavimento || '',
      k.coluna || '',
      k.comodo || '',
      k.tipologia || '',
      k.folhaLargura || '',
      k.folhaAltura || '',
      k.qtdeFolhasPorKit || '',
      k.acabamentoPorta || '',
      k.caracteristicaPorta || '',
      k.abertura || '',
      k.aduelaLargura || '',
      k.aduelaAltura || '',
      k.regulagem || '',
      k.acabamentoAduela || '',
      k.fechaduraMarca || '',
      k.fechaduraGrid || '',
      k.fechaduraTipo || '',
      k.dobradicaMarca || '',
      k.dobradicaMedida || '',
      k.qtdeLadosAduela || '',
      k.montantesMedida || '',
      k.montantesFolgas || '',
      k.bitsQtde || '',
      k.bitsFaces || '',
      k.camarao ? 'X' : '',
      k.correr ? 'X' : '',
      k.pivotante ? 'X' : '',
      k.veneziana ? 'X' : '',
      k.grelha ? 'X' : '',
      k.bandeira ? 'X' : '',
      k.chapa ? 'X' : '',
      k.vidro ? 'X' : '',
      k.fechaFresta ? 'X' : '',
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet([...headers, ...dataToExport]);
    const workbook = XLSX.utils.book_new();
`;

code = code.replace(/const headers = \[\['Bloco'(.|\n)*?const worksheet = XLSX\.utils\.aoa_to_sheet\(\[\.\.\.headers, \.\.\.dataToExport\]\);\n\s*const workbook = XLSX\.utils\.book_new\(\);/g, exportLogicNew);
// Fallback if not matched:
if (!code.includes("const headers = [\n      ['BLOCO',")) {
   code = code.replace(/const headers = \[\['Apto'(.|\n)*?const worksheet = XLSX\.utils\.aoa_to_sheet\(\[\.\.\.headers, \.\.\.dataToExport\]\);\n\s*const workbook = XLSX\.utils\.book_new\(\);/g, exportLogicNew);
}


// Replace the "Bulk insert logic" text area handling to match exact
const handleBulkLogicOld = /const handleBulkInsert = \(\) => \{[\s\S]*?setShowBulkModal\(false\);\n  \};/;
const handleBulkLogicNew = `const handleBulkInsert = () => {
    const lines = bulkText.trim().split('\\n');
    const newKits: KitLancamento[] = [];
    
    lines.forEach(line => {
      const cols = line.split('\\t').map(c => c.trim());
      if (cols.length < 5) return; // Skip invalid lines
      
      const newKit: KitLancamento = {
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
      };
      
      newKits.push(newKit);
    });

    if (newKits.length > 0) {
      setKits(prev => [...prev, ...newKits]);
      setBulkText('');
      setShowBulkModal(false);
    }
  };`;
code = code.replace(handleBulkLogicOld, handleBulkLogicNew);


const formUI = `
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Bloco 1 - Identificação do Kit */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-800 border-b pb-2 flex items-center"><MapPin className="w-4 h-4 mr-2" /> Identificação</h4>
              <div className="grid grid-cols-2 gap-2">
                <div><label className="block text-xs font-medium text-gray-600 mb-1">Bloco</label><input type="text" className="w-full text-sm border-gray-300 rounded focus:ring-emerald-500 focus:border-emerald-500" value={form.bloco} onChange={e => setForm({...form, bloco: e.target.value})} /></div>
                <div><label className="block text-xs font-medium text-gray-600 mb-1">Apto</label><input type="text" className="w-full text-sm border-gray-300 rounded focus:ring-emerald-500 focus:border-emerald-500" value={form.apto} onChange={e => setForm({...form, apto: e.target.value})} /></div>
                <div><label className="block text-xs font-medium text-gray-600 mb-1">Pavimento</label><input type="text" className="w-full text-sm border-gray-300 rounded focus:ring-emerald-500 focus:border-emerald-500" value={form.pavimento} onChange={e => setForm({...form, pavimento: e.target.value})} /></div>
                <div><label className="block text-xs font-medium text-gray-600 mb-1">Coluna</label><input type="text" className="w-full text-sm border-gray-300 rounded focus:ring-emerald-500 focus:border-emerald-500" value={form.coluna} onChange={e => setForm({...form, coluna: e.target.value})} /></div>
                <div><label className="block text-xs font-medium text-gray-600 mb-1">Cômodo</label><input type="text" className="w-full text-sm border-gray-300 rounded focus:ring-emerald-500 focus:border-emerald-500" value={form.comodo} onChange={e => setForm({...form, comodo: e.target.value})} /></div>
                <div><label className="block text-xs font-medium text-gray-600 mb-1">Tipologia</label><input type="text" className="w-full text-sm border-gray-300 rounded focus:ring-emerald-500 focus:border-emerald-500" value={form.tipologia} onChange={e => setForm({...form, tipologia: e.target.value})} /></div>
                <div><label className="block text-xs font-medium text-gray-600 mb-1">Qtd Folha / Kit</label><input type="text" className="w-full text-sm border-gray-300 rounded focus:ring-emerald-500 focus:border-emerald-500" value={form.qtdeFolhasPorKit} onChange={e => setForm({...form, qtdeFolhasPorKit: e.target.value})} /></div>
                <div><label className="block text-xs font-medium text-gray-600 mb-1">Abertura</label><input type="text" className="w-full text-sm border-gray-300 rounded focus:ring-emerald-500 focus:border-emerald-500" value={form.abertura} onChange={e => setForm({...form, abertura: e.target.value})} /></div>
              </div>
            </div>

            {/* Bloco 2 - Porta & Especificação */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-800 border-b pb-2">Folha de Porta</h4>
              <div className="grid grid-cols-2 gap-2">
                <div><label className="block text-xs font-medium text-gray-600 mb-1">Largura</label><input type="text" className="w-full text-sm border-gray-300 rounded focus:ring-emerald-500 focus:border-emerald-500" value={form.folhaLargura} onChange={e => setForm({...form, folhaLargura: e.target.value})} /></div>
                <div><label className="block text-xs font-medium text-gray-600 mb-1">Altura</label><input type="text" className="w-full text-sm border-gray-300 rounded focus:ring-emerald-500 focus:border-emerald-500" value={form.folhaAltura} onChange={e => setForm({...form, folhaAltura: e.target.value})} /></div>
                <div className="col-span-2"><label className="block text-xs font-medium text-gray-600 mb-1">Acabamento</label><input type="text" className="w-full text-sm border-gray-300 rounded focus:ring-emerald-500 focus:border-emerald-500" value={form.acabamentoPorta} onChange={e => setForm({...form, acabamentoPorta: e.target.value})} /></div>
                <div className="col-span-2"><label className="block text-xs font-medium text-gray-600 mb-1">Característica</label><input type="text" className="w-full text-sm border-gray-300 rounded focus:ring-emerald-500 focus:border-emerald-500" value={form.caracteristicaPorta} onChange={e => setForm({...form, caracteristicaPorta: e.target.value})} /></div>
              </div>
              
              <h4 className="font-semibold text-gray-800 border-b pb-2 pt-2">Aduela</h4>
              <div className="grid grid-cols-2 gap-2">
                <div><label className="block text-xs font-medium text-gray-600 mb-1">Largura</label><input type="text" className="w-full text-sm border-gray-300 rounded focus:ring-emerald-500 focus:border-emerald-500" value={form.aduelaLargura} onChange={e => setForm({...form, aduelaLargura: e.target.value})} /></div>
                <div><label className="block text-xs font-medium text-gray-600 mb-1">Altura</label><input type="text" className="w-full text-sm border-gray-300 rounded focus:ring-emerald-500 focus:border-emerald-500" value={form.aduelaAltura} onChange={e => setForm({...form, aduelaAltura: e.target.value})} /></div>
                <div><label className="block text-xs font-medium text-gray-600 mb-1">Regulagem</label><input type="text" className="w-full text-sm border-gray-300 rounded focus:ring-emerald-500 focus:border-emerald-500" value={form.regulagem} onChange={e => setForm({...form, regulagem: e.target.value})} /></div>
                <div><label className="block text-xs font-medium text-gray-600 mb-1">Qtd Lados Aduela</label><input type="text" className="w-full text-sm border-gray-300 rounded focus:ring-emerald-500 focus:border-emerald-500" value={form.qtdeLadosAduela} onChange={e => setForm({...form, qtdeLadosAduela: e.target.value})} /></div>
                <div className="col-span-2"><label className="block text-xs font-medium text-gray-600 mb-1">Acabamento Aduela</label><input type="text" className="w-full text-sm border-gray-300 rounded focus:ring-emerald-500 focus:border-emerald-500" value={form.acabamentoAduela} onChange={e => setForm({...form, acabamentoAduela: e.target.value})} /></div>
              </div>
            </div>

            {/* Bloco 3 - Ferragens */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-800 border-b pb-2">Ferragens</h4>
              <div className="space-y-3">
                 <div>
                   <label className="block text-xs font-bold text-gray-600 mb-1">Fechadura</label>
                   <div className="flex gap-2">
                     <input type="text" placeholder="Marca" className="w-1/3 text-sm border-gray-300 rounded focus:ring-emerald-500 focus:border-emerald-500" value={form.fechaduraMarca} onChange={e => setForm({...form, fechaduraMarca: e.target.value})} />
                     <input type="text" placeholder="Grid" className="w-1/3 text-sm border-gray-300 rounded focus:ring-emerald-500 focus:border-emerald-500" value={form.fechaduraGrid} onChange={e => setForm({...form, fechaduraGrid: e.target.value})} />
                     <input type="text" placeholder="Tipo" className="w-1/3 text-sm border-gray-300 rounded focus:ring-emerald-500 focus:border-emerald-500" value={form.fechaduraTipo} onChange={e => setForm({...form, fechaduraTipo: e.target.value})} />
                   </div>
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-gray-600 mb-1">Dobradiça</label>
                   <div className="flex gap-2">
                     <input type="text" placeholder="Marca" className="w-1/2 text-sm border-gray-300 rounded focus:ring-emerald-500 focus:border-emerald-500" value={form.dobradicaMarca} onChange={e => setForm({...form, dobradicaMarca: e.target.value})} />
                     <input type="text" placeholder="Medida" className="w-1/2 text-sm border-gray-300 rounded focus:ring-emerald-500 focus:border-emerald-500" value={form.dobradicaMedida} onChange={e => setForm({...form, dobradicaMedida: e.target.value})} />
                   </div>
                 </div>
                 
                 <label className="block text-xs font-bold text-gray-600 mb-1">Montantes (Se houver)</label>
                 <div className="flex gap-2">
                     <input type="text" placeholder="Medida" className="w-1/2 text-sm border-gray-300 rounded focus:ring-emerald-500 focus:border-emerald-500" value={form.montantesMedida} onChange={e => setForm({...form, montantesMedida: e.target.value})} />
                     <input type="text" placeholder="Folgas" className="w-1/2 text-sm border-gray-300 rounded focus:ring-emerald-500 focus:border-emerald-500" value={form.montantesFolgas} onChange={e => setForm({...form, montantesFolgas: e.target.value})} />
                 </div>
                 
                 <label className="block text-xs font-bold text-gray-600 mb-1">Bits por folha</label>
                 <div className="flex gap-2">
                     <input type="text" placeholder="Qtde" className="w-1/2 text-sm border-gray-300 rounded focus:ring-emerald-500 focus:border-emerald-500" value={form.bitsQtde} onChange={e => setForm({...form, bitsQtde: e.target.value})} />
                     <input type="text" placeholder="Faces" className="w-1/2 text-sm border-gray-300 rounded focus:ring-emerald-500 focus:border-emerald-500" value={form.bitsFaces} onChange={e => setForm({...form, bitsFaces: e.target.value})} />
                 </div>
              </div>
            </div>

            {/* Bloco 4 - Características Exras e Observacoes */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-800 border-b pb-2">Características</h4>
              <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                 {[
                   { label: 'Camarão', key: 'camarao' },
                   { label: 'Correr', key: 'correr' },
                   { label: 'Pivotante', key: 'pivotante' },
                   { label: 'C/ Veneziana', key: 'veneziana' },
                   { label: 'C/ Grelha', key: 'grelha' },
                   { label: 'C/ Bandeira', key: 'bandeira' },
                   { label: 'C/ Chapa', key: 'chapa' },
                   { label: 'C/ Vidro', key: 'vidro' },
                   { label: 'C/ Fecha Fresta', key: 'fechaFresta' },
                 ].map(({ label, key }) => (
                   <label key={key} className="flex items-center space-x-2 text-sm">
                     <input type="checkbox" className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" checked={form[key as keyof typeof form] as boolean} onChange={e => setForm({...form, [key]: e.target.checked})} />
                     <span className="text-gray-700">{label}</span>
                   </label>
                 ))}
                 
                 <div className="col-span-2 pt-2 border-t border-gray-100">
                    <label className="flex items-center space-x-2 text-sm font-bold text-emerald-800 bg-emerald-50 p-2 rounded border border-emerald-100">
                     <input type="checkbox" className="rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500" checked={form.kitDuplo} onChange={e => setForm({...form, kitDuplo: e.target.checked})} />
                     <span>Tratar como Kit Duplo (AutoReport)</span>
                   </label>
                 </div>
              </div>
            </div>
         </div>
`;

code = code.replace(/<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">(.|\n)*?<div className="sm:col-span-2 md:col-span-2 lg:col-span-5 flex justify-end">/, formUI + '\n         <div className="sm:col-span-2 md:col-span-2 lg:col-span-5 flex justify-end">');

const renderTableBodyOld = /<tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">[\s\S]*?<\/table>/;
const renderTableBodyNew = `<tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {kits.map((kit, idx) => (
                     <tr key={kit.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-150">
                        <td className="p-2 border-r border-[#e2efda] dark:border-emerald-800/40 text-center whitespace-nowrap">
                          <button onClick={() => deleteKit(kit.id)} className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-1.5 rounded-md transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center font-medium">{kit.bloco}</td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center font-bold text-emerald-700 dark:text-emerald-400">{kit.apto}</td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center">{kit.pavimento}</td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center">{kit.coluna}</td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 font-medium">{kit.comodo}</td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 font-mono text-center">{kit.folhaLargura}</td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 font-mono text-center">{kit.folhaAltura}</td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center font-medium"><span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-xs font-bold">{kit.qtdeFolhasPorKit}</span></td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700">{kit.acabamentoPorta}</td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700">{kit.caracteristicaPorta}</td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 font-medium text-xs">{kit.abertura}</td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 font-mono text-center">{kit.aduelaLargura}</td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 font-mono text-center">{kit.aduelaAltura}</td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center">{kit.regulagem}</td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700">{kit.acabamentoAduela}</td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700">{kit.fechaduraMarca}</td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center">{kit.fechaduraGrid}</td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center">{kit.fechaduraTipo}</td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700">{kit.dobradicaMarca}</td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center">{kit.dobradicaMedida}</td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center font-bold bg-gray-50">{kit.qtdeLadosAduela}</td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center">{kit.montantesMedida}</td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center">{kit.montantesFolgas}</td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center">{kit.bitsQtde}</td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center">{kit.bitsFaces}</td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center text-emerald-600 font-bold">{kit.camarao ? 'X' : ''}</td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center text-emerald-600 font-bold">{kit.correr ? 'X' : ''}</td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center text-emerald-600 font-bold">{kit.pivotante ? 'X' : ''}</td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center text-emerald-600 font-bold">{kit.veneziana ? 'X' : ''}</td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center text-emerald-600 font-bold">{kit.grelha ? 'X' : ''}</td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center text-emerald-600 font-bold">{kit.bandeira ? 'X' : ''}</td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center text-emerald-600 font-bold">{kit.chapa ? 'X' : ''}</td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center text-emerald-600 font-bold">{kit.vidro ? 'X' : ''}</td>
                        <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center text-emerald-600 font-bold">{kit.fechaFresta ? 'X' : ''}</td>
                     </tr>
                  ))}
                  {kits.length === 0 && (
                     <tr><td colSpan={35} className="p-8 text-center text-gray-500 italic">Nenhum kit cadastrado. Comece a digitar as informações ou cole a planilha.</td></tr>
                  )}
               </tbody>
            </table>`;
code = code.replace(renderTableBodyOld, renderTableBodyNew);

const advancedHeadersOld = /<thead className="bg-\[#e2efda\] dark:bg-emerald-900\/40 text-xs uppercase text-gray-800 dark:text-emerald-100 sticky top-0 border-b border-gray-300 dark:border-gray-600">[\s\S]*?<\/thead>/;
const advancedHeadersNew = `<thead className="bg-[#e2efda] dark:bg-emerald-900/40 text-[10px] uppercase text-gray-800 dark:text-emerald-100 sticky top-0 border-b border-gray-300 dark:border-gray-600">
                  <tr>
                     {['AÇÕES', 'BLOCO', 'APTO', 'PAVIMENTO', 'COLUNA', 'CÔMODO', 'FOLHA LARG', 'FOLHA ALT', 'QTD FOLHA/KIT', 'ACABAMENTO DA PORTA', 'CARACTERISTICA DA PORTA', 'ABERTURA', 'ADUELA LARG', 'ADUELA ALT', 'REGULAGEM', 'ACABAMENTO DA ADUELA', 'FECH. MARCA', 'FECH. GRID', 'FECH. TIPO', 'DOBRADIÇA MARCA', 'DOBRADIÇA MEDIDA', 'QTD LADOS ADUELA', 'MONTANTES MEDIDA', 'MONTANTES FOLGAS', 'B. QTD', 'B. FACES', 'CAM', 'CORRER', 'PIV', 'C/VEN', 'C/GRE', 'C/BAND', 'C/CHAPA', 'C/VID', 'C/FF'].map((h, i) => (
                         <th key={i} className="p-2 border-r border-[#c2d6b3] dark:border-emerald-800/40 font-bold text-center whitespace-pre">{h}</th>
                     ))}
                  </tr>
               </thead>`;
code = code.replace(advancedHeadersOld, advancedHeadersNew);

// Bump version 
code = code.replace(/'nacional_madeiras_kits_v4'/g, "'nacional_madeiras_kits_v5'");

fs.writeFileSync(file, code);
