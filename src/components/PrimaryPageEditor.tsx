import React, { useState } from 'react';
import {
  Sparkles,
  Type,
  Save,
  RotateCcw,
  Check,
  MessageCircle,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  Truck,
  Heart,
  Instagram,
  Phone,
  HelpCircle,
  Palette,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';
import { StoreSettings } from '../types';
import { INITIAL_SETTINGS } from '../data/initialData';
import { OFFICIAL_BRAND_LOGO } from '../constants/assets';
import { LogoManager } from './LogoManager';

interface PrimaryPageEditorProps {
  settings: StoreSettings;
  onSaveSettings: (settings: StoreSettings) => void;
}

export const PrimaryPageEditor: React.FC<PrimaryPageEditorProps> = ({
  settings,
  onSaveSettings,
}) => {
  const [formData, setFormData] = useState<StoreSettings>({ ...settings });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleChange = (field: keyof StoreSettings, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  const handleResetToDefaults = () => {
    if (
      window.confirm(
        'Deseja restaurar todos os textos da página primária para os padrões originais da loja?'
      )
    ) {
      const resetData: StoreSettings = {
        ...formData,
        heroTitle: INITIAL_SETTINGS.heroTitle,
        heroSubtitle: INITIAL_SETTINGS.heroSubtitle,
        announcementText: INITIAL_SETTINGS.announcementText,
        heroCtaWhatsAppText: INITIAL_SETTINGS.heroCtaWhatsAppText,
        heroCtaStockText: INITIAL_SETTINGS.heroCtaStockText,
        heroCtaTikTokText: INITIAL_SETTINGS.heroCtaTikTokText,
        heroCtaSiteText: INITIAL_SETTINGS.heroCtaSiteText,
        heroWhatsAppDefaultMessage: INITIAL_SETTINGS.heroWhatsAppDefaultMessage,
        catalogBadgeText: INITIAL_SETTINGS.catalogBadgeText,
        catalogTitle: INITIAL_SETTINGS.catalogTitle,
        catalogSubtitle: INITIAL_SETTINGS.catalogSubtitle,
        catalogSearchPlaceholder: INITIAL_SETTINGS.catalogSearchPlaceholder,
        tiktokBadgeText: INITIAL_SETTINGS.tiktokBadgeText,
        tiktokSectionTitle: INITIAL_SETTINGS.tiktokSectionTitle,
        tiktokSectionSubtitle: INITIAL_SETTINGS.tiktokSectionSubtitle,
        tiktokButtonText: INITIAL_SETTINGS.tiktokButtonText,
        featuresTitle: INITIAL_SETTINGS.featuresTitle,
        featuresSubtitle: INITIAL_SETTINGS.featuresSubtitle,
        feature1Title: INITIAL_SETTINGS.feature1Title,
        feature1Desc: INITIAL_SETTINGS.feature1Desc,
        feature2Title: INITIAL_SETTINGS.feature2Title,
        feature2Desc: INITIAL_SETTINGS.feature2Desc,
        feature3Title: INITIAL_SETTINGS.feature3Title,
        feature3Desc: INITIAL_SETTINGS.feature3Desc,
        feature4Title: INITIAL_SETTINGS.feature4Title,
        feature4Desc: INITIAL_SETTINGS.feature4Desc,
        socialTitle: INITIAL_SETTINGS.socialTitle,
        socialSubtitle: INITIAL_SETTINGS.socialSubtitle,
        socialTikTokTitle: INITIAL_SETTINGS.socialTikTokTitle,
        socialTikTokDesc: INITIAL_SETTINGS.socialTikTokDesc,
        socialInstagramTitle: INITIAL_SETTINGS.socialInstagramTitle,
        socialInstagramDesc: INITIAL_SETTINGS.socialInstagramDesc,
        socialWhatsAppTitle: INITIAL_SETTINGS.socialWhatsAppTitle,
        socialWhatsAppDesc: INITIAL_SETTINGS.socialWhatsAppDesc,
        footerAboutText: INITIAL_SETTINGS.footerAboutText,
        footerCompanyDoc: INITIAL_SETTINGS.footerCompanyDoc,
        footerCopyrightText: INITIAL_SETTINGS.footerCopyrightText,
        supportHours: INITIAL_SETTINGS.supportHours,
      };
      setFormData(resetData);
      onSaveSettings(resetData);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-5xl pb-10 text-white">
      {/* Top Banner Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-[#2c053a] via-[#48095d] to-[#120119] border border-amber-400/40 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-amber-300" />
            <h3 className="text-lg font-black font-fun text-white">
              Editor Total da Página Primária
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-amber-400 text-purple-950 font-black text-[10px] uppercase">
              Ao Vivo
            </span>
          </div>
          <p className="text-xs text-purple-200/90 max-w-2xl">
            Edite qualquer frase, manchete, legenda, botões e informações da página inicial. Ao clicar em salvar, o site atualiza instantaneamente.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleResetToDefaults}
            className="px-3 py-2 rounded-xl bg-purple-950 hover:bg-purple-900 border border-purple-700/60 text-xs font-bold text-purple-300 flex items-center gap-1.5 transition-all cursor-pointer"
            title="Voltar aos textos originais de fábrica"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar Originais</span>
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-pink-500 hover:opacity-95 text-purple-950 font-black text-xs flex items-center gap-1.5 shadow-lg shadow-pink-950/50 hover:scale-102 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Tudo</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-600/90 border border-emerald-400 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-200" />
          <span>Todas as alterações da página primária foram salvas com sucesso!</span>
        </div>
      )}

      {/* 0. LOGOTIPO & IDENTIDADE VISUAL DA MARCA */}
      <LogoManager
        currentLogoUrl={formData.heroMascotUrl}
        onLogoChange={(newUrl) => {
          handleChange('heroMascotUrl', newUrl);
          onSaveSettings({
            ...formData,
            heroMascotUrl: newUrl,
          });
        }}
      />

      {/* 1. TOPO & FAIXA DE ANÚNCIO */}
      <section className="p-5 rounded-2xl bg-[#1b0222] border border-purple-800/60 space-y-4">
        <div className="flex items-center gap-2 border-b border-purple-800/40 pb-3">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <h4 className="font-fun font-bold text-sm text-white">
            1. Faixa de Destaque Superior (Topo da Página)
          </h4>
        </div>

        <div className="grid grid-cols-1 gap-3 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-purple-200 mb-1">
              Texto da Faixa Superior (Anúncio / Alerta)
            </label>
            <input
              type="text"
              value={formData.announcementText || ''}
              onChange={(e) => handleChange('announcementText', e.target.value)}
              placeholder="Ex: ⚡ As meias mais doidinhas do Brasil! Compre pelo TikTok Shop..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#270332] border border-purple-700/60 text-white text-xs placeholder-purple-400/50 focus:outline-none focus:border-amber-400"
            />
            <p className="text-[11px] text-purple-300/70 mt-1">
              Deixe em branco se quiser ocultar a barra de anúncio superior.
            </p>
          </div>
        </div>
      </section>

      {/* 2. BANNER PRINCIPAL (HERO) */}
      <section className="p-5 rounded-2xl bg-[#1b0222] border border-purple-800/60 space-y-4">
        <div className="flex items-center gap-2 border-b border-purple-800/40 pb-3">
          <Type className="w-4 h-4 text-pink-400" />
          <h4 className="font-fun font-bold text-sm text-white">
            2. Banner Principal (Hero - Manchete e Botões)
          </h4>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-purple-200 mb-1">
              Título Principal da Página (Manchete H1)
            </label>
            <input
              type="text"
              value={formData.heroTitle || ''}
              onChange={(e) => handleChange('heroTitle', e.target.value)}
              placeholder="As Meias Mais Doidinhas do Brasil!"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#270332] border border-purple-700/60 text-white font-bold text-sm placeholder-purple-400/50 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-purple-200 mb-1">
              Subtítulo / Texto de Apoio
            </label>
            <textarea
              rows={2}
              value={formData.heroSubtitle || ''}
              onChange={(e) => handleChange('heroSubtitle', e.target.value)}
              placeholder="Cores vibrantes, estampas autênticas e muito conforto para os seus pés..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#270332] border border-purple-700/60 text-white text-xs placeholder-purple-400/50 focus:outline-none focus:border-amber-400 leading-relaxed"
            />
          </div>

          {/* Textos dos 4 Botões do Banner */}
          <div className="pt-2">
            <h5 className="text-[11px] font-bold uppercase tracking-wider text-amber-300 mb-2">
              Textos dos Botões de Ação (CTAs)
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-purple-200 mb-1">
                  Botão 1 (WhatsApp)
                </label>
                <input
                  type="text"
                  value={formData.heroCtaWhatsAppText || ''}
                  onChange={(e) => handleChange('heroCtaWhatsAppText', e.target.value)}
                  placeholder="Comprar no WhatsApp"
                  className="w-full px-3 py-2 rounded-xl bg-[#270332] border border-purple-700/60 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-purple-200 mb-1">
                  Botão 2 (Estoque)
                </label>
                <input
                  type="text"
                  value={formData.heroCtaStockText || ''}
                  onChange={(e) => handleChange('heroCtaStockText', e.target.value)}
                  placeholder="Ver Estoque"
                  className="w-full px-3 py-2 rounded-xl bg-[#270332] border border-purple-700/60 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-purple-200 mb-1">
                  Botão 3 (TikTok Shop)
                </label>
                <input
                  type="text"
                  value={formData.heroCtaTikTokText || ''}
                  onChange={(e) => handleChange('heroCtaTikTokText', e.target.value)}
                  placeholder="TikTok Shop Oficial"
                  className="w-full px-3 py-2 rounded-xl bg-[#270332] border border-purple-700/60 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-purple-200 mb-1">
                  Botão 4 (Comprar pelo Site)
                </label>
                <input
                  type="text"
                  value={formData.heroCtaSiteText || ''}
                  onChange={(e) => handleChange('heroCtaSiteText', e.target.value)}
                  placeholder="Comprar pelo Site"
                  className="w-full px-3 py-2 rounded-xl bg-[#270332] border border-purple-700/60 text-white text-xs"
                />
              </div>
            </div>
          </div>

          {/* Mensagem Padrão do WhatsApp */}
          <div>
            <label className="block text-[11px] font-bold text-purple-200 mb-1">
              Mensagem Automática ao Chamar no WhatsApp
            </label>
            <input
              type="text"
              value={formData.heroWhatsAppDefaultMessage || ''}
              onChange={(e) =>
                handleChange('heroWhatsAppDefaultMessage', e.target.value)
              }
              placeholder="Olá! Vim pelo site da Doidas e Meias e quero comprar!"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#270332] border border-purple-700/60 text-white text-xs placeholder-purple-400/50 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>
      </section>

      {/* 3. CATÁLOGO / VITRINE DE PRODUTOS */}
      <section className="p-5 rounded-2xl bg-[#1b0222] border border-purple-800/60 space-y-4">
        <div className="flex items-center gap-2 border-b border-purple-800/40 pb-3">
          <ShoppingBag className="w-4 h-4 text-amber-300" />
          <h4 className="font-fun font-bold text-sm text-white">
            3. Seção do Catálogo de Peças (Vitrine)
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-purple-200 mb-1">
              Selo / Badge do Catálogo
            </label>
            <input
              type="text"
              value={formData.catalogBadgeText || ''}
              onChange={(e) => handleChange('catalogBadgeText', e.target.value)}
              placeholder="Catálogo Exclusivo"
              className="w-full px-3 py-2 rounded-xl bg-[#270332] border border-purple-700/60 text-white text-xs"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-purple-200 mb-1">
              Título da Seção de Produtos
            </label>
            <input
              type="text"
              value={formData.catalogTitle || ''}
              onChange={(e) => handleChange('catalogTitle', e.target.value)}
              placeholder="Nossas Peças em Estoque"
              className="w-full px-3 py-2 rounded-xl bg-[#270332] border border-purple-700/60 text-white text-xs font-bold"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[11px] font-bold text-purple-200 mb-1">
              Subtítulo da Seção
            </label>
            <input
              type="text"
              value={formData.catalogSubtitle || ''}
              onChange={(e) => handleChange('catalogSubtitle', e.target.value)}
              placeholder="Escolha suas meias e camisetas favoritas para entrega rápida ou compra via TikTok Shop"
              className="w-full px-3 py-2 rounded-xl bg-[#270332] border border-purple-700/60 text-white text-xs"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-purple-200 mb-1">
              Placeholder do Campo de Busca
            </label>
            <input
              type="text"
              value={formData.catalogSearchPlaceholder || ''}
              onChange={(e) =>
                handleChange('catalogSearchPlaceholder', e.target.value)
              }
              placeholder="Buscar por nome ou modelo..."
              className="w-full px-3 py-2 rounded-xl bg-[#270332] border border-purple-700/60 text-white text-xs"
            />
          </div>
        </div>
      </section>

      {/* 4. CENTRAL TIKTOK SHOP HUB */}
      <section className="p-5 rounded-2xl bg-[#1b0222] border border-purple-800/60 space-y-4">
        <div className="flex items-center gap-2 border-b border-purple-800/40 pb-3">
          <span className="text-base">🎵</span>
          <h4 className="font-fun font-bold text-sm text-white">
            4. Seção TikTok Shop Oficial
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-purple-200 mb-1">
              Selo / Badge TikTok
            </label>
            <input
              type="text"
              value={formData.tiktokBadgeText || ''}
              onChange={(e) => handleChange('tiktokBadgeText', e.target.value)}
              placeholder="Oficial TikTok Shop"
              className="w-full px-3 py-2 rounded-xl bg-[#270332] border border-purple-700/60 text-white text-xs"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-purple-200 mb-1">
              Título da Seção
            </label>
            <input
              type="text"
              value={formData.tiktokSectionTitle || ''}
              onChange={(e) => handleChange('tiktokSectionTitle', e.target.value)}
              placeholder="Compre também pelo TikTok Shop"
              className="w-full px-3 py-2 rounded-xl bg-[#270332] border border-purple-700/60 text-white text-xs font-bold"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[11px] font-bold text-purple-200 mb-1">
              Subtítulo / Descrição da Central TikTok
            </label>
            <input
              type="text"
              value={formData.tiktokSectionSubtitle || ''}
              onChange={(e) =>
                handleChange('tiktokSectionSubtitle', e.target.value)
              }
              placeholder="Siga nosso perfil oficial para cupons de frete grátis, lives semanais com descontos e unboxings..."
              className="w-full px-3 py-2 rounded-xl bg-[#270332] border border-purple-700/60 text-white text-xs"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-purple-200 mb-1">
              Texto do Botão
            </label>
            <input
              type="text"
              value={formData.tiktokButtonText || ''}
              onChange={(e) => handleChange('tiktokButtonText', e.target.value)}
              placeholder="Abrir TikTok Shop Oficial"
              className="w-full px-3 py-2 rounded-xl bg-[#270332] border border-purple-700/60 text-white text-xs"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-purple-200 mb-1">
              Link Direto do Perfil TikTok Shop
            </label>
            <input
              type="url"
              value={formData.tiktokShopUrl || ''}
              onChange={(e) => handleChange('tiktokShopUrl', e.target.value)}
              placeholder="https://www.tiktok.com/@doidas.e.meias?..."
              className="w-full px-3 py-2 rounded-xl bg-[#270332] border border-purple-700/60 text-white text-xs font-mono"
            />
          </div>
        </div>
      </section>

      {/* 5. DIFERENCIAIS (POR QUE ESCOLHER A DOIDAS E MEIAS) */}
      <section className="p-5 rounded-2xl bg-[#1b0222] border border-purple-800/60 space-y-4">
        <div className="flex items-center gap-2 border-b border-purple-800/40 pb-3">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <h4 className="font-fun font-bold text-sm text-white">
            5. Seção de Diferenciais (4 Benefícios)
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-purple-200 mb-1">
              Título da Seção de Benefícios
            </label>
            <input
              type="text"
              value={formData.featuresTitle || ''}
              onChange={(e) => handleChange('featuresTitle', e.target.value)}
              placeholder="Por que escolher a Doidas e Meias?"
              className="w-full px-3 py-2 rounded-xl bg-[#270332] border border-purple-700/60 text-white text-xs font-bold"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-purple-200 mb-1">
              Subtítulo dos Benefícios
            </label>
            <input
              type="text"
              value={formData.featuresSubtitle || ''}
              onChange={(e) => handleChange('featuresSubtitle', e.target.value)}
              placeholder="Qualidade premium e muito carinho em cada detalhe para os seus pés"
              className="w-full px-3 py-2 rounded-xl bg-[#270332] border border-purple-700/60 text-white text-xs"
            />
          </div>
        </div>

        {/* 4 Cards de Diferenciais */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
          {/* Card 1 */}
          <div className="p-3.5 rounded-xl bg-[#23042d] border border-purple-700/50 space-y-2">
            <span className="text-amber-300 font-bold block text-[11px]">
              Card 1 (Estampas)
            </span>
            <input
              type="text"
              value={formData.feature1Title || ''}
              onChange={(e) => handleChange('feature1Title', e.target.value)}
              placeholder="Estampas Autênticas"
              className="w-full px-3 py-1.5 rounded-lg bg-[#180220] border border-purple-600/50 text-white font-bold"
            />
            <textarea
              rows={2}
              value={formData.feature1Desc || ''}
              onChange={(e) => handleChange('feature1Desc', e.target.value)}
              placeholder="Cores vibrantes que não desbotam na lavagem..."
              className="w-full px-3 py-1.5 rounded-lg bg-[#180220] border border-purple-600/50 text-white text-[11px]"
            />
          </div>

          {/* Card 2 */}
          <div className="p-3.5 rounded-xl bg-[#23042d] border border-purple-700/50 space-y-2">
            <span className="text-amber-300 font-bold block text-[11px]">
              Card 2 (Conforto)
            </span>
            <input
              type="text"
              value={formData.feature2Title || ''}
              onChange={(e) => handleChange('feature2Title', e.target.value)}
              placeholder="Conforto Máximo"
              className="w-full px-3 py-1.5 rounded-lg bg-[#180220] border border-purple-600/50 text-white font-bold"
            />
            <textarea
              rows={2}
              value={formData.feature2Desc || ''}
              onChange={(e) => handleChange('feature2Desc', e.target.value)}
              placeholder="Trama canelada em algodão selecionado..."
              className="w-full px-3 py-1.5 rounded-lg bg-[#180220] border border-purple-600/50 text-white text-[11px]"
            />
          </div>

          {/* Card 3 */}
          <div className="p-3.5 rounded-xl bg-[#23042d] border border-purple-700/50 space-y-2">
            <span className="text-amber-300 font-bold block text-[11px]">
              Card 3 (Envio)
            </span>
            <input
              type="text"
              value={formData.feature3Title || ''}
              onChange={(e) => handleChange('feature3Title', e.target.value)}
              placeholder="Envio Rápido"
              className="w-full px-3 py-1.5 rounded-lg bg-[#180220] border border-purple-600/50 text-white font-bold"
            />
            <textarea
              rows={2}
              value={formData.feature3Desc || ''}
              onChange={(e) => handleChange('feature3Desc', e.target.value)}
              placeholder="Pedidos despachados com agilidade..."
              className="w-full px-3 py-1.5 rounded-lg bg-[#180220] border border-purple-600/50 text-white text-[11px]"
            />
          </div>

          {/* Card 4 */}
          <div className="p-3.5 rounded-xl bg-[#23042d] border border-purple-700/50 space-y-2">
            <span className="text-amber-300 font-bold block text-[11px]">
              Card 4 (Segurança)
            </span>
            <input
              type="text"
              value={formData.feature4Title || ''}
              onChange={(e) => handleChange('feature4Title', e.target.value)}
              placeholder="Compra Segura"
              className="w-full px-3 py-1.5 rounded-lg bg-[#180220] border border-purple-600/50 text-white font-bold"
            />
            <textarea
              rows={2}
              value={formData.feature4Desc || ''}
              onChange={(e) => handleChange('feature4Desc', e.target.value)}
              placeholder="Fechamento transparente via Pix, WhatsApp..."
              className="w-full px-3 py-1.5 rounded-lg bg-[#180220] border border-purple-600/50 text-white text-[11px]"
            />
          </div>
        </div>
      </section>

      {/* 6. REDES SOCIAIS & CONTATO (CARDS INFERIORES) */}
      <section className="p-5 rounded-2xl bg-[#1b0222] border border-purple-800/60 space-y-4">
        <div className="flex items-center gap-2 border-b border-purple-800/40 pb-3">
          <Instagram className="w-4 h-4 text-pink-400" />
          <h4 className="font-fun font-bold text-sm text-white">
            6. Seção Redes Sociais & Contato (Cards Inferiores)
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-purple-200 mb-1">
              Título da Seção de Redes
            </label>
            <input
              type="text"
              value={formData.socialTitle || ''}
              onChange={(e) => handleChange('socialTitle', e.target.value)}
              placeholder="Acompanhe a Doidas e Meias"
              className="w-full px-3 py-2 rounded-xl bg-[#270332] border border-purple-700/60 text-white text-xs font-bold"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-purple-200 mb-1">
              Subtítulo de Redes
            </label>
            <input
              type="text"
              value={formData.socialSubtitle || ''}
              onChange={(e) => handleChange('socialSubtitle', e.target.value)}
              placeholder="Fique por dentro dos novos lançamentos, reposições..."
              className="w-full px-3 py-2 rounded-xl bg-[#270332] border border-purple-700/60 text-white text-xs"
            />
          </div>
        </div>

        {/* 3 Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
          <div className="p-3.5 rounded-xl bg-[#23042d] border border-pink-500/40 space-y-2">
            <span className="text-pink-400 font-bold block text-[11px]">Card TikTok</span>
            <input
              type="text"
              value={formData.socialTikTokTitle || ''}
              onChange={(e) => handleChange('socialTikTokTitle', e.target.value)}
              placeholder="TikTok Shop Oficial"
              className="w-full px-3 py-1.5 rounded-lg bg-[#180220] border border-purple-600/50 text-white font-bold"
            />
            <textarea
              rows={2}
              value={formData.socialTikTokDesc || ''}
              onChange={(e) => handleChange('socialTikTokDesc', e.target.value)}
              placeholder="Assista aos nossos vídeos, confira avaliações..."
              className="w-full px-3 py-1.5 rounded-lg bg-[#180220] border border-purple-600/50 text-white text-[11px]"
            />
          </div>

          <div className="p-3.5 rounded-xl bg-[#23042d] border border-purple-500/40 space-y-2">
            <span className="text-purple-300 font-bold block text-[11px]">Card Instagram</span>
            <input
              type="text"
              value={formData.socialInstagramTitle || ''}
              onChange={(e) => handleChange('socialInstagramTitle', e.target.value)}
              placeholder="Instagram"
              className="w-full px-3 py-1.5 rounded-lg bg-[#180220] border border-purple-600/50 text-white font-bold"
            />
            <textarea
              rows={2}
              value={formData.socialInstagramDesc || ''}
              onChange={(e) => handleChange('socialInstagramDesc', e.target.value)}
              placeholder="Fotos de alta resolução, unboxing..."
              className="w-full px-3 py-1.5 rounded-lg bg-[#180220] border border-purple-600/50 text-white text-[11px]"
            />
          </div>

          <div className="p-3.5 rounded-xl bg-[#23042d] border border-emerald-500/40 space-y-2">
            <span className="text-emerald-300 font-bold block text-[11px]">Card WhatsApp</span>
            <input
              type="text"
              value={formData.socialWhatsAppTitle || ''}
              onChange={(e) => handleChange('socialWhatsAppTitle', e.target.value)}
              placeholder="WhatsApp Atendimento"
              className="w-full px-3 py-1.5 rounded-lg bg-[#180220] border border-purple-600/50 text-white font-bold"
            />
            <textarea
              rows={2}
              value={formData.socialWhatsAppDesc || ''}
              onChange={(e) => handleChange('socialWhatsAppDesc', e.target.value)}
              placeholder="Fale direto com a gente no WhatsApp..."
              className="w-full px-3 py-1.5 rounded-lg bg-[#180220] border border-purple-600/50 text-white text-[11px]"
            />
          </div>
        </div>
      </section>

      {/* 7. RODAPÉ & DADOS INSTITUCIONAIS */}
      <section className="p-5 rounded-2xl bg-[#1b0222] border border-purple-800/60 space-y-4">
        <div className="flex items-center gap-2 border-b border-purple-800/40 pb-3">
          <Phone className="w-4 h-4 text-cyan-400" />
          <h4 className="font-fun font-bold text-sm text-white">
            7. Rodapé & Dados Institucionais
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-bold text-purple-200 mb-1">
              Texto "Sobre a Loja" no Rodapé
            </label>
            <textarea
              rows={2}
              value={formData.footerAboutText || ''}
              onChange={(e) => handleChange('footerAboutText', e.target.value)}
              placeholder="As meias mais divertidas, coloridas e confortáveis do Brasil..."
              className="w-full px-3.5 py-2 rounded-xl bg-[#270332] border border-purple-700/60 text-white text-xs"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-amber-300 mb-1">
              CNPJ Oficial da Empresa
            </label>
            <input
              type="text"
              value={formData.cnpj || ''}
              onChange={(e) => handleChange('cnpj', e.target.value)}
              placeholder="Ex: 52.819.340/0001-92"
              className="w-full px-3 py-2 rounded-xl bg-[#270332] border border-amber-500/80 text-amber-300 text-xs font-mono font-bold"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-purple-200 mb-1">
              Razão Social Oficial (Receita Federal)
            </label>
            <input
              type="text"
              value={formData.companyLegalName || ''}
              onChange={(e) => handleChange('companyLegalName', e.target.value)}
              placeholder="Doidas e Meias Confecções e Comércio do Brasil Ltda"
              className="w-full px-3 py-2 rounded-xl bg-[#270332] border border-purple-700/60 text-white text-xs"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-purple-200 mb-1">
              Telefone / WhatsApp de Atendimento
            </label>
            <input
              type="text"
              value={formData.whatsappDisplay || ''}
              onChange={(e) => handleChange('whatsappDisplay', e.target.value)}
              placeholder="(11) 97520-8196"
              className="w-full px-3 py-2 rounded-xl bg-[#270332] border border-purple-700/60 text-white text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-purple-200 mb-1">
              Telefone Fixo / SAC Secundário
            </label>
            <input
              type="text"
              value={formData.supportPhone || ''}
              onChange={(e) => handleChange('supportPhone', e.target.value)}
              placeholder="(11) 97520-8196"
              className="w-full px-3 py-2 rounded-xl bg-[#270332] border border-purple-700/60 text-white text-xs font-mono"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[11px] font-bold text-purple-200 mb-1">
              Endereço Completo da Empresa / Sede
            </label>
            <input
              type="text"
              value={formData.companyAddress || ''}
              onChange={(e) => handleChange('companyAddress', e.target.value)}
              placeholder="Rua das Flores, 120, Sala 3 - Centro, São Paulo - SP, CEP 01001-000"
              className="w-full px-3 py-2 rounded-xl bg-[#270332] border border-purple-700/60 text-white text-xs"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-purple-200 mb-1">
              Horário de Atendimento
            </label>
            <input
              type="text"
              value={formData.supportHours || ''}
              onChange={(e) => handleChange('supportHours', e.target.value)}
              placeholder="Segunda a Sábado, das 09h às 19h"
              className="w-full px-3 py-2 rounded-xl bg-[#270332] border border-purple-700/60 text-white text-xs"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-purple-200 mb-1">
              Razão Social / CNPJ ou Registro (Linha Resumida)
            </label>
            <input
              type="text"
              value={formData.footerCompanyDoc || ''}
              onChange={(e) => handleChange('footerCompanyDoc', e.target.value)}
              placeholder="Doidas e Meias • Confecções e Comércio do Brasil"
              className="w-full px-3 py-2 rounded-xl bg-[#270332] border border-purple-700/60 text-white text-xs"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[11px] font-bold text-purple-200 mb-1">
              Texto de Direitos Autorais / Copyright
            </label>
            <input
              type="text"
              value={formData.footerCopyrightText || ''}
              onChange={(e) => handleChange('footerCopyrightText', e.target.value)}
              placeholder="Todos os direitos reservados. Feito com muito carinho para os seus pés."
              className="w-full px-3 py-2 rounded-xl bg-[#270332] border border-purple-700/60 text-white text-xs"
            />
          </div>
        </div>
      </section>

      {/* Floating or Bottom Save Bar */}
      <div className="sticky bottom-3 z-30 p-4 rounded-2xl bg-[#290334]/95 backdrop-blur-md border border-amber-400/50 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-300" />
          <span className="text-xs font-bold text-white">
            Pronto para publicar suas alterações na página primária?
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleResetToDefaults}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-purple-950 hover:bg-purple-900 border border-purple-700/70 text-xs font-bold text-purple-200 cursor-pointer"
          >
            Restaurar Originais
          </button>
          <button
            type="submit"
            className="flex-1 sm:flex-none px-7 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-pink-500 hover:opacity-95 text-purple-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-pink-950/60 hover:scale-102 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Alterações da Página</span>
          </button>
        </div>
      </div>
    </form>
  );
};
