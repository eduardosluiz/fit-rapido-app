import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Treino } from './treino.entity';

@Entity('treinos_modalidades')
export class TreinoModalidade {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  nome: string;

  @Column({ nullable: true })
  descricao: string;

  @Column({ nullable: true })
  imagem_url: string;

  @Column({ nullable: true })
  subtitulo: string;

  @Column({ nullable: true })
  icone: string; // Nome do ícone (ex: 'bx-home')

  @Column({ default: 0 })
  ordem: number;

  @Column({ default: 0 })
  ordem_modalidade: number;

  @Column({ default: false })
  tem_nivelamento: boolean;

  @Column({ type: 'text', nullable: true })
  descricao_iniciante: string;

  @Column({ type: 'text', nullable: true })
  descricao_intermediario: string;

  @Column({ type: 'text', nullable: true })
  descricao_avancado: string;

  @Column({ default: true })
  ativo: boolean;

  @OneToMany(() => Treino, (treino) => treino.modalidade)
  treinos: Treino[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
