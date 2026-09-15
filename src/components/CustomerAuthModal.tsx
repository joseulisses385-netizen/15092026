import React, { useState, useEffect } from 'react';
import {
  User,
  X,
  LogOut,
  Package,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Download,
  Lock,
  Mail,
  MapPin,
  FileCheck,
  Gift,
  Sparkles,
  Tag,
  KeyRound,
  Search,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import { Customer, Order, StoreSettings } from '../types';
import { recoverCustomerOnServer, loginCustomerOnServer } from '../services/storeApi';

interface CustomerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: Customer | null;
  onLogin: (customer: Customer) => Promise<void> | void;
  onLogout: () => void;
  userOrders: Order[];
  settings: StoreSettings;
}

export const CustomerAuthModal: React.FC<CustomerAuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  onLogout,
  userOrders,
  settings,
}) => {
  const [tab, setTab] = useState<'login' | 'register' | 'orders' | 'recover'>('login');

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [address, setAddress] = useState('');
  const [addressNumber, setAddressNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [cep, setCep] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [lgpdConsent, setLgpdConsent] = useState(true);
  const [emailMarketingConsent, setEmailMarketingConsent] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCepSearching, setIsCepSearching] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Recovery state
  const [recoverIdentifier, setRecoverIdentifier] = useState('');
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveredCustomer, setRecoveredCustomer] = useState<Customer | null>(null);
  const [recoverError, setRecoverError] = useState<string | null>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);

  // Sync state whenever modal opens or currentUser changes
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setPhone(currentUser.phone || '');
      setEmail(currentUser.email || '');
      setCpf(currentUser.cpf || '');
      setAddress(currentUser.address || '');
      setAddressNumber(currentUser.addressNumber || '');
      setComplement(currentUser.complement || '');
      setCep(currentUser.cep || '');
      setNeighborhood(currentUser.neighborhood || '');
      setCity(currentUser.city || '');
      setLgpdConsent(currentUser.lgpdConsent !== false);
      setEmailMarketingConsent(currentUser.emailMarketingConsent !== false);
      setTab('orders');
    } else {
      setTab('login');
    }
  }, [currentUser, isOpen]);

  

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError(null);
    
if (!name.trim() || !phone.trim()) {
      setRegisterError('Por favor, informe seu nome e telefone (WhatsApp).');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setRegisterError('Por favor, informe um endereço de e-mail válido para cadastro seguro.');
      return;
    }
    if (!registerPassword) {
      setRegisterError('Por favor, crie uma senha para sua conta.');
      return;
    }
    if (registerPassword !== confirmPassword) {
      setRegisterError('As senhas digitadas não coincidem.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setRegisterError('Por favor, informe um endereço de e-mail válido para cadastro seguro.');
      return;
    }
    if (!lgpdConsent) {
      setRegisterError('É necessário aceitar os termos de tratamento de dados (LGPD) para prosseguir.');
      return;
    }

    setIsSubmitting(true);
    try {
      const now = new Date().toISOString();
      const customerPayload: Customer = {
        id: currentUser?.id || `cust-${Date.now()}`,
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim().toLowerCase(),
        password: registerPassword,
        cpf: cpf.trim(),
        address: address.trim(),
        addressNumber: addressNumber.trim(),
        complement: complement.trim(),
        cep: cep.trim(),
        neighborhood: neighborhood.trim(),
        city: city.trim(),
        createdAt: currentUser?.createdAt || now,
        updatedAt: now,
        lgpdConsent: true,
        lgpdConsentDate: currentUser?.lgpdConsentDate || now,
        lgpdVersion: 'v1.0 - LGPD Lei 13.709/2018',
        emailMarketingConsent: emailMarketingConsent,
        emailMarketingConsentDate: emailMarketingConsent ? (currentUser?.emailMarketingConsentDate || now) : undefined,
        welcomeCoupon: currentUser?.welcomeCoupon || 'BEMVINDA10',
        status: 'ativo',
      };

      if (customerPayload.cep) {
        try {
          localStorage.setItem('doidas_user_cep', customerPayload.cep.replace(/\D/g, ''));
        } catch {}
      }

      await onLogin(customerPayload);
      setSuccessMsg('Conta cadastrada e salva no banco de dados com segurança SSL e consentimento LGPD!');
      setTimeout(() => setSuccessMsg(null), 3500);
      setTab('orders');
    } catch (error) {
      console.error('Erro ao salvar cadastro:', error);
      setRegisterError('Ocorreu um erro ao salvar os dados. Verifique sua conexão e tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      alert('Informe seu número de WhatsApp.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      alert('Informe seu e-mail para acesso seguro e envio de novidades.');
      return;
    }

    setIsSubmitting(true);
    try {
      const now = new Date().toISOString();
      const existingCust: Customer = {
        id: currentUser?.id || `cust-${Date.now()}`,
        name: name.trim() || 'Cliente Doidas e Meias',
        phone: phone.trim(),
        email: email.trim().toLowerCase(),
        cpf: cpf.trim(),
        address: address.trim(),
        cep: cep.trim(),
        createdAt: currentUser?.createdAt || now,
        updatedAt: now,
        lgpdConsent: true,
        lgpdConsentDate: currentUser?.lgpdConsentDate || now,
        lgpdVersion: 'v1.0 - LGPD Lei 13.709/2018',
        emailMarketingConsent: emailMarketingConsent,
        emailMarketingConsentDate: emailMarketingConsent ? (currentUser?.emailMarketingConsentDate || now) : undefined,
        welcomeCoupon: currentUser?.welcomeCoupon || 'BEMVINDA10',
        status: 'ativo',
      };

      if (existingCust.cep) {
        try {
          localStorage.setItem('doidas_user_cep', existingCust.cep.replace(/\D/g, ''));
        } catch {}
      }

      await onLogin(existingCust);
      setTab('orders');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Consulta automática de CEP no cadastro para preencher endereço e agilizar frete
  const handleLookupCepInRegister = async (rawCep: string) => {
    const clean = rawCep.replace(/\D/g, '');
    if (clean.length !== 8) return;
    setIsCepSearching(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      const data = await res.json();
      if (!data.erro) {
        if (data.logradouro && (!address || address.length < 3)) {
          setAddress(data.logradouro);
        }
        if (data.bairro) setNeighborhood(data.bairro);
        if (data.localidade) setCity(`${data.localidade} - ${data.uf}`);
      }
    } catch (err) {
      console.warn('Erro ao consultar CEP no cadastro:', err);
    } finally {
      setIsCepSearching(false);
    }
  };

  // Recuperação de conta por WhatsApp, E-mail ou CPF
  const handleRecoverSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = recoverIdentifier.trim();
    if (!query) {
      setRecoverError('Por favor, informe seu WhatsApp, E-mail ou CPF cadastrado.');
      return;
    }

    setIsRecovering(true);
    setRecoverError(null);
    setRecoveredCustomer(null);

    try {
      const res = await recoverCustomerOnServer(query);
      if (res.success && res.customer) {
        setRecoveredCustomer(res.customer);
      } else {
        setRecoverError(res.message || 'Nenhum cadastro foi encontrado com estes dados.');
      }
    } catch {
      setRecoverError('Erro de conexão ao buscar seu cadastro. Tente novamente.');
    } finally {
      setIsRecovering(false);
    }
  };

  const handleLoginWithRecovered = async (cust: Customer) => {
    if (cust.cep) {
      try {
        localStorage.setItem('doidas_user_cep', cust.cep.replace(/\D/g, ''));
      } catch {}
    }
    await onLogin(cust);
    setSuccessMsg(`Bem-vindo(a) de volta, ${(cust.name || '').split(' ')[0]}! Seus dados foram restaurados.`);
    setTimeout(() => setSuccessMsg(null), 3500);
    setTab('orders');
  };

  // Portabilidade de dados (LGPD Art. 18, V)
  const handleExportMyData = () => {
    if (!currentUser) return;
    const data = {
      titulo: 'Relatório dos Meus Dados Pessoais - Doidas e Meias',
      lei: 'Conforme Lei Geral de Proteção de Dados Pessoais (LGPD - Lei nº 13.709/2018)',
      dataEmissao: new Date().toISOString(),
      meusDados: currentUser,
      meusPedidos: userOrders,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meus_dados_lgpd_${(currentUser.name || 'cliente').replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'paid':
        return <span className="text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-800/60">Pago</span>;
      case 'preparing':
        return <span className="text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded text-[10px] font-bold border border-amber-800/60">Em Separação</span>;
      case 'shipped':
        return <span className="text-sky-400 bg-sky-950/60 px-2 py-0.5 rounded text-[10px] font-bold border border-sky-800/60">Enviado</span>;
      case 'delivered':
        return <span className="text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded text-[10px] font-bold border border-purple-800/60">Entregue</span>;
      default:
        return <span className="text-yellow-400 bg-yellow-950/60 px-2 py-0.5 rounded text-[10px] font-bold border border-yellow-800/60">Pendente</span>;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
      <div className="w-full max-w-md bg-[#25042e] rounded-3xl border border-purple-700/60 shadow-2xl overflow-hidden text-white flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-purple-900 to-pink-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <User className="w-5 h-5 text-amber-300" />
            <div>
              <h3 className="font-fun font-black text-lg text-white">
                {currentUser ? `Olá, ${(currentUser.name || '').split(' ')[0]}!` : 'Minha Conta'}
              </h3>
              <p className="text-[10px] text-purple-200/80 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-300" />
                Dados protegidos • LGPD Ativa
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher if logged in */}
        {currentUser ? (
          <div className="flex border-b border-purple-900/60 bg-[#1d0324] px-4 pt-3 gap-2">
            <button
              onClick={() => setTab('orders')}
              className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                tab === 'orders'
                  ? 'border-pink-500 text-white'
                  : 'border-transparent text-purple-300/70 hover:text-white'
              }`}
            >
              Meus Pedidos ({userOrders.length})
            </button>
            <button
              onClick={() => setTab('register')}
              className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                tab === 'register'
                  ? 'border-pink-500 text-white'
                  : 'border-transparent text-purple-300/70 hover:text-white'
              }`}
            >
              Meus Dados & LGPD
            </button>
          </div>
        ) : (
          <div className="flex border-b border-purple-900/60 bg-[#1d0324] px-3 pt-2.5 gap-1.5 overflow-x-auto">
            <button
              type="button"
              onClick={() => {
                setTab('login');
                setRecoverError(null);
                setRecoveredCustomer(null);
              }}
              className={`pb-2 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                tab === 'login'
                  ? 'border-pink-500 text-white'
                  : 'border-transparent text-purple-300/70 hover:text-white'
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('register');
                setRecoverError(null);
                setRecoveredCustomer(null);
              }}
              className={`pb-2 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                tab === 'register'
                  ? 'border-pink-500 text-white'
                  : 'border-transparent text-purple-300/70 hover:text-white'
              }`}
            >
              Criar Conta
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('recover');
                setRecoverError(null);
                setRecoveredCustomer(null);
              }}
              className={`pb-2 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                tab === 'recover'
                  ? 'border-amber-400 text-amber-300'
                  : 'border-transparent text-purple-300/70 hover:text-white'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>Recuperar Conta</span>
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-600/80 text-emerald-200 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {currentUser && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-pink-950/50 to-purple-950/50 border border-pink-700/50 flex items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <div className="p-2 rounded-xl bg-pink-500/20 text-pink-400 shrink-0">
                  <Gift className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">Seu Cupom de Desconto:</span>
                    <span className="font-mono text-xs text-amber-300 font-black bg-amber-950/80 px-2 py-0.5 rounded border border-amber-700/50">
                      {currentUser.welcomeCoupon || 'BEMVINDA10'}
                    </span>
                  </div>
                  <p className="text-[11px] text-pink-300/90 mt-0.5">
                    🎉 <strong>10% OFF</strong> válido para compras a partir de <strong>R$ 150,00</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Not logged in: TAB RECOVER (Recuperar Conta / Esqueci meus dados) */}
          {!currentUser && tab === 'recover' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/40 text-xs text-amber-200/90 flex items-start gap-2">
                <KeyRound className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-300">Esqueceu sua conta ou e-mail cadastrado?</p>
                  <p className="text-[11px] text-purple-200/80 mt-0.5">
                    Digite seu <strong>WhatsApp</strong>, <strong>E-mail</strong> ou <strong>CPF</strong> para localizarmos seu cadastro salvo no banco de dados.
                  </p>
                </div>
              </div>

              <form onSubmit={handleRecoverSearch} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-purple-200 mb-1">
                    WhatsApp, E-mail ou CPF Cadastrado
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={recoverIdentifier}
                      onChange={(e) => setRecoverIdentifier(e.target.value)}
                      placeholder="(11) 99999-9999, e-mail ou CPF"
                      className="w-full pl-3 pr-10 py-2 rounded-xl bg-[#1b0222] border border-purple-700/60 text-xs text-white placeholder-purple-400/50 focus:outline-none focus:border-amber-400"
                    />
                    <button
                      type="submit"
                      disabled={isRecovering}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer disabled:opacity-50"
                      title="Localizar Conta"
                    >
                      <Search className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isRecovering}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-95 text-slate-950 text-xs font-black shadow-md cursor-pointer transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>{isRecovering ? 'Consultando banco de dados...' : 'Localizar Minha Conta'}</span>
                </button>
              </form>

              {recoverError && (
                <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-600/80 text-rose-200 text-xs font-semibold">
                  <p>{recoverError}</p>
                  <button
                    type="button"
                    onClick={() => setTab('register')}
                    className="mt-1.5 text-xs text-amber-300 hover:underline font-bold block"
                  >
                    Deseja cadastrar uma nova conta agora? Clique aqui
                  </button>
                </div>
              )}

              {/* Found Customer Card */}
              {recoveredCustomer && (
                <div className="p-4 rounded-2xl bg-gradient-to-b from-purple-950 to-[#1d0324] border border-amber-400/80 shadow-xl space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-purple-800/60 pb-2">
                    <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Conta Localizada!</span>
                    </span>
                    <span className="text-[10px] text-purple-300 font-mono">
                      Cliente Ativo
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <p className="text-white font-bold text-sm">{recoveredCustomer.name}</p>
                    <p className="text-purple-200 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                      <span className="font-mono text-[11px]">{recoveredCustomer.email || 'Não informado'}</span>
                    </p>
                    <p className="text-purple-200 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="font-mono text-[11px]">{recoveredCustomer.phone}</span>
                    </p>
                    {recoveredCustomer.cep && (
                      <p className="text-purple-200 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="text-[11px]">
                          {recoveredCustomer.address ? `${recoveredCustomer.address} • ` : ''}
                          CEP: {recoveredCustomer.cep}
                        </span>
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleLoginWithRecovered(recoveredCustomer)}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:opacity-95 text-white text-xs font-black shadow-lg cursor-pointer flex items-center justify-center gap-2 transition-all"
                  >
                    <span>Entrar com Esta Conta Agora</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <a
                    href={`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(
                      `Olá! Preciso de ajuda para acessar minha conta no site Doidas e Meias. Meu nome é ${recoveredCustomer.name} e telefone ${recoveredCustomer.phone}.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 text-center text-xs text-purple-300 hover:text-white font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Phone className="w-3 h-3 text-emerald-400" />
                    <span>Precisa de ajuda humana? Fale no WhatsApp</span>
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Not logged in: Login Form */}
          {!currentUser && tab === 'login' && (
            <form onSubmit={handleQuickLogin} className="space-y-4">
              <p className="text-xs text-purple-200/80">
                Acesse seus pedidos e suas informações salvas de forma segura no banco de dados da loja:
              </p>
              <div>
                <label className="block text-[11px] font-bold text-purple-200 mb-1">
                  E-mail ou WhatsApp
                </label>
                <input
                  type="text"
                  required
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="(11) 99999-9999 ou email@exemplo.com"
                  className="w-full px-3 py-2 rounded-xl bg-[#1b0222] border border-purple-700/60 text-xs text-white placeholder-purple-400/50 focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-purple-200 mb-1">
                  Senha *
                </label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Sua senha secreta"
                  className="w-full px-3 py-2 rounded-xl bg-[#1b0222] border border-purple-700/60 text-xs text-white placeholder-purple-400/50 focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-[13px] shadow-md transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Acessando...' : 'Entrar na Minha Conta'}
                </button>
              </div>

              <div className="flex flex-col gap-2 pt-2 text-center border-t border-purple-800/40 mt-4 pt-4">
                <button
                  type="button"
                  onClick={() => setTab('recover')}
                  className="text-xs text-amber-300 hover:text-amber-200 font-bold flex items-center justify-center gap-1 cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Esqueceu seus dados? Recuperar minha conta</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTab('register')}
                  className="text-xs text-pink-400 hover:text-pink-300 font-bold underline cursor-pointer"
                >
                  Novo cliente? Criar conta rápida
                </button>
              </div>
            </form>
          )}

          {/* Register or Edit details */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-purple-200 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nome do cliente"
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
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="w-full px-3 py-2 rounded-xl bg-[#1b0222] border border-purple-700/60 text-xs text-white placeholder-purple-400/50 focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-purple-200 mb-1 flex items-center gap-1">
                    <Mail className="w-3 h-3 text-pink-400" />
                    E-mail *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@exemplo.com"
                    className="w-full px-3 py-2 rounded-xl bg-[#1b0222] border border-purple-700/60 text-xs text-white placeholder-purple-400/50 focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-purple-200 mb-1">
                    Criar Senha *
                  </label>
                  <input
                    type="password"
                    required
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    placeholder="Sua senha secreta"
                    className="w-full px-3 py-2 rounded-xl bg-[#1b0222] border border-purple-700/60 text-xs text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-purple-200 mb-1">
                    Confirmar Senha *
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita a senha"
                    className="w-full px-3 py-2 rounded-xl bg-[#1b0222] border border-purple-700/60 text-xs text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              {/* Marketing consent check */}
              <div className="mt-3 p-3 rounded-2xl bg-gradient-to-r from-pink-950/40 to-purple-950/40 border border-pink-700/40 space-y-1">
                <label className="flex items-start gap-2.5 cursor-pointer text-[11px] text-purple-200 leading-tight">
                  <input
                    type="checkbox"
                    checked={emailMarketingConsent}
                    onChange={(e) => setEmailMarketingConsent(e.target.checked)}
                    className="mt-0.5 rounded border-purple-600 bg-[#1b0222] text-pink-500 focus:ring-pink-500 focus:ring-offset-[#1b0222]"
                  />
                  <span>
                    <strong className="text-pink-300">🎁 Autorizo receber e-mails</strong> com cupom de 10% de desconto e promoções (posso cancelar depois).
                  </span>
                </label>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setTab('login')}
                  className="flex-1 py-2.5 rounded-xl border border-purple-700 hover:bg-white/5 text-purple-200 font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs shadow-md transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Salvando...' : 'Criar Minha Conta'}
                </button>
              </div>
            </form>
          )}

          {/* Orders list */}
          {tab === 'orders' && currentUser && (
            <div className="space-y-3">
              {userOrders.length > 0 ? (
                userOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-3.5 rounded-2xl bg-[#1d0324] border border-purple-800/60 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white font-fun">
                        Pedido #{ord.orderNumber}
                      </span>
                      {getStatusBadge(ord.status)}
                    </div>
                    <p className="text-[11px] text-purple-300/70">
                      Data: {new Date(ord.createdAt || Date.now()).toLocaleDateString('pt-BR')} • Total: R$ {(ord.total || 0).toFixed(2).replace('.', ',')}
                    </p>
                    <div className="pt-1.5 border-t border-purple-900/40 text-[11px] text-purple-200 space-y-0.5">
                      {(ord.items || []).map((it, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span>{it.quantity}x {it.product?.name || 'Produto'}</span>
                          <span className="text-amber-300">R$ {((it.product?.price || 0) * (it.quantity || 1)).toFixed(2).replace('.', ',')}</span>
                        </div>
                      ))}
                    </div>
                    <a
                      href={`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(
                        `Olá! Sou ${currentUser.name || "cliente"} e gostaria de acompanhar meu pedido ${ord.orderNumber} feito no site Doidas e Meias.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 w-full py-1.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-700/60 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Phone className="w-3 h-3" />
                      <span>Acompanhar no WhatsApp</span>
                    </a>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-xs text-purple-300/70 space-y-2">
                  <Package className="w-8 h-8 text-purple-400 mx-auto" />
                  <p>Você ainda não realizou nenhum pedido com este cadastro.</p>
                  <p className="text-[11px] text-purple-400/60">
                    Seus dados de cadastro estão ativos e salvos no banco de dados.
                  </p>
                </div>
              )}

              <button
                onClick={onLogout}
                className="w-full py-2 px-3 rounded-xl bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer mt-4"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sair da Minha Conta</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
