const fs = require('fs');
const file = 'src/components/AutoReports.tsx';
let code = fs.readFileSync(file, 'utf8');

// fix processUsinagem
code = code.replace(
  "const amountToAdd = isPorta ? qtde : 1;",
  "const amountToAdd = isPorta ? qtde : baseQtde;"
);

// fix processAduelas
code = code.replace(
  "val.qtd += 1; // 1 aduela por kit",
  "val.qtd += parseInt(k.qtdeFolhasPorKit || '1', 10) || 1; // multiplicador de kits"
);

// fix processVergas
code = code.replace(
  "const val = agrupar.get(key) || { aduelaLargura: k.aduelaLargura, vergaLength: vergaLength, folhaRef: fl, qtd: 0 };\n      val.qtd += 1;\n      agrupar.set(key, val);",
  "const val = agrupar.get(key) || { aduelaLargura: k.aduelaLargura, vergaLength: vergaLength, folhaRef: fl, qtd: 0 };\n      val.qtd += parseInt(k.qtdeFolhasPorKit || '1', 10) || 1;\n      agrupar.set(key, val);"
);

// fix processAlizares
code = code.replace(
  "val.qtd += numLados; // 1 lado = 1 jogo de alizar",
  "val.qtd += numLados * (parseInt(k.qtdeFolhasPorKit || '1', 10) || 1); // multiplicador de kits e lados"
);

fs.writeFileSync(file, code);
