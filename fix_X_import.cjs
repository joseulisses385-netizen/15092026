const fs = require('fs');
let code = fs.readFileSync('src/components/CustomersMarketingBroadcast.tsx', 'utf8');

// Ensure X is imported from lucide-react
if (!code.includes("X,")) {
  code = code.replace(
    "Check,",
    "Check, X,"
  );
}

fs.writeFileSync('src/components/CustomersMarketingBroadcast.tsx', code);
