const fs = require('fs');
let code = fs.readFileSync('src/components/CustomersManagerTab.tsx', 'utf8');

// Update import
code = code.replace(
  "import { syncCustomersFromOrdersOnServer } from '../services/storeApi';",
  "import { syncCustomersFromOrdersOnServer, saveCustomerToServer } from '../services/storeApi';"
);

// Add the handle add customer function
const handleAddFunction = `
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
`;

code = code.replace(
  "  const handleSyncOrders = async () => {",
  handleAddFunction + "\n  const handleSyncOrders = async () => {"
);

// Add the UI
// Look for where to put the "Add Customer" button. The user showed the "Disparador de Novas Promoções".
// Actually, it would be useful in both or just in the header of the Customers Manager Tab.
// Let's add it right next to the search input.

const searchInputArea = `
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
`;

code = code.replace(
  /\{\/\* Filters & Search bar \*\/\}\s*<div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-\[#1d0224\] p-3\.5 rounded-2xl border border-purple-900\/60">\s*<div className="relative flex-1">\s*<Search className="w-4 h-4 text-purple-400 absolute left-3\.5 top-1\/2 -translate-y-1\/2" \/>\s*<input\s*type="text"\s*value=\{searchTerm\}\s*onChange=\{\(e\) => setSearchTerm\(e\.target\.value\)\}\s*placeholder="Pesquisar por nome, WhatsApp, e-mail ou cidade\.\.\."\s*className="w-full pl-9 pr-4 py-2 rounded-xl bg-\[#14011a\] border border-purple-800\/60 text-xs text-white placeholder-purple-400\/50 focus:outline-none focus:border-pink-500"\s*\/>\s*<\/div>/,
  searchInputArea
);

// Add the Modal for adding a customer right before the table
const customerModal = `
      {isAddingCustomer && (
        <div className="p-4 rounded-2xl bg-[#1a0224] border border-pink-500/50 space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 opacity-10 pointer-events-none">
            <Users className="w-24 h-24 text-pink-500" />
          </div>
          
          <div className="flex justify-between items-start relative z-10">
            <div>
              <h3 className="text-sm font-black text-pink-300 font-fun">Adicionar Novo Cliente</h3>
              <p className="text-xs text-purple-200/80">Cadastre o nome e WhatsApp para poder enviar promoções no Disparador.</p>
            </div>
            <button onClick={() => setIsAddingCustomer(false)} className="text-purple-400 hover:text-white cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative z-10">
            <div>
              <label className="block text-[11px] font-bold text-purple-200 mb-1">Nome Completo</label>
              <input
                type="text"
                value={newCustName}
                onChange={(e) => setNewCustName(e.target.value)}
                placeholder="Ex: Maria Silva"
                className="w-full px-3 py-2 rounded-xl bg-[#14011a] border border-purple-800/60 text-xs text-white focus:outline-none focus:border-pink-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-purple-200 mb-1">WhatsApp</label>
              <input
                type="text"
                value={newCustPhone}
                onChange={(e) => setNewCustPhone(e.target.value)}
                placeholder="Ex: 11999999999"
                className="w-full px-3 py-2 rounded-xl bg-[#14011a] border border-purple-800/60 text-xs text-white focus:outline-none focus:border-pink-500"
              />
            </div>
          </div>
          <div className="flex justify-end pt-2 relative z-10">
            <button
              onClick={handleQuickAddCustomer}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold text-xs shadow-md hover:scale-105 transition-all cursor-pointer"
            >
              Salvar e Adicionar
            </button>
          </div>
        </div>
      )}
`;

code = code.replace(
  `        </div>
      </div>

      {/* Main Customers List / Table */}`,
  `        </div>
      </div>

${customerModal}

      {/* Main Customers List / Table */}`
);

fs.writeFileSync('src/components/CustomersManagerTab.tsx', code);
