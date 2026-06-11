const fs = require('fs');

const file = 'src/components/LancamentosRelatoriosModule.tsx';
let code = fs.readFileSync(file, 'utf8');

// Add bloco to interface KitLancamento if it's not there
if (code.includes('interface KitLancamento {') && !code.includes('bloco: string;')) {
  code = code.replace(/interface KitLancamento \{\n  id: string;\n/, "interface KitLancamento {\n  id: string;\n  bloco: string;\n");
}

if (!code.includes("bloco: ''")) {
  code = code.replace(/const INITIAL_FORM: Omit<KitLancamento, 'id'> = {/, "const INITIAL_FORM: Omit<KitLancamento, 'id'> = {\n  bloco: '',");
}

const data = [
  { "bloco": "1", "apto": "102", "pavimento": "1", "coluna": "2", "comodo": "BANHEIRO", "tipologia": "PM1F", "folhaLargura": "620", "folhaAltura": "2070", "qtdeFolhasPorKit": "1", "acabamento": "BRANCO", "caracteristica": "HONEY", "abertura": "ESQUERDA", "aduelaLargura": "90", "aduelaAltura": "2120", "regulagem": "REG 50", "acabA": "PET MDF BRA+BOR+REG", "fMar": "LA FONTE", "fGrid": "55", "fTipo": "WC", "dMar": "LA FONTE", "dMed": "3 x 2,5", "qLA": "3", "mM": "", "mF": "", "bQ": "", "bF": "", "cam": false, "cor": false, "piv": false, "ven": false, "gre": true, "ban": false, "cha": false, "vid": false, "fF": false },
  { "bloco": "1", "apto": "104", "pavimento": "1", "coluna": "4", "comodo": "ENTRADA", "tipologia": "PM3", "folhaLargura": "820", "folhaAltura": "2100", "qtdeFolhasPorKit": "1", "acabamento": "BRANCO", "caracteristica": "SOLIDA", "abertura": "ESQUERDA P/FORA", "aduelaLargura": "170", "aduelaAltura": "2110", "regulagem": "REG 50", "acabA": "PET MDF BRA+BOR+REG", "fMar": "PAPAIZ", "fGrid": "40", "fTipo": "EXT", "dMar": "LA FONTE", "dMed": "3 x 2,5", "qLA": "3", "mM": "", "mF": "", "bQ": "4", "bF": "2", "cam": false, "cor": false, "piv": false, "ven": false, "gre": false, "ban": false, "cha": false, "vid": false, "fF": true },
  { "bloco": "1", "apto": "106", "pavimento": "1", "coluna": "6", "comodo": "QUARTO", "tipologia": "PM2", "folhaLargura": "720", "folhaAltura": "2100", "qtdeFolhasPorKit": "1", "acabamento": "BRANCO", "caracteristica": "HONEY", "abertura": "DIREITA", "aduelaLargura": "90", "aduelaAltura": "2110", "regulagem": "REG 70", "acabA": "PET MDF BRA+BOR+REG", "fMar": "LA FONTE", "fGrid": "55", "fTipo": "INT", "dMar": "LA FONTE", "dMed": "3 x 2,5", "qLA": "3", "mM": "", "mF": "", "bQ": "", "bF": "", "cam": false, "cor": false, "piv": false, "ven": false, "gre": false, "ban": false, "cha": false, "vid": false, "fF": false },
  { "bloco": "1", "apto": "202", "pavimento": "2", "coluna": "2", "comodo": "ENTRADA", "tipologia": "PM3", "folhaLargura": "820", "folhaAltura": "2100", "qtdeFolhasPorKit": "1", "acabamento": "BRANCO", "caracteristica": "SOLIDA", "abertura": "DIREITA", "aduelaLargura": "170", "aduelaAltura": "2110", "regulagem": "REG 70", "acabA": "PET MDF BRA+BOR+REG", "fMar": "PAPAIZ", "fGrid": "40", "fTipo": "EXT", "dMar": "LA FONTE", "dMed": "3 x 2,5", "qLA": "3", "mM": "", "mF": "", "bQ": "4", "bF": "2", "cam": false, "cor": false, "piv": false, "ven": false, "gre": false, "ban": false, "cha": false, "vid": false, "fF": true },
  { "bloco": "1", "apto": "206", "pavimento": "2", "coluna": "6", "comodo": "COZINHA", "tipologia": "PM3F", "folhaLargura": "820", "folhaAltura": "2070", "qtdeFolhasPorKit": "1", "acabamento": "BRANCO", "caracteristica": "SARRAFEADA", "abertura": "DIREITA P/FORA", "aduelaLargura": "150", "aduelaAltura": "2120", "regulagem": "REG 50", "acabA": "PET MDF BRA+BOR+REG", "fMar": "LA FONTE", "fGrid": "55", "fTipo": "INT", "dMar": "LA FONTE", "dMed": "3 x 2,5", "qLA": "3", "mM": "", "mF": "", "bQ": "", "bF": "", "cam": false, "cor": true, "piv": false, "ven": true, "gre": true, "ban": false, "cha": false, "vid": false, "fF": false },
  { "bloco": "1", "apto": "309", "pavimento": "3", "coluna": "9", "comodo": "COZINHA", "tipologia": "PM3F", "folhaLargura": "820", "folhaAltura": "2070", "qtdeFolhasPorKit": "1", "acabamento": "BRANCO", "caracteristica": "SARRAFEADA", "abertura": "DIREITA", "aduelaLargura": "150", "aduelaAltura": "2120", "regulagem": "REG 50", "acabA": "PET MDF BRA+BOR+REG", "fMar": "LA FONTE", "fGrid": "55", "fTipo": "INT", "dMar": "LA FONTE", "dMed": "3 x 2,5", "qLA": "3", "mM": "", "mF": "", "bQ": "", "bF": "", "cam": false, "cor": true, "piv": false, "ven": false, "gre": false, "ban": false, "cha": false, "vid": true, "fF": false },
  { "bloco": "1", "apto": "509", "pavimento": "5", "coluna": "9", "comodo": "COZINHA", "tipologia": "PM3F", "folhaLargura": "820", "folhaAltura": "2070", "qtdeFolhasPorKit": "1", "acabamento": "BRANCO", "caracteristica": "SARRAFEADA", "abertura": "ESQUERDA", "aduelaLargura": "150", "aduelaAltura": "2120", "regulagem": "REG 50", "acabA": "PET MDF BRA+BOR+REG", "fMar": "LA FONTE", "fGrid": "55", "fTipo": "INT", "dMar": "LA FONTE", "dMed": "3 x 2,5", "qLA": "3", "mM": "", "mF": "", "bQ": "", "bF": "", "cam": false, "cor": false, "piv": false, "ven": false, "gre": false, "ban": false, "cha": false, "vid": true, "fF": false },
  { "bloco": "1", "apto": "709", "pavimento": "7", "coluna": "9", "comodo": "COZINHA", "tipologia": "PM3F", "folhaLargura": "820", "folhaAltura": "2070", "qtdeFolhasPorKit": "1", "acabamento": "BRANCO", "caracteristica": "SARRAFEADA", "abertura": "ESQUERDA", "aduelaLargura": "150", "aduelaAltura": "2120", "regulagem": "REG 50", "acabA": "PET MDF BRA+BOR+REG", "fMar": "LA FONTE", "fGrid": "55", "fTipo": "INT", "dMar": "PAPAIZ", "dMed": "3 x 2,5", "qLA": "3", "mM": "", "mF": "", "bQ": "", "bF": "", "cam": false, "cor": true, "piv": false, "ven": true, "gre": true, "ban": false, "cha": false, "vid": true, "fF": false },
  { "bloco": "1", "apto": "703", "pavimento": "7", "coluna": "3", "comodo": "COZINHA", "tipologia": "PM3F", "folhaLargura": "820", "folhaAltura": "2070", "qtdeFolhasPorKit": "1", "acabamento": "BRANCO", "caracteristica": "SARRAFEADA", "abertura": "DIREITA", "aduelaLargura": "150", "aduelaAltura": "2120", "regulagem": "REG 50", "acabA": "PET MDF BRA+BOR+REG", "fMar": "LA FONTE", "fGrid": "55", "fTipo": "INT", "dMar": "PAPAIZ", "dMed": "3 x 2,5", "qLA": "3", "mM": "", "mF": "", "bQ": "", "bF": "", "cam": false, "cor": true, "piv": false, "ven": false, "gre": true, "ban": false, "cha": false, "vid": true, "fF": false },
  { "bloco": "1", "apto": "302", "pavimento": "3", "coluna": "2", "comodo": "LIXEIRA", "tipologia": "PM7", "folhaLargura": "1440", "folhaAltura": "2100", "qtdeFolhasPorKit": "2", "acabamento": "BRANCO", "caracteristica": "SARRAFEADA", "abertura": "ESQUERDA P/FORA", "aduelaLargura": "130", "aduelaAltura": "2110", "regulagem": "REG 50", "acabA": "PET MDF BRA+BOR+REG", "fMar": "LA FONTE", "fGrid": "45,1", "fTipo": "SÓ MAÇ.", "dMar": "LA FONTE", "dMed": "3 x 2,5", "qLA": "3", "mM": "", "mF": "", "bQ": "", "bF": "", "cam": false, "cor": false, "piv": false, "ven": false, "gre": false, "ban": false, "cha": false, "vid": false, "fF": false },
  { "bloco": "1", "apto": "306", "pavimento": "3", "coluna": "6", "comodo": "ELETRICA", "tipologia": "PM12", "folhaLargura": "1020", "folhaAltura": "1800", "qtdeFolhasPorKit": "2", "acabamento": "BRANCO", "caracteristica": "HONEY", "abertura": "ESQUERDA P/FORA", "aduelaLargura": "70", "aduelaAltura": "2110", "regulagem": "FIXO", "acabA": "PET MDF BRA+BOR+REG", "fMar": "LA FONTE", "fGrid": "45", "fTipo": "MEIO CIL.", "dMar": "LA FONTE", "dMed": "3 x 2,5", "qLA": "4", "mM": "", "mF": "", "bQ": "", "bF": "", "cam": false, "cor": false, "piv": false, "ven": false, "gre": false, "ban": false, "cha": false, "vid": false, "fF": false },
  { "bloco": "1", "apto": "308", "pavimento": "3", "coluna": "8", "comodo": "SUITE 2", "tipologia": "PM2", "folhaLargura": "720", "folhaAltura": "2100", "qtdeFolhasPorKit": "1", "acabamento": "BRANCO", "caracteristica": "SARRAFEADA", "abertura": "DIREITA", "aduelaLargura": "150", "aduelaAltura": "2110", "regulagem": "REG 70", "acabA": "PET MDF BRA+BOR+REG", "fMar": "LA FONTE", "fGrid": "55", "fTipo": "INT", "dMar": "LA FONTE", "dMed": "3 x 2,5", "qLA": "3", "mM": "", "mF": "", "bQ": "", "bF": "", "cam": false, "cor": false, "piv": false, "ven": false, "gre": false, "ban": false, "cha": false, "vid": false, "fF": false },
  { "bloco": "1", "apto": "309", "pavimento": "3", "coluna": "9", "comodo": "COZINHA", "tipologia": "PM3F", "folhaLargura": "820", "folhaAltura": "2070", "qtdeFolhasPorKit": "1", "acabamento": "BRANCO", "caracteristica": "SARRAFEADA", "abertura": "ESQUERDA", "aduelaLargura": "150", "aduelaAltura": "2120", "regulagem": "REG 50", "acabA": "PET MDF BRA+BOR+REG", "fMar": "LA FONTE", "fGrid": "55", "fTipo": "INT", "dMar": "LA FONTE", "dMed": "3 x 2,5", "qLA": "3", "mM": "", "mF": "", "bQ": "", "bF": "", "cam": false, "cor": false, "piv": false, "ven": false, "gre": false, "ban": false, "cha": false, "vid": false, "fF": false },
  { "bloco": "2", "apto": "405", "pavimento": "4", "coluna": "5", "comodo": "BANH. SOCIAL", "tipologia": "PM1", "folhaLargura": "620", "folhaAltura": "2100", "qtdeFolhasPorKit": "1", "acabamento": "BRANCO", "caracteristica": "HONEY", "abertura": "DIREITA", "aduelaLargura": "110", "aduelaAltura": "2120", "regulagem": "REG 50", "acabA": "PET MDF BRA+BOR+REG", "fMar": "PAPAIZ", "fGrid": "55", "fTipo": "WC", "dMar": "LA FONTE", "dMed": "3 x 2,5", "qLA": "3", "mM": "", "mF": "", "bQ": "", "bF": "", "cam": false, "cor": false, "piv": false, "ven": false, "gre": false, "ban": false, "cha": false, "vid": false, "fF": false },
  { "bloco": "2", "apto": "501", "pavimento": "5", "coluna": "1", "comodo": "SUITE", "tipologia": "PM2", "folhaLargura": "720", "folhaAltura": "2100", "qtdeFolhasPorKit": "1", "acabamento": "BRANCO", "caracteristica": "SARRAFEADA", "abertura": "DIREITA", "aduelaLargura": "110", "aduelaAltura": "2110", "regulagem": "REG 50", "acabA": "PET MDF BRA+BOR+REG", "fMar": "PAPAIZ", "fGrid": "55", "fTipo": "INT", "dMar": "LA FONTE", "dMed": "3 x 2,5", "qLA": "3", "mM": "", "mF": "", "bQ": "", "bF": "", "cam": false, "cor": false, "piv": false, "ven": false, "gre": false, "ban": false, "cha": false, "vid": false, "fF": false },
  { "bloco": "2", "apto": "503", "pavimento": "5", "coluna": "3", "comodo": "BANH. SUITE", "tipologia": "PM1F", "folhaLargura": "620", "folhaAltura": "2070", "qtdeFolhasPorKit": "1", "acabamento": "BRANCO", "caracteristica": "HONEY", "abertura": "ESQUERDA", "aduelaLargura": "90", "aduelaAltura": "2120", "regulagem": "REG 70", "acabA": "PET MDF BRA+BOR+REG", "fMar": "PAPAIZ", "fGrid": "55", "fTipo": "WC", "dMar": "LA FONTE", "dMed": "3 x 2,5", "qLA": "3", "mM": "", "mF": "", "bQ": "", "bF": "", "cam": false, "cor": false, "piv": false, "ven": false, "gre": false, "ban": false, "cha": false, "vid": false, "fF": false },
  { "bloco": "2", "apto": "604", "pavimento": "6", "coluna": "4", "comodo": "QUARTO", "tipologia": "PM2", "folhaLargura": "720", "folhaAltura": "2100", "qtdeFolhasPorKit": "2", "acabamento": "BRANCO", "caracteristica": "SARRAFEADA", "abertura": "ESQUERDA", "aduelaLargura": "130", "aduelaAltura": "2110", "regulagem": "REG 50", "acabA": "PET MDF BRA+BOR+REG", "fMar": "PAPAIZ", "fGrid": "55", "fTipo": "INT", "dMar": "PAPAIZ", "dMed": "3 x 2,5", "qLA": "3", "mM": "", "mF": "", "bQ": "", "bF": "", "cam": false, "cor": false, "piv": false, "ven": false, "gre": false, "ban": false, "cha": false, "vid": false, "fF": false },
  { "bloco": "2", "apto": "400", "pavimento": "4", "coluna": "0", "comodo": "SHAFT", "tipologia": "PM19", "folhaLargura": "1800", "folhaAltura": "2100", "qtdeFolhasPorKit": "3", "acabamento": "BRANCO", "caracteristica": "HONEY", "abertura": "ESQUERDA P/FORA", "aduelaLargura": "70", "aduelaAltura": "2110", "regulagem": "FIXO", "acabA": "PET MDF BRA+BOR+REG", "fMar": "PAPAIZ", "fGrid": "45", "fTipo": "MEIO CIL.", "dMar": "PAPAIZ", "dMed": "3 x 2,5", "qLA": "3", "mM": "40", "mF": "20", "bQ": "", "bF": "", "cam": false, "cor": false, "piv": false, "ven": false, "gre": false, "ban": false, "cha": false, "vid": false, "fF": false },
  { "bloco": "2", "apto": "600", "pavimento": "6", "coluna": "0", "comodo": "ESPECIAIS 1", "tipologia": "PM18", "folhaLargura": "2000", "folhaAltura": "1800", "qtdeFolhasPorKit": "4", "acabamento": "BRANCO", "caracteristica": "HONEY", "abertura": "ESQUERDA P/FORA", "aduelaLargura": "70", "aduelaAltura": "2110", "regulagem": "FIXO", "acabA": "PET MDF BRA+BOR+REG", "fMar": "PAPAIZ", "fGrid": "45", "fTipo": "MEIO CIL.", "dMar": "PAPAIZ", "dMed": "3 x 2,5", "qLA": "4", "mM": "40", "mF": "20", "bQ": "", "bF": "", "cam": false, "cor": false, "piv": false, "ven": false, "gre": false, "ban": false, "cha": false, "vid": false, "fF": false },
  { "bloco": "2", "apto": "600", "pavimento": "6", "coluna": "0", "comodo": "ESPECIAIS 2", "tipologia": "PM15", "folhaLargura": "1800", "folhaAltura": "2100", "qtdeFolhasPorKit": "4", "acabamento": "BRANCO", "caracteristica": "HONEY", "abertura": "ESQUERDA P/FORA", "aduelaLargura": "70", "aduelaAltura": "2110", "regulagem": "FIXO", "acabA": "PET MDF BRA+BOR+REG", "fMar": "PAPAIZ", "fGrid": "55,1", "fTipo": "EXT", "dMar": "PAPAIZ", "dMed": "3 x 2,5", "qLA": "3", "mM": "40", "mF": "20", "bQ": "", "bF": "", "cam": false, "cor": false, "piv": false, "ven": true, "gre": false, "ban": false, "cha": false, "vid": false, "fF": false },
  { "bloco": "2", "apto": "700", "pavimento": "7", "coluna": "0", "comodo": "ESPECIAIS 2", "tipologia": "PM15", "folhaLargura": "1800", "folhaAltura": "2100", "qtdeFolhasPorKit": "4", "acabamento": "BRANCO", "caracteristica": "HONEY", "abertura": "ESQUERDA P/FORA", "aduelaLargura": "70", "aduelaAltura": "2110", "regulagem": "FIXO", "acabA": "PET MDF BRA+BOR+REG", "fMar": "PAPAIZ", "fGrid": "55,1", "fTipo": "EXT", "dMar": "PAPAIZ", "dMed": "3 x 2,5", "qLA": "3", "mM": "40", "mF": "20", "bQ": "", "bF": "", "cam": false, "cor": false, "piv": false, "ven": true, "gre": false, "ban": false, "cha": false, "vid": false, "fF": false },
  { "bloco": "2", "apto": "800", "pavimento": "8", "coluna": "0", "comodo": "ESPECIAIS 2", "tipologia": "PM15", "folhaLargura": "1800", "folhaAltura": "2100", "qtdeFolhasPorKit": "4", "acabamento": "BRANCO", "caracteristica": "HONEY", "abertura": "ESQUERDA P/FORA", "aduelaLargura": "70", "aduelaAltura": "2110", "regulagem": "FIXO", "acabA": "PET MDF BRA+BOR+REG", "fMar": "PAPAIZ", "fGrid": "55,1", "fTipo": "EXT", "dMar": "PAPAIZ", "dMed": "3 x 2,5", "qLA": "3", "mM": "40", "mF": "20", "bQ": "", "bF": "", "cam": false, "cor": false, "piv": false, "ven": true, "gre": false, "ban": false, "cha": false, "vid": false, "fF": false },
  { "bloco": "2", "apto": "900", "pavimento": "9", "coluna": "0", "comodo": "ESPECIAIS", "tipologia": "PM22", "folhaLargura": "3600", "folhaAltura": "2100", "qtdeFolhasPorKit": "6", "acabamento": "BRANCO", "caracteristica": "HONEY", "abertura": "ESQUERDA P/FORA", "aduelaLargura": "70", "aduelaAltura": "2110", "regulagem": "FIXO", "acabA": "PET MDF BRA+BOR+REG", "fMar": "PAPAIZ", "fGrid": "45", "fTipo": "MEIO CIL.", "dMar": "PAPAIZ", "dMed": "3 x 2,5", "qLA": "3", "mM": "80", "mF": "40", "bQ": "", "bF": "", "cam": false, "cor": false, "piv": false, "ven": false, "gre": false, "ban": false, "cha": false, "vid": false, "fF": false },
  { "bloco": "2", "apto": "900", "pavimento": "9", "coluna": "0", "comodo": "ESPECIAIS", "tipologia": "PM22A", "folhaLargura": "3600", "folhaAltura": "1800", "qtdeFolhasPorKit": "6", "acabamento": "BRANCO", "caracteristica": "HONEY", "abertura": "ESQUERDA P/FORA", "aduelaLargura": "70", "aduelaAltura": "2110", "regulagem": "FIXO", "acabA": "PET MDF BRA+BOR+REG", "fMar": "PAPAIZ", "fGrid": "45", "fTipo": "MEIO CIL.", "dMar": "PAPAIZ", "dMed": "3 x 2,5", "qLA": "4", "mM": "80", "mF": "40", "bQ": "", "bF": "", "cam": false, "cor": false, "piv": false, "ven": false, "gre": false, "ban": false, "cha": false, "vid": false, "fF": false }
];

const mappedKits = data.map((item, idx) => {
  let obsTokens = [];
  if (item.acabA) obsTokens.push(`Aduela: ${item.acabA}`);
  if (item.fMar || item.fGrid || item.fTipo) obsTokens.push(`Fechadura: ${item.fMar} ${item.fGrid} ${item.fTipo}`);
  if (item.dMar || item.dMed) obsTokens.push(`Dobradica: ${item.dMar} ${item.dMed}`);
  if (item.mM || item.mF) obsTokens.push(`Montantes: Med ${item.mM} Folg ${item.mF}`);
  
  return {
    id: `k${idx + 1}`,
    bloco: item.bloco,
    apto: item.apto,
    pavimento: item.pavimento,
    coluna: item.coluna,
    comodo: item.comodo,
    folhaLargura: item.folhaLargura,
    folhaAltura: item.folhaAltura,
    tipologia: item.tipologia,
    abertura: item.abertura,
    aduelaLargura: item.aduelaLargura,
    aduelaAltura: item.aduelaAltura,
    regulagem: item.regulagem,
    qtdeFolhasPorKit: item.qtdeFolhasPorKit,
    acabamento: item.acabamento,
    caracteristica: item.caracteristica,
    qtdeLadosAduela: item.qLA,
    qtdeMontantes: '', // Handled in obs
    bitsQtde: item.bQ,
    bitsFaces: item.bF,
    camarao: item.cam,
    correr: item.cor,
    pivotante: item.piv,
    veneziana: item.ven,
    grelha: item.gre,
    bandeira: item.ban,
    chapa: item.cha,
    vidro: item.vid,
    fechaFresta: item.fF,
    kitDuplo: false,
    observacao: obsTokens.join(' | ')
  };
});

const newInitialKitsStr = `const INITIAL_KITS: KitLancamento[] = \n` + JSON.stringify(mappedKits, null, 2) + `;`;

code = code.replace(/const INITIAL_KITS: KitLancamento\[\] = \[(.|\n)*?\];/, newInitialKitsStr);

// To ensure visual fields are updated
// Let's add 'bloco' visualization to the Lancamentos table if "Bloco" is not displayed
if (!code.includes('>Bloco</th>')) {
  code = code.replace(
    '<th className="p-2 border-r border-[#c2d6b3] dark:border-emerald-800/40 font-bold text-center">Apto</th>',
    '<th className="p-2 border-r border-[#c2d6b3] dark:border-emerald-800/40 font-bold text-center">Bloco</th>\n                     <th className="p-2 border-r border-[#c2d6b3] dark:border-emerald-800/40 font-bold text-center">Apto</th>'
  );
  
  code = code.replace(
    '<td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center font-bold text-emerald-700 dark:text-emerald-400">{kit.apto}</td>',
    '<td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center">{kit.bloco}</td>\n                           <td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center font-bold text-emerald-700 dark:text-emerald-400">{kit.apto}</td>'
  );
  
  code = code.replace(
    '<label className="block text-xs font-medium text-gray-600 mb-1">Apto</label>',
    '<label className="block text-xs font-medium text-gray-600 mb-1">Bloco</label>\n                  <input\n                    type="text"\n                    className="w-full text-sm border-gray-300 rounded focus:ring-emerald-500 focus:border-emerald-500"\n                    value={form.bloco}\n                    onChange={e => setForm({...form, bloco: e.target.value})}\n                  />\n                </div>\n                <div>\n                  <label className="block text-xs font-medium text-gray-600 mb-1">Apto</label>'
  );
  
  code = code.replace(
    "const headers = [['Apto'",
    "const headers = [['Bloco', 'Apto'"
  );
  code = code.replace(
    "const dataToExport = kits.map(k => [k.apto",
    "const dataToExport = kits.map(k => [k.bloco, k.apto"
  );
  
  code = code.replace(
    "const apto = cols[0];",
    "const bloco = cols[0];\n      const apto = cols[1];"
  );
  code = code.replace(
    /const pav = cols\[1\];\n      const col = cols\[2\];\n      const comodo = cols\[3\];\n      const fLarg = cols\[4\];\n      const fAlt = cols\[5\];\n      const tipo = cols\[6\];\n      const aberto = cols\[7\];\n      const aLarg = cols\[8\];\n      const aAlt = cols\[9\];\n      const acab = cols\[10\];\n      const qtde = cols\[11\];/g,
    "const pav = cols[2];\n      const col = cols[3];\n      const comodo = cols[4];\n      const fLarg = cols[5];\n      const fAlt = cols[6];\n      const tipo = cols[7];\n      const aberto = cols[8];\n      const aLarg = cols[9];\n      const aAlt = cols[10];\n      const acab = cols[11];\n      const qtde = cols[12];"
  );
  code = code.replace(
    "apto: apto || '',",
    "bloco: bloco || '',\n        apto: apto || '',"
  );
}

// BUMP version
code = code.replace(/'nacional_madeiras_kits_v3'/g, "'nacional_madeiras_kits_v4'");

fs.writeFileSync(file, code);

const file2 = 'src/components/RelatoriosModule.tsx';
if (fs.existsSync(file2)) {
  let code2 = fs.readFileSync(file2, 'utf8');
  code2 = code2.replace(/'nacional_madeiras_kits_v3'/g, "'nacional_madeiras_kits_v4'");
  fs.writeFileSync(file2, code2);
}

const file3 = 'src/components/AutoReports.tsx';
if (fs.existsSync(file3)) {
  let code3 = fs.readFileSync(file3, 'utf8');
  code3 = code3.replace(/'nacional_madeiras_kits_v3'/g, "'nacional_madeiras_kits_v4'");
  fs.writeFileSync(file3, code3);
}

