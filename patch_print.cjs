const fs = require('fs');
let code = fs.readFileSync('src/components/ControleOperacaoModule.tsx', 'utf8');

// The `table` in the "Saidas" tab (first tab)
code = code.replace(/<table className="w-full text-center text-xs whitespace-nowrap border-collapse min-w-\[1200px\]">/, 
  '<table className="w-full text-center text-xs whitespace-nowrap border-collapse min-w-[1200px]" style={{ WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}>');

// The `table` in the "OperacaoProducao" tab (second tab)
code = code.replace(/<table className="w-full text-center text-xs whitespace-nowrap border-collapse min-w-\[1200px\]">/g, 
  '<table className="w-full text-center text-xs whitespace-nowrap border-collapse min-w-[1200px]" style={{ WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}>');
  
// Check if second tab has a different table class
fs.writeFileSync('src/components/ControleOperacaoModule.tsx', code);
