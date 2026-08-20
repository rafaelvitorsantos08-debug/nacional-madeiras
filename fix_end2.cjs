const fs = require('fs');
const filePath = 'src/components/RelatoriosModule.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

const oldEnd = `            </table>
          )}
        </div>
      </div>
    </div>
  );
}`;
const newEnd = `            </table>
          )}
        </div>
        )}
      </div>
    </div>
  );
}`;

content = content.replace(oldEnd, newEnd);
fs.writeFileSync(filePath, content);
