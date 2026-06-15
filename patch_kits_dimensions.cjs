const fs = require('fs');
const file = 'src/components/LancamentosRelatoriosModule.tsx';
let code = fs.readFileSync(file, 'utf8');

const dimensionsList = [
  ['620', '2070'],
  ['820', '2100'],
  ['720', '2100'],
  ['820', '2100'],
  ['820', '2070'],
  ['820', '2070'],
  ['820', '2070'],
  ['820', '2070'],
  ['820', '2070'],
  ['1440', '2100'],
  ['1020', '1800'],
  ['720', '2100'],
];

const match = code.match(/const INITIAL_KITS: KitLancamento\[\] = \[([\s\S]*?)\];/);
if (!match) {
    console.log("INITIAL_KITS not found");
    process.exit(1);
}

const inner = match[1];
const items = inner.split('\n').filter(line => line.trim().startsWith('{'));

// modify items
const newItems = dimensionsList.map((dims, i) => {
    let item = items[i] || items[items.length - 1]; // fallback if not enough
    let obj = JSON.parse(item.trim().replace(/,$/, ''));
    obj.folhaLargura = dims[0];
    obj.folhaAltura = dims[1];
    return '  ' + JSON.stringify(obj) + (i < dimensionsList.length - 1 ? ',' : '');
});

const newInner = '\n' + newItems.join('\n') + '\n';
code = code.replace(match[1], newInner);

// Update localStorage key to force a reload from our new INITIAL_KITS
code = code.replace(/nacional_madeiras_kits_v5/g, 'nacional_madeiras_kits_v6');

fs.writeFileSync(file, code);
console.log("Kits dimensions patched successfully.");
