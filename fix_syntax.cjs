const fs = require('fs');
const filePath = 'src/components/RelatoriosModule.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// Replace the whole print block container manually:
content = content.replace(
  '<div className="hidden print:block w-full text-black font-sans bg-white pt-2">',
  '{!isAutoReport(reportType) && (\n<div className="hidden print:block w-full text-black font-sans bg-white pt-2">'
);

// We need an extra </div>)} at the end before </div></div>}
const endTarget = `          )}
        </div>
      </div>
    </div>
  );
}`;

const endReplacement = `          )}
        </div>
        )}
      </div>
    </div>
  );
}`;
content = content.replace(endTarget, endReplacement);
fs.writeFileSync(filePath, content);
