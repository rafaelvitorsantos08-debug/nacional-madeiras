const fs = require('fs');
const filePath = 'src/components/AutoReports.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

const targetStr = `const EditableText = ({ children }: { children: React.ReactNode }) => {
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

const newStr = `const EditableText = ({ children }: { children: React.ReactNode }) => {
  const [val, setVal] = React.useState(children);
  const [edited, setEdited] = React.useState(false);
  
  React.useEffect(() => {
    if (!edited) {
      setVal(children);
    }
  }, [children, edited]);

  const onInput = (e: React.FormEvent<HTMLSpanElement>) => {
    setEdited(true);
    setVal(e.currentTarget.textContent);
  };
  
  const onBlur = (e: React.FocusEvent<HTMLSpanElement>) => {
    setEdited(true);
    setVal(e.currentTarget.textContent);
  };

  return (
    <span 
      contentEditable 
      suppressContentEditableWarning 
      onInput={onInput}
      onBlur={onBlur}
      className="outline-none inline-block w-full focus:bg-black/5 dark:focus:bg-white/5 rounded px-1 transition-colors min-h-[1em]"
      style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
    >
      {val}
    </span>
  );
};`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, newStr);
  fs.writeFileSync(filePath, content);
  console.log("Patched EditableText");
} else {
  console.log("Could not find EditableText");
}
