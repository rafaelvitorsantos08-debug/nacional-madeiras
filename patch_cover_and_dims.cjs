const fs = require('fs');
const filePath = 'src/components/AutoReports.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// FIX 1: The cover page has signatures but they are currently visually bleeding onto the next page
// due to CSS. Let's make sure the cover page truly locks them inside.
// We change `h-full min-h-[85vh]` to something that fits strictly on one page without overflowing.
const oldCoverPageStr = `            {/* COVER PAGE */}
            <div className="flex flex-col h-full min-h-[85vh] print:h-full print:min-h-[95vh] pt-4" style={{ pageBreakAfter: 'always' }}>`;

const newCoverPageStr = `            {/* COVER PAGE */}
            <div className="flex flex-col h-[90vh] print:h-[95vh] pt-4" style={{ pageBreakAfter: 'always' }}>`;

if (content.includes(oldCoverPageStr)) {
  content = content.replace(oldCoverPageStr, newCoverPageStr);
  console.log("Patched cover page height");
}

// FIX 2: Dimensions are still showing S/ DIMENSÃO for "folha_larg" vs "largura".
// Let's ensure the mapping is bulletproof by checking all possible variations of the keys from the data.
// In the data mapping we did earlier:
const oldDimMapping = `        blockKits.forEach(k => {
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

// Let's use a more robust parsing that checks string matches of keys since sometimes CSV parsers use exact spaces
const newDimMapping = `        blockKits.forEach(k => {
          // Robust Enchimento check
          let rawEnc = k.caracteristicaPorta || k.caracteristica_da_porta || k.enchimento || k['CARACTERISTICA DA PORTA'] || k['caracteristica da porta'];
          if(!rawEnc) {
             const encKey = Object.keys(k).find(key => key.toLowerCase().includes('caracteristica'));
             if (encKey) rawEnc = k[encKey];
          }
          const enc = rawEnc ? String(rawEnc).trim().toUpperCase() : 'S/ ENCHIMENTO';
          
          // Robust Dimensao check
          let rawLarg = k.folhaLarg || k.folha_larg || k.largura || k['FOLHA LARG'] || k['folha larg'];
          let rawAlt = k.folhaAlt || k.folha_alt || k.altura || k['FOLHA ALT'] || k['folha alt'];
          
          if (!rawLarg) {
             const largKey = Object.keys(k).find(key => key.toLowerCase().includes('folha larg'));
             if (largKey) rawLarg = k[largKey];
          }
          if (!rawAlt) {
             const altKey = Object.keys(k).find(key => key.toLowerCase().includes('folha alt'));
             if (altKey) rawAlt = k[altKey];
          }
          
          let rawDim = k.dimensao; // fallback
          
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

if (content.includes("const rawEnc = k.caracteristicaPorta || k.caracteristica_da_porta || k.enchimento;")) {
  content = content.replace(oldDimMapping, newDimMapping);
  console.log("Patched robust dimension and enchimento mapping");
}

fs.writeFileSync(filePath, content);
