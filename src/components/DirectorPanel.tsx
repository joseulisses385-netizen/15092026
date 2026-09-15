import React, { useState } from 'react';
import {
  X,
  Package,
  ShoppingBag,
  Settings,
  BarChart3,
  Plus,
  Edit3,
  Trash2,
  Check,
  Download,
  RotateCcw,
  LogOut,
  Phone,
  DollarSign,
  Upload,
  Layers,
  Truck,
  CreditCard,
  QrCode,
  ExternalLink,
  ShieldAlert,
  Boxes,
  HelpCircle,
  Users,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  Building2,
  Lock,
  Mail,
  MapPin,
  CheckCircle,
  Award,
  Info,
  Eye,
  EyeOff,
  RefreshCw,
  Zap,
  CheckCircle2,
  Gift,
  Tag,
} from 'lucide-react';
import { MercadoPagoSecurityBadge } from './MercadoPagoSecurityBadge';
import {
  Product,
  StoreSettings,
  Order,
  Supplier,
  Manufacturer,
  OrderStatus,
  StaffUser,
  Customer,
} from '../types';
import { OFFICIAL_BRAND_LOGO, OFFICIAL_FALLBACK_LOGO } from '../constants/assets';
import { fileToOptimizedDataUrl } from '../utils/imageHelper';
import { uploadLogoToServer } from '../services/storeApi';
import { SuppliersStockDatabase } from './SuppliersStockDatabase';
import { OmnichannelHub } from './OmnichannelHub';
import { ShippingLogisticsPanel } from './ShippingLogisticsPanel';
import { PrimaryPageEditor } from './PrimaryPageEditor';
import { LogoManager } from './LogoManager';
import { UserManagerTab } from './UserManagerTab';
import { CustomersManagerTab } from './CustomersManagerTab';
import { CouponsManagerTab } from './CouponsManagerTab';
import { GeminiExportModal } from './GeminiExportModal';

interface DirectorPanelProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  settings: StoreSettings;
  orders: Order[];
  suppliers: Supplier[];
  manufacturers: Manufacturer[];
  onSaveProducts: (products: Product[]) => void;
  onSaveSettings: (settings: StoreSettings) => void;
  onResetDefaults: () => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus, trackingCode?: string) => void;
  onUpdateOrder: (order: Order) => void;
  onSaveOrders: (orders: Order[]) => void;
  onDeleteOrder: (orderId: string) => void;
  onLogoutDirector: () => void;
  onSaveSupplier: (supplier: Supplier) => void;
  onDeleteSupplier: (id: string) => void;
  onSaveManufacturer: (manufacturer: Manufacturer) => void;
  onDeleteManufacturer: (id: string) => void;
  onUpdateProductStockDetails: (productId: string, details: Partial<Product>) => void;
  onCreateManualOrder: (newOrder: Partial<Order>) => void;
  onQuickDeductStock: (productId: string, qty: number) => void;
  currentUser?: StaffUser;
  fullPage?: boolean;
  onNavigateToStock?: () => void;
  onNavigateToStore?: () => void;
  customers?: Customer[];
  onRefreshCustomers?: () => void;
  onAnonymizeCustomer?: (id: string) => Promise<void>;
  onDeleteCustomer?: (id: string) => Promise<void>;
}

type TabType =
  | 'usuarios'
  | 'clientes'
  | 'cupons'
  | 'pagina_primaria'
  | 'omnichannel'
  | 'envios'
  | 'fornecedores_estoque'
  | 'pagamentos'
  | 'empresa_seguranca'
  | 'produtos'
  | 'pedidos'
  | 'config'
  | 'metricas'
  | 'backup';

export const DirectorPanel: React.FC<DirectorPanelProps> = ({
  isOpen,
  onClose,
  products,
  settings,
  orders,
  suppliers,
  manufacturers,
  onSaveProducts,
  onSaveSettings,
  onResetDefaults,
  onUpdateOrderStatus,
  onDeleteOrder,
  onLogoutDirector,
  onSaveSupplier,
  onDeleteSupplier,
  onSaveManufacturer,
  onDeleteManufacturer,
  onUpdateProductStockDetails,
  onCreateManualOrder,
  onQuickDeductStock,
  currentUser,
  fullPage = false,
  onNavigateToStock,
  onNavigateToStore,
  customers = [],
  onRefreshCustomers,
  onAnonymizeCustomer,
  onDeleteCustomer,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('usuarios');
  const [isGeminiExportOpen, setIsGeminiExportOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [productForm, setProductForm] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 24.9,
    category: 'oversize',
    imageUrl: 'https://images.unsplash.com/photo-1582966772680-860e372bb558?w=800&auto=format&fit=crop&q=80',
    stockQuantity: 12,
    inStock: true,
    isFeatured: false,
    badge: 'Novo',
    fitType: 'Cano Alto 36-43',
    tamanhos: 'Único',
    custoUnitario: 10,
    precoVenda: 24.9,
    sku: '',
    supplierId: '',
    manufacturerId: '',
    minStockThreshold: 5,
    warehouseLocation: 'Gaveta A1',
  });

  const [localSettings, setLocalSettings] = useState<StoreSettings>(settings);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [isTestingMp, setIsTestingMp] = useState(false);
  const [mpTestResult, setMpTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showMpToken, setShowMpToken] = useState(false);
  const [showMpPublicKey, setShowMpPublicKey] = useState(false);

  const handleTestAndSaveMercadoPago = async () => {
    setIsTestingMp(true);
    setMpTestResult(null);
    try {
      const res = await fetch('/api/payment/mercadopago/save-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken: localSettings.mercadoPagoAccessToken,
          publicKey: localSettings.mercadoPagoPublicKey,
          environment: localSettings.mercadoPagoEnvironment || 'production',
          maxInstallments: localSettings.mercadoPagoMaxInstallments || 12,
          freeInstallments: localSettings.mercadoPagoFreeInstallments || 3,
          enabled: localSettings.mercadoPagoEnabled ?? true,
          cardGatewayUrl: localSettings.cardGatewayUrl,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMpTestResult({
          success: true,
          message: data.user
            ? `Autenticado com sucesso no Mercado Pago! Conta: ${data.user.nickname || data.user.firstName || 'Mercado Pago'} (${data.user.email || ''})`
            : data.message || 'Configurações salvas com sucesso!',
        });
        if (data.user) {
          const updated = {
            ...localSettings,
            mercadoPagoAccountName: data.user.nickname || `${data.user.firstName || ''} ${data.user.lastName || ''}`.trim() || 'Mercado Pago',
            mercadoPagoAccountEmail: data.user.email,
            mercadoPagoCollectorId: String(data.user.id),
          };
          setLocalSettings(updated);
          onSaveSettings(updated);
        }
        showNotification('Mercado Pago conectado e validado!');
      } else {
        setMpTestResult({
          success: false,
          message: data.error || 'Credenciais inválidas ou rejeitadas pelo Mercado Pago.',
        });
      }
    } catch {
      setMpTestResult({
        success: false,
        message: 'Erro de comunicação com o servidor ao conectar ao Mercado Pago.',
      });
    } finally {
      setIsTestingMp(false);
    }
  };

  React.useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  

  const showNotification = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(''), 3500);
  };

  const handleStartCreate = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      description: '',
      price: 24.9,
      category: 'oversize',
      imageUrl: 'https://images.unsplash.com/photo-1582966772680-860e372bb558?w=800&auto=format&fit=crop&q=80',
      stockQuantity: 10,
      inStock: true,
      isFeatured: false,
      badge: 'Novo',
      fitType: 'Cano Alto 36-43',
      tamanhos: 'Único',
      custoUnitario: 9.9,
      precoVenda: 24.9,
      tiktokShopUrl: settings.tiktokShopUrl,
      sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      supplierId: suppliers[0]?.id || '',
      manufacturerId: manufacturers[0]?.id || '',
      minStockThreshold: 5,
      warehouseLocation: 'Gaveta A1',
    });
    setIsCreatingNew(true);
  };

  const handleStartEdit = (prod: Product) => {
    setIsCreatingNew(false);
    setEditingProduct(prod);
    setProductForm({ ...prod });
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name) {
      alert('Informe o nome da peça');
      return;
    }

    const priceNum = Number(productForm.price) || 0;
    const custoNum = Number(productForm.custoUnitario) || 0;
    const stockNum = Number(productForm.stockQuantity) || 0;

    if (editingProduct) {
      const updated = products.map((p) =>
        p.id === editingProduct.id
          ? ({
              ...p,
              ...productForm,
              price: priceNum,
              precoVenda: priceNum,
              custoUnitario: custoNum,
              stockQuantity: stockNum,
              inStock: stockNum > 0,
            } as Product)
          : p
      );
      onSaveProducts(updated);
      showNotification(`Produto "${productForm.name}" atualizado com sucesso!`);
    } else {
      const newProd: Product = {
        id: `prod-${Date.now()}`,
        name: productForm.name || 'Nova Peça',
        description: productForm.description || '',
        price: priceNum,
        precoVenda: priceNum,
        custoUnitario: custoNum,
        category: productForm.category || 'oversize',
        imageUrl:
          productForm.imageUrl ||
          'https://images.unsplash.com/photo-1582966772680-860e372bb558?w=800&auto=format&fit=crop&q=80',
        stockQuantity: stockNum,
        inStock: stockNum > 0,
        isFeatured: Boolean(productForm.isFeatured),
        badge: productForm.badge || '',
        fitType: productForm.fitType || 'Cano Alto 36-43',
        tamanhos: productForm.tamanhos || 'Único',
        tiktokShopUrl: productForm.tiktokShopUrl || settings.tiktokShopUrl,
        sku: productForm.sku || `SKU-${Date.now().toString().slice(-5)}`,
        supplierId: productForm.supplierId || '',
        manufacturerId: productForm.manufacturerId || '',
        minStockThreshold: Number(productForm.minStockThreshold) || 5,
        warehouseLocation: productForm.warehouseLocation || 'Estoque Geral',
      };
      onSaveProducts([newProd, ...products]);
      showNotification(`Novo produto cadastrado com sucesso!`);
    }

    setEditingProduct(null);
    setIsCreatingNew(false);
  };

  const handleDeleteProduct = (id: string, name: string) => {
    if (confirm(`Tem certeza que deseja excluir "${name}"?`)) {
      const filtered = products.filter((p) => p.id !== id);
      onSaveProducts(filtered);
      showNotification(`Produto "${name}" removido.`);
    }
  };

  const handleSaveStoreSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(localSettings);
    showNotification('Configurações da loja e dados bancários salvos com sucesso!');
  };

  // Metrics
  const totalStockItems = products.reduce((acc, p) => acc + (p.stockQuantity || 0), 0);
  const totalStockCost = products.reduce(
    (acc, p) => acc + (p.stockQuantity || 0) * (p.custoUnitario || 0),
    0
  );
  const totalStockRetail = products.reduce(
    (acc, p) => acc + (p.stockQuantity || 0) * p.price,
    0
  );
  const totalOrdersAmount = orders.reduce((acc, o) => acc + (o.total || 0), 0);

  if (!isOpen) return null;

  return (
    <div
      className={
        fullPage
          ? 'min-h-screen bg-[#14011a] text-white flex flex-col'
          : 'fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-hidden'
      }
    >
      <div
        className={
          fullPage
            ? 'w-full flex-1 flex flex-col text-white'
            : 'bg-[#180220] border-2 border-pink-500/50 rounded-3xl w-full max-w-6xl max-h-[96vh] flex flex-col shadow-2xl overflow-hidden text-white'
        }
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#20032b] via-[#630b3a] to-[#0369a1] flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-pink-500/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-black/40 border border-amber-300/40 flex items-center justify-center text-xl shadow-inner shrink-0">
              🧦
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black font-fun tracking-wide flex items-center gap-2">
                <span>Painel de Administração da Loja</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-pink-600/80 text-white font-bold border border-pink-400">
                  ADM EXCLUSIVO
                </span>
              </h2>
              <p className="text-[11px] text-pink-100">
                Conectado como <strong className="text-amber-300">{currentUser?.name || 'Administrador Geral'}</strong> ({currentUser?.role === 'admin' ? 'Acesso Total' : 'Operador'})
              </p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {/* Botão de Exportação Completa para Gemini / Backup */}
            <button
              type="button"
              onClick={() => setIsGeminiExportOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white border border-pink-400/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-pink-500/20"
              title="Salvar e Exportar todos os dados para outro Gemini ou Baixar Backup"
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>Salvar Dados p/ Gemini</span>
            </button>

            {onNavigateToStock && (
              <button
                type="button"
                onClick={onNavigateToStock}
                className="px-3 py-1.5 rounded-xl bg-blue-950/80 hover:bg-blue-900 text-blue-200 border border-blue-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Abrir a página dedicada de estoque"
              >
                <Package className="w-3.5 h-3.5 text-blue-400" />
                <span>Sistema de Estoque</span>
              </button>
            )}

            {(onNavigateToStore || onClose) && (
              <button
                type="button"
                onClick={onNavigateToStore || onClose}
                className="px-3 py-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 text-purple-200 border border-purple-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Ver loja virtual"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Ver Loja Virtual</span>
              </button>
            )}

            <button
              type="button"
              onClick={onLogoutDirector}
              className="px-2.5 py-1.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-200 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer border border-rose-800/40"
              title="Encerrar sessão"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair</span>
            </button>

            {!fullPage && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Feedback Alert */}
        {feedbackMsg && (
          <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-bold text-center animate-fadeIn shadow-md">
            {feedbackMsg}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-purple-900/60 bg-[#14011b] px-3 pt-2 gap-1 overflow-x-auto scrollbar-none">
          {/* TAB: GESTÃO DE USUÁRIOS & LOGINS (EXCLUSIVO ADM) */}
          <button
            type="button"
            onClick={() => setActiveTab('usuarios')}
            className={`py-2.5 px-3.5 rounded-t-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'usuarios'
                ? 'bg-[#180220] text-amber-300 border-t-2 border-amber-400 font-black shadow-lg'
                : 'text-amber-200/80 hover:text-white bg-purple-950/40 hover:bg-purple-900/40'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span>Usuários & Logins</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-950 text-amber-300 border border-amber-600/60 font-mono font-bold">
              Exclusivo ADM
            </span>
          </button>

          {/* TAB: CLIENTES & LGPD (CONTAS CADASTRADAS NO BANCO DE DADOS) */}
          <button
            type="button"
            onClick={() => setActiveTab('clientes')}
            className={`py-2.5 px-3.5 rounded-t-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'clientes'
                ? 'bg-[#180220] text-emerald-300 border-t-2 border-emerald-400 font-black shadow-lg'
                : 'text-emerald-200/80 hover:text-white bg-purple-950/40 hover:bg-purple-900/40'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Clientes & LGPD</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-600/60 font-mono font-bold">
              {customers?.length || 0}
            </span>
          </button>

          {/* TAB: GESTÃO DE CUPONS (EXCLUSIVO ADM) */}
          <button
            type="button"
            onClick={() => setActiveTab('cupons')}
            className={`py-2.5 px-3.5 rounded-t-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'cupons'
                ? 'bg-[#180220] text-pink-300 border-t-2 border-pink-400 font-black shadow-lg'
                : 'text-pink-200/80 hover:text-white bg-purple-950/40 hover:bg-purple-900/40'
            }`}
          >
            <Tag className="w-3.5 h-3.5 text-pink-400" />
            <span>Cupons de Desconto</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-pink-950 text-pink-300 border border-pink-600/60 font-mono font-bold">
              {settings.coupons?.length || 0}
            </span>
          </button>

          {/* TAB: EDITAR PÁGINA PRIMÁRIA (TEXTOS & TUDO) */}
          <button
            type="button"
            onClick={() => setActiveTab('pagina_primaria')}
            className={`py-2.5 px-3.5 rounded-t-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'pagina_primaria'
                ? 'bg-[#180220] text-pink-300 border-t-2 border-pink-400 font-black shadow-lg'
                : 'text-purple-300/80 hover:text-white bg-purple-950/40 hover:bg-purple-900/40'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5 text-pink-400" />
            <span>Editar Página Primária</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-pink-950 text-pink-300 border border-pink-600/60 font-mono font-bold">
              Textos & Tudo
            </span>
          </button>

          {/* TAB: Omnichannel TikTok + Site */}
          <button
            onClick={() => setActiveTab('omnichannel')}
            className={`py-2.5 px-3 rounded-t-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'omnichannel'
                ? 'bg-[#180220] text-[#00f2fe] border-t-2 border-[#00f2fe] font-black'
                : 'text-purple-300/80 hover:text-white'
            }`}
          >
            <span>🎵</span>
            <span>Central TikTok & Site</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-pink-900 text-pink-200">
              {orders.length}
            </span>
          </button>

          {/* TAB: Logística & Envios Inteligentes */}
          <button
            onClick={() => setActiveTab('envios')}
            className={`py-2.5 px-3 rounded-t-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'envios'
                ? 'bg-[#180220] text-[#00f2fe] border-t-2 border-[#00f2fe] font-black'
                : 'text-purple-300/80 hover:text-white'
            }`}
          >
            <Truck className="w-3.5 h-3.5 text-[#00f2fe]" />
            <span>Logística & Envios</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700/60 font-mono">
              Econômico
            </span>
          </button>

          {/* TAB: Fornecedores & Estoque ADM */}
          <button
            onClick={() => setActiveTab('fornecedores_estoque')}
            className={`py-2.5 px-3 rounded-t-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'fornecedores_estoque'
                ? 'bg-[#180220] text-amber-300 border-t-2 border-amber-400 font-black'
                : 'text-purple-300/80 hover:text-white'
            }`}
          >
            <Boxes className="w-3.5 h-3.5 text-amber-400" />
            <span>Banco de Fornecedores & Estoque</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-purple-900 text-amber-300">
              {suppliers.length} forn.
            </span>
          </button>

          {/* TAB: Pagamentos & Contas */}
          <button
            onClick={() => setActiveTab('pagamentos')}
            className={`py-2.5 px-3 rounded-t-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'pagamentos'
                ? 'bg-[#180220] text-emerald-300 border-t-2 border-emerald-400 font-black'
                : 'text-purple-300/80 hover:text-white'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
            <span>Contas & Formas de Pagamento</span>
          </button>

          {/* TAB: Empresa, CNPJ & Selos de Segurança */}
          <button
            onClick={() => setActiveTab('empresa_seguranca')}
            className={`py-2.5 px-3.5 rounded-t-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'empresa_seguranca'
                ? 'bg-[#180220] text-amber-300 border-t-2 border-amber-400 font-black shadow-lg'
                : 'text-amber-200/80 hover:text-white bg-purple-950/40 hover:bg-purple-900/40'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>CNPJ, Contatos & Selos de Segurança</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-950 text-amber-300 border border-amber-600/60 font-mono font-bold">
              Novo
            </span>
          </button>

          {/* TAB: Produtos */}
          <button
            onClick={() => setActiveTab('produtos')}
            className={`py-2.5 px-3 rounded-t-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'produtos'
                ? 'bg-[#180220] text-pink-300 border-t-2 border-pink-500 font-black'
                : 'text-purple-300/80 hover:text-white'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Catálogo ({products.length})</span>
          </button>

          {/* TAB: Config Loja */}
          <button
            onClick={() => setActiveTab('config')}
            className={`py-2.5 px-3 rounded-t-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'config'
                ? 'bg-[#180220] text-white border-t-2 border-pink-500 font-black'
                : 'text-purple-300/80 hover:text-white'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Logo & Redes</span>
          </button>

          {/* TAB: Métricas */}
          <button
            onClick={() => setActiveTab('metricas')}
            className={`py-2.5 px-3 rounded-t-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'metricas'
                ? 'bg-[#180220] text-white border-t-2 border-pink-500 font-black'
                : 'text-purple-300/80 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Métricas & Caixa</span>
          </button>

          {/* TAB: Backup */}
          <button
            onClick={() => setActiveTab('backup')}
            className={`py-2.5 px-3 rounded-t-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'backup'
                ? 'bg-[#180220] text-white border-t-2 border-pink-500 font-black'
                : 'text-purple-300/80 hover:text-white'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Backup</span>
          </button>
        </div>

        {/* Tab Content Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#180220]">
          {/* TAB: GESTÃO DE USUÁRIOS & LOGINS (EXCLUSIVO ADM) */}
          {activeTab === 'usuarios' && (
            <UserManagerTab
              currentUser={
                currentUser || {
                  id: 'admin',
                  name: 'Administrador Geral',
                  username: 'admin',
                  password: '',
                  role: 'admin',
                  active: true,
                  createdAt: new Date().toISOString(),
                }
              }
            />
          )}

          {/* TAB: CLIENTES & LGPD (CONTAS CADASTRADAS NO BANCO DE DADOS) */}
          {activeTab === 'clientes' && (
            <CustomersManagerTab
              customers={customers || []}
              orders={orders}
              products={products}
              settings={settings}
              onRefresh={onRefreshCustomers || (() => {})}
              onAnonymizeCustomer={onAnonymizeCustomer || (async () => {})}
              onDeleteCustomer={onDeleteCustomer || (async () => {})}
            />
          )}

          {/* TAB: GESTÃO DE CUPONS (EXCLUSIVO ADM) */}
          {activeTab === 'cupons' && (
            <CouponsManagerTab
              settings={settings}
              onSaveSettings={(newSettings) => {
                onSaveSettings(newSettings);
                setLocalSettings(newSettings);
                showNotification('Cupons promocionais atualizados com sucesso!');
              }}
              currentUser={currentUser}
            />
          )}

          {/* TAB: EDITAR PÁGINA PRIMÁRIA (TEXTOS & TUDO) */}
          {activeTab === 'pagina_primaria' && (
            <PrimaryPageEditor
              settings={settings}
              onSaveSettings={(newSettings) => {
                onSaveSettings(newSettings);
                setLocalSettings(newSettings);
                showNotification('Página primária atualizada com sucesso!');
              }}
            />
          )}

          {/* TAB 1: OMNICHANNEL TIKTOK + SITE */}
          {activeTab === 'omnichannel' && (
            <OmnichannelHub
              orders={orders}
              products={products}
              settings={settings}
              onUpdateOrderStatus={onUpdateOrderStatus}
              onCreateManualOrder={onCreateManualOrder}
              onQuickDeductStock={onQuickDeductStock}
            />
          )}

          {/* TAB: LOGÍSTICA & FORMAS DE ENVIO ECONÔMICAS */}
          {activeTab === 'envios' && (
            <ShippingLogisticsPanel
              settings={settings}
              onSaveSettings={onSaveSettings}
              showNotification={showNotification}
            />
          )}

          {/* TAB 2: BANCO DE DADOS DE FORNECEDORES & ESTOQUE */}
          {activeTab === 'fornecedores_estoque' && (
            <div className="space-y-5">
              {onNavigateToStock && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950 via-indigo-950 to-purple-950 border border-blue-500/60 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-blue-900/60 border border-blue-400/50 text-blue-300 shrink-0 shadow-inner">
                      <Package className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-white text-sm font-bold flex items-center gap-2">
                        <span>Página Dedicada do Sistema de Estoque Integrado</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-600 text-white font-mono">
                          NOVA PÁGINA
                        </span>
                      </h4>
                      <p className="text-xs text-blue-200/80 mt-0.5">
                        Acesse a página própria para contagem rápida de inventário, reposição de prateleiras, filtros avançados e relatórios.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onNavigateToStock}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 text-slate-950 font-black text-xs shrink-0 cursor-pointer shadow-lg hover:scale-103 transition-transform flex items-center gap-1.5"
                  >
                    <span>Ir para Sistema de Estoque</span>
                    <Package className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <SuppliersStockDatabase
                products={products}
                suppliers={suppliers}
                manufacturers={manufacturers}
                onSaveSupplier={onSaveSupplier}
                onDeleteSupplier={onDeleteSupplier}
                onSaveManufacturer={onSaveManufacturer}
                onDeleteManufacturer={onDeleteManufacturer}
                onUpdateProductStockDetails={onUpdateProductStockDetails}
              />
            </div>
          )}

          {/* TAB 3: CONTAS & FORMAS DE PAGAMENTO */}
          {activeTab === 'pagamentos' && (
            <form onSubmit={handleSaveStoreSettings} className="max-w-3xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-purple-800/60">
                <div>
                  <h3 className="text-base font-bold font-fun text-white flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-emerald-400" />
                    <span>Configuração de Contas & Formas de Pagamento</span>
                  </h3>
                  <p className="text-xs text-purple-300/80">
                    Ajuste suas contas bancárias, chave Pix, gateways de cartão e integrações de pagamento direto.
                  </p>
                </div>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-emerald-600 text-white text-xs font-black shadow-lg hover:scale-103 transition-all cursor-pointer"
                >
                  Salvar Alterações de Contas
                </button>
              </div>

              {/* BLOK 1: PIX DIRETO */}
              <div className="p-5 rounded-2xl bg-[#14011b] border-2 border-pink-500/40 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-pink-950 border border-pink-700 flex items-center justify-center text-pink-300">
                      <QrCode className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">PIX Direto na Sacola</h4>
                      <p className="text-[11px] text-purple-300/80">
                        O cliente copia sua chave no checkout do site e faz a transferência instantânea.
                      </p>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-xs font-bold text-pink-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localSettings.enablePix}
                      onChange={(e) =>
                        setLocalSettings({ ...localSettings, enablePix: e.target.checked })
                      }
                      className="w-4 h-4 rounded text-pink-600"
                    />
                    <span>Ativar PIX no Site</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-purple-200 mb-1">
                      Chave PIX da Loja *
                    </label>
                    <input
                      type="text"
                      value={localSettings.pixKey || ''}
                      onChange={(e) =>
                        setLocalSettings({ ...localSettings, pixKey: e.target.value })
                      }
                      placeholder="Ex: 5511989055683 ou contato@doidasemeias.com.br"
                      className="w-full px-3 py-2 rounded-xl bg-[#1c0226] border border-purple-700 text-amber-300 font-mono text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-purple-200 mb-1">
                      Tipo de Chave
                    </label>
                    <select
                      value={localSettings.pixKeyType || 'telefone'}
                      onChange={(e) =>
                        setLocalSettings({
                          ...localSettings,
                          pixKeyType: e.target.value as StoreSettings['pixKeyType'],
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-[#1c0226] border border-purple-700 text-white text-xs font-bold"
                    >
                      <option value="telefone">Telefone (DDD + Número)</option>
                      <option value="cnpj">CNPJ</option>
                      <option value="cpf">CPF</option>
                      <option value="email">E-mail</option>
                      <option value="aleatoria">Chave Aleatória (EVP)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-purple-200 mb-1">
                      Nome do Titular / Razão Social
                    </label>
                    <input
                      type="text"
                      value={localSettings.pixBeneficiary || ''}
                      onChange={(e) =>
                        setLocalSettings({ ...localSettings, pixBeneficiary: e.target.value })
                      }
                      placeholder="Ex: Doidas e Meias Confecções Ltda"
                      className="w-full px-3 py-2 rounded-xl bg-[#1c0226] border border-purple-700 text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-purple-200 mb-1">
                      Banco / Instituição Financeira
                    </label>
                    <input
                      type="text"
                      value={localSettings.pixBank || ''}
                      onChange={(e) =>
                        setLocalSettings({ ...localSettings, pixBank: e.target.value })
                      }
                      placeholder="Ex: Nubank, Mercado Pago, Inter, Cora..."
                      className="w-full px-3 py-2 rounded-xl bg-[#1c0226] border border-purple-700 text-white text-xs"
                    />
                  </div>

                  <div className="sm:col-span-2 pt-2 border-t border-purple-800/40">
                    <label className="block text-[11px] font-bold text-emerald-400 mb-1 flex items-center justify-between">
                      <span>⚡ Desconto Automático no Pagamento via PIX (%)</span>
                      <span className="text-[10px] text-purple-300 font-normal">Aplicado diretamente no checkout e vitrine</span>
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min={0}
                        max={50}
                        step={1}
                        value={localSettings.pixDiscountPercentage ?? 5}
                        onChange={(e) =>
                          setLocalSettings({
                            ...localSettings,
                            pixDiscountPercentage: Number(e.target.value),
                          })
                        }
                        className="w-32 px-3 py-2 rounded-xl bg-[#1c0226] border border-emerald-500 text-emerald-300 font-mono text-sm font-bold"
                      />
                      <span className="text-xs text-purple-200">
                        % de desconto concedido ao cliente que escolher PIX (Ex: <strong>5%</strong>)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* BLOK 2: CARTÃO DE CRÉDITO & GATEWAY */}
              <div className="p-5 rounded-2xl bg-[#14011b] border-2 border-cyan-500/40 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-cyan-950 border border-cyan-700 flex items-center justify-center text-cyan-300">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">Cartão de Crédito & Gateway Online</h4>
                      <p className="text-[11px] text-purple-300/80">
                        Permita pagamento via link ou maquininha com parcelamento para as clientes.
                      </p>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-xs font-bold text-cyan-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localSettings.enableCard}
                      onChange={(e) =>
                        setLocalSettings({ ...localSettings, enableCard: e.target.checked })
                      }
                      className="w-4 h-4 rounded text-cyan-600"
                    />
                    <span>Ativar Cartão no Site</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-purple-200 mb-1">
                      Operadora / Gateway de Pagamento
                    </label>
                    <input
                      type="text"
                      value={localSettings.cardGatewayName || ''}
                      onChange={(e) =>
                        setLocalSettings({ ...localSettings, cardGatewayName: e.target.value })
                      }
                      placeholder="Ex: Mercado Pago, InfinitePay, PagSeguro..."
                      className="w-full px-3 py-2 rounded-xl bg-[#1c0226] border border-purple-700 text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-purple-200 mb-1">
                      Texto de Parcelamento para o Cliente
                    </label>
                    <input
                      type="text"
                      value={localSettings.cardInstallmentsInfo || ''}
                      onChange={(e) =>
                        setLocalSettings({ ...localSettings, cardInstallmentsInfo: e.target.value })
                      }
                      placeholder="Ex: Em até 3x sem juros ou 12x com acréscimo"
                      className="w-full px-3 py-2 rounded-xl bg-[#1c0226] border border-purple-700 text-white text-xs"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-purple-200 mb-1">
                      Link de Pagamento Online Direto (Opcional)
                    </label>
                    <input
                      type="url"
                      value={localSettings.cardGatewayUrl || ''}
                      onChange={(e) =>
                        setLocalSettings({ ...localSettings, cardGatewayUrl: e.target.value })
                      }
                      placeholder="https://mpago.la/... ou https://link.infinitepay.io/..."
                      className="w-full px-3 py-2 rounded-xl bg-[#1c0226] border border-purple-700 text-cyan-300 font-mono text-xs"
                    />
                    <p className="text-[10px] text-purple-300/60 mt-1">
                      Se você colocar um link do Mercado Pago ou InfinitePay, a cliente poderá abrir diretamente na tela de pagamento.
                    </p>
                  </div>
                </div>
              </div>

              {/* BLOK 3: TIKTOK SHOP & WHATSAPP */}
              <div className="p-5 rounded-2xl bg-[#14011b] border-2 border-purple-600/40 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">🎵</span>
                    <div>
                      <h4 className="font-bold text-sm text-white">Canal TikTok Shop Oficial</h4>
                      <p className="text-[11px] text-purple-300/80">
                        Link de redirecionamento para o perfil e catálogo do TikTok Shop.
                      </p>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-xs font-bold text-purple-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localSettings.enableTikTokShop}
                      onChange={(e) =>
                        setLocalSettings({ ...localSettings, enableTikTokShop: e.target.checked })
                      }
                      className="w-4 h-4 rounded text-pink-600"
                    />
                    <span>Destacar TikTok</span>
                  </label>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-purple-200 mb-1">
                    URL do Perfil / Vitrine no TikTok Shop
                  </label>
                  <input
                    type="url"
                    value={localSettings.tiktokShopUrl}
                    onChange={(e) =>
                      setLocalSettings({ ...localSettings, tiktokShopUrl: e.target.value })
                    }
                    placeholder="https://www.tiktok.com/@doidasemeias"
                    className="w-full px-3 py-2 rounded-xl bg-[#1c0226] border border-purple-700 text-white font-mono text-xs"
                  />
                </div>
              </div>

              {/* BLOK 5: CUPOM DE DESCONTO & CAMPANHAS (MÍNIMO R$ 150) */}
              <div className="p-5 rounded-2xl bg-[#14011b] border-2 border-pink-500/50 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-pink-950 border border-pink-700 flex items-center justify-center text-pink-300 shrink-0">
                      <Gift className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white flex items-center gap-2 flex-wrap">
                        <span>Cupom de Boas-Vindas & Desconto no Checkout</span>
                        <span className="text-[10px] bg-pink-500/20 text-pink-300 border border-pink-500/40 px-2.5 py-0.5 rounded-full font-bold">
                          Regra: A partir de R$ 150,00
                        </span>
                      </h4>
                      <p className="text-[11px] text-purple-300/80">
                        Configure o código do cupom oferecido aos clientes cadastrados e o valor mínimo de compra para ativar o desconto.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-purple-200 mb-1">
                      Código do Cupom de Boas-Vindas
                    </label>
                    <input
                      type="text"
                      value={localSettings.welcomeCouponCode || 'BEMVINDA10'}
                      onChange={(e) =>
                        setLocalSettings({
                          ...localSettings,
                          welcomeCouponCode: e.target.value.toUpperCase().replace(/\s+/g, ''),
                        })
                      }
                      placeholder="BEMVINDA10"
                      className="w-full px-3 py-2 rounded-xl bg-[#1c0226] border border-purple-700 text-amber-300 font-mono text-xs font-bold uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-purple-200 mb-1">
                      Desconto do Cupom (%)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={90}
                      value={localSettings.welcomeCouponDiscountPercentage ?? 10}
                      onChange={(e) =>
                        setLocalSettings({
                          ...localSettings,
                          welcomeCouponDiscountPercentage: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-[#1c0226] border border-purple-700 text-white font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-pink-400 mb-1 flex items-center justify-between">
                      <span>Valor Mínimo do Pedido (R$) *</span>
                      <span className="text-[10px] text-pink-300 font-normal">A partir de</span>
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={localSettings.welcomeCouponMinOrder ?? 150}
                      onChange={(e) =>
                        setLocalSettings({
                          ...localSettings,
                          welcomeCouponMinOrder: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-[#1c0226] border-2 border-pink-500 text-pink-300 font-mono text-sm font-bold"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-pink-950/30 border border-pink-800/40 text-[11px] text-pink-200 flex items-start gap-2">
                  <Tag className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
                  <div>
                    <strong>Regra em vigor na loja:</strong> O cupom{' '}
                    <span className="font-mono text-amber-300 font-bold bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-700/50">
                      {localSettings.welcomeCouponCode || 'BEMVINDA10'}
                    </span>{' '}
                    concede {localSettings.welcomeCouponDiscountPercentage ?? 10}% de desconto exclusivamente quando o subtotal da sacola for igual ou superior a{' '}
                    <strong className="text-white underline">
                      R$ {(localSettings.welcomeCouponMinOrder ?? 150).toFixed(2).replace('.', ',')}
                    </strong>. Pedidos abaixo desse valor exibem aviso amigável avisando quanto falta para desbloquear o desconto.
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-[#00f2fe] text-white text-xs font-black shadow-xl hover:scale-102 transition-all cursor-pointer"
                >
                  Salvar Todas as Configurações de Pagamento
                </button>
              </div>
            </form>
          )}

          {/* TAB: EMPRESA, CNPJ, CONTATOS & SELOS DE SEGURANÇA */}
          {activeTab === 'empresa_seguranca' && (
            <form onSubmit={handleSaveStoreSettings} className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-purple-800/60">
                <div>
                  <h3 className="text-base font-bold font-fun text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-amber-400" />
                    <span>Empresa, CNPJ, Contatos & Selos de Compra Segura</span>
                  </h3>
                  <p className="text-xs text-purple-300/80">
                    Altere facilmente seu CNPJ, telefones de suporte e configure os selos de segurança para transmitir 100% de credibilidade aos seus clientes.
                  </p>
                </div>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-pink-600 text-white text-xs font-black shadow-md hover:scale-102 transition-all cursor-pointer shrink-0"
                >
                  Salvar Alterações
                </button>
              </div>

              {/* CARD 1: DADOS CADASTRAIS & CNPJ (CONFORMIDADE LEI DO E-COMMERCE) */}
              <div className="p-5 rounded-2xl bg-[#14011b] border-2 border-amber-500/40 space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-950 border border-amber-600 flex items-center justify-center text-amber-400 shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">Dados Cadastrais & CNPJ da Empresa</h4>
                    <p className="text-[11px] text-purple-300/80">
                      Conformidade legal com a Lei do E-commerce (Decreto Federal nº 7.962/2013).
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-amber-300 mb-1 flex items-center justify-between">
                      <span>CNPJ da Loja / Empresa *</span>
                      {localSettings.cnpj && (
                        <a
                          href={localSettings.cnpjLookupUrl || 'https://solucoes.receita.fazenda.gov.br/Servicos/cnpjreva/cnpjreva_solicitacao.asp'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-pink-400 hover:text-pink-300 underline inline-flex items-center gap-0.5"
                        >
                          <span>Consultar na Receita</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </label>
                    <input
                      type="text"
                      required
                      value={localSettings.cnpj || ''}
                      onChange={(e) =>
                        setLocalSettings({ ...localSettings, cnpj: e.target.value })
                      }
                      placeholder="Ex: 52.819.340/0001-92"
                      className="w-full px-3 py-2.5 rounded-xl bg-[#1c0226] border border-amber-500/80 text-amber-300 font-mono text-sm font-bold placeholder-purple-400/50"
                    />
                    <p className="text-[10px] text-purple-300/60 mt-1">
                      Você pode alterar o CNPJ a qualquer momento. Ele atualizará o rodapé, o checkout seguro e o comprovante do pedido.
                    </p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-purple-200 mb-1">
                      Razão Social Oficial (Nome Empresarial Registrado) *
                    </label>
                    <input
                      type="text"
                      required
                      value={localSettings.companyLegalName || ''}
                      onChange={(e) =>
                        setLocalSettings({ ...localSettings, companyLegalName: e.target.value })
                      }
                      placeholder="Ex: Doidas e Meias Confecções e Comércio do Brasil Ltda"
                      className="w-full px-3 py-2.5 rounded-xl bg-[#1c0226] border border-purple-700 text-white text-xs font-semibold placeholder-purple-400/50"
                    />
                    <p className="text-[10px] text-purple-300/60 mt-1">
                      Nome jurídico da empresa conforme consta no cartão do CNPJ.
                    </p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-purple-200 mb-1">
                      Nome Fantasia (Marca Comercial)
                    </label>
                    <input
                      type="text"
                      value={localSettings.companyTradeName || ''}
                      onChange={(e) =>
                        setLocalSettings({ ...localSettings, companyTradeName: e.target.value })
                      }
                      placeholder="Ex: Doidas e Meias"
                      className="w-full px-3 py-2 rounded-xl bg-[#1c0226] border border-purple-700 text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-purple-200 mb-1">
                      Inscrição Estadual (IE)
                    </label>
                    <input
                      type="text"
                      value={localSettings.stateRegistration || ''}
                      onChange={(e) =>
                        setLocalSettings({ ...localSettings, stateRegistration: e.target.value })
                      }
                      placeholder="Ex: Isento ou 123.456.789.000"
                      className="w-full px-3 py-2 rounded-xl bg-[#1c0226] border border-purple-700 text-white text-xs font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-purple-200 mb-1">
                      Endereço Completo da Sede / Centro de Distribuição *
                    </label>
                    <input
                      type="text"
                      value={localSettings.companyAddress || ''}
                      onChange={(e) =>
                        setLocalSettings({ ...localSettings, companyAddress: e.target.value })
                      }
                      placeholder="Ex: Rua das Flores, 120, Sala 3 - Centro, São Paulo - SP, CEP 01001-000"
                      className="w-full px-3 py-2.5 rounded-xl bg-[#1c0226] border border-purple-700 text-white text-xs placeholder-purple-400/50"
                    />
                    <p className="text-[10px] text-purple-300/60 mt-1">
                      Obrigatório por lei para lojas virtuais e essencial para gerar credibilidade nos clientes.
                    </p>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-purple-200 mb-1">
                      Link para Consulta Pública do CNPJ (Receita Federal / Redesim)
                    </label>
                    <input
                      type="url"
                      value={localSettings.cnpjLookupUrl || ''}
                      onChange={(e) =>
                        setLocalSettings({ ...localSettings, cnpjLookupUrl: e.target.value })
                      }
                      placeholder="https://solucoes.receita.fazenda.gov.br/Servicos/cnpjreva/cnpjreva_solicitacao.asp"
                      className="w-full px-3 py-2 rounded-xl bg-[#1c0226] border border-purple-700 text-pink-300 font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* CARD 2: CANAIS DE CONTATO & TELEFONES */}
              <div className="p-5 rounded-2xl bg-[#14011b] border-2 border-emerald-500/40 space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-950 border border-emerald-600 flex items-center justify-center text-emerald-400 shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">Canais de Contato & Telefones Oficiais</h4>
                    <p className="text-[11px] text-purple-300/80">
                      Telefones de atendimento, suporte pós-venda e canais exibidos aos compradores.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-emerald-400 mb-1">
                      WhatsApp para Pedidos (com DDI 55) *
                    </label>
                    <input
                      type="text"
                      required
                      value={localSettings.whatsappNumber || ''}
                      onChange={(e) =>
                        setLocalSettings({ ...localSettings, whatsappNumber: e.target.value })
                      }
                      placeholder="Ex: 5511989055683"
                      className="w-full px-3 py-2 rounded-xl bg-[#1c0226] border border-emerald-500 text-white font-mono font-bold"
                    />
                    <p className="text-[10px] text-purple-300/60 mt-1">
                      Somente números. Usado nos botões automáticos do site.
                    </p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-purple-200 mb-1">
                      WhatsApp Formatado (Visível na Loja)
                    </label>
                    <input
                      type="text"
                      value={localSettings.whatsappDisplay || ''}
                      onChange={(e) =>
                        setLocalSettings({ ...localSettings, whatsappDisplay: e.target.value })
                      }
                      placeholder="Ex: (11) 97520-8196"
                      className="w-full px-3 py-2 rounded-xl bg-[#1c0226] border border-purple-700 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-purple-200 mb-1">
                      Telefone SAC / Suporte Secundário
                    </label>
                    <input
                      type="text"
                      value={localSettings.supportPhone || ''}
                      onChange={(e) =>
                        setLocalSettings({ ...localSettings, supportPhone: e.target.value })
                      }
                      placeholder="Ex: (11) 97520-8196 ou 0800..."
                      className="w-full px-3 py-2 rounded-xl bg-[#1c0226] border border-purple-700 text-white font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-purple-200 mb-1">
                      E-mail Oficial de Contato / SAC
                    </label>
                    <input
                      type="email"
                      value={localSettings.contactEmail || ''}
                      onChange={(e) =>
                        setLocalSettings({ ...localSettings, contactEmail: e.target.value })
                      }
                      placeholder="Ex: contato@doidasemeias.com.br"
                      className="w-full px-3 py-2 rounded-xl bg-[#1c0226] border border-purple-700 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-purple-200 mb-1">
                      Horário de Atendimento
                    </label>
                    <input
                      type="text"
                      value={localSettings.supportHours || ''}
                      onChange={(e) =>
                        setLocalSettings({ ...localSettings, supportHours: e.target.value })
                      }
                      placeholder="Ex: Segunda a Sábado, das 09h às 19h"
                      className="w-full px-3 py-2 rounded-xl bg-[#1c0226] border border-purple-700 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* CARD 3: SELOS DE SEGURANÇA & COMPRA SEGURA (CONTROLE DE EXIBIÇÃO) */}
              <div className="p-5 rounded-2xl bg-[#14011b] border-2 border-cyan-500/40 space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-cyan-950 border border-cyan-600 flex items-center justify-center text-cyan-400 shrink-0">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">Selos de Compra Segura & Criptografia</h4>
                    <p className="text-[11px] text-purple-300/80">
                      Estes selos são exibidos no rodapé do site e durante a confirmação no carrinho de compras.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Selo SSL */}
                  <label className="p-3 rounded-xl bg-[#1c0226] border border-purple-800/80 flex items-start gap-3 cursor-pointer hover:border-cyan-500/60 transition-colors">
                    <input
                      type="checkbox"
                      checked={localSettings.enableSslSeal ?? true}
                      onChange={(e) =>
                        setLocalSettings({ ...localSettings, enableSslSeal: e.target.checked })
                      }
                      className="w-4 h-4 rounded text-cyan-600 mt-0.5 shrink-0"
                    />
                    <div>
                      <span className="font-bold text-white block">Selo SSL 256-Bit (Criptografia Ativa)</span>
                      <span className="text-[11px] text-purple-300/70 block">
                        Mostra ao cliente que o site opera com protocolo HTTPS seguro e dados criptografados.
                      </span>
                    </div>
                  </label>

                  {/* Selo Pagamento Seguro */}
                  <label className="p-3 rounded-xl bg-[#1c0226] border border-purple-800/80 flex items-start gap-3 cursor-pointer hover:border-cyan-500/60 transition-colors">
                    <input
                      type="checkbox"
                      checked={localSettings.enableSafePaymentSeal ?? true}
                      onChange={(e) =>
                        setLocalSettings({
                          ...localSettings,
                          enableSafePaymentSeal: e.target.checked,
                        })
                      }
                      className="w-4 h-4 rounded text-cyan-600 mt-0.5 shrink-0"
                    />
                    <div>
                      <span className="font-bold text-white block">Selo Compra Segura / Gateways Verificados</span>
                      <span className="text-[11px] text-purple-300/70 block">
                        Destaca o processamento seguro de pagamentos com proteção contra fraudes.
                      </span>
                    </div>
                  </label>

                  {/* Selo CNPJ Verificado */}
                  <label className="p-3 rounded-xl bg-[#1c0226] border border-purple-800/80 flex items-start gap-3 cursor-pointer hover:border-cyan-500/60 transition-colors">
                    <input
                      type="checkbox"
                      checked={localSettings.enableCnpjVerifiedSeal ?? true}
                      onChange={(e) =>
                        setLocalSettings({
                          ...localSettings,
                          enableCnpjVerifiedSeal: e.target.checked,
                        })
                      }
                      className="w-4 h-4 rounded text-cyan-600 mt-0.5 shrink-0"
                    />
                    <div>
                      <span className="font-bold text-white block">Selo Empresa Registrada & CNPJ Regular</span>
                      <span className="text-[11px] text-purple-300/70 block">
                        Exibe o CNPJ com link direto para consulta de situação cadastral na Receita Federal.
                      </span>
                    </div>
                  </label>

                  {/* Selo CDC 7 Dias */}
                  <label className="p-3 rounded-xl bg-[#1c0226] border border-purple-800/80 flex items-start gap-3 cursor-pointer hover:border-cyan-500/60 transition-colors">
                    <input
                      type="checkbox"
                      checked={localSettings.enableSatisfactionSeal ?? true}
                      onChange={(e) =>
                        setLocalSettings({
                          ...localSettings,
                          enableSatisfactionSeal: e.target.checked,
                        })
                      }
                      className="w-4 h-4 rounded text-cyan-600 mt-0.5 shrink-0"
                    />
                    <div>
                      <span className="font-bold text-white block">Selo 7 Dias de Garantia (Art. 49 CDC)</span>
                      <span className="text-[11px] text-purple-300/70 block">
                        Garante o direito de arrependimento e troca garantida para o consumidor.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* CARD 4: GUIA COMPLETO "COMO CONSEGUIR O SELO DE COMPRA SEGURA" */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-[#1b0226] via-[#14011b] to-[#12001a] border-2 border-pink-500/40 space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-pink-950 border border-pink-600 flex items-center justify-center text-pink-400 shrink-0 shadow-sm">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white flex items-center gap-2">
                      <span>Guia Prático: Como Conseguir Selos de Segurança Oficiais</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-900 text-pink-200 font-mono">
                        Dicas Oficiais
                      </span>
                    </h4>
                    <p className="text-[11px] text-purple-300/80">
                      Entenda como funciona cada tipo de selo de segurança no Brasil e como obter para o seu novo CNPJ:
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {/* Item 1: SSL */}
                  <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-800/60 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-300">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>1. Certificado SSL / HTTPS (256-bit)</span>
                    </div>
                    <p className="text-[11px] text-purple-200/80 leading-relaxed">
                      <strong>Já está ativo na sua loja!</strong> Toda a comunicação com a sua loja é protegida por criptografia SSL/TLS de ponta a ponta fornecida pelos servidores Google Cloud. O cliente vê o cadeado verde no navegador automaticamente.
                    </p>
                  </div>

                  {/* Item 2: Gateways */}
                  <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-800/60 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-cyan-300">
                      <CreditCard className="w-4 h-4 text-cyan-400" />
                      <span>2. Selo de Gateway (Mercado Pago / PagSeguro)</span>
                    </div>
                    <p className="text-[11px] text-purple-200/80 leading-relaxed">
                      <strong>Como obter:</strong> Ao cadastrar seu CNPJ no Mercado Pago, PagBank ou InfinitePay, você tem direito de usar os selos oficiais de <em>Compra Protegida</em> e <em>Pagamento Garantido</em> fornecidos pelo próprio gateway no painel de lojista.
                    </p>
                  </div>

                  {/* Item 3: Ebit */}
                  <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-800/60 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-amber-300">
                      <Award className="w-4 h-4 text-amber-400" />
                      <span>3. Selo Ebit / Nielsen (Gratuito)</span>
                    </div>
                    <p className="text-[11px] text-purple-200/80 leading-relaxed">
                      <strong>Como obter:</strong> Acesse <span className="text-amber-200 underline font-mono">ebit.com.br/para-empresas</span> e cadastre o CNPJ da sua loja. O Ebit envia pesquisas de satisfação e premia sua loja com as medalhas oficiais (Bronze, Prata, Ouro e Diamante).
                    </p>
                  </div>

                  {/* Item 4: Reclame Aqui */}
                  <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-800/60 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-pink-300">
                      <CheckCircle className="w-4 h-4 text-pink-400" />
                      <span>4. Selo Reclame Aqui (RA Verificada)</span>
                    </div>
                    <p className="text-[11px] text-purple-200/80 leading-relaxed">
                      <strong>Como obter:</strong> Cadastre sua empresa no Reclame Aqui para Empresas. Ao manter um atendimento rápido aos clientes, você pode solicitar a certificação <em>RA Verificada</em> que audita a existência do seu CNPJ e sede.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-950/50 border border-amber-500/50 flex items-start gap-2.5 text-xs text-amber-200">
                  <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed">
                    <strong>Dica de ouro:</strong> No Brasil, o fator número 1 de confiança no e-commerce é a presença clara do <strong>CNPJ, Razão Social, Endereço e Telefone</strong> no rodapé com link para o site da Receita Federal. Nossa plataforma já faz isso de forma 100% automatizada assim que você salvar os campos acima!
                  </p>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-[#00f2fe] text-white text-xs font-black shadow-xl hover:scale-102 transition-all cursor-pointer"
                >
                  Salvar Dados da Empresa, CNPJ & Selos de Segurança
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: PRODUTOS & CATÁLOGO */}
          {activeTab === 'produtos' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-purple-800/60">
                <div>
                  <h3 className="text-base font-bold font-fun text-white">
                    Catálogo de Produtos ({products.length} itens)
                  </h3>
                  <p className="text-xs text-purple-300/70">
                    Cadastre modelos de meias, fotos, estoque e tamanhos
                  </p>
                </div>

                <button
                  onClick={handleStartCreate}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white text-xs font-black flex items-center gap-1.5 shadow-lg hover:scale-103 transition-all cursor-pointer w-fit"
                >
                  <Plus className="w-4 h-4" />
                  <span>Novo Produto</span>
                </button>
              </div>

              {/* Form Modal for Add/Edit Product */}
              {(isCreatingNew || editingProduct) && (
                <div className="p-5 rounded-2xl bg-[#1c0324] border-2 border-pink-500/60 shadow-xl space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-purple-800">
                    <h4 className="font-bold text-sm text-amber-300 font-fun">
                      {isCreatingNew ? '+ Adicionar Novo Produto' : `Editar: ${editingProduct?.name}`}
                    </h4>
                    <button
                      onClick={() => {
                        setIsCreatingNew(false);
                        setEditingProduct(null);
                      }}
                      className="p-1 rounded-lg hover:bg-purple-900 text-purple-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveProduct} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-purple-200 mb-1">Nome do Produto *</label>
                      <input
                        type="text"
                        required
                        value={productForm.name}
                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                        placeholder="Ex: Meia do Seu José Maluquete"
                        className="w-full px-3 py-2 rounded-xl bg-[#14021a] border border-purple-700 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-purple-200 mb-1">Código SKU</label>
                      <input
                        type="text"
                        value={productForm.sku || ''}
                        onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                        placeholder="SKU-1001"
                        className="w-full px-3 py-2 rounded-xl bg-[#14021a] border border-purple-700 text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-purple-200 mb-1">Preço de Venda (R$) *</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={productForm.price}
                        onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl bg-[#14021a] border border-purple-700 text-amber-300 font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-purple-200 mb-1">Custo de Fabricação (R$)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={productForm.custoUnitario || 0}
                        onChange={(e) => setProductForm({ ...productForm, custoUnitario: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl bg-[#14021a] border border-purple-700 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-purple-200 mb-1">Estoque Físico (Pares)</label>
                      <input
                        type="number"
                        value={productForm.stockQuantity || 0}
                        onChange={(e) => setProductForm({ ...productForm, stockQuantity: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl bg-[#14021a] border border-purple-700 text-white font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-purple-200 mb-1">Categoria</label>
                      <select
                        value={productForm.category}
                        onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-[#14021a] border border-purple-700 text-white"
                      >
                        <option value="oversize">Oversize</option>
                        <option value="cropped">Cropped</option>
                        <option value="meias">Meias</option>
                        <option value="kits">Kits & Combos</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-purple-200 mb-1">Fornecedor Responsável</label>
                      <select
                        value={productForm.supplierId || ''}
                        onChange={(e) => setProductForm({ ...productForm, supplierId: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-[#14021a] border border-purple-700 text-white"
                      >
                        <option value="">Selecione o Fornecedor...</option>
                        {suppliers.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.tradeName} ({s.contactName})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-purple-200 mb-1">Localização no Depósito</label>
                      <input
                        type="text"
                        value={productForm.warehouseLocation || ''}
                        onChange={(e) => setProductForm({ ...productForm, warehouseLocation: e.target.value })}
                        placeholder="Ex: Prateleira 2 / Gaveta A"
                        className="w-full px-3 py-2 rounded-xl bg-[#14021a] border border-purple-700 text-white"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-[11px] font-bold text-purple-200 mb-1">URL da Imagem da Peça</label>
                      <input
                        type="url"
                        value={productForm.imageUrl}
                        onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                        placeholder="https://..."
                        className="w-full px-3 py-2 rounded-xl bg-[#14021a] border border-purple-700 text-white font-mono"
                      />
                    </div>

                    <div className="sm:col-span-3 flex justify-end gap-2 pt-2 border-t border-purple-800">
                      <button
                        type="button"
                        onClick={() => {
                          setIsCreatingNew(false);
                          setEditingProduct(null);
                        }}
                        className="px-4 py-2 rounded-xl bg-purple-950 text-purple-300 font-bold"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-black"
                      >
                        Salvar Produto
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Table of Products */}
              <div className="rounded-2xl border border-purple-800/60 overflow-hidden bg-[#15021c]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#100116] border-b border-purple-800 text-purple-300 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Peça</th>
                      <th className="p-3">SKU</th>
                      <th className="p-3">Categoria</th>
                      <th className="p-3">Preço</th>
                      <th className="p-3">Estoque</th>
                      <th className="p-3 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-900/40">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-purple-900/20">
                        <td className="p-3">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={p.imageUrl}
                              alt={p.name}
                              className="w-10 h-10 rounded-lg object-cover bg-black shrink-0"
                            />
                            <div>
                              <strong className="text-white block">{p.name}</strong>
                              <span className="text-[10px] text-purple-300/70">{p.tamanhos || p.fitType}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 font-mono text-[11px] text-purple-300">{p.sku || 'N/A'}</td>
                        <td className="p-3 text-purple-300">{p.category}</td>
                        <td className="p-3 font-bold text-amber-300 font-fun">
                          R$ {Number(p.price).toFixed(2).replace('.', ',')}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                              p.stockQuantity > 0
                                ? p.stockQuantity <= 5
                                  ? 'bg-amber-950 text-amber-300 border border-amber-700'
                                  : 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                                : 'bg-rose-950 text-rose-300 border border-rose-700'
                            }`}
                          >
                            {p.stockQuantity} un.
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleStartEdit(p)}
                              className="p-1.5 rounded-lg bg-purple-900 hover:bg-purple-800 text-white"
                              title="Editar"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id, p.name)}
                              className="p-1.5 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-300"
                              title="Excluir"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: LOGO & REDES SOCIAIS */}
          {activeTab === 'config' && (
            <form onSubmit={handleSaveStoreSettings} className="space-y-5 max-w-2xl">
              <div>
                <h3 className="text-base font-bold font-fun text-white">
                  Logotipo, Mascotes e Redes da Loja
                </h3>
                <p className="text-xs text-purple-300/70">
                  Altere a logo visual, slogans, WhatsApp e links sociais exibidos no site
                </p>
              </div>

              {/* LOGO SECTION - GERENCIAMENTO E UPLOAD DE LOGO */}
              <LogoManager
                currentLogoUrl={localSettings.heroMascotUrl}
                onLogoChange={(newUrl) => {
                  const updated = {
                    ...localSettings,
                    heroMascotUrl: newUrl,
                  };
                  setLocalSettings(updated);
                  onSaveSettings(updated);
                  showNotification('Logo atualizada com sucesso em todo o site!');
                }}
                onShowToast={(msg) => showNotification(msg)}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-purple-200 mb-1">Nome da Loja</label>
                  <input
                    type="text"
                    value={localSettings.storeName}
                    onChange={(e) => setLocalSettings({ ...localSettings, storeName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#1b0222] border border-purple-700 text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-purple-200 mb-1">Slogan / Tagline</label>
                  <input
                    type="text"
                    value={localSettings.tagline}
                    onChange={(e) => setLocalSettings({ ...localSettings, tagline: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#1b0222] border border-purple-700 text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-purple-200 mb-1">WhatsApp da Loja (com 55) *</label>
                  <input
                    type="text"
                    required
                    value={localSettings.whatsappNumber}
                    onChange={(e) => setLocalSettings({ ...localSettings, whatsappNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#1b0222] border border-purple-700 text-white font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-purple-200 mb-1">WhatsApp Formatado</label>
                  <input
                    type="text"
                    value={localSettings.whatsappDisplay}
                    onChange={(e) => setLocalSettings({ ...localSettings, whatsappDisplay: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#1b0222] border border-purple-700 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-purple-200 mb-1">Instagram Oficial</label>
                  <input
                    type="url"
                    value={localSettings.instagramUrl}
                    onChange={(e) => setLocalSettings({ ...localSettings, instagramUrl: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#1b0222] border border-purple-700 text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-purple-200 mb-1">
                    Senha / PIN Secreto da Direção
                  </label>
                  <input
                    type="password"
                    value={localSettings.adminPin || '649309'}
                    onChange={(e) => setLocalSettings({ ...localSettings, adminPin: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#1b0222] border border-purple-700 text-amber-300 font-mono text-center font-bold tracking-widest"
                  />
                  <p className="text-[10px] text-purple-300/70 mt-1">
                    Defina aqui a senha secreta usada para entrar no painel do administrador.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white text-xs font-black shadow-lg hover:scale-102 transition-all cursor-pointer"
                >
                  Salvar Informações da Loja
                </button>
              </div>
            </form>
          )}

          {/* TAB 6: MÉTRICAS */}
          {activeTab === 'metricas' && (
            <div className="space-y-5">
              <h3 className="text-base font-bold font-fun text-white">
                Resumo Financeiro & Estoque
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-4 rounded-2xl bg-[#16021e] border border-purple-800">
                  <span className="text-purple-300 font-bold block text-[11px]">Total em Estoque</span>
                  <span className="text-2xl font-black text-amber-300 font-fun block mt-1">
                    {totalStockItems} pares
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#16021e] border border-purple-800">
                  <span className="text-purple-300 font-bold block text-[11px]">Custo Total do Estoque</span>
                  <span className="text-xl font-black text-rose-300 font-fun block mt-1">
                    R$ {totalStockCost.toFixed(2).replace('.', ',')}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#16021e] border border-purple-800">
                  <span className="text-purple-300 font-bold block text-[11px]">Valor de Venda Potencial</span>
                  <span className="text-xl font-black text-emerald-400 font-fun block mt-1">
                    R$ {totalStockRetail.toFixed(2).replace('.', ',')}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#16021e] border border-purple-800">
                  <span className="text-purple-300 font-bold block text-[11px]">Lucro Bruto Previsto</span>
                  <span className="text-xl font-black text-[#00f2fe] font-fun block mt-1">
                    R$ {(totalStockRetail - totalStockCost).toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: BACKUP */}
          {activeTab === 'backup' && (
            <div className="space-y-4 max-w-xl text-xs">
              <h3 className="text-base font-bold font-fun text-white">
                Backup e Restauração dos Dados da Loja
              </h3>
              <p className="text-purple-300/80">
                Exporte todo o banco de dados (produtos, fornecedores, pedidos e configurações) em formato JSON seguro para backup no seu computador.
              </p>

              <div className="p-4 rounded-2xl bg-[#14011b] border border-purple-800 space-y-3">
                <button
                  onClick={() => {
                    const fullBackup = {
                      products,
                      suppliers,
                      manufacturers,
                      orders,
                      settings,
                      exportedAt: new Date().toISOString(),
                    };
                    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(fullBackup, null, 2));
                    const downloadAnchor = document.createElement('a');
                    downloadAnchor.setAttribute('href', dataStr);
                    downloadAnchor.setAttribute('download', `doidas-e-meias-backup-completo-${new Date().toISOString().slice(0,10)}.json`);
                    document.body.appendChild(downloadAnchor);
                    downloadAnchor.click();
                    downloadAnchor.remove();
                    showNotification('Backup exportado com sucesso!');
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-purple-900 hover:bg-purple-800 text-white font-bold flex items-center justify-center gap-2 cursor-pointer shadow"
                >
                  <Download className="w-4 h-4" />
                  <span>Baixar Arquivo JSON de Backup Completo</span>
                </button>

                <button
                  onClick={() => {
                    if (confirm('Atenção: Isso irá restaurar os produtos e configurações para o estado original inicial. Continuar?')) {
                      onResetDefaults();
                      showNotification('Dados restaurados para os padrões originais!');
                    }
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-rose-950/70 hover:bg-rose-900 border border-rose-800 text-rose-300 font-bold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Restaurar Valores Padrão de Fábrica</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Exportação de Dados para o Gemini / Backup JSON */}
      <GeminiExportModal
        isOpen={isGeminiExportOpen}
        onClose={() => setIsGeminiExportOpen(false)}
        settings={settings}
        products={products}
        suppliers={suppliers}
        manufacturers={manufacturers}
        orders={orders}
        customers={customers}
        staffUsers={currentUser ? [currentUser] : []}
      />
    </div>
  );
};
