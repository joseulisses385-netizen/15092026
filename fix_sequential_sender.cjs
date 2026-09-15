const fs = require('fs');
let code = fs.readFileSync('src/components/CustomersMarketingBroadcast.tsx', 'utf8');

// Add states for sequential sending
code = code.replace(
  "const [sentCustomerIds, setSentCustomerIds] = useState<Set<string>>(new Set());",
  `const [sentCustomerIds, setSentCustomerIds] = useState<Set<string>>(new Set());
  const [sequentialQueue, setSequentialQueue] = useState<Customer[]>([]);
  const [isSequentialRunning, setIsSequentialRunning] = useState(false);`
);

// Add useEffect for window focus
const effectCode = `
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
      const clean = (c.phone || '').replace(/\\D/g, '');
      return clean.length >= 8 && !sentCustomerIds.has(c.id);
    });

    if (pending.length === 0) {
      alert('Todos os clientes desta lista já receberam a mensagem ou não possuem telefone válido.');
      return;
    }

    if (confirm(\`Iniciar disparo sequencial para \${pending.length} clientes? \\n\\nO WhatsApp Web será aberto. Envie a mensagem, FECHE a aba do WhatsApp e a próxima abrirá automaticamente.\`)) {
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
    const clean = (cust.phone || '').replace(/\\D/g, '');
    if (!clean) {
      if (!isSequential) alert(\`O cliente \${cust.name} não possui telefone cadastrado.\`);
      return;
    }

    const phone55 = clean.startsWith('55') ? clean : \`55\${clean}\`;
    const text = generateMessageText(cust.name, cust.welcomeCoupon || selectedCouponCode);
    const url = \`https://wa.me/\${phone55}?text=\${encodeURIComponent(text)}\`;
    
    window.open(url, '_blank', 'noopener,noreferrer');
    setSentCustomerIds((prev) => new Set(prev).add(cust.id));
  };
`;

code = code.replace(
  "  const handleSendSingleWhatsApp = (cust: Customer) => {\n    const clean = (cust.phone || '').replace(/\\D/g, '');\n    if (!clean) {\n      alert(`O cliente ${cust.name} não possui telefone cadastrado.`);\n      return;\n    }\n\n    const phone55 = clean.startsWith('55') ? clean : `55${clean}`;\n    const text = generateMessageText(cust.name, cust.welcomeCoupon || selectedCouponCode);\n    const url = `https://wa.me/${phone55}?text=${encodeURIComponent(text)}`;\n    \n    window.open(url, '_blank', 'noopener,noreferrer');\n    setSentCustomerIds((prev) => new Set(prev).add(cust.id));\n  };",
  effectCode
);

// Add the UI button
const uiButton = `
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
`;

code = code.replace(
  /            <div className="flex items-center justify-between">\s*<div>\s*<h4 className="text-xs font-black uppercase text-pink-400 tracking-wider">\s*Disparo Direto 1-a-1\s*<\/h4>\s*<p className="text-\[10px\] text-purple-300\/70 mt-0\.5">\s*Clique para abrir o WhatsApp Web com a mensagem pronta para cada cliente\.\s*<\/p>\s*<\/div>\s*<span className="text-\[10px\] px-2 py-0\.5 rounded-full bg-pink-950 text-pink-300 border border-pink-700\/60 font-bold">\s*\{sentCustomerIds\.size\} enviados\s*<\/span>\s*<\/div>/,
  uiButton
);

fs.writeFileSync('src/components/CustomersMarketingBroadcast.tsx', code);
