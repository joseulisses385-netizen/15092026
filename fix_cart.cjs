const fs = require('fs');
let code = fs.readFileSync('src/components/CartDrawer.tsx', 'utf8');

// 1. Split Rua and Numero
const addrOld = `
                    <div className="col-span-2">
                      <label className="block text-[11px] font-bold text-purple-200 mb-1">
                        Rua e Número *
                      </label>
                      <input
                        type="text"
                        required
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="Rua das Flores, 123"
                        className="w-full px-3 py-2 rounded-xl bg-[#1b0222] border border-purple-700/60 text-xs text-white placeholder-purple-400/50 focus:outline-none focus:border-pink-500"
                      />
                    </div>
`;

const addrNew = `
                    <div className="col-span-2 grid grid-cols-[2fr_1fr] gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-purple-200 mb-1">
                          Endereço / Rua *
                        </label>
                        <input
                          type="text"
                          required
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                          placeholder="Ex: Rua das Flores"
                          className="w-full px-3 py-2 rounded-xl bg-[#1b0222] border border-purple-700/60 text-xs text-white placeholder-purple-400/50 focus:outline-none focus:border-pink-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-purple-200 mb-1">
                          Número *
                        </label>
                        <input
                          type="text"
                          required
                          value={addressNumber}
                          onChange={(e) => setAddressNumber(e.target.value)}
                          placeholder="Ex: 123"
                          className="w-full px-3 py-2 rounded-xl bg-[#1b0222] border border-purple-700/60 text-xs text-white placeholder-purple-400/50 focus:outline-none focus:border-pink-500"
                        />
                      </div>
                    </div>
`;

code = code.replace(addrOld.trim(), addrNew.trim());

// 2. Remove "Abrir Link de Pagamento" from payment method description
const linkToRemove = `
                      {settings.cardGatewayUrl && (
                        <a
                          href={settings.cardGatewayUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[11px]"
                        >
                          <span>Abrir Link de Pagamento</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
`;

code = code.replace(linkToRemove, "");

// Write back
fs.writeFileSync('src/components/CartDrawer.tsx', code);
