const fs = require('fs');
const file = 'src/components/RelatoriosModule.tsx';
let code = fs.readFileSync(file, 'utf8');

const oldSelectText = `<optgroup label="Manuais">
                    <option value="portas">Relatório de Folhas de Porta</option>
                    <option value="aduelas">Relatório de Aduelas</option>
                    <option value="alizares">Relatório de Alizares</option>
                    <option value="avarias">Relatório de Avarias</option>
                  </optgroup>
                  <optgroup label="Automáticos (Via Lançamentos)">
                    <option value="auto_aduelas">Aduelas</option>
                    <option value="auto_usinagem_aduelas">Usinagem de Aduelas</option>
                    <option value="auto_portas">Portas</option>
                    <option value="auto_usinagem_portas">Usinagem de Portas</option>
                    <option value="auto_vergas">Vergas de Aduelas</option>
                    <option value="auto_alizares">Alizares</option>
                  </optgroup>`;

const newSelectText = `
                    <option value="auto_portas">Relatório de Folhas de Porta</option>
                    <option value="auto_aduelas">Relatório de Aduelas</option>
                    <option value="auto_alizares">Relatório de Alizares</option>
                    <option value="auto_usinagem_portas">Usinagem de Portas</option>
                    <option value="auto_usinagem_aduelas">Usinagem de Aduelas</option>
                    <option value="auto_vergas">Vergas de Aduelas</option>
                    <option value="avarias">Relatório de Avarias</option>`;

code = code.replace(oldSelectText, newSelectText);
fs.writeFileSync(file, code);
