const fs = require('fs');
const file = 'src/components/RelatoriosModule.tsx';
let code = fs.readFileSync(file, 'utf8');

const regexToRemoveForm = /\) : \(\s*<div className="flex flex-wrap items-end gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">.*?<\/div>\s*\)/s;
let match = code.match(regexToRemoveForm);
if (match) {
    code = code.replace(regexToRemoveForm, '');
} else {
    // If not found properly, let's do a more robust string replacement
    const parts = code.split(') : (');
    if (parts.length > 1) {
        // It split. We have the first part which ends with '</div>'
        // the second part goes until a generic ')}' which ends the ternary.
        // Let's replace the whole condition
        code = code.replace(/{!isAutoReport\(reportType\) && reportType === "avarias" \? \(/, '{reportType === "avarias" && (');
        
        // Remove the closing `) : (` and the whole generic add items form.
        let startIndex = code.indexOf('<div className="flex flex-wrap items-end gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">');
        if (startIndex !== -1) {
             let endIndex = code.indexOf('          {/* List of items */}');
             // Also need to remove the `) : (` before it.
             let colonIndex = code.lastIndexOf(') : (', startIndex);
             if (colonIndex !== -1 && colonIndex > startIndex - 200) {
                 code = code.substring(0, colonIndex) + code.substring(endIndex);
             } else {
                 console.log("Could not find colonIndex correctly.");
             }
        }
    }
}

fs.writeFileSync(file, code);
