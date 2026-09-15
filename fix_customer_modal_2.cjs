const fs = require('fs');
let code = fs.readFileSync('src/components/CustomerAuthModal.tsx', 'utf8');

const replacement = `
                <div className="col-span-1 sm:col-span-2 grid grid-cols-6 gap-2">
                  <div className="col-span-4">
                    <label className="block text-[11px] font-bold text-purple-200 mb-1">
                      Endereço / Rua
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Sua rua"
                      className="w-full px-3 py-2 rounded-xl bg-[#1b0222] border border-purple-700/60 text-xs text-white placeholder-purple-400/50 focus:outline-none focus:border-pink-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[11px] font-bold text-purple-200 mb-1">
                      Número
                    </label>
                    <input
                      type="text"
                      value={addressNumber}
                      onChange={(e) => setAddressNumber(e.target.value)}
                      placeholder="123"
                      className="w-full px-3 py-2 rounded-xl bg-[#1b0222] border border-purple-700/60 text-xs text-white placeholder-purple-400/50 focus:outline-none focus:border-pink-500"
                    />
                  </div>
                  <div className="col-span-6">
                    <label className="block text-[11px] font-bold text-purple-200 mb-1">
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
                </div>
`;

const original = `
                <div>
                  <label className="block text-[11px] font-bold text-purple-200 mb-1">
                    Rua e Número
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Rua, número, complemento"
                    className="w-full px-3 py-2 rounded-xl bg-[#1b0222] border border-purple-700/60 text-xs text-white placeholder-purple-400/50 focus:outline-none focus:border-pink-500"
                  />
                </div>
`;

code = code.replace(original.trim(), replacement.trim());

fs.writeFileSync('src/components/CustomerAuthModal.tsx', code);
