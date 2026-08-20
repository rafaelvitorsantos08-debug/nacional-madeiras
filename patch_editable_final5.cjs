const fs = require('fs');
const filePath = 'src/components/AutoReports.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

const targetStr = `const EditableText = ({ children }: { children: React.ReactNode }) => {
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

const newStr = `const EditableText = ({ children }: { children: React.ReactNode }) => {
  const initialString = React.useMemo(() => {
    if (Array.isArray(children)) {
      return children.join('');
    }
    return String(children);
  }, [children]);

  const [val, setVal] = React.useState(initialString);
  const [isEdited, setIsEdited] = React.useState(false);

  React.useEffect(() => {
    if (!isEdited) {
      setVal(initialString);
    }
  }, [initialString, isEdited]);

  const onInput = (e: React.FormEvent<HTMLSpanElement>) => {
    setIsEdited(true);
    setVal(e.currentTarget.textContent || '');
  };

  const onBlur = (e: React.FocusEvent<HTMLSpanElement>) => {
    setIsEdited(true);
    setVal(e.currentTarget.textContent || '');
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
  console.log("Patched EditableText final 5");
} else {
  console.log("Could not find EditableText");
}
