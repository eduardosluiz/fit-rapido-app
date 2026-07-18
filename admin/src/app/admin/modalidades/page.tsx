'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/useAuth';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { MediaSelectorPopover } from '@/components/admin';
import { FileUpload } from '@/components/admin/FileUpload';
import { toast } from 'react-hot-toast';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Image as ImageIcon, 
  Video, 
  Calendar, 
  ChevronDown, 
  ChevronUp,
  Save,
  X,
  PlusCircle,
  LayoutGrid,
  Play
} from 'lucide-react';
import { useConfirm } from '@/contexts/ConfirmContext';
import '@/app/admin/admin.css';
import '@/app/admin/item-card.css';

interface VideoTreino {
  id?: string;
  titulo: string;
  video_url: string;
  video_explicativo_url?: string;
  dia_semana: string;
  nivel: string;
  series?: string;
  repeticoes?: string;
  descanso?: string;
  peso?: string;
  ordem: number;
  imagem_capa_url?: string;
  substituto_id_1?: string;
  substituto_1_info?: {
    series?: string;
    repeticoes?: string;
    descanso?: string;
    peso?: string;
    imagem_capa_url?: string;
  };
  substituto_id_2?: string;
  substituto_2_info?: {
    series?: string;
    repeticoes?: string;
    descanso?: string;
    peso?: string;
    imagem_capa_url?: string;
  };
  descricao_tecnica?: string;
  showSub1?: boolean;
  showSub2?: boolean;
}

interface Modalidade {
  id: string;
  nome: string;
  descricao?: string;
  imagem_url?: string;
  tem_nivelamento: boolean;
  descricao_iniciante?: string;
  descricao_intermediario?: string;
  descricao_avancado?: string;
  ativo: boolean;
  treinos?: any[];
}

export default function ModalidadesPage() {
  const { isAuthenticated } = useAuth();
  const [modalidades, setModalidades] = useState<Modalidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [bibliotecaExercicios, setBibliotecaExercicios] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    iniciante: true,
    intermediario: false,
    avancado: false
  });
  const [deletedVideoIds, setDeletedVideoIds] = useState<string[]>([]);
  
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({});

  const confirm = useConfirm();

  const toggleDay = (nivel: string, dia: string) => {
    const key = `${nivel}-${dia}`;
    setExpandedDays(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getDiaNome = (dia: string) => {
    const dias: Record<string, string> = {
      '': 'Conteúdo Geral / Sem Dia Definido',
      '0': 'TREINO 1 (Segunda)',
      '1': 'TREINO 2 (Terça)',
      '2': 'TREINO 3 (Quarta)',
      '3': 'TREINO 4 (Quinta)',
      '4': 'TREINO 5 (Sexta)',
      '5': 'TREINO 6 (Sábado)',
      '6': 'TREINO 7 (Domingo)'
    };
    return dias[dia] || 'Outro';
  };
  
  const [formData, setFormData] = useState({
    nome: '',
    subtitulo: '',
    ordem_modalidade: 0,
    descricao: '',
    imagem_url: '',
    tem_nivelamento: false,
    descricao_iniciante: '',
    descricao_intermediario: '',
    descricao_avancado: '',
    ativo: true,
    videos: [] as VideoTreino[]
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [mods, biblio, allTreinos] = await Promise.all([
        api.getModalidadesTreinos(),
        api.getExerciciosBiblioteca({ limit: 1000 }).catch(() => ({ items: [] })),
        api.getTreinos({ incluirInativas: true }).catch(() => [])
      ]);
      
      const modsWithTreinos = mods.map((mod: any) => {
        // Filtra os treinos desta modalidade e garante que não haja duplicatas por ID
        const seenIds = new Set();
        const treinosDaMod = allTreinos.filter((t: any) => {
          const isFromMod = t.modalidade_id === mod.id || t.modalidade?.id === mod.id;
          if (isFromMod && !seenIds.has(t.id)) {
            seenIds.add(t.id);
            return true;
          }
          return false;
        });
        return { ...mod, treinos: treinosDaMod };
      });

      setModalidades(modsWithTreinos);
      setBibliotecaExercicios(biblio.items || biblio || []);
      setDeletedVideoIds([]); // Limpa ao carregar
    } catch (err: any) {
      console.error('Erro ao carregar dados:', err);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, loadData]);

  const handleAddVideo = (nivel: string = 'iniciante', dia: string = '') => {
    // Calcular a próxima ordem para este nível ou para a trilha geral
    // Usamos uma comparação mais flexível (==) para evitar problemas entre string/número
    const filteredVideos = formData.videos.filter(v => {
      const matchDia = String(v.dia_semana || '') === String(dia || '');
      if (formData.tem_nivelamento) {
        return v.nivel === nivel && matchDia;
      }
      return matchDia;
    });

    // Se não houver vídeos, a ordem é 0. Se houver, é o maior + 1.
    const nextOrder = filteredVideos.length > 0 
      ? Math.max(...filteredVideos.map(v => Number(v.ordem || 0))) + 1 
      : 0;

    setFormData(prev => ({
      ...prev,
      videos: [...prev.videos, { 
        titulo: '', 
        video_url: '', 
        video_explicativo_url: '',
        dia_semana: String(dia), 
        nivel, 
        series: '', 
        repeticoes: '', 
        descanso: '', 
        peso: '',
        ordem: nextOrder,
        substituto_id_1: '',
        substituto_id_2: '',
        descricao_tecnica: '',
        showSub1: false,
        showSub2: false
      }]
    }));
    setExpandedSections(prev => ({ ...prev, [nivel]: true }));
    if (dia !== '') {
      setExpandedDays(prev => ({ ...prev, [`${nivel}-${dia}`]: true }));
    }
  };

  const handleRemoveVideo = (index: number) => {
    const videoToRemove = formData.videos[index];
    if (videoToRemove.id) {
      setDeletedVideoIds(prev => [...prev, videoToRemove.id!]);
    }
    
    setFormData(prev => ({
      ...prev,
      videos: prev.videos.filter((_, i) => i !== index)
    }));
  };

  const moveVideo = (originalIndex: number, direction: 'up' | 'down') => {
    const videoToMove = formData.videos[originalIndex];
    const nivel = videoToMove.nivel;
    const dia = videoToMove.dia_semana;
    
    // 1. Pegar todos os vídeos que estão sendo exibidos no mesmo grupo
    const currentGroupVideos = formData.videos
      .map((v, i) => ({ ...v, originalIndex: i }))
      .filter(v => {
        const matchDia = String(v.dia_semana || '') === String(dia || '');
        if (formData.tem_nivelamento) {
          return v.nivel === nivel && matchDia;
        }
        return matchDia;
      })
      .sort((a, b) => {
        if (a.ordem !== b.ordem) return a.ordem - b.ordem;
        return a.originalIndex - b.originalIndex;
      });

    const fIndex = currentGroupVideos.findIndex(v => v.originalIndex === originalIndex);
    
    if (direction === 'up' && fIndex > 0) {
      const otherVideo = currentGroupVideos[fIndex - 1];
      const newVideos = [...formData.videos];
      
      const tempOrdem = newVideos[originalIndex].ordem;
      const targetOrdem = newVideos[otherVideo.originalIndex].ordem;
      
      newVideos[originalIndex] = { ...newVideos[originalIndex], ordem: targetOrdem };
      newVideos[otherVideo.originalIndex] = { ...newVideos[otherVideo.originalIndex], ordem: tempOrdem };
      
      if (newVideos[originalIndex].ordem === newVideos[otherVideo.originalIndex].ordem) {
        newVideos[originalIndex] = { ...newVideos[originalIndex], ordem: fIndex - 1 };
        newVideos[otherVideo.originalIndex] = { ...newVideos[otherVideo.originalIndex], ordem: fIndex };
      }
      
      setFormData(prev => ({ ...prev, videos: newVideos }));
    } else if (direction === 'down' && fIndex < currentGroupVideos.length - 1) {
      const otherVideo = currentGroupVideos[fIndex + 1];
      const newVideos = [...formData.videos];
      
      const tempOrdem = newVideos[originalIndex].ordem;
      const targetOrdem = newVideos[otherVideo.originalIndex].ordem;
      
      newVideos[originalIndex] = { ...newVideos[originalIndex], ordem: targetOrdem };
      newVideos[otherVideo.originalIndex] = { ...newVideos[otherVideo.originalIndex], ordem: tempOrdem };

      if (newVideos[originalIndex].ordem === newVideos[otherVideo.originalIndex].ordem) {
        newVideos[originalIndex] = { ...newVideos[originalIndex], ordem: fIndex + 1 };
        newVideos[otherVideo.originalIndex] = { ...newVideos[otherVideo.originalIndex], ordem: fIndex };
      }
      
      setFormData(prev => ({ ...prev, videos: newVideos }));
    }
  };

  const handleVideoChange = (index: number, field: keyof VideoTreino, value: string) => {
    const newVideos = [...formData.videos];
    newVideos[index] = { ...newVideos[index], [field]: value } as VideoTreino;
    setFormData(prev => ({ ...prev, videos: newVideos }));
  };

  const toggleSection = (nivel: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [nivel]: !prev[nivel]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    setSaving(true);
    try {
      let modalidadeId = editingId;
      
      const modData = {
        nome: formData.nome,
        subtitulo: formData.subtitulo,
        ordem_modalidade: Number(formData.ordem_modalidade),
        descricao: formData.descricao,
        imagem_url: formData.imagem_url,
        tem_nivelamento: formData.tem_nivelamento,
        descricao_iniciante: formData.descricao_iniciante,
        descricao_intermediario: formData.descricao_intermediario,
        descricao_avancado: formData.descricao_avancado,
        ativo: formData.ativo
      };

      if (editingId) {
        await api.updateModalidadeTreino(editingId, modData);
        toast.success('Modalidade atualizada');
      } else {
        const newMod = await api.createModalidadeTreino(modData);
        modalidadeId = newMod.id;
        toast.success('Modalidade criada');
      }

      if (modalidadeId) {
        // 1. Deletar vídeos removidos
        if (deletedVideoIds.length > 0) {
          // Usamos Promise.allSettled para evitar que um erro de deleção pare todo o processo
          await Promise.allSettled(deletedVideoIds.map(id => api.deleteTreino(id)));
        }

        // 2. Salvar/Atualizar vídeos atuais
        // GARANTIA DE ORDEM: Recalculamos a ordem baseada na posição visual exata da lista
        // antes de enviar para a API.
        const currentVideos = [...formData.videos];
        
        // Agrupar por Nível e Dia para resetar as ordens de forma limpa dentro de cada sub-lista
        const grouped: Record<string, VideoTreino[]> = {};
        currentVideos.forEach(v => {
          const key = `${v.nivel}-${v.dia_semana}`;
          if (!grouped[key]) grouped[key] = [];
          grouped[key].push(v);
        });

        for (const key in grouped) {
          // Para cada grupo (ex: iniciante-segunda), atribuímos ordens sequenciais 0, 1, 2...
          // A ordem no array grouped[key] já é a ordem visual que o usuário vê.
          const subList = grouped[key].sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
          for (let i = 0; i < subList.length; i++) {
            const video = subList[i];
            if (!video.titulo.trim() || !video.video_url.trim()) continue;

            const treinoData: any = {
              titulo: video.titulo,
              video_url: video.video_url,
              video_explicativo_url: video.video_explicativo_url || null,
              modalidade_id: modalidadeId,
              dia_semana: video.dia_semana !== '' ? parseInt(video.dia_semana) : null,
              ativa: true,
              is_premium: true,
              tipo_treino: 'academia',
              nivel: video.nivel || 'iniciante',
              ordem: i, // USAMOS O ÍNDICE i PARA GARANTIR A POSIÇÃO ABSOLUTA
              descricao: video.series ? `${video.series} séries de ${video.repeticoes || ''}. Descanso: ${video.descanso || ''}. Carga: ${video.peso || ''}` : '',
              descricao_tecnica: video.descricao_tecnica || '',
              imagem_capa_url: video.imagem_capa_url || null,
              substituto_id_1: video.substituto_id_1 || null,
              substituto_1_info: video.substituto_1_info || null,
              substituto_id_2: video.substituto_id_2 || null,
              substituto_2_info: video.substituto_2_info || null,
              exercicios_detalhados: [
                {
                  nome: video.titulo,
                  video_url: video.video_url,
                  series: video.series ? parseInt(video.series) : 0,
                  repeticoes: video.repeticoes || '',
                  intervalo: video.descanso || '',
                  carga: video.peso || ''
                }
              ]
            };

            if (video.id) {
              await api.updateTreino(video.id, treinoData);
            } else {
              await api.createTreino(treinoData);
            }
          }
        }
      }

      if (!editingId && modalidadeId) {
        setEditingId(modalidadeId);
      }
      setDeletedVideoIds([]);
      await loadData();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar modalidade');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (mod: Modalidade) => {
    setEditingId(mod.id);
    setDeletedVideoIds([]); // Reset
    setFormData({
      nome: mod.nome,
      subtitulo: mod.subtitulo || '',
      ordem_modalidade: mod.ordem_modalidade || 0,
      descricao: mod.descricao || '',
      imagem_url: mod.imagem_url || '',
      tem_nivelamento: mod.tem_nivelamento || false,
      descricao_iniciante: mod.descricao_iniciante || '',
      descricao_intermediario: mod.descricao_intermediario || '',
      descricao_avancado: mod.descricao_avancado || '',
      ativo: mod.ativo,
      videos: mod.treinos?.map((t, index) => ({
        id: t.id,
        titulo: t.titulo,
        video_url: t.video_url,
        video_explicativo_url: t.video_explicativo_url || '',
        dia_semana: t.dia_semana !== null && t.dia_semana !== undefined ? String(t.dia_semana) : '',
        nivel: t.nivel || 'iniciante',
        ordem: t.ordem !== undefined && t.ordem !== null ? t.ordem : index,
        series: String(t.exercicios_detalhados?.[0]?.series || ''),
        repeticoes: t.exercicios_detalhados?.[0]?.repeticoes || '',
        descanso: t.exercicios_detalhados?.[0]?.intervalo || '',
        peso: t.exercicios_detalhados?.[0]?.carga || '',
        imagem_capa_url: t.imagem_capa_url || '',
        substituto_id_1: t.substituto_id_1 || '',
        substituto_1_info: t.substituto_1_info || null,
        substituto_id_2: t.substituto_id_2 || '',
        substituto_2_info: t.substituto_2_info || null,
        descricao_tecnica: t.descricao_tecnica || '',
        showSub1: !!t.substituto_id_1,
        showSub2: !!t.substituto_id_2
      })) || []
    });
    
    if (mod.tem_nivelamento) {
      const hasInter = mod.treinos?.some(t => t.nivel === 'intermediario');
      const hasAvanc = mod.treinos?.some(t => t.nivel === 'avancado');
      setExpandedSections({
        iniciante: true,
        intermediario: !!hasInter,
        avancado: !!hasAvanc
      });
    } else {
      setExpandedSections({ iniciante: true, intermediario: false, avancado: false });
    }
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const handleDelete = async (mod: Modalidade) => {
    if (!(await confirm(`Tem certeza que deseja excluir a modalidade "${mod.nome}" e todos os seus vídeos associados?`))) return;
    try {
      await api.deleteModalidadeTreino(mod.id);
      toast.success('Modalidade removida');
      loadData();
    } catch (err: any) {
      toast.error('Erro ao excluir');
    }
  };

  const handleSubstitutoInfoChange = (index: number, substitutoNum: 1 | 2, field: string, value: string) => {
    const newVideos = [...formData.videos];
    const infoField = `substituto_${substitutoNum}_info` as 'substituto_1_info' | 'substituto_2_info';
    newVideos[index] = {
      ...newVideos[index],
      [infoField]: {
        ...(newVideos[index][infoField] || {}),
        [field]: value
      }
    };
    setFormData(prev => ({ ...prev, videos: newVideos }));
  };

  const renderVideoSection = (nivel: string, title: string, color: string) => {
    // SE NÃO TEM NIVELAMENTO: Mostra apenas o primeiro container com TODOS os vídeos
    if (!formData.tem_nivelamento && nivel !== 'iniciante') return null;
    
    const isExpanded = expandedSections[nivel];
    const displayTitle = formData.tem_nivelamento ? title : 'Conteúdo da Modalidade (Trilha Geral)';
    
    // 1. Pega os vídeos e ordena
    // Lógica Corrigida:
    // - Se tem nivelamento: Filtra estritamente pelo nível (Iniciante, Intermediário ou Avançado).
    // - Se NÃO tem nivelamento (Trilha Geral): Mostra TODOS os vídeos da modalidade,
    //   independente do nível que tinham antes. Isso garante que cada modalidade
    //   exiba apenas o seu próprio conteúdo de forma isolada.
    const allFilteredVideos = formData.videos
      .map((v, i) => ({ ...v, originalIndex: i }))
      .filter(v => {
        if (formData.tem_nivelamento) {
          return v.nivel === nivel;
        }
        // Se não tem nivelamento, a "Trilha Geral" mostra tudo o que pertence a esta modalidade
        return true;
      })
      .sort((a, b) => {
        if (a.ordem !== b.ordem) return a.ordem - b.ordem;
        return a.titulo.localeCompare(b.titulo);
      });

    // 2. Agrupa por dia da semana
    const groupedByDay: Record<string, typeof allFilteredVideos> = {};
    allFilteredVideos.forEach(video => {
      const dia = video.dia_semana || '';
      if (!groupedByDay[dia]) groupedByDay[dia] = [];
      groupedByDay[dia].push(video);
    });

    // 3. Ordena os dias (vazio primeiro, depois 0 a 6)
    // Se não tem nivelamento, mostramos apenas os dias que possuem vídeos para não poluir
    const sortedDays = formData.tem_nivelamento 
      ? (groupedByDay[''] && groupedByDay[''].length > 0 ? ['', '0', '1', '2', '3', '4', '5', '6'] : ['0', '1', '2', '3', '4', '5', '6'])
      : Object.keys(groupedByDay).sort((a, b) => {
          if (a === '') return -1;
          if (b === '') return 1;
          return parseInt(a) - parseInt(b);
        });

    return (
      <div className="bg-white dark:bg-[#0f0f0f] border border-gray-200 dark:border-[#222] rounded-2xl shadow-sm overflow-hidden mb-8 transition-all">
        <div className="p-6 sm:p-10 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 dark:border-[#1a1a1a] pb-4 gap-4">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.3em] text-gray-600 dark:text-gray-400 flex items-center gap-2 sm:gap-3 leading-snug">
              <div className={`w-1.5 h-1.5 rounded-full ${color} shrink-0`}></div>
              <span>{displayTitle}</span>
              <span className="ml-1 sm:ml-2 px-2 py-0.5 rounded bg-gray-100 dark:bg-[#1a1a1a] text-[9px] text-gray-500 font-black shrink-0">{allFilteredVideos.length}</span>
            </h3>
            <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto justify-between sm:justify-end shrink-0">
              <button
                type="button"
                onClick={() => handleAddVideo(nivel)}
                className={`text-[9px] font-bold uppercase tracking-widest ${color.replace('bg-', 'text-')} hover:underline flex items-center gap-2 whitespace-nowrap`}
              >
                <PlusCircle size={14} /> <span className="hidden sm:inline">Adicionar</span> Vídeo
              </button>
              
              <button
                type="button"
                onClick={() => toggleSection(nivel)}
                className="px-3 py-2 rounded-lg bg-gray-50 dark:bg-[#1a1a1a] text-gray-500 dark:text-gray-400 hover:text-[#c8921a] hover:bg-gray-100 dark:hover:bg-[#222] transition-all flex items-center gap-1.5 whitespace-nowrap border border-gray-200 dark:border-[#333]"
              >
                <span className="text-[9px] font-bold uppercase tracking-widest mr-1">{isExpanded ? 'Colapsar' : 'Expandir'}</span>
                {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>
          </div>

          {isExpanded && (
            <div className="space-y-12 animate-in fade-in slide-in-from-top-2 duration-300">
              {/* Campo de Descrição Específica da Trilha */}
              {formData.tem_nivelamento && (
                <div className="space-y-3 p-6 rounded-2xl bg-gray-50/50 dark:bg-[#111]/50 border border-gray-200 dark:border-[#222]">
                  <div className="flex items-center gap-2">
                    <Edit3 size={12} className="text-[#c8921a]" />
                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-500">Descrição Técnica da Trilha {title.split(' ').pop()}</label>
                  </div>
                  <textarea
                    value={(formData as any)[`descricao_${nivel}`] || ''}
                    onChange={(e) => setFormData({ ...formData, [`descricao_${nivel}`]: e.target.value })}
                    placeholder={`Descreva os objetivos específicos para os alunos do nível ${nivel}...`}
                    className="w-full min-h-[80px] bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-[#333] rounded-xl px-4 py-3 text-xs focus:border-[#c8921a] outline-none text-gray-700 dark:text-gray-300 resize-none transition-all shadow-sm"
                  />
                </div>
              )}

              {allFilteredVideos.length > 0 ? (
                sortedDays.map(dia => {
                  const videosDoDia = groupedByDay[dia] || [];
                  const dayKey = `${nivel}-${dia}`;
                  const isDayExpanded = expandedDays[dayKey] !== false; // Default expandido

                  return (
                    <div key={dayKey} className="space-y-6">
                      <div
                        className="w-full flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 bg-white dark:bg-[#111] rounded-xl border-2 border-gray-200 dark:border-[#333] shadow-sm hover:border-[#c8921a]/40 transition-all group cursor-pointer gap-3 sm:gap-0"
                        onClick={() => toggleDay(nivel, dia)}
                      >
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full sm:w-auto pr-6 sm:pr-0 relative">
                          <Calendar size={18} className="text-[#c8921a] shrink-0" />
                          <span className="text-[11px] sm:text-xs font-black uppercase tracking-[0.1em] text-gray-700 dark:text-gray-300">
                            {getDiaNome(dia)}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-white dark:bg-black border border-gray-200 dark:border-[#333] text-[9px] text-gray-500 font-bold shrink-0">
                            {videosDoDia.length} <span className="hidden sm:inline">{videosDoDia.length === 1 ? 'vídeo' : 'vídeos'}</span>
                          </span>
                          
                          <button 
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleAddVideo(nivel, dia); }}
                            className="ml-auto sm:ml-4 w-8 h-8 sm:w-auto sm:h-auto sm:px-3 sm:py-1.5 rounded-md bg-[#c8921a]/10 text-[#c8921a] hover:bg-[#c8921a] hover:text-white transition-all text-[9px] font-bold uppercase tracking-widest flex items-center justify-center sm:gap-1.5 shrink-0"
                            title="Adicionar vídeo para este dia"
                          >
                            <Plus size={16} className="sm:w-3 sm:h-3" /> <span className="hidden sm:inline">Adicionar</span>
                          </button>

                          <div className="absolute right-0 top-1/2 -translate-y-1/2 sm:hidden text-gray-600 dark:text-gray-400 group-hover:text-[#c8921a] transition-colors bg-gray-100 dark:bg-[#222] p-1.5 rounded-md">
                            {isDayExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </div>
                        </div>
                        <div className="hidden sm:block text-gray-600 dark:text-gray-400 group-hover:text-[#c8921a] transition-colors bg-gray-100 dark:bg-[#222] p-1.5 rounded-md">
                            {isDayExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>
                      </div>

                      {isDayExpanded && (
                        <div className="space-y-8 pl-4 border-l-2 border-gray-100 dark:border-[#1a1a1a] ml-4 animate-in fade-in duration-300">
                          {videosDoDia.map((video, fIndex) => (
                            <div key={`${nivel}-${video.id || video.originalIndex}-${video.ordem}`} className="group relative p-6 sm:p-8 rounded-2xl border border-gray-400 dark:border-[#444] bg-gray-50/30 dark:bg-[#0a0a0a] hover:border-[#c8921a]/40 transition-all flex flex-col gap-6 sm:gap-8 mt-4 sm:mt-0">
                              <div className="absolute -left-3 sm:-left-4 top-4 sm:top-8 flex flex-col gap-1.5 sm:gap-2 z-10 scale-[0.80] sm:scale-100">
                                <div className={`w-8 h-8 rounded-lg ${color} text-white flex items-center justify-center text-[11px] font-black shadow-lg`}>
                                  {fIndex + 1}
                                </div>
                                <div className="flex flex-col items-center justify-center gap-0.5 bg-white dark:bg-[#111] border border-gray-200 dark:border-[#333] rounded-md py-0.5 shadow-md overflow-hidden w-8">
                                  <button 
                                    type="button" 
                                    onClick={() => moveVideo(video.originalIndex, 'up')} 
                                    disabled={fIndex === 0}
                                    className="w-full flex items-center justify-center p-1 text-gray-500 hover:text-[#c8921a] hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-all disabled:opacity-20"
                                  >
                                    <ChevronUp size={16} />
                                  </button>
                                  <div className="h-[1px] w-full bg-gray-100 dark:bg-[#222]"></div>
                                  <button 
                                    type="button" 
                                    onClick={() => moveVideo(video.originalIndex, 'down')} 
                                    disabled={fIndex === videosDoDia.length - 1}
                                    className="w-full flex items-center justify-center p-1 text-gray-500 hover:text-[#c8921a] hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-all disabled:opacity-20"
                                  >
                                    <ChevronDown size={16} />
                                  </button>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                                <div className="lg:col-span-3 space-y-6">
                                  <div className="space-y-2">
                                    <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-800 dark:text-gray-200">Título do Vídeo</label>
                                    <input
                                      value={video.titulo}
                                      onChange={(e) => handleVideoChange(video.originalIndex, 'titulo', e.target.value)}
                                      placeholder="Ex: Aula 01"
                                      className="w-full bg-gray-100 dark:bg-[#111] border border-gray-400 dark:border-[#333] rounded-md px-4 py-2.5 text-sm focus:border-[#c8921a] outline-none text-gray-900 dark:text-white font-medium"
                                    />
                                  </div>

                                  <div className={`grid grid-cols-1 ${formData.tem_nivelamento ? 'sm:grid-cols-2' : ''} gap-4`}>
                                    <div className="space-y-2">
                                      <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-800 dark:text-gray-200">Treino</label>
                                      <select value={video.dia_semana} onChange={(e) => handleVideoChange(video.originalIndex, 'dia_semana', e.target.value)} className="w-full bg-gray-100 dark:bg-[#111] border border-gray-400 dark:border-[#333] rounded-md px-4 py-2.5 text-sm focus:border-[#c8921a] outline-none text-gray-900 dark:text-white font-medium appearance-none">
                                        <option value="">Geral</option><option value="0">TREINO 1 (Segunda)</option><option value="1">TREINO 2 (Terça)</option><option value="2">TREINO 3 (Quarta)</option><option value="3">TREINO 4 (Quinta)</option><option value="4">TREINO 5 (Sexta)</option><option value="5">TREINO 6 (Sábado)</option><option value="6">TREINO 7 (Domingo)</option>
                                      </select>
                                    </div>

                                    {formData.tem_nivelamento && (
                                      <div className="space-y-2">
                                        <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-800 dark:text-gray-200">Nível</label>
                                        <select value={video.nivel} onChange={(e) => handleVideoChange(video.originalIndex, 'nivel', e.target.value)} className="w-full bg-gray-100 dark:bg-[#111] border border-gray-400 dark:border-[#333] rounded-md px-4 py-2.5 text-sm focus:border-[#c8921a] outline-none text-gray-900 dark:text-white font-medium appearance-none">
                                          <option value="iniciante">Iniciante</option><option value="intermediario">Intermediário</option><option value="avancado">Avançado</option>
                                        </select>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="lg:col-span-5 space-y-4">
                                  <div className="space-y-2">
                                    <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-800 dark:text-gray-200">Vídeo de Execução</label>
                                    <div className="flex items-center gap-3">
                                      <div className="flex-1 h-[42px] bg-gray-100 dark:bg-[#111] border border-gray-400 dark:border-[#333] rounded-md flex items-center px-3 sm:px-4 overflow-hidden shadow-inner">
                                        <span className="text-[9px] sm:text-[11px] text-gray-400 truncate flex-1 font-medium">{video.video_url || 'Selecione mídia...'}</span>
                                      </div>
                                      <div className="flex items-center gap-2 shrink-0">
                                        <FileUpload type="video" value={video.video_url} onChange={(url) => handleVideoChange(video.originalIndex, 'video_url', url)} hideUrlInput compact />
                                        <MediaSelectorPopover
                                          bibliotecaExercicios={bibliotecaExercicios}
                                          selectedValue={video.video_url}
                                          compareKey="video_url"
                                          onSelect={(libEx) => handleVideoChange(video.originalIndex, 'video_url', libEx.video_url)}
                                        >
                                          <button type="button" className="w-10 h-[42px] rounded-md border border-[#c8921a]/30 bg-white dark:bg-[#111] text-[#c8921a] flex items-center justify-center hover:bg-[#c8921a] hover:text-white transition-all"><LayoutGrid size={18} /></button>
                                        </MediaSelectorPopover>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="space-y-2">
                                    <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-800 dark:text-gray-200">Vídeo Explicativo</label>
                                    <div className="flex items-center gap-3">
                                      <div className="flex-1 h-[42px] bg-gray-100 dark:bg-[#111] border border-gray-400 dark:border-[#333] rounded-md flex items-center px-3 sm:px-4 overflow-hidden shadow-inner">
                                        <span className="text-[9px] sm:text-[11px] text-gray-400 truncate flex-1 font-medium">{video.video_explicativo_url || 'Selecione mídia...'}</span>
                                      </div>
                                      <div className="flex items-center gap-2 shrink-0">
                                        <FileUpload type="video" value={video.video_explicativo_url} onChange={(url) => handleVideoChange(video.originalIndex, 'video_explicativo_url', url)} hideUrlInput compact />
                                        <MediaSelectorPopover
                                          bibliotecaExercicios={bibliotecaExercicios}
                                          selectedValue={video.video_explicativo_url}
                                          compareKey="video_url"
                                          onSelect={(libEx) => handleVideoChange(video.originalIndex, 'video_explicativo_url', libEx.video_url)}
                                        >
                                          <button type="button" className="w-10 h-[42px] rounded-md border border-[#c8921a]/30 bg-white dark:bg-[#111] text-[#c8921a] flex items-center justify-center hover:bg-[#c8921a] hover:text-white transition-all"><LayoutGrid size={18} /></button>
                                        </MediaSelectorPopover>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="lg:col-span-4 space-y-2">
                                  <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-800 dark:text-gray-200 block text-center">Imagem de Capa (Opcional)</label>
                                  <div className="h-[148px] rounded-xl border border-gray-400 dark:border-[#333] bg-gray-100/30 dark:bg-[#111]/30 flex items-center justify-center p-4 shadow-inner overflow-hidden">
                                    <FileUpload 
                                      type="imagem" 
                                      value={video.imagem_capa_url || ''} 
                                      onChange={(url) => handleVideoChange(video.originalIndex, 'imagem_capa_url', url)} 
                                      hideUrlInput 
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-800 dark:text-gray-200">Descrição/Observações do Treino</label>
                                <textarea
                                  value={video.descricao_tecnica || ''}
                                  onChange={(e) => handleVideoChange(video.originalIndex, 'descricao_tecnica', e.target.value)}
                                  placeholder="Ex: Manter as costas retas durante todo o movimento..."
                                  className="w-full min-h-[80px] bg-gray-100 dark:bg-[#111] border border-gray-400 dark:border-[#333] rounded-md px-4 py-2 text-sm focus:border-[#c8921a] outline-none text-gray-900 dark:text-white resize-none"
                                />
                              </div>

                              {/* Informações Técnicas do Exercício Principal */}
                              <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-6 p-6 rounded-xl bg-gray-100/50 dark:bg-[#111]/50 border border-gray-200 dark:border-[#222]">
                                <div className="space-y-2"><label className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#c8921a] ml-0.5 truncate block">Séries</label><input value={video.series || ''} onChange={(e) => handleVideoChange(video.originalIndex, 'series', e.target.value)} placeholder="3" className="w-full bg-white dark:bg-[#0a0a0a] border border-gray-400 dark:border-[#444] rounded-md px-3 sm:px-4 py-2.5 text-sm focus:border-[#c8921a] outline-none text-gray-900 dark:text-white font-bold" /></div>
                                <div className="space-y-2"><label className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#c8921a] ml-0.5 truncate block">Repetições</label><input value={video.repeticoes || ''} onChange={(e) => handleVideoChange(video.originalIndex, 'repeticoes', e.target.value)} placeholder="12-15" className="w-full bg-white dark:bg-[#0a0a0a] border border-gray-400 dark:border-[#444] rounded-md px-3 sm:px-4 py-2.5 text-sm focus:border-[#c8921a] outline-none text-gray-900 dark:text-white font-bold" /></div>
                                <div className="space-y-2"><label className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#c8921a] ml-0.5 truncate block" title="Tempo Descanso">Descanso</label><input value={video.descanso || ''} onChange={(e) => handleVideoChange(video.originalIndex, 'descanso', e.target.value)} placeholder="45s" className="w-full bg-white dark:bg-[#0a0a0a] border border-gray-400 dark:border-[#444] rounded-md px-3 sm:px-4 py-2.5 text-sm focus:border-[#c8921a] outline-none text-gray-900 dark:text-white font-bold" /></div>
                                <div className="space-y-2"><label className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#c8921a] ml-0.5 truncate block">Peso (Kg)</label><input value={video.peso || ''} onChange={(e) => handleVideoChange(video.originalIndex, 'peso', e.target.value)} placeholder="Livre" className="w-full bg-white dark:bg-[#0a0a0a] border border-gray-400 dark:border-[#444] rounded-md px-3 sm:px-4 py-2.5 text-sm focus:border-[#c8921a] outline-none text-gray-900 dark:text-white font-bold" /></div>
                              </div>

                              <div className="flex flex-col gap-6">
                                <div className="flex items-center justify-between border-t border-gray-100 dark:border-[#1a1a1a] pt-6">
                                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#c8921a]">Opções de Substituição</h4>
                                  
                                  {(!video.showSub1 || !video.showSub2) && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (!video.showSub1) handleVideoChange(video.originalIndex, 'showSub1', true as any);
                                        else if (!video.showSub2) handleVideoChange(video.originalIndex, 'showSub2', true as any);
                                      }}
                                      className="px-4 py-1.5 rounded-md bg-[#c8921a]/10 text-[#c8921a] border border-[#c8921a]/30 hover:bg-[#c8921a] hover:text-white text-[9px] font-bold uppercase tracking-widest transition-all"
                                    >
                                      {video.showSub1 ? 'Adicionar 2º Substituto' : 'Adicionar Substituto'}
                                    </button>
                                  )}
                                </div>

                                <div className="space-y-12">
                                  {[1, 2].map((num) => {
                                    const showField = `showSub${num}` as 'showSub1' | 'showSub2';
                                    if (!video[showField]) return null;

                                    const substitutoIdField = `substituto_id_${num}` as keyof VideoTreino;
                                    const infoField = `substituto_${num}_info` as 'substituto_1_info' | 'substituto_2_info';
                                    const selectedId = video[substitutoIdField] as string;
                                    const selectedEx = bibliotecaExercicios.find(ex => ex.id === selectedId);
                                    const info = video[infoField] || {};

                                    return (
                                      <div key={num} className="p-8 rounded-2xl border border-[#c8921a]/30 bg-white dark:bg-[#050505] shadow-sm space-y-8 relative animate-in fade-in slide-in-from-top-4 duration-500">
                                        <div className="absolute -top-3 left-6 px-4 py-1 rounded-full bg-[#c8921a] text-[#2d2106] text-[9px] font-black uppercase tracking-widest shadow-lg">
                                          Exercício Substituto {num}
                                        </div>

                                        <button
                                          type="button"
                                          onClick={() => {
                                            const newVideos = [...formData.videos];
                                            newVideos[video.originalIndex] = {
                                              ...newVideos[video.originalIndex],
                                              [showField]: false,
                                              [substitutoIdField]: '',
                                              [infoField]: null
                                            };
                                            setFormData(prev => ({ ...prev, videos: newVideos }));
                                          }}
                                          className="absolute top-4 right-4 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-full transition-all border border-red-500/20"
                                          title="Remover este substituto"
                                        >
                                          <X size={18} />
                                        </button>

                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                                          <div className="space-y-6">
                                            <div className="space-y-2">
                                              <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-500 ml-0.5">Vídeo de Execução (Substituto)</label>
                                              <MediaSelectorPopover
                                                title="Mídias Privadas"
                                                bibliotecaExercicios={bibliotecaExercicios}
                                                selectedValue={selectedId}
                                                compareKey="id"
                                                onSelect={(libEx) => handleVideoChange(video.originalIndex, substitutoIdField, libEx.id)}
                                                onClear={() => handleVideoChange(video.originalIndex, substitutoIdField, '')}
                                              >
                                                <button type="button" className="w-full h-[46px] px-4 rounded-md border border-gray-400 dark:border-[#333] bg-gray-50 dark:bg-[#111] flex items-center justify-between hover:border-[#c8921a] transition-all group shadow-inner">
                                                  <span className="text-xs text-gray-600 dark:text-gray-300 truncate font-bold">
                                                    {selectedEx ? selectedEx.nome : 'Selecionar da biblioteca...'}
                                                  </span>
                                                  <div className="flex items-center gap-3">
                                                    {selectedEx && <div className="w-6 h-6 rounded bg-black overflow-hidden border border-gray-300"><video src={`${selectedEx.video_url}#t=0.5`} className="w-full h-full object-cover" muted /></div>}
                                                    <LayoutGrid size={16} className="text-gray-400 group-hover:text-[#c8921a]" />
                                                  </div>
                                                </button>
                                              </MediaSelectorPopover>
                                            </div>

                                            <div className="space-y-2">
                                              <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-500 ml-0.5">Vídeo Explicativo (Opcional)</label>
                                              <div className="flex items-center gap-3">
                                                <div className="flex-1 h-[46px] bg-gray-100 dark:bg-[#111] border border-gray-300 dark:border-[#222] rounded-md flex items-center px-4 overflow-hidden shadow-inner">
                                                  <span className="text-xs text-gray-400 truncate font-bold">{info.video_explicativo_url || 'Selecione mídia...'}</span>
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0">
                                                  <FileUpload type="video" value={info.video_explicativo_url || ''} onChange={(url) => handleSubstitutoInfoChange(video.originalIndex, num as 1 | 2, 'video_explicativo_url', url)} hideUrlInput compact />
                                                  <MediaSelectorPopover
                                                    bibliotecaExercicios={bibliotecaExercicios}
                                                    selectedValue={info.video_explicativo_url}
                                                    compareKey="video_url"
                                                    onSelect={(libEx) => handleSubstitutoInfoChange(video.originalIndex, num as 1 | 2, 'video_explicativo_url', libEx.video_url)}
                                                  >
                                                    <button type="button" className="w-[46px] h-[46px] rounded-md border border-[#c8921a]/30 bg-white dark:bg-[#111] text-[#c8921a] flex items-center justify-center hover:bg-[#c8921a] hover:text-white transition-all"><LayoutGrid size={18} /></button>
                                                  </MediaSelectorPopover>
                                                </div>
                                              </div>
                                            </div>

                                            <div className="space-y-2">
                                              <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-500 ml-0.5">Título p/ App</label>
                                              <input
                                                value={selectedEx ? selectedEx.nome : ''}
                                                disabled
                                                className="w-full h-[46px] bg-gray-100 dark:bg-[#111] border border-gray-300 dark:border-[#222] rounded-md px-4 py-2.5 text-xs text-gray-400 font-bold uppercase shadow-inner"
                                                placeholder="Selecione um exercício..."
                                              />
                                            </div>
                                          </div>

                                          <div className="space-y-2">
                                            <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-500 ml-0.5 block text-center">Imagem de Capa do Substituto</label>
                                            <div className="h-[148px] rounded-xl border border-gray-300 dark:border-[#222] bg-gray-50 dark:bg-[#111] flex items-center justify-center p-2 shadow-inner overflow-hidden">
                                              <FileUpload 
                                                type="imagem" 
                                                value={info.imagem_capa_url || ''} 
                                                onChange={(url) => handleSubstitutoInfoChange(video.originalIndex, num as 1 | 2, 'imagem_capa_url', url)} 
                                                compact 
                                                hideUrlInput 
                                              />
                                            </div>
                                          </div>
                                        </div>

                                        <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 p-4 sm:p-6 rounded-xl bg-gray-100/50 dark:bg-[#111]/50 border border-gray-200 dark:border-[#222]">
                                          <div className="space-y-2">
                                            <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#c8921a] ml-0.5 truncate block">Séries</label>
                                            <input 
                                              value={info.series || ''} 
                                              onChange={(e) => handleSubstitutoInfoChange(video.originalIndex, num as 1 | 2, 'series', e.target.value)} 
                                              placeholder="3" 
                                              className="w-full bg-white dark:bg-[#0a0a0a] border border-gray-400 dark:border-[#444] rounded-md px-3 sm:px-4 py-2.5 text-sm focus:border-[#c8921a] outline-none text-gray-900 dark:text-white font-bold" 
                                            />
                                          </div>
                                          <div className="space-y-2">
                                            <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#c8921a] ml-0.5 truncate block">Repetições</label>
                                            <input 
                                              value={info.repeticoes || ''} 
                                              onChange={(e) => handleSubstitutoInfoChange(video.originalIndex, num as 1 | 2, 'repeticoes', e.target.value)} 
                                              placeholder="12-15" 
                                              className="w-full bg-white dark:bg-[#0a0a0a] border border-gray-400 dark:border-[#444] rounded-md px-3 sm:px-4 py-2.5 text-sm focus:border-[#c8921a] outline-none text-gray-900 dark:text-white font-bold" 
                                            />
                                          </div>
                                          <div className="space-y-2">
                                            <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#c8921a] ml-0.5 truncate block" title="Tempo Descanso">Descanso</label>
                                            <input 
                                              value={info.descanso || ''} 
                                              onChange={(e) => handleSubstitutoInfoChange(video.originalIndex, num as 1 | 2, 'descanso', e.target.value)} 
                                              placeholder="45s" 
                                              className="w-full bg-white dark:bg-[#0a0a0a] border border-gray-400 dark:border-[#444] rounded-md px-3 sm:px-4 py-2.5 text-sm focus:border-[#c8921a] outline-none text-gray-900 dark:text-white font-bold" 
                                            />
                                          </div>
                                          <div className="space-y-2">
                                            <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#c8921a] ml-0.5 truncate block">Peso (Kg)</label>
                                            <input 
                                              value={info.peso || ''} 
                                              onChange={(e) => handleSubstitutoInfoChange(video.originalIndex, num as 1 | 2, 'peso', e.target.value)} 
                                              placeholder="Livre" 
                                              className="w-full bg-white dark:bg-[#0a0a0a] border border-gray-400 dark:border-[#444] rounded-md px-3 sm:px-4 py-2.5 text-sm focus:border-[#c8921a] outline-none text-gray-900 dark:text-white font-bold" 
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              <button type="button" onClick={() => handleRemoveVideo(video.originalIndex)} className="absolute top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 flex items-center justify-center p-0 text-red-500 bg-red-50 dark:bg-red-950/30 hover:text-white hover:bg-red-500 rounded-full transition-all shadow-sm"><Trash2 size={16} className="shrink-0" /></button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-[#222] rounded-3xl text-gray-400 animate-in fade-in duration-500">
                  <div className="p-5 rounded-full bg-gray-50 dark:bg-[#111] mb-6">
                    <Video size={40} className="opacity-20 text-[#c8921a]" />
                  </div>
                  <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2">Trilha Vazia</h4>
                  <p className="text-[9px] uppercase font-bold tracking-widest text-gray-400 mb-8 max-w-[280px] text-center leading-relaxed">
                    Esta seção de nível {nivel} ainda não possui conteúdos. Deseja adicionar o primeiro exercício?
                  </p>
                  <button 
                    type="button" 
                    onClick={() => handleAddVideo(nivel)} 
                    className="px-8 py-3 rounded-md bg-[#c8921a]/10 text-[#c8921a] border border-[#c8921a]/30 hover:bg-[#c8921a] hover:text-white text-[9px] font-bold uppercase tracking-widest transition-all flex items-center gap-2"
                  >
                    <Plus size={14} /> Adicionar Primeiro Exercício ({nivel})
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading && !showForm) {
    return (
      <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#c8921a]/20 border-t-[#c8921a] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-10 bg-[#fafafa] dark:bg-[#0a0a0a] min-h-screen">
      <div className="w-full max-w-[1400px] mx-auto space-y-12">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 dark:border-[#222] pb-8 gap-6">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-white dark:bg-[#111] border border-[#c8921a]/20 rounded-xl shadow-sm">
              <LayoutGrid size={32} className="text-[#c8921a]" />
            </div>
            <div>
              <h1 className="text-xl font-light text-gray-400 dark:text-gray-500 tracking-tight uppercase">
                Gestão de <span className="text-gray-800 dark:text-white font-semibold">Modalidades</span>
              </h1>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-[0.2em] mt-1">Configuração de Trilhas de Treinamento</p>
            </div>
          </div>
          
          {!showForm && (
            <button 
              onClick={() => {
                setShowForm(true);
                setEditingId(null);
                setFormData({ 
                  nome: '', 
                  descricao: '', 
                  imagem_url: '', 
                  tem_nivelamento: false, 
                  descricao_iniciante: '',
                  descricao_intermediario: '',
                  descricao_avancado: '',
                  ativo: true, 
                  videos: [] 
                });
                setExpandedSections({ iniciante: true, intermediario: false, avancado: false });
              }}
              className="w-full sm:w-auto px-6 py-2.5 rounded-md bg-[#c8921a] text-[#2d2106] text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-[#c8921a]/20 hover:scale-105 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={14} /> Novo Registro
            </button>
          )}
        </div>

        {showForm ? (
          <div className="animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-4 mb-8">
              <button 
                onClick={() => setShowForm(false)}
                className="p-2 rounded-full bg-white dark:bg-[#111] border border-gray-200 dark:border-[#333] text-gray-400 hover:text-[#c8921a] transition-all shadow-sm"
                title="Voltar para a listagem"
              >
                <ChevronDown size={20} className="rotate-90" />
              </button>
              <div>
                <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-800 dark:text-white">
                  {editingId ? 'Editando Modalidade' : 'Novo Registro de Modalidade'}
                </h2>
                <p className="text-[10px] text-gray-400 uppercase font-medium tracking-widest mt-0.5">Preencha os dados técnicos da trilha abaixo</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-10">
              <div className="bg-white dark:bg-[#0f0f0f] border border-gray-200 dark:border-[#222] rounded-2xl shadow-sm overflow-hidden">
                <div className="p-8 sm:p-12 space-y-12">
                  <div className="border-b border-gray-100 dark:border-[#1a1a1a] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h3 className="text-[11px] font-bold uppercase tracking-[0.3em] text-gray-400 flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#c8921a]"></div>
                      Identidade da Trilha
                    </h3>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-3">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Status Ativo</span>
                        <Switch
                          checked={formData.ativo}
                          onCheckedChange={(v) => setFormData({...formData, ativo: v})}
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Nivelamento</span>
                        <Switch
                          checked={formData.tem_nivelamento}
                          onCheckedChange={(v) => setFormData({...formData, tem_nivelamento: v})}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-7 space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-800 dark:text-gray-200">Nome da Modalidade (Exibido no App)</label>
                          <input
                            value={formData.nome}
                            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                            placeholder="Ex: MUSCULAÇÃO FEMININA"
                            className="w-full bg-gray-100 dark:bg-[#111] border border-gray-400 dark:border-[#444] rounded-md px-4 py-3 text-sm focus:outline-none focus:border-[#c8921a] text-gray-900 dark:text-white font-medium transition-all"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-800 dark:text-gray-200">Ordem de Exibição (Numérico)</label>
                          <input
                            type="number"
                            value={formData.ordem_modalidade}
                            onChange={(e) => setFormData({ ...formData, ordem_modalidade: parseInt(e.target.value) || 0 })}
                            placeholder="Ex: 1"
                            className="w-full bg-gray-100 dark:bg-[#111] border border-gray-400 dark:border-[#444] rounded-md px-4 py-3 text-sm focus:outline-none focus:border-[#c8921a] text-gray-900 dark:text-white font-medium transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-800 dark:text-gray-200">Subtítulo do Card (Exibido no App)</label>
                        <input
                          value={formData.subtitulo}
                          onChange={(e) => setFormData({ ...formData, subtitulo: e.target.value })}
                          placeholder="Ex: Ajuste seu nível de treinamento"
                          className="w-full bg-gray-100 dark:bg-[#111] border border-gray-400 dark:border-[#444] rounded-md px-4 py-3 text-sm focus:outline-none focus:border-[#c8921a] text-gray-900 dark:text-white font-medium transition-all"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-800 dark:text-gray-200">Descrição Técnica</label>
                        <textarea
                          value={formData.descricao}
                          onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                          placeholder="Descreva o propósito e os benefícios desta trilha..."
                          className="w-full min-h-[120px] bg-gray-100 dark:bg-[#111] border border-gray-400 dark:border-[#444] rounded-md px-4 py-3 text-sm focus:outline-none focus:border-[#c8921a] text-gray-800 dark:text-gray-200 resize-none font-normal leading-relaxed transition-all"
                        />
                      </div>
                    </div>

                    <div className="lg:col-span-5 space-y-4">
                      <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-800 dark:text-gray-200 block text-center">Banner de Topo (App Mobile)</label>
                      <div className="p-4 rounded-xl border border-gray-400 dark:border-[#444] bg-gray-100/30 dark:bg-[#0a0a0a] shadow-inner min-h-[160px] flex items-center justify-center">
                        <FileUpload
                          type="imagem"
                          value={formData.imagem_url}
                          onChange={(url) => setFormData({ ...formData, imagem_url: url })}
                          hideUrlInput
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botão de Conteúdo Geral APENAS quando NÃO tem nivelamento */}
              {!formData.tem_nivelamento && formData.videos.length === 0 && (
                <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-[#222] rounded-3xl text-gray-400 bg-white dark:bg-[#0f0f0f] animate-in fade-in duration-500">
                  <div className="p-5 rounded-full bg-gray-50 dark:bg-[#111] mb-6">
                    <Video size={40} className="opacity-20 text-[#c8921a]" />
                  </div>
                  <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2">Trilha Geral não Iniciada</h4>
                  <p className="text-[9px] uppercase font-bold tracking-widest text-gray-400 mb-8 max-w-[280px] text-center leading-relaxed">
                    Esta modalidade está configurada como trilha única. Deseja adicionar o primeiro conteúdo?
                  </p>
                  <button 
                    type="button" 
                    onClick={() => handleAddVideo('iniciante')} 
                    className="px-8 py-3 rounded-md bg-[#c8921a] text-[#2d2106] text-[9px] font-black uppercase tracking-[0.2em] shadow-lg shadow-[#c8921a]/10 hover:scale-105 transition-all flex items-center gap-2"
                  >
                    <Plus size={14} /> Criar Primeiro Conteúdo
                  </button>
                </div>
              )}

              {renderVideoSection('iniciante', 'Trilha Nível Iniciante', 'bg-emerald-500')}
              {renderVideoSection('intermediario', 'Trilha Nível Intermediário', 'bg-[#c8921a]')}
              {renderVideoSection('avancado', 'Trilha Nível Avançado', 'bg-red-500')}

              {/* Botões de Ação Fixos no Rodapé durante Edição */}
              <div className="fixed bottom-0 left-0 right-0 sm:left-64 bg-white/80 dark:bg-black/80 backdrop-blur-md border-t border-gray-200 dark:border-[#222] p-4 z-[100] flex gap-4 justify-end shadow-2xl">
                <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 rounded-md border border-gray-300 dark:border-[#333] text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:bg-gray-50 transition-all bg-white dark:bg-black">Cancelar</button>
                <button type="submit" disabled={saving} className="px-10 py-2.5 rounded-md bg-[#c8921a] text-[#2d2106] text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-[#c8921a]/20 hover:scale-105 transition-all disabled:opacity-50 flex items-center gap-2">
                  {saving ? (<><div className="w-3 h-3 border-2 border-[#2d2106]/20 border-t-[#2d2106] rounded-full animate-spin"></div> Sincronizando...</>) : (<><Save size={14} /> {editingId ? 'Salvar Alterações' : 'Confirmar Registro'}</>)}
                </button>
              </div>
              
              {/* Espaçador para o rodapé fixo não cobrir o conteúdo */}
              <div className="h-24"></div>
            </form>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {modalidades.map((mod) => (
              <div key={mod.id} className="item-card group overflow-hidden border border-[#c8921a]/20">
                <div className="h-44 relative bg-black">
                  {mod.imagem_url ? (
                    <img src={mod.imagem_url} alt={mod.nome} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-900"><LayoutGrid size={40} className="text-gray-800" /></div>
                  )}
                  <div className="absolute top-4 left-4 z-10 flex gap-2">
                    <span className={`px-2.5 py-1 rounded text-[8px] font-black uppercase tracking-widest shadow-lg ${mod.ativo ? 'bg-emerald-500 text-white' : 'bg-gray-500 text-white'}`}>{mod.ativo ? 'Ativo' : 'Offline'}</span>
                    {mod.tem_nivelamento && (<span className="px-2.5 py-1 rounded bg-blue-500 text-white text-[8px] font-black uppercase tracking-widest shadow-lg">Trilha</span>)}
                  </div>
                  <div className="absolute top-4 right-4 z-10"><div className="bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg flex items-center gap-2 text-white shadow-xl"><Video size={12} className="text-[#c8921a]" /><span className="text-[10px] font-black">{mod.treinos?.length || 0}</span></div></div>
                </div>
                <div className="p-6 flex flex-col gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-tight group-hover:text-[#c8921a] transition-colors">{mod.nome}</h3>
                    <p className="text-xs text-gray-500 line-clamp-2 mt-2 leading-relaxed">{mod.descricao || 'Sem descrição técnica disponível para esta modalidade.'}</p>
                  </div>
                  <div className="flex gap-2 pt-2 border-t border-gray-50 dark:border-[#1a1a1a]">
                    <button onClick={() => handleEdit(mod)} className="flex-1 py-2 rounded-md bg-gray-100 dark:bg-[#111] text-gray-700 dark:text-gray-300 text-[9px] font-bold uppercase tracking-widest hover:bg-[#c8921a] hover:text-white transition-all flex items-center justify-center gap-2"><Edit3 size={12} /> Editar</button>
                    <button onClick={() => handleDelete(mod)} className="p-2 w-10 flex items-center justify-center rounded-md bg-red-50 dark:bg-red-950/20 text-red-500 hover:bg-red-500 hover:text-white transition-all"><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            ))}
            {modalidades.length === 0 && (
              <div className="col-span-full py-32 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-[#222] rounded-3xl">
                <LayoutGrid size={48} className="text-gray-200 dark:text-gray-800 mb-6" /><h3 className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-[0.2em] text-xs">Nenhuma Modalidade Encontrada</h3><p className="text-gray-400 dark:text-gray-500 text-[10px] mt-2 mb-8 uppercase tracking-widest">Inicie o planejamento da sua primeira trilha corporativa</p><button onClick={() => setShowForm(true)} className="px-8 py-3 rounded-full bg-[#c8921a] text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-[#c8921a]/20 hover:scale-105 transition-all">Criar Primeiro Registro</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
