const fs = require('fs');
const filePath = 'src/components/AutoReports.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

const targetStr = `            {/* COVER PAGE */}
            <div className="flex flex-col h-[80vh] print:h-[80vh] pt-4 overflow-hidden" style={{ pageBreakAfter: 'always', pageBreakInside: 'avoid' }}>`;

// Reduce height significantly for print, e.g. 50vh, to guarantee it never spills over.
// Remove overflow-hidden because sometimes browsers misinterpret it for print layouts.
const newStr = `            {/* COVER PAGE */}
            <div className="flex flex-col h-[60vh] print:h-[60vh] pt-4" style={{ pageBreakAfter: 'always', pageBreakInside: 'avoid' }}>`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, newStr);
  fs.writeFileSync(filePath, content);
  console.log("Patched cover page height for print successfully");
} else {
  console.log("Could not find the target string");
}

