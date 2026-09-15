const fs = require('fs');
let code = fs.readFileSync('src/components/CartDrawer.tsx', 'utf8');

code = code.replace(
  `}
                    </div>
                  )}
                  <div className="flex justify-between items-center text-base font-black text-white pt-2 border-t border-purple-900/40">`,
  `}
                    </div>
                  <div className="flex justify-between items-center text-base font-black text-white pt-2 border-t border-purple-900/40">`
);

code = code.replace(
  `                        Remover
                      </button>
                  </div>`,
  `                        Remover
                      </button>
                    )}
                  </div>`
);

fs.writeFileSync('src/components/CartDrawer.tsx', code);
