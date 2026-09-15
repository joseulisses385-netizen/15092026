import React from 'react';
import { ExternalLink, Instagram, Phone, Package, ShieldCheck } from 'lucide-react';
import { StoreSettings } from '../types';

interface StockBannerProps {
  settings: StoreSettings;
}

export const StockBanner: React.FC<StockBannerProps> = ({ settings }) => {
  return (
    <section id="redes-sociais" className="py-16 sm:py-20 bg-gradient-to-b from-[#1c0226] via-[#2a0438] to-[#1c0226] border-t border-pink-500/25 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-black font-fun tracking-tight text-white mb-2">
            {settings.socialTitle || "Acompanhe a Doidas e Meias"}
          </h2>
          <p className="text-sm text-purple-200/80">
            {settings.socialSubtitle ||
              "Fique por dentro dos novos lançamentos, reposições e vídeos divertidos nas nossas redes oficiais!"}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* TikTok Card */}
          {settings.tiktokShopUrl && (
            <a
              href={settings.tiktokShopUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-6 rounded-3xl bg-[#23042c] border border-pink-500/30 hover:border-pink-500 flex flex-col items-center text-center group transition-all hover:scale-102 shadow-xl"
            >
              <div className="w-14 h-14 rounded-2xl bg-black border border-pink-500/50 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                🎵
              </div>
              <h3 className="font-bold text-lg font-fun text-white mb-1">
                {settings.socialTikTokTitle || "TikTok Shop Oficial"}
              </h3>
              <p className="text-xs text-purple-200/70 mb-4">
                {settings.socialTikTokDesc ||
                  "Assista aos nossos vídeos, confira avaliações e compre com cupons do TikTok."}
              </p>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-pink-400 group-hover:text-pink-300">
                <span>Acessar TikTok Shop</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </span>
            </a>
          )}

          {/* Instagram Card */}
          {settings.instagramUrl && (
            <a
              href={settings.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-6 rounded-3xl bg-[#23042c] border border-purple-500/30 hover:border-purple-400 flex flex-col items-center text-center group transition-all hover:scale-102 shadow-xl"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
                <Instagram className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-lg font-fun text-white mb-1">
                {settings.socialInstagramTitle || "Instagram"}
              </h3>
              <p className="text-xs text-purple-200/70 mb-4">
                {settings.socialInstagramDesc ||
                  "Fotos de alta resolução, unboxing dos clientes e novidades em primeira mão nos stories."}
              </p>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-pink-400 group-hover:text-pink-300">
                <span>Seguir {(settings.instagramUrl || "").replace(/.*instagram\.com\/?/, '@').replace(/\/$/, '') || "@doidasemeias"}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </span>
            </a>
          )}

          {/* WhatsApp Direct */}
          <a
            href={`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(
              settings.heroWhatsAppDefaultMessage || "Olá! Vim pelo site da Doidas e Meias!"
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-6 rounded-3xl bg-[#23042c] border border-emerald-500/30 hover:border-emerald-400 flex flex-col items-center text-center group transition-all hover:scale-102 shadow-xl"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#22c55e] flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-green-950/40">
              <Phone className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-lg font-fun text-white mb-1">
              {settings.socialWhatsAppTitle || "WhatsApp Atendimento"}
            </h3>
            <p className="text-xs text-purple-200/70 mb-4">
              {settings.socialWhatsAppDesc ||
                `Fale direto com a gente no ${settings.whatsappDisplay} para tirar dúvidas ou fazer pedidos personalizados.`}
            </p>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 group-hover:text-emerald-300">
              <span>Chamar no WhatsApp</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </span>
          </a>
        </div>
      </div>
    </section>
  );
};
