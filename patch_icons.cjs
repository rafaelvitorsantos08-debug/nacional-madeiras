const fs = require('fs');
let code = fs.readFileSync('src/components/ControleOperacaoModule.tsx', 'utf8');

const regexImports = /import \{ Package, Truck, Target, Plus, Download, Home, Trash2, X, FileText, History, Info, MessageSquareQuote \} from 'lucide-react';/;
const replacementImports = `import { Package, Truck, Target, Plus, Download, Home, Trash2, X, FileText, History, Info, MessageSquareQuote, Settings, UserPlus } from 'lucide-react';`;

code = code.replace(regexImports, replacementImports);
fs.writeFileSync('src/components/ControleOperacaoModule.tsx', code);
