const fs = require('fs');
let code = fs.readFileSync('src/components/CustomersMarketingBroadcast.tsx', 'utf8');

const replacement = `
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

const regex = /const handleSendSingleWhatsApp = \(cust: Customer\) => \{[\s\S]*?setSentCustomerIds\(\(prev\) => new Set\(prev\)\.add\(cust\.id\)\);\s*\};/;
code = code.replace(regex, replacement);

fs.writeFileSync('src/components/CustomersMarketingBroadcast.tsx', code);
