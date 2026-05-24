import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { X, Lock, Check } from 'lucide-react';

interface TrocarSenhaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  usuarioId: string | null;
  usuarioNome: string;
}

export function TrocarSenhaModal({ open, onOpenChange, usuarioId, usuarioNome }: TrocarSenhaModalProps) {
  const [novaSenha, setNovaSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuarioId) return;

    if (novaSenha.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    try {
      setLoading(true);
      await api.adminChangePassword(usuarioId, novaSenha);
      toast.success('Senha atualizada com sucesso!');
      toast('Avise o usuário que a senha foi alterada.', { icon: 'ℹ️' });
      onOpenChange(false);
      setNovaSenha('');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar a senha');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={(val) => {
      onOpenChange(val);
      if (!val) setNovaSenha('');
    }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in" />
        <Dialog.Content className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-md bg-white dark:bg-[#0a0a0a] rounded-xl shadow-2xl z-[51] border border-gray-200 dark:border-[#222] p-6 animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-500 rounded-lg">
                <Lock size={18} />
              </div>
              <div>
                <Dialog.Title className="text-sm font-bold uppercase tracking-widest text-gray-800 dark:text-white">
                  Trocar Senha
                </Dialog.Title>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">
                  {usuarioNome}
                </p>
              </div>
            </div>
            <Dialog.Close className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              <X size={18} />
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-800 dark:text-gray-200 block mb-2">
                Nova Senha
              </label>
              <input
                type="text"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                placeholder="Digite a nova senha..."
                className="w-full bg-gray-50 dark:bg-[#111] border border-gray-400 dark:border-[#444] rounded-md px-4 py-3 text-sm focus:outline-none focus:border-[#c8921a] text-gray-900 dark:text-white transition-all"
                required
                minLength={6}
              />
              <p className="text-[9px] text-gray-500 uppercase tracking-widest mt-2">
                Mínimo de 6 caracteres
              </p>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <Dialog.Close type="button" className="px-5 py-2.5 rounded-md border border-gray-300 dark:border-[#333] text-[10px] font-bold uppercase tracking-widest text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#111] transition-all">
                Cancelar
              </Dialog.Close>
              <button
                type="submit"
                disabled={loading || novaSenha.length < 6}
                className="px-5 py-2.5 rounded-md bg-[#c8921a] text-[#2d2106] text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-[#c8921a]/20 hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                Confirmar Troca
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
