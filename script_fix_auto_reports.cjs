const fs = require('fs');

const file = 'src/components/AutoReports.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/acabamento: k\.acabamento/g, "acabamento: k.acabamentoAduela");
code = code.replace(/k\.acabamento \|\|/g, "k.acabamentoAduela ||");

code = code.replace(/k\.folhaLargura}x\${k\.folhaAltura}-\${k\.acabamentoAduela/g, "k.folhaLargura}x${k.folhaAltura}-${k.acabamentoPorta");

// For processPortas particularly:
code = code.replace(/const char = \(k\.caracteristicaPorta \|\| k\.modelo \|\| 'HONEY'\)\.toUpperCase\(\);/, "const char = (k.caracteristicaPorta || k.modelo || 'HONEY').toUpperCase();");

// Fix processPortas finish:
code = code.replace(/acabamento: k\.acabamentoAduela \|\| 'BRANCO', \n          caracteristica: char,/g, "acabamento: k.acabamentoPorta || 'BRANCO', \n          caracteristica: char,");

code = code.replace(/acabamento: k\.acabamentoAduela \|\| 'BRANCO'/g, "acabamento: k.acabamentoPorta || 'BRANCO'");

// Quick fix via just mapping it back in the top if we need to:
// Actually let's just rewrite processPortas manually here.
const processPortasOld = /function processPortas\(kits: any\[\]\) \{[\s\S]*?\}\n\nfunction renderAutoPortas/;
const processPortasNew = `function processPortas(kits: any[]) {
   const agrupar = new Map();
   kits.forEach(k => {
      if (!k.folhaLargura || !k.folhaAltura) return;
      
      const char = (k.caracteristicaPorta || k.modelo || 'HONEY').toUpperCase();
      let charOrder = 99;
      if (char.includes('HONEY') || char.includes('COLMEIA')) charOrder = 1;
      else if (char.includes('SARRAFEADA')) charOrder = 2;
      else if (char.includes('SOLIDA') || char.includes('SÓLIDA')) charOrder = 3;

      const isDuplo = !!k.kitDuplo;
      const key = \`\${k.folhaLargura}x\${k.folhaAltura}-\${k.acabamentoPorta}-\${char}-\${isDuplo}\`;
      const maxQtd = parseInt(k.qtdeFolhasPorKit || '1', 10) || 1;
      const qtde = isDuplo ? maxQtd * 2 : maxQtd;
      
      let dimensaoDisplay = \`\${k.folhaLargura} x \${k.folhaAltura}\`;
      if (isDuplo) {
          const meiaLargura = parseInt(k.folhaLargura, 10) / 2;
          dimensaoDisplay = \`\${k.folhaLargura} x \${k.folhaAltura} (2x \${meiaLargura}x\${k.folhaAltura})\`;
      }

      const val = agrupar.get(key) || { 
          largura: parseInt(k.folhaLargura, 10), 
          altura: parseInt(k.folhaAltura, 10), 
          dimensaoDisplay,
          acabamento: k.acabamentoPorta || 'BRANCO', 
          caracteristica: char,
          charOrder: charOrder,
          qtd: 0 
      };
      val.qtd += qtde;
      agrupar.set(key, val);
   });
   
   return Array.from(agrupar.values()).sort((a, b) => {
       if (a.charOrder !== b.charOrder) return a.charOrder - b.charOrder;
       if (b.altura !== a.altura) return b.altura - a.altura;
       return b.largura - a.largura;
   });
}

function renderAutoPortas`;
code = code.replace(processPortasOld, processPortasNew);

// Alizares process
const processAlizaresOld = /function processAlizares\(kits: any\[\]\) \{[\s\S]*?\}\n\nfunction renderAutoAlizares/;
const processAlizaresNew = `function processAlizares(kits: any[]) {
   const agrupar = new Map();
   kits.forEach(k => {
      // based on qtdeLadosAduela
      const numLados = parseInt(k.qtdeLadosAduela || '0', 10) || 0;
      if (numLados === 0) return;
      const key = \`Padrao-\${k.cor || k.acabamentoAduela || 'NM'}\`;
      const val = agrupar.get(key) || { desc: \`Alizar - Kit Lados: \${numLados}\`, acabamento: k.acabamentoAduela || 'NM', qtd: 0 };
      val.qtd += numLados * (parseInt(k.qtdeFolhasPorKit || '1', 10) || 1); // multiplicador de kits e lados
      agrupar.set(key, val);
   });
   return Array.from(agrupar.values());
}

function renderAutoAlizares`;
code = code.replace(processAlizaresOld, processAlizaresNew);


fs.writeFileSync(file, code);
