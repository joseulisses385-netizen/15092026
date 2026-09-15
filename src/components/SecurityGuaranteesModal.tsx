import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  CheckCircle2,
  RefreshCw,
  FileText,
  Building2,
  ExternalLink,
  X,
  CreditCard,
  Truck,
  Phone,
  Check,
  AlertCircle
} from 'lucide-react';
import { StoreSettings } from '../types';

interface SecurityGuaranteesModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: StoreSettings;
}

export const SecurityGuaranteesModal: React.FC<SecurityGuaranteesModalProps> = ({
  isOpen,
  onClose,
  settings,
}) => {
  const [activeTab, setActiveTab] = useState<'site' | 'entrega' | 'pagamento' | 'cdc' | 'lgpd'>('site');

  

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-gradient-to-b from-[#1c0226] via-[#14011c] to-[#0d0113] border-2 border-emerald-500/60 rounded-3xl shadow-[0_0_50px_rgba(16,185,129,0.25)] text-white overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header com destaque de segurança */}
        <div className="bg-gradient-to-r from-emerald-950 via-[#1e022b] to-emerald-950 p-5 sm:p-6 border-b border-emerald-500/40 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-purple-900/60 hover:bg-purple-800 text-purple-200 hover:text-white transition-colors cursor-pointer"
            title="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-lg shadow-emerald-950/60 shrink-0">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-bold text-[10px] sm:text-xs uppercase tracking-wider mb-1">
                <Lock className="w-3 h-3" />
                <span>Ambiente 100% Criptografado & Verificado</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black font-fun tracking-tight text-white">
                Garantias de Segurança & Proteção ao Cliente
              </h2>
              <p className="text-xs sm:text-sm text-purple-200/80">
                Transparência e segurança total em cada etapa da sua compra na {settings.storeName}.
              </p>
            </div>
          </div>
        </div>

        {/* Barra de Selos Rápidos */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-[#110117] border-b border-purple-900/60 text-xs">
          <div className="flex items-center gap-2 p-2 rounded-xl bg-purple-950/40 border border-purple-800/40">
            <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="min-w-0">
              <p className="font-bold text-white text-[11px] truncate">SSL 256-Bit</p>
              <p className="text-[9px] text-emerald-300">Conexão Segura</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-purple-950/40 border border-purple-800/40">
            <CreditCard className="w-4 h-4 text-[#00c5f0] shrink-0" />
            <div className="min-w-0">
              <p className="font-bold text-white text-[11px] truncate">Mercado Pago</p>
              <p className="text-[9px] text-cyan-300">Antifraude Ativo</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-purple-950/40 border border-purple-800/40">
            <Truck className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="min-w-0">
              <p className="font-bold text-white text-[11px] truncate">Entrega Garantida</p>
              <p className="text-[9px] text-amber-300">Rastreio Oficial</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-purple-950/40 border border-purple-800/40">
            <RefreshCw className="w-4 h-4 text-pink-400 shrink-0" />
            <div className="min-w-0">
              <p className="font-bold text-white text-[11px] truncate">7 Dias de Troca</p>
              <p className="text-[9px] text-pink-300">CDC Art. 49</p>
            </div>
          </div>
        </div>

        {/* Tabs de navegação das garantias */}
        <div className="flex border-b border-purple-900/50 bg-[#16011e] px-4 pt-2 overflow-x-auto scrollbar-none gap-2">
          <button
            onClick={() => setActiveTab('site')}
            className={`px-3 py-2 text-xs font-bold rounded-t-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'site'
                ? 'bg-[#20022b] text-emerald-400 border-t-2 border-emerald-400 font-black'
                : 'text-purple-300/70 hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Site Seguro (SSL)</span>
          </button>
          <button
            onClick={() => setActiveTab('entrega')}
            className={`px-3 py-2 text-xs font-bold rounded-t-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'entrega'
                ? 'bg-[#20022b] text-amber-400 border-t-2 border-amber-400 font-black'
                : 'text-purple-300/70 hover:text-white'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Entrega Garantida</span>
          </button>
          <button
            onClick={() => setActiveTab('pagamento')}
            className={`px-3 py-2 text-xs font-bold rounded-t-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'pagamento'
                ? 'bg-[#20022b] text-cyan-400 border-t-2 border-cyan-400 font-black'
                : 'text-purple-300/70 hover:text-white'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Pagamento Blindado</span>
          </button>
          <button
            onClick={() => setActiveTab('cdc')}
            className={`px-3 py-2 text-xs font-bold rounded-t-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'cdc'
                ? 'bg-[#20022b] text-pink-400 border-t-2 border-pink-400 font-black'
                : 'text-purple-300/70 hover:text-white'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Devolução & CDC</span>
          </button>
          <button
            onClick={() => setActiveTab('lgpd')}
            className={`px-3 py-2 text-xs font-bold rounded-t-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'lgpd'
                ? 'bg-[#20022b] text-purple-300 border-t-2 border-purple-400 font-black'
                : 'text-purple-300/70 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>LGPD & Privacidade</span>
          </button>
        </div>

        {/* Conteúdo dinâmico das garantias */}
        <div className="p-5 sm:p-6 max-h-[60vh] overflow-y-auto space-y-4">
          {activeTab === 'site' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/50">
                <h3 className="font-bold text-sm text-emerald-300 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span>Criptografia de Ponta a Ponta (SSL / TLS 256 bits)</span>
                </h3>
                <p className="text-xs text-purple-200/90 mt-2 leading-relaxed">
                  Nosso site opera com certificado de segurança internacional ativo (HTTPS). Todos os dados transmitidos
                  entre seu dispositivo e nossos servidores são rigorosamente criptografados, impedindo qualquer
                  interceptação por invasores ou terceiros.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-800/40">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Navegação Blindada</span>
                  </h4>
                  <p className="text-[11px] text-purple-300/80 mt-1 leading-relaxed">
                    Proteção ativa contra ataques de phishing, injeção de código e softwares maliciosos. Verificado periodicamente.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-800/40">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Dados de Pagamento Protegidos</span>
                  </h4>
                  <p className="text-[11px] text-purple-300/80 mt-1 leading-relaxed">
                    Nunca armazenamos números de cartão de crédito nem códigos de segurança (CVV). O processamento ocorre diretamente no gateway bancário credenciado.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'entrega' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/50">
                <h3 className="font-bold text-sm text-amber-300 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-amber-400" />
                  <span>Garantia de Recebimento ou Devolução Total</span>
                </h3>
                <p className="text-xs text-purple-200/90 mt-2 leading-relaxed">
                  Todos os pacotes são despachados com seguro de carga e código de rastreamento oficial dos Correios ou transportadoras parceiras (Melhor Envio / Jadlog). Se houver qualquer extravio comprovado, enviamos um novo pedido imediatamente ou reembolsamos 100% do seu pagamento.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-800/40">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-amber-400" />
                    <span>Rastreio Ponto a Ponto</span>
                  </h4>
                  <p className="text-[11px] text-purple-300/80 mt-1 leading-relaxed">
                    Você acompanha todas as movimentações do seu pacote desde a expedição até a entrega na sua porta.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-800/40">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-amber-400" />
                    <span>Embalagem Segura & Lacrada</span>
                  </h4>
                  <p className="text-[11px] text-purple-300/80 mt-1 leading-relaxed">
                    Nossas meias são embaladas individualmente em sacos higienizados e caixas/envelopes invioláveis de segurança.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pagamento' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#009ee3]/15 border border-[#009ee3]/50">
                <h3 className="font-bold text-sm text-[#00c5f0] flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#00c5f0]" />
                  <span>Tecnologia Oficial Mercado Pago & Pix Banco Central</span>
                </h3>
                <p className="text-xs text-purple-200/90 mt-2 leading-relaxed">
                  Operamos com a infraestrutura do Mercado Pago, a maior processadora de pagamentos da América Latina. Seus pagamentos no cartão contam com sistema inteligente de prevenção a fraudes (PCI-DSS Compliance) e o Pix é gerado de acordo com as normas estritas do Banco Central do Brasil.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-800/40">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-cyan-400" />
                    <span>Compra Garantida</span>
                  </h4>
                  <p className="text-[11px] text-purple-300/80 mt-1 leading-relaxed">
                    Sua compra protegida do clique ao recebimento. Você tem amparo financeiro total em caso de qualquer inconformidade.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-800/40">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-cyan-400" />
                    <span>Pix Instantâneo Seguro</span>
                  </h4>
                  <p className="text-[11px] text-purple-300/80 mt-1 leading-relaxed">
                    Confirmação automática em segundos, sem necessidade de enviar comprovantes ou aguardar compensações bancárias demoradas.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'cdc' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-pink-950/40 border border-pink-500/50">
                <h3 className="font-bold text-sm text-pink-300 flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-pink-400" />
                  <span>Garantia de 7 Dias para Troca ou Devolução (CDC Art. 49)</span>
                </h3>
                <p className="text-xs text-purple-200/90 mt-2 leading-relaxed">
                  De acordo com o Código de Defesa do Consumidor, você tem até 7 (sete) dias corridos após o recebimento para solicitar troca ou devolução sem custo por motivo de desistência ou defeito. Processamos sua solicitação com agilidade e cordialidade.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-800/40 space-y-2">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-pink-400" />
                  <span>Como funciona o processo de devolução?</span>
                </h4>
                <ol className="text-[11px] text-purple-300/80 space-y-1 list-decimal list-inside leading-relaxed">
                  <li>Entre em contato pelo nosso WhatsApp oficial ou e-mail com o número do pedido.</li>
                  <li>Geramos a autorização de postagem reversa sem custos para você.</li>
                  <li>Ao recebermos as meias em embalagem original, efetuamos a troca imediata ou estorno integral.</li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'lgpd' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-purple-950/60 border border-purple-600/50">
                <h3 className="font-bold text-sm text-purple-200 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-400" />
                  <span>Conformidade com a LGPD (Lei Geral de Proteção de Dados)</span>
                </h3>
                <p className="text-xs text-purple-200/90 mt-2 leading-relaxed">
                  Cumprimos rigorosamente a Lei Federal nº 13.709/2018. Seus dados cadastrais (nome, endereço, telefone e e-mail) são utilizados estritamente para a emissão do pedido e entrega logística. Jamais vendemos, compartilhamos ou repassamos seus dados a empresas terceiras de publicidade.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-800/40">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-purple-400" />
                  <span>Direito do Titular de Dados</span>
                </h4>
                <p className="text-[11px] text-purple-300/80 mt-1 leading-relaxed">
                  A qualquer momento, você pode solicitar a consulta, retificação ou exclusão total dos seus dados de nosso banco de dados entrando em contato direto com o suporte.
                </p>
              </div>
            </div>
          )}

          {/* Dados Legais da Loja para total idoneidade */}
          <div className="p-4 rounded-2xl bg-[#0f0114] border border-purple-800/60 text-xs">
            <div className="flex items-center gap-2 text-amber-300 font-bold mb-2">
              <Building2 className="w-4 h-4" />
              <span>Identificação da Empresa & Atendimento:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-purple-300/80">
              <div>
                <span className="text-purple-400">Loja Oficial:</span>{' '}
                <strong className="text-white">{settings.companyTradeName || settings.storeName}</strong>
              </div>
              {settings.cnpj && (
                <div>
                  <span className="text-purple-400">CNPJ:</span>{' '}
                  <strong className="text-amber-300 font-mono">{settings.cnpj}</strong>
                </div>
              )}
              {settings.companyAddress && (
                <div className="sm:col-span-2">
                  <span className="text-purple-400">Origem de Envio:</span>{' '}
                  <span className="text-white">{settings.companyAddress}</span>
                </div>
              )}
              <div>
                <span className="text-purple-400">WhatsApp Oficial:</span>{' '}
                <span className="text-white font-mono">{settings.whatsappDisplay}</span>
              </div>
              {settings.contactEmail && (
                <div>
                  <span className="text-purple-400">E-mail:</span>{' '}
                  <span className="text-white">{settings.contactEmail}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Rodapé do Modal */}
        <div className="p-4 bg-[#110117] border-t border-purple-900/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-emerald-300 font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Você está em uma conexão protegida e segura</span>
          </div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/50 transition-all cursor-pointer"
          >
            Entendido, Boas Compras!
          </button>
        </div>
      </div>
    </div>
  );
};
