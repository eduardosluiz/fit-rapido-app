'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/useAuth';
import { ListContainer } from '@/components/admin/ListContainer';
import { ListHeader } from '@/components/admin/ListHeader';
import { FormSection } from '@/components/admin/FormSection';
import { FormField } from '@/components/admin/FormField';
import { EmptyState } from '@/components/admin/EmptyState';
import { Button as AdminButton } from '@/components/admin/Button';
import { useConfirm } from '@/contexts/ConfirmContext';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ActionButton } from '@/components/admin/ActionButton';
import { FileUpload } from '@/components/admin/FileUpload';
import { cn } from '@/lib/utils';
import '@/app/admin/item-card.css';

interface ModalidadeTreino {
  id: string;
  nome: string;
  descricao?: string;
  imagem_url?: string;
  ativo: boolean; // Usando 'ativo' conforme regra de negócio
}

export default function ModalidadesTreinosPage() {
  const { isAuthenticated } = useAuth();
  const [modalidades, setModalidades] = useState<ModalidadeTreino[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    imagem_url: '',
    ativo: true,
  });

  const loadModalidades = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getModalidadesTreinos();
      setModalidades(data);
    } catch (err: any) {
      console.error('Erro ao carregar modalidades:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated === true) {
      loadModalidades();
    } else if (isAuthenticated === false) {
      setLoading(false);
    }
  }, [isAuthenticated, loadModalidades]);

  if (isAuthenticated === null || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#c8921a] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Carregando modalidades...</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.updateModalidadeTreino(editingId, formData);
      } else {
        await api.createModalidadeTreino(formData);
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({ nome: '', descricao: '', imagem_url: '', ativo: true });
      await loadModalidades();
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar modalidade');
    }
  };

  const handleEdit = (modalidade: ModalidadeTreino) => {
    setEditingId(modalidade.id);
    setFormData({
      nome: modalidade.nome,
      descricao: modalidade.descricao || '',
      imagem_url: modalidade.imagem_url || '',
      ativo: modalidade.ativo ?? (modalidade as any).ativa ?? true,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!(await confirm('Tem certeza que deseja excluir esta modalidade?'))) return;
    try {
      await api.deleteModalidadeTreino(id);
      await loadModalidades();
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir modalidade');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ nome: '', descricao: '', imagem_url: '', ativo: true });
  };

  return (
    <ListContainer>
      <div className="space-y-8">
        <ListHeader
          title="Modalidades de Treinos"
          icon="bx bx-run"
          count={modalidades.length}
          countLabel="modalidade"
          action={!showForm ? (
            <Button
              onClick={() => setShowForm(true)}
              variant="magic"
              icon="bx-plus"
            >
              Nova Modalidade
            </Button>
          ) : undefined}
        />

        {showForm && (
          <Card className="shadow-md border border-gray-200 dark:border-[#333]">
            <CardContent className="p-6 sm:p-8 lg:p-10">
              <div className="mb-8 pb-4 border-b border-gray-200 dark:border-[#333]">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingId ? 'Editar Modalidade' : 'Nova Modalidade'}
                </h2>
              </div>
              <form onSubmit={handleSubmit}>
                <FormSection title="Informações" icon="bx bx-info-circle" isFirst>
                  <FormField label="Nome da Modalidade" required fullWidth>
                    <Input
                      type="text"
                      required
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      placeholder="Ex: Musculação, Yoga, Crossfit..."
                    />
                  </FormField>

                  <FormField label="Descrição" fullWidth>
                    <Textarea
                      value={formData.descricao}
                      onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                      rows={3}
                      placeholder="Breve descrição da modalidade..."
                    />
                  </FormField>

                  <FormField label="Banner da Modalidade" helperText="Esta imagem aparecerá como um banner no app mobile." fullWidth>
                    <FileUpload
                      type="imagem"
                      value={formData.imagem_url}
                      onChange={(url) => setFormData({ ...formData, imagem_url: url })}
                      label="Upload de Banner"
                    />
                  </FormField>

                  <div className="flex items-center space-x-3 mt-4">
                    <Switch
                      id="ativo"
                      checked={formData.ativo}
                      onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
                    />
                    <label htmlFor="ativo" className="text-sm font-bold uppercase text-gray-500 cursor-pointer">
                      Exibir no App (Ativo)
                    </label>
                  </div>
                </FormSection>

                <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
                  <Button type="button" onClick={handleCancel} variant="outline">
                    Cancelar
                  </Button>
                  <Button type="submit" variant="magic">
                    {editingId ? 'Salvar Alterações' : 'Criar Modalidade'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {!showForm && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modalidades.length === 0 ? (
              <div className="col-span-full">
                <EmptyState
                  icon="bx-run"
                  title="Nenhuma modalidade"
                  description="Comece criando sua primeira modalidade de treino."
                />
              </div>
            ) : (
              modalidades.map((mod) => (
                <Card key={mod.id} className="overflow-hidden border-2 border-gray-100 hover:border-[#c8921a] transition-all">
                  <div className="h-32 bg-gray-100 relative">
                    {mod.imagem_url ? (
                      <img src={mod.imagem_url} alt={mod.nome} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Ionicons name="fitness" size={32} color="#ccc" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <span className={cn(
                        "px-2 py-1 rounded text-[10px] font-bold uppercase",
                        mod.ativo || (mod as any).ativa ? "bg-green-500 text-white" : "bg-gray-400 text-white"
                      )}>
                        {mod.ativo || (mod as any).ativa ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg mb-1">{mod.nome}</h3>
                    <p className="text-gray-500 text-xs line-clamp-2 mb-4">{mod.descricao || 'Sem descrição'}</p>
                    <div className="flex gap-2">
                      <ActionButton variant="edit" onClick={() => handleEdit(mod)} className="flex-1" />
                      <ActionButton variant="delete" onClick={() => handleDelete(mod.id)} />
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </ListContainer>
  );
}
