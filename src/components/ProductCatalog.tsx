import React, { useState, useMemo } from 'react';
import { Search, Plus, Filter, Package } from 'lucide-react';
import { Product, StoreSettings } from '../types';
import { ProductCard } from './ProductCard';
import { CATEGORIES } from '../data/initialData';

interface ProductCatalogProps {
  products: Product[];
  settings: StoreSettings;
  currentCategory: string;
  onCategoryChange: (category: string) => void;
  onAddToCart: (product: Product) => void;
  cartProductIds: Set<string>;
  isAdminUnlocked?: boolean;
  onOpenAddProduct?: () => void;
  onEditProduct?: (product: Product) => void;
  onDeleteProduct?: (productId: string) => void;
  onOpenQuickStock?: (product: Product) => void;
  onUpdateProductImage?: (productId: string, newImageUrl: string) => void;
  onOpenBuilder?: (product: Product) => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  products,
  settings,
  currentCategory,
  onCategoryChange,
  onAddToCart,
  cartProductIds,
  isAdminUnlocked,
  onOpenAddProduct,
  onEditProduct,
  onDeleteProduct,
  onOpenQuickStock,
  onUpdateProductImage,
  onOpenBuilder,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'popular' | 'price_asc' | 'price_desc'>('popular');

  const filteredProducts = useMemo(() => {
    const list = products.filter((item) => {
      const matchesCategory =
        currentCategory === 'all' ||
        currentCategory === 'todas' ||
        item.category === currentCategory;

      const matchesSearch =
        String(item.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(item.description || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.badge && String(item.badge).toLowerCase().includes(searchTerm.toLowerCase()));

      return matchesCategory && matchesSearch;
    });

    if (sortBy === 'price_asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      list.sort((a, b) => b.price - a.price);
    } else {
      list.sort((a, b) => (b.stockQuantity || 0) - (a.stockQuantity || 0));
    }

    return list;
  }, [products, currentCategory, searchTerm, sortBy]);

  return (
    <section id="produtos" className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/60 border border-purple-700/60 text-amber-300 text-xs font-bold mb-2">
            <Package className="w-3.5 h-3.5" />
            <span>{settings.catalogBadgeText || "Catálogo Oficial de Marketplace"}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black font-fun tracking-tight text-white">
            {settings.catalogTitle || "Nossas Peças em Estoque"}
          </h2>
          <p className="text-sm sm:text-base text-purple-200/80 mt-1">
            {settings.catalogSubtitle || "Escolha suas meias e camisetas favoritas para entrega rápida ou compra via TikTok Shop, WhatsApp e Instagram"}
          </p>
        </div>

        {/* Search input, Sorting & Admin Add Button */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={settings.catalogSearchPlaceholder || "Buscar no catálogo..."}
              className="w-full pl-9 pr-8 py-2.5 rounded-2xl bg-[#200329] border border-purple-600/40 text-xs sm:text-sm text-white placeholder-purple-400/60 focus:outline-none focus:border-pink-500 shadow-inner"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-purple-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Marketplace Sort Select */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="py-2.5 px-3 rounded-2xl bg-[#200329] border border-purple-600/40 text-xs text-purple-200 focus:outline-none focus:border-pink-500 font-semibold cursor-pointer"
          >
            <option value="popular">🔥 Mais Populares</option>
            <option value="price_asc">💰 Menor Preço</option>
            <option value="price_desc">💎 Maior Preço</option>
          </select>

          {isAdminUnlocked && (
            <button
              onClick={onOpenAddProduct}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-md transition-all cursor-pointer shrink-0"
              title="Cadastrar novo produto"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Peça</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Pills & Count */}
      <div className="flex items-center justify-between gap-4 pb-2 mb-6">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
          <Filter className="w-4 h-4 text-purple-400 shrink-0 ml-1 mr-1" />
          {CATEGORIES.map((cat) => {
            const isActive =
              currentCategory === cat.id ||
              (cat.id === 'all' && currentCategory === 'todas');
            return (
              <button
                key={cat.id}
                onClick={() => onCategoryChange(cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer shadow-md ${
                  isActive
                    ? 'bg-gradient-to-r from-[#ff007f] to-[#ffe600] text-slate-950 font-black shadow-[0_0_15px_rgba(255,0,127,0.5)] scale-105'
                    : 'bg-[#22032d] text-purple-200 border border-pink-500/30 hover:border-[#00f2fe]/60 hover:text-white hover:bg-[#340544]'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        <span className="hidden sm:inline-block text-xs text-purple-300/70 shrink-0 font-medium">
          {filteredProducts.length} peças encontradas
        </span>
      </div>

      {/* Products Grid / Carousel */}
      {filteredProducts.length > 0 ? (
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 sm:gap-8 pb-8 pt-4 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
          {filteredProducts.map((product) => (
            <div key={product.id} className="snap-center shrink-0 w-[85vw] sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.5rem)]">
              <ProductCard
                product={product}
                settings={settings}
                onAddToCart={onAddToCart}
                isAddedToCart={cartProductIds.has(product.id)}
                isAdminUnlocked={isAdminUnlocked}
                onEditProduct={onEditProduct}
                onDeleteProduct={onDeleteProduct}
                onOpenQuickStock={onOpenQuickStock}
                onUpdateProductImage={onUpdateProductImage}
                onOpenBuilder={onOpenBuilder}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 bg-[#2b0537] rounded-3xl border border-purple-700/40">
          <div className="text-4xl mb-3">🔍</div>
          <h3 className="text-lg font-bold text-white font-fun">Nenhum produto encontrado</h3>
          <p className="text-sm text-purple-200/70 mt-1 max-w-md mx-auto">
            Tente buscar com outros termos ou selecione a categoria "Todas as Peças".
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              onCategoryChange('all');
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-600 text-white text-xs font-bold transition-colors"
          >
            Limpar Filtros
          </button>
        </div>
      )}
    </section>
  );
};
