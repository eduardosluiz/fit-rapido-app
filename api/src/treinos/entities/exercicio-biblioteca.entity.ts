import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('exercicios_biblioteca')
export class ExercicioBiblioteca {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nome: string;

  @Column({ type: 'text', nullable: true })
  descricao: string;

  @Column({ nullable: true })
  video_url: string;

  @Column({ nullable: true })
  video_thumbnail_url: string;

  @Column({ nullable: true })
  imagem_url: string;

  @Column({ nullable: true })
  categoria: string;

  @Column({ nullable: true })
  grupo_muscular: string;

  @Column({ nullable: true })
  equipamento: string;

  @Column({ default: false })
  exibir_mobile: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
