import React, { useState } from 'react';
import {
  Users,
  Building2,
  PackageCheck,
  Plus,
  Search,
  Download,
  Phone,
  Mail,
  AlertTriangle,
  Edit2,
  Trash2,
  Save,
  X,
  FileSpreadsheet,
  ArrowUpDown,
  CheckCircle2,
  TrendingUp,
  MapPin,
  ExternalLink
} from 'lucide-react';
import { Supplier, Manufacturer, Product } from '../types';

interface SuppliersStockDatabaseProps {
  suppliers: Supplier[];
  manufacturers: Manufacturer[];
  products: Product[];
  onSaveSupplier: (supplier: Supplier) => void;
  onDeleteSupplier: (id: string) => void;
  onSaveManufacturer: (manufacturer: Manufacturer) => void;
  onDeleteManufacturer: (id: string) => void;
  onUpdateProductStockDetails: (
    productId: string,
    details: Partial<Product>
  ) => void;
}

export const SuppliersStockDatabase: React.FC<SuppliersStockDatabaseProps> = ({
  suppliers,
  manufacturers,
  products,
  onSaveSupplier,
  onDeleteSupplier,
  onSaveManufacturer,
  onDeleteManufacturer,
  onUpdateProductStockDetails,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'inventory' | 'suppliers' | 'manufacturers'>('inventory');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLowStockOnly, setFilterLowStockOnly] = useState(false);

  // Supplier modal state
  const [isEditingSupplier, setIsEditingSupplier] = useState(false);
  const [currentSupplier, setCurrentSupplier] = useState<Partial<Supplier>>({});

  // Manufacturer modal state
  const [isEditingManufacturer, setIsEditingManufacturer] = useState(false);
  const [currentManufacturer, setCurrentManufacturer] = useState<Partial<Manufacturer>>({});

  // Quick Stock adjustment modal
  const [quickStockProduct, setQuickStockProduct] = useState<Product | null>(null);
  const [stockDelta, setStockDelta] = useState<number>(10);
  const [stockNotes, setStockNotes] = useState('');

  // Calculations
  const lowStockCount = products.filter(
    (p) => p.stockQuantity <= (p.estoqueMinimo ?? 5)
  ).length;

  const totalInventoryCost = products.reduce(
    (acc, p) => acc + (p.custoUnitario || 0) * p.stockQuantity,
    0
  );

  const totalInventoryPotentialRevenue = products.reduce(
    (acc, p) => acc + p.price * p.stockQuantity,
    0
  );

  const totalItemsCount = products.reduce((acc, p) => acc + (p.stockQuantity || 0), 0);

  // Filtered products for inventory table
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      (p.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.supplierName && p.supplierName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.localizacaoEstoque && p.localizacaoEstoque.toLowerCase().includes(searchTerm.toLowerCase()));

    if (filterLowStockOnly) {
      return matchesSearch && p.stockQuantity <= (p.estoqueMinimo ?? 5);
    }
    return matchesSearch;
  });

  // Filtered suppliers
  const filteredSuppliers = suppliers.filter(
    (s) =>
      (s.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.tradeName && s.tradeName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (s.cnpjOrCpf && s.cnpjOrCpf.includes(searchTerm)) ||
      (s.city && s.city.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Export Inventory to CSV
  const handleExportInventoryCSV = () => {
    const headers = [
      'SKU',
      'Nome da Peça',
      'Categoria',
      'Fornecedor',
      'Fabricante',
      'Custo Unitário (R$)',
      'Preço Venda (R$)',
      'Margem Lucro (%)',
      'Estoque Atual',
      'Estoque Mínimo',
      'Localização Depósito',
      'Status Reposição',
    ];

    const rows = products.map((p) => {
      const custo = p.custoUnitario || 0;
      const margem = custo > 0 ? (((p.price - custo) / custo) * 100).toFixed(1) : '0';
      const status =
        p.stockQuantity === 0
          ? 'ESGOTADO'
          : p.stockQuantity <= (p.estoqueMinimo ?? 5)
          ? 'ALERTA REPOSICAO'
          : 'EM DIA';

      return [
        `"${p.sku || p.id}"`,
        `"${(p.name || "").replace(/"/g, '""')}"`,
        `"${p.category}"`,
        `"${p.supplierName || 'Não informado'}"`,
        `"${p.fabricante || 'Doidas e Meias'}"`,
        `"${custo.toFixed(2).replace('.', ',')}"`,
        `"${Number(p.price).toFixed(2).replace('.', ',')}"`,
        `"${margem}%"`,
        `"${p.stockQuantity}"`,
        `"${p.estoqueMinimo ?? 5}"`,
        `"${p.localizacaoEstoque || 'Depósito Principal'}"`,
        `"${status}"`,
      ].join(';');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `doidas-e-meias-inventario-fornecedores-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Quick WhatsApp message to supplier for replenishment
  const handleContactSupplierForRestock = (supplierPhone: string, supplierName: string, product: Product) => {
    const cleanPhone = (supplierPhone || "").replace(/\D/g, '');
    const text = `Olá ${supplierName}! Aqui é da Doidas e Meias. Precisamos solicitar orçamento/pedido de reposição para o item: ${product.name} (SKU: ${product.sku || 'N/A'}). Qual o prazo e preço atual do lote?`;
    window.open(`https://wa.me/55${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 rounded-2xl bg-[#1a0224] border border-pink-500/40 shadow-md">
          <span className="text-purple-300 block text-[11px] font-bold">Total Peças em Estoque</span>
          <span className="text-xl font-black text-white font-fun">{totalItemsCount} un.</span>
          <span className="text-[10px] text-pink-400 block mt-0.5">{products.length} modelos cadastrados</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#1a0224] border border-amber-500/40 shadow-md">
          <span className="text-purple-300 block text-[11px] font-bold">Capital Investido (Custo)</span>
          <span className="text-xl font-black text-amber-300 font-fun">
            R$ {totalInventoryCost.toFixed(2).replace('.', ',')}
          </span>
          <span className="text-[10px] text-amber-200/70 block mt-0.5">Em mercadorias no galpão</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#1a0224] border border-cyan-500/40 shadow-md">
          <span className="text-purple-300 block text-[11px] font-bold">Valor Potencial de Venda</span>
          <span className="text-xl font-black text-[#00f2fe] font-fun">
            R$ {totalInventoryPotentialRevenue.toFixed(2).replace('.', ',')}
          </span>
          <span className="text-[10px] text-cyan-200/70 block mt-0.5">
            Lucro Bruto: R$ {(totalInventoryPotentialRevenue - totalInventoryCost).toFixed(2).replace('.', ',')}
          </span>
        </div>

        <div className={`p-3.5 rounded-2xl border shadow-md ${lowStockCount > 0 ? 'bg-rose-950/40 border-rose-500/60' : 'bg-[#1a0224] border-emerald-500/40'}`}>
          <span className="text-purple-300 block text-[11px] font-bold">Alertas de Reposição</span>
          <span className={`text-xl font-black font-fun ${lowStockCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {lowStockCount} itens
          </span>
          <span className="text-[10px] text-purple-300/80 block mt-0.5">
            {lowStockCount > 0 ? 'Necessitam compra urgente' : 'Estoque em dia'}
          </span>
        </div>
      </div>

      {/* Sub-Tabs: Estoque x Fornecedores x Fabricantes */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-purple-800/60 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setActiveSubTab('inventory'); setSearchTerm(''); }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'inventory'
                ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md'
                : 'bg-[#17021d] text-purple-300 hover:text-white border border-purple-800/50'
            }`}
          >
            <PackageCheck className="w-3.5 h-3.5" />
            <span>Inventário & Reposição ({products.length})</span>
          </button>

          <button
            onClick={() => { setActiveSubTab('suppliers'); setSearchTerm(''); }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'suppliers'
                ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md'
                : 'bg-[#17021d] text-purple-300 hover:text-white border border-purple-800/50'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Banco de Fornecedores ({suppliers.length})</span>
          </button>

          <button
            onClick={() => { setActiveSubTab('manufacturers'); setSearchTerm(''); }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'manufacturers'
                ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md'
                : 'bg-[#17021d] text-purple-300 hover:text-white border border-purple-800/50'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Fabricantes & Marcas ({manufacturers.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleExportInventoryCSV}
            className="px-3 py-1.5 rounded-xl bg-emerald-900/60 hover:bg-emerald-800 border border-emerald-500/50 text-emerald-200 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            title="Exportar dados para Excel/CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Exportar Planilha (CSV)</span>
          </button>

          {activeSubTab === 'suppliers' && (
            <button
              onClick={() => {
                setCurrentSupplier({
                  name: '',
                  tradeName: '',
                  cnpjOrCpf: '',
                  phone: '',
                  email: '',
                  city: '',
                  state: '',
                  deliveryDays: 5,
                  paymentTerms: 'Boleto 30 dias',
                  notes: '',
                });
                setIsEditingSupplier(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Novo Fornecedor</span>
            </button>
          )}

          {activeSubTab === 'manufacturers' && (
            <button
              onClick={() => {
                setCurrentManufacturer({
                  name: '',
                  country: 'Brasil',
                  specialty: '',
                  notes: '',
                });
                setIsEditingManufacturer(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Novo Fabricante</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
          <input
            type="text"
            placeholder={
              activeSubTab === 'inventory'
                ? "Buscar por SKU, nome, fornecedor, prateleira..."
                : "Buscar fornecedor por nome, CNPJ, cidade..."
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#14021a] border border-purple-800 text-xs text-white placeholder:text-purple-400 focus:outline-none focus:border-pink-500"
          />
        </div>

        {activeSubTab === 'inventory' && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setFilterLowStockOnly(!filterLowStockOnly)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                filterLowStockOnly
                  ? 'bg-rose-900/80 border-rose-500 text-white shadow-md'
                  : 'bg-[#180220] border-purple-800/60 text-purple-300 hover:text-white'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Somente Alertas de Reposição ({lowStockCount})</span>
            </button>
          </div>
        )}
      </div>

      {/* SUB-TAB 1: INVENTÁRIO DETALHADO & ESTOQUE */}
      {activeSubTab === 'inventory' && (
        <div className="rounded-2xl border border-purple-800/60 bg-[#16021e] overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#110118] border-b border-purple-800 text-purple-300 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">SKU / Modelo</th>
                  <th className="p-3">Fornecedor / Fabricante</th>
                  <th className="p-3 text-right">Custo / Venda / Margem</th>
                  <th className="p-3 text-center">Localização</th>
                  <th className="p-3 text-center">Estoque Atual</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-right">Ações Rápidas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-900/40">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-purple-300/70">
                      Nenhum produto encontrado com os filtros aplicados.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => {
                    const custo = product.custoUnitario || 0;
                    const margemLucro = custo > 0 ? (((product.price - custo) / custo) * 100).toFixed(0) : '0';
                    const isLow = product.stockQuantity <= (product.estoqueMinimo ?? 5);
                    const isOut = product.stockQuantity === 0;

                    const matchingSupplier = suppliers.find(
                      (s) => s.id === product.supplierId || s.name === product.supplierName
                    );

                    return (
                      <tr key={product.id} className="hover:bg-purple-900/20 transition-colors">
                        {/* SKU & Image & Name */}
                        <td className="p-3">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-10 h-10 rounded-xl object-cover bg-black shrink-0 border border-purple-800"
                            />
                            <div>
                              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-purple-950 text-[#00f2fe] border border-cyan-800/60 font-bold block w-fit mb-0.5">
                                {product.sku || `SKU-${product.id.slice(0, 6)}`}
                              </span>
                              <span className="font-bold text-white block max-w-xs truncate">{product.name}</span>
                              <span className="text-[10px] text-purple-300/70">{product.category}</span>
                            </div>
                          </div>
                        </td>

                        {/* Fornecedor & Fabricante */}
                        <td className="p-3">
                          <div>
                            <span className="font-bold text-amber-300 block">
                              {product.supplierName || 'Fornecedor Padrão'}
                            </span>
                            <span className="text-[10px] text-purple-300/70 block">
                              Fabricante: {product.fabricante || 'Doidas e Meias'}
                            </span>
                            {matchingSupplier?.phone && (
                              <button
                                onClick={() => handleContactSupplierForRestock(matchingSupplier.phone, matchingSupplier.name, product)}
                                className="inline-flex items-center gap-1 text-[10px] text-emerald-400 hover:text-emerald-300 mt-1 font-bold"
                              >
                                <Phone className="w-3 h-3" />
                                <span>Pedir Reposição</span>
                              </button>
                            )}
                          </div>
                        </td>

                        {/* Financeiro */}
                        <td className="p-3 text-right">
                          <div className="space-y-0.5">
                            <span className="text-[10px] text-purple-300 block">
                              Custo: <strong className="text-white">R$ {custo.toFixed(2).replace('.', ',')}</strong>
                            </span>
                            <span className="text-xs font-black text-amber-300 block font-fun">
                              Venda: R$ {Number(product.price).toFixed(2).replace('.', ',')}
                            </span>
                            <span className="text-[10px] text-emerald-400 font-bold block">
                              +{margemLucro}% margem
                            </span>
                          </div>
                        </td>

                        {/* Localização no Depósito */}
                        <td className="p-3 text-center">
                          <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#200329] border border-purple-700/60 text-purple-200 text-[11px]">
                            <MapPin className="w-3 h-3 text-pink-400" />
                            <span>{product.localizacaoEstoque || 'Prateleira A'}</span>
                          </div>
                        </td>

                        {/* Estoque Atual */}
                        <td className="p-3 text-center">
                          <div className="space-y-0.5">
                            <span className="text-base font-black text-white font-fun">
                              {product.stockQuantity} un.
                            </span>
                            <span className="text-[10px] text-purple-400 block">
                              Mínimo: {product.estoqueMinimo ?? 5} un.
                            </span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="p-3 text-center">
                          {isOut ? (
                            <span className="px-2 py-1 rounded-full bg-rose-950 text-rose-300 border border-rose-700 text-[10px] font-bold">
                              Esgotado
                            </span>
                          ) : isLow ? (
                            <span className="px-2 py-1 rounded-full bg-amber-950 text-amber-300 border border-amber-700 text-[10px] font-bold flex items-center justify-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              Repor
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700 text-[10px] font-bold">
                              Em Dia
                            </span>
                          )}
                        </td>

                        {/* Ações Rápidas */}
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setQuickStockProduct(product);
                                setStockDelta(10);
                                setStockNotes('Entrada de novo lote do fornecedor');
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-pink-600/80 hover:bg-pink-600 text-white font-bold text-[11px] flex items-center gap-1 shadow cursor-pointer"
                              title="Adicionar entrada rápida de estoque"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Entrada</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: BANCO DE FORNECEDORES */}
      {activeSubTab === 'suppliers' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSuppliers.map((supplier) => (
              <div
                key={supplier.id}
                className="p-4 rounded-2xl bg-[#1a0224] border border-purple-800/70 hover:border-pink-500/80 transition-all shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="font-bold text-sm text-white font-fun">{supplier.name}</h4>
                      {supplier.tradeName && (
                        <span className="text-[11px] text-purple-300/70 block">{supplier.tradeName}</span>
                      )}
                    </div>
                    <span className="px-2 py-0.5 rounded bg-purple-950 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                      {supplier.deliveryDays ? `${supplier.deliveryDays} dias prazo` : 'Pronta entrega'}
                    </span>
                  </div>

                  {supplier.cnpjOrCpf && (
                    <div className="text-[11px] text-purple-300 font-mono mb-2">
                      CNPJ: <strong className="text-purple-100">{supplier.cnpjOrCpf}</strong>
                    </div>
                  )}

                  <div className="space-y-1.5 text-xs text-purple-200/90 py-2 border-y border-purple-900/60">
                    {supplier.contactPerson && (
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                        <span>Contato: {supplier.contactPerson}</span>
                      </div>
                    )}
                    {supplier.phone && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{supplier.phone}</span>
                        </div>
                        <a
                          href={`https://wa.me/55${(supplier.phone || "").replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold hover:bg-emerald-800"
                        >
                          WhatsApp
                        </a>
                      </div>
                    )}
                    {supplier.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="truncate">{supplier.email}</span>
                      </div>
                    )}
                    {supplier.city && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>{supplier.city} - {supplier.state || 'BR'}</span>
                      </div>
                    )}
                  </div>

                  {supplier.paymentTerms && (
                    <div className="mt-2 text-[11px] text-purple-300">
                      Condições: <strong className="text-amber-200">{supplier.paymentTerms}</strong>
                    </div>
                  )}

                  {supplier.notes && (
                    <p className="text-[11px] text-purple-300/70 italic mt-1 line-clamp-2">
                      "{supplier.notes}"
                    </p>
                  )}
                </div>

                <div className="pt-3 mt-3 border-t border-purple-900/60 flex items-center justify-between">
                  <span className="text-[10px] text-purple-400">
                    {products.filter((p) => p.supplierId === supplier.id || p.supplierName === supplier.name).length} itens fornecidos
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setCurrentSupplier(supplier);
                        setIsEditingSupplier(true);
                      }}
                      className="p-1.5 rounded-lg bg-purple-900/70 hover:bg-purple-800 text-purple-200 hover:text-white"
                      title="Editar fornecedor"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteSupplier(supplier.id)}
                      className="p-1.5 rounded-lg bg-rose-950/70 hover:bg-rose-900 text-rose-300"
                      title="Excluir fornecedor"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: FABRICANTES */}
      {activeSubTab === 'manufacturers' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {manufacturers.map((manufacturer) => (
            <div
              key={manufacturer.id}
              className="p-4 rounded-2xl bg-[#1a0224] border border-purple-800/70 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-sm text-white font-fun">{manufacturer.name}</h4>
                  <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 text-[10px] font-bold">
                    {manufacturer.country}
                  </span>
                </div>
                {manufacturer.specialty && (
                  <p className="text-xs text-purple-200 mt-1">
                    Especialidade: <strong className="text-amber-300">{manufacturer.specialty}</strong>
                  </p>
                )}
                {manufacturer.notes && (
                  <p className="text-[11px] text-purple-300/70 italic mt-2">
                    {manufacturer.notes}
                  </p>
                )}
              </div>

              <div className="pt-3 mt-3 border-t border-purple-900/60 flex items-center justify-end gap-1">
                <button
                  onClick={() => {
                    setCurrentManufacturer(manufacturer);
                    setIsEditingManufacturer(true);
                  }}
                  className="p-1.5 rounded-lg bg-purple-900/70 hover:bg-purple-800 text-purple-200"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDeleteManufacturer(manufacturer.id)}
                  className="p-1.5 rounded-lg bg-rose-950/70 hover:bg-rose-900 text-rose-300"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: EDITAR / NOVO FORNECEDOR */}
      {isEditingSupplier && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1b0324] border-2 border-pink-500/60 rounded-3xl p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-purple-800 mb-4">
              <h3 className="font-bold text-base text-white font-fun flex items-center gap-2">
                <Users className="w-4 h-4 text-pink-400" />
                <span>{currentSupplier.id ? 'Editar Fornecedor' : 'Cadastrar Novo Fornecedor'}</span>
              </h3>
              <button
                onClick={() => setIsEditingSupplier(false)}
                className="p-1.5 rounded-xl hover:bg-purple-900 text-purple-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!currentSupplier.name) return;
                const finalSupplier: Supplier = {
                  id: currentSupplier.id || `sup-${Date.now()}`,
                  name: currentSupplier.name,
                  tradeName: currentSupplier.tradeName || '',
                  cnpjOrCpf: currentSupplier.cnpjOrCpf || '',
                  contactPerson: currentSupplier.contactPerson || '',
                  phone: currentSupplier.phone || '',
                  email: currentSupplier.email || '',
                  city: currentSupplier.city || '',
                  state: currentSupplier.state || '',
                  deliveryDays: Number(currentSupplier.deliveryDays || 5),
                  paymentTerms: currentSupplier.paymentTerms || '',
                  notes: currentSupplier.notes || '',
                  createdAt: currentSupplier.createdAt || new Date().toISOString(),
                };
                onSaveSupplier(finalSupplier);
                setIsEditingSupplier(false);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block text-purple-200 font-bold mb-1">Nome Fantasia / Principal *</label>
                <input
                  type="text"
                  required
                  value={currentSupplier.name || ''}
                  onChange={(e) => setCurrentSupplier({ ...currentSupplier, name: e.target.value })}
                  placeholder="Ex: Têxtil Malharia Brasil"
                  className="w-full px-3 py-2 rounded-xl bg-[#14021a] border border-purple-800 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-purple-200 font-bold mb-1">Razão Social</label>
                  <input
                    type="text"
                    value={currentSupplier.tradeName || ''}
                    onChange={(e) => setCurrentSupplier({ ...currentSupplier, tradeName: e.target.value })}
                    placeholder="Ex: Malharia Ind. Ltda"
                    className="w-full px-3 py-2 rounded-xl bg-[#14021a] border border-purple-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-purple-200 font-bold mb-1">CNPJ ou CPF</label>
                  <input
                    type="text"
                    value={currentSupplier.cnpjOrCpf || ''}
                    onChange={(e) => setCurrentSupplier({ ...currentSupplier, cnpjOrCpf: e.target.value })}
                    placeholder="00.000.000/0001-00"
                    className="w-full px-3 py-2 rounded-xl bg-[#14021a] border border-purple-800 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-purple-200 font-bold mb-1">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    value={currentSupplier.phone || ''}
                    onChange={(e) => setCurrentSupplier({ ...currentSupplier, phone: e.target.value })}
                    placeholder="(11) 99999-9999"
                    className="w-full px-3 py-2 rounded-xl bg-[#14021a] border border-purple-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-purple-200 font-bold mb-1">Nome do Contato / Representante</label>
                  <input
                    type="text"
                    value={currentSupplier.contactPerson || ''}
                    onChange={(e) => setCurrentSupplier({ ...currentSupplier, contactPerson: e.target.value })}
                    placeholder="Ex: Carlos Representante"
                    className="w-full px-3 py-2 rounded-xl bg-[#14021a] border border-purple-800 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-purple-200 font-bold mb-1">E-mail</label>
                  <input
                    type="email"
                    value={currentSupplier.email || ''}
                    onChange={(e) => setCurrentSupplier({ ...currentSupplier, email: e.target.value })}
                    placeholder="pedidos@fornecedor.com.br"
                    className="w-full px-3 py-2 rounded-xl bg-[#14021a] border border-purple-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-purple-200 font-bold mb-1">Prazo Médio (dias)</label>
                  <input
                    type="number"
                    value={currentSupplier.deliveryDays || 5}
                    onChange={(e) => setCurrentSupplier({ ...currentSupplier, deliveryDays: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-[#14021a] border border-purple-800 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-purple-200 font-bold mb-1">Cidade / Estado</label>
                  <input
                    type="text"
                    value={currentSupplier.city || ''}
                    onChange={(e) => setCurrentSupplier({ ...currentSupplier, city: e.target.value })}
                    placeholder="Ex: Brusque - SC"
                    className="w-full px-3 py-2 rounded-xl bg-[#14021a] border border-purple-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-purple-200 font-bold mb-1">Condição de Pagamento</label>
                  <input
                    type="text"
                    value={currentSupplier.paymentTerms || ''}
                    onChange={(e) => setCurrentSupplier({ ...currentSupplier, paymentTerms: e.target.value })}
                    placeholder="Ex: Boleto 30 dias / 50% adiantado"
                    className="w-full px-3 py-2 rounded-xl bg-[#14021a] border border-purple-800 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-purple-200 font-bold mb-1">Observações Internas</label>
                <textarea
                  rows={2}
                  value={currentSupplier.notes || ''}
                  onChange={(e) => setCurrentSupplier({ ...currentSupplier, notes: e.target.value })}
                  placeholder="Informações sobre frete, qualidade, lotes mínimos..."
                  className="w-full px-3 py-2 rounded-xl bg-[#14021a] border border-purple-800 text-white"
                />
              </div>

              <div className="pt-3 border-t border-purple-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingSupplier(false)}
                  className="px-4 py-2 rounded-xl bg-purple-950 text-purple-300 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold flex items-center gap-1.5 shadow-lg"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Salvar Fornecedor</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ENTRADA RÁPIDA DE ESTOQUE */}
      {quickStockProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1b0324] border-2 border-pink-500/60 rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-purple-800 mb-4">
              <h3 className="font-bold text-base text-white font-fun">
                Entrada / Reposição de Estoque
              </h3>
              <button
                onClick={() => setQuickStockProduct(null)}
                className="p-1 rounded-xl text-purple-300 hover:bg-purple-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-[#14021a] border border-purple-800 flex items-center gap-3">
                <img
                  src={quickStockProduct.imageUrl}
                  alt={quickStockProduct.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div>
                  <h4 className="font-bold text-white text-sm">{quickStockProduct.name}</h4>
                  <span className="text-purple-300">
                    Estoque Atual: <strong className="text-amber-300">{quickStockProduct.stockQuantity} un.</strong>
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-purple-200 font-bold mb-1">
                  Quantidade a adicionar (unidades que chegaram):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    value={stockDelta}
                    onChange={(e) => setStockDelta(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#14021a] border border-purple-800 text-white font-bold text-sm"
                  />
                  <div className="flex gap-1">
                    {[5, 10, 25, 50].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setStockDelta(num)}
                        className="px-2.5 py-1.5 rounded-lg bg-purple-900/60 hover:bg-purple-800 text-purple-200 font-bold text-xs"
                      >
                        +{num}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-purple-200 font-bold mb-1">
                  Fornecedor responsável pelo lote:
                </label>
                <select
                  value={quickStockProduct.supplierName || ''}
                  onChange={(e) => {
                    const sup = suppliers.find((s) => s.name === e.target.value);
                    setQuickStockProduct({
                      ...quickStockProduct,
                      supplierName: e.target.value,
                      supplierId: sup?.id,
                    });
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-[#14021a] border border-purple-800 text-white"
                >
                  <option value="">Selecione um fornecedor...</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-purple-200 font-bold mb-1">
                  Local de armazenamento no galpão:
                </label>
                <input
                  type="text"
                  value={quickStockProduct.localizacaoEstoque || ''}
                  onChange={(e) =>
                    setQuickStockProduct({
                      ...quickStockProduct,
                      localizacaoEstoque: e.target.value,
                    })
                  }
                  placeholder="Ex: Prateleira B - Caixa 14"
                  className="w-full px-3 py-2 rounded-xl bg-[#14021a] border border-purple-800 text-white"
                />
              </div>

              <div className="pt-3 border-t border-purple-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setQuickStockProduct(null)}
                  className="px-4 py-2 rounded-xl bg-purple-950 text-purple-300 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const newTotal = quickStockProduct.stockQuantity + stockDelta;
                    onUpdateProductStockDetails(quickStockProduct.id, {
                      stockQuantity: newTotal,
                      inStock: newTotal > 0,
                      supplierName: quickStockProduct.supplierName,
                      supplierId: quickStockProduct.supplierId,
                      localizacaoEstoque: quickStockProduct.localizacaoEstoque,
                    });
                    setQuickStockProduct(null);
                  }}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold shadow-lg"
                >
                  Confirmar Entrada (+{stockDelta} un.)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
