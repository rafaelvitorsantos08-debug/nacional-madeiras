const fs = require('fs');
const filePath = 'src/components/RelatoriosModule.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Find the print block and wrap it in !isAutoReport
const target = `<div className="hidden print:block w-full text-black font-sans bg-white pt-2">
          {reportType !== "auto_montagem" && (
            <>
              <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-6">`;

const replacement = `{!isAutoReport(reportType) && (
        <div className="hidden print:block w-full text-black font-sans bg-white pt-2">
          {reportType !== "auto_montagem" && (
            <>
              <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-6">`;

content = content.replace(target, replacement);

// 2. Close the block at the end
const endTarget = `                )}
              </tbody>
            </table>
          )}

          {/* Assinaturas */}`;

const endReplacement = `                )}
              </tbody>
            </table>
          )}
        )}

          {/* Assinaturas */}`;
content = content.replace(endTarget, endReplacement);
fs.writeFileSync(filePath, content);
console.log("Patched RelatoriosModule");
