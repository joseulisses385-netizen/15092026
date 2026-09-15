import React from 'react';
import { Instagram, ShieldCheck, Truck } from 'lucide-react';
import { StoreSettings } from '../types';

interface MarketplaceChannelsStripProps {
  settings: StoreSettings;
}

export const MarketplaceChannelsStrip: React.FC<MarketplaceChannelsStripProps> = ({ settings }) => {
  const whatsappUrl = `https://wa.me/55${settings.whatsappNumber.replace(/\D/g, '')}?text=Olá! Vim da loja virtual e gostaria de tirar uma dúvida.`;

  return (
    <div className="bg-[#110116] py-4 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Compact Channels Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          
          {/* TikTok */}
          <a href={settings.tiktokShopUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl bg-[#1c0226] border border-pink-500/30 hover:border-pink-400 hover:bg-[#250333] transition-all group shadow-sm hover:shadow-md">
            <div className="w-10 h-10 rounded-lg bg-black border border-[#00f2fe]/40 flex items-center justify-center text-lg shadow-inner shrink-0 group-hover:scale-110 transition-transform">🎵</div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white leading-tight group-hover:text-pink-300 transition-colors">TikTok Shop</span>
              <span className="text-[10px] text-pink-300/80 font-medium mt-0.5">Cupons no App</span>
            </div>
          </a>

          {/* WhatsApp */}
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl bg-[#1c0226] border border-emerald-500/30 hover:border-emerald-400 hover:bg-[#250333] transition-all group shadow-sm hover:shadow-md">
            <div className="w-10 h-10 rounded-lg bg-[#22c55e]/20 border border-[#22c55e]/50 flex items-center justify-center text-lg shadow-inner shrink-0 group-hover:scale-110 transition-transform">💬</div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white leading-tight group-hover:text-emerald-300 transition-colors">WhatsApp</span>
              <span className="text-[10px] text-emerald-300/80 font-medium mt-0.5">Atendimento Rápido</span>
            </div>
          </a>

          {/* Instagram */}
          <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl bg-[#1c0226] border border-purple-500/30 hover:border-purple-400 hover:bg-[#250333] transition-all group shadow-sm hover:shadow-md">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white shadow-inner shrink-0 group-hover:scale-110 transition-transform">
              <Instagram className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white leading-tight group-hover:text-purple-300 transition-colors">Instagram</span>
              <span className="text-[10px] text-purple-300/80 font-medium mt-0.5">Looks & Stories</span>
            </div>
          </a>

          {/* Loja */}
          <a href="#produtos" className="flex items-center gap-3 p-3 rounded-xl bg-[#1c0226] border border-amber-500/30 hover:border-amber-400 hover:bg-[#250333] transition-all group shadow-sm hover:shadow-md">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-lg text-amber-300 shadow-inner shrink-0 group-hover:scale-110 transition-transform">🛍️</div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white leading-tight group-hover:text-amber-300 transition-colors">Loja Virtual</span>
              <span className="text-[10px] text-emerald-400 font-bold mt-0.5">5% OFF no Pix</span>
            </div>
          </a>

        </div>

      </div>
    </div>
  );
};
