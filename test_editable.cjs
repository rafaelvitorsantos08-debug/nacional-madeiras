const fs = require('fs');
const filePath = 'src/components/AutoReports.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

const regex = /const EditableText =.*?return.*?;.*?\};/s;
const match = content.match(regex);
if (match) {
    console.log("Found EditableText:\n", match[0]);
} else {
    console.log("Not found.");
}
