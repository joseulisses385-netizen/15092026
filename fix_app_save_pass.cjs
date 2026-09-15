const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const replacement = `
        await saveCustomerToServer({
          id: newOrder.customerId || customer?.id,
          name: newOrder.customerName,
          phone: newOrder.customerPhone,
          email: newOrder.customerEmail,
          password: newOrder.customerPassword,
          address: newOrder.deliveryAddress,
`;

code = code.replace(
  /await saveCustomerToServer\(\{[\s\S]*?name: newOrder\.customerName,\s*phone: newOrder\.customerPhone,\s*email: newOrder\.customerEmail,\s*address: newOrder\.deliveryAddress,/,
  replacement.trim()
);

fs.writeFileSync('src/App.tsx', code);
