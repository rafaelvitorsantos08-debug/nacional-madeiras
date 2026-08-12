const fs = require('fs');
let code = fs.readFileSync('src/index.css', 'utf8');

code = code.replace(/table \{/g, `table, th, td, tr {
    border-color: #000 !important;
  }
  table {`);

fs.writeFileSync('src/index.css', code);
