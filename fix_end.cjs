const fs = require('fs');
const filePath = 'src/components/RelatoriosModule.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

const target = `          )}
        </div>
      </div>
    </div>
  );
}`;

const replacement = `          )}
        </div>
        )}
      </div>
    </div>
  );
}`;
content = content.replace(target, replacement);
fs.writeFileSync(filePath, content);
