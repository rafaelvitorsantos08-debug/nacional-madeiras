const fs = require('fs');
const file = 'src/components/LancamentosRelatoriosModule.tsx';
let code = fs.readFileSync(file, 'utf8');

const importStr = "import { Plus, Trash2, Copy, Save, FileSpreadsheet, Download, FileText, MessageSquareQuote } from 'lucide-react';";
code = code.replace("import { Plus, Trash2, Copy, Save, FileSpreadsheet, Download, FileText } from 'lucide-react';", importStr);

code = code.replace("kitDuplo: boolean;", "kitDuplo: boolean;\n  observacao?: string;");
code = code.replace("kitDuplo: false,", "kitDuplo: false,\n  observacao: '',");

// Replaces in INITIAL_KITS
code = code.replace(/veneziana: false, grelha: false, bandeira: false, chapa: false, vidro: false, fechaFresta: false, kitDuplo: false/g, "veneziana: false, grelha: false, bandeira: false, chapa: false, vidro: false, fechaFresta: false, kitDuplo: false, observacao: ''");

const editableObsCell = `
function EditableObsCell({ value, onChange }: { value: string, onChange: (val: string) => void }) {
  const handleEdit = () => {
    const newValue = window.prompt("Comentário / Observação:", value || "");
    if (newValue !== null) {
      onChange(newValue);
    }
  };
  
  return (
    <div 
      onClick={handleEdit}
      className={"cursor-pointer p-1 rounded transition-colors flex justify-center items-center " + (value ? "bg-amber-100 text-amber-700 hover:bg-amber-200" : "text-gray-300 hover:text-gray-500 hover:bg-gray-100")}
      title={value || "Adicionar comentário"}
    >
      <MessageSquareQuote className="w-5 h-5" />
    </div>
  );
}

export function LancamentosRelatoriosModule() {`;

code = code.replace("export function LancamentosRelatoriosModule() {", editableObsCell);

// Add Header
code = code.replace('<th className="p-2 font-bold text-center">Kit Duplo</th>', '<th className="p-2 font-bold text-center">Kit Duplo</th>\n<th className="p-2 font-bold text-center">Obs.</th>');

// Add cell
code = code.replace('<td className="p-2 text-center"><EditableCell type="boolean" value={kit.kitDuplo} onChange={v => updateKit(kit.id, "kitDuplo", v)} /></td>', '<td className="p-2 border-r border-gray-200 dark:border-gray-700 text-center"><EditableCell type="boolean" value={kit.kitDuplo} onChange={v => updateKit(kit.id, "kitDuplo", v)} /></td>\n<td className="p-2 text-center"><EditableObsCell value={kit.observacao || ""} onChange={v => updateKit(kit.id, "observacao", v)} /></td>');

// Add colspan to 27 in empty row
code = code.replace('colSpan={26}', 'colSpan={27}');

fs.writeFileSync(file, code);
