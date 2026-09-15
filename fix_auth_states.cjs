const fs = require('fs');
let code = fs.readFileSync('src/components/CustomerAuthModal.tsx', 'utf8');

if (!code.includes("loginIdentifier")) {
  code = code.replace(
    "const [successMsg, setSuccessMsg] = useState<string | null>(null);",
    "const [successMsg, setSuccessMsg] = useState<string | null>(null);\n  const [loginIdentifier, setLoginIdentifier] = useState('');\n  const [loginPassword, setLoginPassword] = useState('');\n  const [registerPassword, setRegisterPassword] = useState('');\n  const [confirmPassword, setConfirmPassword] = useState('');"
  );
}

fs.writeFileSync('src/components/CustomerAuthModal.tsx', code);
