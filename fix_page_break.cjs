const fs = require('fs');
const filePath = 'src/components/AutoReports.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

content = content.replace(/className="break-before-page print:break-before-page"/g, 'style={{ pageBreakBefore: \'always\' }}');
content = content.replace(/className=\{blockIndex > 0 \? "break-before-page mt-8 print:mt-0 print:break-before-page" : ""\}/g, 'style={blockIndex > 0 ? { pageBreakBefore: \'always\' } : {}}');
content = content.replace(/className="flex flex-col min-h-\[90vh\] print:min-h-\[100vh\] print:h-\[100vh\] page-break-after"/g, 'className="flex flex-col min-h-[90vh] print:min-h-[100vh] print:h-[100vh]" style={{ pageBreakAfter: \'always\' }}');

fs.writeFileSync(filePath, content);
console.log("Fixed page breaks");
