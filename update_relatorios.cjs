const fs = require('fs');
let code = fs.readFileSync('src/components/RelatoriosModule.tsx', 'utf8');

// 1. Add calculated availableBlocos and filteredKits
code = code.replace(
  'const [avariaFile, setAvariaFile] = useState<File | null>(null);',
  `const [avariaFile, setAvariaFile] = useState<File | null>(null);\n\n  const availableBlocos = React.useMemo(() => {\n    const blocos = new Set<string>();\n    kits.forEach(k => blocos.add(k.bloco || 'SEM BLOCO'));\n    return Array.from(blocos).sort((a, b) => a.localeCompare(b, undefined, {numeric: true}));\n  }, [kits]);\n\n  const filteredKits = React.useMemo(() => {\n    if (selectedBloco === "TODOS") return kits;\n    return kits.filter(k => (k.bloco || 'SEM BLOCO') === selectedBloco);\n  }, [kits, selectedBloco]);\n\n  const handleFinalizarEntrega = () => {\n    if (filteredKits.length === 0) return alert('Nenhum kit selecionado.');\n    if (window.confirm(\`Deseja realmente finalizar a entrega de \${filteredKits.length} kits (Bloco: \${selectedBloco})? Eles serão movidos para o Histórico.\`)) {\n      const novaEntrega = {\n        id: Date.now().toString(),\n        dataEntrega: new Date().toISOString(),\n        responsavel: header.responsavel,\n        obra: header.obra,\n        blocos: selectedBloco === "TODOS" ? availableBlocos : [selectedBloco],\n        kits: filteredKits\n      };\n      setHistoricoEntregas([...historicoEntregas, novaEntrega]);\n      // Remove from main list\n      const idsToRemove = new Set(filteredKits.map(k => k.id));\n      setKits(kits.filter(k => !idsToRemove.has(k.id)));\n      alert('Entrega finalizada e movida para o histórico com sucesso!');\n      setSelectedBloco("TODOS");\n    }\n  };\n`
);

// 2. Change <AutoReportsViewer kits={kits} ... /> to kits={filteredKits}
code = code.replace(
  '<AutoReportsViewer \n                kits={kits} \n                reportType={reportType}',
  '<AutoReportsViewer \n                kits={filteredKits} \n                reportType={reportType}'
);

fs.writeFileSync('src/components/RelatoriosModule.tsx', code);
