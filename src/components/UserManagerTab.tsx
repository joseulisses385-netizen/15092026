import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  Package,
  Trash2,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
} from 'lucide-react';
import { StaffUser, StaffRole } from '../types';
import { fetchStaffUsers, saveStaffUsers } from '../services/storeApi';

interface UserManagerTabProps {
  currentUser: StaffUser;
}

export const UserManagerTab: React.FC<UserManagerTabProps> = ({ currentUser }) => {
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form state
  const [newName, setNewName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<StaffRole>('estoque');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Password reset modal/inline
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [changePasswordValue, setChangePasswordValue] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const list = await fetchStaffUsers();
      if (list && list.length > 0) {
        setUsers(list);
      }
    } catch {
      setFeedback({ type: 'error', message: 'Erro ao carregar lista de usuários.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const cleanUsername = newUsername.trim().toLowerCase();
    if (!newName.trim() || !cleanUsername || !newPassword.trim()) {
      setFeedback({ type: 'error', message: 'Preencha todos os campos obrigatórios.' });
      return;
    }

    // Check duplicate username
    if (users.some((u) => u.username.toLowerCase() === cleanUsername)) {
      setFeedback({ type: 'error', message: 'Já existe um usuário cadastrado com este login.' });
      return;
    }

    setIsSubmitting(true);

    const newUser: StaffUser = {
      id: `user-${Date.now()}`,
      name: newName.trim(),
      username: cleanUsername,
      password: newPassword.trim(),
      role: newRole,
      active: true,
      createdAt: new Date().toISOString(),
    };

    const updatedList = [...users, newUser];

    try {
      const ok = await saveStaffUsers(updatedList);
      if (ok) {
        setUsers(updatedList);
        setNewName('');
        setNewUsername('');
        setNewPassword('');
        setNewRole('estoque');
        setFeedback({ type: 'success', message: `Usuário "${newUser.name}" cadastrado com sucesso!` });
      } else {
        setFeedback({ type: 'error', message: 'Erro ao gravar usuário no servidor.' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Falha na comunicação com o servidor.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (userId: string) => {
    if (userId === currentUser.id) {
      alert('Você não pode desativar seu próprio usuário.');
      return;
    }

    const updated = users.map((u) => (u.id === userId ? { ...u, active: !u.active } : u));
    setUsers(updated);
    await saveStaffUsers(updated);
    setFeedback({ type: 'success', message: 'Status do usuário atualizado!' });
  };

  const handleDeleteUser = async (userId: string) => {
    if (userId === currentUser.id) {
      alert('Você não pode excluir seu próprio usuário.');
      return;
    }

    const userToDelete = users.find((u) => u.id === userId);
    if (!window.confirm(`Tem certeza que deseja excluir o usuário "${userToDelete?.name}"?`)) {
      return;
    }

    const updated = users.filter((u) => u.id !== userId);
    setUsers(updated);
    await saveStaffUsers(updated);
    setFeedback({ type: 'success', message: 'Usuário removido com sucesso!' });
  };

  const handleSavePasswordChange = async (userId: string) => {
    if (!changePasswordValue.trim()) {
      alert('Digite a nova senha.');
      return;
    }

    const updated = users.map((u) =>
      u.id === userId ? { ...u, password: changePasswordValue.trim() } : u
    );
    setUsers(updated);
    await saveStaffUsers(updated);
    setEditingUserId(null);
    setChangePasswordValue('');
    setFeedback({ type: 'success', message: 'Senha alterada com sucesso!' });
  };

  return (
    <div className="space-y-8">
      {/* Header explicativo */}
      <div className="p-5 rounded-2xl bg-[#1d0226] border border-purple-800/80 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-amber-300 flex items-center gap-2 font-fun">
            <Users className="w-5 h-5 text-amber-400" />
            <span>Gestão de Usuários e Acessos (Exclusivo ADM)</span>
          </h2>
          <p className="text-xs text-purple-200/80 mt-1">
            Somente o Administrador tem autorização para cadastrar novos colaboradores, definir senhas e gerenciar níveis de permissão.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-900/60 border border-amber-400/40 text-amber-300 text-xs font-bold shrink-0 self-start md:self-auto">
          <Shield className="w-4 h-4 text-amber-400" />
          <span>Controle Restrito de Acesso</span>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl border text-xs font-bold flex items-center gap-2.5 animate-in fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
              : 'bg-rose-950/80 border-rose-500 text-rose-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Formulário de Cadastro de Novo Usuário */}
      <div className="p-6 rounded-3xl bg-[#1d0226] border-2 border-purple-700/60 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-purple-800/60 pb-3">
          <UserPlus className="w-4 h-4 text-pink-400" />
          <span>Cadastrar Novo Usuário / Colaborador</span>
        </h3>

        <form onSubmit={handleCreateUser} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-purple-200">Nome Completo</label>
            <input
              type="text"
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Ex: João da Silva"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#120119] border border-purple-700/80 text-white text-xs placeholder-purple-400/50 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-purple-200">Usuário / Login</label>
            <input
              type="text"
              required
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="Ex: joao.estoque ou email"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#120119] border border-purple-700/80 text-white text-xs placeholder-purple-400/50 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-purple-200">Senha Inicial</label>
            <input
              type="text"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Digite a senha"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#120119] border border-purple-700/80 text-white text-xs placeholder-purple-400/50 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-purple-200">Nível de Acesso / Cargo</label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as StaffRole)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#120119] border border-purple-700/80 text-white text-xs focus:outline-none focus:border-amber-400"
            >
              <option value="estoque">📦 Operador de Estoque (Acesso Restrito)</option>
              <option value="admin">👑 Administrador (Acesso Total)</option>
            </select>
          </div>

          <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-pink-500 hover:from-amber-300 hover:to-pink-400 text-purple-950 font-black text-xs shadow-md transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              <span>Cadastrar Novo Usuário</span>
            </button>
          </div>
        </form>
      </div>

      {/* Tabela de Usuários Cadastrados */}
      <div className="p-6 rounded-3xl bg-[#1d0226] border border-purple-800/60 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-purple-800/60 pb-3">
          <Lock className="w-4 h-4 text-amber-400" />
          <span>Usuários Cadastrados no Sistema ({users.length})</span>
        </h3>

        {isLoading ? (
          <div className="p-8 text-center text-purple-300 text-xs flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Carregando usuários...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-purple-800/60 text-purple-300 font-bold">
                  <th className="py-3 px-4">Nome</th>
                  <th className="py-3 px-4">Usuário / Login</th>
                  <th className="py-3 px-4">Cargo / Permissão</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-900/40">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-purple-950/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-purple-900 flex items-center justify-center text-xs text-amber-300 font-black">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <span>{u.name}</span>
                      {u.id === currentUser.id && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40">
                          Você
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-purple-200">{u.username}</td>
                    <td className="py-3.5 px-4">
                      {u.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-400/40">
                          <Shield className="w-3 h-3" />
                          <span>Administrador</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-blue-500/20 text-blue-300 border border-blue-400/40">
                          <Package className="w-3 h-3" />
                          <span>Estoque</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(u.id)}
                        disabled={u.id === currentUser.id}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
                          u.active !== false
                            ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 hover:bg-emerald-900'
                            : 'bg-rose-950/60 border-rose-500 text-rose-300 hover:bg-rose-900'
                        } disabled:opacity-50`}
                      >
                        {u.active !== false ? '● Ativo' : '○ Inativo'}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      {editingUserId === u.id ? (
                        <div className="inline-flex items-center gap-1.5">
                          <input
                            type="text"
                            value={changePasswordValue}
                            onChange={(e) => setChangePasswordValue(e.target.value)}
                            placeholder="Nova senha"
                            className="px-2 py-1 rounded bg-[#120119] border border-purple-600 text-white text-xs w-28"
                          />
                          <button
                            type="button"
                            onClick={() => handleSavePasswordChange(u.id)}
                            className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                          >
                            Salvar
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingUserId(null);
                              setChangePasswordValue('');
                            }}
                            className="px-2 py-1 rounded bg-purple-900 text-purple-200 text-xs"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingUserId(u.id);
                            setChangePasswordValue('');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-purple-900/60 hover:bg-purple-800 text-purple-200 hover:text-white border border-purple-700/60 text-xs inline-flex items-center gap-1 transition-colors cursor-pointer"
                          title="Alterar senha"
                        >
                          <KeyRound className="w-3 h-3 text-amber-400" />
                          <span>Alterar Senha</span>
                        </button>
                      )}

                      {u.id !== currentUser.id && (
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-1.5 rounded-lg bg-rose-950/50 hover:bg-rose-900/80 text-rose-300 border border-rose-800/60 transition-colors cursor-pointer"
                          title="Excluir usuário"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
