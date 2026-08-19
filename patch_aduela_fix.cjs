const fs = require('fs');
const filePath = 'src/components/AutoReports.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

const targetStr = `                  const aduelaInfo = [
                    firstKit.aduelaLargura && firstKit.aduelaAltura ? \\\`\\\${firstKit.aduelaLargura}x\\\${firstKit.aduelaAltura}\\\` : null,
                    firstKit.montantesMedida ? \\\`D\\\${firstKit.montantesMedida}\\\` : null,
                    firstKit.montantesFolgas ? \\\`F\\\${firstKit.montantesFolgas}\\\` : null,
                    firstKit.qtdeLadosAduela ? \\\`\\\${firstKit.qtdeLadosAduela} lados\\\` : null
                  ].filter(Boolean).join(' - ') || '-';`;

const newStr = `                  const aduelaInfo = [
                    firstKit.aduelaLargura && firstKit.aduelaAltura ? \\\`\\\${firstKit.aduelaLargura}x\\\${firstKit.aduelaAltura}\\\` : null,
                    firstKit.acabamentoAduela ? firstKit.acabamentoAduela : null,
                    firstKit.montantesMedida ? \\\`D\\\${firstKit.montantesMedida}\\\` : null,
                    firstKit.montantesFolgas ? \\\`F\\\${firstKit.montantesFolgas}\\\` : null,
                    firstKit.qtdeLadosAduela ? \\\`\\\${firstKit.qtdeLadosAduela} lados\\\` : null
                  ].filter(Boolean).join(' - ') || '-';`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, newStr);
  fs.writeFileSync(filePath, content);
  console.log("Patched aduela info");
} else {
  console.log("Could not find aduela info string");
}
