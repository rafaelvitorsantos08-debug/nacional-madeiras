const fs = require('fs');
const file = 'src/components/LancamentosRelatoriosModule.tsx';
let code = fs.readFileSync(file, 'utf8');

const bulkRegex = /const handleBulkInsert = \(\) => \{[\s\S]*?\};/m;

const handleBulkLogicNew = `const handleBulkInsert = () => {
    const lines = bulkText.trim().split('\\n');
    const newKits = [];
    
    lines.forEach(line => {
      const cols = line.split('\\t').map(c => c.trim());
      if (cols.length < 5) return; // Skip invalid lines
      
      const newKit = {
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

// The old logic starts with const handleBulkInsert = () => { and ends somewhere. Let's find it securely.
const start = code.indexOf('const handleBulkInsert = () => {');
if (start !== -1) {
    let end = code.indexOf('setShowBulkModal(false);', start);
    if (end !== -1) {
        end = code.indexOf(';', end) + 1; // get to the end of the line
        end = code.indexOf('}', end) + 1; // } of the if block
        let end2 = code.indexOf('};', end) + 2; // }; of the function definition
        if (end2 !== -1) {
             const oldStr = code.substring(start, end2);
             code = code.replace(oldStr, handleBulkLogicNew);
             fs.writeFileSync(file, code);
             console.log("Bulk update applied");
        }
    }
}
