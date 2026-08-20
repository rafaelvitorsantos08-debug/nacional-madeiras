const fs = require('fs');
const filePath = 'src/components/AutoReports.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

const targetStr = `const EditableText = ({ children }: { children: React.ReactNode }) => {
  const initialString = React.useMemo(() => {
    return Array.isArray(children) ? children.join('') : String(children);
  }, [children]);

  const spanRef = React.useRef<HTMLSpanElement>(null);
  const [isEdited, setIsEdited] = React.useState(false);

  React.useEffect(() => {
    // Only update the DOM if the user hasn't edited it manually
    if (!isEdited && spanRef.current) {
      if (spanRef.current.innerText !== initialString && spanRef.current.textContent !== initialString) {
        spanRef.current.textContent = initialString;
      }
    }
  }, [initialString, isEdited]);

  return (
    <span 
      ref={spanRef}
      contentEditable 
      suppressContentEditableWarning 
      onInput={() => setIsEdited(true)}
      className="outline-none inline-block w-full focus:bg-black/5 dark:focus:bg-white/5 rounded px-1 transition-colors min-h-[1em]"
      style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
    />
  );
};`;

const newStr = `const EditableText = React.memo(({ children }: { children: React.ReactNode }) => {
  const initialString = Array.isArray(children) ? children.join('') : String(children);

  return (
    <span 
      contentEditable 
      suppressContentEditableWarning 
      className="outline-none inline-block w-full focus:bg-black/5 dark:focus:bg-white/5 rounded px-1 transition-colors min-h-[1em]"
      style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
      dangerouslySetInnerHTML={{ __html: initialString }}
    />
  );
}, (prevProps, nextProps) => {
  const prevStr = Array.isArray(prevProps.children) ? prevProps.children.join('') : String(prevProps.children);
  const nextStr = Array.isArray(nextProps.children) ? nextProps.children.join('') : String(nextProps.children);
  return prevStr === nextStr;
});`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, newStr);
  fs.writeFileSync(filePath, content);
  console.log("Patched EditableText with pure memo!");
} else {
  console.log("Could not find EditableText");
}
