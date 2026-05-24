'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/useAuth';
import { KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PerfilPage() {
  const { user } = useAuth();
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (novaSenha !== confirmarSenha) {
      toast.error('A nova senha e a confirmação não coincidem.');
      return;
    }

    if (novaSenha.length < 6) {
      toast.error('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }

    try {
      setLoading(true);
      await api.changePassword(senhaAtual, novaSenha);
      toast.success('Senha atualizada com sucesso!');
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmarSenha('');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar a senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 sm:p-10 bg-[#f4f7f9] dark:bg-[#0a0a0a] min-h-screen font-inter">
      <div className="max-w-2xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center gap-4 border-b border-gray-200 dark:border-[#222] pb-6">
          <div className="w-12 h-12 rounded-full bg-[#c8921a]/10 flex items-center justify-center text-[#c8921a]">
            <KeyRound size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">
              Meu Perfil
            </h1>
            <p className="text-[11px] text-gray-500 uppercase tracking-widest mt-1">
              Gerenciar Senha e Acessos
            </p>
          </div>
        </div>

        {/* User Info */}
        {user && (
          <div className="bg-white dark:bg-[#111] p-6 rounded-2xl border border-gray-200 dark:border-[#222] shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-1">Conta Atual</p>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{user.nome}</h2>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
            <div className="px-3 py-1 bg-[#c8921a]/10 rounded-full border border-[#c8921a]/30 text-[#c8921a] text-[10px] font-bold uppercase tracking-wider">
              {user.role === 'admin' ? 'Administrador' : 'Equipe'}
            </div>
          </div>
        )}

        {/* Form Mudar Senha */}
        <div className="bg-white dark:bg-[#111] p-6 rounded-2xl border border-gray-200 dark:border-[#222] shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-6 flex items-center gap-2">
            <KeyRound size={16} className="text-[#c8921a]" />
            Alterar Senha
          </h3>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                Senha Atual
              </label>
              <input
                type="password"
                required
                value={senhaAtual}
                onChange={(e) => setSenhaAtual(e.target.value)}
                className="w-full bg-[#f8fafc] dark:bg-[#0a0a0a] border border-gray-300 dark:border-[#333] rounded-lg px-4 py-3 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-[#c8921a] focus:border-transparent transition-all"
                placeholder="Sua senha atual"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                  Nova Senha
                </label>
                <input
                  type="password"
                  required
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  className="w-full bg-[#f8fafc] dark:bg-[#0a0a0a] border border-gray-300 dark:border-[#333] rounded-lg px-4 py-3 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-[#c8921a] focus:border-transparent transition-all"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                  Confirmar Nova Senha
                </label>
                <input
                  type="password"
                  required
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  className="w-full bg-[#f8fafc] dark:bg-[#0a0a0a] border border-gray-300 dark:border-[#333] rounded-lg px-4 py-3 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-[#c8921a] focus:border-transparent transition-all"
                  placeholder="Repita a nova senha"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto bg-[#c8921a] hover:bg-[#b07f15] text-white text-xs font-bold uppercase tracking-widest py-3 px-8 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Atualizando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    Salvar Nova Senha
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
