const fs = require('fs');
let code = fs.readFileSync('src/components/CustomerAuthModal.tsx', 'utf8');

const registerJsxPass = `
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-purple-200 mb-1">
                    Criar Senha *
                  </label>
                  <input
                    type="password"
                    required
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    placeholder="Sua senha"
                    className="w-full px-3 py-2 rounded-xl bg-[#1b0222] border border-purple-700/60 text-xs text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-purple-200 mb-1">
                    Confirmar Senha *
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita a senha"
                    className="w-full px-3 py-2 rounded-xl bg-[#1b0222] border border-purple-700/60 text-xs text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>
`;

code = code.replace(
  /<div className="grid grid-cols-2 gap-2">\s*<div>\s*<label className="block text-\[11px\] font-bold text-purple-200 mb-1 flex items-center justify-between">/g,
  registerJsxPass + '\n              <div className="grid grid-cols-2 gap-2">\n                <div>\n                  <label className="block text-[11px] font-bold text-purple-200 mb-1 flex items-center justify-between">'
);

fs.writeFileSync('src/components/CustomerAuthModal.tsx', code);
