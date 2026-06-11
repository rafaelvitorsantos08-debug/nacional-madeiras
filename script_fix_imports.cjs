const fs = require('fs');
const file = 'src/components/LancamentosRelatoriosModule.tsx';
let code = fs.readFileSync(file, 'utf8');

const exportPdfOld = /const exportToPDF = \(\) => \{[\s\S]*?doc\.save\('kits_lancados\.pdf'\);\n  \};/;
const exportPdfNew = `const exportToPDF = () => {
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
  };`;

code = code.replace(exportPdfOld, exportPdfNew);

const massImportOld = /const handleMassImport = \(\) => \{[\s\S]*?setBulkText\(''\);\n    \}\n  \};/;
const massImportNew = `const handleMassImport = () => {
    if (!bulkText.trim()) return;
    
    // Parse TSV
    const lines = bulkText.split('\\n');
    const newKits: KitLancamento[] = [];
    
    for (const line of lines) {
      const cols = line.split('\\t').map(c => c?.trim() || '');
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
  };`;

code = code.replace(massImportOld, massImportNew);

fs.writeFileSync(file, code);
