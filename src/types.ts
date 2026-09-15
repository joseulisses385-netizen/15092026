export type ProductCategory = 'todas' | 'meias' | 'oversize' | 'cropped' | 'kits';

export interface Supplier {
  id: string;
  name: string;
  tradeName?: string; // Razão social
  cnpjOrCpf?: string;
  contactPerson?: string;
  phone: string;
  email?: string;
  city?: string;
  state?: string;
  deliveryDays?: number; // Prazo de entrega médio
  paymentTerms?: string; // Ex: 30 dias boleto, 50% adiantado
  categoriesSupplied?: string[]; // Ex: ["Meias Algodão", "Embalagens"]
  notes?: string;
  createdAt: string;
}

export interface Manufacturer {
  id: string;
  name: string;
  country: string;
  specialty?: string; // Ex: Tecelagem canelada, estamparia sublimática
  notes?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  stockQuantity: number;
  inStock: boolean;
  isFeatured: boolean;
  badge?: string;
  fitType?: string;
  tamanhos?: string;
  custoUnitario?: number;
  precoVenda?: number;
  tiktokShopUrl?: string;
  // Campos de gestão e banco de dados avançado
  sku?: string;
  supplierId?: string;
  supplierName?: string;
  manufacturerId?: string;
  fabricante?: string;
  localizacaoEstoque?: string; // Ex: "Prateleira 2 - Caixa Meias Cano Alto"
  warehouseLocation?: string;
  estoqueMinimo?: number; // Alerta quando estoque <= estoqueMinimo
  minStockThreshold?: number;
  createdAt?: string;
  updatedAt?: string;
  
  // Custom builder fields
  isCustomizable?: boolean;
  availableModels?: string[];
  availableColors?: string[];
  availableSizes?: string[];
  availablePrints?: {
    id: string;
    name: string;
    imageUrl: string;
    additionalPrice: number;
  }[];
}

export interface ShippingMethodOption {
  id: string;
  name: string;
  carrier: 'Correios' | 'Jadlog' | 'Loggi' | 'Motoboy' | 'Balcão' | string;
  serviceType: 'mini_envios' | 'jadlog' | 'loggi' | 'sedex' | 'motoboy' | 'retirada' | string;
  description: string;
  deliveryEstimate: string; // Ex: "5 a 10 dias úteis"
  price: number;
  badge?: string; // Ex: "Mais Barato para Meias", "Recomendado", "Mais Rápido", "Grátis"
  enabled: boolean;
  freeAbove?: number;
  platformTip?: string; // Ex: "Emitir via SuperFrete com até 80% OFF"
  carrierLogo?: string;
  isMelhorEnvioLive?: boolean;
  discount?: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  whatsappNumber: string;
  whatsappDisplay: string;
  tiktokShopUrl: string;
  tiktokUsername?: string;
  instagramUrl: string;
  stockSystemUrl: string;
  heroMascotUrl: string;
  heroTitle: string;
  heroSubtitle: string;
  announcementText: string;
  adminPin: string;
  
  // Configurações de Formas de Pagamento e Contas
  pixKey?: string;
  pixKeyType?: 'telefone' | 'cnpj' | 'cpf' | 'email' | 'aleatoria';
  pixBeneficiary?: string; // Nome do titular da conta
  pixBank?: string; // Ex: Nubank, Mercado Pago, Banco do Brasil
  pixCity?: string;
  enablePix: boolean;
  pixDiscountPercentage?: number; // Ex: 5% de desconto no Pix

  enableCard: boolean;
  cardGatewayName?: string; // Ex: "Mercado Pago / InfinitePay / PagSeguro"
  cardGatewayUrl?: string; // Link de pagamento rápido ou checkout externo
  cardInstallmentsInfo?: string; // Ex: "Até 3x sem juros"

  // Integração Oficial Mercado Pago (Crédito, Pix Oficial & Selo de Segurança)
  mercadoPagoEnabled?: boolean;
  mercadoPagoAccessToken?: string;
  mercadoPagoPublicKey?: string;
  mercadoPagoEnvironment?: 'production' | 'sandbox';
  mercadoPagoAccountName?: string;
  mercadoPagoAccountEmail?: string;
  mercadoPagoCollectorId?: string;
  mercadoPagoMaxInstallments?: number; // Padrão 12
  mercadoPagoFreeInstallments?: number; // Padrão 3
  mercadoPagoShowSecurityBadge?: boolean;
  mercadoPagoAutoReturn?: boolean;

  enableWhatsAppPayment: boolean;
  enableTikTokShop: boolean;

  // Configurações de Cupons de Desconto & Boas-Vindas
  welcomeCouponCode?: string; // Padrão "BEMVINDA10"
  welcomeCouponDiscountPercentage?: number; // Padrão 10 (%)
  welcomeCouponMinOrder?: number; // Padrão 150 (A partir de R$ 150)
  pixDiscountMinOrder?: number; // Valor mínimo do pedido para aplicar desconto Pix (padrão 0)
  coupons?: StoreCoupon[]; // Lista gerenciada exclusivamente por administradores

  // Configurações de Logística & Envios Econômicos
  shippingOriginCep?: string;
  shippingOriginCity?: string;
  freeShippingThreshold?: number; // Ex: 99
  enableFreeShipping?: boolean;
  shippingMethods?: ShippingMethodOption[];

  // Integração Oficial Melhor Envio
  melhorEnvioEnabled?: boolean;
  melhorEnvioToken?: string;
  melhorEnvioAccountName?: string;
  melhorEnvioAccountEmail?: string;
  melhorEnvioAccountPhone?: string;
  melhorEnvioOriginCep?: string;
  melhorEnvioOriginCity?: string;
  melhorEnvioOriginAddress?: string;
  melhorEnvioDefaultPackage?: {
    height: number;
    width: number;
    length: number;
    weight: number;
  };

  // Personalização Total da Página Primária (Textos, Botões e Seções)
  heroCtaWhatsAppText?: string;
  heroCtaStockText?: string;
  heroCtaTikTokText?: string;
  heroCtaSiteText?: string;
  heroWhatsAppDefaultMessage?: string;

  // Catálogo
  catalogBadgeText?: string;
  catalogTitle?: string;
  catalogSubtitle?: string;
  catalogSearchPlaceholder?: string;

  // Seção TikTok Hub
  tiktokBadgeText?: string;
  tiktokSectionTitle?: string;
  tiktokSectionSubtitle?: string;
  tiktokButtonText?: string;

  // Seção de Benefícios (Por que escolher a Doidas e Meias?)
  featuresTitle?: string;
  featuresSubtitle?: string;
  feature1Title?: string;
  feature1Desc?: string;
  feature2Title?: string;
  feature2Desc?: string;
  feature3Title?: string;
  feature3Desc?: string;
  feature4Title?: string;
  feature4Desc?: string;

  // Seção Redes Sociais & Contato
  socialTitle?: string;
  socialSubtitle?: string;
  socialTikTokTitle?: string;
  socialTikTokDesc?: string;
  socialInstagramTitle?: string;
  socialInstagramDesc?: string;
  socialWhatsAppTitle?: string;
  socialWhatsAppDesc?: string;

  // Rodapé & Institucional
  footerAboutText?: string;
  footerCompanyDoc?: string;
  footerCopyrightText?: string;
  supportHours?: string;

  // Dados Cadastrais da Empresa, CNPJ e Contatos Oficiais
  cnpj?: string;
  companyLegalName?: string; // Razão Social Oficial
  companyTradeName?: string; // Nome Fantasia
  companyAddress?: string; // Endereço físico da empresa / sede
  contactEmail?: string; // E-mail de atendimento / SAC
  supportPhone?: string; // Telefone SAC / Fixo / 0800
  stateRegistration?: string; // Inscrição Estadual (opcional)

  // Selos de Segurança & Compra Segura
  enableSslSeal?: boolean; // Selo SSL 256-bit de Navegação Segura
  enableSafePaymentSeal?: boolean; // Selo Compra Segura / Gateways Verificados
  enableCnpjVerifiedSeal?: boolean; // Selo de CNPJ Ativo e Verificado na Receita Federal
  enableSatisfactionSeal?: boolean; // Selo de 7 Dias de Garantia de Satisfação (CDC)
  customSecuritySealHtml?: string; // Código de selo externo opcional (Ebit, Reclame Aqui, etc)
  cnpjLookupUrl?: string; // Link direto para consulta do CNPJ na Receita Federal
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedModel?: string;
  selectedColor?: string;
  selectedSize?: string;
  selectedPrint?: {
    id: string;
    name: string;
    imageUrl: string;
    additionalPrice: number;
  };
}

export type OrderStatus = 'pending' | 'paid' | 'preparing' | 'shipped' | 'delivered' | 'cancelled';
export type OrderOrigin = 'site' | 'tiktok' | 'whatsapp' | 'balcao';

export interface Order {
  id: string;
  orderNumber: string;
  origin: OrderOrigin;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryAddress: string;
  addressNumber?: string;
  cep?: string;
  neighborhood?: string;
  city?: string;
  complement?: string;
  paymentMethod: 'pix' | 'cartao' | 'boleto' | 'whatsapp' | 'tiktok_shop';
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  discount?: number;
  couponCode?: string;
  couponDiscountApplied?: number;
  pixDiscountApplied?: number;
  total: number;
  status: OrderStatus;
  trackingCode?: string;
  shippingCarrier?: string; // Ex: Correios (Sedex / PAC), Jadlog, Loggi, Melhor Envio
  shippingMethodId?: string;
  shippingMethodName?: string; // Ex: "Correios Mini Envios"
  shippingEstimate?: string; // Ex: "5 a 10 dias úteis"
  createdAt: string;
  notes?: string;
  emailMarketingConsent?: boolean; // Autorização explícita para envio de e-mails com ofertas e cupons
  emailMarketingConsentDate?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  password?: string;
  cpf?: string;
  address?: string;
  addressNumber?: string;
  cep?: string;
  neighborhood?: string;
  city?: string;
  complement?: string;
  createdAt: string;
  updatedAt?: string;
  lgpdConsent: boolean;
  lgpdConsentDate: string;
  lgpdVersion?: string;
  emailMarketingConsent: boolean; // Autorização para envio de e-mails, promoções e cupons
  emailMarketingConsentDate?: string; // Data e hora da autorização
  welcomeCoupon?: string; // Cupom de boas-vindas atribuído (ex: BEMVINDA10)
  status?: 'ativo' | 'anonimizado';
  ordersCount?: number;
  totalSpent?: number;
  notes?: string;
}

export type StaffRole = 'admin' | 'estoque';

export interface StaffUser {
  id: string;
  name: string;
  username: string;
  password: string;
  role: StaffRole;
  active: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface StoreCoupon {
  id: string;
  code: string; // Ex: "MEIAS10", "DOIDAS20" (em caixa alta)
  description?: string; // Ex: "10% de desconto para novos clientes"
  discountType: 'percentage' | 'fixed'; // porcentagem ou valor fixo em R$
  discountValue: number; // Ex: 10 (%) ou 20 (R$)
  minOrderValue?: number; // Valor mínimo do pedido (Ex: 150 para R$ 150)
  maxDiscount?: number; // Teto máximo de desconto em reais
  active: boolean;
  usageCount?: number;
  usageLimit?: number; // Limite total de utilizações
  maxUsage?: number; // Alias para compatibilidade
  expiresAt?: string; // Data ISO de expiração
  createdAt: string;
}


