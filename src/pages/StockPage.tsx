import React, { useState, useMemo } from 'react';
import {
  Package,
  ArrowLeft,
  LogOut,
  Settings,
  Search,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  Building2,
  DollarSign,
  Plus,
  Minus,
  Download,
  Edit2,
  Save,
  X,
  ExternalLink,
} from 'lucide-react';
import { Product, StoreSettings, Supplier, Manufacturer, StaffUser } from '../types';
import { SuppliersStockDatabase } from '../components/SuppliersStockDatabase';
import { OFFICIAL_BRAND_LOGO } from '../constants/assets';

interface StockPageProps {
  currentUser: StaffUser;
  products: Product[];
  settings: StoreSettings;
  suppliers: Supplier[];
  manufacturers: Manufacturer[];
  onSaveProducts: (products: Product[]) => void;
  onSaveSupplier: (supplier: Supplier) => void;
  onDeleteSupplier: (id: string) => void;
  onSaveManufacturer: (manufacturer: Manufacturer) => void;
  onDeleteManufacturer: (id: string) => void;
  onUpdateProductStockDetails: (productId: string, details: Partial<Product>) => void;
  onNavigateToAdmin?: () => void;
  onNavigateToStore: () => void;
  onLogout: () => void;
}

export const StockPage: React.FC<StockPageProps> = ({
  currentUser,
  products,
  settings,
  suppliers,
  manufacturers,
  onSaveProducts,
  onSaveSupplier,
  onDeleteSupplier,
  onSaveManufacturer,
  onDeleteManufacturer,
  onUpdateProductStockDetails,
  onNavigateToAdmin,
  onNavigateToStore,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'suppliers'>('inventory');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [onlyLowStock, setOnlyLowStock] = useState(false);

  // Edit stock details modal state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Product>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // KPI Calculations
  const stats = useMemo(() => {
    let totalItems = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let totalStockValue = 0;

    products.forEach((p) => {
      const qty = p.stockQuantity || 0;
      totalItems += qty;
      const minStock = p.estoqueMinimo ?? 3;
      if (qty === 0) {
        outOfStockCount++;
      } else if (qty <= minStock) {
        lowStockCount++;
      }
      const cost = p.custoUnitario || p.price * 0.45;
      totalStockValue += cost * qty;
    });

    return {
      totalItems,
      totalSkus: products.length,
      lowStockCount,
      outOfStockCount,
      totalStockValue,
    };
  }, [products]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        (p.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.localizacaoEstoque && p.localizacaoEstoque.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCat = filterCategory === 'all' || p.category === filterCategory;

      const minStock = p.estoqueMinimo ?? 3;
      const matchesLowStock = !onlyLowStock || p.stockQuantity <= minStock;

      return matchesSearch && matchesCat && matchesLowStock;
    });
  }, [products, searchTerm, filterCategory, onlyLowStock]);

  const handleAdjustQuantity = (productId: string, delta: number) => {
    const updated = products.map((p) => {
      if (p.id === productId) {
        const newQty = Math.max(0, (p.stockQuantity || 0) + delta);
        return {
          ...p,
          stockQuantity: newQty,
          inStock: newQty > 0,
        };
      }
      return p;
    });
    onSaveProducts(updated);
    showToast('Quantidade em estoque atualizada com sucesso!');
  };

  const handleSetExactQuantity = (productId: string, valueStr: string) => {
    const val = parseInt(valueStr, 10);
    if (isNaN(val) || val < 0) return;

    const updated = products.map((p) => {
      if (p.id === productId) {
        return {
          ...p,
          stockQuantity: val,
          inStock: val > 0,
        };
      }
      return p;
    });
    onSaveProducts(updated);
    showToast('Quantidade atualizada!');
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setEditFormData({
      sku: p.sku || '',
      localizacaoEstoque: p.localizacaoEstoque || '',
      estoqueMinimo: p.estoqueMinimo ?? 3,
      custoUnitario: p.custoUnitario ?? 0,
      supplierId: p.supplierId || '',
      supplierName: p.supplierName || '',
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const chosenSupplier = suppliers.find((s) => s.id === editFormData.supplierId);

    onUpdateProductStockDetails(editingProduct.id, {
      sku: editFormData.sku,
      localizacaoEstoque: editFormData.localizacaoEstoque,
      estoqueMinimo: Number(editFormData.estoqueMinimo) || 3,
      custoUnitario: Number(editFormData.custoUnitario) || 0,
      supplierId: editFormData.supplierId,
      supplierName: chosenSupplier ? chosenSupplier.name : editFormData.supplierName,
    });

    setEditingProduct(null);
    showToast('Detalhes de estoque salvos com sucesso!');
  };

  const handleExportCsv = () => {
    const headers = ['ID', 'Nome', 'SKU', 'Categoria', 'Estoque Atual', 'Estoque Mínimo', 'Localização', 'Fornecedor', 'Custo Unitário', 'Preço Venda'];
    const rows = products.map((p) => [
      p.id,
      `"${(p.name || "").replace(/"/g, '""')}"`,
      p.sku || '',
      p.category,
      p.stockQuantity,
      p.estoqueMinimo ?? 3,
      `"${(p.localizacaoEstoque || '').replace(/"/g, '""')}"`,
      `"${(p.supplierName || '').replace(/"/g, '""')}"`,
      p.custoUnitario || 0,
      p.price,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `estoque-doidas-e-meias-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Relatório de estoque baixado em CSV!');
  };

  return (
    <div className="min-h-screen bg-[#14011a] text-white flex flex-col">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-950 text-emerald-200 border border-emerald-500 px-4 py-2.5 rounded-xl shadow-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation Bar */}
      <header className="bg-[#1f0226] border-b border-purple-800/80 sticky top-0 z-30 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#120119] border border-amber-400/70 p-1 flex items-center justify-center shrink-0">
              <img src={settings.heroMascotUrl || OFFICIAL_BRAND_LOGO} alt="Logo" className="h-full w-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black font-fun text-base sm:text-lg text-white">Doidas e Meias</span>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-600/60 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                  <Package className="w-3 h-3" />
                  <span>Sistema de Estoque Integrado</span>
                </span>
              </div>
              <p className="text-[11px] text-purple-300/80">
                Conectado como <strong className="text-amber-300">{currentUser.name}</strong> ({currentUser.role === 'admin' ? 'Administrador Geral' : 'Operador de Estoque'})
              </p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            {currentUser.role === 'admin' && onNavigateToAdmin && (
              <button
                type="button"
                onClick={onNavigateToAdmin}
                className="px-3.5 py-2 rounded-xl bg-purple-950 hover:bg-purple-900 border border-purple-700 text-purple-200 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Ir para o painel de administração geral"
              >
                <Settings className="w-3.5 h-3.5 text-amber-400" />
                <span>Painel de Administração</span>
              </button>
            )}

            <button
              type="button"
              onClick={onNavigateToStore}
              className="px-3.5 py-2 rounded-xl bg-purple-900/60 hover:bg-purple-800 border border-purple-700 text-purple-200 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Acessar a loja virtual pública"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Ver Loja Virtual</span>
            </button>

            <button
              type="button"
              onClick={onLogout}
              className="px-3 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Sair da sessão"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* KPI Dashboard Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          <div className="p-4 rounded-2xl bg-[#1f0226] border border-purple-800/80 shadow-lg">
            <span className="text-[11px] font-bold text-purple-300 block">Total Peças em Estoque</span>
            <div className="text-xl sm:text-2xl font-black text-white mt-1">{stats.totalItems}</div>
            <span className="text-[10px] text-purple-400">unidades físicas</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#1f0226] border border-purple-800/80 shadow-lg">
            <span className="text-[11px] font-bold text-purple-300 block">Total de SKUs / Modelos</span>
            <div className="text-xl sm:text-2xl font-black text-amber-300 mt-1">{stats.totalSkus}</div>
            <span className="text-[10px] text-purple-400">modelos cadastrados</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#1f0226] border border-purple-800/80 shadow-lg">
            <span className="text-[11px] font-bold text-amber-300 block flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Estoque Baixo</span>
            </span>
            <div className="text-xl sm:text-2xl font-black text-amber-400 mt-1">{stats.lowStockCount}</div>
            <span className="text-[10px] text-amber-300/70">abaixo do nível seguro</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#1f0226] border border-purple-800/80 shadow-lg">
            <span className="text-[11px] font-bold text-rose-300 block flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
              <span>Peças Esgotadas</span>
            </span>
            <div className="text-xl sm:text-2xl font-black text-rose-400 mt-1">{stats.outOfStockCount}</div>
            <span className="text-[10px] text-rose-300/70">precisa reposição urgente</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#1f0226] border border-purple-800/80 shadow-lg col-span-2 sm:col-span-1">
            <span className="text-[11px] font-bold text-purple-300 block flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <span>Valor Custo Total</span>
            </span>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.totalStockValue)}
            </div>
            <span className="text-[10px] text-emerald-300/70">capital imobilizado</span>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-purple-800/80 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'inventory'
                ? 'border-amber-400 text-amber-300 bg-purple-900/30'
                : 'border-transparent text-purple-300 hover:text-white'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Inventário & Controle de Saldo</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('suppliers')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'suppliers'
                ? 'border-amber-400 text-amber-300 bg-purple-900/30'
                : 'border-transparent text-purple-300 hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Fornecedores & Fabricantes ({suppliers.length})</span>
          </button>
        </div>

        {/* Tab 1: INVENTORY & STOCK BALANCES */}
        {activeTab === 'inventory' && (
          <div className="space-y-4">
            {/* Filter and Search Bar */}
            <div className="p-4 rounded-2xl bg-[#1f0226] border border-purple-800/80 shadow-xl flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="flex flex-1 items-center gap-2 w-full">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por nome da meia, SKU ou prateleira..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#120119] border border-purple-700/80 text-white text-xs placeholder-purple-400/50 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3 py-2.5 rounded-xl bg-[#120119] border border-purple-700/80 text-white text-xs focus:outline-none focus:border-amber-400"
                >
                  <option value="all">Todas as Categorias</option>
                  <option value="oversize">Oversize</option>
                  <option value="cropped">Cropped</option>
                  <option value="meias">Meias</option>
                  <option value="kits">Kits</option>
                </select>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
                <button
                  type="button"
                  onClick={() => setOnlyLowStock(!onlyLowStock)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 cursor-pointer ${
                    onlyLowStock
                      ? 'bg-amber-500/20 text-amber-300 border-amber-400'
                      : 'bg-[#120119] text-purple-300 border-purple-700 hover:text-white'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Apenas Estoque Baixo / Esgotado</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="px-3 py-2 rounded-xl bg-purple-950 hover:bg-purple-900 text-purple-200 border border-purple-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Baixar planilha CSV"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span>Exportar CSV</span>
                </button>
              </div>
            </div>

            {/* Inventory Table */}
            <div className="p-4 rounded-3xl bg-[#1f0226] border border-purple-800/80 shadow-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-purple-800/80 text-purple-300 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-3">Peça</th>
                      <th className="py-3 px-3">SKU</th>
                      <th className="py-3 px-3">Localização</th>
                      <th className="py-3 px-3">Fornecedor</th>
                      <th className="py-3 px-3 text-center">Saldo em Estoque</th>
                      <th className="py-3 px-3 text-center">Mínimo</th>
                      <th className="py-3 px-3 text-center">Status</th>
                      <th className="py-3 px-3 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-900/40">
                    {filteredProducts.map((p) => {
                      const minStock = p.estoqueMinimo ?? 3;
                      const isLow = p.stockQuantity > 0 && p.stockQuantity <= minStock;
                      const isOut = p.stockQuantity === 0;

                      return (
                        <tr key={p.id} className="hover:bg-purple-950/40 transition-colors">
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-10 h-10 rounded-xl overflow-hidden bg-black/50 shrink-0 border border-purple-700/60">
                                <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                              </div>
                              <div>
                                <span className="font-bold text-white block">{p.name}</span>
                                <span className="text-[10px] text-purple-300/80">
                                  Venda: R$ {Number(p.price).toFixed(2)} | Custo: R$ {(Number(p.custoUnitario) || 0).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-3 font-mono text-purple-200">
                            {p.sku || <span className="text-purple-400/50">Não informado</span>}
                          </td>

                          <td className="py-3 px-3 text-purple-200">
                            {p.localizacaoEstoque || <span className="text-purple-400/50">Prateleira Geral</span>}
                          </td>

                          <td className="py-3 px-3 text-purple-200">
                            {p.supplierName || <span className="text-purple-400/50">Direto / Fábrica</span>}
                          </td>

                          {/* Quick Adjust Quantity Controls */}
                          <td className="py-3 px-3 text-center">
                            <div className="inline-flex items-center gap-1.5 bg-[#120119] border border-purple-700/80 rounded-xl p-1">
                              <button
                                type="button"
                                onClick={() => handleAdjustQuantity(p.id, -1)}
                                className="w-6 h-6 rounded-lg bg-purple-900 hover:bg-purple-800 text-white flex items-center justify-center font-bold text-xs cursor-pointer transition-colors"
                                title="Subtrair 1 peça"
                              >
                                <Minus className="w-3 h-3" />
                              </button>

                              <input
                                type="number"
                                min="0"
                                value={p.stockQuantity}
                                onChange={(e) => handleSetExactQuantity(p.id, e.target.value)}
                                className="w-14 text-center bg-transparent text-white font-black text-xs focus:outline-none"
                              />

                              <button
                                type="button"
                                onClick={() => handleAdjustQuantity(p.id, 1)}
                                className="w-6 h-6 rounded-lg bg-purple-900 hover:bg-purple-800 text-white flex items-center justify-center font-bold text-xs cursor-pointer transition-colors"
                                title="Adicionar 1 peça"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </td>

                          <td className="py-3 px-3 text-center font-mono text-purple-300">
                            {minStock} un.
                          </td>

                          <td className="py-3 px-3 text-center">
                            {isOut ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/40">
                                Esgotado
                              </span>
                            ) : isLow ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                Baixo ({p.stockQuantity})
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                Normal ({p.stockQuantity})
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(p)}
                              className="px-2.5 py-1 rounded-lg bg-purple-900/60 hover:bg-purple-800 text-amber-300 border border-purple-700 text-xs inline-flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <Edit2 className="w-3 h-3" />
                              <span>Editar</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: SUPPLIERS & MANUFACTURERS DATABASE */}
        {activeTab === 'suppliers' && (
          <SuppliersStockDatabase
            suppliers={suppliers}
            manufacturers={manufacturers}
            products={products}
            onSaveSupplier={onSaveSupplier}
            onDeleteSupplier={onDeleteSupplier}
            onSaveManufacturer={onSaveManufacturer}
            onDeleteManufacturer={onDeleteManufacturer}
            onUpdateProductStockDetails={onUpdateProductStockDetails}
          />
        )}
      </main>

      {/* Edit Product Stock Details Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[#1f0226] border-2 border-purple-700/80 rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-purple-800/80 pb-3">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-400" />
                <h3 className="font-fun font-bold text-base text-white">Editar Dados de Estoque</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="p-1 rounded-full hover:bg-white/10 text-purple-300 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-purple-300">
              Produto: <strong className="text-white">{editingProduct.name}</strong>
            </p>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-purple-200">SKU / Código Interno</label>
                  <input
                    type="text"
                    value={editFormData.sku || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, sku: e.target.value })}
                    placeholder="Ex: MEIA-DONUT-01"
                    className="w-full px-3 py-2 rounded-xl bg-[#120119] border border-purple-700 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-purple-200">Estoque Mínimo de Alerta</label>
                  <input
                    type="number"
                    min="0"
                    value={editFormData.estoqueMinimo ?? 3}
                    onChange={(e) => setEditFormData({ ...editFormData, estoqueMinimo: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-[#120119] border border-purple-700 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-purple-200">Localização no Galpão / Prateleira</label>
                <input
                  type="text"
                  value={editFormData.localizacaoEstoque || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, localizacaoEstoque: e.target.value })}
                  placeholder="Ex: Prateleira B - Gaveta 03"
                  className="w-full px-3 py-2 rounded-xl bg-[#120119] border border-purple-700 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-purple-200">Fornecedor Vinculado</label>
                  <select
                    value={editFormData.supplierId || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, supplierId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#120119] border border-purple-700 text-white text-xs focus:outline-none focus:border-amber-400"
                  >
                    <option value="">Selecione ou deixe geral</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-purple-200">Custo Unitário (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editFormData.custoUnitario || 0}
                    onChange={(e) => setEditFormData({ ...editFormData, custoUnitario: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl bg-[#120119] border border-purple-700 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 rounded-xl bg-purple-950 text-purple-300 hover:text-white text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-pink-500 hover:from-amber-300 text-purple-950 font-black text-xs cursor-pointer flex items-center gap-1.5 shadow-md"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Salvar Alterações</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
