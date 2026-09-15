import React from 'react';
import { ShieldCheck, Truck, Sparkles, Heart } from 'lucide-react';
import { StoreSettings } from '../types';

interface FeaturesSectionProps {
  settings: StoreSettings;
}

export const FeaturesSection: React.FC<FeaturesSectionProps> = ({ settings }) => {
  const features = [
    {
      icon: Sparkles,
      title: settings.feature1Title || "Estampas Autênticas",
      description:
        settings.feature1Desc ||
        "Cores vibrantes que não desbotam na lavagem e desenhos exclusivos para todos os gostos.",
      color: "from-pink-500 to-rose-600",
    },
    {
      icon: Heart,
      title: settings.feature2Title || "Conforto Máximo",
      description:
        settings.feature2Desc ||
        "Trama canelada em algodão selecionado com elastano para ajuste suave sem apertar a perna.",
      color: "from-purple-500 to-indigo-600",
    },
    {
      icon: Truck,
      title: settings.feature3Title || "Envio Rápido",
      description:
        settings.feature3Desc ||
        "Pedidos despachados com agilidade e rastreio para você curtir suas meias sem demora.",
      color: "from-amber-500 to-orange-600",
    },
    {
      icon: ShieldCheck,
      title: settings.feature4Title || "Compra Segura",
      description:
        settings.feature4Desc ||
        "Fechamento transparente via Pix, WhatsApp e também na nossa loja oficial no TikTok Shop.",
      color: "from-emerald-500 to-teal-600",
    },
  ];

  return (
    <section className="py-14 bg-gradient-to-b from-[#180122] via-[#280436] to-[#180122] text-white relative overflow-hidden border-y border-pink-500/30">
      {/* Decorative ambient glows */}
      <div className="absolute -top-10 left-1/3 w-80 h-80 bg-[#ff007f]/15 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute -bottom-10 right-1/3 w-80 h-80 bg-[#00f2fe]/15 blur-3xl rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-4xl font-black font-fun tracking-tight text-white">
            {settings.featuresTitle || (
              <>
                Por que escolher a{" "}
                <span className="bg-gradient-to-r from-[#ff007f] via-[#ffe600] to-[#00f2fe] bg-clip-text text-transparent">
                  Doidas e Meias
                </span>
                ? ✨
              </>
            )}
          </h2>
          <p className="text-sm sm:text-base text-purple-200/90 mt-1.5 font-medium">
            {settings.featuresSubtitle || "Qualidade premium e muito carinho em cada detalhe para os seus pés"}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="bg-[#21022a] p-6 rounded-3xl border border-pink-500/30 hover:border-[#ffe600] hover:shadow-[0_0_25px_rgba(255,230,0,0.2)] transition-all group shadow-xl hover:-translate-y-1"
              >
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${f.color} flex items-center justify-center text-white mb-4 shadow-md group-hover:scale-110 transition-transform`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold font-fun text-white mb-1.5">
                  {f.title}
                </h3>
                <p className="text-xs sm:text-sm text-purple-200/70 leading-relaxed">
                  {f.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
