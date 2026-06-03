'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/useAuth';
import Link from 'next/link';
import { Loader2, Activity, Users, BookOpen, Dumbbell, Zap, Plus, FolderPlus, ArrowRight } from 'lucide-react';
import './admin.css';

export default function AdminDashboard() {
  const { isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState({
    receitas: 0,
    treinos: 0,
    receitasAtivas: 0,
    treinosAtivos: 0,
    usuariosAtivos: 0,
    usuariosTotal: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const statsData = await api.getStats().catch(() => ({}));

      setStats({
        receitas: statsData.receitas_totais || 0,
        treinos: statsData.treinos_totais || 0,
        receitasAtivas: statsData.receitas_totais || 0, // Como stats ainda nao retorna ativas separado, podemos mapear ou ignorar
        treinosAtivos: statsData.treinos_totais || 0,
        usuariosAtivos: statsData.usuarios_ativos || 0,
        usuariosTotal: statsData.usuarios_totais || 0,
      });
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mounted && isAuthenticated) {
      loadStats();
    }
  }, [mounted, isAuthenticated]);

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-[#f4f7f9] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#c8921a]/40" />
      </div>
    );
  }

  const statCards = [
    { label: 'Receitas', value: stats.receitas, sub: `${stats.receitasAtivas} ativas`, icon: <BookOpen size={16} />, href: '/admin/receitas', subColor: 'text-[#047857]' },
    { label: 'Treinos', value: stats.treinos, sub: `${stats.treinosAtivos} ativos`, icon: <Dumbbell size={16} />, href: '/admin/treinos', subColor: 'text-[#047857]' },
    { label: 'Usuários', value: stats.usuariosTotal, sub: `${stats.usuariosAtivos} online`, icon: <Users size={16} />, href: '/admin/usuarios', subColor: 'text-[#1d4ed8]' },
    { label: 'Biblioteca', value: 'Cloud', sub: 'Mídias Sincronizadas', icon: <Activity size={16} />, href: '/admin/biblioteca', subColor: 'text-[#1d4ed8]' },
  ];

  return (
    <div className="p-6 sm:p-10 bg-[#f4f7f9] dark:bg-[#0a0a0a] min-h-screen font-inter">
      <div className="w-full max-w-[1400px] mx-auto space-y-16">
        
        {/* Header - Minimalista */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-[#222] pb-8">
          <div>
            <h1 className="text-xl font-light text-gray-400 dark:text-gray-500 tracking-tight uppercase">
              Painel de <span className="text-gray-900 dark:text-white font-bold">Controle</span>
            </h1>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium uppercase tracking-[0.2em] mt-1">Visão Geral do Ecossistema</p>
          </div>
          <div className="bg-white dark:bg-[#111] px-4 py-1.5 rounded-lg border border-[#c8921a]/20 shadow-sm">
            <span className="text-xs font-medium text-[#c8921a] tracking-tight">{stats.usuariosAtivos}</span>
            <span className="text-[9px] text-gray-500 dark:text-gray-400 uppercase font-black ml-2 tracking-widest">Ativos</span>
          </div>
        </div>

        {/* Grid de Stats - CORES INTENSAS E SEM NEGRITO */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card) => (
            <Link key={card.href} href={card.href} className="bg-white dark:bg-[#111] p-6 rounded-2xl border border-[#c8921a]/10 hover:border-[#c8921a]/40 hover:shadow-xl hover:shadow-[#c8921a]/5 transition-all duration-500 group flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div className="text-[#c8921a] opacity-60 group-hover:opacity-100 transition-opacity">
                  {card.icon}
                </div>
                <ArrowRight size={12} className="text-gray-300 group-hover:text-[#c8921a] transition-colors" />
              </div>
              <p className="text-3xl font-light text-[#c8921a] tracking-tighter">{card.value}</p>
              <h3 className="text-[11px] font-medium uppercase tracking-widest text-gray-900 dark:text-white mt-1.5">{card.label}</h3>
              {/* Texto de apoio em cor intensa e peso normal */}
              <p className={`text-[10px] ${card.subColor} mt-4 font-normal uppercase tracking-[0.1em] opacity-100`}>
                {card.sub}
              </p>
            </Link>
          ))}
        </div>

        {/* Atalhos Operacionais */}
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-[1px] h-4 bg-[#c8921a]"></div>
            <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-900 dark:text-white">
              Atalhos <span className="text-[#c8921a] font-light">Operacionais</span>
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Banners Mobile', href: '/admin/banners', icon: <Plus size={12} /> },
              { label: 'Nova Receita', href: '/admin/receitas/nova', icon: <Plus size={12} /> },
              { label: 'Novo Treino', href: '/admin/treinos/novo', icon: <Plus size={12} /> },
              { label: 'Biblioteca Cloud', href: '/admin/biblioteca', icon: <Activity size={12} /> },
              { label: 'Gestão Usuários', href: '/admin/usuarios', icon: <Users size={12} /> },
            ].map((action) => (
              <Link key={action.href} href={action.href} className="flex items-center justify-between p-4 bg-white dark:bg-[#111] rounded-xl border border-[#c8921a]/5 hover:border-[#c8921a]/30 hover:shadow-sm transition-all group">
                <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400 group-hover:text-black dark:group-hover:text-white uppercase tracking-wider">{action.label}</span>
                <div className="text-gray-200 group-hover:text-[#c8921a] transition-all transform group-hover:translate-x-1">
                  {action.icon}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
