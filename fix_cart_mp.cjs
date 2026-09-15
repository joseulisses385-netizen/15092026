const fs = require('fs');
let code = fs.readFileSync('src/components/CartDrawer.tsx', 'utf8');

// Add states for MP Preference
const states = `
  const [mpPaymentLink, setMpPaymentLink] = useState<string | null>(null);
  const [isGeneratingPayment, setIsGeneratingPayment] = useState(false);
`;

code = code.replace(
  "const [isLiveShippingLoading, setIsLiveShippingLoading] = useState(false);",
  "const [isLiveShippingLoading, setIsLiveShippingLoading] = useState(false);\n" + states
);

// Update handleFinishOrder to generate MP preference if card
const finishOrderLogic = `
  const handleFinishOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !deliveryAddress || !addressNumber || !neighborhood || !city || !cep) {
      alert('Por favor, preencha todos os campos obrigatórios de entrega.');
      return;
    }
    if (!customerEmail || !customerEmail.includes('@')) {
      alert('Por favor, informe seu e-mail para envio do comprovante.');
      return;
    }

    const orderNumber = \`DM-\${Math.floor(100000 + Math.random() * 900000)}\`;
    const newOrder: Order = {
      id: \`order-\${Date.now()}\`,
      orderNumber,
      origin: 'site',
      customerId: currentUser?.id,
      customerName,
      customerPhone,
      customerEmail: customerEmail.trim().toLowerCase(),
      emailMarketingConsent,
      emailMarketingConsentDate: emailMarketingConsent ? new Date().toISOString() : undefined,
      deliveryAddress: \`\${deliveryAddress}, \${addressNumber}\${complement ? \` - \${complement}\` : ''}, \${neighborhood} - \${city} (CEP: \${cep})\`,
      cep,
      neighborhood,
      city,
      complement,
      paymentMethod,
      items: [...cartItems],
      subtotal,
      deliveryFee,
      discount: couponDiscountAmount + pixDiscountAmount,
      couponCode: isCouponAppliedAndValid ? appliedCoupon : undefined,
      couponDiscountApplied: couponDiscountAmount,
      pixDiscountApplied: pixDiscountAmount,
      total,
      status: 'pending',
      shippingCarrier: activeMethod?.carrier,
      shippingMethodId: activeMethod?.id,
      shippingMethodName: activeMethod?.name,
      shippingEstimate: activeMethod?.deliveryEstimate,
      createdAt: new Date().toISOString(),
      notes,
    };

    onPlaceOrder(newOrder);
    setCompletedOrder(newOrder);
    setView('success');
    onClearCart();

    if (paymentMethod === 'cartao' || paymentMethod === 'boleto') {
      setIsGeneratingPayment(true);
      try {
        const res = await fetch('/api/payment/mercadopago/create-preference', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: newOrder.orderNumber,
            items: newOrder.items,
            payer: {
              name: newOrder.customerName,
              email: newOrder.customerEmail,
              phone: newOrder.customerPhone,
              address: { street: deliveryAddress, number: addressNumber, cep }
            },
            deliveryFee: newOrder.deliveryFee
          })
        });
        const data = await res.json();
        if (data.success && data.initPoint) {
          setMpPaymentLink(data.initPoint);
        } else {
          console.warn('MP Error:', data.error);
          setMpPaymentLink(settings.cardGatewayUrl || null);
        }
      } catch (err) {
        console.error('Error generating MP link', err);
        setMpPaymentLink(settings.cardGatewayUrl || null);
      } finally {
        setIsGeneratingPayment(false);
      }
    }
  };
`;

code = code.replace(
  /const handleFinishOrder = \(e: React\.FormEvent\) => \{[\s\S]*?onClearCart\(\);\s*\};/,
  finishOrderLogic.trim()
);

// Update success view JSX to show the generated link or loading
const successView = `
                {(completedOrder.paymentMethod === 'cartao' || completedOrder.paymentMethod === 'boleto') && (
                  <div className="mt-3 p-3 bg-cyan-950/40 border border-cyan-500/50 rounded-xl text-center space-y-2">
                    <p className="text-[11px] text-cyan-200 font-semibold">
                      Para concluir o seu pedido com o valor exato (R$ {completedOrder.total.toFixed(2).replace('.', ',')}), realize o pagamento via Mercado Pago através do link abaixo:
                    </p>
                    {isGeneratingPayment ? (
                      <div className="py-2 text-cyan-400 text-xs font-bold animate-pulse">Gerando link de pagamento com o valor exato...</div>
                    ) : mpPaymentLink ? (
                      <a
                        href={mpPaymentLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[11px] shadow-lg shadow-cyan-900/30 transition-all hover:scale-105"
                      >
                        <span>💳 Pagar R$ {completedOrder.total.toFixed(2).replace('.', ',')} no Mercado Pago</span>
                      </a>
                    ) : (
                      <p className="text-rose-400 text-xs">Erro ao gerar link. O lojista precisa configurar o Token do Mercado Pago.</p>
                    )}
                  </div>
                )}
`;

code = code.replace(
  /\{\(completedOrder\.paymentMethod === 'cartao' \|\| completedOrder\.paymentMethod === 'boleto'\) && settings\.cardGatewayUrl && \([\s\S]*?<\/a>\s*<\/div>\s*\)\}/,
  successView.trim()
);

fs.writeFileSync('src/components/CartDrawer.tsx', code);
