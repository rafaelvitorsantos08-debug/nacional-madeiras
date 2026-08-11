const fs = require('fs');
let code = fs.readFileSync('src/components/AutoReports.tsx', 'utf8');

const newTextarea = `function PrintableTextarea() {
  const [val, setVal] = React.useState('');
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [val]);

  return (
    <textarea
      ref={textareaRef}
      value={val}
      onChange={(e) => setVal(e.target.value)}
      className="w-full border-[1.5px] border-gray-300 dark:border-gray-600 print:border-black p-2 outline-none rounded text-sm text-black dark:text-white print:text-black bg-white dark:bg-gray-800 print:bg-transparent focus:ring-1 focus:ring-gray-500 overflow-hidden"
      style={{ minHeight: '100px', resize: 'none' }}
      placeholder="Digite aqui as observações..."
    />
  );
}`;

code = code.replace(/function PrintableTextarea\(\) \{[\s\S]*?\}\s*export function renderAutoMontagem/, newTextarea + '\nexport function renderAutoMontagem');

fs.writeFileSync('src/components/AutoReports.tsx', code);
