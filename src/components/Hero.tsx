import React from 'react';
import { ShoppingBag, Instagram } from 'lucide-react';
import { StoreSettings } from '../types';
import { OFFICIAL_BRAND_LOGO, OFFICIAL_FALLBACK_LOGO } from '../constants/assets';

interface HeroProps {
  settings: StoreSettings;
  onOpenCustomerAuth?: () => void;
  isDirectorLoggedIn?: boolean;
  onOpenDirectorPanel?: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  settings,
  isDirectorLoggedIn,
  onOpenDirectorPanel,
}) => {
  const customMessage =
    settings.heroWhatsAppDefaultMessage ||
    "Olá! Vim pelo site da Doidas e Meias e quero comprar!";
  const whatsappUrl = `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(
    customMessage
  )}`;

  return (
    <section className="relative overflow-hidden pt-6 pb-12 md:pt-10 md:pb-16 bg-gradient-to-b from-[#1a0126] via-[#2d053d] to-[#1a0126]">
      {/* Dynamic Animated Ambient Neon Glows */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[750px] h-[450px] bg-gradient-to-r from-[#ff007f]/20 via-[#ffe600]/15 to-[#00f2fe]/20 blur-3xl -z-10 rounded-full pointer-events-none animate-pulse-glow" />
      <div className="absolute -top-10 left-10 w-72 h-72 bg-[#ff007f]/15 blur-3xl -z-10 rounded-full pointer-events-none" />
      <div className="absolute top-40 right-10 w-80 h-80 bg-[#00f2fe]/15 blur-3xl -z-10 rounded-full pointer-events-none" />

      {/* Floating fun confetti/stars decorations */}
      <div className="absolute top-16 left-[10%] text-2xl opacity-70 animate-float pointer-events-none select-none">✨</div>
      <div className="absolute top-28 right-[12%] text-2xl opacity-70 animate-float pointer-events-none select-none" style={{ animationDelay: '1.5s' }}>🧦</div>
      <div className="absolute bottom-16 left-[15%] text-xl opacity-60 animate-float pointer-events-none select-none" style={{ animationDelay: '0.8s' }}>⚡</div>
      <div className="absolute bottom-20 right-[18%] text-2xl opacity-70 animate-float pointer-events-none select-none" style={{ animationDelay: '2.2s' }}>💖</div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          {/* Logo Oficial com Cores Perfeitamente Integradas e Flutuação Natural */}
          <div className="relative mb-6 max-w-lg sm:max-w-xl md:max-w-2xl w-full flex flex-col items-center">
            {/* Brilho neon suave e orgânico atrás dos personagens (sem bordas ou formato de quadro) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 h-4/5 bg-gradient-to-tr from-[#ff007f]/20 via-[#ffe600]/10 to-[#00f2fe]/20 blur-3xl rounded-full -z-10 pointer-events-none" />
            
            <div className="relative flex items-center justify-center animate-float">
              <img
                id="hero-main-mascot-logo"
                src={settings.heroMascotUrl || OFFICIAL_BRAND_LOGO}
                alt={settings.storeName}
                className="w-auto max-w-full h-auto max-h-[300px] sm:max-h-[400px] md:max-h-[480px] object-contain select-none transition-all duration-500 hover:scale-105 drop-shadow-[0_12px_30px_rgba(255,0,127,0.35)] drop-shadow-[0_4px_14px_rgba(0,242,254,0.25)] filter"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  if (e.currentTarget.dataset.fallback) return;
                  e.currentTarget.dataset.fallback = "true";
                  e.currentTarget.src = OFFICIAL_FALLBACK_LOGO;
                }}
              />
            </div>
          </div>

          {/* Headline alegre e brilhante com gradiente de alta energia */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black font-fun tracking-tight mb-3 max-w-4xl leading-tight">
            <span className="bg-gradient-to-r from-[#ff007f] via-[#ffe600] to-[#00f2fe] bg-clip-text text-transparent drop-shadow-[0_2px_20px_rgba(255,0,127,0.3)]">
              {settings.heroTitle || "As Meias Mais Doidinhas do Brasil!"}
            </span>
          </h1>

          {/* Subtitle cativante */}
          <p className="text-base sm:text-lg md:text-xl text-purple-100 font-medium max-w-2xl mx-auto leading-relaxed mb-8">
            {settings.heroSubtitle || "Cores vibrantes, estampas autênticas e muito conforto para os seus pés. Compre pelo TikTok Shop, WhatsApp, Instagram ou direto no site!"}
          </p>

          {/* Omnichannel Marketplace CTAs - Botão 'Ver Estoque' removido para clientes */}
          <div className="flex flex-wrap items-center justify-center gap-3 w-full max-w-3xl">
            {/* WhatsApp Direct */}
            <a
              id="hero-whatsapp-cta"
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 rounded-full bg-[#22c55e] hover:bg-[#16a34a] text-white font-black text-sm sm:text-base shadow-lg shadow-green-950/40 hover:scale-105 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="text-lg">💬</span>
              <span>{settings.heroCtaWhatsAppText || "Comprar no WhatsApp"}</span>
            </a>

            {/* TikTok Shop */}
            {settings.tiktokShopUrl && (
              <a
                id="hero-tiktok-cta"
                href={settings.tiktokShopUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 rounded-full bg-black hover:bg-zinc-900 text-white font-bold text-sm sm:text-base shadow-lg border border-pink-500/40 hover:scale-105 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="text-base">🎵</span>
                <span>{settings.heroCtaTikTokText || "TikTok Shop Oficial"}</span>
              </a>
            )}

            {/* Instagram */}
            {settings.instagramUrl && (
              <a
                id="hero-instagram-cta"
                href={settings.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 rounded-full bg-gradient-to-r from-purple-700 via-pink-600 to-amber-500 hover:opacity-95 text-white font-bold text-sm sm:text-base shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Instagram className="w-5 h-5 text-white" />
                <span>Instagram Oficial</span>
              </a>
            )}

            {/* Catálogo do Site */}
            <a
              id="hero-catalog-cta"
              href="#produtos"
              className="px-6 py-3.5 rounded-full bg-gradient-to-r from-[#ff007f] via-[#a855f7] to-[#00f2fe] text-white font-black text-sm sm:text-base shadow-lg shadow-pink-500/30 hover:scale-105 transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/30"
            >
              <ShoppingBag className="w-5 h-5 text-[#ffe600]" />
              <span>{settings.heroCtaSiteText || "Explorar Catálogo Colorido"}</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
