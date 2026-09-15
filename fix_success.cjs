const fs = require('fs');
let code = fs.readFileSync('src/components/CartDrawer.tsx', 'utf8');

const successPaymentPattern = /<div className="border-t border-purple-900\/60 pt-1\.5 text-\[11px\] text-purple-300\/90">/;

const paymentInstructions = `
                {/* INSTRUCOES DE PAGAMENTO NO SUCESSO */}
                {(completedOrder.paymentMethod === 'cartao' || completedOrder.paymentMethod === 'boleto') && settings.cardGatewayUrl && (
                  <div className="mt-3 p-3 bg-cyan-950/40 border border-cyan-500/50 rounded-xl text-center space-y-2">
                    <p className="text-[11px] text-cyan-200 font-semibold">
                      Para concluir o seu pedido, realize o pagamento via Mercado Pago através do link abaixo:
                    </p>
                    <a
                      href={settings.cardGatewayUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[11px] shadow-lg shadow-cyan-900/30 transition-all hover:scale-105"
                    >
                      <span>💳 Pagar via Mercado Pago</span>
                    </a>
                  </div>
                )}
                {completedOrder.paymentMethod === 'pix' && (
                  <div className="mt-3 p-3 bg-pink-950/40 border border-pink-500/50 rounded-xl text-center space-y-2">
                    <p className="text-[11px] text-pink-200 font-semibold">
                      Para concluir o seu pedido, realize o PIX para a chave abaixo:
                    </p>
                    <p className="font-mono text-white text-sm bg-black/50 py-1.5 px-3 rounded-lg select-all">
                      {settings.pixKey || settings.whatsappNumber}
                    </p>
                  </div>
                )}
                
                <div className="border-t border-purple-900/60 pt-1.5 text-[11px] text-purple-300/90 mt-2">
`;

code = code.replace(successPaymentPattern, paymentInstructions);

fs.writeFileSync('src/components/CartDrawer.tsx', code);
