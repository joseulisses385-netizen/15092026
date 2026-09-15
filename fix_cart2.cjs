const fs = require('fs');
let code = fs.readFileSync('src/components/CartDrawer.tsx', 'utf8');

const addressField = `
                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-2 space-y-1.5">
                        <label className="text-[11px] font-bold text-purple-200">
                          Endereço / Rua *
                        </label>
                        <input
                          type="text"
                          required
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                          placeholder="Rua das Flores"
                          className="w-full px-3 py-2 rounded-xl bg-[#1b0222] border border-purple-700/60 text-xs text-white placeholder-purple-400/50 focus:outline-none focus:border-pink-500"
                        />
                      </div>
                      <div className="col-span-1 space-y-1.5">
                        <label className="text-[11px] font-bold text-purple-200">
                          Número *
                        </label>
                        <input
                          type="text"
                          required
                          value={addressNumber}
                          onChange={(e) => setAddressNumber(e.target.value)}
                          placeholder="123"
                          className="w-full px-3 py-2 rounded-xl bg-[#1b0222] border border-purple-700/60 text-xs text-white placeholder-purple-400/50 focus:outline-none focus:border-pink-500"
                        />
                      </div>
                    </div>
`;

// Replace the original deliveryAddress field
code = code.replace(
  /<div className="space-y-1.5">[\s\S]*?Rua das Flores, 123[\s\S]*?<\/div>/,
  addressField.trim()
);

fs.writeFileSync('src/components/CartDrawer.tsx', code);
