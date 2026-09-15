import React from 'react';
import {
  Package,
  Edit3,
  Trash2,
  Check,
  ShoppingBag,
  ExternalLink,
  Camera,
  Star,
  Zap,
  ShieldCheck,
  Lock,
  Palette
} from 'lucide-react';
import { Product, StoreSettings } from '../types';

interface ProductCardProps {
  product: Product;
  settings: StoreSettings;
  onAddToCart: (product: Product) => void;
  isAddedToCart: boolean;
  isAdminUnlocked?: boolean;
  onEditProduct?: (product: Product) => void;
  onDeleteProduct?: (productId: string) => void;
  onOpenQuickStock?: (product: Product) => void;
  onUpdateProductImage?: (productId: string, newImageUrl: string) => void;
  onOpenBuilder?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  settings,
  onAddToCart,
  isAddedToCart,
  isAdminUnlocked,
  onEditProduct,
  onDeleteProduct,
  onOpenQuickStock,
  onUpdateProductImage,
  onOpenBuilder,
}) => {
  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(product.price);

  // Struck-through original price simulation (Marketplace standard)
  const originalPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Math.round(product.price * 1.35));

  const pixDiscountPct = settings.pixDiscountPercentage ?? 5;
  const pixPrice = product.price * (1 - pixDiscountPct / 100);
  const formattedPixPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(pixPrice);

  const installmentValue = (product.price / 2).toFixed(2).replace('.', ',');

  const tiktokUrl = product.tiktokShopUrl || settings.tiktokShopUrl;
  const whatsappMsg = encodeURIComponent(
    `Olá! Quero comprar a peça "${product.name}" (${formattedPixPrice} no Pix c/ 5% OFF) da Doidas e Meias. Tem disponível?`
  );

  return (
    <div
      id={`product-card-${product.id}`}
      className="group relative flex flex-col bg-[#22022d] rounded-3xl border-2 border-pink-500/30 hover:border-[#ff007f] shadow-xl hover:shadow-[0_0_30px_rgba(255,0,127,0.25)] transition-all duration-300 overflow-hidden text-white hover:-translate-y-1"
    >
      {/* Product Image & Badges */}
      <div className="relative aspect-square w-full overflow-hidden bg-[#1a0224]">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          referrerPolicy="no-referrer"
        />

        {/* Marketplace Discount Badge */}
        <div className="absolute top-3 left-3 z-10 flex flex-col items-start gap-1.5">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white shadow-md">
            <Zap className="w-3 h-3 fill-amber-300 text-amber-300" />
            <span>-25% OFF</span>
          </span>

          {/* Stock status indicator */}
          <div
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold shadow-md backdrop-blur-xs ${
              product.stockQuantity > 0
                ? product.stockQuantity <= 5
                  ? "bg-amber-500 text-slate-950 font-black"
                  : "bg-emerald-600/90 text-white"
                : "bg-rose-700 text-white"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span>
              {product.stockQuantity > 0
                ? product.stockQuantity <= 5
                  ? `Restam ${product.stockQuantity} un.`
                  : `${product.stockQuantity} em estoque`
                : "Esgotado"}
            </span>
          </div>

          {/* Ajustar Estoque - Apenas para Administrador logado */}
          {isAdminUnlocked && (
            <button
              type="button"
              onClick={() => onOpenQuickStock && onOpenQuickStock(product)}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-black/80 hover:bg-purple-900 text-amber-300 border border-amber-400/40 backdrop-blur-xs shadow-xs transition-all cursor-pointer hover:scale-102"
              title="Definir quanto temos em estoque (Acesso ADM)"
            >
              <Package className="w-3 h-3 text-amber-300" />
              <span>Ajustar Estoque</span>
            </button>
          )}
        </div>

        {/* Botão Trocar Imagem do Produto - Visível EXCLUSIVAMENTE com acesso de ADM */}
        {isAdminUnlocked && (
          <div className="absolute bottom-3 left-3 z-20">
            <input
              type="file"
              id={`change-prod-img-${product.id}`}
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (ev) => {
                  const dataUrl = ev.target?.result as string;
                  if (dataUrl && onUpdateProductImage) {
                    onUpdateProductImage(product.id, dataUrl);
                  }
                };
                reader.readAsDataURL(file);
              }}
            />
            <label
              htmlFor={`change-prod-img-${product.id}`}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-pink-600 hover:bg-pink-500 text-white text-[11px] font-black shadow-lg cursor-pointer transition-all hover:scale-105 border border-pink-300/40"
              title="Trocar imagem desta peça (Acesso de Administrador)"
            >
              <Camera className="w-3 h-3" />
              <span>Trocar Imagem</span>
            </label>
          </div>
        )}

        {/* Product Badges & Category */}
        <div className="absolute top-3 right-3 z-10 flex flex-col items-end gap-1">
          {product.badge ? (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/85 text-amber-300 border border-amber-400/40 shadow-xs backdrop-blur-xs">
              {product.badge}
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-900/80 text-purple-200 border border-purple-700/50 shadow-xs">
              Mais Vendido
            </span>
          )}
        </div>

        {/* Admin Quick Actions */}
        {isAdminUnlocked && (
          <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 bg-black/80 backdrop-blur-xs p-1 rounded-xl">
            <button
              onClick={() => onEditProduct && onEditProduct(product)}
              className="p-1.5 rounded-lg text-white hover:bg-pink-600 transition-colors cursor-pointer"
              title="Editar este produto"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDeleteProduct && onDeleteProduct(product.id)}
              className="p-1.5 rounded-lg text-white hover:bg-rose-600 transition-colors cursor-pointer"
              title="Excluir produto"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        {/* Marketplace Star Rating & Sold count */}
        <div className="flex items-center justify-between text-xs mb-1.5">
          <div className="flex items-center gap-1 text-amber-400">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="font-black text-amber-300 text-xs">4.9</span>
            <span className="text-[11px] text-purple-300/60 font-semibold">(140+ vendidos)</span>
          </div>
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-700/40 px-1.5 py-0.5 rounded">
            Frete Grátis*
          </span>
        </div>

        <h3 className="text-base sm:text-lg font-bold text-white line-clamp-1 group-hover:text-pink-300 transition-colors">
          {product.name}
        </h3>

        <div className="flex items-center gap-2 mt-1">
          {product.tamanhos && (
            <span className="inline-block text-[11px] font-bold text-amber-300 bg-purple-900/60 border border-purple-700/60 px-2 py-0.5 rounded-md">
              Tamanho: {product.tamanhos}
            </span>
          )}
          {product.fitType && !product.tamanhos && (
            <span className="inline-block text-[11px] font-semibold text-purple-200/80">
              {product.fitType}
            </span>
          )}
        </div>

        <p className="mt-2 text-xs text-purple-200/80 line-clamp-2 leading-relaxed flex-1">
          {product.description}
        </p>

        {/* Marketplace Price Block */}
        <div className="mt-4 pt-3 border-t border-purple-800/40">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-xs text-purple-400/70 line-through">
              {originalPrice}
            </span>
            <span className="text-xl sm:text-2xl font-black text-[#facc15] font-fun">
              {formattedPixPrice}
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 uppercase">
              {pixDiscountPct}% OFF no Pix
            </span>
          </div>
          <p className="text-[11px] text-purple-300/70 mt-0.5">
            ou {formattedPrice} em até 2x de R$ {installmentValue} sem juros
          </p>
        </div>

        {/* Omnichannel Quick Action Buttons */}
        <div className="mt-3.5 space-y-2">
          {/* Primary Action: Add to Cart / Buy Now on Site */}
          {product.isCustomizable ? (
            <button
              onClick={() => onOpenBuilder && onOpenBuilder(product)}
              disabled={product.stockQuantity <= 0}
              className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-black transition-all cursor-pointer bg-[#ff007f] hover:bg-[#d6006b] text-white shadow-lg shadow-pink-900/40 hover:scale-102`}
            >
              <Palette className="w-4 h-4 text-[#ffe600]" />
              <span>MONTAR O SEU</span>
            </button>
          ) : (
            <button
              onClick={() => onAddToCart(product)}
              disabled={product.stockQuantity <= 0}
              className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-black transition-all cursor-pointer ${
                isAddedToCart
                  ? "bg-[#22c55e] text-white shadow-lg shadow-green-950/40 scale-102"
                  : product.stockQuantity <= 0
                  ? "bg-purple-950/50 text-purple-400 cursor-not-allowed border border-purple-800/40"
                  : "bg-gradient-to-r from-[#ff007f] via-[#ec4899] to-[#8b5cf6] hover:from-[#ff1493] hover:to-[#7c3aed] text-white shadow-lg shadow-pink-600/30 hover:scale-102 hover:shadow-[0_0_20px_rgba(255,0,127,0.4)]"
              }`}
              title="Adicionar à sacola de pedidos"
            >
              {isAddedToCart ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Adicionado à Sacola</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4 text-[#ffe600]" />
                  <span>Comprar pelo Site</span>
                </>
              )}
            </button>
          )}

          {/* Secondary Omnichannel Buttons (WhatsApp & TikTok Shop) */}
          <div className="grid grid-cols-2 gap-2">
            <a
              href={`https://wa.me/${settings.whatsappNumber}?text=${whatsappMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-[#22c55e]/20 hover:bg-[#22c55e]/30 text-[#4ade80] border border-[#22c55e]/40 text-xs font-bold transition-all hover:scale-102"
              title="Comprar direto com a equipe no WhatsApp"
            >
              <span>💬</span>
              <span className="truncate">WhatsApp</span>
            </a>

            {tiktokUrl ? (
              <a
                href={tiktokUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-black hover:bg-zinc-900 border border-pink-500/40 text-white text-xs font-bold transition-all hover:scale-102"
                title="Comprar no TikTok Shop"
              >
                <span>🎵</span>
                <span className="truncate">TikTok</span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
            ) : (
              <a
                href={settings.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-purple-900/40 hover:bg-purple-900/60 border border-purple-600/40 text-white text-xs font-bold transition-all hover:scale-102"
                title="Ver look no Instagram"
              >
                <span>📸</span>
                <span className="truncate">Instagram</span>
              </a>
            )}
          </div>

          {/* Micro-garantia de compra e segurança */}
          <div className="pt-2.5 flex items-center justify-center gap-1.5 text-[10px] text-purple-300/80 border-t border-purple-800/30">
            <span className="flex items-center gap-1 font-bold text-emerald-400">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Compra 100% Segura</span>
            </span>
            <span>•</span>
            <span className="text-purple-300/80">7 Dias de Troca</span>
            <span>•</span>
            <span className="text-amber-300 font-bold">Rastreio</span>
          </div>
        </div>
      </div>
    </div>
  );
};
