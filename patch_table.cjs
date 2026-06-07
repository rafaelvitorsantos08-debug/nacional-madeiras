const fs = require('fs');
let code = fs.readFileSync('src/components/LancamentosRelatoriosModule.tsx', 'utf8');

const editableComponent = `
function EditableCell({ value, onChange, type = "text", className = "", options = [] }: { value: any, onChange: (val: any) => void, type?: string, className?: string, options?: {label: string, value: string}[] | string[] }) {
  if (type === "boolean") {
    return (
      <div className="flex justify-center">
        <input type="checkbox" checked={!!value} onChange={e => onChange(e.target.checked)} className="cursor-pointer" />
      </div>
    );
  }
  if (type === "select") {
    return (
      <select value={value} onChange={e => onChange(e.target.value)} className={"w-full bg-transparent text-center outline-none focus:ring-1 focus:ring-emerald-500 rounded px-1 " + className}>
        {options.map(opt => {
          if (typeof opt === 'string') return <option key={opt} value={opt} className="bg-white dark:bg-gray-800 text-black dark:text-white">{opt}</option>;
          return <option key={opt.value} value={opt.value} className="bg-white dark:bg-gray-800 text-black dark:text-white">{opt.label}</option>;
        })}
      </select>
    );
  }
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      className={"w-full bg-transparent text-center outline-none focus:ring-1 focus:ring-emerald-500 rounded px-1 " + className}
    />
  );
}
`;

if (!code.includes("EditableCell")) {
  code = code.replace("export function LancamentosRelatoriosModule() {", editableComponent + "\nexport function LancamentosRelatoriosModule() {");
}

fs.writeFileSync('src/components/LancamentosRelatoriosModule.tsx', code);
