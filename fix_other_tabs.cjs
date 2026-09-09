const fs = require('fs');
let code = fs.readFileSync('src/components/ControleOperacaoModule.tsx', 'utf8');

code = code.replace(
  `{activeTab === 'saidas' && <ControleSaidas initialMonth={initialMonth} globalSearch={globalSearch} />}`,
  `{activeTab === 'saidas' && <ControleSaidas initialMonth={initialMonth} />}`
);
code = code.replace(
  `{activeTab === 'operacao' && <OperacaoProducao initialMonth={initialMonth} globalSearch={globalSearch} />}`,
  `{activeTab === 'operacao' && <OperacaoProducao initialMonth={initialMonth} />}`
);
code = code.replace(
  `{(activeTab === 'entradas' || activeTab === 'saidas_obras') && <EntradaSaidaObras globalSearch={globalSearch} />}`,
  `{(activeTab === 'entradas' || activeTab === 'saidas_obras') && <EntradaSaidaObras />}`
);

code = code.replace(
  `function OperacaoProducao({ initialMonth, globalSearch = '' }: { initialMonth?: number, globalSearch?: string }) {`,
  `function OperacaoProducao({ initialMonth }: { initialMonth?: number }) {`
);

fs.writeFileSync('src/components/ControleOperacaoModule.tsx', code);
