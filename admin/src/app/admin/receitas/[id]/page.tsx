'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/useAuth';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronsUpDown, PlusCircle, Trash2, BookOpen, Video, Info, Package } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { FileUpload } from '@/components/admin/FileUpload';
import { MultipleImageUpload } from '@/components/admin/MultipleImageUpload';
import { toast } from 'react-hot-toast';
import { useConfirm } from '@/contexts/ConfirmContext';

export default function EditarReceita() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { isAuthenticated } = useAuth();
  const confirm = useConfirm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    ingredientes: '',
    modo_preparo: '',
    informacoes_nutricionais: '',
    aviso_nutricional: '',
    imagem_url: '',
    imagens_url: [] as string[],
    video_url: '',
    ebook_url: '',
    categoria_ids: [] as string[],
    dificuldade: 'medio',
    tempo_preparo: '',
    porcoes: '',
    is_premium: false,
    is_inedito: false,
    is_free: false,
    tags: '',
    ativa: true,
    substituicoes_ingredientes: [{ ingrediente: '', substituto: '' }] as Array<{ ingrediente: string; substituto: string }>,
    calorias: '',
    proteinas: '',
    carboidratos: '',
    gorduras: '',
    fibras: '',
    sodio: '',
    dica: '',
  });

  useEffect(() => {
    if (isAuthenticated && id) {
      loadData();
    }
  }, [isAuthenticated, id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [receita, cats] = await Promise.all([
        api.getReceita(id),
        api.getCategorias(),
      ]);
      
      setCategorias(cats);
      
      // Processar substituições do formato objeto para array do form
      const subsArray: any[] = [];
      if (receita.substituicoes_ingredientes && typeof receita.substituicoes_ingredientes === 'object') {
        Object.entries(receita.substituicoes_ingredientes).forEach(([ing, subs]) => {
          if (Array.isArray(subs)) {
            subs.forEach(s => subsArray.push({ ingrediente: ing, substituto: s }));
          } else {
            subsArray.push({ ingrediente: ing, substituto: subs });
          }
        });
      }

      // Função auxiliar para normalizar dados que podem vir como strings JSON ou objetos com índices numéricos
      const normalizeArray = (data: any) => {
        if (!data) return [];
        if (Array.isArray(data)) {
          // Se for um array de um único item que é uma string JSON de objeto
          if (data.length === 1 && typeof data[0] === 'string' && data[0].startsWith('{')) {
            try {
              const parsed = JSON.parse(data[0]);
              return Object.values(parsed);
            } catch (e) { return data; }
          }
          return data;
        }
        if (typeof data === 'string' && data.startsWith('{')) {
          try {
            const parsed = JSON.parse(data);
            return Object.values(parsed);
          } catch (e) { return [data]; }
        }
        if (typeof data === 'object') return Object.values(data);
        return [data];
      };

      const ingredientesList = normalizeArray(receita.ingredientes);
      const modoPreparoList = normalizeArray(receita.modo_preparo);
      const tagsList = normalizeArray(receita.tags);

      setFormData({
        titulo: receita.titulo || '',
        descricao: receita.descricao || '',
        ingredientes: ingredientesList.join('\n'),
        modo_preparo: modoPreparoList.join('\n'),
        informacoes_nutricionais: receita.informacoes_nutricionais || '',
        aviso_nutricional: receita.aviso_nutricional || '',
        imagem_url: receita.imagem_url || '',
        imagens_url: receita.imagens_url || (receita.imagem_url ? [receita.imagem_url] : []),
        video_url: receita.video_url || '',
        ebook_url: receita.ebook_url || '',
        categoria_ids: receita.categorias?.map((c: any) => c.id) || (receita.categoria_id ? [receita.categoria_id] : []),
        dificuldade: receita.dificuldade || 'medio',
        tempo_preparo: String(receita.tempo_preparo || ''),
        porcoes: String(receita.porcoes || ''),
        is_premium: receita.is_premium || false,
        is_inedito: receita.is_inedito || false,
        is_free: receita.is_free || false,
        tags: tagsList.join(', '),
        ativa: receita.ativa ?? true,
        substituicoes_ingredientes: subsArray.length > 0 ? subsArray : [{ ingrediente: '', substituto: '' }],
        calorias: receita.calorias ? String(receita.calorias) : '',
        proteinas: receita.proteinas ? String(receita.proteinas) : '',
        carboidratos: receita.carboidratos ? String(receita.carboidratos) : '',
        gorduras: receita.gorduras ? String(receita.gorduras) : '',
        fibras: receita.fibras ? String(receita.fibras) : '',
        sodio: receita.sodio ? String(receita.sodio) : '',
        dica: receita.dica || '',
        finalizacao: receita.finalizacao || '',
      });
    } catch (err: any) {
      toast.error('Erro ao carregar dados');
      router.push('/admin/receitas');
    } finally {
      setLoading(false);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.titulo.trim()) newErrors.titulo = 'Título é obrigatório';
    if (!formData.ingredientes.trim()) newErrors.ingredientes = 'Ingredientes são obrigatórios';
    if (!formData.modo_preparo.trim()) newErrors.modo_preparo = 'Modo de preparo é obrigatório';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const data: any = {
        ...formData,
        tempo_preparo: parseInt(formData.tempo_preparo) || 0,
        porcoes: parseInt(formData.porcoes) || 1,
        tags: formData.tags.split(',').map((t) => t.trim()).filter((t) => t),
        ingredientes: formData.ingredientes.split('\n').map((i) => i.trim()).filter((i) => i),
        modo_preparo: formData.modo_preparo.split('\n').map((m) => m.trim()).filter((m) => m),
        calorias: parseFloat(String(formData.calorias).replace(',', '.')) || null,
        proteinas: parseFloat(String(formData.proteinas).replace(',', '.')) || null,
        carboidratos: parseFloat(String(formData.carboidratos).replace(',', '.')) || null,
        gorduras: parseFloat(String(formData.gorduras).replace(',', '.')) || null,
        fibras: parseFloat(String(formData.fibras).replace(',', '.')) || null,
        sodio: parseFloat(String(formData.sodio).replace(',', '.')) || null,
        dica: formData.dica,
      };

      const substituicoesAgrupadas: Record<string, string[]> = {};
      formData.substituicoes_ingredientes.forEach((sub) => {
        const ing = typeof sub.ingrediente === 'string' ? sub.ingrediente.trim() : '';
        const subst = typeof sub.substituto === 'string' ? sub.substituto.trim() : '';
        
        if (ing && subst) {
          if (!substituicoesAgrupadas[ing]) substituicoesAgrupadas[ing] = [];
          substituicoesAgrupadas[ing].push(subst);
        }
      });
      data.substituicoes_ingredientes = substituicoesAgrupadas;

      await api.updateReceita(id, data);
      toast.success('Receita atualizada');
      router.push('/admin/receitas');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!(await confirm('Tem certeza que deseja excluir esta receita? Esta ação não pode ser desfeita.'))) return;
    try {
      await api.deleteReceita(id);
      toast.success('Receita excluída com sucesso');
      router.push('/admin/receitas');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao excluir receita');
    }
  };

  if (!isAuthenticated || loading) {
    return (
      <div className="min-h-screen bg-[#f4f7f9] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#c8921a]/20 border-t-[#c8921a] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="relative p-6 sm:p-10 bg-[#f4f7f9] dark:bg-[#0a0a0a] min-h-screen pb-20">
      <div className="w-full max-w-[1400px] mx-auto space-y-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 pb-8 border-b border-gray-200 dark:border-[#222]">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-white dark:bg-[#111] border border-gray-200 dark:border-[#333] rounded-xl shadow-sm">
              <BookOpen size={32} className="text-[#c8921a]" />
            </div>
            <div>
              <h1 className="text-xl font-light text-gray-400 dark:text-gray-500 tracking-tight uppercase">
                Editar <span className="text-gray-800 dark:text-white font-semibold">Receita</span>
              </h1>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-[0.2em] mt-1">Atualização de Registro</p>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3">
            <Link href={`/admin/receitas/${id}/ingredientes`}>
              <button className="px-4 py-2 rounded-md border border-[#c8921a]/20 text-[#c8921a] text-[10px] font-bold uppercase tracking-widest hover:bg-[#c8921a] hover:text-white transition-all flex items-center gap-2">
                <Package size={14} /> Ingredientes
              </button>
            </Link>
            <Link href="/admin/receitas">
              <button className="px-4 py-2 rounded-md border border-gray-300 dark:border-[#333] text-gray-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-50 transition-all">
                Voltar
              </button>
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0f0f0f] border border-gray-200 dark:border-[#222] rounded-xl shadow-sm overflow-hidden p-8 sm:p-12">
          <form id="receita-form" onSubmit={handleSubmit} className="space-y-12">
            {/* Seção: Informações Básicas */}
            <div className="space-y-8">
              <div className="border-b border-gray-100 dark:border-[#1a1a1a] pb-4">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.3em] text-gray-400 flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#c8921a]"></div>
                  Informações Estratégicas
                </h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-8">
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-800 dark:text-gray-200 ml-0.5">Título da Receita</label>
                    <input
                      value={formData.titulo}
                      onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                      placeholder="Ex: BOLO DE CHOCOLATE FIT"
                      className="w-full bg-gray-100 dark:bg-[#111] border border-gray-400 dark:border-[#555] rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#c8921a]/20 focus:border-[#c8921a] text-gray-900 dark:text-white font-medium transition-all"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-800 dark:text-gray-200 ml-0.5">Descrição Editorial</label>
                    <textarea
                      value={formData.descricao}
                      onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                      placeholder="Breve resumo atrativo..."
                      className="w-full min-h-[150px] bg-gray-100 dark:bg-[#111] border border-gray-400 dark:border-[#555] rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#c8921a]/20 focus:border-[#c8921a] text-gray-800 dark:text-gray-200 resize-none font-normal leading-relaxed transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-800 dark:text-gray-200 ml-0.5">Mídias da Receita (Imagens e Vídeo)</label>
                    <div className="p-6 rounded-xl border border-gray-200 dark:border-[#333] bg-gray-50/30 dark:bg-[#0a0a0a] shadow-inner space-y-8">
                      <div className="space-y-2">
                        <label className="text-[8px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                          Galeria de Imagens
                        </label>
                        <MultipleImageUpload
                          images={formData.imagens_url}
                          onChange={(images) => setFormData({ ...formData, imagens_url: images, imagem_url: images[0] || '' })}
                          maxImages={10}
                        />
                      </div>
                      
                      <div className="pt-6 border-t border-gray-200 dark:border-[#222] space-y-2">
                        <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-800 dark:text-gray-200 flex items-center gap-2">
                          <Video size={14} className="text-[#c8921a]" /> Vídeo Aula da Receita (Opcional)
                        </label>
                        <FileUpload
                          type="video"
                          value={formData.video_url}
                          onChange={(url) => setFormData({ ...formData, video_url: url })}
                          hideUrlInput
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-800 dark:text-gray-200 ml-0.5">Tags</label>
                    <input
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      placeholder="proteico, sem glúten..."
                      className="w-full bg-gray-100 dark:bg-[#111] border border-gray-400 dark:border-[#555] rounded-md px-4 py-3 text-sm focus:outline-none focus:border-[#c8921a] text-gray-700 dark:text-gray-300 transition-all"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-5 rounded-xl border border-gray-400 dark:border-[#444] bg-gray-100/50 dark:bg-[#0f0f0f] shadow-sm">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-800 dark:text-gray-200 flex items-center gap-2 text-emerald-600">Status Ativo</p>
                      </div>
                      <Switch
                        checked={formData.ativa}
                        onCheckedChange={(checked) => setFormData({ ...formData, ativa: checked })}
                        className="data-[state=unchecked]:bg-gray-400 border border-gray-500 shadow-sm"
                      />
                    </div>
                    <div className="flex items-center justify-between p-5 rounded-xl border border-gray-400 dark:border-[#444] bg-gray-100/50 dark:bg-[#0f0f0f] shadow-sm">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-800 dark:text-gray-200 flex items-center gap-2">Conteúdo Premium</p>
                      </div>
                      <Switch
                        checked={formData.is_premium}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_premium: checked })}
                        className="data-[state=unchecked]:bg-gray-400 border border-gray-500 shadow-sm"
                      />
                    </div>
                    <div className="flex items-center justify-between p-5 rounded-xl border border-gray-400 dark:border-[#444] bg-gray-100/50 dark:bg-[#0f0f0f] shadow-sm">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-800 dark:text-gray-200 flex items-center gap-2 text-[#c8921a]">Selo Inédito</p>
                      </div>
                      <Switch
                        checked={formData.is_inedito}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_inedito: checked })}
                        className="data-[state=unchecked]:bg-gray-400 border border-gray-500 shadow-sm"
                      />
                    </div>
                    <div className="flex items-center justify-between p-5 rounded-xl border border-gray-400 dark:border-[#444] bg-gray-100/50 dark:bg-[#0f0f0f] shadow-sm">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-800 dark:text-gray-200 flex items-center gap-2 text-blue-600">Amostra Grátis (FREE)</p>
                      </div>
                      <Switch
                        checked={formData.is_free}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_free: checked })}
                        className="data-[state=unchecked]:bg-gray-400 border border-gray-500 shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-800 dark:text-gray-200 ml-0.5">Tempo (min)</label>
                      <input
                        type="number"
                        value={formData.tempo_preparo}
                        onChange={(e) => setFormData({ ...formData, tempo_preparo: e.target.value })}
                        className="w-full bg-gray-100 dark:bg-[#111] border border-gray-400 dark:border-[#555] rounded-md px-4 py-3 text-sm focus:outline-none focus:border-[#c8921a] text-gray-900 dark:text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-800 dark:text-gray-200 ml-0.5">Dificuldade</label>
                      <select
                        value={formData.dificuldade}
                        onChange={(e) => setFormData({ ...formData, dificuldade: e.target.value })}
                        className="w-full h-[46px] bg-gray-100 dark:bg-[#111] border border-gray-400 dark:border-[#555] rounded-md px-4 text-sm focus:outline-none focus:border-[#c8921a] text-gray-900 dark:text-white font-medium appearance-none"
                      >
                        <option value="facil">Fácil</option>
                        <option value="medio">Médio</option>
                        <option value="dificil">Difícil</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-800 dark:text-gray-200 ml-0.5">Categorias</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <button className="w-full h-[46px] bg-gray-100 dark:bg-[#111] border border-gray-400 dark:border-[#555] rounded-md px-4 text-sm focus:outline-none focus:border-[#c8921a] text-gray-700 dark:text-gray-300 font-medium flex items-center justify-between">
                            {formData.categoria_ids.length > 0 ? `${formData.categoria_ids.length} selecionada(s)` : 'Vincular...'}
                            <ChevronsUpDown size={14} />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-2 bg-white dark:bg-[#111] border border-gray-200 dark:border-[#333] shadow-xl">
                          <div className="max-h-[300px] overflow-y-auto space-y-1">
                            {categorias.map((cat) => (
                              <div key={cat.id} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-md cursor-pointer" onClick={() => {
                                const newIds = formData.categoria_ids.includes(cat.id) ? formData.categoria_ids.filter(id => id !== cat.id) : [...formData.categoria_ids, cat.id];
                                setFormData({ ...formData, categoria_ids: newIds });
                              }}>
                                <Checkbox checked={formData.categoria_ids.includes(cat.id)} className="border-gray-400" />
                                <span className="text-[12px] font-bold uppercase tracking-tighter text-gray-700 dark:text-gray-300">{cat.nome}</span>
                              </div>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-800 dark:text-gray-200 ml-0.5">Porções</label>
                      <input
                        type="number"
                        value={formData.porcoes}
                        onChange={(e) => setFormData({ ...formData, porcoes: e.target.value })}
                        className="w-full bg-gray-100 dark:bg-[#111] border border-gray-400 dark:border-[#555] rounded-md px-4 py-3 text-sm focus:outline-none focus:border-[#c8921a] text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Seção: Ingredientes e Preparo */}
            <div className="space-y-8 pt-10 border-t border-gray-100 dark:border-[#1a1a1a]">
              <div className="pb-4">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.3em] text-gray-400 flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#c8921a]"></div>
                  Ficha Técnica & Instruções
                </h3>
              </div>

              <div className="space-y-10">
                <div className="space-y-2">
                  <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-800 dark:text-gray-200 ml-0.5">Lista de Ingredientes (um por linha)</label>
                  <textarea
                    value={formData.ingredientes}
                    onChange={(e) => setFormData({ ...formData, ingredientes: e.target.value })}
                    rows={8}
                    className="w-full bg-gray-100 dark:bg-[#111] border border-gray-400 dark:border-[#555] rounded-md px-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#c8921a]/20 focus:border-[#c8921a] text-gray-800 dark:text-gray-200 resize-y font-mono transition-all"
                  />
                </div>

                {/* SUBSTITUIÇÕES DE INGREDIENTES */}
                <div className="p-8 rounded-xl border border-gray-300 dark:border-[#333] bg-gray-50/50 dark:bg-[#0a0a0a] space-y-6">
                  <div className="flex items-center justify-between border-b border-gray-200 dark:border-[#222] pb-4">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#c8921a]">Substituições Inteligentes (Opcional)</h4>
                    <button type="button" onClick={() => setFormData({...formData, substituicoes_ingredientes: [...formData.substituicoes_ingredientes, { ingrediente: '', substituto: '' }]})} className="text-[9px] font-bold uppercase text-[#c8921a] flex items-center gap-1 hover:opacity-70 transition-opacity">
                      <PlusCircle size={14} /> Adicionar Nova
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {formData.substituicoes_ingredientes.map((sub, index) => {
                      const ingredientesLista = formData.ingredientes.split('\n').map(i => i.trim()).filter(i => i);
                      return (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end animate-in fade-in duration-300">
                          <div className="md:col-span-5 space-y-1.5">
                            <label className="text-[8px] font-bold uppercase text-gray-400 ml-0.5">Ingrediente da Receita</label>
                            <input
                              list={`ingredientes-list-${index}`}
                              value={sub.ingrediente}
                              onChange={(e) => {
                                const novas = [...formData.substituicoes_ingredientes];
                                novas[index].ingrediente = e.target.value;
                                setFormData({...formData, substituicoes_ingredientes: novas});
                              }}
                              placeholder="Ex: Óleo de coco"
                              className="w-full h-[38px] bg-white dark:bg-[#111] border border-gray-300 dark:border-[#444] rounded px-3 text-sm focus:border-[#c8921a] outline-none"
                            />
                            <datalist id={`ingredientes-list-${index}`}>
                              {ingredientesLista.map((ing, i) => {
                                const cleanValue = ing.replace(/^[•\-\d\s\/¼½¾]+|^\w+[:]\s*|[\d,.]+\s*(g|ml|xícara|colher|pitada)\w*\s*(de)?\s*/gi, '').trim();
                                return (
                                  <React.Fragment key={i}>
                                    <option value={ing} />
                                    {cleanValue !== ing && <option value={cleanValue} />}
                                  </React.Fragment>
                                );
                              })}
                            </datalist>
                          </div>
                          <div className="md:col-span-6 space-y-1.5">
                            <label className="text-[8px] font-bold uppercase text-gray-400 ml-0.5">Opção Substituta</label>
                            <input type="text" value={sub.substituto} onChange={(e) => {
                              const novas = [...formData.substituicoes_ingredientes];
                              novas[index].substituto = e.target.value;
                              setFormData({...formData, substituicoes_ingredientes: novas});
                            }} placeholder="Ex: Whey sabor Baunilha" className="w-full h-[38px] bg-white dark:bg-[#111] border border-gray-300 dark:border-[#444] rounded px-3 text-sm focus:border-[#c8921a] outline-none" />
                          </div>
                          <div className="md:col-span-1 flex justify-center pb-1">
                            <button type="button" onClick={() => {
                              const novas = formData.substituicoes_ingredientes.filter((_, i) => i !== index);
                              setFormData({...formData, substituicoes_ingredientes: novas.length > 0 ? novas : [{ ingrediente: '', substituto: '' }]});
                            }} className="p-2 text-red-400 hover:text-red-600 transition-colors"><Trash2 size={16} /></button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-800 dark:text-gray-200 ml-0.5">Modo de Preparo (um passo por linha)</label>
                  <textarea
                    value={formData.modo_preparo}
                    onChange={(e) => setFormData({ ...formData, modo_preparo: e.target.value })}
                    rows={10}
                    className="w-full bg-gray-100 dark:bg-[#111] border border-gray-400 dark:border-[#555] rounded-md px-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#c8921a]/20 focus:border-[#c8921a] text-gray-800 dark:text-gray-200 resize-y transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-800 dark:text-gray-200 ml-0.5">Dica de Ouro (Exibida com ícone de lâmpada)</label>
                  <textarea
                    value={formData.dica}
                    onChange={(e) => setFormData({ ...formData, dica: e.target.value })}
                    rows={3}
                    placeholder="Dica extra para o preparo ou conservação..."
                    className="w-full bg-gray-100 dark:bg-[#111] border border-gray-400 dark:border-[#555] rounded-md px-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#c8921a]/20 focus:border-[#c8921a] text-gray-800 dark:text-gray-200 resize-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-800 dark:text-gray-200 ml-0.5">Finalização (Exibida após o modo de preparo)</label>
                  <textarea
                    value={formData.finalizacao}
                    onChange={(e) => setFormData({ ...formData, finalizacao: e.target.value })}
                    rows={3}
                    placeholder="Sugestões para finalizar o prato..."
                    className="w-full bg-gray-100 dark:bg-[#111] border border-gray-400 dark:border-[#555] rounded-md px-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#c8921a]/20 focus:border-[#c8921a] text-gray-800 dark:text-gray-200 resize-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Seção: Dashboard Nutricional */}
            <div className="space-y-8 pt-10 border-t border-gray-100 dark:border-[#1a1a1a]">
              <div className="pb-4">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.3em] text-gray-400 flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#c8921a]"></div>
                  Dashboard Nutricional
                </h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <div className="space-y-3">
                  <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-800 dark:text-gray-200 ml-0.5">Macronutrientes (por porção)</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[8px] font-bold uppercase text-gray-400 ml-0.5">Calorias (kcal)</label>
                      <input 
                        type="text" 
                        value={formData.calorias} 
                        onChange={(e) => setFormData({...formData, calorias: e.target.value})}
                        placeholder="Ex: 90" 
                        className="w-full h-[42px] bg-gray-100 dark:bg-[#111] border border-gray-400 dark:border-[#555] rounded-md px-4 text-sm focus:outline-none focus:border-[#c8921a] text-gray-900 dark:text-white font-medium"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[8px] font-bold uppercase text-gray-400 ml-0.5">Proteínas (g)</label>
                      <input 
                        type="text" 
                        value={formData.proteinas} 
                        onChange={(e) => setFormData({...formData, proteinas: e.target.value})}
                        placeholder="Ex: 5.5" 
                        className="w-full h-[42px] bg-gray-100 dark:bg-[#111] border border-gray-400 dark:border-[#555] rounded-md px-4 text-sm focus:outline-none focus:border-[#c8921a] text-gray-900 dark:text-white font-medium"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[8px] font-bold uppercase text-gray-400 ml-0.5">Carboidratos (g)</label>
                      <input 
                        type="text" 
                        value={formData.carboidratos} 
                        onChange={(e) => setFormData({...formData, carboidratos: e.target.value})}
                        placeholder="Ex: 2.5" 
                        className="w-full h-[42px] bg-gray-100 dark:bg-[#111] border border-gray-400 dark:border-[#555] rounded-md px-4 text-sm focus:outline-none focus:border-[#c8921a] text-gray-900 dark:text-white font-medium"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[8px] font-bold uppercase text-gray-400 ml-0.5">Gorduras (g)</label>
                      <input 
                        type="text" 
                        value={formData.gorduras} 
                        onChange={(e) => setFormData({...formData, gorduras: e.target.value})}
                        placeholder="Ex: 6.0" 
                        className="w-full h-[42px] bg-gray-100 dark:bg-[#111] border border-gray-400 dark:border-[#555] rounded-md px-4 text-sm focus:outline-none focus:border-[#c8921a] text-gray-900 dark:text-white font-medium"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[8px] font-bold uppercase text-gray-400 ml-0.5">Fibras (g)</label>
                      <input 
                        type="text" 
                        value={formData.fibras} 
                        onChange={(e) => setFormData({...formData, fibras: e.target.value})}
                        placeholder="Ex: 2.0" 
                        className="w-full h-[42px] bg-gray-100 dark:bg-[#111] border border-gray-400 dark:border-[#555] rounded-md px-4 text-sm focus:outline-none focus:border-[#c8921a] text-gray-900 dark:text-white font-medium"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[8px] font-bold uppercase text-gray-400 ml-0.5">Sódio (mg)</label>
                      <input 
                        type="text" 
                        value={formData.sodio} 
                        onChange={(e) => setFormData({...formData, sodio: e.target.value})}
                        placeholder="Ex: 150" 
                        className="w-full h-[42px] bg-gray-100 dark:bg-[#111] border border-gray-400 dark:border-[#555] rounded-md px-4 text-sm focus:outline-none focus:border-[#c8921a] text-gray-900 dark:text-white font-medium"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-800 dark:text-gray-200 ml-0.5">Aviso Nutricional Customizado</label>
                  <textarea
                    value={formData.aviso_nutricional}
                    onChange={(e) => setFormData({ ...formData, aviso_nutricional: e.target.value })}
                    rows={6}
                    placeholder="Ex: Os valores podem variar dependendo da marca..."
                    className="w-full bg-gray-100 dark:bg-[#111] border border-gray-400 dark:border-[#555] rounded-md px-4 py-4 text-sm focus:outline-none focus:border-[#c8921a] text-gray-800 dark:text-gray-200 resize-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Ações Finais */}
            <div className="flex gap-4 pt-10 border-t border-gray-200 dark:border-[#222] justify-between">
              <button type="button" onClick={handleDelete} className="px-6 py-2.5 rounded-md border border-red-200 dark:border-red-900/30 text-red-600 bg-red-50 dark:bg-red-900/10 text-[10px] font-bold uppercase tracking-widest hover:bg-red-100 dark:hover:bg-red-900/20 transition-all flex items-center gap-2">
                <Trash2 size={14} /> Excluir
              </button>
              <div className="flex gap-4">
                <button type="button" onClick={() => router.push('/admin/receitas')} className="px-8 py-2.5 rounded-md border border-gray-300 dark:border-[#444] text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:bg-gray-50 transition-all">Cancelar</button>
                <button type="submit" disabled={saving} className="px-12 py-2.5 rounded-md bg-[#c8921a] text-[#2d2106] text-[10px] font-bold uppercase tracking-widest shadow-md hover:shadow-xl transition-all disabled:opacity-50">
                  {saving ? 'Sincronizando...' : 'Salvar'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
