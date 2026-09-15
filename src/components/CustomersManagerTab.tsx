import React, { useState } from 'react';
import {
  Users, Plus,
  ShieldCheck,
  Search,
  Download,
  Trash2,
  Eye,
  EyeOff,
  Phone,
  Mail,
  MapPin,
  Calendar,
  ShoppingBag,
  RefreshCw,
  FileText,
  UserCheck,
  AlertTriangle,
  X,
  ExternalLink,
  ShieldAlert,
  Gift,
  Sparkles,
  Database,
  Check,
  Copy,
  MailCheck,
  Send,
  MessageSquare,
  Share2,
} from 'lucide-react';
import { Customer, Order, Product, StoreSettings } from '../types';
import { syncCustomersFromOrdersOnServer, saveCustomerToServer } from '../services/storeApi';
import { CustomersMarketingBroadcast } from './CustomersMarketingBroadcast';

interface CustomersManagerTabProps {
  customers: Customer[];
  orders: Order[];
  products?: Product[];
  settings?: StoreSettings;
  onRefresh: () => void;
  onAnonymizeCustomer: (id: string) => Promise<void>;
  onDeleteCustomer: (id: string) => Promise<void>;
}

export const CustomersManagerTab: React.FC<CustomersManagerTabProps> = ({
  customers,
  orders,
  products = [],
  settings,
  onRefresh,
  onAnonymizeCustomer,
  onDeleteCustomer,
}) => {
  const [subTab, setSubTab] = useState<'clientes' | 'disparador'>('clientes');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'with_orders' | 'marketing_optin' | 'anonymized'>('all');
  const [privacyMode, setPrivacyMode] = useState(false); // Mascara telefones e emails na tela
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [copiedEmails, setCopiedEmails] = useState(false);

  // Sincronizar todos os pedidos com o banco de clientes para garantir 100% de persistência

  const handleQuickAddCustomer = async () => {
    if (!newCustName.trim() || !newCustPhone.trim()) {
      alert('Por favor, preencha nome e WhatsApp.');
      return;
    }
    
    // Add a basic manual customer
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
      await triggerRefresh();
      setActionFeedback('Cliente adicionado com sucesso!');
      setTimeout(() => setActionFeedback(null), 4000);
    } else {
      alert('Erro ao adicionar cliente: ' + (res.message || 'Erro desconhecido.'));
    }
  };

  const handleSyncOrders = async () => {
    setIsSyncing(true);
    try {
      const res = await syncCustomersFromOrdersOnServer();
      if (res.success) {
        await onRefresh();
        setActionFeedback(res.message || 'Banco de clientes sincronizado com todos os pedidos com sucesso!');
        setTimeout(() => setActionFeedback(null), 4000);
      } else {
        alert(`Erro ao sincronizar clientes: ${res.message}`);
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const triggerRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
      setActionFeedback('Lista de clientes atualizada do servidor com sucesso!');
      setTimeout(() => setActionFeedback(null), 3500);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Masking helpers for LGPD / Screen Privacy
  const maskPhone = (phone?: string) => {
    if (!phone) return 'Não informado';
    if (!privacyMode) return phone;
    const digits = (phone || "").replace(/\D/g, '');
    if (digits.length >= 8) {
      return (phone || "").replace(/(\d{2})\s*(\d{4,5})[-.\s]?(\d{4})/, '$1 *****-$3');
    }
    return '*****';
  };

  const maskEmail = (email?: string) => {
    if (!email) return 'Não informado';
    if (!privacyMode) return email;
    const [user, domain] = email.split('@');
    if (!domain) return '*****';
    const maskedUser = user.length > 2 ? `${user.substring(0, 2)}***` : '***';
    return `${maskedUser}@${domain}`;
  };

  // Filter logic
  const filteredCustomers = customers.filter((c) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (c.name || '').toLowerCase().includes(term) ||
      (c.phone && c.phone.includes(term)) ||
      (c.email && c.email.toLowerCase().includes(term)) ||
      (c.city && c.city.toLowerCase().includes(term));

    if (!matchesSearch) return false;

    if (filterStatus === 'active') return c.status !== 'anonimizado';
    if (filterStatus === 'anonymized') return c.status === 'anonimizado';
    if (filterStatus === 'marketing_optin') {
      return Boolean(c.email && c.email.includes('@') && c.emailMarketingConsent !== false);
    }
    if (filterStatus === 'with_orders') {
      const ordersCount = c.ordersCount || 0;
      return ordersCount > 0;
    }
    return true;
  });

  // Aggregated metrics
  const totalCustomers = customers.length;
  const customersWithEmail = customers.filter((c) => c.email && c.email.includes('@'));
  const marketingOptInCustomers = customers.filter(
    (c) => c.email && c.email.includes('@') && c.emailMarketingConsent !== false
  );
  const lgpdCompliantCount = customers.filter((c) => c.lgpdConsent).length;
  const totalOrdersLinked = customers.reduce((acc, c) => acc + (c.ordersCount || 0), 0);
  const totalRevenue = customers.reduce((acc, c) => acc + (c.totalSpent || 0), 0);

  // Copy authorized emails to clipboard (for sending newsletters/coupons in Gmail or Mailer)
  const handleCopyAuthorizedEmails = () => {
    const emailsList = marketingOptInCustomers
      .map((c) => c.email?.trim())
      .filter((e): e is string => Boolean(e && e.includes('@')));

    if (emailsList.length === 0) {
      alert('Nenhum e-mail com autorização encontrado.');
      return;
    }

    navigator.clipboard.writeText(emailsList.join(', '));
    setCopiedEmails(true);
    setActionFeedback(`✓ ${emailsList.length} e-mails autorizados copiados para a área de transferência!`);
    setTimeout(() => {
      setCopiedEmails(false);
      setActionFeedback(null);
    }, 4000);
  };

  // Export CSV (Full Customer Database with Marketing Consent & LGPD Compliance)
  const handleExportAllCSV = () => {
    if (customers.length === 0) {
      alert('Não há clientes cadastrados para exportar.');
      return;
    }

    const headers = [
      'ID',
      'Nome',
      'WhatsApp',
      'Email',
      'CPF',
      'CEP',
      'Endereco',
      'Cidade',
      'Data Cadastro',
      'Consentimento LGPD',
      'Data Consentimento LGPD',
      'Autorizacao Marketing Email',
      'Data Autorizacao Marketing',
      'Cupom Boas Vindas',
      'Status',
      'Qtd Pedidos',
      'Total Gasto (R$)',
    ];

    const rows = customers.map((c) => [
      `"${c.id}"`,
      `"${(c.name || "").replace(/"/g, '""')}"`,
      `"${c.phone || ''}"`,
      `"${c.email || ''}"`,
      `"${c.cpf || ''}"`,
      `"${c.cep || ''}"`,
      `"${(c.address || '').replace(/"/g, '""')}"`,
      `"${c.city || ''}"`,
      `"${c.createdAt ? new Date(c.createdAt).toLocaleDateString('pt-BR') : ''}"`,
      `"${c.lgpdConsent ? 'SIM' : 'PENDENTE'}"`,
      `"${c.lgpdConsentDate ? new Date(c.lgpdConsentDate).toLocaleString('pt-BR') : ''}"`,
      `"${c.emailMarketingConsent !== false ? 'AUTORIZADO (Sim)' : 'NAO'}"`,
      `"${c.emailMarketingConsentDate ? new Date(c.emailMarketingConsentDate).toLocaleString('pt-BR') : ''}"`,
      `"${c.welcomeCoupon || 'BEMVINDA10'}"`,
      `"${c.status || 'ativo'}"`,
      c.ordersCount || 0,
      (c.totalSpent || 0).toFixed(2),
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `banco_clientes_completo_doidas_e_meias_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export CSV specifically for Email Marketing & Coupons (Only Opt-in leads)
  const handleExportMarketingCSV = () => {
    if (marketingOptInCustomers.length === 0) {
      alert('Nenhum cliente com autorização de e-mail marketing cadastrado no momento.');
      return;
    }

    const headers = [
      'Nome',
      'Email',
      'WhatsApp',
      'Cidade',
      'Cupom_Desconto',
      'Autorizacao_Marketing',
      'Data_Autorizacao',
      'Status',
    ];

    const rows = marketingOptInCustomers.map((c) => [
      `"${(c.name || "").replace(/"/g, '""')}"`,
      `"${c.email || ''}"`,
      `"${c.phone || ''}"`,
      `"${c.city || ''}"`,
      `"${c.welcomeCoupon || 'BEMVINDA10'}"`,
      `"SIM (Opt-in Confirmado)"`,
      `"${c.emailMarketingConsentDate ? new Date(c.emailMarketingConsentDate).toLocaleString('pt-BR') : ''}"`,
      `"${c.status || 'ativo'}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `leads_cupons_e_ofertas_doidas_e_meias_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export Individual Customer Data (LGPD Art. 18, V - Portabilidade de Dados do Titular)
  const handleExportSingleCustomer = (cust: Customer) => {
    const custOrders = orders.filter(
      (o) =>
        o.customerId === cust.id ||
        (cust.phone && o.customerPhone && String(o.customerPhone).replace(/\D/g, '') === String(cust.phone).replace(/\D/g, ''))
    );

    const exportData = {
      termo: 'Relatório de Dados Pessoais do Titular - LGPD (Lei nº 13.709/2018)',
      empresa: 'Doidas e Meias Moda Divertida LTDA',
      dataExtracao: new Date().toISOString(),
      baseLegal: 'Art. 7º, V (Execução de contrato de compra e venda) e Art. 7º, I (Consentimento)',
      titular: {
        id: cust.id,
        nome: cust.name,
        telefone: cust.phone,
        email: cust.email,
        endereco: cust.address,
        cep: cust.cep,
        bairro: cust.neighborhood,
        cidade: cust.city,
        complemento: cust.complement,
        dataCadastro: cust.createdAt,
        consentimentoLGPD: cust.lgpdConsent,
        dataConsentimentoLGPD: cust.lgpdConsentDate,
        versaoTermos: cust.lgpdVersion || 'v1.0',
        statusConta: cust.status || 'ativo',
      },
      historicoPedidos: custOrders.map((o) => ({
        numeroPedido: o.orderNumber,
        data: o.createdAt,
        total: o.total,
        status: o.status,
        itens: (o.items || []).map((it) => ({
          produto: it.product.name,
          quantidade: it.quantity,
          precoUnitario: it.product.price,
        })),
      })),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dados_pessoais_lgpd_${(cust.name || 'cliente').replace(/\s+/g, '_').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAnonymize = async (cust: Customer) => {
    const confirm1 = window.confirm(
      `Anonimizar dados de "${cust.name}" conforme Art. 18, IV da LGPD?\n\nIsso removerá nome, telefone, e-mail e endereço da base de dados, mantendo apenas as estatísticas de pedidos agregadas sem identificação pessoal.`
    );
    if (!confirm1) return;

    await onAnonymizeCustomer(cust.id);
    setActionFeedback(`Dados do cliente anonimizados com sucesso em conformidade com a LGPD!`);
    setTimeout(() => setActionFeedback(null), 4000);
    if (selectedCustomer?.id === cust.id) {
      setSelectedCustomer(null);
    }
  };

  const handleDelete = async (cust: Customer) => {
    const confirm1 = window.confirm(
      `ATENÇÃO: Deseja EXCLUIR DEFINITIVAMENTE o cadastro de "${cust.name}" da base de dados (Art. 18, VI da LGPD)?\n\nEssa ação é irreversível.`
    );
    if (!confirm1) return;

    await onDeleteCustomer(cust.id);
    setActionFeedback(`Cadastro de "${cust.name}" removido permanentemente com sucesso.`);
    setTimeout(() => setActionFeedback(null), 4000);
    if (selectedCustomer?.id === cust.id) {
      setSelectedCustomer(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#23032b] p-5 rounded-3xl border border-purple-800/60 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-pink-600 to-purple-700 rounded-2xl text-white shadow-lg">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black font-fun text-white">
                Contas de Clientes & Conformidade LGPD
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Lei 13.709/2018
              </span>
            </div>
            <p className="text-xs text-purple-200/70 mt-0.5">
              Visualização central das contas criadas em "Minha Conta" e no Carrinho, salvas diretamente no banco de dados.
            </p>
          </div>
        </div>

        {/* Global actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setPrivacyMode(!privacyMode)}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
              privacyMode
                ? 'bg-amber-950/60 text-amber-300 border-amber-600/60'
                : 'bg-purple-950/60 text-purple-200 border-purple-700/60 hover:text-white'
            }`}
            title="Oculta telefones e e-mails na tela para evitar vazamentos ao compartilhar a tela"
          >
            {privacyMode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{privacyMode ? 'Privacidade: ATIVA (Mascarado)' : 'Modo Privacidade'}</span>
          </button>

          <button
            onClick={handleSyncOrders}
            disabled={isSyncing}
            className="px-3.5 py-2 rounded-xl bg-purple-900/80 hover:bg-purple-800 text-purple-100 border border-purple-600/70 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            title="Varre todos os pedidos da loja e garante que 100% dos compradores estejam salvos no banco de dados de clientes"
          >
            <Database className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : 'text-pink-400'}`} />
            <span>{isSyncing ? 'Sincronizando...' : 'Garantir Clientes dos Pedidos'}</span>
          </button>

          <button
            onClick={triggerRefresh}
            disabled={isRefreshing}
            className="px-3 py-2 rounded-xl bg-purple-900/60 hover:bg-purple-800/80 text-purple-100 border border-purple-700/60 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Recarregar</span>
          </button>

          <button
            onClick={handleCopyAuthorizedEmails}
            className="px-3.5 py-2 rounded-xl bg-[#1b0222] hover:bg-[#25032f] text-pink-300 border border-pink-700/50 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Copiar todos os e-mails com consentimento de ofertas"
          >
            {copiedEmails ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedEmails ? 'Copiados!' : 'Copiar E-mails'}</span>
          </button>

          <a
            href="/api/store/customers/export-whatsapp.csv"
            download
            className="px-3.5 py-2 rounded-xl bg-emerald-950/70 hover:bg-emerald-900 text-emerald-200 border border-emerald-600/60 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Baixar lista formatada com nomes, números +55, cupom e cidade para WhatsApp Marketing"
          >
            <Send className="w-3.5 h-3.5 text-emerald-400" />
            <span>CSV WhatsApp</span>
          </a>

          <button
            onClick={handleExportMarketingCSV}
            className="px-3.5 py-2 rounded-xl bg-pink-950/70 hover:bg-pink-900 text-pink-200 border border-pink-700/60 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Baixar CSV apenas com clientes que autorizaram receber cupons e ofertas"
          >
            <Gift className="w-3.5 h-3.5 text-pink-400" />
            <span>CSV Cupons ({marketingOptInCustomers.length})</span>
          </button>

          <button
            onClick={handleExportAllCSV}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:opacity-90 text-white text-xs font-black flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
            title="Baixar banco de dados completo de clientes em formato CSV para Excel"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV Completo</span>
          </button>
        </div>
      </div>

      {/* Sub-tab Navigation: Base de Clientes vs Disparador de Campanhas */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-[#1a0121] rounded-2xl border border-purple-900/60 w-fit">
        <button
          type="button"
          onClick={() => setSubTab('clientes')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
            subTab === 'clientes'
              ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md'
              : 'text-purple-300 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Base de Clientes & LGPD ({customers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('disparador')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
            subTab === 'disparador'
              ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md'
              : 'text-pink-300 hover:text-white bg-pink-950/40 border border-pink-700/50'
          }`}
        >
          <Send className="w-4 h-4 text-pink-400" />
          <span>Disparo de Promoções & Lançamentos</span>
          <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-pink-500 text-white font-bold animate-pulse">
            WhatsApp & E-mail
          </span>
        </button>
      </div>

      {/* Action feedback toast */}
      {actionFeedback && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-600/70 text-emerald-200 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {subTab === 'disparador' ? (
        <CustomersMarketingBroadcast
          customers={customers}
          orders={orders}
          products={products}
          settings={settings}
          onRefreshCustomers={onRefresh}
          onFeedback={(msg) => {
            setActionFeedback(msg);
            setTimeout(() => setActionFeedback(null), 4000);
          }}
        />
      ) : (
        <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-[#1e0225] border border-purple-800/60 flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-pink-500/20 border border-pink-500/40 text-pink-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-purple-300/80 font-bold uppercase tracking-wider">
              Contas Cadastradas
            </p>
            <p className="text-2xl font-black font-fun text-white mt-0.5">
              {totalCustomers}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#1e0225] border border-purple-800/60 flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-purple-300/80 font-bold uppercase tracking-wider">
              Consentimento LGPD
            </p>
            <p className="text-2xl font-black font-fun text-emerald-300 mt-0.5">
              {lgpdCompliantCount} / {totalCustomers}
              <span className="text-xs text-emerald-400/80 font-medium ml-1.5">
                ({totalCustomers > 0 ? Math.round((lgpdCompliantCount / totalCustomers) * 100) : 100}%)
              </span>
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#1e0225] border border-purple-800/60 flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-purple-300/80 font-bold uppercase tracking-wider">
              Pedidos Vinculados
            </p>
            <p className="text-2xl font-black font-fun text-amber-300 mt-0.5">
              {totalOrdersLinked}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#1e0225] border border-purple-800/60 flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-purple-300/80 font-bold uppercase tracking-wider">
              Faturamento Clientes
            </p>
            <p className="text-2xl font-black font-fun text-white mt-0.5">
              R$ {totalRevenue.toFixed(2).replace('.', ',')}
            </p>
          </div>
        </div>
      </div>

      {/* SEÇÃO DEDICADA: BANCO DE DADOS PARA EMAIL MARKETING & CUPONS */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-[#200329] via-[#280433] to-[#1a0224] border-2 border-pink-600/50 shadow-2xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-pink-900/40 pb-4">
          <div className="flex items-start gap-3.5">
            <div className="p-3 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl text-white shadow-lg shrink-0">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-black font-fun text-white">
                  Banco de Dados para E-mail Marketing, Ofertas & Cupons
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-pink-500/25 text-pink-300 border border-pink-500/40 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-pink-400" />
                  Consentimento LGPD Ativo
                </span>
              </div>
              <p className="text-xs text-purple-200/80 mt-1">
                Lista de clientes cadastrados que autorizaram receber e-mails com cupons secretos, novidades e ofertas exclusivas da <strong>Doidas e Meias</strong>.
              </p>
            </div>
          </div>

          {/* Direct server download links */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <a
              href="/api/store/customers/export.csv?filter=optin"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:opacity-95 text-white text-xs font-black flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
              title="Baixar CSV com leads autorizados direto do servidor"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar CSV Leads (Cupons)</span>
            </a>

            <a
              href="/api/store/customers/export.csv"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-purple-900/80 hover:bg-purple-800 text-purple-100 border border-purple-700/60 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Baixar arquivo CSV completo com todos os cadastros"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Baixar CSV Geral</span>
            </a>

            <button
              onClick={handleCopyAuthorizedEmails}
              className="px-3.5 py-2 rounded-xl bg-[#180120] hover:bg-[#23022e] text-pink-300 border border-pink-700/50 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedEmails ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedEmails ? 'Copiados!' : 'Copiar E-mails'}</span>
            </button>
          </div>
        </div>

        {/* Marketing KPI Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-[#16011c] border border-purple-900/60">
            <p className="text-[10px] uppercase font-bold text-purple-300/70">Total de E-mails Coletados</p>
            <p className="text-xl font-black text-white font-fun mt-0.5">{customersWithEmail.length}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#16011c] border border-pink-800/60">
            <p className="text-[10px] uppercase font-bold text-pink-300">Autorizados para Cupons</p>
            <p className="text-xl font-black text-pink-400 font-fun mt-0.5">{marketingOptInCustomers.length}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#16011c] border border-emerald-800/60">
            <p className="text-[10px] uppercase font-bold text-emerald-300">Taxa de Adesão</p>
            <p className="text-xl font-black text-emerald-400 font-fun mt-0.5">
              {customersWithEmail.length > 0
                ? Math.round((marketingOptInCustomers.length / customersWithEmail.length) * 100)
                : 100}%
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#16011c] border border-amber-800/60">
            <p className="text-[10px] uppercase font-bold text-amber-300">Cupom de Entrada</p>
            <p className="text-xs font-black text-amber-300 font-mono mt-1 bg-amber-950/60 px-2 py-1 rounded-lg border border-amber-700/50 inline-block">
              BEMVINDA10 (10% OFF a partir de R$ 150)
            </p>
            <p className="text-[9px] text-purple-300/80 mt-1">
              Desconto ativo para pedidos a partir de R$ 150,00
            </p>
          </div>
        </div>
      </div>

      {/* LGPD Compliance Informational Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#17011d] to-[#25032d] border border-purple-700/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        <div className="flex items-start gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-white block">
              Tratamento de Dados em Conformidade com a Lei Geral de Proteção de Dados (LGPD)
            </span>
            <span className="text-purple-300/80 text-[11px]">
              Base Legal: <strong>Art. 7º, V</strong> (Execução de contrato e processamento de pedidos de compra) e <strong>Art. 7º, I</strong> (Consentimento registrado na criação da conta). Os titulares possuem garantido o direito de acesso, retificação, portabilidade e exclusão/anonimização a qualquer momento.
            </span>
          </div>
        </div>
        <div className="text-[11px] text-purple-300/60 whitespace-nowrap bg-purple-950/60 px-3 py-1.5 rounded-xl border border-purple-800/60 self-stretch md:self-auto text-center">
          Registros criptografados no servidor
        </div>
      </div>

      
      {/* Filters & Search bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#1d0224] p-3.5 rounded-2xl border border-purple-900/60">
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pesquisar..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#14011a] border border-purple-800/60 text-xs text-white placeholder-purple-400/50 focus:outline-none focus:border-pink-500"
            />
          </div>
          <button
            onClick={() => setIsAddingCustomer(true)}
            className="px-3 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar</span>
          </button>
        </div>


        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
              filterStatus === 'all'
                ? 'bg-pink-600 text-white shadow-sm'
                : 'bg-purple-950/50 text-purple-300 hover:text-white'
            }`}
          >
            Todos ({customers.length})
          </button>
          <button
            onClick={() => setFilterStatus('marketing_optin')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              filterStatus === 'marketing_optin'
                ? 'bg-pink-600 text-white shadow-sm'
                : 'bg-purple-950/50 text-pink-300 hover:text-white'
            }`}
          >
            <Gift className="w-3 h-3" />
            <span>Com Cupons ({marketingOptInCustomers.length})</span>
          </button>
          <button
            onClick={() => setFilterStatus('active')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
              filterStatus === 'active'
                ? 'bg-pink-600 text-white shadow-sm'
                : 'bg-purple-950/50 text-purple-300 hover:text-white'
            }`}
          >
            Ativos ({customers.filter((c) => c.status !== 'anonimizado').length})
          </button>
          <button
            onClick={() => setFilterStatus('with_orders')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
              filterStatus === 'with_orders'
                ? 'bg-pink-600 text-white shadow-sm'
                : 'bg-purple-950/50 text-purple-300 hover:text-white'
            }`}
          >
            Com Compras ({customers.filter((c) => (c.ordersCount || 0) > 0).length})
          </button>
          <button
            onClick={() => setFilterStatus('anonymized')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
              filterStatus === 'anonymized'
                ? 'bg-pink-600 text-white shadow-sm'
                : 'bg-purple-950/50 text-purple-300 hover:text-white'
            }`}
          >
            Anonimizados ({customers.filter((c) => c.status === 'anonimizado').length})
          </button>
        </div>
      </div>

      {/* Customer List */}
      <div className="bg-[#1c0222] rounded-3xl border border-purple-800/60 overflow-hidden shadow-xl">
        {filteredCustomers.length > 0 ? (
          <div className="divide-y divide-purple-900/40">
            {filteredCustomers.map((cust) => {
              const isAnonymized = cust.status === 'anonimizado';
              const cleanPhone = cust.phone ? (cust.phone || "").replace(/\D/g, '') : '';
              const whatsappLink = cleanPhone ? `https://wa.me/55${cleanPhone}` : null;

              return (
                <div
                  key={cust.id}
                  className="p-4 sm:p-5 hover:bg-purple-950/30 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  {/* Customer Info */}
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center text-sm font-black font-fun shadow-md shrink-0 ${
                        isAnonymized
                          ? 'bg-slate-800 text-slate-400 border border-slate-700'
                          : 'bg-gradient-to-tr from-pink-600 to-purple-600 text-white'
                      }`}
                    >
                      {cust.name ? cust.name.charAt(0).toUpperCase() : '?'}
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-white text-sm truncate">
                          {cust.name}
                        </span>

                        {/* Status Badges */}
                        {isAnonymized ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/80 text-amber-300 border border-amber-800/60">
                            Anonimizado (LGPD)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 flex items-center gap-1">
                            <ShieldCheck className="w-2.5 h-2.5" />
                            Consentimento Válido
                          </span>
                        )}

                        {cust.emailMarketingConsent !== false && cust.email ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-pink-950/80 text-pink-300 border border-pink-700/60 flex items-center gap-1">
                            <Gift className="w-2.5 h-2.5 text-pink-400" />
                            Autorizou Cupons & Ofertas
                          </span>
                        ) : null}

                        {cust.ordersCount && cust.ordersCount > 0 ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-900/60 text-purple-200 border border-purple-700/60">
                            {cust.ordersCount} {cust.ordersCount === 1 ? 'pedido' : 'pedidos'} • R$ {(Number(cust.totalSpent) || 0).toFixed(2).replace('.', ',')}
                          </span>
                        ) : null}
                      </div>

                      {/* Contact row */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-purple-300/80">
                        {cust.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-pink-400" />
                            <span>{maskPhone(cust.phone)}</span>
                            {whatsappLink && !isAnonymized && (
                              <a
                                href={whatsappLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[11px] text-emerald-400 hover:text-emerald-300 underline font-medium ml-1 flex items-center gap-0.5"
                                title="Abrir conversa no WhatsApp"
                              >
                                Conversar <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                          </div>
                        )}

                        {cust.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-pink-400" />
                            <span>{maskEmail(cust.email)}</span>
                            {!privacyMode && !isAnonymized && (
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(cust.email || '');
                                  setActionFeedback(`E-mail ${cust.email} copiado!`);
                                  setTimeout(() => setActionFeedback(null), 2500);
                                }}
                                className="text-[10px] text-pink-400 hover:text-pink-300 ml-1 cursor-pointer"
                                title="Copiar e-mail"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        )}

                        {cust.city && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-amber-400" />
                            <span>{cust.city}</span>
                          </div>
                        )}

                        {cust.createdAt && (
                          <div className="flex items-center gap-1 text-[11px] text-purple-400/70">
                            <Calendar className="w-3 h-3" />
                            <span>Desde: {new Date(cust.createdAt).toLocaleDateString('pt-BR')}</span>
                          </div>
                        )}
                      </div>

                      {/* Delivery address snippet if available */}
                      {cust.address && !isAnonymized && (
                        <p className="text-[11px] text-purple-400/80 truncate max-w-xl">
                          Endereço: {cust.address} {cust.cep ? `(CEP: ${cust.cep})` : ''}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-2 self-end lg:self-center shrink-0">
                    {!isAnonymized && cust.phone && (
                      <button
                        type="button"
                        onClick={() => {
                          const cleanPhone = cust.phone ? (cust.phone || "").replace(/\D/g, '') : '';
                          if (!cleanPhone) return;
                          const phone55 = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
                          const firstName = cust.name ? cust.name.split(' ')[0] : 'amiga';
                          const coupon = cust.welcomeCoupon || settings?.welcomeCouponCode || 'BEMVINDA10';
                          const msg = `Oie, ${firstName}! Tudo bem? 💕 Passando para te presentear com um cupom especial da *Doidas & Meias*!\n\n🎁 Use o cupom *${coupon}* para garantir desconto no seu pedido!\n🚚 *Frete Grátis* a partir de R$ 99,00 para todo o Brasil!\n\nConfira os lançamentos em nosso site:\n👉 ${window.location.origin}\n\nBeijos e boas compras! ✨🧦`;
                          window.open(`https://wa.me/${phone55}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 hover:text-white border border-emerald-700/60 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Enviar cupom e promoção no WhatsApp deste cliente"
                      >
                        <Send className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="hidden sm:inline">Enviar Oferta</span>
                      </button>
                    )}

                    <button
                      onClick={() => setSelectedCustomer(cust)}
                      className="px-3 py-1.5 rounded-xl bg-purple-900/60 hover:bg-purple-800 text-purple-200 text-xs font-bold border border-purple-700/60 flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Ver ficha completa do cliente"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Ficha</span>
                    </button>

                    <button
                      onClick={() => handleExportSingleCustomer(cust)}
                      className="px-3 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900 text-purple-300 hover:text-white text-xs font-bold border border-purple-800/60 flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Exportar dados do titular (Portabilidade LGPD Art. 18, V)"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Portabilidade</span>
                    </button>

                    {!isAnonymized && (
                      <button
                        onClick={() => handleAnonymize(cust)}
                        className="px-3 py-1.5 rounded-xl bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 text-xs font-bold border border-amber-800/60 flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Anonimizar dados pessoais (Art. 18, IV da LGPD)"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Anonimizar</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(cust)}
                      className="p-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 transition-colors cursor-pointer"
                      title="Excluir conta definitivamente (Art. 18, VI da LGPD)"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 px-4 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-purple-900/30 border border-purple-800/60 flex items-center justify-center mx-auto text-purple-400">
              <Users className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-white">Nenhum cliente encontrado</h3>
            <p className="text-xs text-purple-300/70 max-w-sm mx-auto">
              {searchTerm
                ? 'Nenhum resultado para a busca. Tente buscar por outro termo.'
                : 'Quando os visitantes acessarem "Minha Conta" ou realizarem pedidos no site, as contas aparecerão aqui automaticamente salvas no banco de dados.'}
            </p>
          </div>
        )}
      </div>
      </>
      )}

      {/* Detailed Customer Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-[#22032a] rounded-3xl border-2 border-purple-700/80 shadow-2xl overflow-hidden text-white flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-purple-950 to-pink-950 border-b border-purple-800/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-pink-500/20 border border-pink-500/50 rounded-xl text-pink-300">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black font-fun text-white">
                    Ficha Cadastral do Cliente
                  </h3>
                  <p className="text-[11px] text-purple-300/70">
                    ID: {selectedCustomer.id}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1.5 rounded-full hover:bg-white/10 transition-colors text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              {/* Personal details */}
              <div className="bg-[#170220] p-4 rounded-2xl border border-purple-900/60 space-y-3">
                <h4 className="text-xs font-black uppercase text-pink-400 tracking-wider">
                  Dados do Titular
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-purple-300/70 text-[11px] block">Nome:</span>
                    <strong className="text-white text-sm">{selectedCustomer.name}</strong>
                  </div>
                  <div>
                    <span className="text-purple-300/70 text-[11px] block">WhatsApp:</span>
                    <strong className="text-white">{selectedCustomer.phone || 'Não informado'}</strong>
                  </div>
                  <div>
                    <span className="text-purple-300/70 text-[11px] block">E-mail:</span>
                    <strong className="text-white">{selectedCustomer.email || 'Não informado'}</strong>
                  </div>
                  <div>
                    <span className="text-purple-300/70 text-[11px] block">CEP:</span>
                    <strong className="text-white">{selectedCustomer.cep || 'Não informado'}</strong>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-purple-300/70 text-[11px] block">Endereço de Entrega:</span>
                    <strong className="text-white">{selectedCustomer.address || 'Não cadastrado'}</strong>
                  </div>
                </div>
              </div>

              {/* LGPD Compliance details */}
              <div className="bg-[#170220] p-4 rounded-2xl border border-emerald-900/50 space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-xs font-black uppercase text-emerald-300 tracking-wider">
                    Conformidade LGPD (Lei nº 13.709/2018)
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-purple-200">
                  <p>
                    <strong>Consentimento Ativo:</strong>{' '}
                    <span className={selectedCustomer.lgpdConsent ? 'text-emerald-300' : 'text-rose-300'}>
                      {selectedCustomer.lgpdConsent ? 'Sim (Termos Aceitos)' : 'Não'}
                    </span>
                  </p>
                  <p>
                    <strong>Data do Consentimento:</strong>{' '}
                    <span>
                      {selectedCustomer.lgpdConsentDate
                        ? new Date(selectedCustomer.lgpdConsentDate).toLocaleString('pt-BR')
                        : 'Registrado no cadastro'}
                    </span>
                  </p>
                  <p>
                    <strong>Versão da Política:</strong>{' '}
                    <span>{selectedCustomer.lgpdVersion || 'v1.0'}</span>
                  </p>
                  <p>
                    <strong>Status dos Dados:</strong>{' '}
                    <span className="capitalize">{selectedCustomer.status || 'Ativo'}</span>
                  </p>
                </div>
              </div>

              {/* Marketing & Cupom Authorization Card */}
              <div className="bg-[#170220] p-4 rounded-2xl border border-pink-900/50 space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-pink-400" />
                  <h4 className="text-xs font-black uppercase text-pink-300 tracking-wider">
                    Autorização de E-mails, Ofertas & Cupons
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-purple-200">
                  <p>
                    <strong>Autorização para E-mail:</strong>{' '}
                    <span className={selectedCustomer.emailMarketingConsent !== false ? 'text-pink-300 font-bold' : 'text-slate-400'}>
                      {selectedCustomer.emailMarketingConsent !== false ? '✓ Autorizado (Opt-in Confirmado)' : 'Pendente / Não Autorizado'}
                    </span>
                  </p>
                  <p>
                    <strong>Cupom de Entrada:</strong>{' '}
                    <span className="font-mono text-amber-300 font-bold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
                      {selectedCustomer.welcomeCoupon || 'BEMVINDA10'} (10% OFF a partir de R$ 150)
                    </span>
                  </p>
                  {selectedCustomer.emailMarketingConsentDate && (
                    <p className="sm:col-span-2">
                      <strong>Data da Autorização:</strong>{' '}
                      <span>{new Date(selectedCustomer.emailMarketingConsentDate).toLocaleString('pt-BR')}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Related Orders */}
              <div className="bg-[#170220] p-4 rounded-2xl border border-purple-900/60 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase text-pink-400 tracking-wider">
                    Histórico de Pedidos
                  </h4>
                  <span className="text-xs text-purple-300/70 font-bold">
                    Total: R$ {(Number(selectedCustomer.totalSpent) || 0).toFixed(2).replace('.', ',')}
                  </span>
                </div>

                {(() => {
                  const custOrders = orders.filter(
                    (o) =>
                      o.customerId === selectedCustomer.id ||
                      (selectedCustomer.phone && o.customerPhone &&
                        String(o.customerPhone).replace(/\D/g, '') === String(selectedCustomer.phone).replace(/\D/g, ''))
                  );

                  if (custOrders.length === 0) {
                    return (
                      <p className="text-xs text-purple-400/60 py-2">
                        Nenhum pedido finalizado vinculado a este cliente até o momento.
                      </p>
                    );
                  }

                  return (
                    <div className="space-y-2">
                      {custOrders.map((ord) => (
                        <div
                          key={ord.id}
                          className="p-3 rounded-xl bg-[#23032b] border border-purple-800/50 flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-bold text-white font-fun">
                              Pedido #{ord.orderNumber}
                            </span>
                            <span className="text-[11px] text-purple-300/60 ml-2">
                              {new Date(ord.createdAt).toLocaleDateString('pt-BR')}
                            </span>
                            <p className="text-[11px] text-purple-200 mt-0.5">
                              {(ord.items || []).length} {(ord.items || []).length === 1 ? 'item' : 'itens'} • {ord.paymentMethod.toUpperCase()}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="font-black text-amber-300 text-sm">
                              R$ {Number(ord.total).toFixed(2).replace('.', ',')}
                            </span>
                            <div className="text-[10px] text-purple-300 uppercase font-bold">
                              {ord.status}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* Action Buttons inside modal */}
              <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2 border-t border-purple-900/60">
                <button
                  onClick={() => handleExportSingleCustomer(selectedCustomer)}
                  className="px-3.5 py-2 rounded-xl bg-purple-900/70 hover:bg-purple-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar Ficha LGPD (JSON)</span>
                </button>

                {selectedCustomer.status !== 'anonimizado' && (
                  <button
                    onClick={() => handleAnonymize(selectedCustomer)}
                    className="px-3.5 py-2 rounded-xl bg-amber-950/60 hover:bg-amber-900 text-amber-300 text-xs font-bold border border-amber-800/60 flex items-center gap-1.5 cursor-pointer"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Anonimizar Titular</span>
                  </button>
                )}

                <button
                  onClick={() => handleDelete(selectedCustomer)}
                  className="px-3.5 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 text-xs font-bold border border-rose-800/60 flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Excluir Definitivamente</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
