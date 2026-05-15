import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CategoriaReceita } from './categoria-receita.entity';

export enum TipoRefeicao {
  BREAKFAST = 'breakfast',
  LUNCH = 'lunch',
  DINNER = 'dinner',
  DRINKS = 'drinks',
  SNACKS = 'snacks',
  SIDES = 'sides',
}

export enum DificuldadeReceita {
  FACIL = 'facil',
  MEDIO = 'medio',
  DIFICIL = 'dificil',
}

@Entity('receitas')
export class Receita {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  titulo: string;

  @Column('text', { nullable: true })
  descricao: string;

  @Column('text', { array: true, default: [] })
  ingredientes: string[];

  @Column('jsonb', { nullable: true })
  substituicoes_ingredientes: Record<string, string | string[]>; // Mapeia ingrediente -> substituição(ões) sugerida(s)

  @Column('text', { array: true, default: [] })
  modo_preparo: string[];

  @Column('text', { nullable: true })
  dica: string;

  @Column('text', { nullable: true })
  finalizacao: string;

  @Column('text', { nullable: true })
  informacoes_nutricionais: string;
 // Informações nutricionais aproximadas ou adicionais (texto livre)

  @Column('text', { nullable: true })
  aviso_nutricional: string; // Aviso personalizado sobre informações nutricionais (opcional)

  @Column({ nullable: true })
  imagem_url: string; // Mantido para compatibilidade (imagem principal)

  @Column('text', { array: true, default: [], nullable: true })
  imagens_url?: string[]; // Array de imagens para carrossel

  @Column({ nullable: true })
  video_url: string;

  @Column({ nullable: true })
  video_thumbnail_url: string; // URL da miniatura do vídeo (pode ser gerada automaticamente ou upload manual)

  @Column({ nullable: true })
  ebook_url: string;

  @ManyToMany(() => CategoriaReceita, { eager: false })
  @JoinTable({
    name: 'receitas_categorias',
    joinColumn: { name: 'receita_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'categoria_id', referencedColumnName: 'id' },
  })
  categorias: CategoriaReceita[];

  @Column({
    type: 'enum',
    enum: DificuldadeReceita,
    default: DificuldadeReceita.MEDIO,
  })
  dificuldade: DificuldadeReceita;

  @Column({ type: 'int', default: 0 })
  tempo_preparo: number; // em minutos

  @Column({ type: 'int', default: 1 })
  porcoes: number;

  // Informações nutricionais (por porção) - Alterado para text para permitir intervalos (ex: 180-220)
  @Column('text', { nullable: true })
  calorias: string; // kcal por porção

  @Column('text', { nullable: true })
  proteinas: string; // gramas por porção

  @Column('text', { nullable: true })
  carboidratos: string; // gramas por porção

  @Column('text', { nullable: true })
  gorduras: string; // gramas por porção

  @Column('text', { nullable: true })
  fibras: string; // gramas por porção

  @Column('text', { nullable: true })
  sodio: string; // miligramas por porção

  @Column({ default: false })
  is_premium: boolean;

  @Column({ default: false })
  is_inedito: boolean;

  @Column({ default: false })
  is_free: boolean; // Receita disponível no plano FREE (máximo 50)

  @Column('text', { array: true, default: [] })
  tags: string[];

  @Column({
    type: 'enum',
    enum: TipoRefeicao,
    nullable: true,
  })
  tipo_refeicao: TipoRefeicao; // breakfast, lunch, dinner, drinks, snacks, sides

  @Column('text', { array: true, default: [] })
  cuisines: string[]; // Array de culinárias (ex: ['africa', 'asia', 'middle-east', 'europe'])

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  avaliacao: number;

  @Column({ type: 'int', default: 0 })
  total_avaliacoes: number;

  @Column({ default: true })
  ativa: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

