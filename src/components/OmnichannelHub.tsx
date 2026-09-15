import React, { useState } from 'react';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  Printer,
  FileSpreadsheet,
  Plus,
  Search,
  ExternalLink,
  MessageCircle,
  Copy,
  Tag,
  ShoppingBag,
  ArrowRight,
  Filter,
  X,
  AlertCircle
} from 'lucide-react';
import { Order, Product, StoreSettings, OrderOrigin, OrderStatus } from '../types';

interface OmnichannelHubProps {
  orders: Order[];
  products: Product[];
  settings: StoreSettings;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus, trackingCode?: string) => void;
  onCreateManualOrder: (newOrder: Partial<Order>) => void;
  onQuickDeductStock: (productId: string, qty: number) => void;
}

export const OmnichannelHub: React.FC<OmnichannelHubProps> = ({
  orders,
  products,
  settings,
  onUpdateOrderStatus,
  onCreateManualOrder,
  onQuickDeductStock,
}) => {
  const [filterOrigin, setFilterOrigin] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Modal: Quick TikTok Order Entry
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [newOrderOrigin, setNewOrderOrigin] = useState<OrderOrigin>('tiktok');
  const [newOrderCode, setNewOrderCode] = useState('');
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newDeliveryAddress, setNewDeliveryAddress] = useState('');
  const [newSelectedProductId, setNewSelectedProductId] = useState(products[0]?.id || '');
  const [newQuantity, setNewQuantity] = useState(1);
  const [newTotalValue, setNewTotalValue] = useState<number>(products[0]?.price || 0);

  // Modal: Shipping Label Printing
  const [selectedOrderForLabel, setSelectedOrderForLabel] = useState<Order | null>(null);

  // Modal: Edit Tracking
  const [editingTrackingOrder, setEditingTrackingOrder] = useState<Order | null>(null);
  const [inputTrackingCode, setInputTrackingCode] = useState('');

  // Filtering
  const filteredOrders = orders.filter((order) => {
    const matchesOrigin = filterOrigin === 'all' || order.origin === filterOrigin;
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesQuery =
      (order.orderNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.customerName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.customerPhone || '').includes(searchQuery) ||
      (order.trackingCode && order.trackingCode.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesOrigin && matchesStatus && matchesQuery;
  });

  // Financial Summaries
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const tiktokOrdersCount = orders.filter((o) => o.origin === 'tiktok').length;
  const siteOrdersCount = orders.filter((o) => o.origin === 'site' || !o.origin).length;
  const pendingShipmentCount = orders.filter(
    (o) => o.status === 'paid' || o.status === 'preparing'
  ).length;

  // Tracking URL Helper
  const getTrackingUrl = (carrier?: string, code?: string) => {
    if (!code) return '#';
    const c = (carrier || '').toLowerCase();
    if (c.includes('jadlog')) {
      return `https://www.jadlog.com.br/tracking?tracking=${encodeURIComponent(code)}`;
    }
    if (c.includes('loggi')) {
      return `https://www.loggi.com/rastreador/${encodeURIComponent(code)}`;
    }
    return `https://rastreamento.correios.com.br/app/index.php?codigo=${encodeURIComponent(code)}`;
  };

  // Export to CSV
  const handleExportOrdersCSV = () => {
    const headers = [
      'Nº Pedido',
      'Canal de Venda',
      'Data/Hora',
      'Cliente',
      'Telefone/WhatsApp',
      'Endereço de Entrega',
      'Forma de Envio',
      'Frete (R$)',
      'Produtos / Itens',
      'Forma de Pagamento',
      'Valor Total (R$)',
      'Status',
      'Código de Rastreio',
    ];

    const rows = orders.map((o) => {
      const itemsList = o.items
        .map((it) => `${it.quantity}x ${it.product.name}`)
        .join(' | ');

      const canal =
        o.origin === 'tiktok'
          ? 'TikTok Shop'
          : o.origin === 'whatsapp'
          ? 'WhatsApp'
          : 'Site Oficial';

      return [
        `"${o.orderNumber}"`,
        `"${canal}"`,
        `"${new Date(o.createdAt).toLocaleString('pt-BR')}"`,
        `"${o.customerName}"`,
        `"${o.customerPhone}"`,
        `"${(o.deliveryAddress || "").replace(/"/g, '""')}"`,
        `"${(o.shippingMethodName || o.shippingCarrier || 'Padrão').replace(/"/g, '""')}"`,
        `"${(o.deliveryFee || 0).toFixed(2).replace('.', ',')}"`,
        `"${itemsList.replace(/"/g, '""')}"`,
        `"${o.paymentMethod.toUpperCase()}"`,
        `"${Number(o.total).toFixed(2).replace('.', ',')}"`,
        `"${o.status.toUpperCase()}"`,
        `"${o.trackingCode || 'Sem rastreio'}"`,
      ].join(';');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `doidas-e-meias-pedidos-tiktok-e-site-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Send WhatsApp shipping notification
  const handleSendWhatsAppTracking = (order: Order) => {
    const cleanPhone = (order.customerPhone || "").replace(/\D/g, '');
    const trackingMsg = order.trackingCode
      ? `Seu código de rastreio para acompanhar nos Correios/Transportadora é: *${order.trackingCode}*.`
      : 'Seu pacote já está embalado e saindo para envio hoje!';

    const text = `Oi ${order.customerName}! 🧦 Aqui é da *Doidas e Meias*!
Seu pedido *#${order.orderNumber}* foi preparado com muito carinho!
${trackingMsg}
Qualquer dúvida, estamos à total disposição. Agradecemos muito a sua preferência! ✨`;

    window.open(`https://wa.me/55${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 rounded-2xl bg-[#180220] border border-pink-500/40 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-purple-300 font-bold text-[11px]">Vendas TikTok Shop</span>
            <span className="text-base">🎵</span>
          </div>
          <span className="text-xl font-black text-white font-fun block mt-1">
            {tiktokOrdersCount} pedidos
          </span>
          <span className="text-[10px] text-pink-400">Canal integrado</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#180220] border border-cyan-500/40 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-purple-300 font-bold text-[11px]">Vendas no Site Oficial</span>
            <span className="text-base">🌐</span>
          </div>
          <span className="text-xl font-black text-[#00f2fe] font-fun block mt-1">
            {siteOrdersCount} pedidos
          </span>
          <span className="text-[10px] text-cyan-300">Checkout direto</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#180220] border border-amber-500/40 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-purple-300 font-bold text-[11px]">Fila de Expedição</span>
            <Truck className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-xl font-black text-amber-300 font-fun block mt-1">
            {pendingShipmentCount} pacotes
          </span>
          <span className="text-[10px] text-amber-200/70">Aguardando envio / embalagem</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#180220] border border-emerald-500/40 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-purple-300 font-bold text-[11px]">Faturamento Total</span>
            <span className="text-base">💰</span>
          </div>
          <span className="text-xl font-black text-emerald-400 font-fun block mt-1">
            R$ {totalRevenue.toFixed(2).replace('.', ',')}
          </span>
          <span className="text-[10px] text-emerald-300/70">TikTok + Site + WhatsApp</span>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-[#15021c] border border-purple-800/60">
        <div className="flex flex-wrap items-center gap-2">
          {/* Origin filter */}
          <div className="flex items-center gap-1 bg-[#1a0224] p-1 rounded-xl border border-purple-800 text-xs">
            <button
              onClick={() => setFilterOrigin('all')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                filterOrigin === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'text-purple-300 hover:text-white'
              }`}
            >
              Todos ({orders.length})
            </button>
            <button
              onClick={() => setFilterOrigin('tiktok')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                filterOrigin === 'tiktok'
                  ? 'bg-pink-600 text-white'
                  : 'text-purple-300 hover:text-white'
              }`}
            >
              <span>🎵 TikTok</span>
              <span>({tiktokOrdersCount})</span>
            </button>
            <button
              onClick={() => setFilterOrigin('site')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                filterOrigin === 'site'
                  ? 'bg-cyan-600 text-white'
                  : 'text-purple-300 hover:text-white'
              }`}
            >
              <span>🌐 Site</span>
              <span>({siteOrdersCount})</span>
            </button>
          </div>

          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-[#1a0224] border border-purple-800 text-xs text-white"
          >
            <option value="all">Todos os Status</option>
            <option value="pending">🟡 Pendente</option>
            <option value="paid">🟢 Pago / Aprovado</option>
            <option value="preparing">📦 Embalando / Picking</option>
            <option value="shipped">🚚 Enviado</option>
            <option value="delivered">✅ Entregue</option>
          </select>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
          {/* Links diretos para emissão de frete barato */}
          <a
            href="https://superfrete.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1.5 rounded-xl bg-pink-950/80 hover:bg-pink-900 border border-pink-600/50 text-pink-300 text-xs font-bold flex items-center gap-1 shadow cursor-pointer"
            title="Abrir calculadora SuperFrete com até 80% OFF"
          >
            <span>📦 SuperFrete</span>
            <ExternalLink className="w-3 h-3 text-pink-400" />
          </a>

          <a
            href="https://melhorenvio.com.br"
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1.5 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-600/50 text-cyan-300 text-xs font-bold flex items-center gap-1 shadow cursor-pointer"
            title="Abrir painel Melhor Envio (Jadlog / Correios)"
          >
            <span>🚛 Melhor Envio</span>
            <ExternalLink className="w-3 h-3 text-cyan-400" />
          </a>

          <button
            onClick={handleExportOrdersCSV}
            className="px-3 py-2 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-200 text-xs font-bold flex items-center gap-1.5 shadow cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Exportar Planilha</span>
          </button>

          <button
            onClick={() => {
              setNewOrderOrigin('tiktok');
              setNewOrderCode(`TT-${Math.floor(100000 + Math.random() * 900000)}`);
              setNewCustomerName('');
              setNewCustomerPhone('');
              setNewDeliveryAddress('');
              setNewSelectedProductId(products[0]?.id || '');
              setNewQuantity(1);
              setNewTotalValue(products[0]?.price || 0);
              setIsNewOrderModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-[#00f2fe] text-white text-xs font-black flex items-center gap-1.5 shadow-lg hover:scale-103 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Lançar Venda do TikTok Shop</span>
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl border border-purple-800/60 bg-[#16021e] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#100116] border-b border-purple-800 text-purple-300 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3">Canal / Pedido</th>
                <th className="p-3">Cliente & Contato</th>
                <th className="p-3">Itens / Peças</th>
                <th className="p-3 text-right">Valor & Pagamento</th>
                <th className="p-3 text-center">Status & Rastreio</th>
                <th className="p-3 text-right">Expedição Rápida</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-900/40">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-purple-300/70">
                    Nenhum pedido encontrado nos critérios selecionados.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const isTikTok = order.origin === 'tiktok';

                  return (
                    <tr key={order.id} className="hover:bg-purple-900/20 transition-colors">
                      {/* Canal & Nº Pedido */}
                      <td className="p-3">
                        <div className="space-y-1">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black border ${
                              isTikTok
                                ? 'bg-pink-950 text-pink-300 border-pink-700'
                                : 'bg-cyan-950 text-cyan-300 border-cyan-700'
                            }`}
                          >
                            <span>{isTikTok ? '🎵 TikTok Shop' : '🌐 Site Oficial'}</span>
                          </span>
                          <span className="font-mono text-white font-bold block text-xs">
                            #{order.orderNumber}
                          </span>
                          {order.shippingMethodName ? (
                            <span className="text-[10px] text-cyan-300 font-semibold flex items-center gap-1 truncate max-w-[140px]" title={order.shippingMethodName}>
                              <Truck className="w-3 h-3 text-[#00f2fe] shrink-0" />
                              <span className="truncate">{order.shippingMethodName}</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-purple-400 block">Correios / Transportadora</span>
                          )}
                          <span className="text-[10px] text-purple-400 block">
                            {new Date(order.createdAt).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </td>

                      {/* Cliente & Contato */}
                      <td className="p-3">
                        <div>
                          <strong className="text-white text-xs block">{order.customerName}</strong>
                          <span className="text-purple-300 font-mono text-[11px] block">
                            {order.customerPhone}
                          </span>
                          <span className="text-[10px] text-purple-300/70 block max-w-xs truncate" title={order.deliveryAddress}>
                            📍 {order.deliveryAddress}
                          </span>
                        </div>
                      </td>

                      {/* Itens */}
                      <td className="p-3">
                        <div className="space-y-1 max-w-xs">
                          {(order.items || []).map((item, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 text-[11px] text-purple-200">
                              <span className="font-bold text-amber-300">{item.quantity}x</span>
                              <span className="truncate">{item.product.name}</span>
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Valor & Pagamento */}
                      <td className="p-3 text-right">
                        <div>
                          <span className="font-black text-sm text-white font-fun block">
                            R$ {Number(order.total).toFixed(2).replace('.', ',')}
                          </span>
                          <div className="flex items-center justify-end gap-1 mt-0.5">
                            <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950 text-purple-200 font-bold uppercase inline-block">
                              {order.paymentMethod}
                            </span>
                            {order.pixDiscountApplied && order.pixDiscountApplied > 0 && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 font-bold" title={`Desconto Pix: -R$ ${Number(order.pixDiscountApplied).toFixed(2)}`}>
                                -5% PIX
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Status & Rastreio */}
                      <td className="p-3 text-center">
                        <div className="space-y-1.5">
                          <select
                            value={order.status}
                            onChange={(e) => onUpdateOrderStatus(order.id, e.target.value as OrderStatus, order.trackingCode)}
                            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border ${
                              order.status === 'delivered'
                                ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                                : order.status === 'shipped'
                                ? 'bg-cyan-950 text-cyan-300 border-cyan-700'
                                : order.status === 'preparing'
                                ? 'bg-amber-950 text-amber-300 border-amber-700'
                                : 'bg-purple-950 text-purple-200 border-purple-700'
                            }`}
                          >
                            <option value="pending">🟡 Pendente</option>
                            <option value="paid">🟢 Pago</option>
                            <option value="preparing">📦 Embalando</option>
                            <option value="shipped">🚚 Enviado</option>
                            <option value="delivered">✅ Entregue</option>
                          </select>

                          {order.trackingCode ? (
                            <a
                              href={getTrackingUrl(order.shippingCarrier || order.shippingMethodName, order.trackingCode)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] font-mono text-cyan-300 bg-[#120118] px-2 py-0.5 rounded border border-cyan-800 flex items-center justify-center gap-1 hover:border-cyan-400 transition-colors"
                              title="Rastrear nos Correios / Transportadora"
                            >
                              <span>Rastreio: {order.trackingCode}</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingTrackingOrder(order);
                                setInputTrackingCode('');
                              }}
                              className="text-[10px] text-pink-400 hover:text-pink-300 underline block mx-auto"
                            >
                              + Inserir Rastreio
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Expedição Rápida */}
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Imprimir Etiqueta de Envio */}
                          <button
                            onClick={() => setSelectedOrderForLabel(order)}
                            className="p-1.5 rounded-lg bg-purple-900/80 hover:bg-purple-800 text-purple-200 hover:text-white"
                            title="Gerar e Imprimir Etiqueta de Envio para a Caixa"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          {/* Notificar Cliente WhatsApp */}
                          <button
                            onClick={() => handleSendWhatsAppTracking(order)}
                            className="p-1.5 rounded-lg bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 hover:text-white"
                            title="Avisar Cliente no WhatsApp sobre o Envio"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
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

      {/* MODAL: LANÇAR PEDIDO RÁPIDO DO TIKTOK SHOP */}
      {isNewOrderModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1b0324] border-2 border-pink-500/60 rounded-3xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-purple-800 mb-4">
              <div>
                <h3 className="font-bold text-base text-white font-fun flex items-center gap-2">
                  <span className="text-xl">🎵</span>
                  <span>Lançar Venda do TikTok Shop</span>
                </h3>
                <p className="text-[11px] text-purple-300/80">
                  Cadastre o pedido recebido no TikTok para dar baixa imediata no estoque e gerar a etiqueta de postagem.
                </p>
              </div>
              <button
                onClick={() => setIsNewOrderModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-purple-900 text-purple-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const selectedProd = products.find((p) => p.id === newSelectedProductId);
                if (!selectedProd) return;

                const newOrder: Order = {
                  id: `order-${Date.now()}`,
                  orderNumber: newOrderCode || `TT-${Date.now().toString().slice(-6)}`,
                  origin: newOrderOrigin,
                  customerName: newCustomerName || 'Cliente TikTok Shop',
                  customerPhone: newCustomerPhone || '(11) 99999-9999',
                  deliveryAddress: newDeliveryAddress || 'A combinar com o comprador',
                  paymentMethod: 'tiktok_shop',
                  items: [
                    {
                      product: selectedProd,
                      quantity: newQuantity,
                    },
                  ],
                  subtotal: newTotalValue,
                  deliveryFee: 0,
                  total: newTotalValue,
                  status: 'paid',
                  createdAt: new Date().toISOString(),
                };

                // Deduct stock
                onQuickDeductStock(selectedProd.id, newQuantity);
                // Create order
                onCreateManualOrder(newOrder);
                setIsNewOrderModalOpen(false);
              }}
              className="space-y-3 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-purple-200 font-bold mb-1">ID do Pedido no TikTok *</label>
                  <input
                    type="text"
                    required
                    value={newOrderCode}
                    onChange={(e) => setNewOrderCode(e.target.value)}
                    placeholder="Ex: TT-5829104"
                    className="w-full px-3 py-2 rounded-xl bg-[#14021a] border border-purple-800 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-purple-200 font-bold mb-1">Canal de Origem</label>
                  <select
                    value={newOrderOrigin}
                    onChange={(e) => setNewOrderOrigin(e.target.value as OrderOrigin)}
                    className="w-full px-3 py-2 rounded-xl bg-[#14021a] border border-purple-800 text-white"
                  >
                    <option value="tiktok">🎵 TikTok Shop</option>
                    <option value="whatsapp">💬 WhatsApp</option>
                    <option value="balcao">🏪 Balcão / Feira</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-purple-200 font-bold mb-1">Nome do Comprador</label>
                  <input
                    type="text"
                    value={newCustomerName}
                    onChange={(e) => setNewCustomerName(e.target.value)}
                    placeholder="Ex: Juliana Silva"
                    className="w-full px-3 py-2 rounded-xl bg-[#14021a] border border-purple-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-purple-200 font-bold mb-1">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    value={newCustomerPhone}
                    onChange={(e) => setNewCustomerPhone(e.target.value)}
                    placeholder="(11) 98888-8888"
                    className="w-full px-3 py-2 rounded-xl bg-[#14021a] border border-purple-800 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-purple-200 font-bold mb-1">Endereço de Entrega (Rua, Número, CEP)</label>
                <input
                  type="text"
                  value={newDeliveryAddress}
                  onChange={(e) => setNewDeliveryAddress(e.target.value)}
                  placeholder="Rua das Flores, 120 - Apto 34, São Paulo - SP - CEP 01310-000"
                  className="w-full px-3 py-2 rounded-xl bg-[#14021a] border border-purple-800 text-white"
                />
              </div>

              <div className="p-3 rounded-2xl bg-[#14021a] border border-purple-800 space-y-3">
                <label className="block text-amber-300 font-bold">Produto Vendido (Baixa Automática no Estoque)</label>
                <select
                  value={newSelectedProductId}
                  onChange={(e) => {
                    setNewSelectedProductId(e.target.value);
                    const p = products.find((prod) => prod.id === e.target.value);
                    if (p) setNewTotalValue(p.price * newQuantity);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-[#1c0324] border border-purple-700 text-white font-bold"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Restam {p.stockQuantity} un. - R$ {Number(p.price).toFixed(2)})
                    </option>
                  ))}
                </select>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-purple-300 font-bold mb-1">Quantidade de Pares</label>
                    <input
                      type="number"
                      min={1}
                      value={newQuantity}
                      onChange={(e) => {
                        const q = Math.max(1, Number(e.target.value));
                        setNewQuantity(q);
                        const p = products.find((prod) => prod.id === newSelectedProductId);
                        if (p) setNewTotalValue(p.price * q);
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-[#1c0324] border border-purple-700 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-purple-300 font-bold mb-1">Valor Total Cobrado (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newTotalValue}
                      onChange={(e) => setNewTotalValue(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-[#1c0324] border border-purple-700 text-amber-300 font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-purple-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewOrderModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-purple-950 text-purple-300 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-[#00f2fe] text-white font-black shadow-lg"
                >
                  Salvar Pedido & Dar Baixa no Estoque
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: GERADOR & IMPRESSOR DE ETIQUETA DE ENVIO */}
      {selectedOrderForLabel && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-zinc-900 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <h3 className="font-bold text-base font-fun text-purple-950 flex items-center gap-2">
                <Printer className="w-5 h-5 text-pink-600" />
                <span>Etiqueta de Envio & Conteúdo</span>
              </h3>
              <button
                onClick={() => setSelectedOrderForLabel(null)}
                className="p-1 rounded-xl hover:bg-zinc-100 text-zinc-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Printable Box */}
            <div
              id="printable-shipping-label"
              className="border-2 border-dashed border-zinc-400 p-4 rounded-2xl bg-zinc-50 space-y-3 text-xs font-mono"
            >
              <div className="flex items-center justify-between border-b pb-2">
                <div>
                  <span className="font-black text-sm uppercase text-purple-900">DOIDAS E MEIAS</span>
                  <span className="text-[10px] text-zinc-500 block">Remetente Oficial - São Paulo/SP</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-xs bg-zinc-200 px-2 py-0.5 rounded inline-block">
                    {selectedOrderForLabel.origin === 'tiktok' ? 'TIKTOK SHOP' : 'LOJA ONLINE'}
                  </span>
                  <span className="text-[10px] text-purple-950 font-black block mt-0.5 uppercase">
                    {selectedOrderForLabel.shippingMethodName || selectedOrderForLabel.shippingCarrier || 'CORREIOS MINI ENVIOS'}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-500 block">DESTINATÁRIO:</span>
                <strong className="text-sm font-black text-zinc-900 block font-sans">
                  {selectedOrderForLabel.customerName}
                </strong>
                <p className="text-xs text-zinc-700 mt-1 font-sans">
                  {selectedOrderForLabel.deliveryAddress}
                </p>
                <span className="text-xs text-zinc-600 block mt-1 font-sans">
                  Contato: {selectedOrderForLabel.customerPhone}
                </span>
              </div>

              <div className="border-t border-dashed pt-2">
                <span className="text-[10px] uppercase font-bold text-zinc-500 block">DECLARAÇÃO DE CONTEÚDO:</span>
                <div className="text-[11px] text-zinc-800 font-sans space-y-0.5 mt-0.5">
                  {(selectedOrderForLabel.items || []).map((it, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>{it.quantity}x {it.product.name}</span>
                      <span>R$ {(it.quantity * it.product.price).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="font-bold pt-1 border-t flex justify-between">
                    <span>Valor Declarado:</span>
                    <span>R$ {Number(selectedOrderForLabel.total).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-dashed pt-2 flex justify-between text-[10px] text-zinc-600 font-sans">
                <span>Embalagem: Envelope Segurança (Courier)</span>
                <span>Peso Estimado: ~{((selectedOrderForLabel.items || []).reduce((a, b) => a + b.quantity, 0) * 50)}g</span>
              </div>

              {selectedOrderForLabel.trackingCode && (
                <div className="text-center pt-2 border-t font-mono text-xs font-bold text-purple-950">
                  |||||||||||||||||||||||||||||||||||||||||||||
                  <div className="mt-0.5">{selectedOrderForLabel.trackingCode}</div>
                </div>
              )}
            </div>

            {/* Quick platform links for label printing */}
            <div className="p-3 rounded-2xl bg-purple-50 border border-purple-200 text-xs flex flex-col sm:flex-row items-center justify-between gap-2">
              <span className="text-purple-950 text-[11px] font-semibold">
                Emitir etiqueta com desconto (sem contrato):
              </span>
              <div className="flex gap-1.5 shrink-0">
                <a
                  href="https://superfrete.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-pink-600 hover:bg-pink-700 text-white font-bold text-[10px] flex items-center gap-1"
                >
                  <span>SuperFrete</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
                <a
                  href="https://melhorenvio.com.br"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-[#00f2fe] hover:bg-cyan-400 text-purple-950 font-black text-[10px] flex items-center gap-1"
                >
                  <span>Melhor Envio</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedOrderForLabel(null)}
                className="px-4 py-2 rounded-xl bg-zinc-200 hover:bg-zinc-300 text-zinc-800 text-xs font-bold"
              >
                Fechar
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 rounded-xl bg-purple-900 hover:bg-purple-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir Agora</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: INSERIR RASTREIO */}
      {editingTrackingOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1b0324] border-2 border-pink-500/60 rounded-3xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="font-bold text-base text-white font-fun mb-2">
              Inserir Código de Rastreio
            </h3>
            <p className="text-xs text-purple-300/80 mb-3">
              Pedido #{editingTrackingOrder.orderNumber} - {editingTrackingOrder.customerName}
            </p>

            <input
              type="text"
              value={inputTrackingCode}
              onChange={(e) => setInputTrackingCode(e.target.value.toUpperCase())}
              placeholder="Ex: NL123456789BR ou JD098234"
              className="w-full px-3 py-2 rounded-xl bg-[#14021a] border border-purple-800 text-white font-mono text-sm mb-4"
            />

            <div className="flex justify-end gap-2 text-xs">
              <button
                onClick={() => setEditingTrackingOrder(null)}
                className="px-3 py-1.5 rounded-xl bg-purple-950 text-purple-300 font-bold"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  onUpdateOrderStatus(editingTrackingOrder.id, 'shipped', inputTrackingCode);
                  setEditingTrackingOrder(null);
                }}
                className="px-4 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold"
              >
                Salvar & Marcar Enviado
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
