import React from 'react';
import { ShieldCheck, Lock, CheckCircle2, Award, Zap, CreditCard } from 'lucide-react';

interface MercadoPagoSecurityBadgeProps {
  variant?: 'full' | 'compact' | 'strip' | 'card-footer' | 'checkout';
  className?: string;
  showCards?: boolean;
}

export const MercadoPagoSecurityBadge: React.FC<MercadoPagoSecurityBadgeProps> = ({
  variant = 'full',
  className = '',
  showCards = true,
}) => {
  // Bandeiras suportadas pelo Mercado Pago no Brasil
  const cardFlags = [
    { name: 'Visa', color: 'bg-[#1a1f71] text-white', label: 'VISA' },
    { name: 'Mastercard', color: 'bg-[#eb001b] text-white', label: 'MC' },
    { name: 'Elo', color: 'bg-[#00a4e4] text-white', label: 'ELO' },
    { name: 'Hipercard', color: 'bg-[#b3141a] text-white', label: 'HIPER' },
    { name: 'Amex', color: 'bg-[#006fcf] text-white', label: 'AMEX' },
    { name: 'Pix', color: 'bg-[#32bcad] text-white font-black', label: 'PIX ⚡' },
  ];

  if (variant === 'strip') {
    return (
      <div
        className={`flex flex-wrap items-center gap-2 py-1.5 px-3 rounded-xl bg-[#009ee3]/10 border border-[#009ee3]/40 text-cyan-200 text-xs ${className}`}
      >
        <div className="flex items-center gap-1.5 font-bold text-[#00a650] shrink-0">
          <ShieldCheck className="w-4 h-4 text-[#00a650]" />
          <span className="text-white">Mercado Pago</span>
        </div>
        <span className="text-purple-300/70 hidden sm:inline">•</span>
        <span className="text-[11px] text-purple-200">
          Crédito em até 12x ou Pix imediato com Compra Garantida
        </span>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div
        className={`p-3 rounded-xl bg-gradient-to-r from-[#009ee3]/15 via-[#180224] to-[#00a650]/15 border border-[#009ee3]/40 ${className}`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#009ee3] flex items-center justify-center text-white font-black text-xs shadow-xs">
              MP
            </div>
            <div>
              <span className="text-xs font-bold text-white flex items-center gap-1">
                <span>Pagamento Seguro</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-900/80 text-emerald-300 font-bold border border-emerald-500/40">
                  PROTEGIDO
                </span>
              </span>
              <p className="text-[10px] text-purple-300/80">Processado via tecnologia Mercado Pago</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Compra Garantida</span>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'checkout') {
    return (
      <div
        className={`p-3.5 rounded-2xl bg-gradient-to-br from-[#0c1d2e] via-[#16021f] to-[#072418] border border-[#009ee3]/50 shadow-md ${className}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#009ee3] to-[#00c5f0] flex items-center justify-center text-white font-black text-sm shadow-md shrink-0">
              <Lock className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-extrabold text-xs text-white">Mercado Pago Protegido</span>
                <span className="text-[9px] font-bold bg-[#00a650]/20 text-[#00ea77] border border-[#00a650]/50 px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  <span>Ambiente 100% Seguro</span>
                </span>
              </div>
              <p className="text-[10px] text-cyan-200/90 mt-0.5">
                Criptografia SSL 256-Bit • Antifraude Inteligente • Seus dados nunca são armazenados
              </p>
            </div>
          </div>
        </div>

        {showCards && (
          <div className="mt-3 pt-2.5 border-t border-purple-800/40 flex items-center justify-between flex-wrap gap-2 text-[10px]">
            <span className="text-purple-300 font-semibold flex items-center gap-1">
              <CreditCard className="w-3 h-3 text-cyan-300" />
              <span>Aceitamos:</span>
            </span>
            <div className="flex items-center gap-1 flex-wrap">
              {cardFlags.map((flag) => (
                <span
                  key={flag.name}
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs tracking-tight ${flag.color}`}
                  title={flag.name}
                >
                  {flag.label}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-2.5 flex items-center justify-between text-[10px] text-emerald-300/90 bg-emerald-950/40 px-2.5 py-1.5 rounded-lg border border-emerald-800/40">
          <span className="flex items-center gap-1">
            <Award className="w-3 h-3 text-emerald-400 shrink-0" />
            <span>Programa Compra Garantida: receba suas meias ou devolvemos seu dinheiro</span>
          </span>
          <span className="text-[9px] font-mono text-emerald-400 font-bold shrink-0">CDC Art. 49</span>
        </div>
      </div>
    );
  }

  // Variant 'full' (Banner para o rodapé e páginas institucionais)
  return (
    <div
      className={`rounded-2xl p-4 sm:p-5 bg-gradient-to-r from-[#071927] via-[#180122] to-[#041d14] border-2 border-[#009ee3]/50 shadow-xl relative overflow-hidden ${className}`}
    >
      {/* Detalhe luminoso no topo */}
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#009ee3]/20 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-[#00a650]/20 rounded-full blur-2xl pointer-events-none" />

      <div className="relative flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Lado Esquerdo: Logo e Selo Principal */}
        <div className="flex items-center gap-3.5 text-center sm:text-left">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#009ee3] to-[#00b4f0] p-1 flex items-center justify-center text-white shadow-lg shrink-0 border border-white/20">
            <div className="flex flex-col items-center justify-center leading-none">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
              <h4 className="text-sm font-black text-white tracking-wide">
                Pagamento Seguro Mercado Pago
              </h4>
              <span className="text-[10px] font-bold bg-[#00a650] text-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                Oficial
              </span>
            </div>
            <p className="text-xs text-purple-200/90 mt-0.5">
              Pague com <strong>Cartão de Crédito em até 12x</strong> ou <strong>Pix com aprovação instantânea</strong>.
            </p>
          </div>
        </div>

        {/* Lado Direito: Bandeiras e Selo de Compra Garantida */}
        <div className="flex flex-col items-center md:items-end gap-2 shrink-0">
          {showCards && (
            <div className="flex items-center gap-1.5 flex-wrap justify-center">
              {cardFlags.map((flag) => (
                <span
                  key={flag.name}
                  className={`text-[10px] font-bold px-2 py-1 rounded shadow-xs tracking-tight ${flag.color}`}
                >
                  {flag.label}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 text-[11px] text-emerald-300">
            <span className="flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>SSL 256-Bit</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#00ea77]" />
              <strong className="text-white">Compra Garantida</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
