import React from 'react';
import {
  ShoppingBag,
  User,
  Package,
  Shield,
  ShieldCheck,
  Lock,
  LogOut,
  Instagram,
  Search,
} from 'lucide-react';
import { StoreSettings, Customer, StaffUser } from '../types';
import { OFFICIAL_BRAND_LOGO, OFFICIAL_FALLBACK_LOGO } from '../constants/assets';

interface HeaderProps {
  settings: StoreSettings;
  cartCount: number;
  onOpenCart: () => void;
  currentUser?: Customer | null;
  onOpenCustomerAuth: () => void;
  currentStaffUser?: StaffUser | null;
  onNavigateToStock?: () => void;
  onNavigateToAdmin?: () => void;
  onLogoutStaff?: () => void;
  onOpenGuaranteesModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  cartCount,
  onOpenCart,
  currentUser,
  onOpenCustomerAuth,
  currentStaffUser,
  onNavigateToStock,
  onNavigateToAdmin,
  onLogoutStaff,
  onOpenGuaranteesModal,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#190224]/95 backdrop-blur-md border-b border-pink-500/25 shadow-lg">
      {/* Marketplace Top Announcement Bar com Selo de Site Seguro */}
      <div className="bg-gradient-to-r from-[#ff007f] via-[#a855f7] to-[#00f2fe] py-1.5 px-4 text-center text-[11px] sm:text-xs font-black text-white tracking-wide shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 overflow-x-auto whitespace-nowrap scrollbar-none">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenGuaranteesModal}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 border border-emerald-400/50 font-black text-[10px] sm:text-[11px] transition-all cursor-pointer shadow-xs"
              title="Clique para ver nossas garantias oficiais e certificados"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>🔒 Site 100% Seguro (SSL)</span>
            </button>
            <span className="hidden sm:inline">⚡ Frete Grátis acima de R$ 99</span>
          </div>

          <span className="mx-auto flex items-center gap-2">
            <span>🎵 TikTok Shop Oficial</span>
            <span>•</span>
            <span>💬 WhatsApp Direto</span>
            <span>•</span>
            <span>📸 Instagram</span>
            <span>•</span>
            <span>⚡ 5% de Desconto no PIX</span>
          </span>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline">📦 Envio Rápido p/ Todo Brasil</span>
            <button
              type="button"
              onClick={onOpenGuaranteesModal}
              className="hidden lg:inline-flex items-center gap-1 text-[11px] text-yellow-200 hover:text-white underline cursor-pointer"
            >
              Garantias de Compra
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3">
          {/* Logo Oficial Sem Caixa ou Diferença de Cor */}
          <a href="#" className="flex items-center gap-2.5 group shrink-0">
            <div className="h-12 sm:h-14 flex items-center justify-center">
              <img
                src={settings.heroMascotUrl || OFFICIAL_BRAND_LOGO}
                alt={settings.storeName}
                className="h-full w-auto max-w-[90px] sm:max-w-[120px] object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-[0_4px_12px_rgba(255,0,127,0.35)] filter"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  if (e.currentTarget.dataset.fallback) return;
                  e.currentTarget.dataset.fallback = "true";
                  e.currentTarget.src = OFFICIAL_FALLBACK_LOGO;
                }}
              />
            </div>
            <div className="font-fun text-xl sm:text-2xl font-black tracking-tight leading-none flex items-center drop-shadow-[0_2px_10px_rgba(255,0,127,0.3)]">
              <span className="text-[#ff007f] font-black">Doidas </span>
              <span className="text-[#ffe600] font-black mx-1">e </span>
              <span className="text-[#00f2fe] font-black">Meias</span>
              <span className="ml-1 text-sm animate-bounce">🧦</span>
            </div>
          </a>

          {/* Marketplace Fast Omnichannel Links (Desktop) */}
          <div className="hidden lg:flex items-center gap-2">
            {settings.tiktokShopUrl && (
              <a
                href={settings.tiktokShopUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black hover:bg-zinc-900 text-white text-xs font-bold border border-pink-500/40 transition-all hover:scale-105 shadow-xs"
                title="Comprar no TikTok Shop"
              >
                <span>🎵</span>
                <span>TikTok Shop</span>
              </a>
            )}
            {settings.instagramUrl && (
              <a
                href={settings.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-700 to-pink-600 hover:opacity-90 text-white text-xs font-bold transition-all hover:scale-105 shadow-xs"
                title="Seguir e comprar pelo Instagram"
              >
                <Instagram className="w-3.5 h-3.5" />
                <span>Instagram</span>
              </a>
            )}
            <a
              href={`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(
                settings.heroWhatsAppDefaultMessage || "Olá! Vim pelo site da Doidas e Meias!"
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#22c55e] hover:bg-[#16a34a] text-white text-xs font-bold transition-all hover:scale-105 shadow-xs"
              title="Atendimento no WhatsApp"
            >
              <span>💬</span>
              <span>WhatsApp</span>
            </a>
          </div>

          {/* Right Actions: Staff Shortcuts, Customer Account & Cart */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Staff shortcut bar when logged in */}
            {currentStaffUser && (
              <div className="hidden md:flex items-center gap-1.5 p-1 rounded-full bg-[#1c0226] border border-amber-500/40 shadow-inner">
                <span className="text-[11px] font-bold text-amber-300 pl-2.5 pr-1 truncate max-w-[100px]">
                  {((currentStaffUser.name || "")).split(' ')[0]}
                </span>
                {onNavigateToStock && (
                  <button
                    type="button"
                    onClick={onNavigateToStock}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-900/70 hover:bg-blue-800 text-blue-200 text-xs font-bold transition-colors cursor-pointer"
                    title="Acessar página dedicada do Estoque"
                  >
                    <Package className="w-3 h-3 text-blue-400" />
                    <span>Estoque</span>
                  </button>
                )}
                {currentStaffUser.role === 'admin' && onNavigateToAdmin && (
                  <button
                    type="button"
                    onClick={onNavigateToAdmin}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-pink-900/70 hover:bg-pink-800 text-pink-200 text-xs font-bold transition-colors cursor-pointer"
                    title="Acessar página dedicada de Administração"
                  >
                    <Shield className="w-3 h-3 text-pink-400" />
                    <span>ADM</span>
                  </button>
                )}
                {onLogoutStaff && (
                  <button
                    type="button"
                    onClick={onLogoutStaff}
                    className="p-1 rounded-full hover:bg-rose-900/80 text-rose-300 transition-colors cursor-pointer"
                    title="Encerrar sessão da equipe"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            {/* Quick Catalog link */}
            <a
              href="#produtos"
              className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-[#380749] hover:bg-[#4d0b64] text-purple-200 hover:text-white transition-all border border-purple-700/50"
            >
              <Search className="w-3.5 h-3.5 text-amber-300" />
              <span>Catálogo</span>
            </a>

            {/* Customer Account Button */}
            <button
              id="header-user-btn"
              onClick={onOpenCustomerAuth}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-all border shadow-xs cursor-pointer ${
                currentUser
                  ? "bg-purple-900/70 text-purple-200 border-purple-500/50 hover:bg-purple-800"
                  : "bg-[#330542] text-purple-100 border-purple-700/60 hover:bg-[#48085d] hover:text-white"
              }`}
              title={currentUser ? `Conta: ${currentUser.name}` : "Entrar ou criar conta"}
            >
              <User className="w-3.5 h-3.5 text-purple-300" />
              <span>{currentUser ? (currentUser.name || '').split(" ")[0] : "Minha Conta"}</span>
            </button>

            {/* Cart Button */}
            <button
              id="header-cart-btn"
              onClick={onOpenCart}
              className="relative flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-gradient-to-r from-pink-600 to-purple-700 hover:opacity-95 text-white transition-all shadow-md hover:scale-105 cursor-pointer"
              title="Ver sacola de compras"
              aria-label="Sacola de compras"
            >
              <ShoppingBag className="w-4 h-4 text-amber-300" />
              <span>Sacola</span>
              {cartCount > 0 && (
                <span className="w-5 h-5 bg-[#22c55e] text-white text-[11px] font-black rounded-full flex items-center justify-center ml-0.5 shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
