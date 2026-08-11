const fs = require('fs');
let code = fs.readFileSync('src/components/AutoReports.tsx', 'utf8');

const regexGroup = /\/\/ Group by Tipologia first\s*const byTipologia = new Map<string, any\[\]>\(\);\s*kits\.forEach\(k => \{\s*const tipo = k\.tipologia \|\| 'SEM TIPOLOGIA';\s*if \(\!byTipologia\.has\(tipo\)\) byTipologia\.set\(tipo, \[\]\);\s*byTipologia\.get\(tipo\)\.push\(k\);\s*\}\);\s*const tipologias = Array\.from\(byTipologia\.keys\(\)\)\.sort\(\);/;

const replacementGroup = `// Group by Tipologia and Fechadura
  const byTipologiaFech = new Map<string, any[]>();
  kits.forEach(k => {
    const tipo = k.tipologia || 'SEM TIPOLOGIA';
    const fech = [k.fechaduraTipo, k.fechaduraMarca, k.fechaduraGrid && \`GRID \${k.fechaduraGrid}\`].filter(Boolean).join(' / ') || 'SEM FECHADURA';
    const key = \`\${tipo}|||\${fech}\`;
    if (!byTipologiaFech.has(key)) byTipologiaFech.set(key, []);
    byTipologiaFech.get(key).push(k);
  });

  const tipologias = Array.from(byTipologiaFech.keys()).sort((a, b) => {
    const [tipoA] = a.split('|||');
    const [tipoB] = b.split('|||');
    return tipoA.localeCompare(tipoB);
  });`;

code = code.replace(regexGroup, replacementGroup);

// replace the mapping signature
code = code.replace(/\{tipologias\.map\(\(tipo, idx\) => \{/g, `{tipologias.map((key, idx) => {\n        const [tipo] = key.split('|||');`);

// replace byTipologia.get(tipo) with byTipologiaFech.get(key)
code = code.replace(/const tipoKits = byTipologia\.get\(tipo\) \|\| \[\];/g, `const tipoKits = byTipologiaFech.get(key) || [];`);

fs.writeFileSync('src/components/AutoReports.tsx', code);
