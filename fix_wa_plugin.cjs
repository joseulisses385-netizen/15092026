const fs = require('fs');
let code = fs.readFileSync('src/components/CustomersMarketingBroadcast.tsx', 'utf8');

// The best way to allow multi-send is to give them the extension instructions, 
// OR we can make a "Disparo Sequencial (Aba Múltipla)" button. BUT most browsers block popups for multiple windows.
// A safe way for a "Sequential" sender is to do it in intervals, or open one, wait for user to focus back, open next.
// Alternatively, we explain the WA Web Plus. The prompt asks "se for possivel faça um prompt para isso"
