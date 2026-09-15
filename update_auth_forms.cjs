const fs = require('fs');
let code = fs.readFileSync('src/components/CustomerAuthModal.tsx', 'utf8');

// 1. Rewrite Login Form
const loginRegex = /\{\/\* Not logged in: Login Form \*\/\}\s*\{\!currentUser && tab === 'login' && \([\s\S]*?<\/form>\s*\)\}/;

const newLoginJsx = `
          {/* Not logged in: Login Form */}
          {!currentUser && tab === 'login' && (
            <form onSubmit={handleQuickLogin} className="space-y-4">
              <p className="text-xs text-purple-200/80">
                Acesse seus pedidos e suas informações salvas de forma segura no banco de dados da loja:
              </p>
              <div>
                <label className="block text-[11px] font-bold text-purple-200 mb-1">
                  E-mail ou WhatsApp
                </label>
                <input
                  type="text"
                  required
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="(11) 99999-9999 ou email@exemplo.com"
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

              <div className="flex flex-col gap-2 pt-2 text-center border-t border-purple-800/40 mt-4 pt-4">
                <button
                  type="button"
                  onClick={() => setTab('recover')}
                  className="text-xs text-amber-300 hover:text-amber-200 font-bold flex items-center justify-center gap-1 cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Esqueceu seus dados? Recuperar minha conta</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTab('register')}
                  className="text-xs text-pink-400 hover:text-pink-300 font-bold underline cursor-pointer"
                >
                  Novo cliente? Criar conta rápida
                </button>
              </div>
            </form>
          )}
`;
code = code.replace(loginRegex, newLoginJsx.trim());

// 2. Rewrite Register Form
const registerRegex = /\{\/\* Register or Edit details \*\/\}\s*\{tab === 'register' && \([\s\S]*?<\/form>\s*\)\}/;
const newRegisterJsx = `
          {/* Register or Edit details */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-purple-200 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nome do cliente"
                  className="w-full px-3 py-2 rounded-xl bg-[#1b0222] border border-purple-700/60 text-xs text-white placeholder-purple-400/50 focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-purple-200 mb-1">
                    WhatsApp com DDD *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="w-full px-3 py-2 rounded-xl bg-[#1b0222] border border-purple-700/60 text-xs text-white placeholder-purple-400/50 focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-purple-200 mb-1 flex items-center gap-1">
                    <Mail className="w-3 h-3 text-pink-400" />
                    E-mail *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@exemplo.com"
                    className="w-full px-3 py-2 rounded-xl bg-[#1b0222] border border-purple-700/60 text-xs text-white placeholder-purple-400/50 focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

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
                    placeholder="Sua senha secreta"
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

              {/* Marketing consent check */}
              <div className="mt-3 p-3 rounded-2xl bg-gradient-to-r from-pink-950/40 to-purple-950/40 border border-pink-700/40 space-y-1">
                <label className="flex items-start gap-2.5 cursor-pointer text-[11px] text-purple-200 leading-tight">
                  <input
                    type="checkbox"
                    checked={emailMarketingConsent}
                    onChange={(e) => setEmailMarketingConsent(e.target.checked)}
                    className="mt-0.5 rounded border-purple-600 bg-[#1b0222] text-pink-500 focus:ring-pink-500 focus:ring-offset-[#1b0222]"
                  />
                  <span>
                    <strong className="text-pink-300">🎁 Autorizo receber e-mails</strong> com cupom de 10% de desconto e promoções (posso cancelar depois).
                  </span>
                </label>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setTab('login')}
                  className="flex-1 py-2.5 rounded-xl border border-purple-700 hover:bg-white/5 text-purple-200 font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs shadow-md transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Salvando...' : 'Criar Minha Conta'}
                </button>
              </div>
            </form>
          )}
`;
code = code.replace(registerRegex, newRegisterJsx.trim());

fs.writeFileSync('src/components/CustomerAuthModal.tsx', code);
