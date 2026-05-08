'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus, Search, Package, Trash2, Edit2, GripVertical } from 'lucide-react';

interface ReceitaIngrediente {
  id: string;
  ingrediente_id: string | null;
  ingrediente_texto: string;
  ingrediente?: {
    id: string;
    nome: string;
    calorias: number;
    proteinas: number;
    carboidratos: number;
    gorduras: number;
  };
  quantidade: number;
  unidade: string;
  ordem: number;
  observacao?: string;
  substitutos_sugeridos: string[];
}

interface Ingrediente {
  id: string;
  nome: string;
  calorias: number;
  proteinas: number;
  carboidratos: number;
  gorduras: number;
}

export default function ReceitaIngredientesPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated } = useAuth();
  const receitaId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [receitaIngredientes, setReceitaIngredientes] = useState<ReceitaIngrediente[]>([]);
  const [ingredientesDisponiveis, setIngredientesDisponiveis] = useState<Ingrediente[]>([]);
  const [searchIngrediente, setSearchIngrediente] = useState('');
  const [ingredientesFiltrados, setIngredientesFiltrados] = useState<Ingrediente[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    ingrediente_id: '',
    ingrediente_texto: '',
    quantidade: '',
    unidade: 'g',
    ordem: 0,
    observacao: '',
  });
  const [receitaNome, setReceitaNome] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, receitaId]);

  useEffect(() => {
    if (!searchIngrediente.trim()) {
      setIngredientesFiltrados(ingredientesDisponiveis.slice(0, 20));
      return;
    }

    const searchLower = searchIngrediente.toLowerCase();
    const filtered = ingredientesDisponiveis
      .filter((i) => i.nome.toLowerCase().includes(searchLower))
      .slice(0, 20);
    setIngredientesFiltrados(filtered);
  }, [searchIngrediente, ingredientesDisponiveis]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [receita, ingredientes, todosIngredientes] = await Promise.all([
        api.getReceita(receitaId),
        api.getReceitaIngredientes(receitaId),
        api.getIngredientes({ ativo: true }),
      ]);

      setReceitaNome(receita.titulo || 'Receita');
      setReceitaIngredientes(ingredientes.sort((a: ReceitaIngrediente, b: ReceitaIngrediente) => a.ordem - b.ordem));
      setIngredientesDisponiveis(todosIngredientes);
      setIngredientesFiltrados(todosIngredientes.slice(0, 20));
    } catch (err: any) {
      alert(err.message || 'Erro ao carregar dados');
      router.push('/admin/receitas');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      ingrediente_id: '',
      ingrediente_texto: '',
      quantidade: '',
      unidade: 'g',
      ordem: receitaIngredientes.length,
      observacao: '',
    });
    setEditingId(null);
    setSearchIngrediente('');
  };

  const handleOpenDialog = (ingrediente?: ReceitaIngrediente) => {
    if (ingrediente) {
      setEditingId(ingrediente.id);
      setFormData({
        ingrediente_id: ingrediente.ingrediente_id || '',
        ingrediente_texto: ingrediente.ingrediente_texto || '',
        quantidade: ingrediente.quantidade.toString(),
        unidade: ingrediente.unidade,
        ordem: ingrediente.ordem,
        observacao: ingrediente.observacao || '',
      });
    } else {
      resetForm();
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.ingrediente_id && !formData.ingrediente_texto.trim()) {
      alert('Selecione um ingrediente ou digite o nome');
      return;
    }

    if (!formData.quantidade || parseFloat(formData.quantidade) <= 0) {
      alert('Quantidade deve ser maior que zero');
      return;
    }

    try {
      const data = {
        ingrediente_id: formData.ingrediente_id || null,
        ingrediente_texto: formData.ingrediente_texto.trim() || null,
        quantidade: parseFloat(formData.quantidade),
        unidade: formData.unidade,
        ordem: formData.ordem,
        observacao: formData.observacao.trim() || null,
      };

      if (editingId) {
        await api.updateReceitaIngrediente(receitaId, editingId, data);
      } else {
        await api.createReceitaIngrediente(receitaId, data);
      }

      await loadData();
      handleCloseDialog();
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar ingrediente');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este ingrediente da receita?')) {
      return;
    }

    try {
      await api.deleteReceitaIngrediente(receitaId, id);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Erro ao remover ingrediente');
    }
  };

  const calcularMacrosTotais = () => {
    return receitaIngredientes.reduce(
      (acc, ri) => {
        if (ri.ingrediente) {
          const fator = ri.quantidade / 100; // Converter para proporção de 100g
          return {
            calorias: acc.calorias + ri.ingrediente.calorias * fator,
            proteinas: acc.proteinas + ri.ingrediente.proteinas * fator,
            carboidratos: acc.carboidratos + ri.ingrediente.carboidratos * fator,
            gorduras: acc.gorduras + ri.ingrediente.gorduras * fator,
          };
        }
        return acc;
      },
      { calorias: 0, proteinas: 0, carboidratos: 0, gorduras: 0 }
    );
  };

  const macrosTotais = calcularMacrosTotais();

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#c8921a] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Carregando ingredientes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 dark:bg-[#0f0f0f] min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/admin/receitas/${receitaId}`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Package className="w-8 h-8 text-[#c8921a]" />
                Ingredientes da Receita
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">{receitaNome}</p>
            </div>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => handleOpenDialog()}
                className="bg-[#c8921a] hover:bg-[#b88218] text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Ingrediente
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? 'Editar Ingrediente' : 'Adicionar Ingrediente'}
                </DialogTitle>
                <DialogDescription>
                  Associe um ingrediente à receita com quantidade e unidade
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="search">Buscar Ingrediente</Label>
                  <Input
                    id="search"
                    value={searchIngrediente}
                    onChange={(e) => setSearchIngrediente(e.target.value)}
                    placeholder="Digite para buscar..."
                    className="mb-2"
                  />
                  {searchIngrediente && ingredientesFiltrados.length > 0 && (
                    <div className="border rounded-md max-h-40 overflow-y-auto">
                      {ingredientesFiltrados.map((ing) => (
                        <button
                          key={ing.id}
                          type="button"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              ingrediente_id: ing.id,
                              ingrediente_texto: ing.nome,
                            });
                            setSearchIngrediente('');
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-between"
                        >
                          <span>{ing.nome}</span>
                          <span className="text-xs text-gray-500">
                            {ing.calorias.toFixed(0)} kcal
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {formData.ingrediente_id && (
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
                    <p className="text-sm text-green-800 dark:text-green-200">
                      ✓ Ingrediente selecionado: <strong>{formData.ingrediente_texto}</strong>
                    </p>
                  </div>
                )}

                <div>
                  <Label htmlFor="ingrediente_texto">Ou digite manualmente</Label>
                  <Input
                    id="ingrediente_texto"
                    value={formData.ingrediente_texto}
                    onChange={(e) =>
                      setFormData({ ...formData, ingrediente_texto: e.target.value, ingrediente_id: '' })
                    }
                    placeholder="Ex: 2 colheres de azeite"
                    disabled={!!formData.ingrediente_id}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="quantidade">Quantidade *</Label>
                    <Input
                      id="quantidade"
                      type="number"
                      step="0.1"
                      value={formData.quantidade}
                      onChange={(e) => setFormData({ ...formData, quantidade: e.target.value })}
                      required
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="unidade">Unidade *</Label>
                    <Select
                      value={formData.unidade}
                      onValueChange={(value) => setFormData({ ...formData, unidade: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="g">g (gramas)</SelectItem>
                        <SelectItem value="kg">kg (quilogramas)</SelectItem>
                        <SelectItem value="ml">ml (mililitros)</SelectItem>
                        <SelectItem value="l">l (litros)</SelectItem>
                        <SelectItem value="xícara">xícara</SelectItem>
                        <SelectItem value="colher">colher</SelectItem>
                        <SelectItem value="unidade">unidade</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="ordem">Ordem</Label>
                  <Input
                    id="ordem"
                    type="number"
                    value={formData.ordem}
                    onChange={(e) => setFormData({ ...formData, ordem: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Ordem de exibição na lista (menor número aparece primeiro)
                  </p>
                </div>

                <div>
                  <Label htmlFor="observacao">Observação (opcional)</Label>
                  <Input
                    id="observacao"
                    value={formData.observacao}
                    onChange={(e) => setFormData({ ...formData, observacao: e.target.value })}
                    placeholder="Ex: em temperatura ambiente"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={handleCloseDialog}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-[#c8921a] hover:bg-[#b88218] text-white">
                    {editingId ? 'Atualizar' : 'Adicionar'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Resumo de Macros */}
        {receitaIngredientes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Macros Totais da Receita</CardTitle>
              <CardDescription>
                Valores calculados com base nos ingredientes associados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Calorias</p>
                  <p className="text-2xl font-bold text-[#c8921a]">
                    {macrosTotais.calorias.toFixed(0)}
                  </p>
                  <p className="text-xs text-gray-500">kcal</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Proteínas</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {macrosTotais.proteinas.toFixed(1)}
                  </p>
                  <p className="text-xs text-gray-500">g</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Carboidratos</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {macrosTotais.carboidratos.toFixed(1)}
                  </p>
                  <p className="text-xs text-gray-500">g</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Gorduras</p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {macrosTotais.gorduras.toFixed(1)}
                  </p>
                  <p className="text-xs text-gray-500">g</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lista de Ingredientes */}
        <Card>
          <CardHeader>
            <CardTitle>Ingredientes ({receitaIngredientes.length})</CardTitle>
            <CardDescription>
              {receitaIngredientes.length === 0
                ? 'Nenhum ingrediente associado ainda'
                : 'Gerencie os ingredientes desta receita'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {receitaIngredientes.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Nenhum ingrediente associado</p>
                <p className="text-sm mt-2">Clique em "Adicionar Ingrediente" para começar</p>
              </div>
            ) : (
              <div className="space-y-3">
                {receitaIngredientes.map((ri) => (
                  <div
                    key={ri.id}
                    className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          {ri.ingrediente?.nome || ri.ingrediente_texto}
                        </p>
                        {ri.ingrediente && (
                          <span className="text-xs text-gray-500">
                            ({ri.ingrediente.calorias.toFixed(0)} kcal/100g)
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                        <span>
                          {ri.quantidade} {ri.unidade}
                        </span>
                        {ri.observacao && <span>• {ri.observacao}</span>}
                        <span className="text-xs">Ordem: {ri.ordem}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDialog(ri)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(ri.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

