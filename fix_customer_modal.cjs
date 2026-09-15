const fs = require('fs');
let code = fs.readFileSync('src/components/CustomerAuthModal.tsx', 'utf8');

// We need to add state for addressNumber in CustomerAuthModal.tsx
code = code.replace(
  'const [address, setAddress] = useState(\'\');',
  'const [address, setAddress] = useState(\'\');\n  const [addressNumber, setAddressNumber] = useState(\'\');\n  const [complement, setComplement] = useState(\'\');'
);

code = code.replace(
  'setAddress(currentUser.address || \'\');',
  'setAddress(currentUser.address || \'\');\n      setAddressNumber(currentUser.addressNumber || \'\');\n      setComplement(currentUser.complement || \'\');'
);

// Payload for register
code = code.replace(
  'address: address.trim(),',
  'address: address.trim(),\n        addressNumber: addressNumber.trim(),\n        complement: complement.trim(),'
);

// Update via cep logic
code = code.replace(
  'if (data.logradouro && !address) {\\n          setAddress(data.logradouro);\\n        }',
  'if (data.logradouro && !address) {\n          setAddress(data.logradouro);\n        }'
);

const oldAddressField = `
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-purple-200">
                    Endereço Completo
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Rua, número, complemento"
                    className="w-full px-3 py-2 rounded-xl bg-[#1b0222] border border-purple-700/60 text-xs text-white placeholder-purple-400/50 focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>
`;

// Let's replace the Endereço Completo input using regex.
const replacement = `
              <div className="grid grid-cols-6 gap-3">
                <div className="col-span-4 space-y-1">
                  <label className="text-[11px] font-bold text-purple-200">
                    Endereço / Rua
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Ex: Rua das Flores"
                    className="w-full px-3 py-2 rounded-xl bg-[#1b0222] border border-purple-700/60 text-xs text-white placeholder-purple-400/50 focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-[11px] font-bold text-purple-200">
                    Número
                  </label>
                  <input
                    type="text"
                    value={addressNumber}
                    onChange={(e) => setAddressNumber(e.target.value)}
                    placeholder="Ex: 123"
                    className="w-full px-3 py-2 rounded-xl bg-[#1b0222] border border-purple-700/60 text-xs text-white placeholder-purple-400/50 focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>
              <div className="space-y-1 mt-2">
                <label className="text-[11px] font-bold text-purple-200">
                  Complemento
                </label>
                <input
                  type="text"
                  value={complement}
                  onChange={(e) => setComplement(e.target.value)}
                  placeholder="Ex: Apto 402, Bloco B"
                  className="w-full px-3 py-2 rounded-xl bg-[#1b0222] border border-purple-700/60 text-xs text-white placeholder-purple-400/50 focus:outline-none focus:border-pink-500"
                />
              </div>
`;

code = code.replace(
  /<div className="space-y-1">\s*<label className="text-\[11px\] font-bold text-purple-200">\s*Endereço Completo\s*<\/label>\s*<input\s*type="text"\s*value=\{address\}\s*onChange=\{\(e\) => setAddress\(e\.target\.value\)\}\s*placeholder="Rua, número, complemento"\s*className="w-full px-3 py-2 rounded-xl bg-\[#1b0222\] border border-purple-700\/60 text-xs text-white placeholder-purple-400\/50 focus:outline-none focus:border-pink-500"\s*\/>\s*<\/div>/,
  replacement
);

fs.writeFileSync('src/components/CustomerAuthModal.tsx', code);
