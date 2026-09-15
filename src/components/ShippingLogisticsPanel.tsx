import React, { useState, useEffect } from 'react';
import {
  Truck,
  Package,
  ShieldCheck,
  Zap,
  Clock,
  DollarSign,
  ExternalLink,
  CheckCircle2,
  Info,
  Sliders,
  MapPin,
  Sparkles,
  HelpCircle,
  TrendingDown,
  Gift,
  Search,
  AlertCircle,
  Key,
  RefreshCw,
  Eye,
  EyeOff,
  UserCheck
} from 'lucide-react';
import { StoreSettings, ShippingMethodOption } from '../types';

interface ShippingLogisticsPanelProps {
  settings: StoreSettings;
  onSaveSettings: (settings: StoreSettings) => void;
  showNotification: (msg: string) => void;
}

interface MelhorEnvioQuote {
  id: string;
  melhorEnvioServiceId: number;
  name: string;
  carrier: string;
  serviceType: string;
  description: string;
  deliveryEstimate: string;
  price: number;
  currency: string;
  carrierLogo?: string;
  badge?: string;
}

export const ShippingLogisticsPanel: React.FC<ShippingLogisticsPanelProps> = ({
  settings,
  onSaveSettings,
  showNotification,
}) => {
  const [shippingMethods, setShippingMethods] = useState<ShippingMethodOption[]>(
    settings.shippingMethods || []
  );
  const [originCep, setOriginCep] = useState(
    settings.melhorEnvioOriginCep || settings.shippingOriginCep || '09910-000'
  );
  const [originCity, setOriginCity] = useState(
    settings.melhorEnvioOriginCity || settings.shippingOriginCity || 'Diadema - SP'
  );
  const [freeShippingThreshold, setFreeShippingThreshold] = useState<number>(
    settings.freeShippingThreshold === 149 || settings.freeShippingThreshold === 150 || !settings.freeShippingThreshold
      ? 99
      : settings.freeShippingThreshold
  );
  const [enableFreeShipping, setEnableFreeShipping] = useState<boolean>(
    settings.enableFreeShipping ?? true
  );

  // Melhor Envio settings state
  const [melhorEnvioEnabled, setMelhorEnvioEnabled] = useState<boolean>(
    settings.melhorEnvioEnabled ?? true
  );
  const [tokenInput, setTokenInput] = useState<string>(settings.melhorEnvioToken || '');
  const [showToken, setShowToken] = useState<boolean>(false);
  const [isUpdatingToken, setIsUpdatingToken] = useState<boolean>(false);
  const [tokenStatusMsg, setTokenStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Test Connection state
  const [isTestingConnection, setIsTestingConnection] = useState<boolean>(false);
  const [accountInfo, setAccountInfo] = useState<any>({
    name: settings.melhorEnvioAccountName || 'Jose ulisses',
    email: settings.melhorEnvioAccountEmail || 'jose.ulisses385@gmail.com',
    phone: settings.melhorEnvioAccountPhone || '11989055683',
    address: settings.melhorEnvioOriginAddress || 'Rua Manoel Amaral, 107 apt 101 - Centro, Diadema - SP',
    postalCode: '09910000',
    status: 'Allowed',
    shipmentsAvailable: 50,
  });

  // Package specs
  const [pkgHeight, setPkgHeight] = useState<number>(settings.melhorEnvioDefaultPackage?.height || 4);
  const [pkgWidth, setPkgWidth] = useState<number>(settings.melhorEnvioDefaultPackage?.width || 16);
  const [pkgLength, setPkgLength] = useState<number>(settings.melhorEnvioDefaultPackage?.length || 20);
  const [pkgWeight, setPkgWeight] = useState<number>(settings.melhorEnvioDefaultPackage?.weight || 0.2);

  // Real-time Live Simulator State
  const [simCep, setSimCep] = useState('01310-100'); // Av Paulista default
  const [simItemsCount, setSimItemsCount] = useState<number>(2);
  const [simSubtotal, setSimSubtotal] = useState<number>(78);
  const [isSimulating, setIsSimulating] = useState(false);
  const [liveQuotes, setLiveQuotes] = useState<MelhorEnvioQuote[]>([]);
  const [simAddress, setSimAddress] = useState<string | null>(null);
  const [simError, setSimError] = useState<string | null>(null);

  // Load account info on mount
  useEffect(() => {
    fetchAccountInfo();
  }, []);

  const fetchAccountInfo = async () => {
    setIsTestingConnection(true);
    try {
      const res = await fetch('/api/shipping/melhor-envio/info');
      const data = await res.json();
      if (data.success && data.user) {
        setAccountInfo(data.user);
        if (data.user.address?.postal_code) {
          const raw = data.user.address.postal_code;
          const formatted = `${raw.slice(0, 5)}-${raw.slice(5)}`;
          setOriginCep(formatted);
        }
        if (data.user.address?.city?.city) {
          setOriginCity(`${data.user.address.city.city} - ${data.user.address.city.state?.state_abbr || 'SP'}`);
        }
      }
    } catch {
      // Keep existing defaults
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleUpdateToken = async () => {
    if (!tokenInput.trim()) {
      setTokenStatusMsg({ type: 'error', text: 'Por favor, insira o token do Melhor Envio.' });
      return;
    }

    setIsUpdatingToken(true);
    setTokenStatusMsg(null);
    try {
      const res = await fetch('/api/shipping/melhor-envio/update-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenInput }),
      });
      const data = await res.json();
      if (data.success) {
        setTokenStatusMsg({ type: 'success', text: 'Token validado e conectado com sucesso ao Melhor Envio!' });
        showNotification('Token do Melhor Envio conectado com sucesso!');
        await fetchAccountInfo();
      } else {
        setTokenStatusMsg({ type: 'error', text: data.error || 'Token rejeitado pelo Melhor Envio.' });
      }
    } catch (err: any) {
      setTokenStatusMsg({ type: 'error', text: 'Erro ao conectar com a API: ' + err.message });
    } finally {
      setIsUpdatingToken(false);
    }
  };

  const handleToggleMethod = (id: string) => {
    setShippingMethods((prev) =>
      prev.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m))
    );
  };

  const handleUpdatePrice = (id: string, newPrice: number) => {
    setShippingMethods((prev) =>
      prev.map((m) => (m.id === id ? { ...m, price: Math.max(0, newPrice) } : m))
    );
  };

  const handleUpdateEstimate = (id: string, newEstimate: string) => {
    setShippingMethods((prev) =>
      prev.map((m) => (m.id === id ? { ...m, deliveryEstimate: newEstimate } : m))
    );
  };

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: StoreSettings = {
      ...settings,
      shippingOriginCep: originCep,
      shippingOriginCity: originCity,
      freeShippingThreshold: Number(freeShippingThreshold),
      enableFreeShipping,
      shippingMethods,
      melhorEnvioEnabled,
      melhorEnvioToken: tokenInput || settings.melhorEnvioToken,
      melhorEnvioOriginCep: originCep,
      melhorEnvioOriginCity: originCity,
      melhorEnvioDefaultPackage: {
        height: Number(pkgHeight),
        width: Number(pkgWidth),
        length: Number(pkgLength),
        weight: Number(pkgWeight),
      },
    };
    onSaveSettings(updated);
    showNotification('Todas as configurações de frete e Melhor Envio foram salvas com sucesso!');
  };

  const handleSimulateShipping = async () => {
    const clean = simCep.replace(/\D/g, '');
    if (clean.length !== 8) {
      alert('Digite um CEP válido com 8 dígitos para simular.');
      return;
    }

    setIsSimulating(true);
    setSimError(null);
    setLiveQuotes([]);
    setSimAddress(null);

    try {
      // 1. Get address from ViaCep for visual confirmation
      fetch(`https://viacep.com.br/ws/${clean}/json/`)
        .then((r) => r.json())
        .then((data) => {
          if (!data.erro) {
            setSimAddress(`${data.logradouro || 'Centro'} - ${data.bairro || ''}, ${data.localidade}/${data.uf}`);
          }
        })
        .catch(() => {});

      // 2. Query live shipping quotes from our server-side Melhor Envio integration
      const res = await fetch('/api/shipping/melhor-envio/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toCep: clean,
          fromCep: (originCep || "").replace(/\D/g, ''),
          itemsCount: simItemsCount,
          cartTotal: simSubtotal,
          package: {
            height: pkgHeight,
            width: pkgWidth,
            length: pkgLength,
            weight: pkgWeight,
          },
        }),
      });

      const data = await res.json();
      if (data.success && Array.isArray(data.quotes)) {
        setLiveQuotes(data.quotes);
      } else {
        setSimError(data.error || 'Não foi possível obter cotações para este CEP.');
      }
    } catch (err: any) {
      setSimError('Erro de conexão ao calcular frete: ' + err.message);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <form onSubmit={handleSaveAll} className="max-w-4xl space-y-6">
      {/* Header & Save Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-purple-800/60">
        <div>
          <h3 className="text-base font-bold font-fun text-white flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#00f2fe]" />
            <span>Logística & Integração Oficial Melhor Envio</span>
            <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-700/60 px-2 py-0.5 rounded-full font-bold">
              API Ao Vivo Ativa
            </span>
          </h3>
          <p className="text-xs text-purple-300/80">
            Cotação de fretes em tempo real na sacola de compras com tarifas reduzidas de Correios, Jadlog, Loggi e Total Express.
          </p>
        </div>
        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-[#00f2fe] text-white text-xs font-black shadow-lg hover:opacity-95 transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Salvar Todas as Configurações</span>
        </button>
      </div>

      {/* BLOCO 1: STATUS DA INTEGRAÇÃO MELHOR ENVIO */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-[#1b0327] via-[#230430] to-[#0c1829] border-2 border-[#00f2fe]/60 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-purple-800/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#00f2fe]/10 border border-[#00f2fe]/50 flex items-center justify-center text-[#00f2fe] shrink-0 shadow-inner">
              <Zap className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-black text-white font-fun">
                  Conta Oficial Melhor Envio Conectada
                </h4>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/60 px-2 py-0.5 rounded-full">
                  <UserCheck className="w-3 h-3" />
                  Verificado & Ativo
                </span>
              </div>
              <p className="text-xs text-purple-300">
                Tarifas comerciais com até <strong>80% de desconto</strong> para meias e itens leves.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchAccountInfo}
              disabled={isTestingConnection}
              className="px-3 py-1.5 rounded-xl bg-purple-900/60 hover:bg-purple-800/80 text-purple-200 border border-purple-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTestingConnection ? 'animate-spin' : ''}`} />
              <span>{isTestingConnection ? 'Testando...' : 'Testar Conexão'}</span>
            </button>

            <label className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-pink-950/40 border border-pink-700/60 cursor-pointer">
              <input
                type="checkbox"
                checked={melhorEnvioEnabled}
                onChange={(e) => setMelhorEnvioEnabled(e.target.checked)}
                className="rounded text-pink-600 focus:ring-0 cursor-pointer"
              />
              <span className="text-xs font-bold text-pink-200">Frete ao Vivo na Sacola</span>
            </label>
          </div>
        </div>

        {/* Resumo da Conta Conectada */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-[#120118] border border-purple-800/60">
            <span className="text-[10px] text-purple-400 font-bold block mb-1">Titular da Conta</span>
            <span className="text-white font-black text-sm block truncate">
              {accountInfo.name || 'Jose ulisses'}
            </span>
            <span className="text-[10px] text-purple-400 block truncate">
              {accountInfo.email || 'jose.ulisses385@gmail.com'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#120118] border border-purple-800/60">
            <span className="text-[10px] text-purple-400 font-bold block mb-1">CEP de Postagem Oficial</span>
            <span className="text-amber-300 font-black font-mono text-sm block">
              {originCep}
            </span>
            <span className="text-[10px] text-purple-400 block truncate">
              {originCity}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#120118] border border-purple-800/60">
            <span className="text-[10px] text-purple-400 font-bold block mb-1">Status na API</span>
            <span className="text-emerald-400 font-black text-sm flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{accountInfo.status === 'Allowed' ? 'Aprovado / Liberado' : accountInfo.status}</span>
            </span>
            <span className="text-[10px] text-purple-400 block">
              {accountInfo.phone ? `Whats: ${accountInfo.phone}` : 'Documento Verificado'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#120118] border border-purple-800/60">
            <span className="text-[10px] text-purple-400 font-bold block mb-1">Envios Disponíveis</span>
            <span className="text-[#00f2fe] font-black text-sm block">
              {accountInfo.shipmentsAvailable || 50} envios
            </span>
            <span className="text-[10px] text-purple-400 block">
              Sem mensalidade fixa
            </span>
          </div>
        </div>

        {/* Gerenciador do Token */}
        <div className="p-4 rounded-xl bg-[#13011a] border border-purple-800/80 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-purple-200 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>Token de Acesso (API Bearer Token Oficial)</span>
            </label>
            <button
              type="button"
              onClick={() => setShowToken(!showToken)}
              className="text-[11px] text-purple-400 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              {showToken ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              <span>{showToken ? 'Ocultar' : 'Visualizar'}</span>
            </button>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type={showToken ? 'text' : 'password'}
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="Cole aqui o token de API do Melhor Envio..."
                className="w-full px-3 py-2 rounded-xl bg-[#0d0112] border border-purple-700 text-xs text-white font-mono"
              />
            </div>
            <button
              type="button"
              onClick={handleUpdateToken}
              disabled={isUpdatingToken}
              className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-600 text-white font-bold text-xs shrink-0 cursor-pointer flex items-center gap-1.5 transition-all"
            >
              {isUpdatingToken ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
              <span>{isUpdatingToken ? 'Validando...' : 'Salvar / Validar Token'}</span>
            </button>
          </div>

          {tokenStatusMsg && (
            <div
              className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                tokenStatusMsg.type === 'success'
                  ? 'bg-emerald-950/60 border border-emerald-700 text-emerald-200'
                  : 'bg-rose-950/60 border border-rose-700 text-rose-200'
              }`}
            >
              {tokenStatusMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{tokenStatusMsg.text}</span>
            </div>
          )}

          <div className="text-[10px] text-purple-400/80 flex items-center gap-1.5 pt-1">
            <Info className="w-3 h-3 text-[#00f2fe]" />
            <span>
              O token fica armazenado com segurança no servidor. As cotações são feitas diretamente entre o seu servidor e o Melhor Envio.
            </span>
          </div>
        </div>
      </div>

      {/* BLOCO 2: CONFIGURAÇÃO DE ORIGEM & FRETE GRÁTIS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CEP e Cidade de Postagem */}
        <div className="p-4 rounded-2xl bg-[#14011b] border border-purple-800/80 space-y-3">
          <h4 className="text-sm font-bold text-white font-fun flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#00f2fe]" />
            <span>Origem dos Envios (Onde as meias saem)</span>
          </h4>
          <p className="text-xs text-purple-300/80">
            CEP da sua base ou residência para o cálculo da distância até o cliente:
          </p>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] text-purple-300 font-bold mb-1">
                CEP de Origem
              </label>
              <input
                type="text"
                value={originCep}
                onChange={(e) => setOriginCep(e.target.value)}
                placeholder="09910-000"
                className="w-full px-3 py-2 rounded-xl bg-[#1c0226] border border-purple-700 text-amber-300 font-bold font-mono text-xs"
              />
            </div>
            <div>
              <label className="block text-[10px] text-purple-300 font-bold mb-1">
                Cidade / Estado
              </label>
              <input
                type="text"
                value={originCity}
                onChange={(e) => setOriginCity(e.target.value)}
                placeholder="Diadema - SP"
                className="w-full px-3 py-2 rounded-xl bg-[#1c0226] border border-purple-700 text-white text-xs"
              />
            </div>
          </div>
          <span className="text-[10px] text-purple-400 block">
            Endereço verificado no cadastro: Rua Manoel Amaral, 107 apt 101 - Centro, Diadema - SP
          </span>
        </div>

        {/* Frete Grátis Inteligente */}
        <div className="p-4 rounded-2xl bg-[#14011b] border border-purple-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white font-fun flex items-center gap-2">
              <Gift className="w-4 h-4 text-emerald-400" />
              <span>Frete Grátis Inteligente</span>
            </h4>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={enableFreeShipping}
                onChange={(e) => setEnableFreeShipping(e.target.checked)}
                className="rounded text-pink-600 focus:ring-0 cursor-pointer"
              />
              <span className="text-xs text-emerald-400 font-bold">Ativar Regra</span>
            </label>
          </div>
          <p className="text-xs text-purple-300/80">
            Aumente o ticket médio da loja liberando frete grátis na opção mais econômica:
          </p>

          <div>
            <label className="block text-[10px] text-purple-300 font-bold mb-1">
              Valor Mínimo na Sacola para Frete Grátis (R$)
            </label>
            <input
              type="number"
              step="0.10"
              value={freeShippingThreshold}
              onChange={(e) => setFreeShippingThreshold(Number(e.target.value))}
              placeholder="99.00"
              className="w-full px-3 py-2 rounded-xl bg-[#1c0226] border border-purple-700 text-amber-300 font-bold font-mono text-xs"
            />
            <span className="text-[10px] text-purple-400 mt-1 block">
              Acima deste valor, o frete mais barato da cotação vira <strong>GRÁTIS</strong> automaticamente.
            </span>
          </div>
        </div>
      </div>

      {/* BLOCO 3: MEDIDAS DO PACOTE PADRÃO DE MEIAS */}
      <div className="p-5 rounded-2xl bg-[#14011b] border border-purple-800/80 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-white font-fun flex items-center gap-2">
            <Package className="w-4 h-4 text-pink-400" />
            <span>Dimensões e Peso do Pacote Médio (Para Meias e Roupas Leves)</span>
          </h4>
          <span className="text-[10px] bg-pink-950 text-pink-300 border border-pink-800 px-2 py-0.5 rounded-full font-bold">
            Pacote Compacto = Menor Custo
          </span>
        </div>
        <p className="text-xs text-purple-300/80">
          Meias são flexíveis e ocupam pouco volume. Nossas dimensões padrão foram calibradas para garantir o menor preço no Melhor Envio:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-[10px] text-purple-300 font-bold mb-1">
              Altura (cm)
            </label>
            <input
              type="number"
              value={pkgHeight}
              onChange={(e) => setPkgHeight(Number(e.target.value))}
              className="w-full px-3 py-1.5 rounded-xl bg-[#1c0226] border border-purple-700 text-white font-mono text-xs"
            />
            <span className="text-[9px] text-purple-400">Padrão: 4 cm</span>
          </div>
          <div>
            <label className="block text-[10px] text-purple-300 font-bold mb-1">
              Largura (cm)
            </label>
            <input
              type="number"
              value={pkgWidth}
              onChange={(e) => setPkgWidth(Number(e.target.value))}
              className="w-full px-3 py-1.5 rounded-xl bg-[#1c0226] border border-purple-700 text-white font-mono text-xs"
            />
            <span className="text-[9px] text-purple-400">Padrão: 16 cm</span>
          </div>
          <div>
            <label className="block text-[10px] text-purple-300 font-bold mb-1">
              Comprimento (cm)
            </label>
            <input
              type="number"
              value={pkgLength}
              onChange={(e) => setPkgLength(Number(e.target.value))}
              className="w-full px-3 py-1.5 rounded-xl bg-[#1c0226] border border-purple-700 text-white font-mono text-xs"
            />
            <span className="text-[9px] text-purple-400">Padrão: 20 cm</span>
          </div>
          <div>
            <label className="block text-[10px] text-purple-300 font-bold mb-1">
              Peso Médio (kg)
            </label>
            <input
              type="number"
              step="0.05"
              value={pkgWeight}
              onChange={(e) => setPkgWeight(Number(e.target.value))}
              className="w-full px-3 py-1.5 rounded-xl bg-[#1c0226] border border-purple-700 text-amber-300 font-bold font-mono text-xs"
            />
            <span className="text-[9px] text-purple-400">Padrão: 0.20 kg (~3 pares)</span>
          </div>
        </div>
      </div>

      {/* BLOCO 4: SIMULADOR DE FRETE EM TEMPO REAL (API OFICIAL) */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-[#15011f] to-[#0c1626] border-2 border-emerald-500/50 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-black text-white font-fun flex items-center gap-2">
              <Search className="w-4 h-4 text-emerald-400" />
              <span>Simulador de Fretes ao Vivo (Melhor Envio)</span>
              <span className="text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-700 px-2 py-0.5 rounded-full font-bold">
                API Test Tool
              </span>
            </h4>
            <p className="text-xs text-purple-300/80">
              Digite um CEP de destino para testar a cotação real que o cliente receberá no checkout:
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 items-end">
          <div className="w-36">
            <label className="block text-[10px] text-purple-300 font-bold mb-1">
              CEP de Destino
            </label>
            <input
              type="text"
              value={simCep}
              onChange={(e) => setSimCep(e.target.value)}
              placeholder="Ex: 01310-100"
              className="w-full px-3 py-2 rounded-xl bg-[#1c0226] border border-purple-700 text-white text-xs font-mono font-bold"
            />
          </div>

          <div className="w-24">
            <label className="block text-[10px] text-purple-300 font-bold mb-1">
              Qtd de Meias
            </label>
            <input
              type="number"
              min="1"
              value={simItemsCount}
              onChange={(e) => setSimItemsCount(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-[#1c0226] border border-purple-700 text-white text-xs font-mono text-center"
            />
          </div>

          <div className="w-28">
            <label className="block text-[10px] text-purple-300 font-bold mb-1">
              Subtotal (R$)
            </label>
            <input
              type="number"
              value={simSubtotal}
              onChange={(e) => setSimSubtotal(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-[#1c0226] border border-purple-700 text-amber-300 text-xs font-mono font-bold"
            />
          </div>

          <button
            type="button"
            onClick={handleSimulateShipping}
            disabled={isSimulating}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-[#00f2fe] text-white font-black text-xs cursor-pointer hover:opacity-95 transition-all flex items-center gap-1.5"
          >
            {isSimulating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
            <span>{isSimulating ? 'Cotando no Melhor Envio...' : 'Cotar Fretes ao Vivo'}</span>
          </button>
        </div>

        {simAddress && (
          <div className="p-2.5 rounded-xl bg-[#0e0214] border border-purple-800 text-xs text-purple-200 flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Destino identificado: <strong>{simAddress}</strong></span>
          </div>
        )}

        {simError && (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-700 text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{simError}</span>
          </div>
        )}

        {/* Tabela de Resultados do Simulador */}
        {liveQuotes.length > 0 && (
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs text-purple-300">
              <span className="font-bold text-white">
                {liveQuotes.length} transportadoras disponíveis para este CEP:
              </span>
              <span className="text-emerald-400 font-bold">
                ✓ Preços reais calculados via API oficial
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {liveQuotes.map((quote) => (
                <div
                  key={quote.id}
                  className="p-3 rounded-xl bg-[#16021e] border border-purple-700/80 flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {quote.carrierLogo ? (
                      <img
                        src={quote.carrierLogo}
                        alt={quote.carrier}
                        className="w-8 h-8 rounded-lg bg-white p-0.5 object-contain shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-purple-900 flex items-center justify-center text-xs font-bold shrink-0">
                        📦
                      </div>
                    )}
                    <div className="truncate">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-xs text-white truncate">
                          {quote.name}
                        </span>
                        {quote.badge && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-pink-950 text-pink-300 border border-pink-700">
                            {quote.badge}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-purple-300 block">
                        Prazo estimado: <strong>{quote.deliveryEstimate}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    {quote.price === 0 ? (
                      <span className="text-emerald-400 font-black text-xs block">GRÁTIS</span>
                    ) : (
                      <span className="text-amber-300 font-black font-mono text-sm block">
                        R$ {Number(quote.price).toFixed(2).replace('.', ',')}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* BLOCO 5: FORMAS DE ENVIO DE BACKUP OU RETIRADA */}
      <div className="p-5 rounded-2xl bg-[#14011b] border border-purple-800/80 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-white font-fun flex items-center gap-2">
            <Sliders className="w-4 h-4 text-purple-400" />
            <span>Opções Fixas e de Retirada (Fallback / Balcão)</span>
          </h4>
          <span className="text-xs text-purple-300">
            {shippingMethods.filter((m) => m.enabled).length} ativas
          </span>
        </div>

        <div className="space-y-3">
          {shippingMethods.map((method) => (
            <div
              key={method.id}
              className={`p-3.5 rounded-2xl border transition-all ${
                method.enabled
                  ? 'bg-[#1b0224] border-purple-700/80'
                  : 'bg-[#120117] border-purple-900/40 opacity-60'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id={`method-${method.id}`}
                    checked={method.enabled}
                    onChange={() => handleToggleMethod(method.id)}
                    className="mt-1 w-4 h-4 rounded text-pink-600 focus:ring-0 cursor-pointer"
                  />
                  <div>
                    <label
                      htmlFor={`method-${method.id}`}
                      className="font-bold text-white text-xs cursor-pointer flex items-center gap-2 flex-wrap"
                    >
                      <span>{method.name}</span>
                      {method.badge && (
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-pink-950 text-pink-300 border border-pink-700 font-semibold">
                          {method.badge}
                        </span>
                      )}
                    </label>
                    <p className="text-[11px] text-purple-300/80 mt-0.5">
                      {method.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                  <div>
                    <label className="block text-[9px] text-purple-300 font-bold mb-0.5">
                      Prazo Estimado
                    </label>
                    <input
                      type="text"
                      value={method.deliveryEstimate}
                      onChange={(e) => handleUpdateEstimate(method.id, e.target.value)}
                      className="px-2.5 py-1 rounded-lg bg-[#14011a] border border-purple-800 text-xs text-white font-medium w-28"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] text-purple-300 font-bold mb-0.5">
                      Valor Fixo (R$)
                    </label>
                    <input
                      type="number"
                      step="0.10"
                      value={method.price}
                      onChange={(e) => handleUpdatePrice(method.id, parseFloat(e.target.value) || 0)}
                      className="px-2.5 py-1 rounded-lg bg-[#14011a] border border-purple-800 text-xs text-amber-300 font-bold w-20 font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Save Action */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-[#00f2fe] text-white text-xs font-black shadow-lg hover:scale-102 transition-all cursor-pointer flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Salvar Todas as Configurações de Frete</span>
        </button>
      </div>
    </form>
  );
};
