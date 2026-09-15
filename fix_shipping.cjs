const fs = require('fs');
let code = fs.readFileSync('src/components/ShippingLogisticsPanel.tsx', 'utf8');

code = code.replace(
  "phone: settings.melhorEnvioAccountPhone || '11975208196',",
  "phone: settings.melhorEnvioAccountPhone || '11989055683',"
);

fs.writeFileSync('src/components/ShippingLogisticsPanel.tsx', code);
