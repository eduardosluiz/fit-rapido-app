'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/useAuth';
import { getMediaUrl } from '@/lib/media';
import { Search, ChevronDown, Trash2, Play, Edit3, AlertTriangle, X, Upload, FolderPlus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import '@/app/admin/item-card.css';

interface Exercicio {
  id: string;
  nome: string;
  video_url: string;
  categoria: string;
  createdAt: string;
}

interface Categoria {
  id: string;
  nome: string;
}

interface UploadItem {
  file: File;
  categorias: string[];
}

export default function BibliotecaVideosPage() {
  const { isAuthenticated } = useAuth();
  const [exercicios, setExercicios] = useState<Exercicio[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState<string>('');
  const [totalItems, setTotalItems] = useState(0);
  
  // Modais
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  
  // Estados de Manipulação
  const [uploadItems, setUploadItems] = useState<UploadItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<Exercicio | null>(null);
  const [itemToDelete, setItemToDelete] = useState<Exercicio | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  const [previewVideo, setPreviewVideo] = useState<Exercicio | null>(null);
  const [videoError, setVideoError] = useState(false);
  const [videoIsLoading, setVideoIsLoading] = useState(false);
  
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const itemsPerPage = 16;

  const loadCategorias = useCallback(async () => {
    try {
      const data = await api.getExerciciosCategorias();
      setCategorias(data || []);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  }, []);

  const fetchExercicios = useCallback(async (pageNum: number, isNewSearch = false) => {
    try {
      if (isNewSearch) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await api.getExerciciosBiblioteca({
        page: pageNum,
        limit: itemsPerPage,
        grupo: selectedCategoria,
        search: searchText
      });
      
      const newItems = response?.items || [];
      if (isNewSearch) {
        setExercicios(newItems);
        setTotalItems(response?.total || 0);
      } else {
        setExercicios(prev => {
          // Prevent duplicates by checking IDs
          const existingIds = new Set(prev.map(item => item.id));
          const uniqueNewItems = newItems.filter((item: Exercicio) => !existingIds.has(item.id));
          return [...prev, ...uniqueNewItems];
        });
      }
      
      setHasMore(pageNum < (response?.lastPage || 0));
    } catch (error) {
      console.error('Erro ao buscar exercícios:', error);
      if (isNewSearch) setExercicios([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [selectedCategoria, searchText]);

  // Carregar categorias apenas uma vez
  useEffect(() => {
    if (isAuthenticated === true) {
      loadCategorias();
    }
  }, [isAuthenticated, loadCategorias]);

  // Carregar exercícios com debounce para a busca
  useEffect(() => {
    if (isAuthenticated === null) return; // Aguardando autenticação

    if (isAuthenticated === false) {
      setLoading(false);
      return;
    }

    const timer = setTimeout(() => {
      setPage(1);
      fetchExercicios(1, true);
    }, 500);

    return () => clearTimeout(timer);
  }, [isAuthenticated, selectedCategoria, searchText, fetchExercicios]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const newItems = files.map(file => ({
        file,
        categorias: categorias.length > 0 ? [categorias[0].nome] : ['Geral']
      }));
      setUploadItems(prev => [...prev, ...newItems]);
    }
  };

  const toggleItemCategory = (index: number, catName: string) => {
    const updated = [...uploadItems];
    const item = updated[index];
    if (item.categorias.includes(catName)) {
      item.categorias = item.categorias.filter(c => c !== catName);
    } else {
      item.categorias = [...item.categorias, catName];
    }
    setUploadItems(updated);
  };

  const removeUploadItem = (index: number) => {
    setUploadItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (uploadItems.length === 0) return;
    setIsUploading(true);
    const toastId = toast.loading(`Sincronizando mídias...`);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      
      for (const item of uploadItems) {
        // Para upload de arquivo, ainda usamos FormData e o axios ou fetch direto pode ser necessário
        // mas vamos tentar usar o fetch com a lógica do api service para manter o token
        const formData = new FormData();
        formData.append('file', item.file);
        
        const token = localStorage.getItem('auth_token');
        const uploadRes = await fetch(`${API_URL}/upload/video`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });
        
        const uploadData = await uploadRes.json();
        
        if (!uploadRes.ok) throw new Error(uploadData.message || 'Erro no upload');

        await api.createExercicioBiblioteca({
          nome: item.file.name.split('.')[0],
          video_url: uploadData.url.startsWith('http') ? uploadData.url : `${API_URL}${uploadData.url}`,
          categoria: item.categorias.join(', ')
        });


      }
      
      toast.success('Mídias adicionadas!', { id: toastId });
      setUploadItems([]);
      setIsUploadModalOpen(false);
      setPage(1);
      fetchExercicios(1, true);
    } catch (error: any) {
      toast.error(error.message || 'Falha no upload', { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    setIsSaving(true);
    try {
      await api.createExercicioCategoria(newCategoryName);
      toast.success('Categoria criada');
      setNewCategoryName('');
      setIsCategoryModalOpen(false);
      loadCategorias();
    } catch (error) {
      toast.error('Erro ao criar categoria');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateTitle = async () => {
    if (!itemToEdit || !newTitle.trim()) return;
    setIsSaving(true);
    try {
      // Usando o create (POST) que atua como update no backend se passar o ID? 
      // Não, vamos usar o POST conforme o código anterior mas ajustado
      await api.createExercicioBiblioteca({
        ...itemToEdit,
        nome: newTitle
      });
      
      toast.success('Renomeado');
      setIsEditModalOpen(false);
      setPage(1);
      fetchExercicios(1, true);
    } catch (error) {
      toast.error('Erro ao renomear');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setIsSaving(true);
    try {
      await api.deleteExercicioBiblioteca(itemToDelete.id);
      toast.success('Removido');
      setIsDeleteModalOpen(false);
      setPage(1);
      fetchExercicios(1, true);
    } catch (error) {
      toast.error('Erro ao remover');
    } finally {
      setIsSaving(false);
    }
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchExercicios(nextPage);
    }
  };

  if (loading && page === 1) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#c8921a]/20 border-t-[#c8921a] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-10 bg-[#fafafa] dark:bg-[#0a0a0a] min-h-screen pb-24">
      <div className="w-full max-w-[1400px] mx-auto space-y-12">
        
        {/* Header Oficial Minimalista */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 dark:border-[#222] pb-8 gap-6">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-xl font-light text-gray-400 dark:text-gray-500 tracking-tight uppercase">
                Biblioteca <span className="text-gray-800 dark:text-white font-semibold">Mídias</span>
              </h1>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-[0.2em] mt-1">Armazenamento Cloud Privado</p>
            </div>
            <div className="bg-white dark:bg-[#111] px-3 py-1.5 rounded-lg border border-[#c8921a]/20 shadow-sm ml-2 flex items-center gap-2">
              <span className="text-xs font-bold text-[#c8921a] tracking-tight">{totalItems}</span>
              <span className="text-[8px] text-gray-400 uppercase font-black tracking-widest hidden xs:inline">Arquivos</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsCategoryModalOpen(true)}
              className="px-4 py-1.5 rounded-md border border-[#c8921a]/60 text-[#c8921a] text-[9px] font-bold uppercase tracking-widest hover:bg-[#c8921a]/5 hover:border-[#c8921a] transition-all duration-300 flex items-center gap-1.5"
            >
              <FolderPlus size={12} /> Categoria
            </button>
            <button 
              onClick={() => setIsUploadModalOpen(true)}
              className="px-4 py-1.5 rounded-md border border-[#c8921a] text-[#c8921a] text-[9px] font-bold uppercase tracking-widest hover:bg-[#c8921a] hover:text-white transition-all duration-300 flex items-center gap-1.5"
            >
              <Upload size={12} /> Adicionar Mídia
            </button>
          </div>
        </div>

        {/* Filtros de Linha */}
        <div className="flex items-center justify-between gap-10 mb-12">
          <div className="relative w-full max-w-[300px] group">
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#c8921a] transition-colors" size={16} />
            <input 
              type="text" value={searchText} onChange={(e) => setSearchText(e.target.value)} 
              placeholder="Buscar exercício..." 
              className="w-full pl-7 pr-4 py-2 bg-transparent border-t-0 border-l-0 border-r-0 border-b border-gray-300 dark:border-[#333] focus:border-[#c8921a] focus:ring-0 outline-none text-sm text-black dark:text-white font-normal placeholder-gray-400" 
            />
          </div>
          
          <div className="relative min-w-[180px]">
            <select 
              value={selectedCategoria} onChange={(e) => setSelectedCategoria(e.target.value)}
              className="w-full appearance-none bg-transparent border-t-0 border-l-0 border-r-0 border-b border-gray-300 dark:border-[#333] pl-2 pr-8 py-2 text-xs text-black dark:text-white font-normal focus:outline-none focus:border-[#c8921a] cursor-pointer uppercase tracking-widest"
            >
              <option value="" className="dark:bg-[#0a0a0a]">Categorias</option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.nome} className="capitalize dark:bg-[#0a0a0a]">{cat.nome}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" size={14} />
          </div>
        </div>

        {/* Grid de Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {exercicios.length > 0 ? (
            exercicios.map((ex) => (
              <div key={ex.id} className="group bg-white dark:bg-[#111] border border-[#c8921a]/30 dark:border-[#c8921a]/20 rounded-xl overflow-hidden hover:border-[#c8921a]/60 hover:shadow-lg transition-all duration-300 flex flex-col">
                <div onClick={() => { setPreviewVideo(ex); setVideoError(false); setVideoIsLoading(true); }} className="w-full h-[160px] bg-[#000] relative cursor-pointer overflow-hidden flex items-center justify-center">
                  <video src={`${getMediaUrl(ex.video_url)}#t=0.5`} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity pointer-events-none" muted playsInline preload="metadata" crossOrigin="anonymous" />
                  <div className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"><div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 scale-90 group-hover:scale-100 transition-transform"><Play className="text-white fill-current ml-0.5" size={16} /></div></div>
                  <div className="absolute top-3 left-3 z-20 pointer-events-none"><span className="bg-[#c8921a] text-white text-[7px] px-2 py-0.5 rounded font-black uppercase tracking-[0.2em] shadow-lg">{ex.categoria || 'Geral'}</span></div>
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="text-[13px] font-normal text-gray-500 dark:text-gray-400 line-clamp-1 mb-4 tracking-tight group-hover:text-gray-800 dark:group-hover:text-white transition-colors">{ex.nome}</h3>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-50 dark:border-[#1a1a1a] mt-auto">
                    <button onClick={() => { setPreviewVideo(ex); setVideoError(false); setVideoIsLoading(true); }} className="text-[9px] font-black text-[#c8921a] hover:text-blue-500 transition-all uppercase tracking-widest">Acessar</button>
                    <div className="flex items-center gap-3">
                      <button onClick={() => { setItemToEdit(ex); setNewTitle(ex.nome); setIsEditModalOpen(true); }} className="text-blue-400 hover:text-blue-600 transition-colors" title="Editar"><Edit3 size={12} /></button>
                      <button onClick={() => { setItemToDelete(ex); setIsDeleteModalOpen(true); }} className="text-red-500 hover:text-red-700 transition-colors" title="Excluir"><Trash2 size={12} /></button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 flex flex-col items-center justify-center bg-white dark:bg-[#111] rounded-2xl border border-dashed border-gray-200 dark:border-[#222]">
              <Play className="text-gray-200 dark:text-gray-800 mb-4" size={48} />
              <p className="text-gray-400 text-xs uppercase tracking-widest">Nenhum vídeo encontrado</p>
            </div>
          )}
        </div>

        {hasMore && (
          <div className="mt-12 flex justify-center pb-12">
            <button onClick={loadMore} disabled={loadingMore} className="text-[9px] font-black uppercase tracking-[0.3em] text-[#c8921a] hover:opacity-80 transition-all">{loadingMore ? 'Carregando...' : 'Ver mais'}</button>
          </div>
        )}
      </div>

      {/* Modal de Preview */}
      {previewVideo && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm animate-in fade-in duration-500">
          <div className="relative w-full max-w-4xl bg-[#0a0a0a] rounded-2xl overflow-hidden border border-white/10 flex flex-col max-h-[90vh]">
            <div className="p-4 bg-black/40 flex items-center justify-between border-b border-white/10 z-10">
              <h2 className="text-white font-normal text-xs uppercase tracking-widest truncate mr-4">{previewVideo.nome}</h2>
              <button 
                onClick={() => { setPreviewVideo(null); setVideoIsLoading(false); }} 
                className="text-white bg-white/10 hover:bg-red-500/20 hover:text-red-500 p-2 rounded-full transition-all duration-200"
                title="Fechar"
              >
                <X size={20} />
              </button>
            </div>
            <div className="relative flex-1 bg-black flex flex-col items-center justify-center overflow-hidden min-h-[300px]">
              {videoIsLoading && !videoError && (
                <div className="absolute inset-0 flex items-center justify-center z-0 bg-black">
                  <div className="w-8 h-8 border-2 border-white/10 border-t-[#c8921a] rounded-full animate-spin"></div>
                </div>
              )}
              {videoError ? (
                <div className="text-center p-10 z-10">
                  <AlertTriangle className="text-[#c8921a] mx-auto mb-4" size={32} />
                  <h3 className="text-white font-medium text-xs mb-6 uppercase tracking-widest">Streaming indisponível</h3>
                  <a href={previewVideo.video_url} target="_blank" rel="noopener noreferrer" className="inline-block bg-[#c8921a] text-white px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-[#b07d14] transition-colors">Abrir no Navegador</a>
                </div>
              ) : (
                <video 
                  key={previewVideo.id} 
                  className="max-w-full max-h-full w-auto h-auto object-contain" 
                  controls 
                  autoPlay 
                  playsInline 
                  crossOrigin="anonymous" 
                  onCanPlay={() => setVideoIsLoading(false)} 
                  onError={() => setVideoError(true)}
                >
                  <source src={getMediaUrl(previewVideo.video_url)} type="video/mp4" />
                  <source src={getMediaUrl(previewVideo.video_url)} type="video/quicktime" />
                  Seu navegador não suporta a tag de vídeo.
                </video>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Exclusão */}
      {isDeleteModalOpen && itemToDelete && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in zoom-in duration-200">
          <div className="bg-white dark:bg-[#111] rounded-2xl shadow-xl w-full max-w-xs overflow-hidden border border-gray-100 dark:border-[#222]">
            <div className="px-5 py-3 border-b border-gray-100 dark:border-[#1a1a1a] flex items-center justify-between">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-gray-800 dark:text-white">Confirmar Exclusão</h2>
              <button onClick={() => setIsDeleteModalOpen(false)} className="text-gray-300 hover:text-red-500"><X size={16} /></button>
            </div>
            <div className="p-6 text-center">
              <AlertTriangle className="text-red-500 mx-auto mb-4" size={16} />
              <p className="text-gray-500 dark:text-gray-400 text-[11px] leading-relaxed">Remover permanentemente <span className="text-gray-800 dark:text-white font-bold">"{itemToDelete.nome.toUpperCase()}"</span>?</p>
            </div>
            <div className="grid grid-cols-2 border-t border-gray-50 dark:border-[#1a1a1a]">
              <button onClick={() => setIsDeleteModalOpen(false)} className="py-3 text-[9px] font-black uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-all">Cancelar</button>
              <button onClick={handleDelete} className="py-3 text-[9px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 transition-all border-l border-gray-50 dark:border-[#1a1a1a]">Sim, Excluir</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição */}
      {isEditModalOpen && itemToEdit && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in zoom-in duration-200">
          <div className="bg-white dark:bg-[#111] rounded-2xl shadow-xl w-full max-w-xs overflow-hidden border border-gray-100 dark:border-[#222]">
            <div className="px-5 py-3 border-b border-gray-100 dark:border-[#1a1a1a] flex items-center justify-between">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-gray-800 dark:text-white">Editar Título</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-300 hover:text-red-500"><X size={16} /></button>
            </div>
            <div className="p-6">
              <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-1">Título do Exercício</label>
              <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="w-full bg-transparent border-t-0 border-l-0 border-r-0 border-b border-gray-300 dark:border-[#333] px-0 py-2 text-xs focus:outline-none focus:border-[#c8921a] text-gray-700 dark:text-white mb-6 font-medium" placeholder="Novo nome..." autoFocus />
              <button onClick={handleUpdateTitle} disabled={isSaving || !newTitle.trim()} className="w-full py-2.5 rounded-lg bg-[#c8921a] text-white text-[9px] font-black uppercase tracking-widest shadow-lg shadow-[#c8921a]/20">Salvar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Nova Categoria */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in zoom-in duration-200">
          <div className="bg-white dark:bg-[#111] rounded-2xl shadow-xl w-full max-w-xs overflow-hidden border border-gray-100 dark:border-[#222]">
            <div className="px-5 py-3 border-b border-gray-100 dark:border-[#1a1a1a] flex items-center justify-between">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-gray-800 dark:text-white">Nova Categoria</h2>
              <button onClick={() => setIsCategoryModalOpen(false)} className="text-gray-300 hover:text-red-500"><X size={16} /></button>
            </div>
            <div className="p-6">
              <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-1">Nome do Grupo Muscular</label>
              <input type="text" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} className="w-full bg-transparent border-t-0 border-l-0 border-r-0 border-b border-gray-300 dark:border-[#333] px-0 py-2 text-xs focus:outline-none focus:border-[#c8921a] text-gray-700 dark:text-white mb-6 font-medium" placeholder="Ex: Costas..." autoFocus />
              <button onClick={handleCreateCategory} disabled={isSaving || !newCategoryName.trim()} className="w-full py-2.5 rounded-lg bg-[#c8921a] text-white text-[9px] font-black uppercase tracking-widest shadow-lg shadow-[#c8921a]/20">Criar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Upload */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-[#111] rounded-xl shadow-2xl w-full max-w-xl overflow-hidden border border-gray-100 dark:border-[#222]">
            <div className="px-8 py-4 border-b border-gray-50 dark:border-[#1a1a1a] flex items-center justify-between">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-gray-800 dark:text-white">Adicionar Mídia</h2>
              <button onClick={() => !isUploading && setIsUploadModalOpen(false)} className="text-gray-300 hover:text-red-500 p-1"><X size={18} /></button>
            </div>
            
            <div className="p-10 space-y-8">
              <label htmlFor="file-up" className="border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center cursor-pointer hover:border-[#c8921a] transition-all border-gray-100 dark:border-[#333] group bg-gray-50/20">
                <Upload className="text-[#c8921a] mb-3 group-hover:scale-110 transition-transform" size={24} />
                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-800 dark:text-white">Selecionar Vídeos</h3>
                <input type="file" multiple accept="video/*" id="file-up" className="hidden" onChange={handleFileChange} disabled={isUploading} />
              </label>
              
              {uploadItems.length > 0 && (
                <div className="bg-gray-50 dark:bg-[#1a1a1a] rounded-lg p-6 max-h-60 overflow-y-auto custom-scrollbar border border-gray-100 dark:border-[#222]">
                  <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-4 border-b pb-2">Fila de Processamento ({uploadItems.length})</div>
                  <div className="space-y-4">
                    {uploadItems.map((item, i) => (
                      <div key={i} className="flex items-center justify-between gap-4 py-2 border-b border-gray-50 dark:border-[#222] last:border-0">
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-[10px] font-bold text-gray-700 dark:text-gray-300">{item.file.name}</p>
                          <p className="text-[8px] text-gray-400">{(item.file.size / (1024 * 1024)).toFixed(1)}MB</p>
                        </div>
                        
                        <div className="flex-1">
                          <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-2">Categorias</p>
                          <div className="flex flex-wrap gap-1.5">
                            {categorias.map((cat) => (
                              <button
                                key={cat.id}
                                onClick={() => toggleItemCategory(i, cat.nome)}
                                className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-tighter transition-all ${
                                  item.categorias.includes(cat.nome)
                                    ? 'bg-[#c8921a] text-white shadow-sm'
                                    : 'bg-gray-100 dark:bg-[#222] text-gray-400 border border-gray-200 dark:border-[#333]'
                                }`}
                              >
                                {cat.nome}
                              </button>
                            ))}
                          </div>
                        </div>

                        <button onClick={() => removeUploadItem(i)} className="text-gray-300 hover:text-red-500 transition-colors"><X size={14} /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="px-10 py-5 bg-gray-50 dark:bg-[#1a1a1a] flex justify-end gap-4 border-t border-gray-100 dark:border-[#222]">
              <button onClick={() => setIsUploadModalOpen(false)} disabled={isUploading} className="px-6 py-2 rounded-lg border border-gray-200 dark:border-[#333] bg-white dark:bg-[#111] text-[9px] font-black uppercase tracking-widest text-gray-400">Cancelar</button>
              <button onClick={handleUpload} disabled={isUploading || uploadItems.length === 0} className="px-8 py-2 rounded-lg bg-[#c8921a] text-white text-[9px] font-black uppercase shadow-lg shadow-[#c8921a]/20 disabled:opacity-50">{isUploading ? 'Processando...' : 'Iniciar Upload'}</button>
            </div>
          </div>
        </div>
      )}
      
      {/* Botão de Voltar ao Topo */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-8 right-8 z-[100] bg-[#c8921a] text-white p-3 rounded-full shadow-lg hover:bg-[#b07d14] transition-all duration-300 opacity-80 hover:opacity-100 group"
        title="Voltar ao Topo"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-y-1 transition-transform">
          <path d="m18 15-6-6-6 6"/>
        </svg>
      </button>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 2px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #eee; border-radius: 10px; }
      `}</style>
    </div>
  );
}
