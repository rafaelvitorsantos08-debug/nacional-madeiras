const fs = require('fs');
const filePath = 'src/components/AutoReports.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

const oldDimMapping = `          // Robust Dimensao check
          let rawLarg = k.folhaLarg || k.folha_larg || k.largura || k['FOLHA LARG'] || k['folha larg'];
          let rawAlt = k.folhaAlt || k.folha_alt || k.altura || k['FOLHA ALT'] || k['folha alt'];`;

const newDimMapping = `          // Robust Dimensao check
          let rawLarg = k.folhaLargura || k.folhaLarg || k.folha_larg || k.largura || k['FOLHA LARG'] || k['folha larg'];
          let rawAlt = k.folhaAltura || k.folhaAlt || k.folha_alt || k.altura || k['FOLHA ALT'] || k['folha alt'];`;

if (content.includes(oldDimMapping)) {
  content = content.replace(oldDimMapping, newDimMapping);
  fs.writeFileSync(filePath, content);
  console.log("Patched AutoReports dim keys.");
} else {
  console.log("Failed to patch AutoReports dim keys.");
}

