const fs = require('fs');
const file = 'src/components/LancamentosRelatoriosModule.tsx';
let code = fs.readFileSync(file, 'utf8');

const exportExcelOld = /const exportToExcel = \(\) => \{[\s\S]*?XLSX\.writeFile\(workbook, 'kits_lancados\.xlsx'\);\n  \};/;
const exportExcelNew = `const exportToExcel = () => {
    if (kits.length === 0) return;
    const headers = [
      ['BLOCO', 'APTO', 'PAVIMENTO', 'COLUNA', 'CÔMODO', 'TIPOLOGIA', 'FOLHA DE PORTA LARGURA', 'FOLHA DE PORTA ALTURA', 'QUANTIDADE DE FOLHA POR KIT', 'ACABAMENTO DA PORTA', 'CARACTERISTICA DA PORTA', 'ABERTURA', 'ADUELA LARGURA', 'ADUELA ALTURA', 'REGULAGEM', 'ACABAMENTO DA ADUELA', 'FECHADURA MARCA', 'FECHADURA GRID', 'FECHADURA TIPO', 'DOBRADIÇA MARCA', 'DOBRADIÇA MEDIDA', 'QTDE DE LADOS DA ADUELA', 'MONTANTES MEDIDA', 'MONTANTES FOLGAS', 'BITS POR FOLHA QTDE', 'BITS POR FOLHA FACES', 'CAMARÃO', 'CORRER', 'PIVOTANTE', 'C/VENEZIANA', 'C/GRELHA', 'C/BANDEIRA', 'C/CHAPA', 'C/VIDRO', 'C/FECHA FRESTA']
    ];

    const dataToExport = kits.map(k => [
      k.bloco || '', k.apto || '', k.pavimento || '', k.coluna || '', k.comodo || '', k.tipologia || '',
      k.folhaLargura || '', k.folhaAltura || '', k.qtdeFolhasPorKit || '', k.acabamentoPorta || '', k.caracteristicaPorta || '', k.abertura || '',
      k.aduelaLargura || '', k.aduelaAltura || '', k.regulagem || '', k.acabamentoAduela || '',
      k.fechaduraMarca || '', k.fechaduraGrid || '', k.fechaduraTipo || '', k.dobradicaMarca || '', k.dobradicaMedida || '',
      k.qtdeLadosAduela || '', k.montantesMedida || '', k.montantesFolgas || '', k.bitsQtde || '', k.bitsFaces || '',
      k.camarao ? 'X' : '', k.correr ? 'X' : '', k.pivotante ? 'X' : '', k.veneziana ? 'X' : '', k.grelha ? 'X' : '', k.bandeira ? 'X' : '', k.chapa ? 'X' : '', k.vidro ? 'X' : '', k.fechaFresta ? 'X' : ''
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet([...headers, ...dataToExport]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Kits');
    XLSX.writeFile(workbook, 'kits_lancados.xlsx');
  };`;

code = code.replace(exportExcelOld, exportExcelNew);

// What about Bulk Insert? Did it replace?
// Let's check.
fs.writeFileSync(file, code);
