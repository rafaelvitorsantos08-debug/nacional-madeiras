const fs = require('fs');
const filePath = 'src/components/AutoReports.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

const targetRegex = /const EditableText = \(\{\s*children\s*\}\s*:\s*\{\s*children\s*:\s*React\.ReactNode\s*\}\)\s*=>\s*\{[\s\S]*?return \([\s\S]*?<\/span>\s*\);\s*\};/;

const newStr = `const EditableText = ({ children }: { children: React.ReactNode }) => {
  const initialString = React.useMemo(() => {
    return Array.isArray(children) ? children.join('') : String(children);
  }, [children]);

  const spanRef = React.useRef<HTMLSpanElement>(null);
  const isEdited = React.useRef(false);

  React.useEffect(() => {
    if (spanRef.current && !isEdited.current) {
      if (spanRef.current.textContent !== initialString) {
        spanRef.current.textContent = initialString;
      }
    }
  }, [initialString]);

  const handleInput = () => {
    isEdited.current = true;
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
      dangerouslySetInnerHTML={{ __html: initialString }}
    />
  );
};`;

if (targetRegex.test(content)) {
  content = content.replace(targetRegex, newStr);
  fs.writeFileSync(filePath, content);
  console.log("Patched EditableText to robust version 2!");
} else {
  console.log("Could not find EditableText");
}
