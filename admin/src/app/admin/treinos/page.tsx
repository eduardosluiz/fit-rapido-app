'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/useAuth';
import { EmptyState } from '@/components/admin/EmptyState';
import { ItemCard } from '@/components/admin/ItemCard';
import { Pagination } from '@/components/admin/Pagination';
import { Button } from '@/components/admin/Button';
import { CategoriasModal } from '@/components/admin/CategoriasModal';
import { ModalidadesModal } from '@/components/admin/ModalidadesModal';
import { ExerciciosModal } from '@/components/admin/ExerciciosModal';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { Search, ChevronDown, Plus, FolderPlus, Dumbbell, Tag } from 'lucide-react';
import '@/app/admin/item-card.css';

export default function TreinosPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [treinos, setTreinos] = useState<any[]>([]);
  const [treinosFiltrados, setTreinosFiltrados] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [modalidades, setModalidades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState<string>('');
  const [selectedModalidade, setSelectedModalidade] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [categoriasModalOpen, setCategoriasModalOpen] = useState(false);
  const [exerciciosModalOpen, setExerciciosModalOpen] = useState(false);
  const itemsPerPage = 12;

  const loadTreinos = useCallback(async () => {
    try {
      setLoading(true);
      const dataRaw = await api.getTreinos({ incluirInativas: true });
      const data = Array.isArray(dataRaw) ? dataRaw : [];
      // Filtrar para não mostrar vídeos de modalidades
      const filtered = data.filter((t: any) => !t.modalidade_id && !t.modalidade);
      setTreinos(filtered);
      setTreinosFiltrados(filtered);
    } catch (err: any) {
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCategorias = useCallback(async () => {
    try {
      const data = await api.getCategoriasTreinos();
      setCategorias(data);
    } catch (err) {
      console.error('Erro:', err);
    }
  }, []);

  const loadModalidades = useCallback(async () => {
    try {
      const data = await api.getModalidadesTreinos();
      setModalidades(data);
    } catch (err) {
      console.error('Erro:', err);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated === true) {
      loadTreinos();
      loadCategorias();
      loadModalidades();
    } else if (isAuthenticated === false) {
      setLoading(false);
    }
  }, [isAuthenticated, loadTreinos, loadCategorias, loadModalidades]);

  useEffect(() => {
    let filtered = treinos;
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter((t) =>
        t.titulo?.toLowerCase().includes(searchLower) ||
        t.descricao?.toLowerCase().includes(searchLower)
      );
    }
    if (selectedCategoria) {
      filtered = filtered.filter((t) => 
        t.categorias && t.categorias.some((cat: any) => cat.id === selectedCategoria)
      );
    }
    if (selectedModalidade) {
      filtered = filtered.filter((t) => t.modalidade_id === selectedModalidade);
    }
    setTreinosFiltrados(filtered);
    setCurrentPage(1);
  }, [searchText, selectedCategoria, selectedModalidade, treinos]);

  const totalPages = Math.ceil(treinosFiltrados.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const treinosPaginated = treinosFiltrados.slice(startIndex, startIndex + itemsPerPage);

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este treino?')) return;
    try {
      setLoading(true);
      await api.deleteTreino(id);
      await loadTreinos();
      toast.success('Treino removido');
    } catch (err: any) {
      toast.error('Erro ao excluir');
    } finally {
      setLoading(false);
    }
  };

  if (loading && currentPage === 1) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#c8921a]/20 border-t-[#c8921a] rounded-full animate-spin"></div>
      </div>
    );
  }

  const getNivelColor = (nivel: string) => {
    switch (nivel) {
      case 'iniciante': return 'bg-green-100 text-green-700';
      case 'intermediario': return 'bg-yellow-100 text-yellow-700';
      case 'avancado': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const renderNivelamentoView = () => {
    const modalidade = modalidades.find(m => m.id === selectedModalidade);
    if (!modalidade?.tem_nivelamento) return null;

    const niveis = [
      { id: 'iniciante', label: 'Iniciante', color: 'border-green-500' },
      { id: 'intermediario', label: 'Médio / Intermediário', color: 'border-yellow-500' },
      { id: 'avancado', label: 'Avançado / Pro', color: 'border-red-500' }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in duration-500">
        {niveis.map(nivel => {
          const treinosNivel = treinosFiltrados.filter(t => t.nivel === nivel.id);
          
          return (
            <div key={nivel.id} className="flex flex-col space-y-6">
              <div className={`p-4 bg-white dark:bg-[#111] border-l-4 ${nivel.color} shadow-sm rounded-r-xl flex items-center justify-between`}>
                <div>
                  <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-800 dark:text-white">{nivel.label}</h3>
                  <p className="text-[9px] text-gray-400 font-medium uppercase mt-1">{treinosNivel.length} Treinos Registrados</p>
                </div>
                <Link 
                  href={`/admin/treinos/novo?modalidade=${selectedModalidade}&nivel=${nivel.id}`}
                  className="w-8 h-8 rounded-full bg-gray-50 dark:bg-[#1a1a1a] flex items-center justify-center text-gray-400 hover:text-[#c8921a] hover:bg-[#c8921a]/10 transition-all border border-gray-100 dark:border-[#222]"
                >
                  <Plus size={14} />
                </Link>
              </div>

              <div className="space-y-4">
                {treinosNivel.length === 0 ? (
                  <div className="p-10 border-2 border-dashed border-gray-100 dark:border-[#1a1a1a] rounded-2xl flex flex-col items-center justify-center text-center">
                    <Dumbbell size={24} className="text-gray-200 dark:text-gray-800 mb-3" />
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Nenhum treino</p>
                  </div>
                ) : (
                  treinosNivel.map(treino => (
                    <ItemCard
                      key={treino.id}
                      id={treino.id}
                      title={treino.titulo}
                      description={treino.descricao}
                      imageUrl={treino.imagem_url}
                      isPremium={treino.is_premium}
                      status={treino.ativa ? 'active' : 'inactive'}
                      compact
                      metadata={[
                        { icon: 'bx-time', text: `${treino.duracao_minutos || 0}m` },
                        { icon: 'bx-list-ul', text: `${treino.exercicios?.length || 0}` },
                      ]}
                      editHref={`/admin/treinos/${treino.id}`}
                      onDelete={() => handleDelete(treino.id)}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="p-6 sm:p-10 bg-[#fafafa] dark:bg-[#0a0a0a] min-h-screen">
      <div className="w-full max-w-[1400px] mx-auto space-y-12">
        
        {/* Header Oficial Minimalista */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#222] pb-8">
          <div>
            <h1 className="text-xl font-light text-gray-400 dark:text-gray-500 tracking-tight uppercase">
              Gerenciar <span className="text-gray-800 dark:text-white font-semibold">Treinos</span>
            </h1>
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-[0.2em] mt-1">Sessões de Treinamento Personalizadas</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setExerciciosModalOpen(true)}
              className="px-4 py-1.5 rounded-md border border-[#c8921a]/60 text-[#c8921a] text-[9px] font-bold uppercase tracking-widest hover:bg-[#c8921a]/5 hover:border-[#c8921a] transition-all duration-300 flex items-center gap-1.5"
            >
              <Dumbbell size={12} /> Exercícios
            </button>
            <button 
              onClick={() => setCategoriasModalOpen(true)}
              className="px-4 py-1.5 rounded-md border border-[#c8921a]/60 text-[#c8921a] text-[9px] font-bold uppercase tracking-widest hover:bg-[#c8921a]/5 hover:border-[#c8921a] transition-all duration-300 flex items-center gap-1.5"
            >
              <FolderPlus size={12} /> Categoria
            </button>
            <Link 
              href="/admin/treinos/novo"
              className="px-4 py-1.5 rounded-md border border-[#c8921a] text-[#c8921a] text-[9px] font-bold uppercase tracking-widest hover:bg-[#c8921a] hover:text-white transition-all duration-300 flex items-center gap-1.5"
            >
              <Plus size={12} /> Novo Treino
            </Link>
          </div>
        </div>

        {/* Barra Superior de Busca e Filtros - Estilo Linha Fina */}
        <div className="flex items-center justify-between gap-10 mb-12">
          {/* Campo de Busca */}
          <div className="relative w-full max-w-[300px] group">
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#c8921a] transition-colors" size={16} />
            <input 
              type="text" value={searchText} onChange={(e) => setSearchText(e.target.value)} 
              placeholder="Buscar treino..." 
              className="w-full pl-7 pr-4 py-2 bg-transparent border-t-0 border-l-0 border-r-0 border-b border-gray-300 dark:border-[#333] focus:border-[#c8921a] focus:ring-0 outline-none text-sm text-black dark:text-white font-normal placeholder-gray-400" 
            />
          </div>
          
          <div className="flex items-center gap-6">
            {/* Filtro Modalidade */}
            <div className="relative min-w-[180px]">
              <select 
                value={selectedModalidade} onChange={(e) => setSelectedModalidade(e.target.value)}
                className="w-full appearance-none bg-transparent border-t-0 border-l-0 border-r-0 border-b border-gray-300 dark:border-[#333] pl-2 pr-8 py-2 text-xs text-black dark:text-white font-normal focus:outline-none focus:border-[#c8921a] cursor-pointer uppercase tracking-widest"
              >
                <option value="" className="dark:bg-[#0a0a0a]">Modalidade</option>
                {modalidades.map((mod) => (
                  <option key={mod.id} value={mod.id} className="capitalize dark:bg-[#0a0a0a]">{mod.nome}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" size={14} />
            </div>

            {/* Filtro Categoria */}
            <div className="relative min-w-[180px]">
              <select 
                value={selectedCategoria} onChange={(e) => setSelectedCategoria(e.target.value)}
                className="w-full appearance-none bg-transparent border-t-0 border-l-0 border-r-0 border-b border-gray-300 dark:border-[#333] pl-2 pr-8 py-2 text-xs text-black dark:text-white font-normal focus:outline-none focus:border-[#c8921a] cursor-pointer uppercase tracking-widest"
              >
                <option value="" className="dark:bg-[#0a0a0a]">Categoria</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id} className="capitalize dark:bg-[#0a0a0a]">{cat.nome}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" size={14} />
            </div>
          </div>
        </div>

        {treinosFiltrados.length === 0 ? (
          <EmptyState icon="bx-dumbbell" title="Sem treinos" description="Crie seu primeiro treino agora!" actionLabel="Novo Treino" actionHref="/admin/treinos/novo" />
        ) : (
          <>
            {selectedModalidade && modalidades.find(m => m.id === selectedModalidade)?.tem_nivelamento ? (
              renderNivelamentoView()
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {treinosPaginated.map((treino) => (
                  <ItemCard
                    key={treino.id}
                    id={treino.id}
                    title={treino.titulo}
                    description={treino.descricao}
                    imageUrl={treino.imagem_url}
                    isPremium={treino.is_premium}
                    status={treino.ativa ? 'active' : 'inactive'}
                    badges={[
                      {
                        label: treino.nivel === 'iniciante' ? 'Iniciante' : treino.nivel === 'intermediario' ? 'Médio' : 'Avançado',
                        color: getNivelColor(treino.nivel),
                      },
                    ]}
                    metadata={[
                      { icon: 'bx-time', text: `${treino.duracao_minutos || 0}min` },
                      { icon: 'bx-dumbbell', text: `${treino.exercicios?.length || 0} exerc.` },
                    ]}
                    editHref={`/admin/treinos/${treino.id}`}
                    onDelete={() => handleDelete(treino.id)}
                  />
                ))}
              </div>
            )}
            
            {!selectedModalidade || !modalidades.find(m => m.id === selectedModalidade)?.tem_nivelamento ? (
              totalPages > 1 && (
                <div className="mt-12 flex justify-center pb-12">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )
            ) : null}
          </>
        )}
      </div>

      <CategoriasModal
        open={categoriasModalOpen}
        onOpenChange={setCategoriasModalOpen}
        type="treinos"
        onCategoriaChange={loadCategorias}
      />

      <ExerciciosModal
        open={exerciciosModalOpen}
        onOpenChange={setExerciciosModalOpen}
      />
    </div>
  );
}
