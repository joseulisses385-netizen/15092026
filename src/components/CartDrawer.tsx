import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  X,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  ArrowRight,
  Copy,
  Check,
  QrCode,
  Phone,
  CreditCard,
  ExternalLink,
  ShieldCheck,
  Truck,
  Sparkles,
  Gift,
  Clock,
  Search,
  MapPin,
  AlertCircle,
  Tag,
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { generateStaticPix } from '../pix';
import { CartItem, StoreSettings, Customer, Order, ShippingMethodOption } from '../types';
import { INITIAL_SHIPPING_METHODS } from '../data/initialData';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  settings: StoreSettings;
  currentUser: Customer | null;
  onOpenCustomerAuth: () => void;
  onPlaceOrder: (order: Order) => void;
  onOpenGuaranteesModal?: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  settings,
  currentUser,
  onPlaceOrder,
  onOpenGuaranteesModal,
}) => {
  const [view, setView] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPassword, setCustomerPassword] = useState('');
  const [emailMarketingConsent, setEmailMarketingConsent] = useState(true);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [addressNumber, setAddressNumber] = useState('');
  const [cep, setCep] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [complement, setComplement] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'cartao' | 'boleto' | 'whatsapp' | 'tiktok_shop'>('pix');
  const [notes, setNotes] = useState('');
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [copiedPix, setCopiedPix] = useState(false);

  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);

  // Shipping state
  const [selectedMethodId, setSelectedMethodId] = useState<string>('correios_mini');
  const [isCepLoading, setIsCepLoading] = useState(false);
  const [isLiveShippingLoading, setIsLiveShippingLoading] = useState(false);

  const [mpPaymentLink, setMpPaymentLink] = useState<string | null>(null);
  const [isGeneratingPayment, setIsGeneratingPayment] = useState(false);
  const [mpPixData, setMpPixData] = useState<any>(null);
  const [isPaid, setIsPaid] = useState(false);

  const [liveMelhorEnvioQuotes, setLiveMelhorEnvioQuotes] = useState<ShippingMethodOption[]>([]);
  const [cepSuccessMsg, setCepSuccessMsg] = useState<string | null>(null);
  const [cepErrorMsg, setCepErrorMsg] = useState<string | null>(null);

  // Available shipping methods: prefer live quotes from Melhor Envio if available, otherwise fallback
  const baseMethods: ShippingMethodOption[] =
    settings.shippingMethods && settings.shippingMethods.length > 0
      ? settings.shippingMethods.filter((m) => m.enabled)
      : INITIAL_SHIPPING_METHODS.filter((m) => m.enabled);

  const shippingMethods: ShippingMethodOption[] =
    liveMelhorEnvioQuotes.length > 0
      ? [
          ...liveMelhorEnvioQuotes,
          ...baseMethods.filter((m) => m.serviceType === 'retirada'),
        ]
      : baseMethods;

  // Sync user info or local saved CEP so user immediately sees shipping
  useEffect(() => {
    if (currentUser) {
      setCustomerName(currentUser.name || '');
      setCustomerPhone(currentUser.phone || '');
      setCustomerEmail(currentUser.email || '');
      if (currentUser.emailMarketingConsent !== undefined) {
        setEmailMarketingConsent(currentUser.emailMarketingConsent);
      }
      if (currentUser.address) setDeliveryAddress(currentUser.address);
      if (currentUser.addressNumber) setAddressNumber(currentUser.addressNumber);
      if (currentUser.complement) setComplement(currentUser.complement);
      if (currentUser.city) setCity(currentUser.city);
      if (currentUser.neighborhood) setNeighborhood(currentUser.neighborhood);
      if (currentUser.cep) {
        setCep(currentUser.cep);
        handleLookupCep(currentUser.cep);
      }
    } else {
      // Check if user has a previously entered CEP in this device
      const savedCep = localStorage.getItem('doidas_user_cep');
      if (savedCep && !cep) {
        setCep(savedCep);
        handleLookupCep(savedCep);
      }
    }
  }, [currentUser, isOpen]);

  // Reset view when drawer opens
  useEffect(() => {
    if (isOpen && view === 'success') {
      setView('cart');
      setCompletedOrder(null);
      setMpPixData(null);
      setIsPaid(false);
      setMpPaymentLink(null);
    }
  }, [isOpen]);

  useEffect(() => {
    let interval: any;
    if (view === 'success' && !isPaid && (mpPixData?.paymentId || (completedOrder && (completedOrder.paymentMethod === 'cartao' || completedOrder.paymentMethod === 'boleto')))) {
      interval = setInterval(async () => {
        try {
          if (mpPixData?.paymentId) {
            // Check PIX payment status directly
            const res = await fetch(`/api/payment/mercadopago/payment-status/${mpPixData.paymentId}`);
            const data = await res.json();
            if (data.success && data.status === 'approved') {
              setIsPaid(true);
              clearInterval(interval);
            }
          } else if (completedOrder) {
             // Check via store orders for webhooks
             const res = await fetch('/api/store');
             const data = await res.json();
             const found = data.orders?.find((o: any) => o.orderNumber === completedOrder.orderNumber || o.id === completedOrder.orderNumber);
             if (found && found.status === 'pago') {
               setIsPaid(true);
               clearInterval(interval);
             }
          }
        } catch (err) {
          console.error('Polling err', err);
        }
      }, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [view, isPaid, mpPixData, completedOrder]);

  

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cartItems.reduce((acc, item) => {
    const itemPrice = (item.product?.price || 0) + (item.selectedPrint?.additionalPrice || 0);
    return acc + itemPrice * item.quantity;
  }, 0);

  // Free shipping calculation (Definido para R$ 99,00)
  const freeThreshold =
    settings.freeShippingThreshold === 149 || settings.freeShippingThreshold === 150 || !settings.freeShippingThreshold
      ? 99
      : settings.freeShippingThreshold;
  const isFreeShippingUnlocked = Boolean(
    settings.enableFreeShipping && subtotal >= freeThreshold && subtotal > 0
  );
  const remainingForFreeShipping = Math.max(0, freeThreshold - subtotal);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / freeThreshold) * 100));

  // Determine active shipping method and final price
  const activeMethod =
    shippingMethods.find((m) => m.id === selectedMethodId) || shippingMethods[0];

  const getMethodPrice = (method: ShippingMethodOption) => {
    if (method.serviceType === 'retirada') return 0;
    if (isFreeShippingUnlocked) {
      if (method.price === 0 || method.badge?.includes('FRETE GRÁTIS')) return 0;
      // The cheapest eligible delivery method becomes free
      const nonPickup = shippingMethods.filter((m) => m.serviceType !== 'retirada');
      if (nonPickup.length > 0 && nonPickup[0].id === method.id) return 0;
      if (
        method.serviceType === 'mini_envios' ||
        method.serviceType === 'jadlog' ||
        method.badge?.includes('Econômico') ||
        method.badge?.includes('Standard') ||
        method.id.includes('melhor_envio_33') ||
        method.id.includes('melhor_envio_4')
      ) {
        return 0;
      }
    }
    return method.price;
  };

  const deliveryFee = activeMethod ? getMethodPrice(activeMethod) : 0;

  // Coupon configuration & dynamic management (Admin StoreSettings + Welcome coupon)
  const welcomeCouponCode = (settings.welcomeCouponCode || 'BEMVINDA10').trim().toUpperCase();
  const welcomeCouponDiscountPercentage = settings.welcomeCouponDiscountPercentage ?? 10;
  const welcomeCouponMinOrder = settings.welcomeCouponMinOrder ?? 150;

  // Find active coupon from settings.coupons if applied
  const activeMatchingCoupon = settings.coupons?.find(
    (c) => c.code.trim().toUpperCase() === appliedCoupon && c.active !== false
  );
  const isWelcomeApplied = appliedCoupon === welcomeCouponCode || appliedCoupon === 'BEMVINDA10';

  let isCouponValidMinOrder = false;
  let couponDiscountAmount = 0;
  let couponMinOrderRequired = 0;
  let couponDescription = '';

  if (activeMatchingCoupon) {
    couponMinOrderRequired = activeMatchingCoupon.minOrderValue || 0;
    isCouponValidMinOrder = subtotal >= couponMinOrderRequired;
    if (isCouponValidMinOrder) {
      if (activeMatchingCoupon.discountType === 'percentage') {
        couponDiscountAmount = (subtotal * activeMatchingCoupon.discountValue) / 100;
      } else {
        couponDiscountAmount = Math.min(subtotal, activeMatchingCoupon.discountValue);
      }
    }
    couponDescription = activeMatchingCoupon.description || `Cupom ${activeMatchingCoupon.code}`;
  } else if (isWelcomeApplied) {
    couponMinOrderRequired = welcomeCouponMinOrder;
    isCouponValidMinOrder = subtotal >= couponMinOrderRequired;
    if (isCouponValidMinOrder) {
      couponDiscountAmount = (subtotal * welcomeCouponDiscountPercentage) / 100;
    }
    couponDescription = `10% OFF em pedidos a partir de R$ ${Number(welcomeCouponMinOrder).toFixed(0)},00`;
  }

  const isCouponAppliedAndValid = Boolean(appliedCoupon && isCouponValidMinOrder && couponDiscountAmount > 0);
  const remainingForCoupon = Math.max(0, couponMinOrderRequired - subtotal);
  const subtotalAfterCoupon = Math.max(0, subtotal - couponDiscountAmount);

  // Pix discount (default 5%)
  const pixDiscountPercentage = settings.pixDiscountPercentage ?? 5;
  const pixDiscountMinOrder = settings.pixDiscountMinOrder || 0;
  const isPixSelected = paymentMethod === 'pix';
  const isPixEligible = isPixSelected && (pixDiscountMinOrder === 0 || subtotal >= pixDiscountMinOrder);
  const pixDiscountAmount = isPixEligible ? (subtotalAfterCoupon * pixDiscountPercentage) / 100 : 0;
  const total = Math.max(0, subtotalAfterCoupon + deliveryFee - pixDiscountAmount);

  const handleApplyCoupon = (codeOverride?: string) => {
    const raw = (codeOverride !== undefined ? codeOverride : couponInput).trim().toUpperCase();
    if (!raw) {
      setCouponError('Digite o código do cupom.');
      setCouponSuccess(null);
      return;
    }

    const foundInSettings = settings.coupons?.find(
      (c) => c.code.trim().toUpperCase() === raw && c.active !== false
    );

    if (foundInSettings) {
      setAppliedCoupon(raw);
      const minVal = foundInSettings.minOrderValue || 0;
      if (subtotal < minVal) {
        const diff = (minVal - subtotal).toFixed(2).replace('.', ',');
        setCouponError(
          `O cupom ${raw} é válido apenas para compras a partir de R$ ${Number(minVal).toFixed(0)},00. Adicione mais R$ ${diff} para ativar o desconto!`
        );
        setCouponSuccess(null);
      } else {
        const discountLabel =
          foundInSettings.discountType === 'percentage'
            ? `${foundInSettings.discountValue}% OFF`
            : `R$ ${Number(foundInSettings.discountValue).toFixed(2).replace('.', ',')} OFF`;
        setCouponError(null);
        setCouponSuccess(`Cupom ${raw} ativado com sucesso! (${discountLabel})`);
      }
    } else if (raw === welcomeCouponCode || raw === 'BEMVINDA10') {
      setAppliedCoupon(raw);
      if (subtotal < welcomeCouponMinOrder) {
        const diff = (welcomeCouponMinOrder - subtotal).toFixed(2).replace('.', ',');
        setCouponError(
          `O cupom ${raw} (10% OFF) é válido apenas para compras a partir de R$ ${Number(welcomeCouponMinOrder).toFixed(0)},00. Falta apenas R$ ${diff} para ativar seu desconto!`
        );
        setCouponSuccess(null);
      } else {
        setCouponError(null);
        setCouponSuccess(
          `Cupom ${raw} ativado com sucesso! 10% de desconto concedido.`
        );
      }
    } else {
      setCouponError(`Cupom "${raw}" não encontrado, inativo ou expirado.`);
      setCouponSuccess(null);
      setAppliedCoupon(null);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
    setCouponSuccess(null);
    setCouponInput('');
  };

  const handleLookupCep = async (rawCep: string) => {
    const clean = rawCep.replace(/\D/g, '');
    if (clean.length !== 8) {
      setCepSuccessMsg(null);
      return;
    }

    // Salvar CEP localmente para facilitar cálculos automáticos futuros
    try {
      localStorage.setItem('doidas_user_cep', clean);
    } catch {}

    setIsCepLoading(true);
    setCepErrorMsg(null);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      const data = await res.json();
      if (data.erro) {
        setCepErrorMsg('CEP não encontrado nos Correios.');
        setCepSuccessMsg(null);
      } else {
        if (data.logradouro && !deliveryAddress) {
          setDeliveryAddress(data.logradouro);
        }
        if (data.bairro) setNeighborhood(data.bairro);
        if (data.localidade) setCity(`${data.localidade} - ${data.uf}`);
        setCepSuccessMsg(`${data.localidade}/${data.uf} (${data.bairro || 'Localizado'})`);
      }
    } catch {
      setCepErrorMsg('Erro ao consultar CEP.');
    } finally {
      setIsCepLoading(false);
    }

    // Cotação em tempo real com a API do Melhor Envio
    if (settings.melhorEnvioEnabled !== false) {
      setIsLiveShippingLoading(true);
      try {
        const quoteRes = await fetch('/api/shipping/melhor-envio/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            toCep: clean,
            itemsCount: totalItems || 1,
            cartTotal: subtotal,
          }),
        });
        const quoteData = await quoteRes.json();
        if (quoteData.success && Array.isArray(quoteData.quotes) && quoteData.quotes.length > 0) {
          setLiveMelhorEnvioQuotes(quoteData.quotes);
          setSelectedMethodId(quoteData.quotes[0].id);
        }
      } catch (err) {
        console.warn('Cotação Melhor Envio:', err);
      } finally {
        setIsLiveShippingLoading(false);
      }
    }
  };

  const handleCopyPix = () => {
    const pix = settings.pixKey || settings.whatsappNumber;
    navigator.clipboard.writeText(pix);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2000);
  };

  const handleFinishOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !deliveryAddress || !addressNumber || !neighborhood || !city || !cep) {
      alert('Por favor, preencha todos os campos obrigatórios de entrega.');
      return;
    }
    
    if (!currentUser && !customerPassword) {
      alert('Crie uma senha segura para rastrear seu pedido depois.');
      return;
    }

    if (!customerEmail || !customerEmail.includes('@')) {
      alert('Por favor, informe seu e-mail para envio do comprovante.');
      return;
    }

    const orderNumber = `DM-${Math.floor(100000 + Math.random() * 900000)}`;
    const newOrder: Order = {
      id: `order-${Date.now()}`,
      orderNumber,
      origin: 'site',
      customerId: currentUser?.id,
      customerName,
      customerPhone,
      customerEmail: customerEmail.trim().toLowerCase(),
      customerPassword: customerPassword,
      emailMarketingConsent,
      emailMarketingConsentDate: emailMarketingConsent ? new Date().toISOString() : undefined,
      deliveryAddress: `${deliveryAddress}, ${addressNumber}${complement ? ` - ${complement}` : ''}, ${neighborhood} - ${city} (CEP: ${cep})`,
      cep,
      neighborhood,
      city,
      complement,
      paymentMethod,
      items: [...cartItems],
      subtotal,
      deliveryFee,
      discount: couponDiscountAmount + pixDiscountAmount,
      couponCode: isCouponAppliedAndValid ? appliedCoupon : undefined,
      couponDiscountApplied: couponDiscountAmount,
      pixDiscountApplied: pixDiscountAmount,
      total,
      status: 'pending',
      shippingCarrier: activeMethod?.carrier,
      shippingMethodId: activeMethod?.id,
      shippingMethodName: activeMethod?.name,
      shippingEstimate: activeMethod?.deliveryEstimate,
      createdAt: new Date().toISOString(),
      notes,
    };

    onPlaceOrder(newOrder);
    setCompletedOrder(newOrder);
    setView('success');
    onClearCart();

    if (paymentMethod === 'cartao' || paymentMethod === 'boleto') {
      setIsGeneratingPayment(true);
      try {
        const res = await fetch('/api/payment/mercadopago/create-preference', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: newOrder.orderNumber,
            items: newOrder.items,
            payer: {
              name: newOrder.customerName,
              email: newOrder.customerEmail,
              phone: newOrder.customerPhone,
              address: { street: deliveryAddress, number: addressNumber, cep }
            },
            deliveryFee: newOrder.deliveryFee
          })
        });
        const data = await res.json();
        if (data.success && data.initPoint) {
          setMpPaymentLink(data.initPoint);
          window.open(data.initPoint, '_blank');
        } else {
          console.warn('MP Error:', data.error);
          setMpPaymentLink(settings.cardGatewayUrl || null);
        }
      } catch (err) {
        console.error('Error generating MP link', err);
        setMpPaymentLink(settings.cardGatewayUrl || null);
      } finally {
        setIsGeneratingPayment(false);
      }
    } else if (paymentMethod === 'pix') {
      setIsGeneratingPayment(true);
      try {
        const res = await fetch('/api/payment/mercadopago/create-pix', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: newOrder.orderNumber,
            amount: newOrder.total,
            payerName: newOrder.customerName,
            payerEmail: newOrder.customerEmail,
          })
        });
        const data = await res.json();
        if (data.success && data.qrCodeBase64) {
          setMpPixData(data);
        } else {
          console.warn('MP Error:', data.error);
          const pixResult = generateStaticPix(
            settings.pixKey || settings.whatsappNumber,
            settings.pixBeneficiary || 'Doidas e Meias',
            settings.pixCity || 'Sao Paulo',
            newOrder.total
          );
          setMpPixData({ isFallback: true, qrCode: pixResult,  });
        }
      } catch (err) {
        console.error('Error generating MP PIX', err);
        const pixResult = generateStaticPix(
          settings.pixKey || settings.whatsappNumber,
          settings.pixBeneficiary || 'Doidas e Meias',
          settings.pixCity || 'Sao Paulo',
          newOrder.total
        );
        setMpPixData({ isFallback: true, qrCode: pixResult,  });
      } finally {
        setIsGeneratingPayment(false);
      }
    }
  };

  const formatWhatsAppOrderText = (order: Order) => {
    let msg = `🛍️ *NOVO PEDIDO NO SITE - DOIDAS E MEIAS*\n\n`;
    msg += `*Pedido:* #${order.orderNumber}\n`;
    msg += `*Cliente:* ${order.customerName}\n`;
    msg += `*WhatsApp:* ${order.customerPhone}\n`;
    msg += `*Endereço:* ${order.deliveryAddress}\n`;
    msg += `*Forma de Pagamento:* ${
      order.paymentMethod === 'pix'
        ? 'PIX'
        : order.paymentMethod === 'cartao'
        ? 'Cartão de Crédito'
        : order.paymentMethod === 'boleto'
        ? 'Boleto (Mercado Pago)'
        : order.paymentMethod === 'tiktok_shop'
        ? 'TikTok Shop'
        : 'WhatsApp'
    }\n`;
    if (order.shippingMethodName) {
      msg += `*Forma de Envio:* ${order.shippingMethodName} (${order.shippingEstimate || ''}) - ${
        order.deliveryFee === 0 ? 'GRÁTIS' : `R$ ${Number(order.deliveryFee).toFixed(2).replace('.', ',')}`
      }\n`;
    }
    msg += `\n*ITENS DO PEDIDO:*\n`;
    (order.items || []).forEach((it) => {
      const basePrice = (it.product.price || 0) + (it.selectedPrint?.additionalPrice || 0);
      const itemTotal = (basePrice * it.quantity).toFixed(2).replace('.', ',');
      
      let customStr = '';
      if (it.selectedModel || it.selectedColor || it.selectedSize) {
         const parts = [];
         if (it.selectedModel) parts.push(it.selectedModel);
         if (it.selectedColor) parts.push(it.selectedColor);
         if (it.selectedSize) parts.push(`Tam ${it.selectedSize}`);
         if (it.selectedPrint) parts.push(`Estampa: ${it.selectedPrint.name}`);
         customStr = ` [${parts.join(' | ')}]`;
      } else if (it.product.tamanhos) {
         customStr = ` (${it.product.tamanhos})`;
      }

      msg += `• ${it.quantity}x ${it.product.name}${customStr} - R$ ${itemTotal}\n`;
    });
    msg += `\n*Subtotal:* R$ ${Number(order.subtotal).toFixed(2).replace('.', ',')}\n`;
    if (order.couponCode && order.couponDiscountApplied && order.couponDiscountApplied > 0) {
      msg += `*Cupom ${order.couponCode}:* -R$ ${Number(order.couponDiscountApplied).toFixed(2).replace('.', ',')} 🎁\n`;
    }
    if (order.pixDiscountApplied && order.pixDiscountApplied > 0) {
      msg += `*Desconto PIX (${settings.pixDiscountPercentage ?? 5}%):* -R$ ${Number(order.pixDiscountApplied).toFixed(2).replace('.', ',')} ⚡\n`;
    }
    msg += `*Frete:* ${order.deliveryFee === 0 ? 'GRÁTIS' : `R$ ${Number(order.deliveryFee).toFixed(2).replace('.', ',')}`}\n`;
    msg += `*VALOR TOTAL:* R$ ${Number(order.total).toFixed(2).replace('.', ',')}\n`;
    if (order.notes) {
      msg += `*Observações:* ${order.notes}\n`;
    }
    return encodeURIComponent(msg);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-md bg-[#25042e] text-white shadow-2xl flex flex-col border-l border-pink-500/40">
          {/* Header */}
          <div className="p-5 bg-gradient-to-r from-[#2a0438] via-[#831843] to-[#0284c7] flex items-center justify-between text-white border-b border-pink-500/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-black/40 border border-amber-300/40 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h2 className="text-lg font-black font-fun tracking-tight">
                  {view === 'cart'
                    ? 'Sacola de Pedidos'
                    : view === 'checkout'
                    ? 'Finalizar Pedido pelo Site'
                    : 'Pedido Realizado!'}
                </h2>
                <p className="text-xs text-pink-100">
                  {view === 'cart'
                    ? `${totalItems} ${totalItems === 1 ? 'peça selecionada' : 'peças selecionadas'}`
                    : view === 'checkout'
                    ? 'Escolha o frete e forma de pagamento'
                    : 'Recebemos seu pedido com sucesso'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/20 transition-colors text-white cursor-pointer"
              aria-label="Fechar sacola"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* BARRA DE PROGRESSO DE FRETE GRÁTIS */}
          {settings.enableFreeShipping && cartItems.length > 0 && view !== 'success' && (
            <div className="bg-[#1b0222] px-5 py-2.5 border-b border-purple-900/60 text-xs">
              <div className="flex items-center justify-between font-bold mb-1">
                {isFreeShippingUnlocked ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Você ganhou <strong>FRETE GRÁTIS</strong>!</span>
                  </span>
                ) : (
                  <span className="text-purple-200">
                    Faltam <strong className="text-amber-300">R$ {Number(remainingForFreeShipping).toFixed(2).replace('.', ',')}</strong> para <strong>FRETE GRÁTIS</strong>
                  </span>
                )}
                <span className="text-[10px] text-purple-400 font-mono">
                  Meta: R$ {Number(freeThreshold).toFixed(2)}
                </span>
              </div>
              <div className="w-full bg-purple-950/80 rounded-full h-1.5 overflow-hidden border border-purple-800/40">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    isFreeShippingUnlocked
                      ? 'bg-gradient-to-r from-emerald-500 to-[#00f2fe]'
                      : 'bg-gradient-to-r from-pink-500 to-amber-400'
                  }`}
                  style={{ width: `${freeShippingProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* VIEW: CART */}
          {view === 'cart' && (
            <>
              <div className="flex-1 overflow-y-auto p-5 space-y-4 divide-y divide-purple-900/40">
                {cartItems.length > 0 ? (
                  <>
                    {cartItems.map((item) => (
                      <div key={(item.product?.id || Math.random().toString())} className="pt-4 first:pt-0 flex gap-3.5">
                        <img
                          src={item.selectedPrint?.imageUrl || item.product.imageUrl}
                          alt={item.product.name}
                          className="w-16 h-16 rounded-2xl object-cover border border-purple-700/50 bg-[#1f0328] shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-white truncate">
                            {item.product.name}
                          </h4>
                          {item.product.tamanhos && !item.selectedSize && (
                            <span className="inline-block text-[10px] font-bold text-amber-300 bg-purple-950 px-1.5 py-0.5 rounded">
                              Tam: {item.product.tamanhos}
                            </span>
                          )}
                          {(item.selectedModel || item.selectedColor || item.selectedSize) && (
                             <div className="text-[10px] text-purple-300 mt-0.5 space-y-0.5">
                               {item.selectedModel && <div>{item.selectedModel}</div>}
                               {(item.selectedColor || item.selectedSize) && (
                                  <div>Cor: {item.selectedColor} | Tam: {item.selectedSize}</div>
                               )}
                               {item.selectedPrint && (
                                  <div className="text-pink-400">Estampa: {item.selectedPrint.name} {item.selectedPrint.additionalPrice > 0 ? `(+R$ ${item.selectedPrint.additionalPrice.toFixed(2).replace('.', ',')})` : ''}</div>
                               )}
                             </div>
                          )}
                          <p className="text-xs font-black text-amber-300 mt-1">
                            R$ {Number((item.product?.price || 0) + (item.selectedPrint?.additionalPrice || 0)).toFixed(2).replace('.', ',')}
                          </p>

                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-2 bg-[#1a0220] px-2 py-1 rounded-xl border border-purple-800/60">
                              <button
                                onClick={() => onUpdateQuantity((item.product?.id || Math.random().toString()), item.quantity - 1)}
                                className="p-1 hover:text-pink-400 cursor-pointer"
                                title="Diminuir"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-xs font-bold w-4 text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => onUpdateQuantity((item.product?.id || Math.random().toString()), item.quantity + 1)}
                                className="p-1 hover:text-pink-400 cursor-pointer"
                                title="Aumentar"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <button
                              onClick={() => onRemoveItem((item.product?.id || Math.random().toString()))}
                              className="text-rose-400 hover:text-rose-300 p-1 cursor-pointer"
                              title="Remover produto"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* SIMULADOR RÁPIDO DE FRETE NA SACOLA */}
                    <div className="pt-4 space-y-2">
                      <div className="p-3.5 rounded-2xl bg-[#1a0222] border border-purple-800/60 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                            <Truck className="w-3.5 h-3.5 text-pink-400" />
                            <span>Simular Frete & Prazo</span>
                          </span>
                          {isLiveShippingLoading ? (
                            <span className="text-[10px] text-[#00f2fe] font-bold animate-pulse">
                              Cotando no Melhor Envio... 🚚
                            </span>
                          ) : liveMelhorEnvioQuotes.length > 0 ? (
                            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                              <span>⚡</span>
                              <span>Melhor Envio Ao Vivo</span>
                            </span>
                          ) : cepSuccessMsg ? (
                            <span className="text-[10px] text-emerald-400 font-semibold truncate max-w-[150px]">
                              {cepSuccessMsg}
                            </span>
                          ) : null}
                        </div>

                        <div className="flex gap-2">
                          <input
                            type="text"
                            maxLength={9}
                            value={cep}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCep(val);
                              if (val.replace(/\D/g, '').length === 8) {
                                handleLookupCep(val);
                              }
                            }}
                            placeholder="Digite seu CEP (Ex: 01310-100)"
                            className="flex-1 px-3 py-1.5 rounded-xl bg-[#13011a] border border-purple-700/60 text-xs text-white placeholder-purple-400/50 font-mono focus:outline-none focus:border-pink-500"
                          />
                          <button
                            type="button"
                            onClick={() => handleLookupCep(cep)}
                            disabled={isCepLoading || isLiveShippingLoading}
                            className="px-3 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold shrink-0 cursor-pointer flex items-center gap-1"
                          >
                            <Search className="w-3 h-3" />
                            <span>{isCepLoading || isLiveShippingLoading ? '...' : 'Calcular'}</span>
                          </button>
                        </div>

                        {cepErrorMsg && (
                          <p className="text-[11px] text-rose-400 font-semibold">{cepErrorMsg}</p>
                        )}

                        {/* Opções de envio disponíveis */}
                        <div className="pt-1 space-y-1.5">
                          {shippingMethods.slice(0, 4).map((method) => {
                            const price = getMethodPrice(method);
                            const isSelected = selectedMethodId === method.id;
                            return (
                              <div
                                key={method.id}
                                onClick={() => setSelectedMethodId(method.id)}
                                className={`p-2 rounded-xl border text-[11px] flex items-center justify-between cursor-pointer transition-all ${
                                  isSelected
                                    ? 'bg-pink-950/40 border-pink-500 text-white font-bold'
                                    : 'bg-[#15011c] border-purple-900/40 text-purple-200 hover:border-purple-700'
                                }`}
                              >
                                <div className="flex items-center gap-2 truncate">
                                  {method.carrierLogo ? (
                                    <img
                                      src={method.carrierLogo}
                                      alt={method.carrier}
                                      className="w-5 h-5 rounded bg-white p-0.5 object-contain shrink-0"
                                    />
                                  ) : (
                                    <span className="text-xs">
                                      {method.carrier === 'Correios'
                                        ? '📦'
                                        : method.carrier === 'Jadlog'
                                        ? '🚛'
                                        : method.carrier === 'Loggi'
                                        ? '⚡'
                                        : '🛵'}
                                    </span>
                                  )}
                                  <div className="truncate">
                                    <span className="truncate">{method.name}</span>
                                    <span className="text-[10px] text-purple-400 block font-normal">
                                      {method.deliveryEstimate}
                                    </span>
                                  </div>
                                </div>
                                <div className="text-right shrink-0">
                                  {price === 0 ? (
                                    <span className="text-emerald-400 font-black">GRÁTIS</span>
                                  ) : (
                                    <span className="text-amber-300 font-bold">
                                      R$ {Number(price).toFixed(2).replace('.', ',')}
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                    <div className="w-16 h-16 rounded-3xl bg-purple-950/80 border border-purple-800 flex items-center justify-center text-3xl">
                      🧦
                    </div>
                    <h3 className="text-base font-bold text-white font-fun">
                      Sua sacola está vazia!
                    </h3>
                    <p className="text-xs text-purple-300/80 max-w-xs">
                      Escolha meias super estilosas, camisetas oversize ou croppeds e volte aqui para finalizar.
                    </p>
                  </div>
                )}
              </div>

              {cartItems.length > 0 && (
                <div className="p-5 bg-[#1b0222] border-t border-purple-900/60 space-y-2.5">
                  {/* CUPOM DE DESCONTO INTERATIVO */}
                  <div className="p-3 rounded-2xl bg-[#14011b] border border-pink-500/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-pink-300">
                        <Gift className="w-3.5 h-3.5 text-pink-400" />
                        <span>Cupom de Desconto</span>
                      </div>
                      {appliedCoupon && (
                        <button
                          type="button"
                          onClick={handleRemoveCoupon}
                          className="text-[10px] text-pink-400 hover:text-white underline cursor-pointer"
                        >
                          Remover
                        </button>
                      )}
                    </div>

                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        placeholder={`Ex: ${welcomeCouponCode}`}
                        className="flex-1 px-3 py-1.5 rounded-xl bg-[#1d0224] border border-purple-700/60 text-xs font-mono text-amber-300 uppercase placeholder-purple-400/50 focus:outline-none focus:border-pink-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleApplyCoupon()}
                        className="px-3.5 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-black transition-colors cursor-pointer shrink-0"
                      >
                        {appliedCoupon ? 'Atualizar' : 'Aplicar'}
                      </button>
                    </div>

                    {/* Feedback do Cupom */}
                    {appliedCoupon && isCouponValidMinOrder && (
                      <div className="p-2 rounded-xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 text-xs flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="font-bold">Cupom {appliedCoupon} aplicado ({couponDescription})!</span>
                        </div>
                        <span className="font-mono text-emerald-300 font-bold">
                          -R$ {Number(couponDiscountAmount).toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                    )}

                    {appliedCoupon && !isCouponValidMinOrder && (
                      <div className="p-2 rounded-xl bg-amber-950/70 border border-amber-500/60 text-amber-200 text-[11px] space-y-0.5">
                        <div className="flex items-start gap-1 font-bold text-amber-300">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span>Cupom {appliedCoupon}: Válido a partir de R$ {Number(couponMinOrderRequired).toFixed(0)},00.</span>
                        </div>
                        <p className="text-amber-200/90 pl-4.5">
                          Adicione mais <strong>R$ {Number(remainingForCoupon).toFixed(2).replace('.', ',')}</strong> na sacola para liberar seu desconto!
                        </p>
                      </div>
                    )}

                    {!appliedCoupon && couponError && (
                      <div className="p-2 rounded-xl bg-rose-950/70 border border-rose-500/60 text-rose-200 text-xs flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span>{couponError}</span>
                      </div>
                    )}

                    {/* Atalho do cupom de boas-vindas */}
                    {!appliedCoupon && (
                      <div className="flex items-center justify-between text-[10px] text-purple-300 pt-0.5">
                        <span>Cupom <strong>{welcomeCouponCode}</strong> ({welcomeCouponDiscountPercentage}% OFF):</span>
                        <button
                          type="button"
                          onClick={() => {
                            setCouponInput(welcomeCouponCode);
                            handleApplyCoupon(welcomeCouponCode);
                          }}
                          className="text-pink-400 hover:text-pink-300 font-bold underline cursor-pointer"
                        >
                          Usar cupom (a partir de R$ {Number(welcomeCouponMinOrder).toFixed(0)},00)
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center text-xs font-bold text-purple-200">
                    <span>Subtotal das peças:</span>
                    <span className="text-white">R$ {Number(subtotal).toFixed(2).replace('.', ',')}</span>
                  </div>

                  {isCouponAppliedAndValid && (
                    <div className="flex justify-between items-center text-xs font-bold text-pink-400">
                      <span className="flex items-center gap-1">
                        <Gift className="w-3.5 h-3.5 text-pink-400" />
                        <span>Desconto Cupom ({welcomeCouponDiscountPercentage}% OFF):</span>
                      </span>
                      <span>-R$ {Number(couponDiscountAmount).toFixed(2).replace('.', ',')}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-xs font-bold text-purple-200">
                    <span className="flex items-center gap-1">
                      <span>Frete ({(activeMethod?.name || '').split(' ')[0] || 'Envio'}):</span>
                    </span>
                    {deliveryFee === 0 ? (
                      <span className="text-emerald-400 font-black">GRÁTIS</span>
                    ) : (
                      <span className="text-amber-300">R$ {Number(deliveryFee).toFixed(2).replace('.', ',')}</span>
                    )}
                  </div>

                  
                    <div className="py-2 px-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-emerald-300 font-bold">
                        <span>💠</span>
                        <span>No PIX ({pixDiscountPercentage}% de desconto):</span>
                      </span>
                      <span className="text-emerald-400 font-black font-mono">
                        R$ {Math.max(0, subtotalAfterCoupon + deliveryFee - (subtotalAfterCoupon * pixDiscountPercentage) / 100).toFixed(2).replace('.', ',')}
                      </span>
                    </div>

                  <div className="flex justify-between items-center text-base font-black text-white pt-2 border-t border-purple-900/40">
                    <span>Total do Pedido:</span>
                    <span className="text-2xl font-black text-amber-300 font-fun">
                      R$ {Number(subtotalAfterCoupon + deliveryFee).toFixed(2).replace('.', ',')}
                    </span>
                  </div>

                  {/* Micro-faixa de garantia na sacola */}
                  <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-[11px] text-emerald-300">
                    <div className="flex items-center gap-1.5 font-bold">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>🔒 Site 100% Seguro & Protegido</span>
                    </div>
                    {onOpenGuaranteesModal && (
                      <button
                        type="button"
                        onClick={onOpenGuaranteesModal}
                        className="text-[10px] text-yellow-300 hover:text-white underline font-semibold cursor-pointer"
                      >
                        Garantias
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <a
                      href={settings.tiktokShopUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-3 px-3 rounded-xl bg-black hover:bg-zinc-900 text-[#00f2fe] border border-pink-500/60 text-xs font-black flex items-center justify-center gap-1.5 shadow transition-all cursor-pointer text-center"
                    >
                      <span>🎵</span>
                      <span>Comprar no TikTok</span>
                    </a>

                    <button
                      onClick={() => setView('checkout')}
                      className="py-3 px-3 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-[#00f2fe] hover:opacity-95 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-lg shadow-pink-950/40 transition-all cursor-pointer"
                    >
                      <span>Finalizar pelo Site</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* VIEW: CHECKOUT */}
          {view === 'checkout' && (
            <form onSubmit={handleFinishOrder} className="flex-1 flex flex-col justify-between overflow-hidden">
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <button
                  type="button"
                  onClick={() => setView('cart')}
                  className="text-xs text-pink-400 hover:text-pink-300 flex items-center gap-1 cursor-pointer mb-1"
                >
                  ← Voltar para a Sacola
                </button>

                {/* IDENTIFICAÇÃO */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-amber-300 font-fun">
                    1. Identificação do Comprador
                  </h3>

                  <div>
                    <label className="block text-[11px] font-bold text-purple-200 mb-1">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Ex: Maria Clara Santos"
                      className="w-full px-3 py-2 rounded-xl bg-[#1b0222] border border-purple-700/60 text-xs text-white placeholder-purple-400/50 focus:outline-none focus:border-pink-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-purple-200 mb-1">
                        WhatsApp com DDD *
                      </label>
                      <input
                        type="tel"
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="(11) 99999-9999"
                        className="w-full px-3 py-2 rounded-xl bg-[#1b0222] border border-purple-700/60 text-xs text-white placeholder-purple-400/50 focus:outline-none focus:border-pink-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-purple-200 mb-1 flex items-center justify-between">
                        <span>E-mail *</span>
                        <span className="text-[10px] text-pink-400 font-normal">Para cupons e rastreio</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="seu.email@exemplo.com"
                        className="w-full px-3 py-2 rounded-xl bg-[#1b0222] border border-purple-700/60 text-xs text-white placeholder-purple-400/50 focus:outline-none focus:border-pink-500"
                      />
                    </div>
                  </div>

                  {!currentUser && (
                    <div className="pt-2">
                      <label className="block text-[11px] font-bold text-purple-200 mb-1 flex items-center justify-between">
                        <span>Crie uma Senha para acompanhar o pedido</span>
                        <span className="text-pink-400">Obrigatório</span>
                      </label>
                      <input
                        type="password"
                        required
                        value={customerPassword}
                        onChange={(e) => setCustomerPassword(e.target.value)}
                        placeholder="Crie sua senha secreta"
                        className="w-full px-3 py-2 rounded-xl bg-[#1b0222] border border-pink-700/60 text-xs text-white placeholder-purple-400/50 focus:outline-none focus:border-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.15)]"
                      />
                    </div>
                  )}

                  {/* Checkbox de autorização para cupons e ofertas */}
                  <div className="p-3 rounded-2xl bg-gradient-to-r from-pink-950/40 to-purple-950/40 border border-pink-700/40 space-y-1">
                    <label className="flex items-start gap-2.5 cursor-pointer text-[11px] text-purple-200 leading-tight">
                      <input
                        type="checkbox"
                        checked={emailMarketingConsent}
                        onChange={(e) => setEmailMarketingConsent(e.target.checked)}
                        className="mt-0.5 accent-pink-500 rounded shrink-0"
                      />
                      <span>
                        🎁 <strong>Autorizo receber cupons de desconto</strong> e ofertas especiais por e-mail (posso descadastrar a qualquer momento).
                      </span>
                    </label>
                  </div>
                </div>

                {/* ENDEREÇO COM AUTOPREENCHIMENTO VIACEP */}
                <div className="space-y-3 pt-3 border-t border-purple-900/50">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-wider text-amber-300 font-fun">
                      2. Endereço de Entrega
                    </h3>
                    {cepSuccessMsg && (
                      <span className="text-[10px] text-emerald-400 font-bold">
                        ✓ {cepSuccessMsg}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-purple-200 mb-1">
                        CEP *
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={9}
                        value={cep}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCep(val);
                          if (val.replace(/\D/g, '').length === 8) {
                            handleLookupCep(val);
                          }
                        }}
                        placeholder="00000-000"
                        className="w-full px-3 py-2 rounded-xl bg-[#1b0222] border border-purple-700/60 text-xs text-white placeholder-purple-400/50 font-mono focus:outline-none focus:border-pink-500"
                      />
                    </div>

                    <div className="col-span-2 grid grid-cols-[2fr_1fr] gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-purple-200 mb-1">
                          Endereço / Rua *
                        </label>
                        <input
                          type="text"
                          required
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                          placeholder="Ex: Rua das Flores"
                          className="w-full px-3 py-2 rounded-xl bg-[#1b0222] border border-purple-700/60 text-xs text-white placeholder-purple-400/50 focus:outline-none focus:border-pink-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-purple-200 mb-1">
                          Número *
                        </label>
                        <input
                          type="text"
                          required
                          value={addressNumber}
                          onChange={(e) => setAddressNumber(e.target.value)}
                          placeholder="Ex: 123"
                          className="w-full px-3 py-2 rounded-xl bg-[#1b0222] border border-purple-700/60 text-xs text-white placeholder-purple-400/50 focus:outline-none focus:border-pink-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-purple-200 mb-1">
                        Bairro
                      </label>
                      <input
                        type="text"
                        value={neighborhood}
                        onChange={(e) => setNeighborhood(e.target.value)}
                        placeholder="Centro"
                        className="w-full px-3 py-2 rounded-xl bg-[#1b0222] border border-purple-700/60 text-xs text-white placeholder-purple-400/50 focus:outline-none focus:border-pink-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-purple-200 mb-1">
                        Cidade / UF
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="São Paulo - SP"
                        className="w-full px-3 py-2 rounded-xl bg-[#1b0222] border border-purple-700/60 text-xs text-white placeholder-purple-400/50 focus:outline-none focus:border-pink-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-purple-200 mb-1">
                      Complemento (Apto, Bloco, Referência)
                    </label>
                    <input
                      type="text"
                      value={complement}
                      onChange={(e) => setComplement(e.target.value)}
                      placeholder="Apto 42, Bloco B"
                      className="w-full px-3 py-2 rounded-xl bg-[#1b0222] border border-purple-700/60 text-xs text-white placeholder-purple-400/50 focus:outline-none focus:border-pink-500"
                    />
                  </div>
                </div>

                {/* FORMAS DE ENVIO SELECIONÁVEIS */}
                <div className="space-y-3 pt-3 border-t border-purple-900/50">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-wider text-amber-300 font-fun flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-pink-400" />
                      <span>3. Escolha a Maneira de Envio</span>
                    </h3>
                    {liveMelhorEnvioQuotes.length > 0 ? (
                      <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-700/60 px-2 py-0.5 rounded-full font-bold">
                        ✓ Cotação em Tempo Real (Melhor Envio)
                      </span>
                    ) : (
                      <span className="text-[10px] text-purple-300 font-semibold">
                        Seguro e Rastreável
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    {shippingMethods.map((method) => {
                      const price = getMethodPrice(method);
                      const isSelected = selectedMethodId === method.id;
                      return (
                        <div
                          key={method.id}
                          onClick={() => setSelectedMethodId(method.id)}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-pink-950/50 border-pink-500 ring-1 ring-pink-500 shadow-md'
                              : 'bg-[#180220] border-purple-800/60 hover:border-purple-600'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-start gap-2.5 min-w-0">
                              <input
                                type="radio"
                                name="shippingMethod"
                                checked={isSelected}
                                onChange={() => setSelectedMethodId(method.id)}
                                className="mt-1 text-pink-600 focus:ring-0 cursor-pointer"
                              />
                              <div className="flex items-start gap-2 min-w-0">
                                {method.carrierLogo ? (
                                  <img
                                    src={method.carrierLogo}
                                    alt={method.carrier}
                                    className="w-7 h-7 rounded-lg bg-white p-0.5 object-contain shrink-0 mt-0.5 shadow-sm"
                                  />
                                ) : (
                                  <span className="text-base shrink-0 mt-0.5">
                                    {method.carrier === 'Correios'
                                      ? '📦'
                                      : method.carrier === 'Jadlog'
                                      ? '🚛'
                                      : method.carrier === 'Loggi'
                                      ? '⚡'
                                      : '🛵'}
                                  </span>
                                )}
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-bold text-xs text-white">
                                      {method.name}
                                    </span>
                                    {method.badge && (
                                      <span className="text-[9px] font-bold bg-pink-900/80 text-pink-200 border border-pink-700/50 px-1.5 py-0.2 rounded-full">
                                        {method.badge}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[10px] text-purple-300/80 mt-0.5">
                                    Prazo: <strong>{method.deliveryEstimate}</strong> • {method.description}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              {price === 0 ? (
                                <div>
                                  <span className="text-emerald-400 font-black text-xs">GRÁTIS</span>
                                  {method.price > 0 && (
                                    <span className="line-through text-[10px] text-purple-400 block">
                                      R$ {Number(method.price).toFixed(2)}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-amber-300 font-black text-xs font-mono">
                                  R$ {Number(price).toFixed(2).replace('.', ',')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 4. CUPOM DE DESCONTO NO CHECKOUT */}
                <div className="space-y-2 pt-3 border-t border-purple-900/50">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-wider text-pink-300 font-fun flex items-center gap-1.5">
                      <Gift className="w-3.5 h-3.5 text-pink-400" />
                      <span>4. Cupom de Desconto</span>
                    </h3>
                    {appliedCoupon && (
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="text-[10px] text-pink-400 hover:text-white underline cursor-pointer"
                      >
                        Remover
                      </button>
                    )}
                  </div>

                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder={`Ex: ${welcomeCouponCode}`}
                      className="flex-1 px-3 py-1.5 rounded-xl bg-[#1b0222] border border-purple-700/60 text-xs font-mono text-amber-300 uppercase placeholder-purple-400/50 focus:outline-none focus:border-pink-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleApplyCoupon()}
                      className="px-3.5 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-black transition-colors cursor-pointer shrink-0"
                    >
                      {appliedCoupon ? 'Atualizar' : 'Aplicar'}
                    </button>
                  </div>

                  {/* Feedback cupom no checkout */}
                  {appliedCoupon && isCouponValidMinOrder && (
                    <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 text-xs flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="font-bold">Cupom {appliedCoupon} ativo (10% OFF)!</span>
                      </div>
                      <span className="font-mono text-emerald-300 font-bold">
                        -R$ {Number(couponDiscountAmount).toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  )}

                  {appliedCoupon && !isCouponValidMinOrder && (
                    <div className="p-2.5 rounded-xl bg-amber-950/70 border border-amber-500/60 text-amber-200 text-[11px] space-y-1">
                      <div className="flex items-start gap-1 font-bold text-amber-300">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span>Cupom {appliedCoupon}: Válido somente a partir de R$ {Number(welcomeCouponMinOrder).toFixed(0)},00.</span>
                      </div>
                      <p className="text-amber-200/90 pl-4.5">
                        Faltam <strong>R$ {Number(remainingForCoupon).toFixed(2).replace('.', ',')}</strong> em peças para ativar o desconto de 10%!
                      </p>
                    </div>
                  )}

                  {!appliedCoupon && couponError && (
                    <div className="p-2 rounded-xl bg-rose-950/70 border border-rose-500/60 text-rose-200 text-xs flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span>{couponError}</span>
                    </div>
                  )}

                  {!appliedCoupon && (
                    <div className="flex items-center justify-between text-[10px] text-purple-300 pt-0.5">
                      <span>Cupom de Boas-Vindas: <strong>{welcomeCouponCode}</strong></span>
                      <button
                        type="button"
                        onClick={() => {
                          setCouponInput(welcomeCouponCode);
                          handleApplyCoupon(welcomeCouponCode);
                        }}
                        className="text-pink-400 hover:text-pink-300 font-bold underline cursor-pointer"
                      >
                        Aplicar (10% acima de R$ {Number(welcomeCouponMinOrder).toFixed(0)})
                      </button>
                    </div>
                  )}
                </div>

                {/* FORMAS DE PAGAMENTO */}
                <div className="space-y-3 pt-3 border-t border-purple-900/50">
                  <h3 className="text-xs font-black uppercase tracking-wider text-amber-300 font-fun">
                    5. Forma de Pagamento
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {settings.enablePix && (
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('pix')}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer relative ${
                          paymentMethod === 'pix'
                            ? 'bg-pink-600/30 border-pink-500 text-white font-bold ring-2 ring-pink-500 shadow-lg shadow-pink-900/30'
                            : 'bg-[#1b0222] border-purple-800/60 text-purple-300 hover:border-pink-500/50'
                        }`}
                      >
                        <span className="absolute -top-2 -right-1 px-1.5 py-0.5 rounded-full text-[9px] font-black bg-emerald-500 text-slate-950 shadow-sm animate-pulse">
                          -{pixDiscountPercentage}% OFF
                        </span>
                        <span className="block text-base">💠</span>
                        <span className="text-[11px] block mt-1 font-bold">PIX Direto</span>
                      </button>
                    )}
                    {/* Boleto - Mercado Pago */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('boleto')}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        paymentMethod === 'boleto'
                          ? 'bg-cyan-600/30 border-cyan-500 text-white font-bold ring-1 ring-cyan-500'
                          : 'bg-[#1b0222] border-purple-800/60 text-purple-300 hover:border-cyan-500/50'
                      }`}
                    >
                      <span className="block text-base">📄</span>
                      <span className="text-[11px] block mt-1 font-bold">Boleto</span>
                    </button>


                    
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('cartao')}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                          paymentMethod === 'cartao'
                            ? 'bg-pink-600/30 border-pink-500 text-white font-bold ring-1 ring-pink-500'
                            : 'bg-[#1b0222] border-purple-800/60 text-purple-300'
                        }`}
                      >
                        <span className="block text-base">💳</span>
                        <span className="text-[11px] block mt-1 font-bold">Cartão</span>
                      </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('whatsapp')}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        paymentMethod === 'whatsapp'
                          ? 'bg-pink-600/30 border-pink-500 text-white font-bold ring-1 ring-pink-500'
                          : 'bg-[#1b0222] border-purple-800/60 text-purple-300'
                      }`}
                    >
                      <span className="block text-base">💬</span>
                      <span className="text-[11px] block mt-1 font-bold">WhatsApp</span>
                    </button>
                  </div>

                  {/* PIX DETAILS */}
                  {paymentMethod === 'pix' && (
                    <div className="p-3.5 rounded-2xl bg-[#1a0224] border border-pink-500/50 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-300 flex items-center gap-1">
                          <QrCode className="w-3.5 h-3.5" />
                          <span>Dados da Chave Pix:</span>
                        </span>
                        <button
                          type="button"
                          onClick={handleCopyPix}
                          className="px-2.5 py-1 rounded-lg bg-pink-600 hover:bg-pink-500 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          {copiedPix ? <Check className="w-3 h-3 text-white" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedPix ? 'Chave Copiada!' : 'Copiar Chave'}</span>
                        </button>
                      </div>

                      <div className="p-2 rounded-xl bg-emerald-950/70 border border-emerald-500/50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-400 text-sm">⚡</span>
                          <div>
                            <span className="text-xs font-black text-emerald-300 block">
                              Desconto de {pixDiscountPercentage}% Aplicado no PIX!
                            </span>
                            <span className="text-[10px] text-emerald-200/80">
                              Economia instantânea de R$ {Number(pixDiscountAmount).toFixed(2).replace('.', ',')}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs font-black text-emerald-300 font-mono">
                          -R$ {Number(pixDiscountAmount).toFixed(2).replace('.', ',')}
                        </span>
                      </div>

                      <div className="bg-black/50 p-2.5 rounded-xl border border-purple-800/60 space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-purple-300">Chave ({settings.pixKeyType?.toUpperCase() || 'TELEFONE'}):</span>
                          <span className="font-mono text-white font-bold">{settings.pixKey || settings.whatsappNumber}</span>
                        </div>
                        {settings.pixBeneficiary && (
                          <div className="flex justify-between text-[11px]">
                            <span className="text-purple-300">Titular da Conta:</span>
                            <span className="text-white font-semibold">{settings.pixBeneficiary}</span>
                          </div>
                        )}
                        {settings.pixBank && (
                          <div className="flex justify-between text-[11px]">
                            <span className="text-purple-300">Banco / Instituição:</span>
                            <span className="text-amber-300">{settings.pixBank}</span>
                          </div>
                        )}
                      </div>

                      <p className="text-[10px] text-purple-300/80 italic">
                        💡 Após concluir o pedido, transfira pelo aplicativo do seu banco e envie o comprovante no WhatsApp da loja para despacharmos suas meias.
                      </p>
                    </div>
                  )}

                  {/* CARTÃO DETAILS */}
                  {paymentMethod === 'cartao' && (
                    <div className="p-3.5 rounded-2xl bg-[#1a0224] border border-cyan-500/50 space-y-2 text-xs">
                      <div className="flex items-center gap-2 text-cyan-300 font-bold">
                        <CreditCard className="w-4 h-4" />
                        <span>{settings.cardGatewayName || 'Pagamento Online Seguro no Cartão'}</span>
                      </div>
                      <p className="text-[11px] text-purple-200">
                        {settings.cardInstallmentsInfo || 'Pague em até 3x sem juros ou 12x com taxas da operadora.'}
                      </p>                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-bold text-purple-200 mb-1">
                      Observação ou Recado para a Loja (opcional)
                    </label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Ex: Embalar para presente, ligar antes de entregar..."
                      className="w-full px-3 py-2 rounded-xl bg-[#1b0222] border border-purple-700/60 text-xs text-white placeholder-purple-400/50 focus:outline-none focus:border-pink-500"
                    />
                  </div>
                </div>
              </div>

              {/* CHECKOUT SUMMARY & SUBMIT */}
              <div className="p-5 bg-[#1e0225] border-t border-purple-900/60 space-y-3">
                <div className="space-y-1 text-xs text-purple-200">
                  <div className="flex justify-between">
                    <span>Subtotal das peças:</span>
                    <span>R$ {Number(subtotal).toFixed(2).replace('.', ',')}</span>
                  </div>
                  {isCouponAppliedAndValid && (
                    <div className="flex justify-between text-pink-400 font-bold">
                      <span className="flex items-center gap-1">
                        <Gift className="w-3.5 h-3.5 text-pink-400" />
                        <span>🎁 Cupom {appliedCoupon} ({welcomeCouponDiscountPercentage}% OFF):</span>
                      </span>
                      <span>-R$ {Number(couponDiscountAmount).toFixed(2).replace('.', ',')}</span>
                    </div>
                  )}
                  {isPixSelected && pixDiscountAmount > 0 && (
                    <div className="flex justify-between text-emerald-400 font-bold">
                      <span className="flex items-center gap-1">
                        <span>⚡ Desconto PIX ({pixDiscountPercentage}% OFF):</span>
                      </span>
                      <span>-R$ {Number(pixDiscountAmount).toFixed(2).replace('.', ',')}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Frete ({activeMethod?.name || 'Entrega'}):</span>
                    {deliveryFee === 0 ? (
                      <span className="text-emerald-400 font-bold">GRÁTIS</span>
                    ) : (
                      <span className="text-white font-bold">R$ {Number(deliveryFee).toFixed(2).replace('.', ',')}</span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center text-sm font-black text-white pt-2 border-t border-purple-900/40">
                  <span>Valor Total:</span>
                  <span className="text-2xl text-amber-300 font-fun">
                    R$ {Number(total).toFixed(2).replace('.', ',')}
                  </span>
                </div>

                {/* SELO DE SEGURANÇA E COMPRA PROTEGIDA NO CHECKOUT */}
                <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/50 space-y-1.5 text-[11px] text-purple-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-emerald-300 font-bold">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>🔒 Compra 100% Segura & Criptografada</span>
                    </div>
                    {onOpenGuaranteesModal && (
                      <button
                        type="button"
                        onClick={onOpenGuaranteesModal}
                        className="text-[10px] text-yellow-300 hover:text-white underline font-semibold cursor-pointer"
                      >
                        Ver Garantias
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-purple-300/80 leading-tight">
                    SSL 256-Bit Ativo • Antifraude Mercado Pago • 7 Dias Garantia CDC • Rastreio Oficial
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-[#00f2fe] hover:opacity-95 text-white text-xs font-black shadow-lg shadow-pink-950/40 flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-102"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirmar e Finalizar Pedido</span>
                </button>
              </div>
            </form>
          )}

          {/* VIEW: SUCCESS */}
          {view === 'success' && completedOrder && (
            <div className="flex-1 p-6 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-3xl border border-emerald-500/40 shadow-lg">
                ✓
              </div>
              <h3 className="text-xl font-black font-fun text-white">
                Pedido #{completedOrder.orderNumber} Registrado!
              </h3>
              <p className="text-xs text-purple-200/80 max-w-xs leading-relaxed">
                Muito obrigado, {completedOrder.customerName}! Seu pedido já entrou na nossa fila de separação e embalagem.
              </p>

              <div className="p-4 rounded-2xl bg-[#1e0225] border border-purple-800/60 text-left w-full space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-purple-300">Total:</span>
                  <span className="text-amber-300 font-bold">R$ {Number(completedOrder.total).toFixed(2).replace('.', ',')}</span>
                </div>
                {completedOrder.pixDiscountApplied && completedOrder.pixDiscountApplied > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Desconto PIX ({settings.pixDiscountPercentage ?? 5}%):</span>
                    <span className="font-bold">-R$ {Number(completedOrder.pixDiscountApplied).toFixed(2).replace('.', ',')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-purple-300">Forma de Pagamento:</span>
                  <span className="text-white font-bold">{completedOrder.paymentMethod.toUpperCase()}</span>
                </div>
                {completedOrder.shippingMethodName && (
                  <div className="flex justify-between">
                    <span className="text-purple-300">Envio Escolhido:</span>
                    <span className="text-cyan-300 font-bold">{completedOrder.shippingMethodName}</span>
                  </div>
                )}
                
                {/* INSTRUCOES DE PAGAMENTO NO SUCESSO */}
                {(completedOrder.paymentMethod === 'cartao' || completedOrder.paymentMethod === 'boleto') && (
                  <div className="mt-3 p-3 bg-cyan-950/40 border border-cyan-500/50 rounded-xl text-center space-y-2">
                    <p className="text-[11px] text-cyan-200 font-semibold">
                      Para concluir o seu pedido com o valor exato (R$ {completedOrder.total.toFixed(2).replace('.', ',')}), realize o pagamento via Mercado Pago através do link abaixo:
                    </p>
                    {isGeneratingPayment ? (
                      <div className="py-2 text-cyan-400 text-xs font-bold animate-pulse">Gerando link de pagamento com o valor exato...</div>
                    ) : mpPaymentLink ? (
                      <a
                        href={mpPaymentLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[11px] shadow-lg shadow-cyan-900/30 transition-all hover:scale-105"
                      >
                        <span>💳 Pagar R$ {completedOrder.total.toFixed(2).replace('.', ',')} no Mercado Pago</span>
                      </a>
                    ) : (
                      <p className="text-rose-400 text-xs">Erro ao gerar link. O lojista precisa configurar o Token do Mercado Pago.</p>
                    )}
                  </div>
                )}
                {completedOrder.paymentMethod === 'pix' && (
                  <div className="mt-3 p-3 bg-pink-950/40 border border-pink-500/50 rounded-xl text-center space-y-2">
                    {isGeneratingPayment ? (
                      <p className="text-[11px] text-pink-300 animate-pulse font-semibold">Gerando código PIX dinâmico...</p>
                    ) : mpPixData?.qrCode ? (
                      <>
                        <p className="text-[11px] text-pink-200 font-semibold">
                          Escaneie o QR Code ou copie a chave (Copia e Cola) para pagar:
                        </p>
                        {mpPixData.qrCodeBase64 ? (
                          <img src={`data:image/png;base64,${mpPixData.qrCodeBase64}`} alt="QR Code Pix" className="mx-auto rounded-xl w-32 h-32 border border-pink-500/30" />
                        ) : (
                          <div className="flex justify-center mx-auto bg-white p-2 rounded-xl border border-pink-500/30 w-max">
                            <QRCodeCanvas value={mpPixData.qrCode} size={128} />
                          </div>
                        )}
                        <div className="font-mono text-white text-[9px] bg-black/60 p-2 rounded-lg break-all select-all text-left border border-pink-900 mt-2">
                          {mpPixData.qrCode}
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="text-[11px] text-pink-200 font-semibold">
                          Para concluir o seu pedido, realize o PIX para a chave abaixo:
                        </p>
                        <p className="font-mono text-white text-sm bg-black/50 py-1.5 px-3 rounded-lg select-all">
                          {settings.pixKey || settings.whatsappNumber}
                        </p>
                      </>
                    )}
                  </div>
                )}
                
                <div className="border-t border-purple-900/60 pt-1.5 text-[11px] text-purple-300/90 mt-2">
                  <span>Entrega: {completedOrder.deliveryAddress}</span>
                </div>
              </div>

              {(!['cartao', 'boleto', 'pix'].includes(completedOrder.paymentMethod) || isPaid) ? (
                <a
                  href={`https://wa.me/${settings.whatsappNumber}?text=${formatWhatsAppOrderText(completedOrder)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
                >
                  <Phone className="w-4 h-4" />
                  <span>{isPaid ? 'Pedido Pago! Enviar pro WhatsApp' : 'Enviar Pedido pro WhatsApp'}</span>
                </a>
              ) : (
                <div className="w-full py-3 px-4 rounded-xl bg-slate-800 text-slate-400 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 opacity-70">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-500"></span>
                  </span>
                  Aguardando confirmação de pagamento...
                </div>
              )}

              <button
                onClick={onClose}
                className="text-xs text-purple-300 hover:text-white cursor-pointer pt-2"
              >
                Voltar à Loja
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
