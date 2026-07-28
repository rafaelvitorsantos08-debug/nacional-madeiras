const fs = require('fs');
let code = fs.readFileSync('src/components/ControleOperacaoModule.tsx', 'utf8');

// 1. Add state for colaboradores and the edit modal
const regexState = /const \[modalEfetivoOpen, setModalEfetivoOpen\] = useState<any>\(null\);/;
const replacementState = `const [modalEfetivoOpen, setModalEfetivoOpen] = useState<any>(null);
  const [isEditColaboradoresOpen, setIsEditColaboradoresOpen] = useState(false);
  const [newColaboradorName, setNewColaboradorName] = useState('');
  
  const DEFAULT_COLABORADORES = [
    'Timoteo', 'Fabio', 'Romildo', 'Marcelo', 'Eduardo', 
    'Marco', 'Adriano', 'Alexandre', 'Lucio', 'Jair', 
    'Francisco', 'Sergio', 'Juarez', 'Samuel', 'Julio'
  ];
  const [colaboradoresState, setColaboradoresState] = useLocalStorage<string[]>('nm_operacao_colaboradores', DEFAULT_COLABORADORES);`;

code = code.replace(regexState, replacementState);

// 2. Replace COLABORADORES array with dynamic sorted array
const regexColaboradores = /const COLABORADORES = \[\s*'Timoteo',\s*'Fabio',\s*'Romildo',\s*'Marcelo',\s*'Eduardo',\s*'Marco',\s*'Adriano',\s*'Alexandre',\s*'Lucio',\s*'Jair',\s*'Francisco',\s*'Sergio',\s*'Juarez',\s*'Samuel',\s*'Julio'\s*\];/;
const replacementColaboradores = `const COLABORADORES = [...colaboradoresState].sort((a, b) => a.localeCompare(b));`;

code = code.replace(regexColaboradores, replacementColaboradores);

// 3. Add Settings icon import if not present
// Wait, we need to check if Settings is imported. Let's just use a text button or Plus icon.
// Let's check imports first.
fs.writeFileSync('src/components/ControleOperacaoModule.tsx', code);
