const fs = require('fs');
let code = fs.readFileSync('src/components/ControleOperacaoModule.tsx', 'utf8');
code = code.replace(
  "  const SETORES_EFETIVO = [\n    'Separação',\n    'Aplicação de Perfil',\n    'Usinagem de Porta',\n    'Embalagem',\n    'CNC',\n    'Marcenaria',\n    'Usinagem de Aduelas',\n    'Montagem',\n    'Entrega',\n    'Outros Serviços',\n    'Serviços Técnicos',\n    'Pintura',\n    'Almoxarife'\n  ];",
  `  const SETORES_EFETIVO = [\n    'Separação',\n    'Aplicação de Perfil',\n    'Usinagem de Porta',\n    'Embalagem',\n    'CNC',\n    'Marcenaria',\n    'Usinagem de Aduelas',\n    'Montagem',\n    'Entrega',\n    'Outros Serviços',\n    'Serviços Técnicos',\n    'Pintura',\n    'Almoxarife'\n  ];\n\n  const COLABORADORES = [\n    'Timoteo',\n    'Fabio',\n    'Romildo',\n    'Marcelo',\n    'Eduardo',\n    'Marco',\n    'Adriano',\n    'Alexandre',\n    'Lucio',\n    'Jair',\n    'Francisco',\n    'Sergio',\n    'Juarez',\n    'Samuel',\n    'Julio'\n  ];`
);
code = code.replace(
  "    SETORES_EFETIVO.forEach(s => {\n      const v = parseInt(dayData[`efetivo_${s}`] || '0');\n      if (!isNaN(v)) {\n        sum += v;\n      }\n      if (dayData[`efetivo_${s}`]) hasSector = true;\n    });\n    if (hasSector) return sum;",
  "    let colabCount = 0;\n    SETORES_EFETIVO.forEach(s => {\n      const v = parseInt(dayData[`efetivo_${s}`] || '0');\n      if (!isNaN(v)) {\n        sum += v;\n      }\n      if (dayData[`efetivo_${s}`]) hasSector = true;\n    });\n\n    COLABORADORES.forEach(c => {\n      if (dayData[`efetivo_colab_${c}`]) {\n        colabCount++;\n        hasSector = true;\n      }\n    });\n\n    if (hasSector) return sum + colabCount;"
);
fs.writeFileSync('src/components/ControleOperacaoModule.tsx', code);
