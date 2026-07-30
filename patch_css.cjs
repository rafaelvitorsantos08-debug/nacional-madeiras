const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');

// We need to remove the overly aggressive print rules for tables
css = css.replace(/table \{\s*background-color: white !important;\s*\}/, 'table {\n    /* background-color: white !important; */\n  }');
css = css.replace(/th \{\s*background-color: #f3f4f6 !important;\s*color: #000 !important;\s*\}/, 'th {\n    /* background-color: #f3f4f6 !important; color: #000 !important; */\n  }');
css = css.replace(/td, tr \{\s*color: #000 !important;\s*background-color: transparent !important;\s*\}/, 'td, tr {\n    /* color: #000 !important; background-color: transparent !important; */\n  }');

fs.writeFileSync('src/index.css', css);
