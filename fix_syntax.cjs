const fs = require('fs');
let code = fs.readFileSync('src/components/CartDrawer.tsx', 'utf8');

code = code.replace(
  `                        Garantias
                      </button>
                  </div>`,
  `                        Garantias
                      </button>
                    )}
                  </div>`
);

// We also had an error at 825: `The character "}" is not valid inside a JSX element`
code = code.replace(
  `}
                    )}
                  <div className="flex justify-between items-center`,
  `
                    )}
                  <div className="flex justify-between items-center`
);

fs.writeFileSync('src/components/CartDrawer.tsx', code);
