const fs = require('fs');
let code = fs.readFileSync('src/components/ControleOperacaoModule.tsx', 'utf8');

const regexTotal = /COLABORADORES\.forEach\(c => \{\s*if \(dayData\[`efetivo_colab_\${c}`\]\) \{\s*colabCount\+\+;\s*hasSector = true;\s*\}\s*\}\);/;

const replacementTotal = `const nonWorkingStatuses = ['Falta', 'Atestado', 'Férias', 'Folga', 'Não trabalhou'];
    COLABORADORES.forEach(c => {
      const status = dayData[\`efetivo_colab_\${c}\`];
      if (status && !nonWorkingStatuses.includes(status)) {
        colabCount++;
        hasSector = true;
      }
    });`;

code = code.replace(regexTotal, replacementTotal);

const regexSelect = /<option value="">Não trabalhou<\/option>\s*\{SETORES_EFETIVO\.map\(s => \(\s*<option key=\{s\} value=\{s\}>\{s\}<\/option>\s*\)\)\}/;
const replacementSelect = `<option value="">Não trabalhou</option>
                    {SETORES_EFETIVO.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                    <option value="Falta">Falta</option>
                    <option value="Atestado">Atestado</option>
                    <option value="Férias">Férias</option>
                    <option value="Folga">Folga</option>`;

code = code.replace(regexSelect, replacementSelect);

fs.writeFileSync('src/components/ControleOperacaoModule.tsx', code);
