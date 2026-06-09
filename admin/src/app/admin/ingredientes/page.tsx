'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/useAuth';
import { DataTable } from '@/components/admin/DataTable';
import { Button as AdminButton } from '@/components/admin/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Search, Filter, Layers, Edit3, Trash2, Package, Loader2 } from 'lucide-react';
import { useConfirm } from '@/contexts/ConfirmContext';
import { toast } from 'react-hot-toast';
import '@/app/admin/data-table.css';

interface Ingrediente {
  id: string;
  nome: string;
  unidade_base: string;
  calorias: number;
  proteinas: number;
  carboidratos: number;
  gorduras: number;
  fibras?: number;
  sodio?: number;
  ativo: boolean;
  fonte: string;
  created_at: string;
}

export default function IngredientesPage() {
  const { isAuthenticated } = useAuth();
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);
  const [ingredientesFiltrados, setIngredientesFiltrados] = useState<Ingrediente[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    nome: '', unidade_base: '100g', calorias: '', proteinas: '', carboidratos: '', gorduras: '', fibras: '', sodio: '', ativo: true,
  });

  const confirm = useConfirm();


  const loadIngredientes = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getIngredientes();
      const formatados = data.map((ing: any) => ({
        ...ing,
        calorias: parseFloat(ing.calorias) || 0,
        proteinas: parseFloat(ing.proteinas) || 0,
        carboidratos: parseFloat(ing.carboidratos) || 0,
        gorduras: parseFloat(ing.gorduras) || 0,
      }));
      setIngredientes(formatados);
      setIngredientesFiltrados(formatados);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) loadIngredientes();
  }, [isAuthenticated, loadIngredientes]);

  useEffect(() => {
    const filtered = ingredientes.filter(i => 
      i.nome.toLowerCase().includes(searchText.toLowerCase())
    );
    setIngredientesFiltrados(filtered);
  }, [searchText, ingredientes]);

  const handleOpenDialog = (ingrediente?: Ingrediente) => {
    if (ingrediente) {
      setEditingId(ingrediente.id);
      setFormData({
        nome: ingrediente.nome, unidade_base: ingrediente.unidade_base,
        calorias: ingrediente.calorias.toString(), proteinas: ingrediente.proteinas.toString(),
        carboidratos: ingrediente.carboidratos.toString(), gorduras: ingrediente.gorduras.toString(),
        fibras: ingrediente.fibras?.toString() || '', sodio: ingrediente.sodio?.toString() || '',
        ativo: ingrediente.ativo,
      });
    } else {
      setEditingId(null);
      setFormData({ nome: '', unidade_base: '100g', calorias: '', proteinas: '', carboidratos: '', gorduras: '', fibras: '', sodio: '', ativo: true });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const data = {
        ...formData,
        calorias: parseFloat(formData.calorias),
        proteinas: parseFloat(formData.proteinas),
        carboidratos: parseFloat(formData.carboidratos),
        gorduras: parseFloat(formData.gorduras),
      };
      if (editingId) await api.updateIngrediente(editingId, data);
      else await api.createIngrediente(data);
      toast.success('Salvo');
      loadIngredientes();
      setDialogOpen(false);
    } catch (err) {
      toast.error('Erro');
    } finally {
      setIsSaving(false);
    }
  };

  const columns = [
    { header: 'Nome do Ingrediente', accessor: 'nome', render: (ing: Ingrediente) => <div className="font-elegant">{ing.nome}</div> },
    { header: 'Energia', accessor: 'calorias', render: (ing: Ingrediente) => <div className="text-[#c8921a] font-light">{ing.calorias} kcal</div> },
    { header: 'Prot.', accessor: 'proteinas', render: (ing: Ingrediente) => <div>{ing.proteinas}g</div> },
    { header: 'Carb.', accessor: 'carboidratos', render: (ing: Ingrediente) => <div>{ing.carboidratos}g</div> },
    { header: 'Gord.', accessor: 'gorduras', render: (ing: Ingrediente) => <div>{ing.gorduras}g</div> },
    { header: 'Status', accessor: 'ativo', render: (ing: Ingrediente) => <span className={`badge-slim ${ing.ativo ? 'text-emerald-600' : 'text-gray-300'}`}>{ing.ativo ? 'Ativo' : 'Off'}</span> },
    { header: 'Ações', accessor: 'actions', className: 'text-center w-[120px]', render: (ing: Ingrediente) => (
      <div className="flex items-center justify-center gap-2">
        {/* Ícones com cores vivas por padrão */}
        <button onClick={() => handleOpenDialog(ing)} className="action-icon-edit"><Edit3 size={15} /></button>
        <button onClick={async () => { if(await confirm('Excluir?')){ await api.deleteIngrediente(ing.id); loadIngredientes(); toast.success('Removido'); } }} className="action-icon-delete"><Trash2 size={15} /></button>
      </div>
    )},
  ];

  if (loading) return <div className="min-h-screen bg-[#f4f7f9] flex items-center justify-center"><Loader2 className="animate-spin text-[#c8921a]/40" /></div>;

  return (
    <div className="p-6 sm:p-10 bg-[#f4f7f9] dark:bg-[#0a0a0a] min-h-screen">
      <div className="w-full max-w-[1400px] mx-auto space-y-12">
        
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-[#222] pb-8">
          <div>
            <h1 className="text-xl font-light text-gray-400 dark:text-gray-500 tracking-tight uppercase">
              Base de <span className="text-gray-800 dark:text-white font-semibold">Ingredientes</span>
            </h1>
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-[0.2em] mt-1">Valores Nutricionais Base</p>
          </div>
          <button 
            onClick={() => handleOpenDialog()}
            className="px-4 py-1.5 rounded-md border border-[#c8921a]/30 text-[#c8921a] text-[9px] font-bold uppercase tracking-widest hover:bg-[#c8921a] hover:text-white transition-all"
          >
            <Plus size={12} className="mr-1 inline" /> Novo Item
          </button>
        </div>

        <div className="relative w-full max-w-[300px] group">
          <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#c8921a]" size={16} />
          <input 
            type="text" value={searchText} onChange={(e) => setSearchText(e.target.value)} 
            placeholder="Buscar ingrediente..." 
            className="w-full pl-7 pr-4 py-2 bg-transparent border-t-0 border-l-0 border-r-0 border-b border-gray-300 dark:border-[#333] focus:border-[#c8921a] focus:ring-0 outline-none text-sm text-black dark:text-white font-normal" 
          />
        </div>

        <div className="data-table-container">
          <DataTable columns={columns} data={ingredientesFiltrados} keyExtractor={(i) => i.id} />
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl border-none shadow-2xl bg-white">
          <DialogHeader className="px-8 py-5 border-b border-gray-50 flex items-center justify-between">
            <DialogTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Ficha Técnica</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <input 
              type="text" value={formData.nome} onChange={(e) => setFormData({...formData, nome: e.target.value})}
              className="w-full bg-transparent border-t-0 border-l-0 border-r-0 border-b border-gray-100 px-0 py-2 text-sm focus:outline-none focus:border-[#c8921a] text-gray-700 font-medium"
              placeholder="Nome do ingrediente..." required
            />
            <div className="grid grid-cols-2 gap-x-8 gap-y-6">
              {['calorias', 'proteinas', 'carboidratos', 'gorduras'].map(field => (
                <div key={field}>
                  <label className="text-[8px] font-black text-gray-300 uppercase tracking-widest block mb-1">{field}</label>
                  <input 
                    type="number" step="0.1" value={formData[field as keyof typeof formData] as string} 
                    onChange={(e) => setFormData({...formData, [field]: e.target.value})}
                    className="w-full bg-transparent border-t-0 border-l-0 border-r-0 border-b border-gray-100 px-0 py-1 text-xs focus:outline-none focus:border-[#c8921a] text-gray-600"
                    placeholder="0.0" required
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-4 pt-6">
              <button type="button" onClick={() => setDialogOpen(false)} className="text-[9px] font-black uppercase text-gray-400">Cancelar</button>
              <button type="submit" disabled={isSaving} className="px-8 py-2 rounded-lg bg-[#c8921a] text-white text-[9px] font-black uppercase tracking-widest shadow-lg shadow-[#c8921a]/20">
                {isSaving ? 'Salvando...' : 'Confirmar'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
