const fs = require('fs');
const filePath = 'src/components/AutoReports.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

const targetRegex = /const EditableText = \(\{\s*children\s*\}\s*:\s*\{\s*children\s*:\s*React\.ReactNode\s*\}\)\s*=>\s*\{[\s\S]*?return \([\s\S]*?<\/span>\s*\);\s*\};/;

const newStr = `const EditableText = ({ children }: { children: React.ReactNode }) => {
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

if (targetRegex.test(content)) {
  content = content.replace(targetRegex, newStr);
  fs.writeFileSync(filePath, content);
  console.log("Patched EditableText pure");
} else {
  console.log("Could not find EditableText");
}
