const fs = require('fs');
let code = fs.readFileSync('src/components/AutoReports.tsx', 'utf8');

const newEditable = `const EditableText = ({ children }: { children: React.ReactNode }) => {
  const [val, setVal] = React.useState(children);
  
  React.useEffect(() => {
    setVal(children);
  }, [children]);

  const onInput = (e: React.FormEvent<HTMLSpanElement>) => {
    // Keep local state in sync so re-renders don't overwrite it
    setVal(e.currentTarget.textContent);
  };

  return (
    <span 
      contentEditable 
      suppressContentEditableWarning 
      onInput={onInput}
      onBlur={(e) => setVal(e.currentTarget.textContent)}
      className="outline-none inline-block w-full focus:bg-black/5 dark:focus:bg-white/5 rounded px-1 transition-colors min-h-[1em]"
    >
      {val}
    </span>
  );
};`;

code = code.replace(/const EditableText = \(\{ children \}: \{ children: React\.ReactNode \}\) => \{[\s\S]*?<\/span>\s*\);\s*\};/, newEditable);

fs.writeFileSync('src/components/AutoReports.tsx', code);
