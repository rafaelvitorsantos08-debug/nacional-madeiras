const fs = require('fs');
const filePath = 'src/components/AutoReports.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

const targetStr = `const EditableText = ({ children }: { children: React.ReactNode }) => {
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

const newStr = `const EditableText = ({ children }: { children: React.ReactNode }) => {
  const spanRef = React.useRef<HTMLSpanElement>(null);
  const initialValue = React.useRef(String(children));
  const edited = React.useRef(false);

  React.useEffect(() => {
    if (!edited.current && spanRef.current && String(children) !== initialValue.current) {
      initialValue.current = String(children);
      spanRef.current.textContent = String(children);
    }
  }, [children]);

  return (
    <span 
      ref={spanRef}
      contentEditable 
      suppressContentEditableWarning 
      onInput={() => { edited.current = true; }}
      className="outline-none inline-block w-full focus:bg-black/5 dark:focus:bg-white/5 rounded px-1 transition-colors min-h-[1em]"
      style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
      dangerouslySetInnerHTML={{ __html: initialValue.current }}
    />
  );
};`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, newStr);
  fs.writeFileSync(filePath, content);
  console.log("Patched EditableText final 3");
} else {
  console.log("Could not find EditableText");
}
