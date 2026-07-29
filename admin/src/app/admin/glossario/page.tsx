'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/useAuth';
import { DataTable } from '@/components/admin/DataTable';
import { Button as AdminButton } from '@/components/admin/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Search, BookOpen, Edit3, Trash2, Loader2 } from 'lucide-react';
import { useConfirm } from '@/contexts/ConfirmContext';
import { toast } from 'react-hot-toast';
import '@/app/admin/data-table.css';

interface GlossarioItem {
  id: string;
  nome: string;
  descricao: string;
  created_at: string;
}

export default function GlossarioPage() {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<GlossarioItem[]>([]);
  const [itemsFiltrados, setItemsFiltrados] = useState<GlossarioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    nome: '', descricao: '',
  });

  const confirm = useConfirm();

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getGlossario();
      setItems(data);
      setItemsFiltrados(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) loadItems();
  }, [isAuthenticated, loadItems]);

  useEffect(() => {
    const filtered = items.filter(i => 
      i.nome.toLowerCase().includes(searchText.toLowerCase())
    );
    setItemsFiltrados(filtered);
  }, [searchText, items]);

  const handleOpenDialog = (item?: GlossarioItem) => {
    if (item) {
      setEditingId(item.id);
      setFormData({
        nome: item.nome, 
        descricao: item.descricao,
      });
    } else {
      setEditingId(null);
      setFormData({ nome: '', descricao: '' });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingId) {
        await api.updateGlossario(editingId, formData);
        toast.success('Ingrediente atualizado com sucesso!');
      } else {
        await api.createGlossario(formData);
        toast.success('Ingrediente adicionado com sucesso!');
      }
      setDialogOpen(false);
      loadItems();
    } catch (error) {
      console.error(error);
      toast.error('Erro ao salvar ingrediente');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (item: GlossarioItem) => {
    const isConfirmed = await confirm({
      title: 'Excluir Ingrediente',
      message: `Tem certeza que deseja excluir "${item.nome}"?`,
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
      type: 'danger'
    });

    if (isConfirmed) {
      try {
        await api.deleteGlossario(item.id);
        toast.success('Ingrediente excluído com sucesso!');
        loadItems();
      } catch (error) {
        console.error(error);
        toast.error('Erro ao excluir ingrediente');
      }
    }
  };

  const columns = [
    {
      header: 'Nome',
      accessor: (row: GlossarioItem) => (
        <div className="flex items-center">
          <BookOpen size={16} className="text-[#c8921a] mr-3 opacity-70" />
          <span className="font-medium text-gray-900">{row.nome}</span>
        </div>
      ),
    },
    {
      header: 'Descrição',
      accessor: (row: GlossarioItem) => (
        <span className="text-gray-500 text-xs line-clamp-2 max-w-xs">{row.descricao}</span>
      ),
    },
    {
      header: 'Ações',
      accessor: (row: GlossarioItem) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenDialog(row)}
            className="p-1.5 text-gray-400 hover:text-[#c8921a] hover:bg-[#c8921a]/10 rounded-md transition-colors"
            title="Editar"
          >
            <Edit3 size={16} />
          </button>
          <button
            onClick={() => handleDelete(row)}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
            title="Excluir"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  if (loading && items.length === 0) {
    return (
      <div className="min-h-screen bg-[#f4f7f9] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#c8921a]/40" />
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-10 bg-[#f4f7f9] min-h-screen font-inter">
      <div className="w-full max-w-[1400px] mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-8">
          <div>
            <h1 className="text-xl font-light text-gray-400 tracking-tight uppercase">
              Glossário <span className="text-gray-900 font-normal">de Ingredientes</span>
            </h1>
            <p className="text-[10px] text-gray-500 font-normal uppercase tracking-[0.2em] mt-1">
              Lista informativa para o App
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar ingrediente..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#c8921a] focus:border-[#c8921a] transition-all w-64 shadow-sm text-gray-800 placeholder-gray-400"
              />
            </div>
            
            <AdminButton 
              onClick={() => handleOpenDialog()}
              variant="primary" 
              icon={<Plus size={16} />}
              className="bg-[#111] hover:bg-black text-white px-5 shadow-lg shadow-black/10 h-[38px]"
            >
              Novo
            </AdminButton>
          </div>
        </div>

        {/* Lista */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <DataTable 
            columns={columns} 
            data={itemsFiltrados} 
            emptyMessage={
              searchText 
                ? "Nenhum ingrediente encontrado para sua busca."
                : "Nenhum ingrediente cadastrado no glossário."
            }
          />
        </div>

      </div>

      {/* Modal Form */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white rounded-xl border-gray-200 p-0 overflow-hidden">
          <div className="p-6">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-lg font-normal text-gray-900 flex items-center gap-2">
                <div className="w-1 h-4 bg-[#c8921a] rounded-full"></div>
                {editingId ? 'Editar Ingrediente' : 'Novo Ingrediente'}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">
                  Nome do Ingrediente
                </label>
                <input
                  type="text"
                  required
                  value={formData.nome}
                  onChange={e => setFormData({...formData, nome: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#c8921a] focus:border-[#c8921a] transition-all"
                  placeholder="Ex: ✨ Farinha de Aveia"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">
                  Descrição
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.descricao}
                  onChange={e => setFormData({...formData, descricao: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#c8921a] focus:border-[#c8921a] transition-all resize-none"
                  placeholder="Descrição informativa..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
                <AdminButton 
                  type="button" 
                  variant="outline" 
                  onClick={() => setDialogOpen(false)}
                  disabled={isSaving}
                  className="px-6 h-[42px] border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </AdminButton>
                <AdminButton 
                  type="submit" 
                  variant="primary" 
                  loading={isSaving}
                  className="bg-[#c8921a] hover:bg-[#b07d12] text-white px-8 h-[42px] shadow-lg shadow-[#c8921a]/20"
                >
                  Salvar
                </AdminButton>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
