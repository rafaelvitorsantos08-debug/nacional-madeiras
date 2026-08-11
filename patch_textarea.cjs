const fs = require('fs');
let code = fs.readFileSync('src/components/AutoReports.tsx', 'utf8');

const textareaComponent = `function PrintableTextarea() {
  const [val, setVal] = React.useState('');
  return (
    <textarea
      value={val}
      onChange={(e) => setVal(e.target.value)}
      className="min-h-[100px] w-full border-[1.5px] border-gray-300 dark:border-gray-600 print:border-black p-2 outline-none rounded text-sm text-black dark:text-white print:text-black bg-white dark:bg-gray-800 print:bg-transparent focus:ring-1 focus:ring-gray-500 resize-y"
      placeholder="Digite aqui as observações..."
    />
  );
}

export function renderAutoMontagem`;

code = code.replace(/export function renderAutoMontagem/, textareaComponent);

const divToReplace = /<div\s*contentEditable\s*suppressContentEditableWarning\s*className="min-h-\[100px\] w-full border-\[1\.5px\] border-gray-300 dark:border-gray-600 print:border-black p-2 outline-none rounded text-sm text-black dark:text-white print:text-black bg-white dark:bg-gray-800 print:bg-transparent focus:ring-1 focus:ring-gray-500"\s*\/>/;

code = code.replace(divToReplace, `<PrintableTextarea />`);

fs.writeFileSync('src/components/AutoReports.tsx', code);
