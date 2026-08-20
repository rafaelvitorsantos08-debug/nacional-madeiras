const fs = require('fs');
const filePath = 'src/components/RelatoriosModule.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

const target = `            </table>
          )}
        </div>
      </div>
    </div>
  );
}`;

content = content.replace(target, `            </table>
          )}
        </div>
        )}
      </div>
    </div>
  );
}`);

// Wait, the previous replace did this!
// Let's just fix it by replacing the whole end with the correct string.
