const fs = require('fs');
let code = fs.readFileSync('src/components/CustomerAuthModal.tsx', 'utf8');

// The original saveCustomerToServer in handleRegister wasn't returning properly or checking the new pass
// Let's make sure password is being sent to the server in handleRegister

const expectedSave = `
        password: registerPassword,
        cpf: cpf.trim(),
`;
if (!code.includes("password: registerPassword")) {
   console.log("Missing password in payload");
}
