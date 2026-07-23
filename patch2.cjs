const fs = require('fs');
let code = fs.readFileSync('src/components/ControleOperacaoModule.tsx', 'utf8');

const regex = /let hasSector = false;\s*SETORES_EFETIVO\.forEach\(s => \{\s*const v = parseInt\(dayData\[`efetivo_\${s}`\] \|\| '0'\);\s*if \(!isNaN\(v\)\) \{\s*sum \+= v;\s*\}\s*if \(dayData\[`efetivo_\${s}`\]\) hasSector = true;\s*\}\);\s*if \(hasSector\) return sum;/;

const replacement = `let hasSector = false;
    let colabCount = 0;
    SETORES_EFETIVO.forEach(s => {
      const v = parseInt(dayData[\`efetivo_\${s}\`] || '0');
      if (!isNaN(v)) {
        sum += v;
      }
      if (dayData[\`efetivo_\${s}\`]) hasSector = true;
    });

    COLABORADORES.forEach(c => {
      if (dayData[\`efetivo_colab_\${c}\`]) {
        colabCount++;
        hasSector = true;
      }
    });

    if (hasSector) return sum + colabCount;`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/components/ControleOperacaoModule.tsx', code);
