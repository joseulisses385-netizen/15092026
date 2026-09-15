import React, { useState, useEffect } from 'react';
import { Package, X, Check, Plus, Minus } from 'lucide-react';
import { Product } from '../types';

interface QuickStockModalProps {
  isOpen: boolean;
  product: Product | null;
  isStaffAuthorized: boolean;
  onAuthorizeStaff: () => void;
  onClose: () => void;
  onSaveStock: (productId: string, newStock: number) => void;
}

export const QuickStockModal: React.FC<QuickStockModalProps> = ({
  isOpen,
  product,
  onClose,
  onSaveStock,
}) => {
  const [stock, setStock] = useState(0);

  useEffect(() => {
    if (product) {
      setStock(product.stockQuantity || 0);
    }
  }, [product, isOpen]);

  if (!isOpen || !product) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveStock(product.id, Math.max(0, stock));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
      <div className="w-full max-w-sm bg-[#25042e] rounded-3xl border border-purple-700/60 shadow-2xl overflow-hidden text-white">
        <div className="p-4 bg-gradient-to-r from-purple-900 to-amber-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-amber-300" />
            <h3 className="font-fun font-black text-sm text-white">Ajustar Estoque Rápido</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/20 transition-colors text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-5 space-y-4">
          <div className="flex items-center gap-3 bg-[#1c0223] p-3 rounded-2xl border border-purple-800/60">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-14 h-14 rounded-xl object-cover bg-black shrink-0"
            />
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-white truncate">{product.name}</h4>
              <p className="text-[11px] text-amber-300 font-semibold">
                Atual: {product.stockQuantity} unidades
              </p>
              {product.tamanhos && (
                <span className="text-[10px] text-purple-300 bg-purple-950 px-1.5 py-0.5 rounded">
                  Tam: {product.tamanhos}
                </span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-purple-200 mb-2 text-center">
              Nova Quantidade em Estoque
            </label>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setStock((prev) => Math.max(0, prev - 1))}
                className="w-10 h-10 rounded-xl bg-purple-900/80 hover:bg-purple-800 flex items-center justify-center text-white cursor-pointer transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>

              <input
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(parseInt(e.target.value, 10) || 0)}
                className="w-24 text-center py-2 text-xl font-black font-fun bg-[#1b0222] border border-purple-700/60 rounded-xl text-amber-300 focus:outline-none focus:border-amber-400"
              />

              <button
                type="button"
                onClick={() => setStock((prev) => prev + 1)}
                className="w-10 h-10 rounded-xl bg-purple-900/80 hover:bg-purple-800 flex items-center justify-center text-white cursor-pointer transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-pink-600 hover:opacity-95 text-white font-black text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Salvar Novo Estoque</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
