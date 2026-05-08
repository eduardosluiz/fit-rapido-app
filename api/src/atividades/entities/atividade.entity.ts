import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';

export enum TipoAtividade {
  FIZ_RECEITA = 'fiz_receita',
  TREINEI_HOJE = 'treinei_hoje',
}

@Entity('atividades')
@Unique(['usuario_id', 'item_id', 'tipo', 'data'])
export class Atividade {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'usuario_id' })
  usuario_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuario_id' })
  usuario: User;

  @Column({ name: 'item_id' })
  item_id: string; // ID da receita ou treino

  @Column({
    type: 'enum',
    enum: TipoAtividade,
  })
  tipo: TipoAtividade;

  @Column({ type: 'date' })
  data: Date; // Data da atividade (para agrupar por dia)

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}
