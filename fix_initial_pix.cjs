const fs = require('fs');
let code = fs.readFileSync('src/data/initialData.ts', 'utf8');

code = code.replace(
  'pixKey: "5511975208196"',
  'pixKey: "5511989055683"'
);

fs.writeFileSync('src/data/initialData.ts', code);
