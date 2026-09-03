const fs = require('fs');
let lines = fs.readFileSync('src/App.tsx', 'utf8').split('\n');

for (let i = 750; i < 790; i++) {
  if (lines[i] && lines[i].match(/^          }$/)) {
    lines[i] = '          )}';
  }
}

fs.writeFileSync('src/App.tsx', lines.join('\n'));
