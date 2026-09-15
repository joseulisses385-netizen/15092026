const fs = require('fs');
let code = fs.readFileSync('src/data/initialData.ts', 'utf8');

code = code.replace(
  'whatsappNumber: "5511975208196"',
  'whatsappNumber: "5511989055683"'
);

// We need to also add supportPhone if it's not correctly set
code = code.replace(
  'supportPhone: "(11) 97520-8196"',
  'supportPhone: "(11) 97520-8196"' // Already there, but let's be sure
);

fs.writeFileSync('src/data/initialData.ts', code);
