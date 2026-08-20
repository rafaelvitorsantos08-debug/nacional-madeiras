const fs = require('fs');
const filePath = 'src/components/AutoReports.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// The problematic code is:
// <div className="text-xl print:text-2xl font-bold uppercase text-gray-500 print:text-gray-700 italic mb-2 ml-2">
//   <EditableText>{blocoName}</EditableText>
// </div>

// We need to only render it if blocoName !== '0' && blocoName !== 'SEM BLOCO'
const targetStr = `<div className="text-xl print:text-2xl font-bold uppercase text-gray-500 print:text-gray-700 italic mb-2 ml-2">
                      <EditableText>{blocoName}</EditableText>
                    </div>`;

const newStr = `{(blocoName !== '0' && blocoName !== 'SEM BLOCO' && blocoName.trim() !== '') && (
                      <div className="text-xl print:text-2xl font-bold uppercase text-gray-500 print:text-gray-700 italic mb-2 ml-2">
                        <EditableText>{blocoName}</EditableText>
                      </div>
                    )}`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, newStr);
  fs.writeFileSync(filePath, content);
  console.log("Patched zero");
} else {
  console.log("Could not find target string");
}

