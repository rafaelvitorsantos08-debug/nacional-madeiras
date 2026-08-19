const fs = require('fs');
const filePath = 'src/components/AutoReports.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// The line doing the grouping needs to be updated to map to the correct names
// from the CSV headers.
// Currently:
// const enc = (k.enchimento || 'S/ ENCHIMENTO').toUpperCase();
// const dim = k.dimensao || (k.largura && k.altura ? \`\${k.largura} x \${k.altura}\` : 'S/ DIMENSÃO');

const oldGrouping = `        blockKits.forEach(k => {
          const enc = (k.enchimento || 'S/ ENCHIMENTO').toUpperCase();
          const dim = k.dimensao || (k.largura && k.altura ? \`\${k.largura} x \${k.altura}\` : 'S/ DIMENSÃO');
          const dimKey = \`\${enc} || \${dim}\`;
          if (!dims.has(dimKey)) dims.set(dimKey, []);
          dims.get(dimKey).push(k);
        });`;

const newGrouping = `        blockKits.forEach(k => {
          // 'caracteristica_da_porta' is mapped from CSV to k.caracteristicaPorta or k.caracteristica_da_porta
          // Enchimento comes from this field
          const rawEnc = k.caracteristicaPorta || k.caracteristica_da_porta || k.enchimento;
          const enc = rawEnc ? rawEnc.toUpperCase() : 'S/ ENCHIMENTO';
          
          // Dimensao comes from folha_larg and folha_alt (mapped to k.folhaLarg e k.folhaAlt)
          const rawLarg = k.folhaLarg || k.folha_larg || k.largura;
          const rawAlt = k.folhaAlt || k.folha_alt || k.altura;
          const rawDim = k.dimensao; // fallback
          
          let dim = 'S/ DIMENSÃO';
          if (rawLarg && rawAlt) {
             dim = \`\${rawLarg}x\${rawAlt}\`;
          } else if (rawDim) {
             dim = rawDim;
          }
          
          const dimKey = \`\${enc} || \${dim}\`;
          if (!dims.has(dimKey)) dims.set(dimKey, []);
          dims.get(dimKey).push(k);
        });`;

if (content.includes("const enc = (k.enchimento || 'S/ ENCHIMENTO')")) {
  content = content.replace(oldGrouping, newGrouping);
  fs.writeFileSync(filePath, content);
  console.log("Patched dimensao and enchimento mapping");
} else {
  console.log("Could not find the dim/enc grouping logic");
}
