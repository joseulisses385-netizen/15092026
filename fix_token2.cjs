const fs = require('fs');
let code = fs.readFileSync('src/components/ShippingLogisticsPanel.tsx', 'utf8');

// Frontend trim
code = code.replace(
  "token: inputToken,",
  "token: (inputToken || '').trim(),"
);
fs.writeFileSync('src/components/ShippingLogisticsPanel.tsx', code);
