import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Receita } from '../../receitas/entities/receita.entity';
import { Ingrediente } from './ingrediente.entity';

@Entity('receita_ingredientes')
export class ReceitaIngrediente {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Receita)
  @JoinColumn({ name: 'receita_id' })
  receita: Receita;

  @Column()
  receita_id: string;

  @ManyToOne(() => Ingrediente, { nullable: true })
  @JoinColumn({ name: 'ingrediente_id' })
  ingrediente: Ingrediente | null;

  @Column({ nullable: true })
  ingrediente_id: string | null; // NULL se ingrediente não está cadastrado

  @Column({ nullable: true })
  ingrediente_texto: string; // Fallback: texto original se ingrediente_id é NULL

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantidade: number; // 200.0

  @Column({ default: 'g' })
  unidade: string; // "g", "ml", "unidade", "colher de sopa"

  @Column({ type: 'int', default: 0 })
  ordem: number; // Ordem na lista de ingredientes

  @Column({ nullable: true })
  observacao: string; // "opcional", "a gosto", etc.

  // Substitutos pré-definidos pelo admin
  @Column('text', { array: true, default: [] })
  substitutos_sugeridos: string[]; // IDs de ingredientes substitutos

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

