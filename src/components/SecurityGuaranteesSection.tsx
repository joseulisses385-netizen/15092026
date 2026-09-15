import React from 'react';
import {
  ShieldCheck,
  Lock,
  RefreshCw,
  Truck,
  CreditCard,
  FileCheck,
  Building2,
  CheckCircle2,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { StoreSettings } from '../types';

interface SecurityGuaranteesSectionProps {
  settings: StoreSettings;
  onOpenGuaranteesModal: () => void;
}

export const SecurityGuaranteesSection: React.FC<SecurityGuaranteesSectionProps> = ({
  settings,
  onOpenGuaranteesModal,
}) => {
  const guarantees = [
    {
      icon: Lock,
      title: 'Site 100% Seguro & SSL 256-Bit',
      badge: 'Criptografia Total',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      iconBg: 'from-emerald-500 to-teal-700',
      description:
        'Conexão HTTPS blindada com certificado internacional. Toda a sua navegação e dados de pedidos são totalmente criptografados e protegidos.',
    },
    {
      icon: Truck,
      title: 'Entrega Garantida ou Seu Dinheiro de Volta',
      badge: 'Rastreio Correios',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      iconBg: 'from-amber-500 to-orange-600',
      description:
        'Todos os pacotes contam com seguro de carga e código de rastreamento oficial. Se houver qualquer extravio comprovado, nós enviamos outro imediatamente ou devolvemos 100%.',
    },
    {
      icon: CreditCard,
      title: 'Pagamento Blindado Mercado Pago',
      badge: 'Antifraude Ativo',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      iconBg: 'from-[#009ee3] to-[#0072bb]',
      description:
        'Tecnologia de ponta do Mercado Pago com certificação PCI-DSS. Seus dados de cartão nunca são gravados em nosso site e o Pix é instantâneo e seguro pelo Banco Central.',
    },
    {
      icon: RefreshCw,
      title: '7 Dias de Garantia de Devolução (CDC)',
      badge: 'Art. 49 do CDC',
      badgeColor: 'bg-pink-500/20 text-pink-300 border-pink-500/40',
      iconBg: 'from-pink-500 to-rose-600',
      description:
        'Comprou e não serviu ou quer trocar? Você tem até 7 dias corridos após a entrega para solicitar a troca ou devolução sem burocracia e com estorno integral.',
    },
    {
      icon: FileCheck,
      title: 'Privacidade & Proteção de Dados (LGPD)',
      badge: 'Lei 13.709/18',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      iconBg: 'from-purple-500 to-indigo-600',
      description:
        'Seus dados pessoais são confidenciais e utilizados estritamente para envio do pedido. Cumprimos com rigor as normas da Lei Geral de Proteção de Dados.',
    },
    {
      icon: Building2,
      title: 'Empresa Regularizada com Atendimento Real',
      badge: 'CNPJ Verificado',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      iconBg: 'from-blue-500 to-cyan-600',
      description:
        'Equipe brasileira disponível pelo WhatsApp oficial para tirar dúvidas antes, durante e após sua compra. Transparência total com você.',
    },
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-[#180122] via-[#100117] to-[#180122] text-white relative overflow-hidden border-y border-emerald-500/30">
      {/* Luz ambiente de fundo */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#009ee3]/10 blur-3xl rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Cabeçalho da Seção */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-bold text-xs uppercase tracking-wider mb-3 shadow-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Segurança & Confiança Doidas e Meias</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black font-fun tracking-tight text-white">
            Site 100% Seguro & Todas as{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Garantias de Proteção
            </span>
          </h2>
          <p className="text-sm sm:text-base text-purple-200/80 mt-2 leading-relaxed">
            Compre suas meias favoritas com tranquilidade absoluta. Cuidamos de cada detalhe com
            criptografia bancária, proteção ao consumidor e garantia de entrega.
          </p>
        </div>

        {/* Grid dos 6 Pilares de Garantia */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {guarantees.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="p-6 rounded-3xl bg-[#1c0226]/80 border border-purple-800/60 hover:border-emerald-500/60 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.iconBg} flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black border uppercase tracking-wide ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold font-fun text-white mb-2 group-hover:text-emerald-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-purple-200/75 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Faixa de Selos Oficiais de Certificação */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-[#170120] via-[#0e1626] to-[#170120] border-2 border-emerald-500/40 shadow-xl">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-2 text-emerald-400 font-black text-xs uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>Selos Oficiais de Verificação & Certificação</span>
              </div>
              <h4 className="text-lg font-bold text-white">
                Sua navegação e seus dados estão 100% protegidos
              </h4>
              <p className="text-xs text-purple-300/70">
                Certificados válidos, dados criptografados e conformidade legal com o Código de Defesa do Consumidor.
              </p>
            </div>

            {/* Badges / Selos visuais */}
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
              {/* Selo 1: SSL Let's Encrypt */}
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-emerald-950/60 border border-emerald-500/60 text-emerald-300">
                <Lock className="w-4 h-4 text-emerald-400" />
                <div className="text-left">
                  <p className="text-[10px] text-emerald-400/80 font-bold uppercase leading-none">Certificado</p>
                  <strong className="text-xs text-white">SSL 256-Bit Ativo</strong>
                </div>
              </div>

              {/* Selo 2: Mercado Pago */}
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#009ee3]/20 border border-[#009ee3]/60 text-cyan-200">
                <div className="w-5 h-5 rounded-md bg-[#009ee3] flex items-center justify-center text-[10px] font-black text-white">
                  MP
                </div>
                <div className="text-left">
                  <p className="text-[10px] text-cyan-400/80 font-bold uppercase leading-none">Pagamento</p>
                  <strong className="text-xs text-white">Mercado Pago Seguro</strong>
                </div>
              </div>

              {/* Selo 3: Google Safe */}
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-purple-950/60 border border-purple-700/60 text-purple-200">
                <ShieldCheck className="w-4 h-4 text-[#4ade80]" />
                <div className="text-left">
                  <p className="text-[10px] text-purple-400 font-bold uppercase leading-none">Navegação</p>
                  <strong className="text-xs text-white">Site Verificado & Limpo</strong>
                </div>
              </div>

              {/* Selo 4: CDC Garantia 7 Dias */}
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-pink-950/60 border border-pink-700/60 text-pink-200">
                <RefreshCw className="w-4 h-4 text-pink-400" />
                <div className="text-left">
                  <p className="text-[10px] text-pink-400 font-bold uppercase leading-none">Satisfação</p>
                  <strong className="text-xs text-white">7 Dias de Troca CDC</strong>
                </div>
              </div>

              {/* Botão para ver detalhes em modal */}
              <button
                onClick={onOpenGuaranteesModal}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/60 hover:scale-102 transition-all cursor-pointer"
              >
                <span>Conhecer Todas as Garantias</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
