const fs = require('fs');
let code = fs.readFileSync('src/services/storeApi.ts', 'utf8');

const loginFunc = `
export async function loginCustomerOnServer(identifier: string, passwordHash: string) {
  const customers = await fetchCustomersFromServer();
  const found = customers.find(c => 
    (c.email === identifier || c.phone === identifier || c.name === identifier) &&
    c.password === passwordHash
  );
  if (found) {
    if (found.status === 'anonimizado') return { success: false, message: 'Conta desativada/anonimizada.' };
    return { success: true, customer: found };
  }
  return { success: false, message: 'Credenciais inválidas.' };
}
`;

if (!code.includes("loginCustomerOnServer")) {
  code = code.replace(
    "export async function fetchCustomersFromServer()",
    loginFunc + "\nexport async function fetchCustomersFromServer()"
  );
  fs.writeFileSync('src/services/storeApi.ts', code);
}
