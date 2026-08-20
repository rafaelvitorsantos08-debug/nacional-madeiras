const fs = require('fs');
const filePath = 'src/components/AutoReports.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

const targetRegex = /const EditableText = \(\{\s*children\s*\}\s*:\s*\{\s*children\s*:\s*React\.ReactNode\s*\}\)\s*=>\s*\{[\s\S]*?return \([\s\S]*?<\/span>\s*\);\s*\};/;

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

if (targetRegex.test(content)) {
  content = content.replace(targetRegex, newStr);
  fs.writeFileSync(filePath, content);
  console.log("Patched EditableText robustly");
} else {
  console.log("Could not find EditableText");
}
