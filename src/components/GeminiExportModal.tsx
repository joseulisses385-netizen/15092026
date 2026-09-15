import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Download,
  Bot,
  FileJson,
  Sparkles,
  Database,
  ExternalLink,
} from 'lucide-react';
import {
  Product,
  StoreSettings,
  Supplier,
  Manufacturer,
  Order,
  Customer,
  StaffUser,
} from '../types';

interface GeminiExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: StoreSettings;
  products: Product[];
  suppliers: Supplier[];
  manufacturers: Manufacturer[];
  orders: Order[];
  customers?: Customer[];
  staffUsers?: StaffUser[];
}

export const GeminiExportModal: React.FC<GeminiExportModalProps> = ({
  isOpen,
  onClose,
  settings,
  products,
  suppliers,
  manufacturers,
  orders,
  customers = [],
  staffUsers = [],
}) => {
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [activeTab, setActiveTab] = useState<'prompt' | 'json'>('prompt');

  

  // Build the complete JSON payload
  const fullBackupObject = {
    exportedAt: new Date().toISOString(),
    storeName: settings.storeName,
    settings,
    products,
    suppliers,
    manufacturers,
    orders,
    customers,
    staffUsers,
  };

  const jsonString = JSON.stringify(fullBackupObject, null, 2);

  // Build human & AI optimized Markdown prompt for Gemini
  const geminiPromptText = `Você é o assistente técnico especialista no e-commerce **${settings.storeName}** (As meias mais divertidas do Brasil).

Abaixo estão TODOS os dados atualizados, regras de negócio, estoque, produtos, fornecedores, logística e acessos cadastrados no sistema. Utilize esses dados como fonte de verdade para qualquer dúvida, nova funcionalidade, relatório ou melhoria:

---

### 1. DADOS BÁSICOS & CANAIS OFICIAIS
- **Nome da Loja**: ${settings.storeName}
- **Slogan**: ${settings.tagline}
- **WhatsApp Oficial**: ${settings.whatsappDisplay || settings.whatsappNumber} (Link: https://wa.me/${settings.whatsappNumber})
- **TikTok Shop Oficial**: ${settings.tiktokShopUrl} (@${settings.tiktokUsername})
- **Instagram**: ${settings.instagramUrl}
- **Chave Pix**: ${settings.pixKey} (${settings.pixKeyType.toUpperCase()} - ${settings.pixBeneficiary})
- **Link Cartão Mercado Pago**: ${settings.cardGatewayUrl}
- **Sistema de Estoque ERP / Abacus**: ${settings.stockSystemUrl}
- **Regras de Frete Grátis**: Pedidos acima de R$ ${settings.freeShippingThreshold.toFixed(2)} (Origem: ${settings.shippingOriginCity} / CEP ${settings.shippingOriginCep})

---

### 2. USUÁRIOS & CREDENCIAIS DO SISTEMA
- **Senha Mestra / PIN do Diretor**: ${settings.adminPin}
- **Usuários da Equipe**:
${
  staffUsers.length > 0
    ? staffUsers
        .map(
          (u) =>
            `  - Usuário: "${u.username}" | Senha: "${u.password}" | Cargo: ${u.role === 'admin' ? 'Administrador Geral' : 'Operador de Estoque'} | Nome: ${u.name}`
        )
        .join('\n')
    : '  - Usuário admin: senha ' + settings.adminPin
}

---

### 3. CATÁLOGO DE PRODUTOS & ESTOQUE ATUAL (${products.length} itens cadastrados)
${products
  .map(
    (p, idx) => `#### Produto #${idx + 1}: ${p.name}
- **ID**: ${p.id} | **SKU**: ${p.sku || 'N/A'}
- **Categoria**: ${p.category} | **Tamanhos/Modelo**: ${p.tamanhos || p.fitType || 'Único'}
- **Preço de Venda**: R$ ${Number(p.price).toFixed(2)} | **Custo Unitário**: R$ ${(Number(p.custoUnitario) || 0).toFixed(2)} | **Margem Bruta**: R$ ${(p.price - (p.custoUnitario || 0)).toFixed(2)}
- **Estoque Disponível**: ${p.stockQuantity} unidades (Estoque Mínimo: ${p.estoqueMinimo || 0})
- **Localização no Estoque Físico**: ${p.localizacaoEstoque || 'Geral'}
- **Fornecedor**: ${p.supplierName || 'N/A'} (Fabricante: ${p.fabricante || 'N/A'})
- **Descrição**: ${p.description}
`
  )
  .join('\n')}

---

### 4. FORNECEDORES CADASTRADOS (${suppliers.length} parceiros)
${suppliers
  .map(
    (s, idx) => `#### Fornecedor #${idx + 1}: ${s.name}
- **Razão Social / Fantasia**: ${s.tradeName || s.name}
- **CNPJ/CPF**: ${s.cnpjOrCpf}
- **Contato**: ${s.contactPerson} | **Telefone**: ${s.phone} | **E-mail**: ${s.email}
- **Localização**: ${s.city}/${s.state} | **Prazo de Entrega Médio**: ${s.deliveryDays} dias
- **Condições de Pagamento**: ${s.paymentTerms}
- **Categorias Fornecidas**: ${s.categoriesSupplied.join(', ')}
- **Notas**: ${s.notes}
`
  )
  .join('\n')}

---

### 5. MODALIDADES DE ENVIO & LOGÍSTICA CONFIGURADAS
${settings.shippingMethods
  .map(
    (m) =>
      `- **${m.name}** (${m.carrier}): R$ ${Number(m.price).toFixed(2)} | Prazo: ${m.deliveryEstimate} | Dica: ${m.platformTip} (Status: ${m.enabled ? 'Ativo' : 'Inativo'})`
  )
  .join('\n')}

---

### 6. CLIENTES CADASTRADOS & LGPD (${customers.length} registros)
${
  customers.length === 0
    ? 'Nenhum cliente cadastrado no momento (banco pronto com suporte a consentimento e anonimização LGPD).'
    : customers
        .map(
          (c) =>
            `- **${c.name}** | WhatsApp: ${c.phone} | E-mail: ${c.email || 'N/A'} | Cidade: ${c.city || 'N/A'} | Status: ${c.status || 'ativo'} | Consentimento LGPD: ${c.lgpdConsent ? 'Sim' : 'Não'}`
        )
        .join('\n')
}

---

### 7. PEDIDOS REGISTRADOS (${orders.length} pedidos)
${
  orders.length === 0
    ? 'Nenhum pedido finalizado no momento.'
    : orders
        .map(
          (o) =>
            `- Pedido #${o.orderNumber}: R$ ${Number(o.total).toFixed(2)} | Cliente: ${o.customerName} (${o.customerPhone}) | Status: ${o.status} | Canal: ${o.channel || 'Site'}`
        )
        .join('\n')
}

---
Pronto! Com esses dados, você tem o estado exato da loja Doidas e Meias. O que você gostaria de fazer a seguir?`;

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(geminiPromptText);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 3000);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = geminiPromptText;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 3000);
    }
  };

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 3000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = jsonString;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 3000);
    }
  };

  const handleDownloadFile = () => {
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `doidas-e-meias-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-[#14011c] text-white rounded-3xl border border-purple-800/80 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 bg-gradient-to-r from-purple-950 via-[#270335] to-pink-950 border-b border-purple-800/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-pink-500/20">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-wide flex items-center gap-2">
                <span>Exportar Dados para Outro Gemini</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/30 text-pink-300 border border-pink-400/40 font-mono font-bold">
                  Backup Completo
                </span>
              </h3>
              <p className="text-xs text-purple-200/80">
                Copie o prompt estruturado ou baixe o arquivo JSON para continuar em qualquer chat da IA.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-purple-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Action Banner */}
        <div className="p-4 sm:p-5 bg-purple-950/40 border-b border-purple-900/60 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-purple-200">
            <Database className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Inclui: <strong>{products.length} produtos</strong>, <strong>{suppliers.length} fornecedores</strong>, <strong>{settings.shippingMethods.length} opções de frete</strong>, credenciais e configurações da loja.
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleCopyPrompt}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-lg ${
                copiedPrompt
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white'
              }`}
            >
              {copiedPrompt ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Prompt Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar Prompt para o Gemini</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownloadFile}
              className="px-3.5 py-2 rounded-xl bg-purple-900/80 hover:bg-purple-800 text-purple-200 hover:text-white border border-purple-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-sm"
              title="Baixar arquivo .json no computador ou celular"
            >
              <Download className="w-4 h-4 text-cyan-300" />
              <span>Baixar Arquivo .JSON</span>
            </button>
          </div>
        </div>

        {/* Tabs Switcher */}
        <div className="flex border-b border-purple-900/50 bg-[#0e0114] px-5 pt-3 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('prompt')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border-b-2 ${
              activeTab === 'prompt'
                ? 'text-pink-400 border-pink-500'
                : 'text-purple-300/70 border-transparent hover:text-white'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Prompt Formatado para o Gemini (Recomendado)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('json')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border-b-2 ${
              activeTab === 'json'
                ? 'text-pink-400 border-pink-500'
                : 'text-purple-300/70 border-transparent hover:text-white'
            }`}
          >
            <FileJson className="w-3.5 h-3.5" />
            <span>Código JSON Puro (Banco de Dados)</span>
          </button>
        </div>

        {/* Content Viewer */}
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-4 bg-[#0a000e]">
          {activeTab === 'prompt' ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-purple-300">
                <span>Como usar: Clique no botão abaixo, abra o novo chat do Gemini e aperte <strong>Ctrl+V</strong> (ou Colar).</span>
                <button
                  type="button"
                  onClick={handleCopyPrompt}
                  className="text-pink-400 hover:text-pink-300 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedPrompt ? 'Copiado!' : 'Copiar Texto'}</span>
                </button>
              </div>
              <pre className="p-4 rounded-2xl bg-[#14011b] border border-purple-900/70 text-purple-100 text-xs font-mono whitespace-pre-wrap select-all leading-relaxed max-h-[50vh] overflow-y-auto">
                {geminiPromptText}
              </pre>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-purple-300">
                <span>Formato universal JSON com todos os nós do banco:</span>
                <button
                  type="button"
                  onClick={handleCopyJson}
                  className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedJson ? 'Copiado!' : 'Copiar JSON'}</span>
                </button>
              </div>
              <pre className="p-4 rounded-2xl bg-[#14011b] border border-purple-900/70 text-cyan-200 text-xs font-mono whitespace-pre-wrap select-all leading-relaxed max-h-[50vh] overflow-y-auto">
                {jsonString}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-purple-950/70 border-t border-purple-900/60 flex items-center justify-between text-xs text-purple-300">
          <span>💡 Dica: Você também pode anexar o arquivo JSON baixado diretamente no chat do Gemini.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
