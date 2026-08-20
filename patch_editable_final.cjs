const fs = require('fs');
const filePath = 'src/components/AutoReports.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

const targetStr = `const EditableText = ({ children }: { children: React.ReactNode }) => {
  const spanRef = React.useRef<HTMLSpanElement>(null);
  const initialValue = React.useRef(String(children));
  
  // Update internal HTML only if we haven't touched it and the upstream value changes
  const [edited, setEdited] = React.useState(false);

  React.useEffect(() => {
    if (!edited && spanRef.current && String(children) !== initialValue.current) {
      initialValue.current = String(children);
      spanRef.current.textContent = String(children);
    }
  }, [children, edited]);

  return (
    <span 
      ref={spanRef}
      contentEditable 
      suppressContentEditableWarning 
      onInput={() => setEdited(true)}
      onBlur={() => setEdited(true)}
      className="outline-none inline-block w-full focus:bg-black/5 dark:focus:bg-white/5 rounded px-1 transition-colors min-h-[1em]"
      style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
      dangerouslySetInnerHTML={{ __html: initialValue.current }}
    />
  );
};`;

const newStr = `const EditableText = ({ children }: { children: React.ReactNode }) => {
  const spanRef = React.useRef<HTMLSpanElement>(null);
  const lastValue = React.useRef(String(children));
  const [edited, setEdited] = React.useState(false);

  React.useEffect(() => {
    if (!edited && spanRef.current && String(children) !== lastValue.current) {
      lastValue.current = String(children);
      spanRef.current.textContent = String(children);
    }
  }, [children, edited]);

  const handleInput = (e: React.FormEvent<HTMLSpanElement>) => {
    setEdited(true);
    lastValue.current = e.currentTarget.textContent || '';
  };

  return (
    <span 
      ref={spanRef}
      contentEditable 
      suppressContentEditableWarning 
      onInput={handleInput}
      onBlur={handleInput}
      className="outline-none inline-block w-full focus:bg-black/5 dark:focus:bg-white/5 rounded px-1 transition-colors min-h-[1em]"
      style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
      dangerouslySetInnerHTML={{ __html: lastValue.current }}
    />
  );
};`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, newStr);
  fs.writeFileSync(filePath, content);
  console.log("Patched EditableText final");
} else {
  console.log("Could not find EditableText");
}
