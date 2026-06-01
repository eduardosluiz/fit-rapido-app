import { IsString, IsOptional, IsArray, IsBoolean, IsEnum, IsInt, IsNumber, Min } from 'class-validator';

export class CreateTreinoDto {
  @IsString()
  titulo: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsOptional()
  @IsArray()
  exercicios?: string[];

  @IsOptional()
  @IsArray()
  series_repeticoes?: Array<{
    exercicio: string;
    series: number;
    repeticoes: string;
    carga?: string;
    intervalo?: string;
  }>;

  @IsOptional()
  @IsArray()
  exercicios_detalhados?: Array<{
    nome: string;
    imagem_url?: string;
    video_url?: string;
    video_thumbnail_url?: string;
    series?: number;
    repeticoes?: string;
    carga?: string;
    intervalo?: string;
    observacoes?: string;
  }>;

  @IsOptional()
  @IsString()
  observacoes?: string;

  @IsOptional()
  @IsString()
  imagem_url?: string;

  @IsOptional()
  @IsString()
  imagem_capa_url?: string;

  @IsOptional()
  @IsString()
  video_url?: string;

  @IsOptional()
  @IsString()
  video_explicativo_url?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categoria_ids?: string[];

  @IsOptional()
  @IsString()
  modalidade_id?: string;

  @IsOptional()
  @IsInt()
  dia_semana?: number;

  @IsOptional()
  @IsEnum(['iniciante', 'intermediario', 'avancado'])
  nivel?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  duracao_minutos?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  dias_por_semana?: number;

  @IsOptional()
  @IsArray()
  grupos_musculares?: string[];

  @IsOptional()
  @IsBoolean()
  is_premium?: boolean;

  @IsOptional()
  @IsBoolean()
  is_inedito?: boolean;

  @IsOptional()
  @IsArray()
  equipamentos?: string[];

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsOptional()
  @IsEnum(['ponto_partida', 'academia', 'casa'])
  tipo_treino?: 'ponto_partida' | 'academia' | 'casa';

  @IsOptional()
  @IsEnum(['ajuste_carga', 'mobilidade', 'cardio'])
  tipo_dica?: 'ajuste_carga' | 'mobilidade' | 'cardio';

  @IsOptional()
  @IsEnum(['sem_equipamentos', 'com_halteres', 'rapido'])
  tipo_equipamento_casa?: 'sem_equipamentos' | 'com_halteres' | 'rapido';

  @IsOptional()
  substituicoes_exercicios?: Record<string, string | string[]>;

  @IsOptional()
  @IsString()
  substituto_id_1?: string;

  @IsOptional()
  @IsString()
  substituto_id_2?: string;

  @IsOptional()
  @IsString()
  descricao_tecnica?: string;

  @IsOptional()
  substituto_1_info?: any;

  @IsOptional()
  substituto_2_info?: any;

  @IsOptional()
  @IsBoolean()
  mostrar_ponto_partida?: boolean;

  @IsOptional()
  @IsBoolean()
  ativa?: boolean;

  @IsOptional()
  @IsInt()
  ordem?: number;
}

export class UpdateTreinoDto {
  @IsOptional()
  @IsString()
  titulo?: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsOptional()
  @IsArray()
  exercicios?: string[];

  @IsOptional()
  @IsArray()
  series_repeticoes?: Array<{
    exercicio: string;
    series: number;
    repeticoes: string;
    carga?: string;
    intervalo?: string;
  }>;

  @IsOptional()
  @IsArray()
  exercicios_detalhados?: Array<{
    nome: string;
    imagem_url?: string;
    video_url?: string;
    video_thumbnail_url?: string;
    series?: number;
    repeticoes?: string;
    carga?: string;
    intervalo?: string;
    observacoes?: string;
  }>;

  @IsOptional()
  @IsString()
  observacoes?: string;

  @IsOptional()
  @IsString()
  imagem_url?: string;

  @IsOptional()
  @IsString()
  imagem_capa_url?: string;

  @IsOptional()
  @IsString()
  video_url?: string;

  @IsOptional()
  @IsString()
  video_explicativo_url?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categoria_ids?: string[];

  @IsOptional()
  @IsString()
  modalidade_id?: string;

  @IsOptional()
  @IsInt()
  dia_semana?: number;

  @IsOptional()
  @IsEnum(['iniciante', 'intermediario', 'avancado'])
  nivel?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  duracao_minutos?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  dias_por_semana?: number;

  @IsOptional()
  @IsArray()
  grupos_musculares?: string[];

  @IsOptional()
  @IsBoolean()
  is_premium?: boolean;

  @IsOptional()
  @IsBoolean()
  is_inedito?: boolean;

  @IsOptional()
  @IsArray()
  equipamentos?: string[];

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsOptional()
  @IsEnum(['ponto_partida', 'academia', 'casa'])
  tipo_treino?: 'ponto_partida' | 'academia' | 'casa';

  @IsOptional()
  @IsEnum(['ajuste_carga', 'mobilidade', 'cardio'])
  tipo_dica?: 'ajuste_carga' | 'mobilidade' | 'cardio';

  @IsOptional()
  @IsEnum(['sem_equipamentos', 'com_halteres', 'rapido'])
  tipo_equipamento_casa?: 'sem_equipamentos' | 'com_halteres' | 'rapido';

  @IsOptional()
  substituicoes_exercicios?: Record<string, string | string[]>;

  @IsOptional()
  @IsString()
  substituto_id_1?: string;

  @IsOptional()
  @IsString()
  substituto_id_2?: string;

  @IsOptional()
  @IsString()
  descricao_tecnica?: string;

  @IsOptional()
  substituto_1_info?: any;

  @IsOptional()
  substituto_2_info?: any;

  @IsOptional()
  @IsBoolean()
  mostrar_ponto_partida?: boolean;

  @IsOptional()
  @IsBoolean()
  ativa?: boolean;

  @IsOptional()
  @IsInt()
  ordem?: number;
}

