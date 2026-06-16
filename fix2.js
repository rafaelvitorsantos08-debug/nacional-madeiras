import fs from 'fs';
let text = fs.readFileSync('src/components/AutoReports.tsx', 'utf-8');

const reps = [
  [/{caracteristica}/g, '<EditableText>{caracteristica}</EditableText>'],
  [/{k\.dimensao}/g, '<EditableText>{k.dimensao}</EditableText>'],
  [/{k\.qtdTotal}/g, '<EditableText>{k.qtdTotal}</EditableText>'],
  [/{k\.acabamento}/g, '<EditableText>{k.acabamento}</EditableText>'],
  [/{acabamento}/g, '<EditableText>{acabamento}</EditableText>']
];

for(let [regex, rep] of reps) {
  text = text.replace(regex, rep);
}

// Ensure no double wrappers
text = text.replace(/<EditableText><EditableText>(.*?)<\/EditableText><\/EditableText>/g, '<EditableText>$1</EditableText>');

fs.writeFileSync('src/components/AutoReports.tsx', text);
