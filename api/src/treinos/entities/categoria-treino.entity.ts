import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Treino } from './treino.entity';

@Entity('categorias_treinos')
export class CategoriaTreino {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nome: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  descricao: string;

  @Column({ nullable: true })
  imagem_url: string;

  @Column({ type: 'boolean', default: true })
  ativa: boolean;

  @ManyToMany(() => Treino, (treino) => treino.categorias)
  treinos: Treino[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

