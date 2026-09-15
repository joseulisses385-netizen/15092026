const fs = require('fs');
let code = fs.readFileSync('src/components/CartDrawer.tsx', 'utf8');

// Add state for password in CartDrawer
code = code.replace(
  "const [customerEmail, setCustomerEmail] = useState('');",
  "const [customerEmail, setCustomerEmail] = useState('');\n  const [customerPassword, setCustomerPassword] = useState('');"
);

// Require password if not logged in
const passCheck = `
    if (!currentUser && !customerPassword) {
      alert('Crie uma senha segura para rastrear seu pedido depois.');
      return;
    }
`;
code = code.replace(
  "if (!customerEmail || !customerEmail.includes('@')) {",
  passCheck + "\n    if (!customerEmail || !customerEmail.includes('@')) {"
);

// Inject password into Order payload
code = code.replace(
  "customerEmail: customerEmail.trim().toLowerCase(),",
  "customerEmail: customerEmail.trim().toLowerCase(),\n      customerPassword: customerPassword,"
);

// Render the password field in JSX
const passField = `
                  {!currentUser && (
                    <div className="pt-2">
                      <label className="block text-[11px] font-bold text-purple-200 mb-1 flex items-center justify-between">
                        <span>Crie uma Senha para acompanhar o pedido</span>
                        <span className="text-pink-400">Obrigatório</span>
                      </label>
                      <input
                        type="password"
                        required
                        value={customerPassword}
                        onChange={(e) => setCustomerPassword(e.target.value)}
                        placeholder="Crie sua senha secreta"
                        className="w-full px-3 py-2 rounded-xl bg-[#1b0222] border border-pink-700/60 text-xs text-white placeholder-purple-400/50 focus:outline-none focus:border-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.15)]"
                      />
                    </div>
                  )}
`;

code = code.replace(
  /\{\/\* Checkbox de autorização para cupons e ofertas \*\/\}/,
  passField.trim() + "\n\n                  {/* Checkbox de autorização para cupons e ofertas */}"
);

fs.writeFileSync('src/components/CartDrawer.tsx', code);
