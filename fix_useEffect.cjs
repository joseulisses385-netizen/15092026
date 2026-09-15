const fs = require('fs');
let code = fs.readFileSync('src/components/CustomersMarketingBroadcast.tsx', 'utf8');

// Ensure useEffect is imported from react
if (!code.includes("import React, { useState, useMemo, useEffect } from 'react';")) {
  code = code.replace(
    "import React, { useState, useMemo } from 'react';",
    "import React, { useState, useMemo, useEffect } from 'react';"
  );
}

fs.writeFileSync('src/components/CustomersMarketingBroadcast.tsx', code);
