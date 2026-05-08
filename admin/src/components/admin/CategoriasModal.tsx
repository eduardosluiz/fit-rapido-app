'use client';

import { useState, useEffect } from 'react';
import { BaseModal } from '@/components/admin/BaseModal';
import { DataTable } from '@/components/admin/DataTable';
import { Switch } from '@/components/ui/switch';
import { FileUpload } from '@/components/admin/FileUpload';
import { api } from '@/lib/api';
import { Plus, Edit3, Trash2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import '@/app/admin/data-table.css';

interface Categoria {
  id: string;
  nome: string;
  slug: string;
  descricao?: string;
  imagem_url?: string;
  ativa: boolean;
}

interface CategoriasModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'receitas' | 'treinos';
  onCategoriaChange?: () => void;
}

export function CategoriasModal({
  open,
  onOpenChange,
  type,
  onCategoriaChange,
}: CategoriasModalProps) {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    slug: '',
    descricao: '',
    imagem_url: '',
    ativa: true,
  });

  const loadCategorias = async () => {
    try {
      setLoading(true);
      const data =
        type === 'receitas'
          ? await api.getCategorias()
          : await api.getCategoriasTreinos();
      setCategorias(data);
    } catch (err: any) {
      console.error('Erro ao carregar categorias:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadCategorias();
      setShowForm(false);
      setEditingId(null);
      setFormData({ nome: '', slug: '', descricao: '', imagem_url: '', ativa: true });
    }
  }, [open, type]);

  const generateSlug = (nome: string) => {
    return nome
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleNomeChange = (nome: string) => {
    setFormData({
      ...formData,
      nome,
      slug: editingId ? formData.slug : generateSlug(nome),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome.trim()) return;

    setSaving(true);
    try {
      if (editingId) {
        if (type === 'receitas') await api.updateReceita(editingId, formData); // Nota: ajuste na API para categoria se necessário
        else await api.updateCategoriaTreino(editingId, formData);
        toast.success('Categoria atualizada');
      } else {
        if (type === 'receitas') await api.createCategoria(formData);
        else await api.createCategoriaTreino(formData);
        toast.success('Categoria criada');
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({ nome: '', slug: '', descricao: '', imagem_url: '', ativa: true });
      await loadCategorias();
      if (onCategoriaChange) onCategoriaChange();
    } catch (err: any) {
      toast.error('Erro ao salvar categoria');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, nome: string) => {
    if (!confirm(`Excluir categoria "${nome}"?`)) return;
    try {
      if (type === 'receitas') await api.deleteCategoria(id);
      else await api.deleteCategoriaTreino(id);
      toast.success('Categoria removida');
      await loadCategorias();
      if (onCategoriaChange) onCategoriaChange();
    } catch (err: any) {
      toast.error('Erro ao remover');
    }
  };

  const handleEdit = (cat: Categoria) => {
    setEditingId(cat.id);
    setFormData({
      nome: cat.nome,
      slug: cat.slug,
      descricao: cat.descricao || '',
      imagem_url: cat.imagem_url || '',
      ativa: cat.ativa,
    });
    setShowForm(true);
  };

  const columns = [
    { 
      header: 'Identidade', 
      accessor: 'nome', 
      render: (cat: Categoria) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-[#222] overflow-hidden flex items-center justify-center">
            {cat.imagem_url ? (
              <img src={cat.imagem_url} alt={cat.nome} className="w-full h-full object-cover" />
            ) : (
              <ImageIcon size={14} className="text-gray-300" />
            )}
          </div>
          <div className="font-elegant">{cat.nome}</div>
        </div>
      )
    },
    { 
      header: 'Slug', 
      accessor: 'slug', 
      render: (cat: Categoria) => (
        <span className="text-[11px] font-medium text-gray-500 uppercase tracking-tighter">{cat.slug}</span>
      )
    },
    { 
      header: 'Status', 
      accessor: 'ativa', 
      render: (cat: Categoria) => (
        <span className={`badge-slim ${cat.ativa ? 'text-emerald-600' : 'text-gray-300'}`}>
          {cat.ativa ? 'Ativo' : 'Off'}
        </span>
      )
    },
    { 
      header: 'Ações', 
      accessor: 'actions', 
      render: (cat: Categoria) => (
        <div className="flex items-center gap-3">
          <button onClick={() => handleEdit(cat)} className="action-icon-edit"><Edit3 size={14} /></button>
          <button onClick={() => handleDelete(cat.id, cat.nome)} className="action-icon-delete"><Trash2 size={14} /></button>
        </div>
      )
    },
  ];

  return (
    <BaseModal
      open={open}
      onOpenChange={onOpenChange}
      title="Categorias"
      description={`Gerenciar trilhas de ${type}`}
      icon="bx bx-folder"
      maxWidth="4xl"
      headerAction={
        <button
          onClick={() => { setShowForm(true); setEditingId(null); setFormData({ nome: '', slug: '', descricao: '', imagem_url: '', ativa: true }); }}
          className="px-4 py-2 rounded-md border border-[#c8921a] text-[#c8921a] text-[10px] font-semibold uppercase tracking-widest hover:bg-[#c8921a] hover:text-white transition-all duration-300 flex items-center gap-2"
        >
          <Plus size={14} /> Nova Categoria
        </button>
      }
    >
      <div className="space-y-8">
        {showForm && (
          <div className="p-10 rounded-xl border border-gray-300 dark:border-[#333] bg-white dark:bg-[#0a0a0a] shadow-sm animate-in fade-in slide-in-from-top-2 duration-300 mb-10">
            <div className="flex items-center justify-between mb-10 pb-6 border-b border-gray-100 dark:border-[#1a1a1a]">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-800 dark:text-gray-200">
                {editingId ? 'Editar Categoria' : 'Registro de Nova Categoria'}
              </h3>
              <div className="flex items-center gap-6">
                <span className="text-[9px] font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300">Status</span>
                <Switch 
                  checked={formData.ativa} 
                  onCheckedChange={(v) => setFormData({...formData, ativa: v})} 
                  className="data-[state=unchecked]:bg-gray-300 border border-gray-400 shadow-sm"
                />
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-7 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-800 dark:text-gray-200 ml-0.5">Nome Oficial</label>
                      <input 
                        value={formData.nome} 
                        onChange={(e) => handleNomeChange(e.target.value)} 
                        placeholder="Ex: CAFÉ DA MANHÃ"
                        className="w-full bg-gray-50/80 dark:bg-[#111] border border-gray-300 dark:border-[#444] rounded-md px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c8921a]/20 focus:border-[#c8921a] text-gray-900 dark:text-white font-medium transition-all placeholder:text-gray-500"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-800 dark:text-gray-200 ml-0.5">Slug Identificador</label>
                      <input 
                        value={formData.slug} 
                        onChange={(e) => setFormData({...formData, slug: e.target.value})} 
                        placeholder="cafe-da-manha"
                        className="w-full bg-gray-50/80 dark:bg-[#111] border border-gray-300 dark:border-[#444] rounded-md px-4 py-2.5 text-[12px] focus:outline-none focus:ring-2 focus:ring-[#c8921a]/20 focus:border-[#c8921a] text-gray-700 dark:text-gray-300 transition-all placeholder:text-gray-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-800 dark:text-gray-200 ml-0.5">Descrição Editorial</label>
                    <textarea 
                      value={formData.descricao} 
                      onChange={(e) => setFormData({...formData, descricao: e.target.value})} 
                      placeholder="Breve descrição sobre o propósito desta categoria no sistema..."
                      className="w-full min-h-[120px] bg-gray-50/80 dark:bg-[#111] border border-gray-300 dark:border-[#444] rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#c8921a]/20 focus:border-[#c8921a] text-gray-800 dark:text-gray-200 resize-none font-normal leading-relaxed transition-all placeholder:text-gray-500"
                    />
                  </div>
                </div>

                <div className="lg:col-span-5 flex flex-col border-l border-gray-200 dark:border-[#333] pl-12">
                  <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-800 dark:text-gray-200 block mb-6 text-center w-full">Ícone de Representação</label>
                  <div className="p-6 rounded-xl border border-gray-300 dark:border-[#444] bg-gray-50/50 dark:bg-[#111] w-full flex flex-col items-center justify-center min-h-[220px] shadow-inner">
                    <FileUpload 
                      type="imagem" 
                      value={formData.imagem_url} 
                      onChange={(url) => setFormData({...formData, imagem_url: url})} 
                      hideUrlInput
                    />
                    {!formData.imagem_url && (
                      <p className="mt-4 text-[10px] text-gray-500 dark:text-gray-400 text-center px-4 font-medium italic">Selecione um ícone ou imagem quadrada (1:1)</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-6 pt-10 justify-end items-center border-t border-gray-200 dark:border-[#333]">
                <button 
                  type="button" 
                  onClick={() => setShowForm(false)} 
                  className="text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-red-600 transition-colors px-6 py-2 border border-transparent hover:border-red-200 rounded-md"
                >
                  Descartar
                </button>
                <button 
                  type="submit" 
                  disabled={saving} 
                  className="px-12 py-3 rounded-md bg-[#c8921a] text-[#2d2106] text-[10px] font-bold uppercase tracking-widest shadow-md hover:shadow-lg hover:bg-[#b88217] transition-all disabled:opacity-50 active:scale-95"
                >
                  {saving ? 'Sincronizando...' : 'Confirmar Categoria'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="data-table-container">
          <DataTable 
            columns={columns} 
            data={categorias} 
            keyExtractor={(c) => c.id} 
            loading={loading}
          />
        </div>
      </div>
    </BaseModal>
  );
}
