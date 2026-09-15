import React from 'react';
import { Star, CheckCircle2, Instagram } from 'lucide-react';
import { StoreSettings } from '../types';

interface MarketplaceReviewsProps {
  settings: StoreSettings;
}

export const MarketplaceReviews: React.FC<MarketplaceReviewsProps> = ({ settings }) => {
  const reviews = [
    {
      id: 1,
      name: 'Mariana Silva',
      location: 'São Paulo, SP',
      channel: 'tiktok',
      channelLabel: 'Comprador(a) via TikTok Shop',
      rating: 5,
      comment:
        'Chegou super rápido! O tecido é de alta qualidade, grosso e não escorrega no tênis. A meia de ovos fritos e a de abacate são as coisas mais fofas!',
      date: 'Há 2 dias',
      product: 'Meia Cano Alto Ovos Fritos',
    },
    {
      id: 2,
      name: 'Lucas Medeiros',
      location: 'Curitiba, PR',
      channel: 'whatsapp',
      channelLabel: 'Comprador via WhatsApp',
      rating: 5,
      comment:
        'Atendimento no WhatsApp é nota 10! A equipe tirou fotos do estoque em tempo real para eu escolher 5 pares. Paguei no Pix e postaram no mesmo dia.',
      date: 'Há 4 dias',
      product: 'Kit 5 Pares Geek & Fun',
    },
    {
      id: 3,
      name: 'Beatriz Almeida',
      location: 'Belo Horizonte, MG',
      channel: 'instagram',
      channelLabel: 'Seguidora via Instagram',
      rating: 5,
      comment:
        'Vi o reels no Instagram e me apaixonei. Comprei para dar de presente pro meu namorado e ele amou. As cores continuam perfeitas depois de várias lavagens!',
      date: 'Há 1 semana',
      product: 'Camiseta + Meia Hambúrguer',
    },
    {
      id: 4,
      name: 'Rafael Oliveira',
      location: 'Rio de Janeiro, RJ',
      channel: 'site',
      channelLabel: 'Compra Verificada no Site',
      rating: 5,
      comment:
        'Melhor loja de meias criativas! O elástico do cano não machuca nem aperta a panturrilha. Já fiz um segundo pedido para mim e para a família.',
      date: 'Há 1 semana',
      product: 'Meia Cano Médio Melancia',
    },
  ];

  return (
    <section id="reviews-section" className="py-14 sm:py-18 bg-gradient-to-b from-[#180122] via-[#24032e] to-[#180122] border-t border-pink-500/25 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold mb-2">
            <span className="flex text-amber-300">
              {'★★★★★'}
            </span>
            <span>4.9 / 5.0 (Mais de 3.200 clientes felizes)</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-fun tracking-tight text-white">
            O Que Dizem Quem Já Comprou
          </h2>
          <p className="text-xs sm:text-sm text-purple-200/80 mt-1">
            Depoimentos reais de quem adquiriu pelo TikTok Shop, WhatsApp, Instagram e pelo nosso site.
          </p>
        </div>

        {/* Reviews Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-5 rounded-2xl bg-[#280435] border border-purple-700/40 shadow-lg flex flex-col justify-between hover:border-pink-500/50 transition-all"
            >
              <div>
                {/* Channel & Verification Badge */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-[10px] text-purple-300/70">{rev.date}</span>
                </div>

                {/* Comment */}
                <p className="text-xs text-purple-100/90 leading-relaxed italic mb-4">
                  "{rev.comment}"
                </p>
              </div>

              <div className="pt-3 border-t border-purple-800/40">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white">{rev.name}</h4>
                    <span className="text-[10px] text-purple-300/70 block">{rev.location}</span>
                  </div>
                  
                  {/* Origin Icon */}
                  <div className="shrink-0 text-sm">
                    {rev.channel === 'tiktok' && <span title="TikTok Shop">🎵</span>}
                    {rev.channel === 'whatsapp' && <span title="WhatsApp">💬</span>}
                    {rev.channel === 'instagram' && (
                      <Instagram className="w-3.5 h-3.5 text-pink-400" />
                    )}
                    {rev.channel === 'site' && <span>🛍️</span>}
                  </div>
                </div>

                <div className="mt-2 flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span className="truncate">{rev.channelLabel}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Omnichannel Bottom Call */}
        <div className="mt-10 p-6 rounded-3xl bg-gradient-to-r from-purple-900/40 via-pink-900/30 to-purple-900/40 border border-purple-600/30 text-center flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left">
            <h4 className="text-sm sm:text-base font-black text-white font-fun">
              Poste sua foto com a tag <span className="text-pink-400">@doidas.e.meias</span>
            </h4>
            <p className="text-xs text-purple-200/80 mt-0.5">
              Apareça nos nossos stories e ganhe um cupom de 15% OFF para a sua próxima compra!
            </p>
          </div>
          <div className="flex items-center gap-3">
            {settings.instagramUrl && (
              <a
                href={settings.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-700 to-pink-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md hover:scale-105 transition-all"
              >
                <Instagram className="w-3.5 h-3.5" />
                <span>Marcar no Instagram</span>
              </a>
            )}
            {settings.tiktokShopUrl && (
              <a
                href={settings.tiktokShopUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-black text-white font-bold text-xs flex items-center gap-1.5 border border-pink-500/40 shadow-md hover:scale-105 transition-all"
              >
                <span>🎵</span>
                <span>Ver no TikTok</span>
              </a>
            )}
          </div>
        </div>

      </div>
    </section>
  );
};
