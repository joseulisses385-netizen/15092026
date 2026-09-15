const fs = require('fs');
let code = fs.readFileSync('src/components/CartDrawer.tsx', 'utf8');

// The JSX currently has `{settings.enablePix && (` and `{settings.enableCard && (`
// Let's just remove those conditionals so Pix, Cartão, Boleto, and WhatsApp always show.
code = code.replace('{settings.enablePix && (', '');
code = code.replace(
  `                      </button>
                    )}`,
  `                      </button>`
);

code = code.replace('{settings.enableCard && (', '');
code = code.replace(
  `                      </button>
                    )}`,
  `                      </button>`
);

fs.writeFileSync('src/components/CartDrawer.tsx', code);
