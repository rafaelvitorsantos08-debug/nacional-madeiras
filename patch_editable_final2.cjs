const fs = require('fs');
const filePath = 'src/components/AutoReports.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

const targetRegex = /const EditableText = \(\{\s*children\s*\}\s*:\s*\{\s*children\s*:\s*React\.ReactNode\s*\}\)\s*=>\s*\{[\s\S]*?return \([\s\S]*?<\/span>\s*\);\s*\};/;

const newStr = `const EditableText = ({ children }: { children: React.ReactNode }) => {
  const spanRef = React.useRef<HTMLSpanElement>(null);
  const initialValue = React.useRef(String(children));
  const edited = React.useRef(false);

  React.useEffect(() => {
    // If the component receives new upstream data and we haven't manually edited it,
    // update the DOM.
    if (!edited.current && spanRef.current && String(children) !== initialValue.current) {
      initialValue.current = String(children);
      spanRef.current.textContent = String(children);
    }
  }, [children]);

  // When printing, the app might re-render.
  // Because initialValue.current doesn't change on input, the dangerouslySetInnerHTML prop
  // stays EXACTLY the same. React sees the prop didn't change, so it WON'T wipe out
  // the manual DOM edits made by the user.

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

if (targetRegex.test(content)) {
  content = content.replace(targetRegex, newStr);
  fs.writeFileSync(filePath, content);
  console.log("Patched EditableText final 2");
} else {
  console.log("Could not find EditableText");
}
