import React from 'react';
import {
  Lock,
  LogOut,
  User,
  Sparkles,
  Package,
  Shield,
  ShieldCheck,
  CheckCircle,
  ExternalLink,
  Phone,
  Mail,
  Building2,
  MapPin,
  Clock,
  CreditCard,
} from 'lucide-react';
import { StoreSettings, StaffUser } from '../types';
import { OFFICIAL_BRAND_LOGO, OFFICIAL_FALLBACK_LOGO } from '../constants/assets';
import { MercadoPagoSecurityBadge } from './MercadoPagoSecurityBadge';

interface FooterProps {
  settings: StoreSettings;
  onOpenDirectorAuth: () => void;
  isDirectorLoggedIn: boolean;
  onLogoutDirector: () => void;
  onOpenCustomerAuth: () => void;
  currentStaffUser?: StaffUser | null;
  onNavigateToStock?: () => void;
  onNavigateToAdmin?: () => void;
  onLogoutStaff?: () => void;
  onOpenGuaranteesModal?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  settings,
  onOpenDirectorAuth,
  isDirectorLoggedIn,
  onLogoutDirector,
  onOpenCustomerAuth,
  currentStaffUser,
  onNavigateToStock,
  onNavigateToAdmin,
  onLogoutStaff,
  onOpenGuaranteesModal,
}) => {
  return (
    <footer id="footer-institucional" className="bg-[#1c0226] text-purple-200/80 border-t border-purple-900/40">
      {/* BANNER DE COMPRA SEGURA & SELOS DE CONFIANÇA */}
      <div className="bg-[#15011d] border-b border-purple-900/50 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center sm:text-left">
            {/* Selo 1: SSL */}
            <div className="flex flex-col sm:flex-row items-center gap-3 p-3 rounded-2xl bg-purple-950/40 border border-purple-800/40">
              <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/60 flex items-center justify-center text-emerald-400 shrink-0 shadow-xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h5 className="text-xs font-black text-white flex items-center justify-center sm:justify-start gap-1">
                  <span>SSL 256-Bit</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-900 text-emerald-300 font-mono">
                    ATIVO
                  </span>
                </h5>
                <p className="text-[11px] text-purple-300/70 leading-tight">
                  Ambiente criptografado e 100% seguro
                </p>
              </div>
            </div>

            {/* Selo 2: Compra Segura Mercado Pago */}
            <div className="flex flex-col sm:flex-row items-center gap-3 p-3 rounded-2xl bg-[#009ee3]/10 border border-[#009ee3]/40">
              <div className="w-10 h-10 rounded-xl bg-[#009ee3]/20 border border-[#009ee3]/60 flex items-center justify-center text-[#00c5f0] shrink-0 shadow-xs">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h5 className="text-xs font-black text-white flex items-center justify-center sm:justify-start gap-1">
                  <span>Mercado Pago</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#00a650]/30 text-[#00ea77] font-bold border border-[#00a650]/40">
                    PROTEGIDO
                  </span>
                </h5>
                <p className="text-[11px] text-cyan-200/80 leading-tight">
                  {settings.cardGatewayName || 'Cartão em até 12x & Pix Oficial'}
                </p>
              </div>
            </div>

            {/* Selo 3: CNPJ Verificado */}
            <div className="flex flex-col sm:flex-row items-center gap-3 p-3 rounded-2xl bg-purple-950/40 border border-purple-800/40">
              <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-500/60 flex items-center justify-center text-amber-400 shrink-0 shadow-xs">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h5 className="text-xs font-black text-white">Empresa Registrada</h5>
                <p className="text-[11px] text-amber-300 font-mono font-bold truncate">
                  {settings.cnpj ? `CNPJ: ${settings.cnpj}` : 'CNPJ Ativo & Regular'}
                </p>
              </div>
            </div>

            {/* Selo 4: Garantia CDC */}
            <div className="flex flex-col sm:flex-row items-center gap-3 p-3 rounded-2xl bg-purple-950/40 border border-purple-800/40">
              <div className="w-10 h-10 rounded-xl bg-pink-950/80 border border-pink-500/60 flex items-center justify-center text-pink-400 shrink-0 shadow-xs">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <h5 className="text-xs font-black text-white">7 Dias de Garantia</h5>
                <p className="text-[11px] text-purple-300/70 leading-tight">
                  Troca ou devolução garantida pelo CDC
                </p>
              </div>
            </div>
          </div>

          {/* Banner Oficial Mercado Pago com Selo de Pagamento Seguro */}
          <div className="mt-5 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex-1 w-full">
              <MercadoPagoSecurityBadge variant="full" />
            </div>
            {onOpenGuaranteesModal && (
              <button
                type="button"
                onClick={onOpenGuaranteesModal}
                className="w-full md:w-auto px-4 py-3 rounded-2xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-200 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shrink-0"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Site 100% Seguro & Todas as Garantias de Proteção</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Info & Dados Empresariais */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-12 h-12 shrink-0 flex items-center justify-center">
                <img
                  src={settings.heroMascotUrl || OFFICIAL_BRAND_LOGO}
                  alt={settings.storeName}
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                  if (e.currentTarget.dataset.fallback) return;
                  e.currentTarget.dataset.fallback = "true";
                    e.currentTarget.src = OFFICIAL_FALLBACK_LOGO;
                  }}
                />
              </div>
              <div className="font-fun text-xl font-black tracking-tight leading-none flex items-center">
                <span className="text-[#ff007f]">Doidas </span>
                <span className="text-[#ffe600] mx-1">e </span>
                <span className="text-[#00f2fe]">Meias</span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-purple-300/70 max-w-md leading-relaxed">
              {settings.footerAboutText ||
                "As meias mais divertidas, coloridas e confortáveis do Brasil. Modelos cano alto, cano médio e sapatilha para expressar o seu estilo único em qualquer ocasião."}
            </p>

            {/* DADOS CADASTRAIS DA EMPRESA (CONFORMIDADE LEI DO E-COMMERCE DECRETO 7.962/2013) */}
            <div className="p-4 rounded-2xl bg-[#14011b] border border-purple-800/60 space-y-2 text-xs text-purple-300/80">
              <div className="flex items-center gap-2 text-amber-300 font-bold">
                <Building2 className="w-4 h-4" />
                <span>Dados Oficiais da Empresa:</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-[11px]">
                {settings.companyLegalName && (
                  <div>
                    <span className="text-purple-400">Razão Social:</span>{' '}
                    <strong className="text-white">{settings.companyLegalName}</strong>
                  </div>
                )}
                {settings.cnpj && (
                  <div>
                    <span className="text-purple-400">CNPJ:</span>{' '}
                    <strong className="text-amber-300 font-mono">{settings.cnpj}</strong>
                    {settings.cnpjLookupUrl && (
                      <a
                        href={settings.cnpjLookupUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-0.5 ml-1.5 text-pink-400 hover:text-pink-300 underline"
                        title="Consultar situação cadastral na Receita Federal"
                      >
                        <span>consultar</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                )}
                {settings.companyAddress && (
                  <div className="sm:col-span-2 flex items-start gap-1">
                    <MapPin className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                    <span>{settings.companyAddress}</span>
                  </div>
                )}
                <div>
                  <span className="text-purple-400">WhatsApp / Vendas:</span>{' '}
                  <span className="text-white font-mono">{settings.whatsappDisplay}</span>
                </div>
                {settings.supportPhone && (
                  <div>
                    <span className="text-purple-400">SAC / Fixo:</span>{' '}
                    <span className="text-white font-mono">{settings.supportPhone}</span>
                  </div>
                )}
                {settings.contactEmail && (
                  <div className="sm:col-span-2 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>E-mail: <strong className="text-white">{settings.contactEmail}</strong></span>
                  </div>
                )}
                {settings.supportHours && (
                  <div className="sm:col-span-2 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>Atendimento: {settings.supportHours}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-amber-300 font-fun mb-3">
              Navegação
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#produtos" className="hover:text-pink-300 transition-colors">
                  Catálogo de Meias
                </a>
              </li>
              <li>
                <a href="#redes-sociais" className="hover:text-pink-300 transition-colors">
                  Redes & TikTok Shop
                </a>
              </li>
              <li>
                <button
                  onClick={onOpenCustomerAuth}
                  className="hover:text-pink-300 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Minha Conta / Meus Pedidos</span>
                </button>
              </li>
              {onOpenGuaranteesModal && (
                <li>
                  <button
                    onClick={onOpenGuaranteesModal}
                    className="hover:text-emerald-300 text-emerald-400/90 transition-colors cursor-pointer flex items-center gap-1.5 font-bold"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Garantias & Segurança da Loja</span>
                  </button>
                </li>
              )}
            </ul>

            <div className="mt-6 pt-4 border-t border-purple-900/60 text-[11px] space-y-1.5">
              <span className="text-purple-400 font-bold block flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-[#00c5f0]" />
                <span>Formas de Pagamento & Segurança:</span>
              </span>
              <p className="text-purple-300/80 leading-relaxed">
                • <strong>Mercado Pago</strong>: Cartão em até {settings.mercadoPagoMaxInstallments || 12}x (Visa, Master, Elo, Hiper, Amex)<br />
                • <strong>PIX Oficial</strong> com {settings.pixDiscountPercentage ?? 5}% de desconto e aprovação imediata<br />
                • <strong>Compra Garantida</strong>: seu dinheiro 100% protegido
              </p>
            </div>
          </div>

          {/* Management / Staff & Admin access */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-amber-300 font-fun mb-3">
              Área da Equipe & ADM
            </h4>
            <div className="space-y-2.5">
              <p className="text-[11px] text-purple-300/60">
                Páginas separadas e protegidas para controle de estoque e administração geral.
              </p>
              {currentStaffUser ? (
                <div className="flex flex-col gap-2">
                  <div className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-800/60 text-xs">
                    <span className="text-purple-300/70 block text-[10px]">Conectado como:</span>
                    <strong className="text-amber-300 block">{currentStaffUser.name}</strong>
                    <span className="text-purple-400 text-[10px]">
                      {currentStaffUser.role === 'admin' ? 'Administrador Geral' : 'Colaborador de Estoque'}
                    </span>
                  </div>

                  {onNavigateToStock && (
                    <button
                      type="button"
                      onClick={onNavigateToStock}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-blue-900/80 hover:bg-blue-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      <Package className="w-3.5 h-3.5 text-blue-400" />
                      <span>Ir para Página de Estoque</span>
                    </button>
                  )}

                  {currentStaffUser.role === 'admin' && onNavigateToAdmin && (
                    <button
                      type="button"
                      onClick={onNavigateToAdmin}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-pink-900/80 hover:bg-pink-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      <Shield className="w-3.5 h-3.5 text-pink-400" />
                      <span>Ir para Administração</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={onLogoutStaff || onLogoutDirector}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 text-[11px] font-semibold transition-all cursor-pointer"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>Encerrar Sessão</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {onNavigateToStock && (
                    <button
                      type="button"
                      onClick={onNavigateToStock}
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-950/80 hover:bg-blue-900 border border-blue-800/60 text-blue-200 text-xs font-semibold transition-all shadow-xs cursor-pointer"
                    >
                      <Package className="w-3.5 h-3.5 text-blue-400" />
                      <span>Sistema de Estoque (Login)</span>
                    </button>
                  )}

                  {onNavigateToAdmin && (
                    <button
                      type="button"
                      onClick={onNavigateToAdmin}
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-950 hover:bg-purple-900 border border-purple-700/60 text-purple-200 text-xs font-semibold transition-all shadow-xs cursor-pointer"
                    >
                      <Lock className="w-3.5 h-3.5 text-amber-300" />
                      <span>Painel de Administração (Login)</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-purple-900/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-purple-300/60">
          <p>
            © {new Date().getFullYear()} {settings.companyTradeName || settings.storeName}.{' '}
            {settings.footerCopyrightText || 'Todos os direitos reservados.'}
            {settings.cnpj && <span className="ml-1.5 text-purple-400">• CNPJ: {settings.cnpj}</span>}
          </p>
          <div className="flex items-center gap-1.5 text-purple-300/80">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{settings.tagline || 'As meias mais divertidas do Brasil'}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
