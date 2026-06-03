'use client';

import { useState, useEffect } from 'react';
import { BaseModal } from '@/components/admin/BaseModal';
import { DataTable } from '@/components/admin/DataTable';
import { FileUpload } from '@/components/admin/FileUpload';
import { api } from '@/lib/api';
import { getMediaUrl } from '@/lib/media';
import { Plus, Edit3, Trash2, Video, Search, X } from 'lucide-react';
import { useConfirm } from '@/contexts/ConfirmContext';
import { toast } from 'react-hot-toast';
import '@/app/admin/data-table.css';

interface Exercicio {
  id: string;
  nome: string;
  descricao?: string;
  video_url: string;
  imagem_url?: string;
  categoria?: string; // grupo_muscular
  equipamento?: string;
}

interface ExerciciosModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExercicioChange?: () => void;
}

export function ExerciciosModal({
  open,
  onOpenChange,
  onExercicioChange,
}: ExerciciosModalProps) {
  const [exercicios, setExercicios] = useState<Exercicio[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [searchText, setSearchText] = useState('');
  const confirm = useConfirm();
  
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    video_url: '',
    categoria: '',
    equipamento: '',
  });

  const loadExercicios = async () => {
    try {
      setLoading(true);
      const response = await api.getExerciciosBiblioteca({ limit: 1000 });
      setExercicios(response.items || response || []);
    } catch (err: any) {
      console.error('Erro ao carregar exercícios:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCategorias = async () => {
    try {
      const data = await api.getExerciciosCategorias();
      setCategorias(data || []);
    } catch (err) {
      console.error('Erro ao carregar categorias de exercícios:', err);
    }
  };

  useEffect(() => {
    if (open) {
      loadExercicios();
      loadCategorias();
      setShowForm(false);
      setEditingId(null);
      resetForm();
    }
  }, [open]);

  const resetForm = () => {
    setFormData({
      nome: '',
      descricao: '',
      video_url: '',
      categoria: '',
      equipamento: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome.trim() || !formData.video_url.trim()) {
      toast.error('Nome e Vídeo são obrigatórios');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        id: editingId || undefined,
      };

      await api.createExercicioBiblioteca(payload);
      toast.success(editingId ? 'Exercício atualizado' : 'Exercício criado');
      
      setShowForm(false);
      setEditingId(null);
      resetForm();
      await loadExercicios();
      if (onExercicioChange) onExercicioChange();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar exercício');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, nome: string) => {
    if (!(await confirm(`Excluir exercício "${nome}"?`))) return;
    try {
      await api.deleteExercicioBiblioteca(id);
      toast.success('Exercício removido');
      await loadExercicios();
      if (onExercicioChange) onExercicioChange();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao excluir exercício');
    }
  };

  const handleEdit = (ex: Exercicio) => {
    setEditingId(ex.id);
    setFormData({
      nome: ex.nome,
      descricao: ex.descricao || '',
      video_url: ex.video_url,
      categoria: ex.categoria || '',
      equipamento: ex.equipamento || '',
    });
    setShowForm(true);
  };

  const filteredExercicios = exercicios.filter(ex => 
    ex.nome.toLowerCase().includes(searchText.toLowerCase()) ||
    (ex.categoria && ex.categoria.toLowerCase().includes(searchText.toLowerCase()))
  );

  const columns = [
    { 
      header: 'Exercício', 
      accessor: 'nome', 
      render: (ex: Exercicio) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-black flex items-center justify-center overflow-hidden border border-gray-200 dark:border-[#222]">
            {ex.video_url ? (
              <video src={`${getMediaUrl(ex.video_url)}#t=0.5`} className="w-full h-full object-cover" muted playsInline />
            ) : (
              <Video size={14} className="text-gray-500" />
            )}
          </div>
          <div>
            <div className="font-bold text-[11px] uppercase tracking-tight text-gray-800 dark:text-white">{ex.nome}</div>
            <div className="text-[9px] text-gray-400 font-medium uppercase tracking-widest">{ex.categoria || 'Geral'}</div>
          </div>
        </div>
      )
    },
    { 
      header: 'Equipamento', 
      accessor: 'equipamento', 
      render: (ex: Exercicio) => (
        <span className="text-[10px] font-medium text-gray-500 uppercase tracking-tighter">{ex.equipamento || '-'}</span>
      )
    },
    { 
      header: 'Ações', 
      accessor: 'actions', 
      render: (ex: Exercicio) => (
        <div className="flex items-center gap-3">
          <button onClick={() => handleEdit(ex)} className="action-icon-edit"><Edit3 size={14} /></button>
          <button onClick={() => handleDelete(ex.id, ex.nome)} className="action-icon-delete"><Trash2 size={14} /></button>
        </div>
      )
    },
  ];

  return (
    <BaseModal
      open={open}
      onOpenChange={onOpenChange}
      title="Biblioteca de Exercícios"
      description="Gerencie os exercícios disponíveis para os treinos"
      icon="bx bx-dumbbell"
      maxWidth="5xl"
      headerAction={
        <button
          onClick={() => { setShowForm(true); setEditingId(null); resetForm(); }}
          className="px-4 py-2 rounded-md border border-[#c8921a] text-[#c8921a] text-[10px] font-semibold uppercase tracking-widest hover:bg-[#c8921a] hover:text-white transition-all duration-300 flex items-center gap-2"
        >
          <Plus size={14} /> Novo Exercício
        </button>
      }
    >
      <div className="space-y-6">
        {showForm && (
          <div className="p-8 rounded-xl border border-gray-300 dark:border-[#333] bg-white dark:bg-[#0a0a0a] shadow-sm animate-in fade-in slide-in-from-top-2 duration-300 mb-6">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100 dark:border-[#1a1a1a]">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-800 dark:text-gray-200">
                {editingId ? 'Editar Exercício' : 'Cadastro de Exercício'}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                <X size={16} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-800 dark:text-gray-200 ml-0.5">Nome do Exercício</label>
                    <input 
                      value={formData.nome} 
                      onChange={(e) => setFormData({...formData, nome: e.target.value})} 
                      placeholder="Ex: SUPINO RETO COM BARRA"
                      className="w-full bg-gray-50/80 dark:bg-[#111] border border-gray-400 dark:border-[#444] rounded-md px-4 py-2 text-sm focus:outline-none focus:border-[#c8921a] text-gray-900 dark:text-white font-medium transition-all"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-800 dark:text-gray-200 ml-0.5">Grupo Muscular</label>
                      <select 
                        value={formData.categoria} 
                        onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                        className="w-full bg-gray-50/80 dark:bg-[#111] border border-gray-400 dark:border-[#444] rounded-md px-4 py-2 text-sm focus:outline-none focus:border-[#c8921a] text-gray-900 dark:text-white font-medium transition-all"
                      >
                        <option value="">Selecione...</option>
                        {categorias.map(cat => (
                          <option key={cat.id} value={cat.nome}>{cat.nome}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-800 dark:text-gray-200 ml-0.5">Equipamento</label>
                      <input 
                        value={formData.equipamento} 
                        onChange={(e) => setFormData({...formData, equipamento: e.target.value})} 
                        placeholder="Ex: BARRA, HALTERES"
                        className="w-full bg-gray-50/80 dark:bg-[#111] border border-gray-400 dark:border-[#444] rounded-md px-4 py-2 text-sm focus:outline-none focus:border-[#c8921a] text-gray-900 dark:text-white font-medium transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-800 dark:text-gray-200 ml-0.5">Instruções / Descrição</label>
                    <textarea 
                      value={formData.descricao} 
                      onChange={(e) => setFormData({...formData, descricao: e.target.value})} 
                      placeholder="Descreva a execução correta do exercício..."
                      className="w-full min-h-[100px] bg-gray-50/80 dark:bg-[#111] border border-gray-400 dark:border-[#444] rounded-md px-4 py-3 text-sm focus:outline-none focus:border-[#c8921a] text-gray-800 dark:text-gray-200 resize-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="p-6 rounded-xl border border-gray-400 dark:border-[#444] bg-gray-50/50 dark:bg-[#111] flex flex-col items-center justify-center min-h-[200px]">
                    <FileUpload 
                      type="video" 
                      value={formData.video_url} 
                      onChange={(url) => setFormData({...formData, video_url: url})} 
                    />
                    {!formData.video_url && (
                      <p className="mt-4 text-[9px] text-gray-500 text-center px-4 font-bold uppercase tracking-widest">Vídeo de Demonstração (Obrigatório)</p>
                    )}
                  </div>

                  <div className="p-4 bg-[#c8921a]/5 border border-[#c8921a]/20 rounded-lg">
                    <p className="text-[9px] text-[#c8921a] font-bold uppercase tracking-widest leading-relaxed">
                      💡 Você pode fazer o upload de um novo vídeo ou colar a URL de um vídeo existente da biblioteca.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-6 justify-end items-center border-t border-gray-100 dark:border-[#1a1a1a]">
                <button 
                  type="button" 
                  onClick={() => setShowForm(false)} 
                  className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-red-500 transition-colors px-4 py-2"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={saving} 
                  className="px-8 py-2.5 rounded-md bg-[#c8921a] text-white text-[10px] font-bold uppercase tracking-widest shadow-md hover:bg-[#b88217] transition-all disabled:opacity-50"
                >
                  {saving ? 'SALVANDO...' : 'Salvar Exercício'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            value={searchText} 
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="BUSCAR NA BIBLIOTECA..."
            className="w-full pl-10 pr-4 py-2 bg-transparent border border-gray-300 dark:border-[#333] rounded-md text-xs focus:outline-none focus:border-[#c8921a] uppercase tracking-widest"
          />
        </div>

        <div className="data-table-container">
          <DataTable 
            columns={columns} 
            data={filteredExercicios} 
            keyExtractor={(e) => e.id} 
            loading={loading}
          />
        </div>
      </div>
    </BaseModal>
  );
}
