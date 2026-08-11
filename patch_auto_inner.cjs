const fs = require('fs');
let code = fs.readFileSync('src/components/AutoReports.tsx', 'utf8');

const regexInner = /\/\/ Separa as linhas por fechadura para criar blocos distintos[\s\S]*?const rowsByFechadura = new Map\(\);[\s\S]*?rows\.forEach\(r => \{[\s\S]*?if \(!rowsByFechadura\.has\(r\.fechadura\)\) rowsByFechadura\.set\(r\.fechadura, \[\]\);[\s\S]*?rowsByFechadura\.get\(r\.fechadura\)\.push\(r\);[\s\S]*?\}\);[\s\S]*?const fechaduraGroups = Array\.from\(rowsByFechadura\.values\(\)\);[\s\S]*?return \([\s\S]*?<React\.Fragment key=\{abIdx\}>[\s\S]*?\{fechaduraGroups\.map\(\(groupRows, gIdx\) => \([\s\S]*?<React\.Fragment key=\{gIdx\}>[\s\S]*?\{\(abIdx > 0 \|\| gIdx > 0\) && \([\s\S]*?<tr className="border-0 bg-transparent h-6 break-inside-avoid">[\s\S]*?<td colSpan=\{totalCols\} className="border-0"><\/td>[\s\S]*?<\/tr>[\s\S]*?\)\}[\s\S]*?\{\/\* Abertura Header \*\/\}/;

const replacementInner = `return (
                    <React.Fragment key={abIdx}>
                      {abIdx > 0 && (
                        <tr className="border-0 bg-transparent h-6 break-inside-avoid">
                           <td colSpan={totalCols} className="border-0"></td>
                        </tr>
                      )}
                      {/* Abertura Header */}`;

code = code.replace(regexInner, replacementInner);

// replace groupRows with rows
code = code.replace(/\{groupRows\.map\(\(g, rIdx\) => \(/g, `{rows.map((g, rIdx) => (`);

// replace React.Fragment closing
code = code.replace(/<\/React\.Fragment>\s*\)\)}\s*<\/React\.Fragment>/g, `</React.Fragment>`);

fs.writeFileSync('src/components/AutoReports.tsx', code);
