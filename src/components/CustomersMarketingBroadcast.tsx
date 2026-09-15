import React, { useState, useMemo, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Gift,
  ShoppingBag,
  Truck,
  Copy,
  Check, X,
  Download,
  ExternalLink,
  MessageSquare,
  Mail,
  RefreshCw,
  Search,
  CheckCircle2,
  Users,
  ShieldCheck,
  Tag,
  Share2,
} from 'lucide-react';
import { Customer, Order, Product, StoreSettings } from '../types';
import { syncCustomersFromOrdersOnServer, saveCustomerToServer } from '../services/storeApi';

interface CustomersMarketingBroadcastProps {
  customers: Customer[];
  orders: Order[];
  products?: Product[];
  settings?: StoreSettings;
  onRefreshCustomers: () => void;
  onFeedback: (msg: string) => void;
}

type CampaignType = 'cupom' | 'novos_produtos' | 'frete_gratis' | 'personalizado';
type AudienceType = 'todos' | 'optin' | 'compradores';

export const CustomersMarketingBroadcast: React.FC<CustomersMarketingBroadcastProps> = ({
  customers,
  orders,
  products = [],
  settings,
  onRefreshCustomers,
  onFeedback,
}) => {
  const [campaignType, setCampaignType] = useState<CampaignType>('cupom');
  const [audienceType, setAudienceType] = useState<AudienceType>('optin');
  const [selectedCouponCode, setSelectedCouponCode] = useState<string>(
    settings?.welcomeCouponCode || 'BEMVINDA10'
  );
  const [customCouponText, setCustomCouponText] = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [customMessage, setCustomMessage] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [sentCustomerIds, setSentCustomerIds] = useState<Set<string>>(new Set());
  const [sequentialQueue, setSequentialQueue] = useState<Customer[]>([]);
  const [isSequentialRunning, setIsSequentialRunning] = useState(false);

  // Available coupons from settings or standard
  const availableCoupons = useMemo(() => {
    const list = settings?.coupons || [];
    if (!list.some((c) => c.code.toUpperCase() === 'BEMVINDA10')) {
      return [
        {
          id: 'coupon-bemvinda10',
          code: settings?.welcomeCouponCode || 'BEMVINDA10',
          description: `Cupom de boas-vindas oficial (${settings?.welcomeCouponDiscountPercentage || 10}% OFF a partir de R$ ${settings?.welcomeCouponMinOrder || 150})`,
          discountType: 'percentage',
          discountValue: settings?.welcomeCouponDiscountPercentage || 10,
          minOrderValue: settings?.welcomeCouponMinOrder || 150,
          active: true,
          createdAt: new Date().toISOString(),
        },
        ...list,
      ];
    }
    return list;
  }, [settings]);

  // Selected products details
  const featuredProducts = useMemo(() => {
    return products.filter((p) => selectedProductIds.includes(p.id));
  }, [products, selectedProductIds]);

  // Filtered audience
  const audience = useMemo(() => {
    return customers.filter((c) => {
      if (c.status === 'anonimizado') return false;
      if (audienceType === 'optin') {
        return c.emailMarketingConsent !== false;
      }
      if (audienceType === 'compradores') {
        return (c.ordersCount || 0) > 0;
      }
      return true; // 'todos'
    });
  }, [customers, audienceType]);

  // Search filtered audience for 1-on-1 list
  const searchFilteredAudience = useMemo(() => {
    if (!searchTerm.trim()) return audience;
    const term = searchTerm.toLowerCase();
    return audience.filter(
      (c) =>
        (c.name || '').toLowerCase().includes(term) ||
        (c.phone && c.phone.includes(term)) ||
        (c.city && c.city.toLowerCase().includes(term)) ||
        (c.email && c.email.toLowerCase().includes(term))
    );
  }, [audience, searchTerm]);

  // Active coupon object
  const currentCoupon = useMemo(() => {
    return availableCoupons.find((c) => c.code.toUpperCase() === selectedCouponCode.toUpperCase());
  }, [availableCoupons, selectedCouponCode]);

  // Generate customized WhatsApp text for a specific customer or template preview
  const generateMessageText = (customerName?: string, customerCoupon?: string) => {
    const name = customerName ? customerName.split(' ')[0] : '{Nome}';
    const coupon = customerCoupon || selectedCouponCode || 'BEMVINDA10';
    const storeUrl = window.location.origin;

    if (campaignType === 'cupom') {
      const discountTxt = currentCoupon
        ? currentCoupon.discountType === 'percentage'
          ? `${currentCoupon.discountValue}% OFF`
          : `R$ ${currentCoupon.discountValue},00 OFF`
        : '10% OFF';
      const minOrderTxt = currentCoupon?.minOrderValue
        ? ` em compras a partir de R$ ${currentCoupon.minOrderValue.toFixed(0)},00`
        : '';

      return `Oie, ${name}! Tudo bem? 💕\n\nPassando para te presentear com um cupom especial da *Doidas & Meias*!\n\n🎁 Cupom: *${coupon}*\n✨ Benefício: *${discountTxt}*${minOrderTxt}\n🚚 *Frete Grátis* para todo o Brasil acima de R$ 99,00\n⚡ + 5% de desconto extra no PIX!\n\nAproveite para renovar suas peças streetwear favoritas aqui:\n👉 ${storeUrl}\n\nQualquer dúvida estou por aqui! Beijos! 🧦✨`;
    }

    if (campaignType === 'novos_produtos') {
      const itemsList =
        featuredProducts.length > 0
          ? featuredProducts
              .map((p) => `• *${p.name}* - R$ ${Number(p.price).toFixed(2).replace('.', ',')}`)
              .join('\n')
          : '• Novas Meias Divertidas com Estampas Exclusivas!\n• Modelos fofos para o seu dia a dia';

      return `Oie, ${name}! Olha só o que acabou de chegar! 😍✨\n\nAcabamos de lançar novidades imperdíveis na *Doidas & Meias*:\n\n${itemsList}\n\n🎁 E para você garantir suas peças com desconto, use o cupom: *${coupon}*\n🚚 *Frete Grátis* a partir de R$ 99,00!\n\nConfira todas as fotos e garanta antes que esgote:\n👉 ${storeUrl}\n\nTe espero lá! 💕🧦`;
    }

    if (campaignType === 'frete_gratis') {
      return `Oie, ${name}! Notícia incrível para você! 🚚💨\n\nNesta semana a *Doidas & Meias* liberou *FRETE GRÁTIS* para todo o Brasil em compras acima de R$ 99,00!\n\n⚡ E você ainda ganha + 5% de desconto no pagamento via PIX imediato!\n🎁 Quer mais desconto? Use o cupom *${coupon}* na sacola!\n\nAproveite para garantir suas peças streetwear sem pagar nada pelo frete:\n👉 ${storeUrl}\n\nCorre para aproveitar! Beijos! 💕`;
    }

    // personalizado
    if (customMessage.trim()) {
      return customMessage
        .replace(/{nome}/gi, name)
        .replace(/{cupom}/gi, coupon)
        .replace(/{link_loja}/gi, storeUrl);
    }

    return `Oie, ${name}! Preparamos novidades e promoções especiais na Doidas & Meias! Confira: ${storeUrl}`;
  };

  // Generate Email template
  const generateEmailTemplate = () => {
    const coupon = selectedCouponCode || 'BEMVINDA10';
    const storeUrl = window.location.origin;

    let subject = '';
    let body = '';

    if (campaignType === 'cupom') {
      subject = `🎁 Presente Especial para Você: Cupom ${coupon} na Doidas & Meias!`;
      body = `Olá!\n\nPreparamos uma condição muito especial para você na Doidas & Meias.\n\nUse o cupom promocional "${coupon}" no fechamento do seu pedido para garantir desconto exclusivo!\n\nAlém disso, você aproveita:\n- Frete Grátis para todo o Brasil a partir de R$ 99,00\n- 5% de desconto imediato pagando via PIX\n\nAcesse agora e confira nossa coleção:\n${storeUrl}\n\nCom carinho,\nEquipe Doidas & Meias`;
    } else if (campaignType === 'novos_produtos') {
      subject = `✨ Novos Lançamentos Chegando na Doidas & Meias!`;
      body = `Olá!\n\nNossa nova coleção de peças streetwear acabou de desembarcar na loja com estampas exclusivas e super confortáveis!\n\nVenha conhecer os novos lançamentos e use o cupom "${coupon}" para garantir o seu desconto:\n${storeUrl}\n\nFrete Grátis a partir de R$ 99,00 para todo o Brasil!\n\nUm abraço,\nEquipe Doidas & Meias`;
    } else {
      subject = `🚚 Frete Grátis Liberado na Doidas & Meias!`;
      body = `Olá!\n\nPassando para avisar que o Frete Grátis está liberado para todo o Brasil em pedidos a partir de R$ 99,00!\n\nAcesse o site e use o cupom "${coupon}":\n${storeUrl}\n\nBoas compras!\nEquipe Doidas & Meias`;
    }

    return { subject, body };
  };

  // Sync orders with customer database

  const handleQuickAddCustomer = async () => {
    if (!newCustName.trim() || !newCustPhone.trim()) {
      alert('Por favor, preencha nome e WhatsApp.');
      return;
    }
    
    onFeedback('Adicionando cliente...');
    const res = await saveCustomerToServer({
      name: newCustName.trim(),
      phone: newCustPhone.trim(),
      lgpdConsent: true,
      lgpdConsentDate: new Date().toISOString(),
      emailMarketingConsent: true,
      emailMarketingConsentDate: new Date().toISOString()
    });
    
    if (res.success) {
      setNewCustName('');
      setNewCustPhone('');
      setIsAddingCustomer(false);
      onRefreshCustomers();
      onFeedback('Cliente adicionado com sucesso!');
    } else {
      alert('Erro: ' + (res.message || 'Desconhecido'));
    }
  };

  const handleSyncOrders = async () => {
    setIsSyncing(true);
    try {
      const res = await syncCustomersFromOrdersOnServer();
      if (res.success) {
        await onRefreshCustomers();
        onFeedback(res.message || 'Banco de clientes sincronizado e atualizado com sucesso!');
      } else {
        alert(`Não foi possível sincronizar os clientes: ${res.message}`);
      }
    } finally {
      setIsSyncing(false);
    }
  };

  // Copy authorized emails in BCC format
  const handleCopyBccEmails = () => {
    const emails = audience
      .map((c) => c.email?.trim())
      .filter((e): e is string => Boolean(e && e.includes('@')));

    if (emails.length === 0) {
      alert('Nenhum e-mail válido encontrado no público selecionado.');
      return;
    }

    navigator.clipboard.writeText(emails.join(', '));
    setCopiedField('emails');
    onFeedback(`✓ ${emails.length} e-mails copiados para CCO (Cópia Oculta)! Cole no campo CCO do seu e-mail.`);
    setTimeout(() => setCopiedField(null), 3500);
  };

  // Copy plain WhatsApp phones formatted with 55
  const handleCopyWhatsAppNumbers = () => {
    const phones = audience
      .map((c) => {
        const clean = (c.phone || '').replace(/\D/g, '');
        if (!clean || clean.length < 8) return null;
        return clean.startsWith('55') ? clean : `55${clean}`;
      })
      .filter(Boolean);

    if (phones.length === 0) {
      alert('Nenhum telefone válido encontrado no público selecionado.');
      return;
    }

    navigator.clipboard.writeText(phones.join('\n'));
    setCopiedField('phones');
    onFeedback(`✓ ${phones.length} telefones com DDI +55 copiados para a área de transferência!`);
    setTimeout(() => setCopiedField(null), 3500);
  };

  // Copy email template
  const handleCopyEmailTemplate = () => {
    const { subject, body } = generateEmailTemplate();
    const fullText = `Assunto: ${subject}\n\n${body}`;
    navigator.clipboard.writeText(fullText);
    setCopiedField('email_template');
    onFeedback('✓ Modelo de e-mail promocional copiado!');
    setTimeout(() => setCopiedField(null), 3000);
  };

  // Download CSV for WhatsApp campaigns
  const handleDownloadWhatsAppCSV = () => {
    if (audience.length === 0) {
      alert('Nenhum cliente disponível no público selecionado.');
      return;
    }

    const headers = ['Nome', 'WhatsApp_55', 'Email', 'Cidade', 'Cupom', 'Mensagem_Personalizada'];
    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = audience.map((c) => {
      const cleanPhone = (c.phone || '').replace(/\D/g, '');
      const phone55 = cleanPhone ? (cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`) : '';
      const personalizedMsg = generateMessageText(c.name, c.welcomeCoupon || selectedCouponCode);

      return [
        escapeCsv(c.name),
        escapeCsv(phone55),
        escapeCsv(c.email || ''),
        escapeCsv(c.city || ''),
        escapeCsv(c.welcomeCoupon || selectedCouponCode),
        escapeCsv(personalizedMsg),
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `campanha_whatsapp_doidas_e_meias_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onFeedback('✓ Planilha de campanha para WhatsApp baixada com sucesso!');
  };

  // Download CSV for Email Marketing (Brevo, Mailchimp, RD Station)
  const handleDownloadEmailCSV = () => {
    const emailLeads = audience.filter((c) => c.email && c.email.includes('@'));
    if (emailLeads.length === 0) {
      alert('Nenhum lead com e-mail disponível no público selecionado.');
      return;
    }

    const headers = ['Nome', 'Email', 'WhatsApp', 'Cidade', 'Cupom', 'TotalGasto', 'Consentimento_Marketing'];
    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = emailLeads.map((c) => [
      escapeCsv(c.name),
      escapeCsv(c.email),
      escapeCsv(c.phone || ''),
      escapeCsv(c.city || ''),
      escapeCsv(c.welcomeCoupon || selectedCouponCode),
      (Number(c.totalSpent) || 0).toFixed(2).replace('.', ','),
      escapeCsv(c.emailMarketingConsent !== false ? 'SIM' : 'NAO'),
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `leads_email_marketing_doidas_e_meias_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onFeedback('✓ Planilha de leads para E-mail Marketing baixada com sucesso!');
  };

  
  // Sequential Sending Logic
  useEffect(() => {
    if (!isSequentialRunning || sequentialQueue.length === 0) return;

    const handleFocus = () => {
      // Small delay to ensure the window focus isn't jarring
      setTimeout(() => {
        if (sequentialQueue.length > 0) {
          const nextCust = sequentialQueue[0];
          setSequentialQueue(prev => prev.slice(1));
          handleSendSingleWhatsApp(nextCust, true); // true = from sequential
        } else {
          setIsSequentialRunning(false);
          alert('Disparo Sequencial Finalizado!');
        }
      }, 1000);
    };

    window.addEventListener('focus', handleFocus, { once: true });
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [isSequentialRunning, sequentialQueue]);

  const handleStartSequential = () => {
    // Filter audience that has phone and wasn't sent yet
    const pending = searchFilteredAudience.filter(c => {
      const clean = (c.phone || '').replace(/\D/g, '');
      return clean.length >= 8 && !sentCustomerIds.has(c.id);
    });

    if (pending.length === 0) {
      alert('Todos os clientes desta lista já receberam a mensagem ou não possuem telefone válido.');
      return;
    }

    if (confirm(`Iniciar disparo sequencial para ${pending.length} clientes? \n\nO WhatsApp Web será aberto. Envie a mensagem, FECHE a aba do WhatsApp e a próxima abrirá automaticamente.`)) {
      setIsSequentialRunning(true);
      // Trigger the first one manually
      const first = pending[0];
      setSequentialQueue(pending.slice(1));
      handleSendSingleWhatsApp(first, true);
    }
  };

  const handleStopSequential = () => {
    setIsSequentialRunning(false);
    setSequentialQueue([]);
  };

  const handleSendSingleWhatsApp = (cust: Customer, isSequential = false) => {
    const clean = (cust.phone || '').replace(/\D/g, '');
    if (!clean) {
      if (!isSequential) alert(`O cliente ${cust.name} não possui telefone cadastrado.`);
      return;
    }
    const phone55 = clean.startsWith('55') ? clean : `55${clean}`;
    const text = generateMessageText(cust.name, cust.welcomeCoupon || selectedCouponCode);
    const url = `https://wa.me/${phone55}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setSentCustomerIds((prev) => new Set(prev).add(cust.id));
  };


  const toggleProductSelection = (id: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Banco de Dados 100% Salvo & Sincronização */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-[#22032c] via-[#2c0438] to-[#1d0225] border-2 border-pink-500/50 shadow-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-3 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl text-white shadow-lg shrink-0">
            <Send className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-black font-fun text-white">
                Disparador de Novas Promoções & Lançamentos
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-950/90 text-emerald-300 border border-emerald-600/70 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Banco de Dados Persistido
              </span>
            </div>
            <p className="text-xs text-purple-200/80 mt-1 max-w-2xl">
              Envie novas promoções, cupons de desconto e produtos recém-chegados para a sua base de clientes cadastrados diretamente via <strong>WhatsApp</strong> e <strong>E-mail</strong>.
            </p>
          </div>
        </div>

        {/* Sync action */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={handleSyncOrders}
            disabled={isSyncing}
            className="px-4 py-2.5 rounded-xl bg-purple-900/80 hover:bg-purple-800 text-purple-100 border border-purple-600/70 text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50"
            title="Verifica todos os pedidos da loja e garante que 100% dos clientes estejam salvos no banco de dados"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Sincronizando...' : 'Garantir Clientes dos Pedidos'}</span>
          </button>
        </div>
      </div>

      {/* Grid: Configuração da Campanha (Esquerda) vs Preview & Ações (Direita) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* COLUNA ESQUERDA: Configurações (7 colunas) */}
        <div className="lg:col-span-7 space-y-5">
          {/* 1. Escolha do Tipo de Campanha */}
          <div className="p-5 rounded-3xl bg-[#1d0224] border border-purple-800/60 shadow-xl space-y-4">
            <h3 className="text-sm font-black font-fun text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-pink-400" />
              1. Selecione o Objetivo da Mensagem
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                type="button"
                onClick={() => setCampaignType('cupom')}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between gap-2 transition-all cursor-pointer ${
                  campaignType === 'cupom'
                    ? 'bg-gradient-to-br from-pink-600/30 to-purple-800/40 border-pink-500 text-white shadow-lg'
                    : 'bg-[#15011b] border-purple-900/60 text-purple-300 hover:border-purple-700'
                }`}
              >
                <div className="p-2 rounded-xl bg-pink-500/20 text-pink-400 w-fit">
                  <Gift className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Cupom de Desconto</p>
                  <p className="text-[10px] text-purple-300/70">Oferta exclusiva</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setCampaignType('novos_produtos')}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between gap-2 transition-all cursor-pointer ${
                  campaignType === 'novos_produtos'
                    ? 'bg-gradient-to-br from-pink-600/30 to-purple-800/40 border-pink-500 text-white shadow-lg'
                    : 'bg-[#15011b] border-purple-900/60 text-purple-300 hover:border-purple-700'
                }`}
              >
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 w-fit">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Novos Produtos</p>
                  <p className="text-[10px] text-purple-300/70">Lançamentos</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setCampaignType('frete_gratis')}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between gap-2 transition-all cursor-pointer ${
                  campaignType === 'frete_gratis'
                    ? 'bg-gradient-to-br from-pink-600/30 to-purple-800/40 border-pink-500 text-white shadow-lg'
                    : 'bg-[#15011b] border-purple-900/60 text-purple-300 hover:border-purple-700'
                }`}
              >
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 w-fit">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Frete Grátis</p>
                  <p className="text-[10px] text-purple-300/70">Acima de R$ 99</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setCampaignType('personalizado')}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between gap-2 transition-all cursor-pointer ${
                  campaignType === 'personalizado'
                    ? 'bg-gradient-to-br from-pink-600/30 to-purple-800/40 border-pink-500 text-white shadow-lg'
                    : 'bg-[#15011b] border-purple-900/60 text-purple-300 hover:border-purple-700'
                }`}
              >
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 w-fit">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Personalizado</p>
                  <p className="text-[10px] text-purple-300/70">Texto livre</p>
                </div>
              </button>
            </div>

            {/* Configurações específicas conforme campanha */}
            {campaignType === 'cupom' && (
              <div className="p-4 rounded-2xl bg-[#14011a] border border-pink-900/40 space-y-3">
                <label className="text-xs font-bold text-pink-300 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" />
                  Cupom a Enviar na Mensagem:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {availableCoupons.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedCouponCode(c.code)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        selectedCouponCode.toUpperCase() === c.code.toUpperCase()
                          ? 'bg-pink-950/80 border-pink-500 text-white'
                          : 'bg-[#1b0222] border-purple-900/50 text-purple-300 hover:border-purple-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-black text-xs text-pink-300">{c.code}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-pink-900/50 text-pink-200">
                          {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `R$ ${c.discountValue} OFF`}
                        </span>
                      </div>
                      <p className="text-[10px] text-purple-300/70 mt-1 truncate">
                        {c.minOrderValue ? `Pedido mín: R$ ${c.minOrderValue.toFixed(0)},00` : 'Sem pedido mínimo'}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {campaignType === 'novos_produtos' && (
              <div className="p-4 rounded-2xl bg-[#14011a] border border-purple-900/50 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-purple-200 flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5 text-pink-400" />
                    Selecione os Produtos a Destacar na Mensagem:
                  </label>
                  <span className="text-[11px] text-pink-300 font-bold">
                    {selectedProductIds.length} selecionado(s)
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-52 overflow-y-auto pr-1">
                  {products.slice(0, 12).map((p) => {
                    const isSelected = selectedProductIds.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => toggleProductSelection(p.id)}
                        className={`p-2 rounded-xl border text-left transition-all flex items-center gap-2 cursor-pointer ${
                          isSelected
                            ? 'bg-purple-900/60 border-pink-500 text-white'
                            : 'bg-[#1b0222] border-purple-900/40 text-purple-300 hover:border-purple-700'
                        }`}
                      >
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-9 h-9 rounded-lg object-cover shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-bold text-white truncate">{p.name}</p>
                          <p className="text-[10px] text-emerald-300 font-bold">
                            R$ {Number(p.price).toFixed(2).replace('.', ',')}
                          </p>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-pink-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {campaignType === 'personalizado' && (
              <div className="p-4 rounded-2xl bg-[#14011a] border border-purple-900/50 space-y-2">
                <div className="flex items-center justify-between text-xs text-purple-300">
                  <label className="font-bold">Texto Personalizado da Mensagem:</label>
                  <span className="text-[10px] text-purple-400">Variáveis: {'{nome}'}, {'{cupom}'}, {'{link_loja}'}</span>
                </div>
                <textarea
                  rows={4}
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Olá {nome}! Temos uma super promoção na Doidas & Meias! Use o cupom {cupom} no site {link_loja} e aproveite!"
                  className="w-full p-3 rounded-xl bg-[#1b0222] border border-purple-800/60 text-xs text-white placeholder-purple-400/50 focus:outline-none focus:border-pink-500"
                />
              </div>
            )}
          </div>

          {/* 2. Escolha do Público Alvo (Segmentação) */}
          <div className="p-5 rounded-3xl bg-[#1d0224] border border-purple-800/60 shadow-xl space-y-4">
            <h3 className="text-sm font-black font-fun text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              2. Segmento de Clientes Destinatários
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setAudienceType('optin')}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between gap-1 transition-all cursor-pointer ${
                  audienceType === 'optin'
                    ? 'bg-pink-950/70 border-pink-500 text-white shadow-md'
                    : 'bg-[#15011b] border-purple-900/50 text-purple-300 hover:border-purple-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">Autorizados (Opt-in)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/60 font-bold">
                    Recomendado LGPD
                  </span>
                </div>
                <p className="text-xl font-black text-pink-300 font-fun mt-1">
                  {customers.filter((c) => c.status !== 'anonimizado' && c.emailMarketingConsent !== false).length}
                </p>
                <p className="text-[10px] text-purple-300/70">Clientes que aceitaram promoções</p>
              </button>

              <button
                type="button"
                onClick={() => setAudienceType('compradores')}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between gap-1 transition-all cursor-pointer ${
                  audienceType === 'compradores'
                    ? 'bg-purple-950/70 border-purple-500 text-white shadow-md'
                    : 'bg-[#15011b] border-purple-900/50 text-purple-300 hover:border-purple-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">Compradores (VIPs)</span>
                </div>
                <p className="text-xl font-black text-purple-300 font-fun mt-1">
                  {customers.filter((c) => c.status !== 'anonimizado' && (c.ordersCount || 0) > 0).length}
                </p>
                <p className="text-[10px] text-purple-300/70">Já compraram na loja</p>
              </button>

              <button
                type="button"
                onClick={() => setAudienceType('todos')}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between gap-1 transition-all cursor-pointer ${
                  audienceType === 'todos'
                    ? 'bg-purple-950/70 border-purple-500 text-white shadow-md'
                    : 'bg-[#15011b] border-purple-900/50 text-purple-300 hover:border-purple-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">Todos os Cadastros</span>
                </div>
                <p className="text-xl font-black text-white font-fun mt-1">
                  {customers.filter((c) => c.status !== 'anonimizado').length}
                </p>
                <p className="text-[10px] text-purple-300/70">Toda a base de clientes ativa</p>
              </button>
            </div>
          </div>

          {/* 3. Exportações em Massa (Planilhas & Automações) */}
          <div className="p-5 rounded-3xl bg-[#1d0224] border border-purple-800/60 shadow-xl space-y-3">
            <h3 className="text-sm font-black font-fun text-white flex items-center gap-2">
              <Download className="w-4 h-4 text-emerald-400" />
              3. Exportação & Integração de Disparos
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                onClick={handleDownloadWhatsAppCSV}
                className="p-3 rounded-2xl bg-gradient-to-r from-emerald-950 to-teal-950 hover:from-emerald-900 hover:to-teal-900 text-emerald-200 border border-emerald-600/60 text-xs font-bold flex items-center justify-between gap-2 transition-all cursor-pointer"
                title="Baixar planilha CSV com Nome, Telefone 55 e Mensagem pronta para disparador de WhatsApp"
              >
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>CSV Campanha WhatsApp</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-900/80 text-emerald-300 font-mono">
                  {audience.length} leads
                </span>
              </button>

              <button
                onClick={handleCopyWhatsAppNumbers}
                className="p-3 rounded-2xl bg-[#15011c] hover:bg-purple-900/40 text-purple-200 border border-purple-700/60 text-xs font-bold flex items-center justify-between gap-2 transition-all cursor-pointer"
                title="Copiar lista de telefones com DDI 55 para colar em listas de transmissão"
              >
                <div className="flex items-center gap-2">
                  {copiedField === 'phones' ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-pink-400" />
                  )}
                  <span>{copiedField === 'phones' ? 'Telefones Copiados!' : 'Copiar Telefones (+55)'}</span>
                </div>
              </button>

              <button
                onClick={handleCopyBccEmails}
                className="p-3 rounded-2xl bg-[#15011c] hover:bg-purple-900/40 text-pink-300 border border-pink-700/50 text-xs font-bold flex items-center justify-between gap-2 transition-all cursor-pointer"
                title="Copiar todos os e-mails para colar em CCO no Gmail/Outlook com privacidade LGPD"
              >
                <div className="flex items-center gap-2">
                  {copiedField === 'emails' ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Mail className="w-4 h-4 text-pink-400" />
                  )}
                  <span>{copiedField === 'emails' ? 'E-mails Copiados!' : 'Copiar E-mails em CCO'}</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-pink-950 text-pink-300">
                  {audience.filter((c) => c.email?.includes('@')).length}
                </span>
              </button>

              <button
                onClick={handleDownloadEmailCSV}
                className="p-3 rounded-2xl bg-[#15011c] hover:bg-purple-900/40 text-purple-200 border border-purple-700/60 text-xs font-bold flex items-center justify-between gap-2 transition-all cursor-pointer"
                title="Exportar base de leads para Mailchimp, Brevo ou RD Station"
              >
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-purple-400" />
                  <span>CSV E-mail Marketing</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: Preview do WhatsApp & Disparo 1-a-1 (5 colunas) */}
        <div className="lg:col-span-5 space-y-5">
          {/* WhatsApp Realistic Preview Balloon */}
          <div className="p-5 rounded-3xl bg-[#0b141a] border border-emerald-900/60 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-emerald-950 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-black text-emerald-300">Prévia do WhatsApp</span>
              </div>
              <span className="text-[10px] text-slate-400">Doidas & Meias • Oficial</span>
            </div>

            {/* Balloon */}
            <div className="bg-[#005c4b] text-white p-3.5 rounded-2xl rounded-tr-none text-xs leading-relaxed whitespace-pre-line shadow-md border border-emerald-700/40">
              {generateMessageText()}
              <div className="text-[9px] text-emerald-200/60 text-right mt-1.5 flex items-center justify-end gap-1">
                <span>10:30</span>
                <Check className="w-3 h-3 text-cyan-300 inline" />
              </div>
            </div>

            {/* Quick copy text */}
            <button
              onClick={() => {
                navigator.clipboard.writeText(generateMessageText());
                setCopiedField('preview_text');
                onFeedback('✓ Texto da mensagem copiado para a área de transferência!');
                setTimeout(() => setCopiedField(null), 3000);
              }}
              className="w-full py-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/60 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedField === 'preview_text' ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span>{copiedField === 'preview_text' ? 'Texto Copiado!' : 'Copiar Texto da Mensagem'}</span>
            </button>
          </div>

          {/* Disparo Direto 1-a-1 via WhatsApp */}
          <div className="p-5 rounded-3xl bg-[#1d0224] border border-purple-800/60 shadow-xl space-y-3 flex flex-col max-h-[480px]">

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black uppercase text-pink-400 tracking-wider">
                  Disparo Direto 1-a-1
                </h4>
                <p className="text-[10px] text-purple-300/70 mt-0.5">
                  Clique para abrir o WhatsApp Web com a mensagem pronta para cada cliente.
                </p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-950 text-pink-300 border border-pink-700/60 font-bold">
                {sentCustomerIds.size} enviados
              </span>
            </div>
            
            {/* Sequential Actions */}
            <div className="flex items-center gap-2">
              {!isSequentialRunning ? (
                <button
                  onClick={handleStartSequential}
                  className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  Iniciar Disparo Sequencial
                </button>
              ) : (
                <button
                  onClick={handleStopSequential}
                  className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2 animate-pulse"
                >
                  <X className="w-3.5 h-3.5" />
                  Parar Disparo (Restam {sequentialQueue.length})
                </button>
              )}
            </div>


            
            {/* Search inside audience */}
            <div className="flex gap-2 relative">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar na lista..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#14011a] border border-purple-800/60 text-xs text-white placeholder-purple-400/50 focus:outline-none focus:border-pink-500"
                />
              </div>
              <button
                type="button"
                onClick={() => setIsAddingCustomer(true)}
                className="px-3 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs flex items-center gap-1 shadow-md transition-colors"
                title="Adicionar Cliente Manualmente"
              >
                + Adicionar
              </button>
            </div>
            
            {isAddingCustomer && (
              <div className="p-3 rounded-xl bg-pink-950/30 border border-pink-500/50 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-bold text-pink-300">Novo Cliente</span>
                  <button onClick={() => setIsAddingCustomer(false)} className="text-purple-400 hover:text-white"><X className="w-3.5 h-3.5" /></button>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCustName}
                    onChange={(e) => setNewCustName(e.target.value)}
                    placeholder="Nome"
                    className="flex-1 min-w-0 px-2 py-1.5 rounded-lg bg-[#14011a] border border-purple-800/60 text-xs text-white focus:outline-none focus:border-pink-500"
                  />
                  <input
                    type="text"
                    value={newCustPhone}
                    onChange={(e) => setNewCustPhone(e.target.value)}
                    placeholder="WhatsApp"
                    className="flex-1 min-w-0 px-2 py-1.5 rounded-lg bg-[#14011a] border border-purple-800/60 text-xs text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
                <button
                  onClick={handleQuickAddCustomer}
                  className="w-full py-1.5 rounded-lg bg-pink-600 hover:bg-pink-500 text-white font-bold text-[11px]"
                >
                  Salvar
                </button>
              </div>
            )}


            {/* Customers list for 1-on-1 click */}
            <div className="divide-y divide-purple-900/40 overflow-y-auto flex-1 pr-1">
              {searchFilteredAudience.length > 0 ? (
                searchFilteredAudience.map((cust) => {
                  const hasPhone = Boolean(cust.phone && (cust.phone || "").replace(/\D/g, '').length >= 8);
                  const isSent = sentCustomerIds.has(cust.id);

                  return (
                    <div
                      key={cust.id}
                      className="py-2.5 flex items-center justify-between gap-2 hover:bg-purple-950/20 px-1 rounded-xl transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white truncate">{cust.name}</span>
                          {isSent && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-700/50 flex items-center gap-0.5 font-bold">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              Enviado
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-purple-300/70 truncate">
                          {cust.phone || 'Sem telefone'} {cust.city ? `• ${cust.city}` : ''}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSendSingleWhatsApp(cust)}
                        disabled={!hasPhone}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 transition-all cursor-pointer ${
                          hasPhone
                            ? isSent
                              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 hover:bg-emerald-900'
                              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                        title={hasPhone ? 'Abrir conversa com mensagem promocional' : 'Cliente sem telefone'}
                      >
                        <Send className="w-3 h-3" />
                        <span>{isSent ? 'Reenviar' : 'Enviar'}</span>
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-xs text-purple-400/60">
                  Nenhum cliente encontrado no segmento selecionado.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
