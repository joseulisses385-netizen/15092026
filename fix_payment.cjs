const fs = require('fs');
let code = fs.readFileSync('src/components/CartDrawer.tsx', 'utf8');

// Change grid-cols-3 to grid-cols-2 or grid-cols-2 sm:grid-cols-4
code = code.replace(
  '<div className="grid grid-cols-3 gap-2">',
  '<div className="grid grid-cols-2 sm:grid-cols-4 gap-2">'
);

// We need to inject the "Boleto" option after the "Cartão" option.
// Let's find where Cartão ends.
const cartaoEnd = `</span>\n                      </button>\n                    )}`;

const boletoOption = `
                    {/* Boleto - Mercado Pago */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('boleto')}
                      className={\`p-2.5 rounded-xl border text-center transition-all cursor-pointer \${
                        paymentMethod === 'boleto'
                          ? 'bg-cyan-600/30 border-cyan-500 text-white font-bold ring-1 ring-cyan-500'
                          : 'bg-[#1b0222] border-purple-800/60 text-purple-300 hover:border-cyan-500/50'
                      }\`}
                    >
                      <span className="block text-base">📄</span>
                      <span className="text-[11px] block mt-1 font-bold">Boleto</span>
                    </button>
`;

code = code.replace(cartaoEnd, cartaoEnd + boletoOption);

// Also need to add the Boleto Details view below CARTÃO DETAILS
const cartaoDetailsEndPattern = /<\/div>\n                  \)}\n\n                  \{\/\* WHATSAPP DETAILS \*\/\}/;

const boletoDetails = `
                  {/* BOLETO DETAILS */}
                  {paymentMethod === 'boleto' && (
                    <div className="p-3.5 rounded-2xl bg-[#1a0224] border border-cyan-500/50 space-y-2 text-xs">
                      <div className="flex items-center gap-2 text-cyan-300 font-bold">
                        <span>📄</span>
                        <span>Boleto Bancário (Mercado Pago)</span>
                      </div>
                      <p className="text-[11px] text-purple-200">
                        Após finalizar, você será redirecionado para o Mercado Pago para gerar seu boleto.
                      </p>
                    </div>
                  )}
`;

code = code.replace(cartaoDetailsEndPattern, `</div>\n                  )}\n` + boletoDetails + `\n                  {/* WHATSAPP DETAILS */}`);

// We also need to add 'boleto' to the type of paymentMethod state.
code = code.replace(
  "const [paymentMethod, setPaymentMethod] = useState<'pix' | 'cartao' | 'whatsapp' | 'tiktok_shop'>('pix');",
  "const [paymentMethod, setPaymentMethod] = useState<'pix' | 'cartao' | 'boleto' | 'whatsapp' | 'tiktok_shop'>('pix');"
);

// We also need to add 'boleto' to the type in src/types.ts
fs.writeFileSync('src/components/CartDrawer.tsx', code);

// Update types
let types = fs.readFileSync('src/types.ts', 'utf8');
types = types.replace(
  "paymentMethod: 'pix' | 'cartao' | 'whatsapp' | 'tiktok_shop';",
  "paymentMethod: 'pix' | 'cartao' | 'boleto' | 'whatsapp' | 'tiktok_shop';"
);
fs.writeFileSync('src/types.ts', types);
