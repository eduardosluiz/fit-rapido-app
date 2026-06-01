import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  ManyToOne,
  JoinColumn,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CategoriaTreino } from './categoria-treino.entity';
import { TreinoModalidade } from './treino-modalidade.entity';

@Entity('treinos')
export class Treino {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  titulo: string;

  @Column({ type: 'text', nullable: true })
  descricao: string;

  @Column({ type: 'simple-array', nullable: true })
  exercicios: string[]; // Array de nomes de exercícios (deprecated)

  @Column({ type: 'json', nullable: true })
  series_repeticoes: Array<{
    exercicio: string;
    series: number;
    repeticoes: string;
    carga?: string;
    intervalo?: string;
  }>;

  @Column({ type: 'json', nullable: true })
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

  @Column({ type: 'text', nullable: true })
  observacoes: string;

  @Column({ nullable: true })
  imagem_url: string;

  @Column({ nullable: true })
  imagem_capa_url: string;

  @Column({ nullable: true })
  video_url?: string;

  @Column({ nullable: true })
  video_explicativo_url?: string;

  @ManyToMany(() => CategoriaTreino, { eager: false })
  @JoinTable({
    name: 'treinos_categorias',
    joinColumn: { name: 'treino_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'categoria_id', referencedColumnName: 'id' },
  })
  categorias: CategoriaTreino[];

  @ManyToOne(() => TreinoModalidade, (modalidade) => modalidade.treinos, { nullable: true, eager: true })
  @JoinColumn({ name: 'modalidade_id' })
  modalidade: TreinoModalidade;

  @Column({ name: 'modalidade_id', nullable: true })
  modalidade_id: string;

  @Column({ type: 'varchar', default: 'intermediario', nullable: true })
  nivel: string;

  @Column({ type: 'int', nullable: true })
  dia_semana: number; // 0=Seg, 1=Ter, ..., 6=Dom

  @Column({ type: 'int', default: 0 })
  duracao_minutos: number;

  @Column({ type: 'int', default: 0 })
  dias_por_semana: number;

  @Column({ type: 'simple-array', nullable: true })
  grupos_musculares: string[];

  @Column({ type: 'boolean', default: false })
  is_premium: boolean;

  @Column({ type: 'boolean', default: false })
  is_inedito: boolean;

  @Column({ type: 'simple-array', nullable: true })
  equipamentos: string[];

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ type: 'varchar', nullable: true, default: null })
  tipo_treino?: string;

  @Column({ type: 'varchar', nullable: true })
  tipo_dica?: string;

  @Column({ type: 'varchar', nullable: true })
  tipo_equipamento_casa?: string;

  @Column({ type: 'json', nullable: true })
  substituicoes_exercicios?: Record<string, string | string[]>;

  @Column({ type: 'uuid', nullable: true })
  substituto_id_1?: string;

  @Column({ type: 'uuid', nullable: true })
  substituto_id_2?: string;

  @Column({ type: 'text', nullable: true })
  descricao_tecnica?: string;

  @Column({ type: 'jsonb', nullable: true })
  substituto_1_info?: {
    series?: string;
    repeticoes?: string;
    descanso?: string;
    peso?: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  substituto_2_info?: {
    series?: string;
    repeticoes?: string;
    descanso?: string;
    peso?: string;
  };

  @Column({ type: 'boolean', default: false })
  mostrar_ponto_partida?: boolean;

  @Column({ type: 'float', default: 0 })
  avaliacao: number;

  @Column({ type: 'int', default: 0 })
  total_avaliacoes: number;

  @Column({ type: 'boolean', default: true })
  ativa: boolean;

  @Column({ type: 'int', default: 0 })
  ordem: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
