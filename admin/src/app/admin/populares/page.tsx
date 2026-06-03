'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/useAuth';
import { Loader2, Star, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function PopularesPage() {
  const { isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [receitas, setReceitas] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadReceitas = async () => {
    try {
      setLoading(true);
      // Busca todas as receitas admin
      const data = await api.getReceitas({ admin: true }).catch(() => []);
      setReceitas(data);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mounted && isAuthenticated) {
      loadReceitas();
    }
  }, [mounted, isAuthenticated]);

  const toggleDestaque = async (receita: any) => {
    try {
      const isDestaque = receita.destaque_popular;
      await api.updateReceita(receita.id, { destaque_popular: !isDestaque });
      
      // Atualizar no estado local
      setReceitas((prev) => 
        prev.map((r) => r.id === receita.id ? { ...r, destaque_popular: !isDestaque } : r)
      );
      toast.success(isDestaque ? 'Removido dos populares' : 'Adicionado aos populares');
    } catch (error) {
      toast.error('Erro ao atualizar destaque popular.');
    }
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-[#f4f7f9] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#c8921a]/40" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-10 bg-[#f4f7f9] dark:bg-[#0a0a0a] min-h-screen font-inter w-full">
      <div className="w-full max-w-[1200px] mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 dark:border-[#222] pb-6 gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-light text-gray-400 dark:text-gray-500 tracking-tight uppercase">
              Receitas <span className="text-gray-900 dark:text-white font-bold">Populares</span>
            </h1>
            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-[0.2em] mt-1">
              Gerencie os destaques que aparecem no topo do app
            </p>
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222] rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
              <thead className="text-[10px] font-bold uppercase tracking-widest bg-gray-50 dark:bg-[#1a1a1a] text-gray-500 dark:text-gray-500 border-b border-gray-200 dark:border-[#222]">
                <tr>
                  <th className="px-6 py-4">Receita</th>
                  <th className="px-6 py-4 text-center">Avaliação</th>
                  <th className="px-6 py-4 text-center">Popular no App?</th>
                  <th className="px-6 py-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-[#222]">
                {receitas.map((receita) => (
                  <tr key={receita.id} className="hover:bg-gray-50/50 dark:hover:bg-[#1a1a1a]/50 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-4">
                      {receita.imagem_url ? (
                        <img src={receita.imagem_url} alt={receita.titulo} className="w-12 h-12 rounded object-cover border border-gray-200 dark:border-gray-800" />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 dark:bg-[#222] rounded flex items-center justify-center border border-gray-200 dark:border-gray-800">
                          <span className="text-xs text-gray-400">Sem Img</span>
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-gray-900 dark:text-white">{receita.titulo}</div>
                        <div className="text-xs mt-0.5">{receita.tempo_preparo} min | {receita.calorias || 0} kcal</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Star size={14} className={receita.avaliacao > 0 ? "text-[#c8921a] fill-[#c8921a]" : "text-gray-300"} />
                        <span className="font-bold text-gray-900 dark:text-white">{receita.avaliacao > 0 ? receita.avaliacao.toFixed(1) : '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {receita.destaque_popular ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#047857]/10 text-[#047857] text-[10px] font-bold uppercase tracking-widest border border-[#047857]/20">
                          <CheckCircle size={12} /> Sim
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-gray-100 dark:bg-[#222] text-gray-500 text-[10px] font-bold uppercase tracking-widest border border-gray-200 dark:border-gray-800">
                          <XCircle size={12} /> Não
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => toggleDestaque(receita)}
                        className={`px-4 py-2 rounded text-[10px] font-bold uppercase tracking-widest transition-all ${
                          receita.destaque_popular
                            ? 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-[#222] dark:text-gray-400 dark:hover:bg-[#333]'
                            : 'bg-[#c8921a]/10 text-[#c8921a] hover:bg-[#c8921a]/20 border border-[#c8921a]/30'
                        }`}
                      >
                        {receita.destaque_popular ? 'Remover Destaque' : 'Tornar Popular'}
                      </button>
                    </td>
                  </tr>
                ))}
                
                {receitas.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                      Nenhuma receita encontrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
