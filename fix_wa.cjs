const fs = require('fs');
let code = fs.readFileSync('src/components/CartDrawer.tsx', 'utf8');

code = code.replace(
  /order\.paymentMethod === 'cartao'\n\s*\? 'Cartão de Crédito'\n\s*: order\.paymentMethod === 'tiktok_shop'/,
  "order.paymentMethod === 'cartao'\n        ? 'Cartão de Crédito'\n        : order.paymentMethod === 'boleto'\n        ? 'Boleto (Mercado Pago)'\n        : order.paymentMethod === 'tiktok_shop'"
);

fs.writeFileSync('src/components/CartDrawer.tsx', code);
