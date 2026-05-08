import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Ingrediente } from './ingrediente.entity';

export enum FonteCache {
  IA = 'ia',
  API_USDA = 'api_usda',
  API_NUTRITIONIX = 'api_nutritionix',
}

@Entity('ingredientes_cache')
export class IngredienteCache {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  nome_normalizado: string; // "farinha de trigo" (lowercase, sem acentos)

  @ManyToOne(() => Ingrediente, { nullable: true })
  @JoinColumn({ name: 'ingrediente_id' })
  ingrediente: Ingrediente | null;

  @Column({ nullable: true })
  ingrediente_id: string | null; // Se foi cadastrado depois

  // Valores nutricionais (por 100g)
  @Column({ type: 'decimal', precision: 8, scale: 2 })
  calorias: number;

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  proteinas: number;

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  carboidratos: number;

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  gorduras: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  fibras: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  sodio: number;

  @Column({
    type: 'enum',
    enum: FonteCache,
  })
  fonte: FonteCache;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 1.0 })
  confianca: number; // 0-1 (confiança nos dados)

  @CreateDateColumn()
  created_at: Date;
}

