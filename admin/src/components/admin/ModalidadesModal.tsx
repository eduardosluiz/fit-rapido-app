'use client';

import { useState, useEffect } from 'react';
import { BaseModal } from '@/components/admin/BaseModal';
import { DataTable } from '@/components/admin/DataTable';
import { Switch } from '@/components/ui/switch';
import { api } from '@/lib/api';
import { Plus, Edit3, Trash2, Image as ImageIcon } from 'lucide-react';
import { FileUpload } from './FileUpload';
import { toast } from 'react-hot-toast';
import '@/app/admin/data-table.css';

interface Modalidade {
  id: string;
  nome: string;
  descricao?: string;
  imagem_url?: string;
  tem_nivelamento: boolean;
  ativo: boolean;
}

interface ModalidadesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onModalidadeChange?: () => void;
}

export function ModalidadesModal({
  open,
  onOpenChange,
  onModalidadeChange,
}: ModalidadesModalProps) {
  const [modalidades, setModalidades] = useState<Modalidade[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    imagem_url: '',
    tem_nivelamento: false,
    ativo: true,
  });
  const loadModalidades = async () => {
    try {
      setLoading(true);
      const data = await api.getModalidadesTreinos();
      setModalidades(data);
    } catch (err: any) {
      console.error('Erro ao carregar modalidades:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadModalidades();
      setShowForm(false);
      setEditingId(null);
      setFormData({ nome: '', descricao: '', imagem_url: '', tem_nivelamento: false, ativo: true });
    }
  }, [open]);


  const handleNomeChange = (nome: string) => {
    setFormData({
      ...formData,
      nome,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome.trim()) return;

    setSaving(true);
    try {
      if (editingId) {
        await api.updateModalidadeTreino(editingId, formData);
        toast.success('Modalidade atualizada');
      } else {
        await api.createModalidadeTreino(formData);
        toast.success('Modalidade criada');
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({ nome: '', descricao: '', imagem_url: '', tem_nivelamento: false, ativo: true });
      await loadModalidades();
      if (onModalidadeChange) onModalidadeChange();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar modalidade');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, nome: string) => {
    if (!confirm(`Excluir modalidade "${nome}"?`)) return;
    try {
      await api.deleteModalidadeTreino(id);
      toast.success('Modalidade removida');
      await loadModalidades();
      if (onModalidadeChange) onModalidadeChange();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao excluir modalidade');
    }
  };

  const handleEdit = (mod: Modalidade) => {
    setEditingId(mod.id);
    setFormData({
      nome: mod.nome,
      descricao: mod.descricao || '',
      imagem_url: mod.imagem_url || '',
      tem_nivelamento: mod.tem_nivelamento || false,
      ativo: mod.ativo,
    });
    setShowForm(true);
  };

  const columns = [
    { 
      header: 'Identidade', 
      accessor: 'nome', 
      render: (mod: Modalidade) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-[#111] border border-gray-100 dark:border-[#222] overflow-hidden flex items-center justify-center">
            {mod?.imagem_url ? (
              <img 
                src={mod.imagem_url} 
                alt={mod.nome || 'Modalidade'} 
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <ImageIcon size={14} className="text-gray-300" />
            )}
          </div>
          <div className="font-elegant">{mod?.nome || 'Sem Nome'}</div>
        </div>
      )
    },
    { 
      header: 'Nivelamento', 
      accessor: 'tem_nivelamento', 
      render: (mod: Modalidade) => (
        <span className={`badge-slim ${mod.tem_nivelamento ? 'text-blue-500' : 'text-gray-300'}`}>
          {mod.tem_nivelamento ? 'Sim' : 'Não'}
        </span>
      )
    },
    { 
      header: 'Status', 
      accessor: 'ativo', 
      render: (mod: Modalidade) => (
        <span className={`badge-slim ${mod.ativo ? 'text-emerald-600' : 'text-gray-300'}`}>
          {mod.ativo ? 'Ativo' : 'Off'}
        </span>
      )
    },
    { 
      header: 'Ações', 
      accessor: 'actions', 
      render: (mod: Modalidade) => (
        <div className="flex items-center gap-3">
          <button onClick={() => handleEdit(mod)} className="action-icon-edit"><Edit3 size={14} /></button>
          <button onClick={() => handleDelete(mod.id, mod.nome)} className="action-icon-delete"><Trash2 size={14} /></button>
        </div>
      )
    },
  ];

  return (
    <BaseModal
      open={open}
      onOpenChange={onOpenChange}
      title="Modalidades"
      description="Gerenciamento de trilhas de treinamento"
      icon="bx bx-category"
      maxWidth="4xl"
      headerAction={
        <button
          onClick={() => { setShowForm(true); setEditingId(null); setFormData({ nome: '', slug: '', descricao: '', imagem_url: '', tem_nivelamento: false, ativo: true }); }}
          className="px-4 py-2 rounded-md border border-[#c8921a] text-[#c8921a] text-[10px] font-semibold uppercase tracking-widest hover:bg-[#c8921a] hover:text-white transition-all duration-300 flex items-center gap-2"
        >
          <Plus size={14} /> Novo Registro
        </button>
      }
    >
      <div className="space-y-8">
        {showForm && (
          <div className="p-10 rounded-xl border border-gray-300 dark:border-[#333] bg-white dark:bg-[#0a0a0a] shadow-sm animate-in fade-in slide-in-from-top-2 duration-300 mb-10">
            <div className="flex items-center justify-between mb-10 pb-6 border-b border-gray-100 dark:border-[#1a1a1a]">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-800 dark:text-gray-200">
                {editingId ? 'Editar Modalidade' : 'Ficha de Registro Corporativo'}
              </h3>
              <div className="flex items-center gap-6">
                <span className="text-[9px] font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300">Ativar</span>
                <Switch
                  checked={formData.ativo}
                  onCheckedChange={(v) => setFormData({...formData, ativo: v})}
                  className="data-[state=unchecked]:bg-gray-300 border border-gray-400 shadow-sm"
                />
              </div>            </div>
            
            <form onSubmit={handleSubmit} className="space-y-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-7 space-y-8">
                  <div className="grid grid-cols-1 gap-8">
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-800 dark:text-gray-200 ml-0.5">Nome Oficial</label>
                      <input 
                        value={formData.nome} 
                        onChange={(e) => handleNomeChange(e.target.value)} 
                        placeholder="Ex: MUSCULAÇÃO"
                        className="w-full bg-gray-50/80 dark:bg-[#111] border border-gray-300 dark:border-[#444] rounded-md px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c8921a]/20 focus:border-[#c8921a] text-gray-900 dark:text-white font-medium transition-all placeholder:text-gray-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-800 dark:text-gray-200 ml-0.5">Descrição Técnica</label>
                    <textarea 
                      value={formData.descricao} 
                      onChange={(e) => setFormData({...formData, descricao: e.target.value})} 
                      placeholder="Propósito e objetivos estratégicos desta trilha..."
                      className="w-full min-h-[120px] bg-gray-50/80 dark:bg-[#111] border border-gray-300 dark:border-[#444] rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#c8921a]/20 focus:border-[#c8921a] text-gray-800 dark:text-gray-200 resize-none font-normal leading-relaxed transition-all placeholder:text-gray-500"
                    />
                  </div>

                  <div className="flex items-center justify-between p-6 rounded-xl border border-gray-300 dark:border-[#333] bg-gray-50 dark:bg-[#0f0f0f] shadow-sm">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-800 dark:text-gray-200">Trilha de Nivelamento</p>
                      <p className="text-[9px] text-gray-600 dark:text-gray-400 font-medium">Segmentação por Iniciante, Médio e Avançado</p>
                    </div>
                    <Switch 
                      checked={formData.tem_nivelamento} 
                      onCheckedChange={(v) => setFormData({...formData, tem_nivelamento: v})} 
                      className="data-[state=unchecked]:bg-gray-300 border border-gray-400 shadow-sm"
                    />
                  </div>
                </div>

                <div className="lg:col-span-5 flex flex-col border-l border-gray-200 dark:border-[#333] pl-12">
                  <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-800 dark:text-gray-200 block mb-6 text-center w-full">Capa Corporativa (Branding)</label>
                  <div className="p-6 rounded-xl border border-gray-300 dark:border-[#444] bg-gray-50/50 dark:bg-[#111] w-full flex flex-col items-center justify-center min-h-[220px] shadow-inner">
                    <FileUpload 
                      type="imagem" 
                      value={formData.imagem_url} 
                      onChange={(url) => setFormData({...formData, imagem_url: url})} 
                      hideUrlInput
                    />
                    {!formData.imagem_url && (
                      <p className="mt-4 text-[10px] text-gray-500 dark:text-gray-400 text-center px-4 font-medium italic">Selecione uma imagem de alta resolução para representar a modalidade</p>
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
                  Descartar Alterações
                </button>
                <button 
                  type="submit" 
                  disabled={saving} 
                  className="px-12 py-3 rounded-md bg-[#c8921a] text-[#2d2106] text-[10px] font-bold uppercase tracking-widest shadow-md hover:shadow-lg hover:bg-[#b88217] transition-all disabled:opacity-50 active:scale-95"
                >
                  {saving ? 'PROCESSANDO...' : 'Confirmar Registro'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="data-table-container">
          <DataTable 
            columns={columns} 
            data={modalidades} 
            keyExtractor={(m) => m.id} 
            loading={loading}
          />
        </div>
      </div>
    </BaseModal>
  );
}
