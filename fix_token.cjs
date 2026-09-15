const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Add trim() to token reading
code = code.replace(
  "process.env.MELHOR_ENVIO_TOKEN ||\n    current?.settings?.melhorEnvioToken ||\n    DEFAULT_MELHOR_ENVIO_TOKEN",
  "(process.env.MELHOR_ENVIO_TOKEN || current?.settings?.melhorEnvioToken || DEFAULT_MELHOR_ENVIO_TOKEN)?.trim()"
);

fs.writeFileSync('server.ts', code);
