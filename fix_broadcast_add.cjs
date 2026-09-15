const fs = require('fs');
let code = fs.readFileSync('src/components/CustomersMarketingBroadcast.tsx', 'utf8');

if (!code.includes("saveCustomerToServer")) {
  code = code.replace(
    "import { syncCustomersFromOrdersOnServer } from '../services/storeApi';",
    "import { syncCustomersFromOrdersOnServer, saveCustomerToServer } from '../services/storeApi';"
  );
}

// Add state for adding
code = code.replace(
  "const [searchTerm, setSearchTerm] = useState('');",
  "const [searchTerm, setSearchTerm] = useState('');\n  const [isAddingCustomer, setIsAddingCustomer] = useState(false);\n  const [newCustName, setNewCustName] = useState('');\n  const [newCustPhone, setNewCustPhone] = useState('');"
);

const addHandler = `
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
`;

code = code.replace(
  "  const handleSyncOrders = async () => {",
  addHandler + "\n  const handleSyncOrders = async () => {"
);

// find the search input block
const searchBlock = `
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
`;

const originalSearchBlockRegex = /\{\/\* Search inside audience \*\/\}\s*<div className="relative">\s*<Search className="w-3\.5 h-3\.5 text-purple-400 absolute left-3 top-1\/2 -translate-y-1\/2" \/>\s*<input\s*type="text"\s*value=\{searchTerm\}\s*onChange=\{\(e\) => setSearchTerm\(e\.target\.value\)\}\s*placeholder="Buscar cliente na lista\.\.\."\s*className="w-full pl-8 pr-3 py-1\.5 rounded-xl bg-\[#14011a\] border border-purple-800\/60 text-xs text-white placeholder-purple-400\/50 focus:outline-none focus:border-pink-500"\s*\/>\s*<\/div>/;

code = code.replace(originalSearchBlockRegex, searchBlock);

fs.writeFileSync('src/components/CustomersMarketingBroadcast.tsx', code);
