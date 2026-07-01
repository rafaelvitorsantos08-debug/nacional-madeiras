const fs = require('fs');
const content = fs.readFileSync('src/components/ControleOperacaoModule.tsx', 'utf8');

let newContent = content.replace(
  "import { useLocalStorage, DIMENSOES_PORTA, CORES, MODELOS_PORTA, LARGURAS_ADUELA, FACE_ALIZAR, COMPRIMENTOS_ADUELA, COMPRIMENTOS_ALIZAR, ESPESSURA_ALIZAR, ENCHIMENTOS_PORTA } from './EstoqueModule';",
  "import { useLocalStorage, DIMENSOES_PORTA, CORES, MODELOS_PORTA, LARGURAS_ADUELA, FACE_ALIZAR, COMPRIMENTOS_ADUELA, COMPRIMENTOS_ALIZAR, ESPESSURA_ALIZAR, ENCHIMENTOS_PORTA } from './EstoqueModule';\nimport { EntradaSaidaObras } from './EntradaSaidaObras';"
);

// Update button for Entrada
newContent = newContent.replace(
  /Entrada de Obras/g,
  "Entrada / Saída Obras"
);

// We need to change the activeTab logic
newContent = newContent.replace(
  /\{activeTab === 'entradas' && <EntradaObras globalSearch=\{globalSearch\} \/>\}/g,
  "{(activeTab === 'entradas' || activeTab === 'saidas_obras') && <EntradaSaidaObras globalSearch={globalSearch} />}"
);
newContent = newContent.replace(
  /\{activeTab === 'saidas_obras' && <SaidasObras globalSearch=\{globalSearch\} \/>\}/g,
  ""
);

// Remove the 'Saídas de Obras' button completely
newContent = newContent.replace(
  /<button[\s\S]*?onClick=\{\(\) => setActiveTab\('saidas_obras'\)\}[\s\S]*?Saídas de Obras[\s\S]*?<\/button>/,
  ""
);

fs.writeFileSync('src/components/ControleOperacaoModule.tsx', newContent);
console.log("Patched successfully");
