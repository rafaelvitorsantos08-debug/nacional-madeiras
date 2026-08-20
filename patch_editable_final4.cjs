const fs = require('fs');
const filePath = 'src/components/AutoReports.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

const targetRegex = /const EditableText = \(\{\s*children\s*\}\s*:\s*\{\s*children\s*:\s*React\.ReactNode\s*\}\)\s*=>\s*\{[\s\S]*?return \([\s\S]*?<\/span>\s*\);\s*\};/;

const newStr = `const EditableText = ({ children }: { children: React.ReactNode }) => {
  // Save the original value parsed as string
  const initialString = React.useMemo(() => {
    if (Array.isArray(children)) {
      return children.join('');
    }
    return String(children);
  }, [children]);

  const [val, setVal] = React.useState(initialString);
  const [isEdited, setIsEdited] = React.useState(false);

  // Only update from parent if the user has NOT manually edited this field
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

if (targetRegex.test(content)) {
  content = content.replace(targetRegex, newStr);
  fs.writeFileSync(filePath, content);
  console.log("Patched EditableText final 4");
} else {
  console.log("Could not find EditableText");
}
