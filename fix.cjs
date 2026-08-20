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

const rep = `            </table>
          )}
        </div>
      </div>
    </div>
  );
}`;
content = content.replace(`            </table>
          )}
        </div>
      </div>
    </div>
  );
}`, `            </table>
          )}
        </div>
      </div>
    </div>
  );
}`);

// Just rewrite the end!
const endLines = content.split('\n').slice(-25).join('\n');
console.log(endLines);
