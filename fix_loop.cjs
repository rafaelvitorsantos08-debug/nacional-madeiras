const { execSync } = require('child_process');
const fs = require('fs');

let success = false;
for (let i = 0; i < 20; i++) {
  try {
    execSync('npm run build', { stdio: 'pipe' });
    console.log('Build succeeded!');
    success = true;
    break;
  } catch (err) {
    const out = err.stdout.toString() + err.stderr.toString();
    const match = out.match(/\/app\/applet\/src\/App\.tsx:(\d+):/);
    if (match) {
      const lineNum = parseInt(match[1], 10);
      console.log('Fixing line', lineNum);
      let lines = fs.readFileSync('src/App.tsx', 'utf8').split('\n');
      lines[lineNum - 1] = lines[lineNum - 1].replace('}', ')}');
      fs.writeFileSync('src/App.tsx', lines.join('\n'));
    } else {
      console.log('No line number found in output:', out);
      break;
    }
  }
}
