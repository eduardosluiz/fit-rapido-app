import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum FonteIngrediente {
  MANUAL = 'manual',
  API = 'api',
  IA = 'ia',
}

@Entity('ingredientes')
export class Ingrediente {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  nome: string; // "Farinha de trigo"

  @Column('text', { array: true, default: [] })
  nome_variacoes: string[]; // ["trigo", "farinha branca", ...]

  @Column({ default: '100g' })
  unidade_base: string; // "100g", "1 unidade", "1 colher de sopa"

  // Valores nutricionais por unidade_base
  @Column({ type: 'decimal', precision: 8, scale: 2 })
  calorias: number;

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  proteinas: number; // gramas

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  carboidratos: number; // gramas

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  gorduras: number; // gramas

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  fibras: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  sodio: number; // miligramas

  @Column({ default: true })
  ativo: boolean;

  @Column({
    type: 'enum',
    enum: FonteIngrediente,
    default: FonteIngrediente.MANUAL,
  })
  fonte: FonteIngrediente; // De onde veio o dado nutricional

  @Column({ type: 'timestamp', nullable: true })
  data_importacao: Date; // Quando foi importado/cadastrado

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

