import React from 'react';
import { ExternalLink, Sparkles, ShoppingBag, Flame, Video, CheckCircle2 } from 'lucide-react';
import { StoreSettings, Product } from '../types';

interface TikTokHubSectionProps {
  settings: StoreSettings;
  products: Product[];
  onSelectProduct?: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export const TikTokHubSection: React.FC<TikTokHubSectionProps> = ({
  settings,
  products,
  onAddToCart,
}) => {
  // Filter products trending or with TikTok link
  const tiktokTrends = products.slice(0, 3);

  return (
    <section id="tiktok-hub" className="py-14 sm:py-18 relative overflow-hidden bg-gradient-to-b from-[#21032a] via-[#2d0439] to-[#21032a] border-y border-pink-500/30">
      {/* Decorative Glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#ff1a8c]/15 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#06b6d4]/15 blur-3xl rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Banner Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#17021d] via-[#24032d] to-[#17021d] border-2 border-pink-500/50 shadow-2xl mb-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-black border-2 border-[#00f2fe] shadow-[0_0_20px_rgba(0,242,254,0.4)] flex items-center justify-center text-3xl shrink-0 group-hover:scale-105 transition-transform">
              🎵
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-400 border border-pink-500/40 text-[11px] font-black uppercase tracking-wider">
                  {settings.tiktokBadgeText || "Oficial TikTok Shop"}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-amber-300 font-bold">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  Viral nas redes
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black font-fun text-white mt-1">
                {settings.tiktokSectionTitle || (
                  <>
                    Compre também pelo <span className="text-[#00f2fe]">TikTok</span>{" "}
                    <span className="text-[#ff1a8c]">Shop</span>
                  </>
                )}
              </h2>
              <p className="text-xs sm:text-sm text-purple-200/80 mt-1 max-w-xl">
                {settings.tiktokSectionSubtitle || (
                  <>
                    Siga nosso perfil oficial{" "}
                    <strong className="text-amber-300">
                      {settings.tiktokUsername || "@doidas.e.meias"}
                    </strong>{" "}
                    para cupons de frete grátis, lives semanais com descontos e unboxings dos clientes!
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <a
              href={settings.tiktokShopUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-gradient-to-r from-[#ff1a8c] via-purple-600 to-[#00f2fe] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(255,26,140,0.5)] hover:scale-105 transition-all cursor-pointer"
            >
              <span>{settings.tiktokButtonText || "Abrir TikTok Shop Oficial"}</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Benefits Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="p-4 rounded-2xl bg-[#1d0324]/80 border border-purple-800/60 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-pink-500/20 text-pink-400 border border-pink-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Cupons da Plataforma</h4>
              <p className="text-[11px] text-purple-300/70">Aproveite frete reduzido e cupons da TikTok Shop</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#1d0324]/80 border border-purple-800/60 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Vídeos Demonstrativos</h4>
              <p className="text-[11px] text-purple-300/70">Veja as meias no pé, a elasticidade e as cores reais</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#1d0324]/80 border border-purple-800/60 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Estoque Sincronizado</h4>
              <p className="text-[11px] text-purple-300/70">Mesmo estoque e preço garantidos pelo site e TikTok</p>
            </div>
          </div>
        </div>

        {/* Featured TikTok Products */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {tiktokTrends.map((product) => (
            <div
              key={product.id}
              className="bg-[#24032d] rounded-3xl border border-purple-700/60 hover:border-pink-500 p-4 transition-all duration-300 shadow-xl flex flex-col justify-between group"
            >
              <div>
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-black mb-3">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <span className="px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md text-[#00f2fe] border border-[#00f2fe]/40 text-[10px] font-black flex items-center gap-1">
                      <span>🎵</span>
                      <span>Trend TikTok</span>
                    </span>
                  </div>
                </div>
                <h3 className="font-bold text-sm text-white line-clamp-1">{product.name}</h3>
                <p className="text-xs text-purple-300/70 line-clamp-2 mt-0.5">{product.description}</p>
              </div>

              <div className="pt-3 border-t border-purple-900/50 mt-3 flex items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] text-purple-300 block">Preço</span>
                  <span className="text-base font-black text-amber-300 font-fun">
                    R$ {Number(product.price).toFixed(2).replace('.', ',')}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <a
                    href={product.tiktokShopUrl || settings.tiktokShopUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-black hover:bg-zinc-900 border border-pink-500/60 text-white text-xs font-bold transition-all shadow-md"
                    title="Ver produto no TikTok Shop"
                  >
                    🎵
                  </a>

                  <button
                    onClick={() => onAddToCart(product)}
                    className="px-3 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white text-xs font-black flex items-center gap-1 shadow-md transition-all cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Sacola</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
