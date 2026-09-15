import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Ruler } from 'lucide-react';
import { Product, CartItem } from '../types';

interface ProductBuilderModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (item: CartItem) => void;
}

export const ProductBuilderModal: React.FC<ProductBuilderModalProps> = ({
  product,
  onClose,
  onAddToCart,
}) => {
  const models = product.availableModels || ['Camiseta Tradicional', 'Oversized'];
  const colors = product.availableColors || ['Preto', 'Branco', 'Cinza', 'Rosa', 'Verde', 'Azul', 'Bege'];
  const sizes = product.availableSizes || ['PP', 'P', 'M', 'G', 'GG', 'XG'];
  const prints = product.availablePrints || [];

  const [selectedModel, setSelectedModel] = useState<string>(models[0]);
  const [selectedColor, setSelectedColor] = useState<string>(colors[0]);
  const [selectedSize, setSelectedSize] = useState<string>(sizes[2] || sizes[0]);
  const [selectedPrint, setSelectedPrint] = useState(prints[0]);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = [product.imageUrl]; 
  // Add print images if needed, or specific mockups based on selection

  const finalPrice = product.price + (selectedPrint?.additionalPrice || 0);

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };
  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleAdd = () => {
    onAddToCart({
      product,
      quantity: 1,
      selectedModel,
      selectedColor,
      selectedSize,
      selectedPrint,
    });
    onClose();
  };

  const colorMap: Record<string, string> = {
    'Preto': '#1a1a1a',
    'Branco': '#ffffff',
    'Cinza': '#9ca3af',
    'Rosa': '#f472b6',
    'Verde': '#22c55e',
    'Azul': '#3b82f6',
    'Bege': '#d6d3d1'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#110116] w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-3xl border border-pink-500/30 flex flex-col md:flex-row relative shadow-2xl">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-pink-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: Images & Preview */}
        <div className="w-full md:w-1/2 bg-[#1a0221] p-6 flex flex-col justify-center items-center relative border-b md:border-b-0 md:border-r border-pink-500/20">
           {/* Replace this with dynamic mockup if needed */}
           <div className="relative w-full aspect-[4/5] max-w-md mx-auto bg-black/40 rounded-2xl overflow-hidden flex items-center justify-center">
             <img 
               src={selectedPrint?.imageUrl || product.imageUrl} 
               alt="Mockup" 
               className="w-full h-full object-cover opacity-90 transition-opacity duration-300"
             />
             <div className="absolute top-4 left-4 bg-[#ff007f] text-white text-xs font-black px-3 py-1 rounded-full uppercase">
               Você monta do seu jeito!
             </div>
           </div>
           
           <div className="mt-4 flex gap-2 overflow-x-auto w-full justify-center">
             {images.map((img, idx) => (
               <button 
                 key={idx}
                 onClick={() => setCurrentImageIndex(idx)}
                 className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${idx === currentImageIndex ? 'border-pink-500 scale-105' : 'border-transparent opacity-60'}`}
               >
                 <img src={img} alt="Thumb" className="w-full h-full object-cover" />
               </button>
             ))}
           </div>
           <div className="text-center mt-6">
             <h3 className="font-fun text-xl text-white">Sua estampa favorita</h3>
             <p className="text-pink-400 font-bold text-sm">EM QUALQUER COMBINAÇÃO! ♡</p>
           </div>
        </div>

        {/* Right Side: Builder Steps */}
        <div className="w-full md:w-1/2 p-6 md:p-8 lg:p-10 space-y-8 bg-[#fdfafb] text-slate-900 overflow-y-auto">
          <div>
            <h2 className="text-3xl font-black font-fun uppercase tracking-tighter text-slate-950">
              {product.name}
            </h2>
            <p className="text-slate-500 text-sm mt-1">{product.description}</p>
          </div>

          {/* STEP 1 */}
          <div className="space-y-3">
            <h3 className="flex items-center gap-2 font-black text-sm uppercase">
              <span className="bg-slate-900 text-white w-6 h-6 flex items-center justify-center rounded-full text-xs">1</span>
              Escolha o Modelo
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {models.map(m => (
                <button
                  key={m}
                  onClick={() => setSelectedModel(m)}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${selectedModel === m ? 'border-[#ff007f] bg-pink-50' : 'border-slate-200 bg-white hover:border-pink-300'}`}
                >
                  <span className="font-bold text-sm">{m}</span>
                </button>
              ))}
            </div>
          </div>

          {/* STEP 2 */}
          <div className="space-y-3">
            <h3 className="flex items-center gap-2 font-black text-sm uppercase">
              <span className="bg-slate-900 text-white w-6 h-6 flex items-center justify-center rounded-full text-xs">2</span>
              Escolha a Cor
            </h3>
            <div className="flex flex-wrap gap-3">
              {colors.map(c => (
                <button
                  key={c}
                  onClick={() => setSelectedColor(c)}
                  className="flex flex-col items-center gap-1 group"
                >
                  <div className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center ${selectedColor === c ? 'border-[#ff007f] scale-110 shadow-md' : 'border-slate-300 shadow-sm group-hover:scale-105'}`}
                       style={{ backgroundColor: colorMap[c] || '#ccc' }}>
                    {selectedColor === c && <div className={`w-3 h-3 rounded-full ${c === 'Branco' ? 'bg-[#ff007f]' : 'bg-white'}`} />}
                  </div>
                  <span className="text-[10px] font-bold text-slate-600">{c}</span>
                </button>
              ))}
            </div>
          </div>

          {/* STEP 3 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-black text-sm uppercase">
                <span className="bg-slate-900 text-white w-6 h-6 flex items-center justify-center rounded-full text-xs">3</span>
                Escolha o Tamanho
              </h3>
              <button className="text-xs font-bold flex items-center gap-1 text-slate-500 hover:text-pink-600 transition-colors">
                <Ruler className="w-3.5 h-3.5" /> Guia de tamanhos
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {sizes.map(s => (
                <button
                  key={s}
                  onClick={() => setSelectedSize(s)}
                  className={`w-12 h-10 flex items-center justify-center rounded-xl border-2 transition-all font-bold text-sm ${selectedSize === s ? 'border-[#ff007f] text-[#ff007f] bg-pink-50' : 'border-slate-200 bg-white text-slate-600 hover:border-pink-300'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* STEP 4 */}
          <div className="space-y-3">
            <h3 className="flex items-center gap-2 font-black text-sm uppercase">
              <span className="bg-slate-900 text-white w-6 h-6 flex items-center justify-center rounded-full text-xs">4</span>
              Escolha a Estampa
            </h3>
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
              {prints.map(p => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPrint(p)}
                  className={`relative aspect-square rounded-xl border-2 overflow-hidden transition-all ${selectedPrint?.id === p.id ? 'border-[#ff007f] scale-105 shadow-md' : 'border-slate-200 hover:border-pink-300'}`}
                  title={p.name}
                >
                  <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                  {p.additionalPrice > 0 && (
                    <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[9px] text-white font-bold text-center py-0.5">
                      +{p.additionalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Summary & Buy */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sua Escolha:</span>
                <div className="text-sm font-bold text-slate-800 flex items-center gap-2 flex-wrap">
                  <span>{selectedModel} • {selectedColor} • Tam {selectedSize}</span>
                  {selectedPrint && (
                    <span className="bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full text-xs">Estampa: {selectedPrint.name}</span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-[#ff007f]">
                  {finalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </div>
              </div>
            </div>

            <button
              onClick={handleAdd}
              className="w-full py-4 rounded-xl bg-[#ff007f] hover:bg-[#d6006b] text-white font-black uppercase tracking-wider shadow-[0_4px_14px_rgba(255,0,127,0.4)] hover:shadow-[0_6px_20px_rgba(255,0,127,0.6)] transition-all flex items-center justify-center gap-2"
            >
              🛒 Adicionar ao Carrinho
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
