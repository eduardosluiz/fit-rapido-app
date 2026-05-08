import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';

export enum TipoAvaliacao {
  RECEITA = 'receita',
  TREINO = 'treino',
}

@Entity('avaliacoes')
@Unique(['usuario_id', 'item_id', 'tipo'])
export class Avaliacao {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'usuario_id' })
  usuario_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuario_id', referencedColumnName: 'id' })
  usuario: User;

  @Column({ name: 'item_id' })
  item_id: string; // ID da receita ou treino

  @Column({
    type: 'enum',
    enum: TipoAvaliacao,
  })
  tipo: TipoAvaliacao;

  @Column({ type: 'int' })
  nota: number; // 1 a 5 estrelas

  @Column({ type: 'text', nullable: true })
  comentario: string; // Comentário opcional

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
