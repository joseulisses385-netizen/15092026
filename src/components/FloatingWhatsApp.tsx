import React from 'react';
import { StoreSettings } from '../types';

interface FloatingWhatsAppProps {
  settings: StoreSettings;
}

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({ settings }) => {
  const whatsappUrl = `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(
    "Olá! Vim pelo site da Doidas e Meias e gostaria de tirar uma dúvida ou fazer um pedido!"
  )}`;

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
      <a
        id="floating-whatsapp-btn"
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2.5 px-4 py-3 bg-[#22c55e] hover:bg-[#16a34a] text-white rounded-full shadow-2xl shadow-green-950/60 transition-transform hover:scale-105 group font-bold text-xs sm:text-sm border-2 border-white/20"
        title="Falar no WhatsApp"
      >
        <span className="text-xl">💬</span>
        <span className="hidden sm:inline font-fun">Falar no WhatsApp</span>
      </a>
    </div>
  );
};
