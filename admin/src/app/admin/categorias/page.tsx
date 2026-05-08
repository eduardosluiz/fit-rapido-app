'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/useAuth';
import { ListContainer } from '@/components/admin/ListContainer';
import { ListHeader } from '@/components/admin/ListHeader';
import { FormContainer } from '@/components/admin/FormContainer';
import { FormSection } from '@/components/admin/FormSection';
import { FormField } from '@/components/admin/FormField';
import { EmptyState } from '@/components/admin/EmptyState';
import { Button } from '@/components/admin/Button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ActionButton } from '@/components/admin/ActionButton';
import { FileUpload } from '@/components/admin/FileUpload';
import { cn } from '@/lib/utils';
import '@/app/admin/item-card.css';

interface Categoria {
  id: string;
  nome: string;
  slug: string;
  descricao?: string;
  imagem_url?: string;
  ativa: boolean;
}

export default function AdminCategorias() {
  const { isAuthenticated } = useAuth();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    slug: '',
    descricao: '',
    imagem_url: '',
    ativa: true,
  });

  const loadCategorias = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getCategorias();
      setCategorias(data);
    } catch (err: any) {
      console.error('Erro ao carregar categorias:', err);
      alert(err.message || 'Erro ao carregar categorias');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated === true) {
      loadCategorias();
    } else if (isAuthenticated === false) {
      setLoading(false);
    }
  }, [isAuthenticated, loadCategorias]);

  if (isAuthenticated === null || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#c8921a] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

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
    try {
      if (editingId) {
        await api.updateCategoria(editingId, formData);
      } else {
        await api.createCategoria(formData);
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({ nome: '', slug: '', descricao: '', imagem_url: '', ativa: true });
      await loadCategorias();
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar categoria');
    }
  };

  const handleEdit = (categoria: Categoria) => {
    setEditingId(categoria.id);
    setFormData({
      nome: categoria.nome,
      slug: categoria.slug,
      descricao: categoria.descricao || '',
      imagem_url: categoria.imagem_url || '',
      ativa: categoria.ativa,
    });
    setShowForm(true);
    
    // Scroll para a categoria e formulário após um pequeno delay para garantir que o DOM foi atualizado
    setTimeout(() => {
      const categoriaElement = document.getElementById(`categoria-${categoria.id}`);
      if (categoriaElement) {
        categoriaElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Depois, scroll para o formulário
        setTimeout(() => {
          const formElement = document.getElementById('categoria-form');
          if (formElement) {
            formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 300);
      }
    }, 100);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) return;
    try {
      await api.deleteCategoria(id);
      await loadCategorias();
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir categoria');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ nome: '', slug: '', descricao: '', imagem_url: '', ativa: true });
  };

  const handleCreateDefault = async () => {
    const categoriasPadrao = [
      { nome: 'Café da Manhã', slug: 'cafe-da-manha', descricao: 'Receitas saudáveis para começar o dia' },
      { nome: 'Almoço', slug: 'almoco', descricao: 'Pratos completos e nutritivos' },
      { nome: 'Jantar', slug: 'jantar', descricao: 'Refeições leves e balanceadas' },
      { nome: 'Lanche', slug: 'lanche', descricao: 'Lanches saudáveis entre refeições' },
      { nome: 'Sobremesa', slug: 'sobremesa', descricao: 'Doces saudáveis e sem culpa' },
    ];

    try {
      for (const cat of categoriasPadrao) {
        await api.createCategoria({ ...cat, ativa: true });
      }
      await loadCategorias();
      alert('Categorias padrão criadas com sucesso!');
    } catch (err: any) {
      alert(err.message || 'Erro ao criar categorias padrão');
    }
  };

  return (
    <ListContainer>
      <div className="space-y-8">
        <ListHeader
          title="Categorias de Receitas"
          icon="bx bx-folder"
          count={categorias.length}
          countLabel="categoria"
          action={!showForm ? (
            <Button
              onClick={() => setShowForm(true)}
              variant="magic"
              icon="bx-plus"
            >
              Nova Categoria
            </Button>
          ) : undefined}
        />

        {showForm && (
          <Card id="categoria-form" className="shadow-md border border-gray-200 dark:border-[#333]">
            <CardContent className="p-6 sm:p-8 lg:p-10">
              <div className="mb-8 pb-4 border-b border-gray-200 dark:border-[#333]">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingId ? 'Editar Categoria' : 'Nova Categoria'}
                </h2>
              </div>
              <form onSubmit={handleSubmit}>
                <FormSection 
                  title="Informações da Categoria" 
                  icon="bx bx-info-circle"
                  isFirst
                >
                  <FormField label="Nome" required fullWidth>
                    <Input
                      type="text"
                      required
                      value={formData.nome}
                      onChange={(e) => handleNomeChange(e.target.value)}
                      placeholder="Ex: Café da Manhã"
                    />
                  </FormField>

                  <FormField label="Slug" required fullWidth>
                    <Input
                      type="text"
                      required
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="Ex: cafe-da-manha"
                    />
                  </FormField>

                  <FormField label="Descrição" fullWidth>
                    <Textarea
                      value={formData.descricao}
                      onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                      rows={3}
                      placeholder="Descreva esta categoria..."
                      className="resize-none"
                    />
                  </FormField>

                  <FormField 
                    label="Imagem da Categoria" 
                    helperText="Envie uma imagem para representar esta categoria (JPG, PNG, GIF ou WebP). GIFs animados são suportados."
                    fullWidth
                  >
                    <FileUpload
                      type="imagem"
                      value={formData.imagem_url}
                      onChange={(url) => setFormData({ ...formData, imagem_url: url })}
                      label="Upload de imagem"
                    />
                  </FormField>

                  <div className="md:col-span-2 flex items-center space-x-3">
                    <Switch
                      id="ativa"
                      checked={formData.ativa}
                      onCheckedChange={(checked) => setFormData({ ...formData, ativa: checked })}
                    />
                    <label 
                      htmlFor="ativa" 
                      className="text-sm font-semibold text-foreground cursor-pointer"
                    >
                      Categoria Ativa
                    </label>
                  </div>
                </FormSection>

                <div className="inline-flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1 gap-0.5 border border-gray-200 dark:border-gray-700 w-full pt-6 border-t border-gray-200 dark:border-[#333] mt-8">
                  <Button
                    type="button"
                    onClick={handleCancel}
                    variant="magic"
                    icon="bx-x"
                    size="sm"
                    className={cn(
                      "flex-1 bg-transparent !text-gray-600 dark:!text-gray-400 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 [&_i]:!text-gray-600 dark:[&_i]:!text-gray-400",
                      editingId && "border border-gray-300 dark:border-gray-500"
                    )}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="magic"
                    icon="bx-check"
                    size="sm"
                    className={cn(
                      "flex-1 !bg-white !text-[#c8921a] dark:!bg-gray-700 dark:!text-[#d4a020] [&_i]:!text-[#c8921a] dark:[&_i]:!text-[#d4a020] shadow-md",
                      editingId ? "border border-gray-300 dark:border-gray-500" : "border border-gray-200 dark:border-gray-600"
                    )}
                  >
                    {editingId ? 'Salvar Alterações' : 'Criar Categoria'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {!showForm && (
          <>
            {categorias.length === 0 ? (
              <EmptyState
                icon="bx-folder-open"
                title="Nenhuma categoria cadastrada"
                description="Crie uma categoria manualmente ou use as categorias padrão."
                actionLabel="Criar Categorias Padrão"
                actionOnClick={handleCreateDefault}
              />
            ) : (
              <div className="space-y-6">
                {categorias.map((categoria) => (
                  <div key={categoria.id}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      <Card id={`categoria-${categoria.id}`} className="border-2 border-gray-200 dark:border-[#333] dark:bg-[#1a1a1a] shadow-lg hover:shadow-xl transition-all cursor-pointer hover:border-[#c8921a]">
                        <div className="mb-5">
                          <div className="flex items-start justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white pr-2">{categoria.nome}</h3>
                            <span
                              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${
                                categoria.ativa
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                              }`}
                            >
                              {categoria.ativa ? 'Ativa' : 'Inativa'}
                            </span>
                          </div>
                          {categoria.descricao && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 leading-relaxed">
                              {categoria.descricao}
                            </p>
                          )}
                          {categoria.imagem_url && (
                            <div className="mb-4 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-[#333]">
                              <img 
                                src={categoria.imagem_url} 
                                alt={categoria.nome}
                                className="w-full h-32 object-cover"
                              />
                            </div>
                          )}
                          <p className="text-xs text-gray-400 dark:text-gray-500 font-mono bg-gray-50 dark:bg-[#252525] px-2 py-1 rounded inline-block">{categoria.slug}</p>
                        </div>
                        <div className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-[#333]">
                          <ActionButton
                            variant="edit"
                            onClick={() => handleEdit(categoria)}
                            className="flex-1"
                            title="Editar categoria"
                          />
                          <ActionButton
                            variant="delete"
                            onClick={() => handleDelete(categoria.id)}
                            title="Excluir categoria"
                          />
                        </div>
                      </Card>
                    </div>
                    {editingId === categoria.id && showForm && (
                      <Card id="categoria-form" className="shadow-md border border-gray-200 dark:border-[#333] mt-4">
                          <CardContent className="p-6 sm:p-8 lg:p-10">
                            <div className="mb-8 pb-4 border-b border-gray-200 dark:border-[#333]">
                              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Editar Categoria
                              </h2>
                            </div>
                            <form onSubmit={handleSubmit}>
                              <FormSection 
                                title="Informações da Categoria" 
                                icon="bx bx-info-circle"
                                isFirst
                              >
                                <FormField label="Nome" required fullWidth>
                                  <Input
                                    type="text"
                                    required
                                    value={formData.nome}
                                    onChange={(e) => handleNomeChange(e.target.value)}
                                    placeholder="Ex: Café da Manhã"
                                  />
                                </FormField>

                                <FormField label="Slug" required fullWidth>
                                  <Input
                                    type="text"
                                    required
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    placeholder="Ex: cafe-da-manha"
                                  />
                                </FormField>

                                <FormField label="Descrição" fullWidth>
                                  <Textarea
                                    value={formData.descricao}
                                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                                    rows={3}
                                    placeholder="Descreva esta categoria..."
                                    className="resize-none"
                                  />
                                </FormField>

                                <FormField 
                                  label="Imagem da Categoria" 
                                  helperText="Envie uma imagem para representar esta categoria (JPG, PNG, GIF ou WebP). GIFs animados são suportados."
                                  fullWidth
                                >
                                  <FileUpload
                                    type="imagem"
                                    value={formData.imagem_url}
                                    onChange={(url) => setFormData({ ...formData, imagem_url: url })}
                                    label="Upload de imagem"
                                  />
                                </FormField>

                                <div className="md:col-span-2 flex items-center space-x-3">
                                  <Switch
                                    id="ativa"
                                    checked={formData.ativa}
                                    onCheckedChange={(checked) => setFormData({ ...formData, ativa: checked })}
                                  />
                                  <label 
                                    htmlFor="ativa" 
                                    className="text-sm font-semibold text-foreground cursor-pointer"
                                  >
                                    Categoria Ativa
                                  </label>
                                </div>
                              </FormSection>

                              <div className="inline-flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1 gap-0.5 border border-gray-200 dark:border-gray-700 w-full pt-6 border-t border-gray-200 dark:border-[#333] mt-8">
                                <Button
                                  type="button"
                                  onClick={handleCancel}
                                  variant="magic"
                                  icon="bx-x"
                                  size="sm"
                                  className={cn(
                                    "flex-1 bg-transparent !text-gray-600 dark:!text-gray-400 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 [&_i]:!text-gray-600 dark:[&_i]:!text-gray-400",
                                    editingId && "border border-gray-300 dark:border-gray-500"
                                  )}
                                >
                                  Cancelar
                                </Button>
                                <Button
                                  type="submit"
                                  variant="magic"
                                  icon="bx-check"
                                  size="sm"
                                  className={cn(
                                    "flex-1 !bg-white !text-[#c8921a] dark:!bg-gray-700 dark:!text-[#d4a020] [&_i]:!text-[#c8921a] dark:[&_i]:!text-[#d4a020] shadow-md",
                                    editingId ? "border border-gray-300 dark:border-gray-500" : "border border-gray-200 dark:border-gray-600"
                                  )}
                                >
                                  Salvar Alterações
                                </Button>
                              </div>
                            </form>
                          </CardContent>
                        </Card>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </ListContainer>
  );
}
