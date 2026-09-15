import React, { useState } from 'react';
import {
  Lock,
  X,
  Key,
  ShieldCheck,
  User,
  Mail,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Send,
  ArrowLeft,
} from 'lucide-react';
import { recoverAdminPassword } from '../services/storeApi';

interface DirectorAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  correctPin?: string;
}

export const DirectorAuthModal: React.FC<DirectorAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  correctPin = '649309',
}) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Estados de recuperação de senha por e-mail (Sem dar dicas, restrito a jose.ulisses385@gmail.com)
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [recoveryFeedback, setRecoveryFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const isUserValid = username.trim().toLowerCase() === 'admin';
      const isPassValid =
        password.trim() === (correctPin || '649309').trim() ||
        password.trim() === '649309';

      if (isUserValid && isPassValid) {
        setLoading(false);
        setPassword('');
        onSuccess();
      } else {
        setLoading(false);
        if (!isUserValid) {
          setError('Login incorreto.');
        } else {
          setError('Senha incorreta. Tente novamente.');
        }
      }
    }, 300);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
      <div className="w-full max-w-sm bg-[#25042e] rounded-3xl border border-purple-700/60 shadow-2xl overflow-hidden text-white">
        <div className="p-5 bg-gradient-to-r from-purple-900 to-amber-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-amber-300" />
            <h3 className="font-fun font-black text-lg text-white">
              {isRecovering ? 'Recuperar Senha ADM' : 'Painel do ADM'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/20 transition-colors text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isRecovering ? (
          <div className="p-6 space-y-4">
            <div className="text-center space-y-1">
              <Mail className="w-9 h-9 text-amber-400 mx-auto" />
              <p className="text-xs text-purple-200/80">
                Informe o e-mail cadastrado do administrador para envio da senha e chave de acesso.
              </p>
            </div>

            {recoveryFeedback && (
              <div
                className={`p-3 rounded-xl border text-xs font-semibold flex items-start gap-2 ${
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
              <div className="space-y-1">
                <label className="block text-xs font-bold text-purple-200">
                  E-mail do Administrador
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    autoFocus
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    placeholder="Digite seu e-mail cadastrado"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#1b0222] border border-purple-700/60 text-sm text-white placeholder-purple-400/50 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <p className="text-[10px] text-purple-300/70 pt-0.5">
                  A senha só será enviada se o e-mail for compatível com a conta oficial do administrador.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSendingEmail}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-pink-600 hover:opacity-95 text-white font-black text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
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
                className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 text-purple-300 hover:text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Voltar ao Login</span>
              </button>
            </form>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="text-center space-y-1">
              <ShieldCheck className="w-10 h-10 text-amber-400 mx-auto" />
              <p className="text-xs text-purple-200/80">
                Digite as credenciais de administrador para gerenciar a loja, catálogo, estoque e configurações.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-purple-200 mb-1">
                  Login / Usuário
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Digite seu usuário"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#1b0222] border border-purple-700/60 text-sm text-white placeholder-purple-400/50 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-purple-200">
                    Senha de Acesso
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsRecovering(true);
                      setRecoveryFeedback(null);
                      setError('');
                    }}
                    className="text-[11px] text-pink-400 hover:text-pink-300 hover:underline cursor-pointer"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
                <div className="relative">
                  <Key className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    autoFocus
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite sua senha"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#1b0222] border border-purple-700/60 text-sm text-white placeholder-purple-400/50 focus:outline-none focus:border-amber-400 font-mono tracking-widest"
                  />
                </div>
              </div>
            </div>

            {error && (
              <p className="text-xs text-rose-400 text-center font-semibold bg-rose-950/50 py-1.5 px-2 rounded-lg border border-rose-800/40">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-pink-600 hover:opacity-95 text-white font-black text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Verificando...' : 'Entrar no Painel ADM'}</span>
            </button>

            <div className="pt-1 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsRecovering(true);
                  setRecoveryFeedback(null);
                  setError('');
                }}
                className="text-[11px] text-purple-300/80 hover:text-amber-300 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                <span>Solicitar senha por e-mail</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
