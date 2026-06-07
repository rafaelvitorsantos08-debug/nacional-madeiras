const fs = require('fs');

const codeFile = 'src/components/LancamentosRelatoriosModule.tsx';
let code = fs.readFileSync(codeFile, 'utf8');

// interface
code = code.replace(/fechaFresta: boolean;/, "fechaFresta: boolean;\n  kitDuplo: boolean;");

// INITIAL_FORM
code = code.replace(/fechaFresta: false,\n};/, "fechaFresta: false,\n  kitDuplo: false,\n};");

// INITIAL_KITS
code = code.replace(/fechaFresta: false\n  }/g, "fechaFresta: false, kitDuplo: false\n  }");

fs.writeFileSync(codeFile, code);
