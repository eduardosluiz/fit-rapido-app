import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Receita } from './receita.entity';

@Entity('categorias_receitas')
export class CategoriaReceita {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  nome: string;

  @Column({ unique: true })
  slug: string;

  @Column({ nullable: true })
  descricao: string;

  @Column({ nullable: true })
  imagem_url: string;

  @Column({ default: true })
  ativa: boolean;

  @Column({ default: false })
  aparece_favoritos: boolean;

  @Column({ nullable: true })
  icone_emoji: string;

  @ManyToMany(() => Receita, (receita) => receita.categorias)
  receitas: Receita[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

