const fs = require('fs');
let code = fs.readFileSync('src/components/CustomerAuthModal.tsx', 'utf8');

// Update import
code = code.replace(
  "import { recoverCustomerOnServer } from '../services/storeApi';",
  "import { recoverCustomerOnServer, loginCustomerOnServer } from '../services/storeApi';"
);

// Update handleRegister logic
code = code.replace(
  "        cpf: cpf.trim(),",
  "        password: registerPassword,\n        cpf: cpf.trim(),"
);

// We need to add a check for registerPassword and confirmPassword in handleRegister
const registerCheck = `
    if (!name.trim() || !phone.trim()) {
      setRegisterError('Por favor, informe seu nome e telefone (WhatsApp).');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setRegisterError('Por favor, informe um endereço de e-mail válido para cadastro seguro.');
      return;
    }
    if (!registerPassword) {
      setRegisterError('Por favor, crie uma senha para sua conta.');
      return;
    }
    if (registerPassword !== confirmPassword) {
      setRegisterError('As senhas digitadas não coincidem.');
      return;
    }
`;
code = code.replace(
  /    if \(!name\.trim\(\) \|\| !phone\.trim\(\)\) {[\s\S]*?return;\n    }/,
  registerCheck.trim()
);

// Update handleQuickLogin logic
const handleQuickLoginReplacement = `
  const handleQuickLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier.trim() || !loginPassword) {
      alert('Informe seu e-mail/WhatsApp e senha para entrar.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await loginCustomerOnServer(loginIdentifier.trim(), loginPassword);
      if (res.success && res.customer) {
        setSuccessMsg('Login realizado com sucesso!');
        setTimeout(() => {
          onLogin(res.customer!);
        }, 1500);
      } else {
        alert(res.message || 'Credenciais inválidas.');
      }
    } catch (err) {
      alert('Erro de conexão ao tentar fazer login.');
    } finally {
      setIsSubmitting(false);
    }
  };
`;

const handleQuickLoginRegex = /const handleQuickLogin = async \(e: React\.FormEvent\) => \{[\s\S]*?status: 'ativo',\s*\n\s*\};[\s\S]*?onLogin\(existingCust\);\s*\} catch \(err: any\) \{[\s\S]*?\} finally \{[\s\S]*?setIsSubmitting\(false\);\s*\}\s*\};/;
code = code.replace(handleQuickLoginRegex, handleQuickLoginReplacement.trim());


// Update Login JSX
const loginJsx = `
          {/* Not logged in: Login Form */}
          {!currentUser && tab === 'login' && (
            <form onSubmit={handleQuickLogin} className="space-y-3">
              <p className="text-xs text-purple-200/80">
                Acesse seus pedidos e suas informações salvas de forma segura no banco de dados da loja:
              </p>
              <div>
                <label className="block text-[11px] font-bold text-purple-200 mb-1">
                  E-mail, WhatsApp ou Nome
                </label>
                <input
                  type="text"
                  required
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="Seu login"
                  className="w-full px-3 py-2 rounded-xl bg-[#1b0222] border border-purple-700/60 text-xs text-white placeholder-purple-400/50 focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-purple-200 mb-1">
                  Senha *
                </label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Sua senha secreta"
                  className="w-full px-3 py-2 rounded-xl bg-[#1b0222] border border-purple-700/60 text-xs text-white placeholder-purple-400/50 focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-[13px] shadow-md transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Acessando...' : 'Entrar na Minha Conta'}
                </button>
              </div>
`;

code = code.replace(
  /\{\/\* Not logged in: Login Form \*\/\}\s*\{\!currentUser && tab === 'login' && \(\s*<form onSubmit=\{handleQuickLogin\} className="space-y-3">[\s\S]*?Entrar na Minha Conta \/ Salvar Dados'\}\s*<\/button>\s*<\/div>/,
  loginJsx.trim()
);

// Update Register JSX to add password
const registerJsxPass = `
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-purple-200 mb-1">
                    Criar Senha *
                  </label>
                  <input
                    type="password"
                    required
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    placeholder="Sua senha"
                    className="w-full px-3 py-2 rounded-xl bg-[#1b0222] border border-purple-700/60 text-xs text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-purple-200 mb-1">
                    Confirmar Senha *
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita a senha"
                    className="w-full px-3 py-2 rounded-xl bg-[#1b0222] border border-purple-700/60 text-xs text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              {/* Endereço Title */}
`;

code = code.replace(
  /\{\/\* Address section \*\/\}/,
  registerJsxPass + "\n              {/* Address section */}"
);

fs.writeFileSync('src/components/CustomerAuthModal.tsx', code);
