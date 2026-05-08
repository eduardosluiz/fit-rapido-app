'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/useAuth';
import { Switch } from '@/components/ui/switch';
import { FileUpload } from '@/components/admin/FileUpload';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronsUpDown, Trash2, Dumbbell, PlusCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

function NovoTreinoForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [modalidades, setModalidades] = useState<any[]>([]);
  const [bibliotecaExercicios, setBibliotecaExercicios] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const filteredBiblioteca = bibliotecaExercicios.filter(ex => 
    ex.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ex.grupo_muscular?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    imagem_url: '',
    video_url: '',
    nivel: 'iniciante',
    duracao_minutos: '',
    dias_por_semana: '',
    tipo_treino: 'academia',
    modalidade_id: '',
    dia_semana: '',
    categoria_ids: [] as string[],
    grupos_musculares: '',
    tags: '',
    ativa: true,
    is_premium: false,
    is_inedito: false,
    exercicios_detalhados: [{ nome: '', repeticoes: '', imagem_url: '', video_url: '' }]
  });

  const loadInitialData = useCallback(async () => {
    try {
      const [cats, mods, biblio] = await Promise.all([
        api.getCategoriasTreinos().catch(() => []),
        api.getModalidadesTreinos().catch(() => []),
        api.getExerciciosBiblioteca({ limit: 1000 }).catch(() => ({ items: [] }))
      ]);
      
      setCategorias(cats || []);
      setModalidades(mods || []);
      setBibliotecaExercicios(biblio.items || biblio || []);
    } catch (err) {
      console.error('Erro ao carregar dados iniciais:', err);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadInitialData();
    }
  }, [isAuthenticated, loadInitialData]);

  useEffect(() => {
    if (modalidades.length > 0) {
      const modalidadeUrl = searchParams.get('modalidade');
      const nivelUrl = searchParams.get('nivel');
      
      if (modalidadeUrl || nivelUrl) {
        setFormData(prev => ({
          ...prev,
          modalidade_id: modalidadeUrl || prev.modalidade_id,
          nivel: (nivelUrl as any) || prev.nivel
        }));
      }
    }
  }, [modalidades, searchParams]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.titulo.trim()) newErrors.titulo = 'Título é obrigatório';
    // Removemos a validação de exercícios obrigatórios para permitir "Aulas Avulsas" apenas com vídeo principal
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const { ativa, modalidade_id, dia_semana, exercicios_detalhados, ...rest } = formData;
      
      const data: any = {
        ...rest,
        ativa: ativa,
        duracao_minutos: parseInt(formData.duracao_minutos) || 0,
        dias_por_semana: parseInt(formData.dias_por_semana) || 0,
        grupos_musculares: formData.grupos_musculares.split(',').map(s => s.trim()).filter(s => s),
        tags: formData.tags.split(',').map(s => s.trim()).filter(s => s),
        exercicios_detalhados: exercicios_detalhados.filter(ex => ex.nome.trim() !== '')
      };

      if (modalidade_id && modalidade_id !== '') {
        data.modalidade_id = modalidade_id;
      }

      if (dia_semana !== '') {
        data.dia_semana = parseInt(dia_semana);
      }

      await api.createTreino(data);
      toast.success('Treino criado com sucesso');
      router.push('/admin/treinos');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao criar treino');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="relative p-6 sm:p-10 bg-[#f4f7f9] dark:bg-[#0a0a0a] min-h-screen pb-20">
      <div className="w-full max-w-[1400px] mx-auto space-y-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 pb-8 border-b border-gray-200 dark:border-[#222]">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-white dark:bg-[#111] border border-gray-200 dark:border-[#333] rounded-xl shadow-sm">
              <Dumbbell size={32} className="text-[#c8921a]" />
            </div>
            <div>
              <h1 className="text-xl font-light text-gray-400 dark:text-gray-500 tracking-tight uppercase">
                Novo <span className="text-gray-800 dark:text-white font-semibold">Treino</span>
              </h1>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-[0.2em] mt-1">Ficha de Planejamento Técnico</p>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3">
            <Link href="/admin/treinos">
              <button 
                type="button"
                className="px-4 py-2 rounded-md border border-gray-300 dark:border-[#333] text-gray-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-all"
              >
                <i className="bx bx-arrow-back mr-2"></i> Voltar
              </button>
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0f0f0f] border border-gray-200 dark:border-[#222] rounded-xl shadow-sm overflow-hidden p-8 sm:p-12">
          <form id="treino-form" onSubmit={handleSubmit} className="space-y-12">
            {/* Seção: Dados Técnicos */}
            <div className="space-y-8">
              <div className="border-b border-gray-100 dark:border-[#1a1a1a] pb-4">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.3em] text-gray-400 flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#c8921a]"></div>
                  Configuração de Trilha
                </h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Coluna da Esquerda: Textos */}
                <div className="lg:col-span-7 space-y-8">
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-800 dark:text-gray-200 ml-0.5">Nome do Treino</label>
                    <input
                      value={formData.titulo}
                      onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                      placeholder="Ex: FULL BODY INTENSIVO"
                      className="w-full bg-gray-100 dark:bg-[#111] border border-gray-400 dark:border-[#555] rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#c8921a]/20 focus:border-[#c8921a] text-gray-900 dark:text-white font-medium transition-all placeholder:text-gray-500"
                      required
                    />
                    {errors.titulo && <p className="text-[10px] text-red-500 font-bold mt-1 uppercase tracking-tighter">{errors.titulo}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-800 dark:text-gray-200 ml-0.5">Visão Geral (Objetivo)</label>
                    <textarea
                      value={formData.descricao}
                      onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                      placeholder="Descreva o propósito técnico e os objetivos deste planejamento..."
                      className="w-full min-h-[120px] bg-gray-100 dark:bg-[#111] border border-gray-400 dark:border-[#555] rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#c8921a]/20 focus:border-[#c8921a] text-gray-800 dark:text-gray-200 resize-none font-normal leading-relaxed transition-all placeholder:text-gray-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-800 dark:text-gray-200 ml-0.5">Duração (min)</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.duracao_minutos}
                        onChange={(e) => setFormData({ ...formData, duracao_minutos: e.target.value })}
                        placeholder="45"
                        className="w-full bg-gray-100 dark:bg-[#111] border border-gray-400 dark:border-[#555] rounded-md px-4 py-3 text-sm focus:outline-none focus:border-[#c8921a] text-gray-900 dark:text-white font-medium placeholder:text-gray-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-800 dark:text-gray-200 ml-0.5">Intensidade</label>
                      <select
                        value={formData.nivel}
                        onChange={(e) => setFormData({ ...formData, nivel: e.target.value })}
                        className="w-full h-[46px] bg-gray-100 dark:bg-[#111] border border-gray-400 dark:border-[#555] rounded-md px-4 text-sm focus:outline-none focus:border-[#c8921a] text-gray-900 dark:text-white font-medium appearance-none"
                      >
                        <option value="iniciante">Iniciante</option>
                        <option value="intermediario">Médio</option>
                        <option value="avancado">Avançado</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Coluna da Direita: Mídia e Status */}
                <div className="lg:col-span-5 flex flex-col">
                  <div className="grid grid-cols-2 gap-4 flex-1">
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-800 dark:text-gray-200 ml-0.5">Identidade (Capa)</label>
                      <div className="p-4 rounded-xl border border-gray-400 dark:border-[#444] bg-gray-100/30 dark:bg-[#0a0a0a] shadow-inner h-[218px] flex items-center justify-center">
                        <FileUpload
                          type="imagem"
                          value={formData.imagem_url}
                          onChange={(url) => setFormData({ ...formData, imagem_url: url })}
                          hideUrlInput
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-800 dark:text-gray-200 ml-0.5">Vídeo Principal (Aula)</label>
                      <div className="p-4 rounded-xl border border-gray-400 dark:border-[#444] bg-gray-100/30 dark:bg-[#0a0a0a] shadow-inner h-[218px] flex items-center justify-center">
                        <FileUpload
                          type="video"
                          value={formData.video_url}
                          onChange={(url) => setFormData({ ...formData, video_url: url })}
                          hideUrlInput
                        />
                      </div>
                    </div>
                  </div>

                  {/* Alinhado com a linha de Duração/Intensidade */}
                  <div className="grid grid-cols-3 gap-4 mt-8">
                    <div className="flex items-center justify-between p-3 rounded-xl border border-gray-400 dark:border-[#444] bg-gray-100/50 dark:bg-[#0f0f0f] shadow-sm">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-gray-800 dark:text-gray-200">Premium</p>
                      <Switch
                        checked={formData.is_premium}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_premium: checked })}
                        className="scale-75 data-[state=unchecked]:bg-gray-400"
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl border border-gray-400 dark:border-[#444] bg-gray-100/50 dark:bg-[#0f0f0f] shadow-sm">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-[#c8921a]">Inédito</p>
                      <Switch
                        checked={formData.is_inedito}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_inedito: checked })}
                        className="scale-75 data-[state=unchecked]:bg-gray-400"
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl border border-gray-400 dark:border-[#444] bg-gray-100/50 dark:bg-[#0f0f0f] shadow-sm">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-gray-800 dark:text-gray-200">Ativo</p>
                      <Switch
                        checked={formData.ativa}
                        onCheckedChange={(checked) => setFormData({ ...formData, ativa: checked })}
                        className="scale-75 data-[state=unchecked]:bg-gray-400"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Linha Inferior: Categorias */}
              <div className="grid grid-cols-1 md:grid-cols-1 gap-8 pt-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-800 dark:text-gray-200 ml-0.5">Categorias</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button type="button" className="w-full h-[46px] bg-gray-100 dark:bg-[#111] border border-gray-400 dark:border-[#555] rounded-md px-4 text-sm focus:outline-none focus:border-[#c8921a] text-gray-700 dark:text-gray-300 font-medium flex items-center justify-between">
                        {formData.categoria_ids.length > 0
                          ? `${formData.categoria_ids.length} selecionada(s)`
                          : 'Vincular...'}
                        <ChevronsUpDown size={14} className="text-gray-500" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-2 bg-white dark:bg-[#111] border border-gray-200 dark:border-[#333] shadow-xl">
                      <div className="max-h-[300px] overflow-y-auto space-y-1">
                        {categorias.map((cat) => (
                          <div
                            key={cat.id}
                            className="flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md cursor-pointer transition-colors"
                            onClick={() => {
                              const currentIds = formData.categoria_ids || [];
                              const newIds = currentIds.includes(cat.id)
                                ? currentIds.filter((id) => id !== cat.id)
                                : [...currentIds, cat.id];
                              setFormData({ ...formData, categoria_ids: newIds });
                            }}
                          >
                            <Checkbox
                              checked={formData.categoria_ids.includes(cat.id)}
                              className="border-gray-400"
                            />
                            <span className="text-[12px] font-bold uppercase tracking-tighter text-gray-700 dark:text-gray-300">{cat.nome}</span>
                          </div>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            {/* Seção: Exercícios */}
            <div className="space-y-8 pt-10 border-t border-gray-100 dark:border-[#1a1a1a]">
              <div className="pb-2">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.3em] text-gray-400 flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#c8921a]"></div>
                  Estrutura da Sessão (Grade de Exercícios)
                </h3>
              </div>

              <div className="space-y-4">
                {formData.exercicios_detalhados.map((ex, index) => (
                  <div key={index} className="group relative p-5 rounded-xl border border-gray-400 dark:border-[#444] bg-gray-100 dark:bg-[#0a0a0a] hover:border-[#c8921a]/50 transition-all shadow-md">
                    <div className="absolute top-3 right-3 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all">
                      <button type="button" onClick={() => {
                        const novos = formData.exercicios_detalhados.filter((_, i) => i !== index);
                        setFormData({ ...formData, exercicios_detalhados: novos });
                      }} className="p-1.5 rounded-md bg-white dark:bg-[#111] border border-gray-300 dark:border-[#222] text-red-600 hover:bg-red-50 transition-all shadow-sm">
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                      <div className="lg:col-span-1 flex flex-col items-center justify-center">
                        <span className="text-[12px] font-black text-gray-400 dark:text-gray-600 leading-none">#{String(index + 1).padStart(2, '0')}</span>
                      </div>

                      <div className="lg:col-span-5 space-y-4">
                        <div className="space-y-1">
                          <label className="text-[8px] font-bold uppercase tracking-widest text-gray-600 dark:text-gray-400">Nome do Exercício</label>
                          <input
                            placeholder="Ex: Supino Reto"
                            value={ex.nome}
                            onChange={(e) => {
                              const novos = [...formData.exercicios_detalhados];
                              novos[index].nome = e.target.value;
                              setFormData({ ...formData, exercicios_detalhados: novos });
                            }}
                            className="w-full h-[38px] bg-white dark:bg-[#111] border border-gray-400 dark:border-[#555] rounded-md px-4 text-sm focus:outline-none focus:border-[#c8921a] text-gray-900 dark:text-white font-medium"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-bold uppercase tracking-widest text-gray-600 dark:text-gray-400">Repetições / Metas</label>
                          <input
                            placeholder="Ex: 12 reps ou 30s"
                            value={ex.repeticoes}
                            onChange={(e) => {
                              const novos = [...formData.exercicios_detalhados];
                              novos[index].repeticoes = e.target.value;
                              setFormData({ ...formData, exercicios_detalhados: novos });
                            }}
                            className="w-full h-[38px] bg-white dark:bg-[#111] border border-gray-400 dark:border-[#555] rounded-md px-4 text-sm focus:outline-none focus:border-[#c8921a] text-gray-900 dark:text-white font-medium"
                          />
                        </div>
                      </div>

                      <div className="lg:col-span-6 flex items-center justify-center">
                        <div className="flex flex-col sm:flex-row gap-4 p-3 bg-white dark:bg-[#111] rounded-xl border border-gray-200 dark:border-[#333] w-full max-w-[480px]">
                          {/* GIF Demo */}
                          <div className="flex-1 flex flex-col gap-1.5">
                            <span className="text-[7px] font-black uppercase text-gray-400 tracking-widest text-center sm:text-left">GIF DEMO</span>
                            <div className="relative group/media w-full h-20 rounded-lg overflow-hidden bg-gray-50 dark:bg-black border border-gray-200 dark:border-[#333]">
                              {ex.imagem_url ? (
                                <>
                                  <video 
                                    key={`gif-${ex.imagem_url}`}
                                    src={`${ex.imagem_url}#t=0.5`} 
                                    className="w-full h-full object-contain" 
                                    muted 
                                    preload="metadata" 
                                    playsInline
                                    onMouseOver={(e) => e.currentTarget.play()}
                                    onMouseOut={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0.5; }}
                                  />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/media:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <Popover>
                                      <PopoverTrigger asChild>
                                        <button type="button" className="w-8 h-8 rounded bg-[#c8921a] flex items-center justify-center text-white transition-all shadow-lg">
                                          <i className="bx bx-library text-lg"></i>
                                        </button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-[350px] p-0 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#333] shadow-2xl z-[200]">
                                        <div className="p-3 border-b border-gray-100 dark:border-[#1a1a1a] space-y-3">
                                          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Selecionar da Biblioteca</p>
                                          <input 
                                            type="text"
                                            placeholder="Buscar..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full h-8 px-3 bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-[#333] rounded text-xs focus:border-[#c8921a] outline-none"
                                            autoFocus
                                          />
                                        </div>
                                        <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                                          {filteredBiblioteca.map((libEx: any) => (
                                            <button
                                              key={libEx.id}
                                              type="button"
                                              className="w-full p-2 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-[#111] transition-all text-left border-b border-gray-50 dark:border-[#0f0f0f] last:border-0"
                                              onClick={() => {
                                                const novos = [...formData.exercicios_detalhados];
                                                novos[index].imagem_url = libEx.video_url || libEx.imagem_url || '';
                                                setFormData({ ...formData, exercicios_detalhados: novos });
                                              }}
                                            >
                                              <div className="w-10 h-10 rounded bg-black overflow-hidden border border-gray-200 dark:border-[#333] flex-shrink-0">
                                                <video src={`${libEx.video_url}#t=0.5`} className="w-full h-full object-cover" muted preload="none" />
                                              </div>
                                              <p className="text-[10px] font-bold text-gray-700 dark:text-gray-300 uppercase truncate">{libEx.nome}</p>
                                            </button>
                                          ))}
                                        </div>
                                      </PopoverContent>
                                    </Popover>
                                    <button 
                                      type="button"
                                      onClick={() => {
                                        const novos = [...formData.exercicios_detalhados];
                                        novos[index].imagem_url = '';
                                        setFormData({ ...formData, exercicios_detalhados: novos });
                                      }}
                                      className="w-8 h-8 rounded bg-red-500/20 text-red-500 flex items-center justify-center transition-all"
                                    >
                                      <i className="bx bx-trash text-lg"></i>
                                    </button>
                                  </div>
                                </>
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <button type="button" className="flex flex-col items-center justify-center gap-1 group/btn">
                                        <div className="w-7 h-7 rounded-full bg-[#c8921a]/10 group-hover/btn:bg-[#c8921a]/20 flex items-center justify-center transition-all">
                                          <i className="bx bx-library text-[#c8921a] text-base"></i>
                                        </div>
                                        <p className="text-[6px] font-bold uppercase text-gray-500 group-hover/btn:text-[#c8921a]">Escolher</p>
                                      </button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[350px] p-0 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#333] shadow-2xl z-[200]">
                                      <div className="p-3 border-b border-gray-100 dark:border-[#1a1a1a] space-y-3">
                                        <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Selecionar da Biblioteca</p>
                                        <input 
                                          type="text"
                                          placeholder="Buscar..."
                                          value={searchTerm}
                                          onChange={(e) => setSearchTerm(e.target.value)}
                                          className="w-full h-8 px-3 bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-[#333] rounded text-xs focus:border-[#c8921a] outline-none"
                                          autoFocus
                                        />
                                      </div>
                                      <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                                        {filteredBiblioteca.map((libEx: any) => (
                                          <button
                                            key={libEx.id}
                                            type="button"
                                            className="w-full p-2 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-[#111] transition-all text-left border-b border-gray-50 dark:border-[#0f0f0f] last:border-0"
                                            onClick={() => {
                                              const novos = [...formData.exercicios_detalhados];
                                              novos[index].imagem_url = libEx.video_url || libEx.imagem_url || '';
                                              setFormData({ ...formData, exercicios_detalhados: novos });
                                            }}
                                          >
                                            <div className="w-10 h-10 rounded bg-black overflow-hidden border border-gray-200 dark:border-[#333] flex-shrink-0">
                                              <video src={`${libEx.video_url}#t=0.5`} className="w-full h-full object-cover" muted preload="none" />
                                            </div>
                                            <p className="text-[10px] font-bold text-gray-700 dark:text-gray-300 uppercase truncate">{libEx.nome}</p>
                                          </button>
                                        ))}
                                      </div>
                                    </PopoverContent>
                                  </Popover>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Vídeo Aula */}
                          <div className="flex-1 flex flex-col gap-1.5">
                            <span className="text-[7px] font-black uppercase text-gray-400 tracking-widest text-center sm:text-left">VÍDEO AULA</span>
                            <div className="relative group/media w-full h-20 rounded-lg overflow-hidden bg-gray-50 dark:bg-black border border-gray-200 dark:border-[#333]">
                              {ex.video_url ? (
                                <>
                                  <video 
                                    key={`video-${ex.video_url}`}
                                    src={`${ex.video_url}#t=0.5`} 
                                    className="w-full h-full object-cover opacity-90 group-hover/media:opacity-100 transition-opacity" 
                                    muted 
                                    playsInline 
                                    preload="metadata" 
                                    crossOrigin="anonymous" 
                                    onMouseOver={(e) => e.currentTarget.play()}
                                    onMouseOut={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0.5; }}
                                  />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/media:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <Popover>
                                      <PopoverTrigger asChild>
                                        <button type="button" className="w-8 h-8 rounded bg-[#c8921a] flex items-center justify-center text-white transition-all shadow-lg">
                                          <i className="bx bx-library text-lg"></i>
                                        </button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-[350px] p-0 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#333] shadow-2xl z-[200]">
                                        <div className="p-3 border-b border-gray-100 dark:border-[#1a1a1a] space-y-3">
                                          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Selecionar da Biblioteca</p>
                                          <input 
                                            type="text"
                                            placeholder="Buscar..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full h-8 px-3 bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-[#333] rounded text-xs focus:border-[#c8921a] outline-none"
                                            autoFocus
                                          />
                                        </div>
                                        <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                                          {filteredBiblioteca.map((libEx: any) => (
                                            <button
                                              key={libEx.id}
                                              type="button"
                                              className="w-full p-2 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-[#111] transition-all text-left border-b border-gray-50 dark:border-[#0f0f0f] last:border-0"
                                              onClick={() => {
                                                const novos = [...formData.exercicios_detalhados];
                                                novos[index].video_url = libEx.video_url || '';
                                                setFormData({ ...formData, exercicios_detalhados: novos });
                                              }}
                                            >
                                              <div className="w-10 h-10 rounded bg-black overflow-hidden border border-gray-200 dark:border-[#333] flex-shrink-0">
                                                <video src={`${libEx.video_url}#t=0.5`} className="w-full h-full object-cover" muted preload="none" />
                                              </div>
                                              <p className="text-[10px] font-bold text-gray-700 dark:text-gray-300 uppercase truncate">{libEx.nome}</p>
                                            </button>
                                          ))}
                                        </div>
                                      </PopoverContent>
                                    </Popover>
                                    <button 
                                      type="button"
                                      onClick={() => {
                                        const novos = [...formData.exercicios_detalhados];
                                        novos[index].video_url = '';
                                        setFormData({ ...formData, exercicios_detalhados: novos });
                                      }}
                                      className="w-8 h-8 rounded bg-red-500/20 text-red-500 flex items-center justify-center transition-all"
                                    >
                                      <i className="bx bx-trash text-lg"></i>
                                    </button>
                                  </div>
                                </>
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <button type="button" className="flex flex-col items-center justify-center gap-1 group/btn">
                                        <div className="w-7 h-7 rounded-full bg-[#c8921a]/10 group-hover/btn:bg-[#c8921a]/20 flex items-center justify-center transition-all">
                                          <i className="bx bx-library text-[#c8921a] text-base"></i>
                                        </div>
                                        <p className="text-[6px] font-bold uppercase text-gray-500 group-hover/btn:text-[#c8921a]">Escolher</p>
                                      </button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[350px] p-0 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#333] shadow-2xl z-[200]">
                                      <div className="p-3 border-b border-gray-100 dark:border-[#1a1a1a] space-y-3">
                                        <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Selecionar da Biblioteca</p>
                                        <input 
                                          type="text"
                                          placeholder="Buscar..."
                                          value={searchTerm}
                                          onChange={(e) => setSearchTerm(e.target.value)}
                                          className="w-full h-8 px-3 bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-[#333] rounded text-xs focus:border-[#c8921a] outline-none"
                                          autoFocus
                                        />
                                      </div>
                                      <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                                        {filteredBiblioteca.map((libEx: any) => (
                                          <button
                                            key={libEx.id}
                                            type="button"
                                            className="w-full p-2 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-[#111] transition-all text-left border-b border-gray-50 dark:border-[#0f0f0f] last:border-0"
                                            onClick={() => {
                                              const novos = [...formData.exercicios_detalhados];
                                              novos[index].video_url = libEx.video_url || '';
                                              setFormData({ ...formData, exercicios_detalhados: novos });
                                            }}
                                          >
                                            <div className="w-10 h-10 rounded bg-black overflow-hidden border border-gray-200 dark:border-[#333] flex-shrink-0">
                                              <video src={`${libEx.video_url}#t=0.5`} className="w-full h-full object-cover" muted preload="none" />
                                            </div>
                                            <p className="text-[10px] font-bold text-gray-700 dark:text-gray-300 uppercase truncate">{libEx.nome}</p>
                                          </button>
                                        ))}
                                      </div>
                                    </PopoverContent>
                                  </Popover>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="flex justify-center pt-2">
                  <button
                    type="button"
                    onClick={() => setFormData({
                      ...formData,
                      exercicios_detalhados: [...formData.exercicios_detalhados, { nome: '', repeticoes: '', imagem_url: '', video_url: '' }]
                    })}
                    className="px-6 py-2 rounded-full border-2 border-dashed border-gray-300 dark:border-[#333] text-gray-400 hover:border-[#c8921a] hover:text-[#c8921a] hover:bg-[#c8921a]/5 transition-all text-[9px] font-bold uppercase tracking-widest flex items-center gap-2"
                  >
                    <PlusCircle size={14} /> Adicionar Exercício
                  </button>
                </div>
              </div>
            </div>

            {/* Ações */}
            <div className="flex gap-4 pt-10 border-t border-gray-200 dark:border-[#222] justify-end">
              <button 
                type="button" 
                onClick={() => router.push('/admin/treinos')}
                className="px-5 py-2 rounded-md border border-gray-300 dark:border-[#444] text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:bg-gray-50 transition-all flex items-center gap-2"
              >
                <i className="bx bx-x text-lg"></i> Cancelar
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="px-8 py-2.5 rounded-md bg-[#c8921a] text-[#2d2106] text-[10px] font-bold uppercase tracking-widest shadow-md hover:shadow-xl transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#2d2106]/20 border-t-[#2d2106] rounded-full animate-spin"></div> Sincronizando...
                  </>
                ) : (
                  <>
                    <i className="bx bx-check text-lg"></i> Salvar Treino
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

export default function NovoTreino() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-[#1a1a1a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#c8921a] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Carregando formulário...</p>
        </div>
      </div>
    }>
      <NovoTreinoForm />
    </Suspense>
  );
}
