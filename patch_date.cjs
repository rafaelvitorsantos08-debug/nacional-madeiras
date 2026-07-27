const fs = require('fs');
let code = fs.readFileSync('src/components/RelatoriosModule.tsx', 'utf8');

const regexState = /useEffect\(\(\) => \{\n\s*if \(reportType === "avarias"\) \{\n\s*const today = new Date\(Date\.now\(\) - new Date\(\)\.getTimezoneOffset\(\) \* 60000\)\.toISOString\(\)\.split\("T"\)\[0\];\n\s*if \(!header\.data\) \{\n\s*setHeader\(\(prev\) => \(\{ \.\.\.prev, data: today \}\)\);\n\s*\}\n\s*\}\n\s*\}, \[reportType, header\.data\]\);/;

const replacementState = `useEffect(() => {
    if (reportType === "avarias") {
      const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().split("T")[0];
      setHeader((prev) => ({ ...prev, data: today }));
    }
  }, [reportType]);`;

code = code.replace(regexState, replacementState);

fs.writeFileSync('src/components/RelatoriosModule.tsx', code);
