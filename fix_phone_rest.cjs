const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const patchEndpoint = `
// PATCH settings
app.post('/api/store/patch-phone', async (req, res) => {
  const current = readStore();
  if (current && current.settings) {
    current.settings.whatsappNumber = "5511989055683";
    current.settings.whatsappDisplay = "(11) 98905-5683";
    writeStore(current);
  }
  res.json({ success: true });
});
`;

code = code.replace(
  "// INITIALIZE STORE ENDPOINT",
  patchEndpoint + "\n// INITIALIZE STORE ENDPOINT"
);

fs.writeFileSync('server.ts', code);
