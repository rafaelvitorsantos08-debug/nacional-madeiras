const fs = require('fs');
let code = fs.readFileSync('src/components/AutoReports.tsx', 'utf8');

const persistentComponent = `
function useLocalState(key: string, initialValue: string) {
  const [val, setVal] = React.useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });
  const setValue = (value: string) => {
    setVal(value);
    window.localStorage.setItem(key, JSON.stringify(value));
  };
  return [val, setValue] as const;
}

const PersistentObservation = ({ id }: { id: string }) => {
  const [val, setVal] = useLocalState(\`nm_obs_\${id}\`, '');
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (ref.current && ref.current.innerHTML !== val) {
      ref.current.innerHTML = val;
    }
  }, []);

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onBlur={(e) => setVal(e.currentTarget.innerHTML)}
      className="min-h-[100px] w-full border-[1.5px] border-gray-300 dark:border-gray-600 print:border-black p-2 outline-none rounded text-sm print:text-[16px] text-black dark:text-white print:text-black bg-white dark:bg-gray-800 print:bg-transparent focus:ring-1 focus:ring-gray-500"
    />
  );
};

const EditableText = ({ children }: { children: React.ReactNode }) => {
`;

code = code.replace(/const EditableText = \(\{ children \}: \{ children: React.ReactNode \}\) => \(/, persistentComponent + '\n  return (\n');

code = code.replace(/<\/span>\n\);/, '  </span>\n  );\n};\n');

const replaceTarget = /<div\s+contentEditable\s+suppressContentEditableWarning\s+className="min-h-\[100px\].*?"\s*\/>/g;
code = code.replace(replaceTarget, '<PersistentObservation id={"montagem_" + btoa(unescape(encodeURIComponent(key)))} />');

fs.writeFileSync('src/components/AutoReports.tsx', code);
