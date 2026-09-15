import React, { useState } from 'react';
import {
  Tag,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Percent,
  DollarSign,
  ShieldCheck,
  Sparkles,
  Copy,
  Check,
  Gift,
  Calendar,
  Layers,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import { StoreCoupon, StoreSettings, StaffUser } from '../types';

interface CouponsManagerTabProps {
  settings: StoreSettings;
  onSaveSettings: (settings: StoreSettings) => void;
  currentUser?: StaffUser;
}

export const CouponsManagerTab: React.FC<CouponsManagerTabProps> = ({
  settings,
  onSaveSettings,
  currentUser,
}) => {
  const isAdmin = !currentUser || currentUser.role === 'admin';

  // Form states
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(10);
  const [minOrderValue, setMinOrderValue] = useState<number>(150);
  const [maxUsage, setMaxUsage] = useState<string>('');
  const [expiresAt, setExpiresAt] = useState<string>('');

  // Welcome coupon states
  const [welcomeCode, setWelcomeCode] = useState(settings.welcomeCouponCode || 'BEMVINDA10');
  const [welcomeDiscount, setWelcomeDiscount] = useState(settings.welcomeCouponDiscountPercentage ?? 10);
  const [welcomeMinOrder, setWelcomeMinOrder] = useState(settings.welcomeCouponMinOrder ?? 150);
  const [welcomeSavedSuccess, setWelcomeSavedSuccess] = useState(false);

  // General feedback
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const coupons: StoreCoupon[] = settings.coupons || [];

  const handleCopy = (couponCode: string) => {
    navigator.clipboard.writeText(couponCode);
    setCopiedCode(couponCode);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleSaveWelcomeCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    const updated: StoreSettings = {
      ...settings,
      welcomeCouponCode: welcomeCode.trim().toUpperCase() || 'BEMVINDA10',
      welcomeCouponDiscountPercentage: Number(welcomeDiscount) || 10,
      welcomeCouponMinOrder: Number(welcomeMinOrder) || 150,
    };

    onSaveSettings(updated);
    setWelcomeSavedSuccess(true);
    setTimeout(() => setWelcomeSavedSuccess(false), 3000);
  };

  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    const formattedCode = code.trim().toUpperCase().replace(/\s+/g, '');
    if (!formattedCode) {
      alert('Por favor, informe o código do cupom (ex: PROMO10).');
      return;
    }

    // Check if code already exists
    if (coupons.some((c) => c.code.trim().toUpperCase() === formattedCode)) {
      alert(`Já existe um cupom com o código "${formattedCode}". Escolha outro código.`);
      return;
    }

    if (discountValue <= 0) {
      alert('Informe um valor de desconto válido maior que zero.');
      return;
    }

    const newCoupon: StoreCoupon = {
      id: `coupon-${Date.now()}`,
      code: formattedCode,
      description: description.trim() || `Cupom ${formattedCode}`,
      discountType,
      discountValue: Number(discountValue),
      minOrderValue: Number(minOrderValue) || 0,
      usageLimit: maxUsage ? Number(maxUsage) : undefined,
      usageCount: 0,
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
      active: true,
      createdAt: new Date().toISOString(),
    };

    const updatedCoupons = [newCoupon, ...coupons];
    onSaveSettings({
      ...settings,
      coupons: updatedCoupons,
    });

    // Reset form
    setCode('');
    setDescription('');
    setDiscountValue(10);
    setMinOrderValue(150);
    setMaxUsage('');
    setExpiresAt('');

    setFeedbackMsg(`Cupom "${formattedCode}" cadastrado com sucesso!`);
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const handleToggleActive = (id: string) => {
    if (!isAdmin) return;
    const updatedCoupons = coupons.map((c) =>
      c.id === id ? { ...c, active: !c.active } : c
    );
    onSaveSettings({
      ...settings,
      coupons: updatedCoupons,
    });
  };

  const handleDeleteCoupon = (id: string, couponCode: string) => {
    if (!isAdmin) return;
    if (!window.confirm(`Tem certeza que deseja excluir o cupom "${couponCode}"?`)) return;

    const updatedCoupons = coupons.filter((c) => c.id !== id);
    onSaveSettings({
      ...settings,
      coupons: updatedCoupons,
    });
    setFeedbackMsg(`Cupom "${couponCode}" removido.`);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  // Metrics
  const activeCount = coupons.filter((c) => c.active).length;
  const percentageCount = coupons.filter((c) => c.discountType === 'percentage').length;
  const fixedCount = coupons.filter((c) => c.discountType === 'fixed').length;

  if (!isAdmin) {
    return (
      <div className="p-8 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-rose-950/80 border border-rose-800 flex items-center justify-center text-rose-400 mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-white font-fun">Área Restrita à Administração</h3>
        <p className="text-sm text-purple-300/80 max-w-md mx-auto">
          O gerenciamento e cadastro de cupons de desconto é permitido <strong>exclusivamente para administradores e diretores da loja</strong>. Seu perfil atual não possui privilégio administrativo para criar ou alterar regras financeiras.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-gradient-to-r from-purple-950/80 via-pink-950/50 to-purple-900/60 border border-pink-500/30">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-600 to-amber-500 flex items-center justify-center text-white shadow-lg">
            <Tag className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black font-fun text-white flex items-center gap-2">
              <span>Gestão Oficial de Cupons Promocionais</span>
              <span className="text-[10px] bg-amber-400/20 text-amber-300 font-mono px-2 py-0.5 rounded-full border border-amber-400/40">
                Apenas ADM
              </span>
            </h2>
            <p className="text-xs text-purple-200/90">
              Cadastre, edite e ative cupons de desconto em porcentagem (%) ou valor fixo (R$) com regras de pedido mínimo.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-emerald-300 bg-emerald-950/80 px-3 py-1.5 rounded-xl border border-emerald-800/60">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Controle Restrito à Diretoria</span>
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/90 border border-emerald-500/80 text-emerald-200 text-xs font-bold flex items-center gap-2 shadow-lg animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-[#1b0222] border border-purple-800/60 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-900/50 text-pink-400">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-purple-300/70 font-semibold">Total Cupons</p>
            <p className="text-lg font-black text-white">{coupons.length}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#1b0222] border border-purple-800/60 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-950/80 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-purple-300/70 font-semibold">Cupons Ativos</p>
            <p className="text-lg font-black text-emerald-400">{activeCount}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#1b0222] border border-purple-800/60 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-pink-950/80 text-pink-400">
            <Percent className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-purple-300/70 font-semibold">Desconto em %</p>
            <p className="text-lg font-black text-pink-300">{percentageCount}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#1b0222] border border-purple-800/60 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-950/80 text-amber-400">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-purple-300/70 font-semibold">Valor Fixo (R$)</p>
            <p className="text-lg font-black text-amber-300">{fixedCount}</p>
          </div>
        </div>
      </div>

      {/* Grid: Cadastrar Novo Cupom + Cupom de Boas-Vindas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form: Cadastrar Novo Cupom (2 Colunas) */}
        <div className="lg:col-span-2 p-5 rounded-3xl bg-[#1d0324] border border-purple-800/80 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-white border-b border-purple-900/60 pb-3">
            <Plus className="w-5 h-5 text-pink-400" />
            <h3 className="font-fun font-bold text-base">Cadastrar Novo Cupom Promocional</h3>
          </div>

          <form onSubmit={handleAddCoupon} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-purple-200 mb-1">
                  Código do Cupom *
                </label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="EX: VERAO15, VIP20"
                  className="w-full px-3 py-2 rounded-xl bg-[#14011b] border border-purple-700/60 text-xs font-mono text-amber-300 uppercase placeholder-purple-400/50 focus:outline-none focus:border-pink-500"
                />
                <p className="text-[10px] text-purple-400/70 mt-0.5">Letras e números, sem espaços.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-purple-200 mb-1">
                  Tipo de Desconto *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDiscountType('percentage')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                      discountType === 'percentage'
                        ? 'bg-pink-600 border-pink-500 text-white shadow-md'
                        : 'bg-[#14011b] border-purple-700/60 text-purple-300 hover:text-white'
                    }`}
                  >
                    <Percent className="w-3.5 h-3.5" />
                    <span>Porcentagem (%)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiscountType('fixed')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                      discountType === 'fixed'
                        ? 'bg-amber-600 border-amber-500 text-white shadow-md'
                        : 'bg-[#14011b] border-purple-700/60 text-purple-300 hover:text-white'
                    }`}
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Valor Fixo (R$)</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-purple-200 mb-1">
                  {discountType === 'percentage' ? 'Percentual de Desconto (%) *' : 'Valor do Desconto (R$) *'}
                </label>
                <input
                  type="number"
                  min="0.1"
                  step="any"
                  required
                  value={discountValue}
                  onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                  placeholder={discountType === 'percentage' ? '10' : '20.00'}
                  className="w-full px-3 py-2 rounded-xl bg-[#14011b] border border-purple-700/60 text-xs text-white placeholder-purple-400/50 focus:outline-none focus:border-pink-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-purple-200 mb-1">
                  Pedido Mínimo de Compras (R$) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  required
                  value={minOrderValue}
                  onChange={(e) => setMinOrderValue(parseFloat(e.target.value) || 0)}
                  placeholder="150"
                  className="w-full px-3 py-2 rounded-xl bg-[#14011b] border border-purple-700/60 text-xs text-white placeholder-purple-400/50 focus:outline-none focus:border-pink-500 font-mono"
                />
                <p className="text-[10px] text-purple-400/70 mt-0.5">
                  Use 0 para conceder o desconto sem exigência de valor mínimo.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-purple-200 mb-1">
                Descrição ou Motivo da Promoção
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: 15% OFF para clientes fiéis na coleção de inverno"
                className="w-full px-3 py-2 rounded-xl bg-[#14011b] border border-purple-700/60 text-xs text-white placeholder-purple-400/50 focus:outline-none focus:border-pink-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-purple-200 mb-1">
                  Limite de Usos (Opcional)
                </label>
                <input
                  type="number"
                  min="1"
                  value={maxUsage}
                  onChange={(e) => setMaxUsage(e.target.value)}
                  placeholder="Ilimitado"
                  className="w-full px-3 py-2 rounded-xl bg-[#14011b] border border-purple-700/60 text-xs text-white placeholder-purple-400/50 focus:outline-none focus:border-pink-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-purple-200 mb-1">
                  Data de Validade (Opcional)
                </label>
                <input
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#14011b] border border-purple-700/60 text-xs text-white placeholder-purple-400/50 focus:outline-none focus:border-pink-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:opacity-95 text-white text-xs font-black shadow-lg cursor-pointer flex items-center justify-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Salvar e Ativar Novo Cupom</span>
            </button>
          </form>
        </div>

        {/* Cupom Padrão de Boas-Vindas */}
        <div className="p-5 rounded-3xl bg-[#1d0324] border border-purple-800/80 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white border-b border-purple-900/60 pb-3">
              <Gift className="w-5 h-5 text-amber-300" />
              <h3 className="font-fun font-bold text-base">Cupom de Boas-Vindas Oficial</h3>
            </div>

            <p className="text-xs text-purple-200/80">
              Cupom oficial gerado no banner da loja e atribuído automaticamente a novos clientes cadastrados.
            </p>

            {welcomeSavedSuccess && (
              <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-600/80 text-emerald-200 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Configurações do cupom de boas-vindas salvas!</span>
              </div>
            )}

            <form onSubmit={handleSaveWelcomeCoupon} className="space-y-3 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-purple-200 mb-1">
                  Código Oficial
                </label>
                <input
                  type="text"
                  required
                  value={welcomeCode}
                  onChange={(e) => setWelcomeCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 rounded-xl bg-[#14011b] border border-purple-700/60 text-xs font-mono text-amber-300 font-bold focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-purple-200 mb-1">
                    Desconto (%)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={welcomeDiscount}
                    onChange={(e) => setWelcomeDiscount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#14011b] border border-purple-700/60 text-xs font-mono text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-purple-200 mb-1">
                    Mínimo (R$)
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={welcomeMinOrder}
                    onChange={(e) => setWelcomeMinOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#14011b] border border-purple-700/60 text-xs font-mono text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/40 text-[11px] text-amber-200 leading-tight">
                💡 <strong>Regra Vigente:</strong> O cupom <strong>{welcomeCode}</strong> aplica <strong>{welcomeDiscount}% OFF</strong> apenas em pedidos a partir de <strong>R$ {welcomeMinOrder.toFixed(2).replace('.', ',')}</strong>.
              </div>

              <button
                type="submit"
                className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs cursor-pointer transition-all shadow-md"
              >
                Atualizar Cupom de Boas-Vindas
              </button>
            </form>
          </div>

          <div className="text-[11px] text-purple-400/80 border-t border-purple-900/60 pt-3">
            Garantido por Lei LGPD e validado em tempo real no carrinho da loja.
          </div>
        </div>
      </div>

      {/* Lista de Cupons Cadastrados */}
      <div className="p-5 rounded-3xl bg-[#1d0324] border border-purple-800/80 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-900/60 pb-3">
          <div className="flex items-center gap-2 text-white">
            <Layers className="w-5 h-5 text-pink-400" />
            <h3 className="font-fun font-bold text-base">
              Cupons Cadastrados na Loja ({coupons.length})
            </h3>
          </div>
          <span className="text-xs text-purple-300">
            {activeCount} ativos • {coupons.length - activeCount} inativos
          </span>
        </div>

        {coupons.length === 0 ? (
          <div className="text-center py-10 space-y-3">
            <Tag className="w-10 h-10 text-purple-400/50 mx-auto" />
            <p className="text-sm text-purple-300/80">Nenhum cupom adicional cadastrado ainda.</p>
            <p className="text-xs text-purple-400/60">
              Cadastre acima cupons para datas comemorativas, parceiros ou promoções especiais.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-purple-200">
              <thead className="bg-[#14011b] text-purple-300 border-b border-purple-800/60">
                <tr>
                  <th className="py-3 px-3">Código</th>
                  <th className="py-3 px-3">Desconto</th>
                  <th className="py-3 px-3">Pedido Mínimo</th>
                  <th className="py-3 px-3">Descrição</th>
                  <th className="py-3 px-3">Validade</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-900/40">
                {coupons.map((coupon) => {
                  const isPercentage = coupon.discountType === 'percentage';
                  const isExpired = coupon.expiresAt && new Date(coupon.expiresAt) < new Date();

                  return (
                    <tr
                      key={coupon.id}
                      className={`hover:bg-purple-950/40 transition-colors ${
                        !coupon.active ? 'opacity-50' : ''
                      }`}
                    >
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-black text-amber-300 bg-amber-950/80 px-2.5 py-1 rounded-lg border border-amber-600/50 shadow-xs">
                            {coupon.code}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(coupon.code)}
                            className="p-1 rounded hover:bg-purple-800/60 text-purple-300 hover:text-white transition-colors cursor-pointer"
                            title="Copiar código do cupom"
                          >
                            {copiedCode === coupon.code ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      <td className="py-3 px-3 font-bold text-white">
                        {isPercentage ? (
                          <span className="text-pink-400">{coupon.discountValue}% OFF</span>
                        ) : (
                          <span className="text-amber-300">
                            R$ {coupon.discountValue.toFixed(2).replace('.', ',')} OFF
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        {coupon.minOrderValue && coupon.minOrderValue > 0 ? (
                          <span className="text-purple-200">
                            R$ {coupon.minOrderValue.toFixed(2).replace('.', ',')}
                          </span>
                        ) : (
                          <span className="text-emerald-400 font-semibold">Sem mínimo</span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-purple-300 max-w-xs truncate">
                        {coupon.description || '-'}
                      </td>

                      <td className="py-3 px-3 text-[11px] text-purple-300">
                        {coupon.expiresAt ? (
                          <span className={isExpired ? 'text-rose-400 font-bold' : ''}>
                            {new Date(coupon.expiresAt).toLocaleDateString('pt-BR')}
                            {isExpired && ' (Expirado)'}
                          </span>
                        ) : (
                          <span className="text-purple-400/60">Indeterminada</span>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(coupon.id)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer border transition-all ${
                            coupon.active
                              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600/80 hover:bg-emerald-900'
                              : 'bg-rose-950/80 text-rose-300 border-rose-600/80 hover:bg-rose-900'
                          }`}
                        >
                          {coupon.active ? 'Ativo na Loja' : 'Inativo'}
                        </button>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteCoupon(coupon.id, coupon.code)}
                          className="p-1.5 rounded-lg bg-rose-950/50 hover:bg-rose-900/80 text-rose-300 transition-colors cursor-pointer border border-rose-800/40"
                          title="Excluir Cupom"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
