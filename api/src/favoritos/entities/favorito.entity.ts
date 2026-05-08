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

export enum TipoFavorito {
  RECEITA = 'receita',
  TREINO = 'treino',
}

@Entity('favoritos')
@Unique(['usuario_id', 'item_id', 'tipo'])
export class Favorito {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'usuario_id' })
  usuario_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuario_id' })
  usuario: User;

  @Column({ name: 'item_id' })
  item_id: string;

  @Column({
    type: 'enum',
    enum: TipoFavorito,
  })
  tipo: TipoFavorito;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}

