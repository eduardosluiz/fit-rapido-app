const formData = {
    titulo: 'Treino pernas',
    descricao: '',
    imagem_url: 'http://example.com/img.jpg',
    video_url: '',
    nivel: 'iniciante',
    duracao_minutos: '25',
    dias_por_semana: '',
    tipo_treino: 'academia',
    modalidade_id: '',
    dia_semana: '',
    categoria_ids: [] as string[],
    grupos_musculares: '',
    tags: '',
    ativa: true,
    is_premium: false,
    is_inedito: false,
    exercicios_detalhados: [{ nome: '', repeticoes: '', imagem_url: '', video_url: '' }]
  };
  
const { ativa, modalidade_id, dia_semana, exercicios_detalhados, ...rest } = formData;
      
const data: any = {
  ...rest,
  ativa: ativa,
  duracao_minutos: parseInt(formData.duracao_minutos) || 0,
  dias_por_semana: parseInt(formData.dias_por_semana) || 0,
  grupos_musculares: formData.grupos_musculares.split(',').map(s => s.trim()).filter(s => s),
  tags: formData.tags.split(',').map(s => s.trim()).filter(s => s),
  exercicios_detalhados: exercicios_detalhados.filter(ex => ex.nome.trim() !== '')
};

console.log(JSON.stringify(data, null, 2));
