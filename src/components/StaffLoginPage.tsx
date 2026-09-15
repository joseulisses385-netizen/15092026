import React, { useState } from 'react';
import {
  Lock,
  User,
  KeyRound,
  AlertCircle,
  ArrowLeft,
  ShieldCheck,
  Loader2,
  Mail,
  CheckCircle2,
  Send,
} from 'lucide-react';
import { StaffUser } from '../types';
import { loginStaffUser, recoverAdminPassword } from '../services/storeApi';
import { OFFICIAL_BRAND_LOGO } from '../constants/assets';

interface StaffLoginPageProps {
  onLoginSuccess: (user: StaffUser) => void;
  onBackToStore: () => void;
  targetArea?: 'admin' | 'estoque';
}

export const StaffLoginPage: React.FC<StaffLoginPageProps> = ({
  onLoginSuccess,
  onBackToStore,
  targetArea = 'admin',
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Estados de recuperação de senha por e-mail (Sem dar dicas, restrito a jose.ulisses385@gmail.com)
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [recoveryFeedback, setRecoveryFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!username.trim() || !password.trim()) {
      setErrorMessage('Por favor, informe o usuário e a senha.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await loginStaffUser(username.trim(), password.trim());
      if (res.success && res.user) {
        onLoginSuccess(res.user as StaffUser);
      } else {
        setErrorMessage(res.message || 'Usuário ou senha incorretos.');
      }
    } catch {
      setErrorMessage('Falha ao autenticar. Verifique sua conexão e tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecoverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryFeedback(null);

    const email = recoveryEmail.trim().toLowerCase();
    if (!email) {
      setRecoveryFeedback({
        type: 'error',
        message: 'Por favor, digite o e-mail para envio da senha.',
      });
      return;
    }

    setIsSendingEmail(true);

    try {
      const res = await recoverAdminPassword(email);
      if (res.success) {
        setRecoveryFeedback({
          type: 'success',
          message:
            res.message ||
            'Senha e credenciais enviadas com sucesso para jose.ulisses385@gmail.com! Verifique sua caixa de entrada.',
        });
      } else {
        setRecoveryFeedback({
          type: 'error',
          message:
            res.message ||
            'E-mail não autorizado. O envio da senha só é permitido para o e-mail oficial cadastrado.',
        });
      }
    } catch {
      setRecoveryFeedback({
        type: 'error',
        message: 'Erro ao processar solicitação. Tente novamente.',
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#14011a] flex flex-col justify-center items-center p-4 sm:p-6 text-white relative">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-900/20 blur-3xl rounded-full pointer-events-none" />

      {/* Voltar para a Loja */}
      <button
        type="button"
        onClick={onBackToStore}
        className="absolute top-6 left-6 inline-flex items-center gap-2 text-xs font-bold text-purple-300 hover:text-amber-300 transition-colors bg-purple-950/60 hover:bg-purple-900/80 px-4 py-2 rounded-full border border-purple-800 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Voltar para a Loja Virtual</span>
      </button>

      {/* Card Principal */}
      <div className="w-full max-w-md bg-[#1f0226] border-2 border-purple-800/80 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 relative z-10">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-[#120119] border border-amber-400/60 mx-auto p-2 flex items-center justify-center shadow-lg">
            <img
              src={OFFICIAL_BRAND_LOGO}
              alt="Doidas e Meias"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black font-fun tracking-tight text-white">
              {isRecovering
                ? 'Recuperar Senha de Administrador'
                : targetArea === 'estoque'
                ? 'Sistema de Estoque'
                : 'Painel de Administração'}
            </h1>
            <p className="text-xs text-purple-200/80 mt-1">
              {isRecovering
                ? 'Solicite o envio da senha para o e-mail oficial cadastrado'
                : 'Acesso restrito para colaboradores e gerência da Doidas e Meias'}
            </p>
          </div>
        </div>

        {/* MODO DE RECUPERAÇÃO DE SENHA */}
        {isRecovering ? (
          <div className="space-y-4">
            {recoveryFeedback && (
              <div
                className={`p-3.5 rounded-xl border text-xs font-semibold flex items-start gap-2.5 ${
                  recoveryFeedback.type === 'success'
                    ? 'bg-emerald-950/80 border-emerald-500/80 text-emerald-200'
                    : 'bg-rose-950/80 border-rose-500/80 text-rose-200'
                }`}
              >
                {recoveryFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <span>{recoveryFeedback.message}</span>
              </div>
            )}

            <form onSubmit={handleRecoverSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-purple-200 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-amber-400" />
                  <span>E-mail do Administrador</span>
                </label>
                <input
                  type="email"
                  required
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                  placeholder="Digite seu e-mail para envio da senha"
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl bg-[#120119] border border-purple-700/80 text-white placeholder-purple-400/50 text-sm focus:outline-none focus:border-amber-400 font-medium"
                />
                <p className="text-[11px] text-purple-300/70">
                  Por motivos de segurança, a senha só poderá ser enviada se o e-mail for compatível com o endereço oficial autorizado.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSendingEmail}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-pink-500 to-purple-600 hover:from-amber-300 hover:to-purple-500 text-purple-950 font-black text-sm shadow-xl transition-all hover:scale-101 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSendingEmail ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verificando e Enviando...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Enviar Senha por E-mail</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsRecovering(false);
                  setRecoveryFeedback(null);
                }}
                className="w-full py-2.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 text-purple-300 hover:text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Voltar ao Login</span>
              </button>
            </form>
          </div>
        ) : (
          /* MODO DE LOGIN NORMAL (SEM DICAS DE SENHA) */
          <>
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/80 text-rose-200 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-purple-200 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  <span>Usuário / Login</span>
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Digite seu usuário"
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl bg-[#120119] border border-purple-700/80 text-white placeholder-purple-400/50 text-sm focus:outline-none focus:border-amber-400 font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-purple-200 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                    <span>Senha de Acesso</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsRecovering(true);
                      setRecoveryFeedback(null);
                      setErrorMessage(null);
                    }}
                    className="text-[11px] text-pink-400 hover:text-pink-300 hover:underline cursor-pointer"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  className="w-full px-4 py-3 rounded-xl bg-[#120119] border border-purple-700/80 text-white placeholder-purple-400/50 text-sm focus:outline-none focus:border-amber-400 font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-pink-500 to-purple-600 hover:from-amber-300 hover:to-purple-500 text-purple-950 font-black text-sm shadow-xl transition-all hover:scale-101 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Autenticando...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Entrar no Sistema</span>
                  </>
                )}
              </button>
            </form>

            {/* Link direto para solicitação de senha por e-mail (sem dicas) */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsRecovering(true);
                  setRecoveryFeedback(null);
                  setErrorMessage(null);
                }}
                className="text-xs text-purple-300/80 hover:text-amber-300 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                <span>Precisa da senha do administrador? Solicitar por e-mail</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
