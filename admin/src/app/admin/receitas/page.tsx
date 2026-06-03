'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/useAuth';
import { EmptyState } from '@/components/admin/EmptyState';
import { ItemCard } from '@/components/admin/ItemCard';
import { Pagination } from '@/components/admin/Pagination';
import { Button } from '@/components/admin/Button';
import { CategoriasModal } from '@/components/admin/CategoriasModal';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { Search, ChevronDown, Plus, FolderPlus, BookOpen } from 'lucide-react';
import { useConfirm } from '@/contexts/ConfirmContext';
import '@/app/admin/item-card.css';

interface Receita {
  id: string;
  titulo: string;
  descricao: string;
  tempo_preparo: number;
  porcoes: number;
  dificuldade: string;
  is_premium: boolean;
  ativa: boolean;
  imagem_url?: string;
  categoria_id?: string;
  created_at: string;
}

export default function AdminReceitas() {
  const { isAuthenticated } = useAuth();
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [categoriasModalOpen, setCategoriasModalOpen] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [freeCount, setFreeCount] = useState<number | null>(null);
  const itemsPerPage = 12;

  const fetchFreeCount = async () => {
    try {
      const dataRaw = await api.getReceitas({ incluirInativas: true });
      let items = [];
      if (Array.isArray(dataRaw)) {
        items = dataRaw;
      } else if (dataRaw && Array.isArray(dataRaw.data)) {
        items = dataRaw.data;
      } else if (dataRaw && Array.isArray(dataRaw.items)) {
        items = dataRaw.items;
      }
      const count = items.filter((r: any) => r.is_free && r.ativa).length;
      setFreeCount(count);
    } catch (err) {
      console.error(err);
    }
  };

  const loadCategorias = async () => {
    try {
      const data = await api.getCategorias();
      setCategorias(data);
    } catch (err) {
      console.error('Erro ao carregar categorias:', err);
    }
  };

  const loadReceitas = async () => {
    try {
      setLoading(true);
      const dataRaw = await api.getReceitas({
        incluirInativas: true,
        page: currentPage,
        limit: itemsPerPage,
        search: searchText || undefined,
        categoria: selectedCategoria || undefined,
      });

      let items = [];
      let total = 1;
      let isPaginatedServerSide = false;
      
      if (Array.isArray(dataRaw)) {
        items = dataRaw;
      } else if (dataRaw && Array.isArray(dataRaw.data)) {
        items = dataRaw.data;
        if (dataRaw.totalPages) total = dataRaw.totalPages;
        isPaginatedServerSide = true;
      } else if (dataRaw && Array.isArray(dataRaw.items)) {
        items = dataRaw.items;
        if (dataRaw.totalPages) total = dataRaw.totalPages;
        isPaginatedServerSide = true;
      }

      // Fallback: If the backend hasn't been updated and didn't paginate or filter, do it locally
      if (!isPaginatedServerSide) {
        if (searchText) {
          items = items.filter((r: any) => r.titulo?.toLowerCase().includes(searchText.toLowerCase()));
        }
        if (selectedCategoria) {
          items = items.filter((r: any) => r.categoria_ids?.includes(selectedCategoria) || r.categoria?.id === selectedCategoria);
        }
        total = Math.ceil(items.length / itemsPerPage);
        const startIndex = (currentPage - 1) * itemsPerPage;
        items = items.slice(startIndex, startIndex + itemsPerPage);
      }

      setReceitas(items);
      setTotalPages(total);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar receitas');
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadCategorias();
      fetchFreeCount();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      loadReceitas();
    }
  }, [isAuthenticated, currentPage, searchText, selectedCategoria]);

  const handleSearchChange = (val: string) => {
    setSearchText(val);
    setCurrentPage(1);
  };
  const handleCategoriaChange = (val: string) => {
    setSelectedCategoria(val);
    setCurrentPage(1);
  };

  const receitasPaginated = receitas;

  const handleDelete = async (id: string) => {
    const receita = receitas.find(r => r.id === id);
    if (!(await confirm(`Excluir "${receita?.titulo}"?`))) return;
    try {
      setLoading(true);
      await api.deleteReceita(id);
      await loadReceitas();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoad) {
    return (
      <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#c8921a]/20 border-t-[#c8921a] rounded-full animate-spin"></div>
      </div>
    );
  }

  const getDificuldadeColor = (dificuldade: string) => {
    switch (dificuldade) {
      case 'facil': return 'bg-green-100 text-green-700';
      case 'medio': return 'bg-yellow-100 text-yellow-700';
      case 'dificil': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-6 sm:p-10 bg-[#fafafa] dark:bg-[#0a0a0a] min-h-screen">
      <div className="w-full max-w-[1400px] mx-auto space-y-6 md:space-y-10">
        
        {/* Header Oficial Minimalista */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-100 dark:border-[#222] pb-4 gap-4">
          <div>
            <h1 className="text-xl font-light text-gray-400 dark:text-gray-500 tracking-tight uppercase">
              Gerenciar <span className="text-gray-800 dark:text-white font-semibold">Receitas</span>
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-[0.2em]">Catálogo Gastronômico Fitness</p>
              
              {/* Badge Free Mobile */}
              <div className="md:hidden flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                <span className="text-[10px] font-medium tracking-wide text-blue-700 dark:text-blue-400">
                  FREE: {freeCount !== null ? freeCount : '...'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center md:justify-end items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
            <button 
              onClick={() => setCategoriasModalOpen(true)}
              className="flex-1 md:flex-none max-w-[220px] md:w-auto justify-center px-4 py-2.5 rounded-lg border border-[#c8921a]/40 text-[#c8921a] text-[11px] font-bold uppercase tracking-widest hover:bg-[#c8921a]/10 hover:border-[#c8921a] transition-all duration-300 flex items-center gap-2"
            >
              <FolderPlus size={16} /> Categorias
            </button>
            <Link 
              href="/admin/receitas/nova"
              className="flex-1 md:flex-none max-w-[220px] md:w-auto justify-center px-4 py-2.5 rounded-lg border-2 border-[#c8921a] bg-[#c8921a] text-white text-[11px] font-bold uppercase tracking-widest hover:bg-[#b58315] hover:border-[#b58315] transition-all duration-300 flex items-center gap-2"
            >
              <Plus size={16} /> Nova Receita
            </Link>
          </div>
        </div>

        {/* Barra Superior de Busca e Filtros */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          {/* Campo de Busca */}
          <div className="relative w-full max-w-[400px] group">
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#c8921a] transition-colors" size={18} />
            <input 
              type="text" value={searchText} onChange={(e) => handleSearchChange(e.target.value)} 
              placeholder="Buscar receita..." 
              className="w-full pl-8 pr-4 py-2 bg-transparent border-t-0 border-l-0 border-r-0 border-b border-gray-300 dark:border-[#333] focus:border-[#c8921a] focus:ring-0 outline-none text-base text-gray-800 dark:text-white font-normal placeholder-gray-400" 
            />
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center gap-4">
             {/* Badge Free Desktop */}
             <div className="hidden md:flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-lg border border-blue-200 dark:border-blue-800 shadow-sm whitespace-nowrap">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                <span className="text-[11px] font-medium tracking-wide text-blue-700 dark:text-blue-400">
                  FREE: {freeCount !== null ? freeCount : '...'}
                </span>
             </div>

            {/* Filtro Dropdown */}
            <div className="relative min-w-[200px] w-full md:w-auto">
              <select 
                value={selectedCategoria} onChange={(e) => handleCategoriaChange(e.target.value)}
                className="w-full appearance-none bg-transparent border-t-0 border-l-0 border-r-0 border-b border-gray-300 dark:border-[#333] pl-2 pr-8 py-2 text-base text-gray-800 dark:text-white font-normal focus:outline-none focus:border-[#c8921a] cursor-pointer"
              >
                <option value="" className="dark:bg-[#0a0a0a] font-normal">Todas as Categorias</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id} className="capitalize dark:bg-[#0a0a0a] font-normal">{cat.nome}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" size={18} />
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 text-xs font-bold rounded-lg border border-red-100">
            {error}
          </div>
        )}

        {receitas.length === 0 ? (
          <EmptyState icon="bx-food-menu" title="Sem receitas" description="Comece criando sua primeira receita!" actionLabel="Nova Receita" actionHref="/admin/receitas/nova" />
        ) : (
          <>
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 transition-all duration-300 ${loading && !initialLoad ? 'opacity-40 pointer-events-none scale-[0.98]' : ''}`}>
              {receitasPaginated.map((receita) => (
                <ItemCard
                  key={receita.id}
                  id={receita.id}
                  title={receita.titulo}
                  description={receita.descricao}
                  imageUrl={receita.imagem_url}
                  isPremium={receita.is_premium}
                  status={receita.ativa ? 'active' : 'inactive'}
                  badges={[
                    {
                      label: receita.dificuldade === 'facil' ? 'Fácil' : receita.dificuldade === 'medio' ? 'Médio' : 'Difícil',
                      color: getDificuldadeColor(receita.dificuldade),
                    },
                  ]}
                  metadata={[
                    { icon: 'bx-time', text: `${receita.tempo_preparo}min` },
                    { icon: 'bx-dish', text: `${receita.porcoes} porções` },
                  ]}
                  editHref={`/admin/receitas/${receita.id}`}
                  onDelete={() => handleDelete(receita.id)}
                />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center pb-12">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
      </div>

      <CategoriasModal
        open={categoriasModalOpen}
        onOpenChange={setCategoriasModalOpen}
        type="receitas"
        onCategoriaChange={loadCategorias}
      />
    </div>
  );
}
